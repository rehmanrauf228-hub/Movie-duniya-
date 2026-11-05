import React, { useState } from 'react';
import {
  X,
  User,
  Crown,
  CreditCard,
  Bookmark,
  History,
  LogOut,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, Movie, PaymentTransaction } from '../utils/movieEngine';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  defaultTab?: string;
  onLogout: () => void;
  onOpenSubscribe: (planId?: string) => void;
  onCancelSubscription: () => void;
  transactions: PaymentTransaction[];
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: string) => void;
  onClearContinueWatching: (movieId: string) => void;
  onSwitchAccountType: (type: 'subscriber' | 'admin' | 'free') => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultTab = 'profile',
  onLogout,
  onOpenSubscribe,
  onCancelSubscription,
  transactions,
  movies,
  onPlayMovie,
  onRemoveFromWatchlist,
  onClearContinueWatching,
  onSwitchAccountType
}) => {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Watchlist movies
  const watchlistMovies = movies.filter((m) => user.watchlist.includes(m.id));

  // Continue watching movies
  const continueItems = Object.entries(user.continueWatching)
    .map(([id, info]) => {
      const movie = movies.find((m) => m.id === id);
      return { movie, ...info };
    })
    .filter((item): item is { movie: Movie; currentTime: number; duration: number; updatedAt: string } =>
      Boolean(item.movie)
    );

  const handleDownloadInvoice = (tx: PaymentTransaction) => {
    const content = `
=============================================
             MOVIEDUNIYA STREAMING
            OFFICIAL PAYMENT RECEIPT
=============================================
Receipt ID: ${tx.id}
Transaction Reference: ${tx.transactionRef}
Date: ${new Date(tx.paidAt).toLocaleString()}
Customer Email: ${tx.userEmail}

PLAN DETAILS:
---------------------------------------------
Subscription Plan: ${tx.planName}
Status: ${tx.status}
Access: Unlimited Movies & Series, 4K HD

PAYMENT METHOD:
---------------------------------------------
Gateway: ${tx.gateway.toUpperCase()}
Account: ${tx.accountReference}
Amount Paid: ${tx.currency} ${tx.amount}
Tax: Rs. 0 (Inclusive)
TOTAL: ${tx.currency} ${tx.amount}

Subscription Active Until: ${new Date(tx.expiresAt).toLocaleDateString()}
Support: support@movieduniya.com
=============================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MovieDuniya-${tx.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0e0f17] border border-white/10 shadow-[0_0_60px_rgba(229,9,20,0.25)] p-6 sm:p-8 my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 text-xl font-black">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{user.name}</h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : user.hasActiveSubscription
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {user.role === 'admin' ? 'ADMIN' : user.hasActiveSubscription ? 'VIP SUBSCRIBER' : 'FREE USER'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>

          {/* Quick Demo Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-[#141520] p-1 rounded-2xl border border-white/5 text-xs">
            <span className="text-[10px] font-bold text-zinc-500 px-2">Test as:</span>
            <button
              onClick={() => onSwitchAccountType('subscriber')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                user.hasActiveSubscription && user.role !== 'admin'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => onSwitchAccountType('free')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                !user.hasActiveSubscription && user.role !== 'admin'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => onSwitchAccountType('admin')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                user.role === 'admin'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 pb-2 border-b border-white/5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'subscription'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>My Subscription</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'payments'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'watchlist'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist ({watchlistMovies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('continue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'continue'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Continue Watching ({continueItems.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#141520] border border-white/5">
                  <div className="text-xs text-zinc-400">Full Name</div>
                  <div className="text-base font-bold text-white mt-1">{user.name}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141520] border border-white/5">
                  <div className="text-xs text-zinc-400">Registered Email</div>
                  <div className="text-base font-bold text-white mt-1">{user.email}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141520] border border-white/5">
                  <div className="text-xs text-zinc-400">Account Type</div>
                  <div className="text-base font-bold text-amber-400 mt-1 capitalize">
                    {user.role} {user.hasActiveSubscription ? '• VIP Subscriber' : ''}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141520] border border-white/5">
                  <div className="text-xs text-zinc-400">Security &amp; Encryption</div>
                  <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>256-Bit SSL Protected</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of MovieDuniya</span>
                </button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {user.hasActiveSubscription ? (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#18121d] to-[#12131f] border border-red-500/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Crown className="w-6 h-6 fill-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Active VIP Membership
                      </span>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Auto-Renewing
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {user.subscriptionPlan || '3 Months Plan (Most Popular)'}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1">
                      Enjoy unlimited streaming of Punjabi, English, Pakistani &amp; Hindi movies on all screens in 4K &amp; Full HD.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-xs text-zinc-400 border-t border-white/10">
                    <div>
                      <span className="block text-zinc-500 text-[10px]">Renewal Date</span>
                      <span className="font-bold text-white">
                        {user.subscriptionExpiresAt
                          ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
                          : 'May 5, 2027'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-500 text-[10px]">Payment Method</span>
                      <span className="font-bold text-white">JazzCash / Easypaisa</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSubscribe('yearly');
                      }}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Upgrade Plan (Get 1 Year)
                    </button>

                    <button
                      onClick={onCancelSubscription}
                      className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#141520] border border-white/10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">No Active VIP Subscription</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                      You are currently on the Free tier. Unlock unlimited 4K streaming of all Punjabi, Pakistani, English &amp; Hindi movies starting from Rs. 199/month.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubscribe('quarterly');
                    }}
                    className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT HISTORY TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Official billing statements and transaction records. Download invoices for your records.
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141520] border border-white/5 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{tx.planName}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Ref: <span className="font-mono text-zinc-300">{tx.transactionRef}</span> •{' '}
                          {new Date(tx.paidAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Method: {tx.gateway.toUpperCase()} ({tx.accountReference})
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-base font-black text-amber-400">
                            {tx.currency} {tx.amount}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadInvoice(tx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No payment records found yet. Complete a subscription to view billing receipts.
                </div>
              )}
            </div>
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && (
            <div className="space-y-4">
              {watchlistMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {watchlistMovies.map((m) => (
                    <div
                      key={m.id}
                      className="group relative rounded-2xl overflow-hidden bg-[#141520] border border-white/5 p-2 flex flex-col"
                    >
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-full aspect-[2/3] object-cover rounded-xl"
                      />
                      <div className="pt-2 flex-1 flex flex-col justify-between">
                        <div className="text-xs font-bold text-white truncate">{m.title}</div>
                        <div className="text-[10px] text-zinc-400">
                          {m.language} • {m.releaseYear}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => {
                              onClose();
                              onPlayMovie(m);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-400"
                          >
                            <Play className="w-3 h-3 fill-red-500" />
                            <span>Play</span>
                          </button>
                          <button
                            onClick={() => onRemoveFromWatchlist(m.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Your watchlist is empty. Click the heart icon on any movie card to save it here.
                </div>
              )}
            </div>
          )}

          {/* CONTINUE WATCHING TAB */}
          {activeTab === 'continue' && (
            <div className="space-y-4">
              {continueItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {continueItems.map(({ movie, currentTime, duration }) => {
                    const percent = Math.min(100, Math.round((currentTime / duration) * 100));

                    return (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#141520] border border-white/5"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-14 h-20 object-cover rounded-xl flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {movie.language} • {percent}% watched
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-red-600" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <button
                              onClick={() => {
                                onClose();
                                onPlayMovie(movie);
                              }}
                              className="text-[11px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-red-500" />
                              <span>Resume</span>
                            </button>
                            <button
                              onClick={() => onClearContinueWatching(movie.id)}
                              className="text-[10px] text-zinc-500 hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No movies in progress. Start watching any movie and your playback progress will be saved here automatically!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
