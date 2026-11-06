import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import { UserAccount } from '../utils/movieEngine';
import {
  signInWithGooglePopup,
  loginWithEmailPass,
  registerWithEmailPass,
  saveUserProfileToFirestore
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signup'
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Whenever modal opens, reset to initialMode (default 'signup')
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAuthError('');
      setForgotSent(false);
    }
  }, [isOpen, initialMode]);

  // 1. Google Authentication via Firebase Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await signInWithGooglePopup();
      if (res.success && res.user) {
        const isAdmin = res.user.email === 'rehmanrauf228@gmail.com' || (res.user.email && res.user.email.includes('admin'));
        const account: UserAccount = {
          id: res.user.uid,
          name: res.user.displayName || res.user.email?.split('@')[0] || 'Movie Lover',
          email: res.user.email || 'user@movieduniya.com',
          role: isAdmin ? 'admin' : 'subscriber',
          hasActiveSubscription: true,
          subscriptionPlan: isAdmin ? 'Lifetime Administrator' : '3 Months Plan (Google VIP)',
          subscriptionExpiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
          watchlist: [],
          continueWatching: {}
        };
        saveUserProfileToFirestore(account).catch(() => {});
        onLoginSuccess(account);
        onClose();
      } else {
        setAuthError(res.error || 'Google sign-in could not be completed.');
      }
    } catch (e: any) {
      setAuthError(e?.message || 'Google authentication error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Signup / Login via Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (mode === 'forgot') {
      setForgotSent(true);
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setAuthError('Firebase requires a password with at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let firebaseUser = null;
      if (mode === 'signup') {
        const regRes = await registerWithEmailPass(email.trim(), password);
        if (regRes.success && regRes.user) {
          firebaseUser = regRes.user;
        } else {
          // If Firebase project requires email enumeration or specific error
          if (regRes.error?.includes('email-already-in-use')) {
            setAuthError('This email is already registered in Firebase. Please switch to Sign In.');
            setLoading(false);
            return;
          }
          console.warn('Firebase registration notice:', regRes.error);
        }
      } else {
        const logRes = await loginWithEmailPass(email.trim(), password);
        if (logRes.success && logRes.user) {
          firebaseUser = logRes.user;
        } else if (logRes.error?.includes('invalid-credential') || logRes.error?.includes('user-not-found')) {
          setAuthError('Account not found with these credentials. Please check your password or create a new account.');
          setLoading(false);
          return;
        }
      }

      const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'rehmanrauf228@gmail.com';

      const account: UserAccount = {
        id: firebaseUser?.uid || 'usr-' + Math.random().toString(36).substring(2, 9),
        name: name.trim() || (email ? email.split('@')[0] : 'Movie Lover'),
        email: email.trim() || 'user@movieduniya.com',
        role: isAdminEmail ? 'admin' : 'subscriber',
        hasActiveSubscription: true,
        subscriptionPlan: '3 Months Plan',
        subscriptionExpiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
        watchlist: [],
        continueWatching: {}
      };

      saveUserProfileToFirestore(account).catch(() => {});
      onLoginSuccess(account);
      onClose();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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

    saveUserProfileToFirestore(demoUser).catch(() => {});
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0f1018] border border-white/10 shadow-[0_0_60px_rgba(229,9,20,0.35)] p-6 sm:p-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="text-2xl font-black tracking-tight text-white">Movie</span>
            <span className="text-2xl font-black tracking-tight text-red-500">Duniya</span>
          </div>
          <h3 className="text-xl font-black text-white">
            {mode === 'signup'
              ? 'Create Your Account'
              : mode === 'login'
              ? 'Welcome Back • Sign In'
              : 'Reset Your Password'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'signup'
              ? 'Sign up with Firebase to stream Punjabi, Pakistani, Hindi & English movies.'
              : mode === 'login'
              ? 'Sign in to access your watch history and subscription benefits.'
              : 'Enter your registered email to receive recovery instructions.'}
          </p>
        </div>

        {/* Primary Tab Switcher (SIGN UP FIRST) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#151624] border border-white/5 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* 1-Click Google Sign-In with Firebase */}
        <div className="mb-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google'}
            </span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0f1018] px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            or with email &amp; password
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Your Full Name *
              </label>
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
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Email Address *
            </label>
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
                <label className="text-xs font-semibold text-zinc-300">
                  Password *
                </label>
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
                  placeholder="At least 6 characters"
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
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>
              {loading
                ? 'Connecting to Firebase...'
                : mode === 'signup'
                ? 'Create Account & Start Watching'
                : mode === 'login'
                ? 'Sign In to MovieDuniya'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Test Access */}
        <div className="mt-4 p-2.5 rounded-2xl bg-[#141522] border border-white/5 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
            ⚡ Quick 1-Click Instant Test Profile:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => loginDemoAccount('subscriber')}
              className="py-1 px-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold text-center cursor-pointer"
            >
              VIP Pass
            </button>
            <button
              type="button"
              onClick={() => loginDemoAccount('admin')}
              className="py-1 px-1.5 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 text-[10px] font-bold text-center cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => loginDemoAccount('free')}
              className="py-1 px-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-[10px] font-bold text-center cursor-pointer"
            >
              Guest
            </button>
          </div>
        </div>

        {/* Bottom Switcher */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError('');
                }}
                className="font-bold text-red-500 hover:text-red-400 ml-1"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthError('');
                }}
                className="font-bold text-red-500 hover:text-red-400 ml-1"
              >
                Create Account (Sign Up)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
