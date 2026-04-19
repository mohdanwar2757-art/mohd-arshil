import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, SummaryOutput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStudyPlan(data: {
  examType: string;
  subjects: string;
  weakAreas: string;
  daysLeft: number;
  isLastNight: boolean;
}): Promise<StudyPlan> {
  const prompt = `
    Generate a detailed study plan for a student with the following details:
    Exam Type: ${data.examType}
    Subjects: ${data.subjects}
    Weak Areas: ${data.weakAreas}
    Days Left: ${data.daysLeft}
    Is Last Night Revision: ${data.isLastNight ? 'YES' : 'NO'}

    The plan should be realistic, prioritizing weak areas and high-impact topics.
    If it's Last Night Revision, focus only on the most critical concepts for rapid review.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
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

  return JSON.parse(response.text.trim());
}

export async function summarizeContent(input: string, isUrl: boolean): Promise<SummaryOutput> {
  const prompt = isUrl 
    ? `Summarize the key study points from this URL: ${input}. Focus on actionable insights for rapid revision.`
    : `Summarize the following study material. Provide concise bullet points and actionable insights: \n\n${input}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
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

  return JSON.parse(response.text.trim());
}
