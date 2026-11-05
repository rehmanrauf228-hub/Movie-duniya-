import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { UserAccount } from '../utils/movieEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      setForgotSent(true);
      return;
    }

    const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'rehmanrauf228@gmail.com';

    const account: UserAccount = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || (email ? email.split('@')[0] : 'Movie Lover'),
      email: email.trim() || 'user@movieduniya.com',
      role: isAdminEmail ? 'admin' : 'subscriber',
      hasActiveSubscription: true,
      subscriptionPlan: '3 Months Plan',
      subscriptionExpiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
      watchlist: [],
      continueWatching: {}
    };

    onLoginSuccess(account);
    onClose();
  };

  const loginDemoAccount = (role: 'admin' | 'subscriber' | 'free') => {
    let demoUser: UserAccount;

    if (role === 'admin') {
      demoUser = {
        id: 'usr-admin-01',
        name: 'Rehman Rauf (Admin)',
        email: 'rehmanrauf228@gmail.com',
        role: 'admin',
        hasActiveSubscription: true,
        subscriptionPlan: 'Lifetime Administrator',
        subscriptionExpiresAt: new Date(Date.now() + 86400000 * 3650).toISOString(),
        watchlist: ['pun-01', 'pak-01'],
        continueWatching: {}
      };
    } else if (role === 'subscriber') {
      demoUser = {
        id: 'usr-sub-01',
        name: 'Hamza Malik (VIP)',
        email: 'hamza.vip@movieduniya.com',
        role: 'subscriber',
        hasActiveSubscription: true,
        subscriptionPlan: '3 Months Plan (Most Popular)',
        subscriptionExpiresAt: new Date(Date.now() + 86400000 * 60).toISOString(),
        watchlist: ['pun-01', 'eng-01'],
        continueWatching: {
          'pun-01': { currentTime: 2400, duration: 8280, updatedAt: new Date().toISOString() }
        }
      };
    } else {
      demoUser = {
        id: 'usr-free-01',
        name: 'Sara Khan (Free Tier)',
        email: 'sara.free@movieduniya.com',
        role: 'user',
        hasActiveSubscription: false,
        watchlist: ['pak-02'],
        continueWatching: {}
      };
    }

    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0f1018] border border-white/10 shadow-[0_0_50px_rgba(229,9,20,0.3)] p-6 sm:p-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl font-black tracking-tight text-white">Movie</span>
            <span className="text-2xl font-black tracking-tight text-red-500">Duniya</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login'
              ? 'Welcome Back'
              : mode === 'signup'
              ? 'Create Your Account'
              : 'Reset Your Password'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Stream Punjabi, English, Pakistani & Hindi movies in HD.'
              : mode === 'signup'
              ? 'Join thousands of movie lovers today.'
              : 'Enter your registered email to receive a recovery code.'}
          </p>
        </div>

        {/* Quick 1-Click Demo Accounts */}
        <div className="mb-6 p-3 rounded-2xl bg-[#151624] border border-white/5 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
            ⚡ Quick 1-Click Instant Sign-In:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loginDemoAccount('subscriber')}
              className="py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold transition-all text-center cursor-pointer"
            >
              VIP Subscriber
            </button>
            <button
              type="button"
              onClick={() => loginDemoAccount('admin')}
              className="py-1.5 px-2 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 text-[11px] font-bold transition-all text-center cursor-pointer"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => loginDemoAccount('free')}
              className="py-1.5 px-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-[11px] font-bold transition-all text-center cursor-pointer"
            >
              Free Guest
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rehman Rauf"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotSent(false);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {forgotSent && (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              Recovery instructions sent to {email || 'your email'}. Check your inbox!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>
              {mode === 'login'
                ? 'Sign In to MovieDuniya'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between login and signup */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-red-500 hover:text-red-400 ml-1"
              >
                Sign Up Now
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSent(false);
                }}
                className="font-bold text-red-500 hover:text-red-400 ml-1"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
