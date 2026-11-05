import React, { useState } from 'react';
import {
  Home,
  Film,
  Tv,
  UploadCloud,
  User,
  Search,
  ChevronDown,
  LogOut,
  Crown,
  CreditCard,
  Bookmark,
  History,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../utils/movieEngine';

interface NavbarProps {
  activeTab: 'home' | 'movies' | 'series' | 'punjabi' | 'english' | 'pakistani' | 'hindi';
  setActiveTab: (tab: any) => void;
  user: UserAccount | null;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenAccount: (defaultTab?: string) => void;
  onOpenSubscribe: (planId?: string) => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenUpload,
  onOpenAuth,
  onOpenAccount,
  onOpenSubscribe,
  onOpenSearch,
  onLogout,
  searchQuery,
  setSearchQuery
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07070a]/90 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          {/* Logo extracted from reference */}
          <div className="relative h-12 flex items-center">
            <img
              src="/assets/generated/logo.png"
              alt="MovieDuniya"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]"
              onError={(e) => {
                // Fallback to SVG styled logo if needed
                (e.target as HTMLElement).style.display = 'none';
                const fallback = document.getElementById('svg-logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              id="svg-logo-fallback"
              style={{ display: 'none' }}
              className="items-center gap-2"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 shadow-lg shadow-red-600/40">
                <Crown className="w-5 h-5 text-amber-200 fill-amber-300" />
              </div>
              <div className="text-2xl font-black tracking-tight">
                <span className="text-white">Movie</span>
                <span className="text-red-500">Duniya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'movies'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'series'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Series</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-red-500" />
            <span>Upload</span>
          </button>

          {/* My Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-[#12131a] border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <div className="text-xs text-zinc-400">Signed in as</div>
                      <div className="text-sm font-bold text-white truncate">{user.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : user.hasActiveSubscription
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {user.role === 'admin' ? 'ADMIN' : user.hasActiveSubscription ? 'VIP SUBSCRIBER' : 'FREE USER'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenAccount('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>User Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAccount('subscription');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>My Subscription</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAccount('payments');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Payment History</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAccount('watchlist');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <Bookmark className="w-4 h-4 text-rose-400" />
                      <span>My Watchlist</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAccount('continue');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <History className="w-4 h-4 text-cyan-400" />
                      <span>Continue Watching</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onOpenUpload();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border-t border-white/5 mt-1"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <p className="text-xs text-zinc-400 px-1">Log in to sync your watchlist, subscriptions & continue watching.</p>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setDropdownOpen(false);
                      }}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right Search & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Search Bar matching reference */}
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenSearch();
              }}
              placeholder="Search movies..."
              className="w-44 lg:w-60 pl-4 pr-10 py-2 rounded-full bg-[#15161f] border border-white/10 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
            <button
              onClick={onOpenSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-full bg-[#15161f] border border-white/10 text-zinc-300"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Subscribe Button if not active */}
          {(!user || !user.hasActiveSubscription) && (
            <button
              onClick={() => onOpenSubscribe('quarterly')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP</span>
            </button>
          )}

          {/* Login / Sign Up Pill Button matching reference image */}
          {user ? (
            <button
              onClick={() => onOpenAccount('profile')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/40 hover:shadow-red-600/60 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
