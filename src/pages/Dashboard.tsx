import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyPlan } from '../types';
import { Sparkles, Clock, Target, Trash2, Calendar, AlertTriangle, CheckCircle2, BookOpen, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { DashboardMicro3D } from '../components/3d/DashboardMicro3D';

export default function Dashboard() {
  const { user, userStats } = useAuth();
  const [formData, setFormData] = useState({
    examType: 'School',
    subjects: '',
    weakAreas: '',
    daysLeft: 7,
    isLastNight: false
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'plans'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call secure server proxy
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user?.uid })
      });
      
      const result = await response.json();
      console.log("Plan API Result:", result);

      if (!response.ok || result.error) {
        if (response.status === 403 || result.error?.includes("credits")) {
          alert("⚡ No credits left! Upgrade to Pro for unlimited access.");
          window.location.href = '/pricing';
        } else {
          alert(result?.error || "Failed to generate plan.");
        }
        return;
      }

      setPlan(result);

      // Save to Firebase
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'plans'), {
          ...formData,
          plan: result,
          createdAt: serverTimestamp()
        });

        // Award points for generating a plan
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(50),
          lastActive: new Date().toISOString()
        });
      }

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#d946ef']
      });
    } catch (error) {
      console.error(error);
      alert('Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <DashboardMicro3D />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 glass-card border-slate-800"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500" />
                New AI Plan
              </h3>
              {userStats?.streak && userStats.streak > 0 && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-30 animate-pulse group-hover:opacity-60 transition-opacity" />
                  <div className="relative flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-[10px] tracking-tighter uppercase rounded-full">
                    <Flame size={12} className="fill-orange-500" />
                    {userStats.streak} Day Heat
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Exam Type</label>
              <select 
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-2.5 outline-none ring-offset-slate-900 focus:ring-2 focus:ring-purple-500"
              >
                <option>School</option>
                <option>CBSE Board</option>
                <option>JEE / NEET</option>
                <option>Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subjects (comma separated)</label>
              <input 
                type="text"
                placeholder="Math, Physics, History..."
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Weak Areas</label>
              <textarea 
                placeholder="What are you struggling with?"
                value={formData.weakAreas}
                onChange={(e) => setFormData({ ...formData, weakAreas: e.target.value })}
                className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-2.5 h-24 resize-none outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">Days Left</label>
                <input 
                  type="number"
                  value={formData.daysLeft}
                  onChange={(e) => setFormData({ ...formData, daysLeft: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isLastNight: !formData.isLastNight })}
                  className={cn(
                    "h-[46px] rounded-xl font-bold transition-all px-4 flex items-center justify-center gap-2",
                    formData.isLastNight 
                      ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  )}
                >
                  <AlertTriangle size={18} />
                  Last Night
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-gradient-purple text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-80 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              )}
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  Syncing Neural Data...
                </div>
              ) : (
                <>
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  Generate High-Impact Plan
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6 rounded-2xl">
          <h4 className="font-bold text-lg mb-2">Unlock Pro Mode</h4>
          <p className="text-sm text-slate-400 mb-4">Get unlimited plans, deep focus tracks, and offline mode.</p>
          <button className="w-full py-2 bg-purple-500 text-white rounded-lg font-bold text-sm">Upgrade Now</button>
        </div>
      </div>

      {/* Output Display */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {plan ? (
            <motion.div
              key="plan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Today's Priority */}
              <div className="glass-card overflow-hidden">
                <div className="bg-gradient-purple p-6">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Target />
                    Target: Today's Focus
                  </h2>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Schedule */}
                    <div>
                      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock size={16} /> Time Allocation
                      </h4>
                      <div className="space-y-3">
                        {plan?.timeAllocation?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                            <span className="font-medium">{item.subject}</span>
                            <span className="text-purple-400 font-bold">{item.minutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Topics to Cover */}
                    <div>
                      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BookOpen size={16} /> Topics to Crush
                      </h4>
                      <ul className="space-y-3">
                        {plan?.today?.map((topic, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={18} />
                            <span className="text-slate-300">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills/Priorities */}
                  <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-400" /> Key Priorities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {plan?.priorities?.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-full text-sm">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* To Skip */}
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-red-400">
                      <Trash2 size={18} /> Topics to Skip (Low ROI)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {plan?.toSkip?.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-red-400/10 text-red-500/70 border border-red-500/20 rounded-full text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-slate-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Fill in the form on the left to generate your personalized AI study plan. 
                Focus on what matters most for your exam.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
