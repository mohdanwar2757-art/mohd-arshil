import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, BarChart2, Zap, Settings, User, LogOut, LogIn, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isMinimal = ['/login', '/pricing'].includes(location.pathname);
  const { user, userStats, logout } = useAuth();

  if (isLanding) return <>{children}</>;

  if (isMinimal) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-gradient">
            <Zap className="text-purple-500 fill-purple-500" />
            StudyFlow AI
          </Link>
          <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4">Back to home</Link>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gradient">
            <Zap className="text-purple-500 fill-purple-500" />
            StudyFlow AI
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 pt-4">
          <NavItem href="/dashboard" icon={<BookOpen size={20} />} label="Planner" active={location.pathname === '/dashboard'} />
          <NavItem href="/summarizer" icon={<Zap size={20} />} label="Summarizer" active={location.pathname === '/summarizer'} />
          <NavItem href="/stats" icon={<BarChart2 size={20} />} label="Stats & Badges" active={location.pathname === '/stats'} />
          <NavItem href="/pricing" icon={<CreditCard size={20} />} label="Pricing" active={location.pathname === '/pricing'} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {user ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3 bg-slate-800/50 rounded-xl mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center font-bold text-xs">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.displayName || 'Learner'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-purple text-white rounded-xl transition-all font-bold"
            >
              <LogIn size={20} />
              <span className="text-sm">Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="font-semibold text-lg">
            {location.pathname === '/dashboard' && 'Daily Study Planner'}
            {location.pathname === '/summarizer' && 'AI Content Summarizer'}
            {location.pathname === '/stats' && 'Performance Tracking'}
          </h2>
          <div className="flex items-center gap-4">
            {userStats && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                  <span className="text-purple-400 font-bold text-sm">🔥 {userStats.streak}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <span className="text-yellow-400 font-bold text-sm">✨ {userStats.points}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Points</span>
                </div>
                {!userStats.isPro && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <span className="text-blue-400 font-bold text-sm">⚡ {userStats.credits}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black">Credits</span>
                  </div>
                )}
              </div>
            )}
            {userStats?.isPro && (
              <span className="bg-gradient-purple px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Pro</span>
            )}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-purple-600/10 text-purple-400 ring-1 ring-purple-600/20" 
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      )}
    >
      <span className={cn("group-hover:scale-110 transition-transform", active && "text-purple-400")}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
