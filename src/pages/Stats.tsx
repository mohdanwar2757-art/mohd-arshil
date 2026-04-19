import React from 'react';
import { motion } from 'motion/react';
import { ACHIEVEMENTS, UserStats } from '../types';
import { BarChart, Trophy, Flame, Zap, Star, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function Stats() {
  const { user, userStats } = useAuth();

  const stats = userStats || {
    streak: 0,
    points: 0,
    badges: [],
    lastActive: new Date().toISOString(),
    weakAreas: []
  };

  const level = Math.floor(stats.points / 500) + 1;
  const progressToNextLevel = (stats.points % 500) / 5;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Flame className="text-orange-500" />} 
          label="Current Streak" 
          value={`${stats.streak} Days`} 
          subValue="Keep the fire alive!"
        />
        <StatCard 
          icon={<Zap className="text-yellow-500" />} 
          label="Total Points" 
          value={stats.points.toLocaleString()} 
          subValue={`Level ${level} Student`}
        />
        <StatCard 
          icon={<Trophy className="text-purple-500" />} 
          label="Achievements" 
          value={`${stats?.badges?.length || 0}`} 
          subValue="Badges Unlocked"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress & Badges */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-yellow-400" />
              Level Progress
            </h3>
            <div className="relative h-6 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                className="absolute top-0 left-0 h-full bg-gradient-purple"
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Level {level}</span>
              <span>{(500 - (stats.points % 500))} XP to Level {level + 1}</span>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-8">Badge Collection</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {ACHIEVEMENTS?.map((achievement) => {
                const isUnlocked = stats?.badges?.includes(achievement.id);
                return (
                  <div 
                    key={achievement.id}
                    className={cn(
                      "flex flex-col items-center text-center group",
                      !isUnlocked && "opacity-30 grayscale"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110",
                      isUnlocked ? "bg-slate-800 border-2 border-purple-500/50" : "bg-slate-900 border border-slate-800"
                    )}>
                      {achievement.icon}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{achievement.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{achievement.description}</p>
                    {!isUnlocked && <ShieldCheck className="text-slate-600 mt-2" size={14} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weak Areas Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart size={18} className="text-blue-400" />
              Focus Areas
            </h3>
            <p className="text-xs text-slate-500 mb-4">Your current weakest subjects that the AI is prioritizing.</p>
            <div className="space-y-3">
              {stats?.weakAreas?.map((area, i) => (
                <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium">{area}</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-blue-500 rounded-full" />
                    <div className="w-1 h-3 bg-blue-500 rounded-full" />
                    <div className="w-1 h-3 bg-slate-700 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-slate-800 rounded-lg text-xs font-bold hover:bg-white/5 transition-all text-slate-400">
              Modify Tracking
            </button>
          </div>

          <div className="p-6 bg-gradient-purple rounded-2xl text-white">
            <h4 className="font-bold mb-2">Pro Tip</h4>
            <p className="text-xs opacity-90 leading-relaxed mb-4">
              Using the Summarizer on your weak subjects can boost your retention by up to 40% based on our active learning models.
            </p>
          </div>

          <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Star size={16} className="fill-blue-400" />
              Invite & Earn
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Get 10 extra credits for every friend who joins StudyFlow AI.
            </p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`Check out StudyFlow AI - The best tool for study plans! https://studyflow-ai.app/ref/${user?.uid}`);
                alert("Referral link copied! (Demo: In a real app, credits are added when friend signs up)");
              }}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all"
            >
              Copy Referral Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-500">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
          {icon}
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black mb-1">{value}</h4>
        <p className="text-xs text-slate-400">{subValue}</p>
      </div>
    </div>
  );
}
