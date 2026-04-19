import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}
const dbAdmin = admin.firestore();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);

  // Rate limiting to prevent AI abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  app.use(express.json());
  app.use(cors());
  app.use('/api/', apiLimiter);

  // Stripe Setup (Lazy init)
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24-preview' as any,
      });
    }
    return stripe;
  };

  // AI Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Proxy AI Plan Generation to keep prompt logic & keys secure
  app.post('/api/generate-plan', async (req, res) => {
    try {
      const { examType, subjects, weakAreas, daysLeft, isLastNight, userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      // 1. Check Credits
      const userRef = dbAdmin.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      const cost = isLastNight ? 2 : 1;
      
      if (!userData?.isPro && (userData?.credits || 0) < cost) {
        return res.status(403).json({ error: "No credits left. Please upgrade to Pro or invite friends!", creditsLeft: userData?.credits || 0 });
      }

      const prompt = `
        Generate a detailed study plan for a student:
        Exam Type: ${examType}
        Subjects: ${subjects}
        Weak Areas: ${weakAreas}
        Days Left: ${daysLeft}
        Is Last Night Revision: ${isLastNight ? 'YES' : 'NO'}

        Return a structured JSON study plan prioritizing high-impact topics.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a specialized study planner. You ONLY return valid JSON. No markdown backticks, no conversational text.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              today: { type: Type.ARRAY, items: { type: Type.STRING } },
              priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
              timeAllocation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    minutes: { type: Type.NUMBER }
                  },
                  required: ["subject", "minutes"]
                }
              },
              toSkip: { type: Type.ARRAY, items: { type: Type.STRING } },
              revisionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["today", "priorities", "timeAllocation", "toSkip"]
          }
        }
      });

      const text = response.text?.trim() || "{}";
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("AI JSON error:", text);
        // User-aligned fallback for robustness
        parsed = {
          today: ["Error generating specific plan. Focus on key subjects."],
          priorities: ["Critical Revision"],
          timeAllocation: [{ subject: "General Review", minutes: 60 }],
          toSkip: ["New advanced concepts"],
          revisionTips: ["Try refreshing or checking your inputs."]
        };
      }

      // 2. Deduct Credit on Success
      let finalCredits = userData?.credits || 0;
      if (!userData?.isPro) {
        finalCredits = Math.max(0, finalCredits - cost);
        await userRef.update({ credits: finalCredits });
      }

      res.json({ ...parsed, creditsLeft: finalCredits });
    } catch (error: any) {
      console.error('AI error detail:', error);
      const isKeyError = error.message?.includes("API key not valid") || error.message?.includes("API_KEY_INVALID");
      res.status(isKeyError ? 401 : 500).json({ 
        error: isKeyError ? "Invalid Gemini API Key. Please update your environment variables." : "Failed to generate plan. AI service is currently unavailable.",
        fallback: true
      });
    }
  });

  // Proxy AI Content Summarization
  app.post('/api/summarize', async (req, res) => {
    try {
      const { input, isUrl, userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      // Check Credits
      const userRef = dbAdmin.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      const cost = 1;
      
      if (!userData?.isPro && (userData?.credits || 0) < cost) {
        return res.status(403).json({ error: "No credits left. Please upgrade to Pro or invite friends!", creditsLeft: userData?.credits || 0 });
      }

      const prompt = isUrl 
        ? `Summarize key study points from this URL: ${input}. Focus on actionable insights.`
        : `Summarize the following study material into concise bullet points and actionable insights: \n\n${input}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a specialized study assistant. You ONLY return valid JSON. No markdown backticks, no conversational text.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "bulletPoints", "actionItems"]
          }
        }
      });

      const text = response.text?.trim() || "{}";
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("AI Summarization JSON error:", text);
        parsed = {
          summary: "Error processing content. Please check your text or URL.",
          bulletPoints: ["Content could not be analyzed", "Try again with different input"],
          actionItems: ["Review manually", "Refresh page"]
        };
      }

      // Deduct Credit on Success
      let finalCredits = userData?.credits || 0;
      if (!userData?.isPro) {
        finalCredits = Math.max(0, finalCredits - cost);
        await userRef.update({ credits: finalCredits });
      }

      res.json({ ...parsed, creditsLeft: finalCredits });
    } catch (error) {
      console.error('AI Summarization error:', error);
      res.status(500).json({ error: 'Failed to summarize content' });
    }
  });

  // Stripe Checkout
  app.post('/api/create-checkout-session', async (req, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: 'Stripe not configured' });

    try {
      const session = await s.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd', // or inr as requested
            product_data: {
              name: 'StudyFlow AI Pro',
              description: 'Unlimited plans, Last Night Mode, and deep stats.',
            },
            unit_amount: 999, // $9.99
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.APP_URL}/pricing?payment=cancelled`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyFlow AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
