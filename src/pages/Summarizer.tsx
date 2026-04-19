import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SummaryOutput } from '../types';
import { FileText, Link as LinkIcon, Download, Save, Sparkles, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { updateDoc, doc, increment } from 'firebase/firestore';

export default function Summarizer() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isUrl, setIsUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryOutput | null>(null);

  const handleSummarize = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, isUrl, userId: user?.uid })
      });
      const summary = await response.json();
      console.log("Summarizer API Result:", summary);

      if (!response.ok || summary.error) {
        if (response.status === 403 || summary.error?.includes("credits")) {
          alert("⚡ No credits left! Upgrade to Pro for unlimited access.");
          window.location.href = '/pricing';
        } else {
          alert(summary?.error || "Failed to summarize content.");
        }
        return;
      }

      setResult(summary);

      if (user) {
        // Award points for using summarizer
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(25),
          lastActive: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(error);
      alert('Failed to summarize content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wand2 className="text-purple-400" />
          Rapid Content Processor
        </h3>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setIsUrl(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all ${!isUrl ? 'bg-purple-600/10 border-purple-500/50 text-purple-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
          >
            <FileText size={18} /> Text Input
          </button>
          <button 
            onClick={() => setIsUrl(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all ${isUrl ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
          >
            <LinkIcon size={18} /> URL Context
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isUrl ? "Paste study material URL here..." : "Paste your study notes, textbook chapters, or any text you want to summarize..."}
          className="w-full h-48 bg-slate-900 border border-slate-700 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
        />

        <div className="mt-6 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            {isUrl ? "Note: URL summarization works best with static academic pages." : `Word count: ${input.split(/\s+/).filter(Boolean).length}`}
          </p>
          <button
            onClick={handleSummarize}
            disabled={loading || !input}
            className="px-8 py-3 bg-gradient-purple rounded-xl font-bold text-white flex items-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
            Generate Summary
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-8">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-xl font-bold">Smart Summary</h4>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors" title="Save to Profile">
                    <Save size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors" title="Download PDF">
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-slate-300 leading-relaxed text-lg italic border-l-4 border-purple-500 pl-6">
                  {result.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Key Bullet Points</h5>
                  <ul className="space-y-3">
                    {result?.bulletPoints?.map((point, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        <span className="text-slate-200">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Actionable Insights</h5>
                  <ul className="space-y-3">
                    {result?.actionItems?.map((item, i) => (
                      <li key={i} className="flex items-start gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-blue-400 font-bold"># {i + 1}</span>
                        <span className="text-slate-200 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
