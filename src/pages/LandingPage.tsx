import React, { Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, BarChart, ShieldCheck, ArrowRight, MousePointer2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';

// Lazy Load 3D for Performance
const Hero3D = lazy(() => import('../components/3d/Hero3D'));
const ParticleBackground = lazy(() => import('../components/3d/ParticleBackground').then(m => ({ default: m.ParticleBackground })));
const Feature3D = lazy(() => import('../components/3d/Feature3D'));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Canvas dpr={[1, 1.5]}>
            <ParticleBackground />
          </Canvas>
        </Suspense>
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 font-black text-2xl text-gradient tracking-tighter"
        >
          <Zap className="text-purple-500 fill-purple-500" />
          StudyFlow
        </motion.div>
        <div className="hidden md:flex items-center gap-10 text-slate-400 font-bold tracking-tight text-sm uppercase">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#stats" className="hover:text-white transition-colors">Network</a>
        </div>
        <Link 
          to="/dashboard" 
          className="relative group overflow-hidden bg-white text-slate-950 px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.15)]"
        >
          <span className="relative z-10 transition-colors group-hover:text-white">Get Started</span>
          <div className="absolute inset-0 bg-gradient-purple opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-32 pb-40 px-6 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Neural Network v3.0 Live
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black mb-10 tracking-[ -0.05em] leading-[0.82]">
              Stop guessing.<br />
              <span className="text-gradient drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">Study better.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed font-medium">
              Join 12,000+ top students using AI to automate their study schedules. 
              Higher grades, lower stress, zero guesswork.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-gradient-purple text-white font-black text-xl hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                Launch Planner
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 text-slate-500 font-bold group cursor-pointer hover:text-white transition-colors">
                <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                  <MousePointer2 size={18} />
                </div>
                <span>View Strategy</span>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[500px] lg:h-[700px] z-20">
            <Suspense fallback={<div className="w-full h-full bg-slate-900/20 animate-pulse rounded-3xl" />}>
              <Hero3D />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter"
          >
            Built for <span className="text-gradient">Performance</span>.
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Interactive AI tools that adapt to your study speed, sleep cycle, and syllabus deadlines.
          </p>
        </div>
        
        <div className="h-[500px] md:h-[600px] w-full mb-32 relative">
          <Suspense fallback={null}>
            <Canvas camera={{ position: [0, 0, 12], fov: 40 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <Feature3D />
            </Canvas>
          </Suspense>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Target className="text-blue-400" />,
                title: "Exam Intelligence",
                description: "Deep understanding of CBSE, JEE, and competitive exam structures to prioritize correctly."
              },
              {
                icon: <Zap className="text-purple-400" />,
                title: "Last Night Mode",
                description: "Panic-free revision plans for those critical 24 hours before your big exam."
              },
              {
                icon: <BarChart className="text-green-400" />,
                title: "Weakness Tracking",
                description: "Identifies patterns in your study habits and doubles down on areas where you struggle."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 glass-card"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Simple Pricing for Students</h2>
          <p className="text-slate-400">Focus on your grades, not the bills.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="p-8 glass-card border-slate-800">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-black mb-6">$0</div>
            <ul className="space-y-4 mb-8 text-slate-400">
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> 1-2 Plans per day</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Basic Subject Tracking</li>
              <li className="flex items-center gap-2 opacity-50"><ShieldCheck size={18} /> Last Night Mode (Locked)</li>
            </ul>
            <Link to="/dashboard" className="block w-full py-4 text-center rounded-xl bg-white/5 font-bold hover:bg-white/10 transition-all">
              Start Free
            </Link>
          </div>
          {/* Pro Plan */}
          <div className="p-8 glass-card border-purple-500/50 bg-purple-600/5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-black mb-6">$9.99<span className="text-lg font-medium text-slate-500">/mo</span></div>
            <ul className="space-y-4 mb-8 text-slate-300">
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400" /> Unlimited AI Plans</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400" /> Full Last Night Mode</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400" /> Advanced Weakness AI</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400" /> Data Export & Summaries</li>
            </ul>
            <Link to="/dashboard" className="block w-full py-4 text-center rounded-xl bg-gradient-purple font-bold hover:scale-[1.02] transition-all">
              Unlock Everything
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 px-6 text-center">
        <div className="flex items-center justify-center gap-2 font-bold mb-4">
          <Zap size={20} className="text-purple-500 fill-purple-500" />
          StudyFlow AI
        </div>
        <p className="text-slate-500 text-sm">© 2026 StudyFlow AI. Build by Master Builder.</p>
      </footer>
    </div>
  );
}
