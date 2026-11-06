import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LanguageCards } from './components/LanguageCards';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { PaymentOptionsStrip } from './components/PaymentOptionsStrip';
import { MovieCategoriesSection } from './components/MovieCategoriesSection';
import { TrustFooterBanner } from './components/TrustFooterBanner';
import { MoviePlayerModal } from './components/MoviePlayerModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AdminUploadModal } from './components/AdminUploadModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { LegalModal } from './components/LegalModals';
import { INITIAL_MOVIES } from './data/initialMovies';
import {
  Movie,
  UserAccount,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  PaymentTransaction,
  PaymentAccountSettings,
  DEFAULT_PAYMENT_ACCOUNTS
} from './utils/movieEngine';
import { isSupabaseConfigured, fetchSupabaseMovies } from './services/supabase';
import {
  fetchMoviesFromFirestore,
  saveMovieToFirestore,
  deleteMovieFromFirestore,
  saveTransactionToFirestore,
  fetchTransactionsFromFirestore,
  saveUserProfileToFirestore,
  savePaymentSettingsToFirestore,
  fetchPaymentSettingsFromFirestore,
  logoutFirebaseAuth,
  auth
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // 1. Movies State with LocalStorage Persistence
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('movieduniya_movies_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading movies from storage:', e);
    }
    return INITIAL_MOVIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('movieduniya_movies_v2', JSON.stringify(movies));
    } catch (e) {
      console.error(e);
    }
  }, [movies]);

  // Sync from Firebase Firestore and Supabase Cloud on mount
  useEffect(() => {
    // 1. First priority: Google Firebase Firestore
    fetchMoviesFromFirestore()
      .then((fbMovies) => {
        if (fbMovies && fbMovies.length > 0) {
          setMovies(fbMovies);
        } else if (isSupabaseConfigured()) {
          // 2. Secondary cloud sync
          fetchSupabaseMovies().then((cloudMovies) => {
            if (cloudMovies && cloudMovies.length > 0) {
              setMovies(cloudMovies);
            }
          });
        }
      })
      .catch((err) => console.warn('Firestore fetch notice:', err));

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const isAdmin = fbUser.email === 'rehmanrauf228@gmail.com' || (fbUser.email && fbUser.email.includes('admin'));
        setUser((prev) => ({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || (prev ? prev.name : 'Movie Lover'),
          email: fbUser.email || (prev ? prev.email : 'user@movieduniya.com'),
          role: isAdmin ? 'admin' : (prev ? prev.role : 'subscriber'),
          hasActiveSubscription: prev ? prev.hasActiveSubscription : true,
          subscriptionPlan: prev?.subscriptionPlan || (isAdmin ? 'Lifetime Administrator' : '3 Months Plan'),
          subscriptionExpiresAt: prev?.subscriptionExpiresAt || new Date(Date.now() + 86400000 * 90).toISOString(),
          watchlist: prev ? prev.watchlist : ['pun-01', 'pak-01'],
          continueWatching: prev ? prev.continueWatching : {}
        }));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Auto-open movie player if URL contains ?watch=movieId
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const watchId = params.get('watch');
      if (watchId) {
        const found = movies.find((m) => m.id === watchId);
        if (found) setActiveMovie(found);
      }
    }
  }, [movies]);

  // 2. User Account State with default logged-in profile
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('movieduniya_user_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            id: parsed.id || 'usr-sub-01',
            name: parsed.name || 'Rehman Rauf',
            email: parsed.email || 'rehmanrauf228@gmail.com',
            role: parsed.role || 'admin',
            hasActiveSubscription: parsed.hasActiveSubscription !== undefined ? Boolean(parsed.hasActiveSubscription) : true,
            subscriptionPlan: parsed.subscriptionPlan || '3 Months Plan (Most Popular)',
            subscriptionExpiresAt: parsed.subscriptionExpiresAt || new Date(Date.now() + 86400000 * 90).toISOString(),
            watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : ['pun-01', 'pak-01'],
            continueWatching: parsed.continueWatching && typeof parsed.continueWatching === 'object' ? parsed.continueWatching : {
              'pun-01': { currentTime: 2400, duration: 8280, updatedAt: new Date().toISOString() }
            }
          };
        }
      }
    } catch (e) {
      console.error('Error loading user from storage:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('movieduniya_user_v2', JSON.stringify(user));
      } else {
        localStorage.removeItem('movieduniya_user_v2');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // 3. Transactions History
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('movieduniya_transactions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading transactions from storage:', e);
    }
    return [
      {
        id: 'TXN-948271',
        userId: 'usr-sub-01',
        userEmail: 'rehmanrauf228@gmail.com',
        planId: 'quarterly',
        planName: '3 Months Plan',
        amount: 499,
        currency: 'Rs.',
        gateway: 'jazzcash',
        accountReference: '03001234567',
        transactionRef: 'MD-JC-4992-892182',
        status: 'SUCCESS',
        paidAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 85).toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('movieduniya_transactions_v2', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // 3.1 Payment Receiving Account Settings (Configured by Admin)
  const [paymentSettings, setPaymentSettings] = useState<PaymentAccountSettings>(() => {
    try {
      const saved = localStorage.getItem('movieduniya_payment_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PAYMENT_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('movieduniya_payment_settings', JSON.stringify(paymentSettings));
    } catch (e) {
      console.error(e);
    }
  }, [paymentSettings]);

  // Sync payment settings & cloud transactions from Firestore on startup
  useEffect(() => {
    fetchPaymentSettingsFromFirestore().then((cloudSettings) => {
      if (cloudSettings) setPaymentSettings(cloudSettings);
    }).catch(() => {});

    fetchTransactionsFromFirestore().then((cloudTxs) => {
      if (cloudTxs && cloudTxs.length > 0) {
        setTransactions(cloudTxs);
      }
    }).catch(() => {});
  }, []);

  const handleSavePaymentSettings = async (newSettings: PaymentAccountSettings) => {
    setPaymentSettings(newSettings);
    await savePaymentSettingsToFirestore(newSettings);
  };

  // 4. Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'series'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Modal States
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]); // Default 3 Months
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountDefaultTab, setAccountDefaultTab] = useState('profile');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  // Handlers for movie management
  const handleAddMovie = (newMovie: Movie) => {
    setMovies((prev) => [newMovie, ...prev]);
    saveMovieToFirestore(newMovie).catch((e) => console.warn('Firestore movie add notice:', e));
  };

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
    saveMovieToFirestore(updatedMovie).catch((e) => console.warn('Firestore movie update notice:', e));
  };

  const handleDeleteMovie = (movieId: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
    deleteMovieFromFirestore(movieId).catch((e) => console.warn('Firestore movie delete notice:', e));
  };

  // Watchlist Toggle
  const handleToggleWatchlist = (movieId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const inList = user.watchlist.includes(movieId);
    const nextWatchlist = inList
      ? user.watchlist.filter((id) => id !== movieId)
      : [...user.watchlist, movieId];

    setUser({
      ...user,
      watchlist: nextWatchlist
    });
  };

  // Continue Watching Update
  const handleUpdateContinueWatching = (movieId: string, currentTime: number, duration: number) => {
    if (!user) return;
    setUser({
      ...user,
      continueWatching: {
        ...user.continueWatching,
        [movieId]: {
          currentTime,
          duration,
          updatedAt: new Date().toISOString()
        }
      }
    });
  };

  const handleClearContinueWatching = (movieId: string) => {
    if (!user) return;
    const copy = { ...user.continueWatching };
    delete copy[movieId];
    setUser({
      ...user,
      continueWatching: copy
    });
  };

  // Subscription Checkout Submission Handler
  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    // Add transaction to history
    setTransactions((prev) => [tx, ...prev]);
    saveTransactionToFirestore(tx).catch((e) => console.warn('Firestore transaction log notice:', e));

    // When a consumer submits payment, they do NOT immediately get active streaming access!
    // They are set to PENDING_APPROVAL until the admin verifies the payment.
    if (user) {
      const pendingUser: UserAccount = {
        ...user,
        hasActiveSubscription: false,
        subscriptionStatus: 'PENDING_APPROVAL',
        subscriptionPlan: tx.planName,
        subscriptionExpiresAt: tx.expiresAt,
        pendingTransactionRef: tx.transactionRef
      };
      setUser(pendingUser);
      saveUserProfileToFirestore(pendingUser).catch((e) => console.warn('Firestore profile update notice:', e));
    }
  };

  // Admin verifies and approves a user's subscription payment
  const handleApproveTransaction = (txId: string) => {
    let approvedTx: PaymentTransaction | null = null;
    const updatedTransactions = transactions.map((t) => {
      if (t.id === txId) {
        approvedTx = { ...t, status: 'SUCCESS' as const };
        return approvedTx;
      }
      return t;
    });

    setTransactions(updatedTransactions);

    if (approvedTx) {
      saveTransactionToFirestore(approvedTx).catch((e) => console.warn('Firestore transaction log notice:', e));

      // If the currently logged in user matches the transaction, activate their subscription
      if (user && (user.email === (approvedTx as PaymentTransaction).userEmail || user.id === (approvedTx as PaymentTransaction).userId || user.pendingTransactionRef === (approvedTx as PaymentTransaction).transactionRef)) {
        const activeUser: UserAccount = {
          ...user,
          hasActiveSubscription: true,
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: (approvedTx as PaymentTransaction).planName,
          subscriptionExpiresAt: (approvedTx as PaymentTransaction).expiresAt,
          pendingTransactionRef: undefined
        };
        setUser(activeUser);
        saveUserProfileToFirestore(activeUser).catch((e) => console.warn('Firestore profile update notice:', e));
      }
    }
  };

  // Admin rejects a fraudulent or invalid transaction
  const handleRejectTransaction = (txId: string) => {
    let rejectedTx: PaymentTransaction | null = null;
    const updatedTransactions = transactions.map((t) => {
      if (t.id === txId) {
        rejectedTx = { ...t, status: 'FAILED' as const };
        return rejectedTx;
      }
      return t;
    });

    setTransactions(updatedTransactions);

    if (rejectedTx) {
      saveTransactionToFirestore(rejectedTx).catch((e) => console.warn('Firestore transaction log notice:', e));

      if (user && (user.email === (rejectedTx as PaymentTransaction).userEmail || user.id === (rejectedTx as PaymentTransaction).userId || user.pendingTransactionRef === (rejectedTx as PaymentTransaction).transactionRef)) {
        const resetUser: UserAccount = {
          ...user,
          hasActiveSubscription: false,
          subscriptionStatus: 'NONE',
          pendingTransactionRef: undefined
        };
        setUser(resetUser);
        saveUserProfileToFirestore(resetUser).catch((e) => console.warn('Firestore profile update notice:', e));
      }
    }
  };

  const handleCancelSubscription = () => {
    if (!user) return;
    setUser({
      ...user,
      hasActiveSubscription: false,
      subscriptionStatus: 'NONE',
      subscriptionPlan: undefined,
      subscriptionExpiresAt: undefined,
      pendingTransactionRef: undefined
    });
  };

  // Quick switch account types for demo testing
  const handleSwitchAccountType = (type: 'subscriber' | 'admin' | 'free') => {
    if (type === 'admin') {
      setUser({
        id: 'usr-admin-01',
        name: 'Rehman Rauf',
        email: 'rehmanrauf228@gmail.com',
        role: 'admin',
        hasActiveSubscription: true,
        subscriptionPlan: 'Lifetime Administrator',
        subscriptionExpiresAt: new Date(Date.now() + 86400000 * 3650).toISOString(),
        watchlist: ['pun-01', 'pak-01'],
        continueWatching: {}
      });
    } else if (type === 'subscriber') {
      setUser({
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
      });
    } else {
      setUser({
        id: 'usr-free-01',
        name: 'Sara Khan (Free)',
        email: 'sara.free@movieduniya.com',
        role: 'user',
        hasActiveSubscription: false,
        watchlist: [],
        continueWatching: {}
      });
    }
  };

  // Open Subscribe modal with target plan
  const handleOpenSubscribe = (planId?: string) => {
    if (planId) {
      const match = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (match) setSelectedPlan(match);
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col selection:bg-red-600 selection:text-white">
      {/* 1. Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedLanguage('All');
        }}
        user={user}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'signup');
          setIsAuthOpen(true);
        }}
        onOpenAccount={(tab) => {
          setAccountDefaultTab(tab || 'profile');
          setIsAccountOpen(true);
        }}
        onOpenSubscribe={handleOpenSubscribe}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={() => {
          logoutFirebaseAuth();
          setUser(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If Active Tab is 'home', show the full cinematic homepage matching reference */}
        {activeTab === 'home' && (
          <>
            {/* 2. Hero Section */}
            <Hero
              onStartWatching={() => {
                if (!user) {
                  setAuthModalMode('signup');
                  setIsAuthOpen(true);
                  return;
                }
                const firstMovie = movies.find((m) => m.isPublished);
                if (firstMovie) setActiveMovie(firstMovie);
              }}
              onSubscribe={() => {
                if (!user) {
                  setAuthModalMode('signup');
                  setIsAuthOpen(true);
                  return;
                }
                handleOpenSubscribe('quarterly');
              }}
            />

            {/* 3. Browse by Language */}
            <LanguageCards
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(lang) => {
                setSelectedLanguage(lang === selectedLanguage ? 'All' : lang);
              }}
              onViewAll={() => {
                setActiveTab('movies');
                setSelectedLanguage('All');
              }}
            />

            {/* 4. Choose Your Subscription Plan */}
            <SubscriptionPlans
              activePlanId={user?.hasActiveSubscription ? 'quarterly' : undefined}
              onSelectPlan={(plan) => {
                setSelectedPlan(plan);
                setIsCheckoutOpen(true);
              }}
            />

            {/* 5. Secure Payment Options */}
            <PaymentOptionsStrip
              onSelectGateway={() => handleOpenSubscribe('quarterly')}
            />

            {/* 6. Movie Categories Rails (All 8 requested categories) */}
            <MovieCategoriesSection
              movies={movies}
              filterLanguage={selectedLanguage}
              onPlayMovie={(m) => setActiveMovie(m)}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={user?.watchlist || []}
              continueWatching={user?.continueWatching || {}}
            />
          </>
        )}

        {/* If Active Tab is 'movies' */}
        {activeTab === 'movies' && (
          <div className="pt-6">
            <MovieCategoriesSection
              movies={movies}
              filterTab="movies"
              onPlayMovie={(m) => setActiveMovie(m)}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={user?.watchlist || []}
              continueWatching={user?.continueWatching || {}}
            />
          </div>
        )}

        {/* If Active Tab is 'series' */}
        {activeTab === 'series' && (
          <div className="pt-6">
            <MovieCategoriesSection
              movies={movies}
              filterTab="series"
              onPlayMovie={(m) => setActiveMovie(m)}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={user?.watchlist || []}
              continueWatching={user?.continueWatching || {}}
            />
          </div>
        )}
      </main>

      {/* 7. Trust Footer Banner */}
      <TrustFooterBanner
        onJoinToday={() => handleOpenSubscribe('quarterly')}
        onOpenPrivacy={() => setLegalModal('privacy')}
        onOpenTerms={() => setLegalModal('terms')}
        onOpenContact={() => setLegalModal('contact')}
      />

      {/* 8. Fullscreen Video Player Modal */}
      {activeMovie && (
        <MoviePlayerModal
          movie={activeMovie}
          user={user}
          allMovies={movies}
          onSelectMovie={(m) => setActiveMovie(m)}
          onClose={() => setActiveMovie(null)}
          onOpenSubscribe={handleOpenSubscribe}
          onOpenAuth={(tab) => {
            setAuthModalMode(tab || 'signup');
            setIsAuthOpen(true);
          }}
          onUpdateContinueWatching={handleUpdateContinueWatching}
          onToggleWatchlist={handleToggleWatchlist}
          initialTime={user?.continueWatching[activeMovie.id]?.currentTime || 0}
        />
      )}

      {/* 9. Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        onSelectPlan={(plan) => setSelectedPlan(plan)}
        onPaymentSuccess={handlePaymentSuccess}
        userEmail={user?.email || 'user@movieduniya.com'}
        paymentSettings={paymentSettings}
      />

      {/* 10. Admin Movie Upload, Payment Accounts & Subscription Approvals Modal */}
      <AdminUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        movies={movies}
        onAddMovie={handleAddMovie}
        onUpdateMovie={handleUpdateMovie}
        onDeleteMovie={handleDeleteMovie}
        currentUser={user}
        onAdminLogin={(adminAcc) => setUser(adminAcc)}
        onAdminLogout={() => {
          if (user) {
            setUser({ ...user, role: 'user' });
          }
        }}
        transactions={transactions}
        onApproveTransaction={handleApproveTransaction}
        onRejectTransaction={handleRejectTransaction}
        paymentSettings={paymentSettings}
        onSavePaymentSettings={handleSavePaymentSettings}
      />

      {/* 11. User Account Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        defaultTab={accountDefaultTab}
        onLogout={() => {
          logoutFirebaseAuth();
          setUser(null);
        }}
        onOpenSubscribe={handleOpenSubscribe}
        onCancelSubscription={handleCancelSubscription}
        transactions={transactions}
        movies={movies}
        onPlayMovie={(m) => setActiveMovie(m)}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onClearContinueWatching={handleClearContinueWatching}
        onSwitchAccountType={handleSwitchAccountType}
      />

      {/* 12. Authentication Modal (Defaults to Create Account / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(acc) => setUser(acc)}
        initialMode={authModalMode}
      />

      {/* 13. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        movies={movies}
        onPlayMovie={(m) => setActiveMovie(m)}
        initialQuery={searchQuery}
      />

      {/* 14. Legal & Contact Modals */}
      <LegalModal
        type={legalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}
