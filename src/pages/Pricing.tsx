import React, { useState } from 'react';
import { ShieldCheck, Zap, Star, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

export default function Pricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error(error);
      alert('Payment failed to initialize.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-6 tracking-tight">Simple Pricing, <span className="text-gradient">Total Focus</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Choose the plan that fits your study goals. No hidden fees, just pure productivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard 
          title="Free"
          price="$0"
          description="Perfect for starting your journey."
          features={['30 One-time Credits', 'Basic tracking', 'Community access', 'Invite friends (+10 credits)']}
          cta="Stay Free"
          onCta={() => window.location.href = '/dashboard'}
        />
        <PricingCard 
          title="Pro"
          price="₹149"
          description="The ultimate study experience."
          features={['Unlimited AI Plans (No credits)', 'Last Night Mode', 'Advanced Stats', 'Priority Support', 'No Ads']}
          cta={loading ? "Processing..." : "Upgrade to Pro"}
          onCta={handleUpgrade}
          pro
          loading={loading}
        />
      </div>

      {/* FAQ Placeholder */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <FaqItem question="Can I cancel anytime?" answer="Yes, you can cancel your subscription at any time from your settings page." />
          <FaqItem question="Is there a student discount?" answer="Our pricing is already optimized for a student's budget!" />
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, cta, onCta, pro, loading }: any) {
  return (
    <div className={`p-10 glass-card relative flex flex-col ${pro ? 'border-purple-500 ring-1 ring-purple-500/50 bg-purple-500/5' : ''}`}>
      {pro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Recommended
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-black">{price}</span>
        <span className="text-slate-500 font-medium">/month</span>
      </div>
      <p className="text-slate-400 mb-8">{description}</p>
      
      <div className="flex-1 space-y-4 mb-10">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <ShieldCheck size={20} className={pro ? 'text-purple-400' : 'text-slate-500'} />
            <span className="text-slate-300 font-medium">{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onCta}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold transition-all ${pro ? 'bg-gradient-purple text-white hover:scale-105' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
      >
        {cta}
      </button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="p-6 glass-card border-slate-900">
      <h4 className="font-bold mb-2">{question}</h4>
      <p className="text-slate-400 text-sm">{answer}</p>
    </div>
  );
}
