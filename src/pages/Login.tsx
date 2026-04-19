import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, signInWithGoogle, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center">
            <Zap className="text-white fill-white" size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Sign in to sync your study streaks and unlock AI personalized plans.</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <button className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-all mb-4">
          <Mail size={20} />
          Continue with Email
        </button>

        <p className="text-xs text-slate-500 mt-6 leading-relaxed">
          By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
