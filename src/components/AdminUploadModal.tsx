import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Film,
  BarChart3,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Check,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  Crown,
  Database,
  Lock,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  Flame,
  Star,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  Building,
  CreditCard
} from 'lucide-react';
import {
  Movie,
  UserAccount,
  PaymentTransaction,
  PaymentAccountSettings,
  DEFAULT_PAYMENT_ACCOUNTS
} from '../utils/movieEngine';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  upsertSupabaseMovie,
  deleteSupabaseMovie,
  fetchSupabaseMovies,
  SUPABASE_SQL_SCHEMA
} from '../services/supabase';
import {
  uploadMediaToFirebaseStorage,
  saveMovieToFirestore,
  deleteMovieFromFirestore,
  testFirebaseConnection,
  firebaseConfig
} from '../services/firebase';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onAddMovie: (movie: Movie) => void;
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  currentUser: UserAccount | null;
  onAdminLogin: (adminUser: UserAccount) => void;
  onAdminLogout: () => void;
  transactions?: PaymentTransaction[];
  onApproveTransaction?: (txId: string) => void;
  onRejectTransaction?: (txId: string) => void;
  paymentSettings?: PaymentAccountSettings;
  onSavePaymentSettings?: (settings: PaymentAccountSettings) => Promise<void>;
}

export const AdminUploadModal: React.FC<AdminUploadModalProps> = ({
  isOpen,
  onClose,
  movies,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
  currentUser,
  onAdminLogin,
  onAdminLogout,
  transactions = [],
  onApproveTransaction,
  onRejectTransaction,
  paymentSettings = DEFAULT_PAYMENT_ACCOUNTS,
  onSavePaymentSettings
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState(currentUser?.email || 'rehmanrauf228@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'database' | 'subscribers'>('upload');

  // Movie Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'Punjabi' | 'English' | 'Pakistani' | 'Hindi' | 'Other'>('Punjabi');
  const [category, setCategory] = useState<'Punjabi' | 'Pakistani' | 'Hindi' | 'English' | 'Movies' | 'Web Series' | 'Latest' | 'Trending' | 'Recently Added'>('Latest');
  const [genres, setGenres] = useState<string[]>(['Action', 'Comedy']);
  const [customGenre, setCustomGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [duration, setDuration] = useState('2h 15m');
  const [rating, setRating] = useState('8.5');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isVIP, setIsVIP] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(true);

  // Manage Filter States
  const [manageSearch, setManageSearch] = useState('');
  const [manageLanguage, setManageLanguage] = useState('All');
  const [manageCategory, setManageCategory] = useState('All');

  // Supabase Database Connection States
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; success: boolean; message: string }>({
    checked: false,
    success: false,
    message: ''
  });
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // UI Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Payment Receiving Accounts Configuration
  const [payAccounts, setPayAccounts] = useState<PaymentAccountSettings>(paymentSettings);
  const [isSavingPayAccounts, setIsSavingPayAccounts] = useState(false);

  useEffect(() => {
    setPayAccounts(paymentSettings);
  }, [paymentSettings]);

  const handleSaveAccounts = async () => {
    if (!onSavePaymentSettings) return;
    setIsSavingPayAccounts(true);
    try {
      await onSavePaymentSettings(payAccounts);
      showToast('Payment accounts saved to Firebase Firestore successfully!', 'success');
    } catch (e) {
      showToast('Failed to save payment accounts.', 'error');
    } finally {
      setIsSavingPayAccounts(false);
    }
  };

  // Initialize Supabase fields from existing configuration
  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.anonKey);
    if (isSupabaseConfigured()) {
      testSupabaseConnection().then((res) => {
        setSupabaseStatus({ checked: true, success: res.success, message: res.message });
      });
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Handle Admin Authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError('');

    setTimeout(() => {
      // Validate Authorized Administrator Credentials
      const cleanEmail = adminEmail.trim().toLowerCase();
      const validAdminEmails = ['rehmanrauf228@gmail.com', 'admin@movieduniya.com'];
      
      // Allow authorized owner email or master administrator password
      const isAuthorizedEmail = validAdminEmails.includes(cleanEmail);
      const isMasterKey = adminPassword === 'movieduniya2026' || adminPassword === 'admin123' || adminPassword === 'rehman2026';

      if (isAuthorizedEmail || isMasterKey) {
        const adminAccount: UserAccount = {
          id: 'usr-admin-01',
          name: 'Rehman Rauf (Admin)',
          email: adminEmail.trim(),
          role: 'admin',
          hasActiveSubscription: true,
          subscriptionPlan: 'Lifetime Administrator Pass',
          subscriptionExpiresAt: new Date(Date.now() + 86400000 * 3650).toISOString(),
          watchlist: currentUser?.watchlist || ['pun-01', 'pak-01'],
          continueWatching: currentUser?.continueWatching || {}
        };
        onAdminLogin(adminAccount);
        showToast('Welcome Rehman Rauf! Admin console unlocked.', 'success');
        setIsSubmittingLogin(false);
      } else {
        setLoginError('Access Denied: Invalid administrator email or secret access key.');
        setIsSubmittingLogin(false);
      }
    }, 600);
  };

  // Sample Presets for Fast Admin Testing
  const samplePosterPresets = [
    { label: 'Punjabi Hero', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop' },
    { label: 'Action Cinema', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop' },
    { label: 'Pakistani Drama', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800&auto=format&fit=crop' },
    { label: 'Hindi Romance', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop' }
  ];

  const sampleVideoPresets = [
    { label: 'MP4 1080p (Big Buck Bunny)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: 'MP4 4K (Elephants Dream)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { label: 'HLS Live (.m3u8 Stream)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { label: 'MP4 Action (Tears of Steel)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'poster' | 'backdrop' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      if (target === 'poster') {
        setPosterUrl(localUrl);
      } else if (target === 'backdrop') {
        setBackdropUrl(localUrl);
      } else {
        setVideoUrl(localUrl);
      }
      showToast(`Uploading ${file.name} to Firebase Storage...`);

      // Upload to Firebase Cloud Storage
      const res = await uploadMediaToFirebaseStorage(file, target === 'video' ? 'media' : 'posters');
      if (res.success && res.url) {
        if (target === 'poster') setPosterUrl(res.url);
        else if (target === 'backdrop') setBackdropUrl(res.url);
        else setVideoUrl(res.url);
        showToast(`${file.name} saved to Firebase Cloud Storage!`, 'success');
      } else {
        showToast(`${file.name} ready as local asset preview.`);
      }
    }
  };

  const handleAddGenre = () => {
    if (customGenre.trim() && !genres.includes(customGenre.trim())) {
      setGenres([...genres, customGenre.trim()]);
      setCustomGenre('');
    }
  };

  const handleRemoveGenre = (g: string) => {
    setGenres(genres.filter((item) => item !== g));
  };

  // 2. Submit Movie Form (Add or Edit)
  const handleSubmitMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a movie title', 'error');
      return;
    }

    const movieObj: Movie = {
      id: editingId || 'mov-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim() || 'Exciting entertainment on MovieDuniya streaming.',
      language,
      category: category as any,
      genre: genres.length > 0 ? genres : ['Entertainment'],
      releaseYear: Number(releaseYear) || 2024,
      duration: duration || '2h 10m',
      rating: rating || '8.5',
      poster: posterUrl.trim() || samplePosterPresets[0].url,
      backdrop: backdropUrl.trim() || posterUrl.trim() || samplePosterPresets[0].url,
      videoUrl: videoUrl.trim() || sampleVideoPresets[0].url,
      videoType: videoUrl.includes('.m3u8') ? 'hls' : 'mp4',
      isVIP,
      isPublished,
      isFeatured,
      isTrending,
      views: editingId ? movies.find((m) => m.id === editingId)?.views || 1000 : 0,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      onUpdateMovie(movieObj);
      showToast(`Movie "${title}" updated successfully!`);
    } else {
      onAddMovie(movieObj);
      showToast(`Movie "${title}" published and added to homepage!`);
    }

    // Background Sync to Firebase Firestore & Supabase
    saveMovieToFirestore(movieObj).then((res) => {
      if (res.success) {
        console.log('Synchronized to Firebase Firestore:', movieObj.title);
      }
    });

    if (isSupabaseConfigured()) {
      upsertSupabaseMovie(movieObj).then((res) => {
        if (res.success) {
          console.log('Synchronized to Supabase:', movieObj.title);
        }
      });
    }

    // Reset Form
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPosterUrl('');
    setBackdropUrl('');
    setVideoUrl('');
    setActiveTab('manage');
  };

  const startEditMovie = (movie: Movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setDescription(movie.description);
    setLanguage(movie.language);
    setCategory(movie.category as any);
    setGenres(movie.genre);
    setReleaseYear(movie.releaseYear);
    setDuration(movie.duration);
    setRating(movie.rating);
    setPosterUrl(movie.poster);
    setBackdropUrl(movie.backdrop || movie.poster);
    setVideoUrl(movie.videoUrl);
    setIsVIP(movie.isVIP);
    setIsPublished(movie.isPublished);
    setIsFeatured(Boolean(movie.isFeatured));
    setIsTrending(Boolean(movie.isTrending));
    setActiveTab('upload');
  };

  const handleDeleteWithConfirmation = async (movieId: string, movieTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${movieTitle}"? This cannot be undone.`)) {
      onDeleteMovie(movieId);
      deleteMovieFromFirestore(movieId).catch((e) => console.warn('Firestore delete notice:', e));
      if (isSupabaseConfigured()) {
        deleteSupabaseMovie(movieId);
      }
      showToast(`Movie "${movieTitle}" deleted.`);
    }
  };

  // 3. Supabase Configuration Handlers
  const handleSaveSupabaseConfig = async () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    showToast('Checking Supabase connection...');
    const result = await testSupabaseConnection();
    setSupabaseStatus({ checked: true, success: result.success, message: result.message });
    if (result.success) {
      showToast('Connected to Supabase database!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    let successCount = 0;
    for (const m of movies) {
      const res = await upsertSupabaseMovie(m);
      if (res.success) successCount++;
    }
    setIsSyncing(false);
    showToast(`Synced ${successCount} of ${movies.length} movies to Supabase.`);
  };

  const handleFetchFromSupabase = async () => {
    setIsSyncing(true);
    const cloudMovies = await fetchSupabaseMovies();
    setIsSyncing(false);
    if (cloudMovies && cloudMovies.length > 0) {
      cloudMovies.forEach((m) => onAddMovie(m));
      showToast(`Loaded ${cloudMovies.length} movies from Supabase!`);
    } else {
      showToast('No movies found in Supabase or table is empty.', 'error');
    }
  };

  // Filtered list for Manage tab
  const filteredCatalog = movies.filter((m) => {
    if (manageLanguage !== 'All' && m.language !== manageLanguage) return false;
    if (manageCategory !== 'All' && m.category !== manageCategory) return false;
    if (manageSearch.trim()) {
      const q = manageSearch.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  // SCREEN 1: SECURE ADMIN LOGIN SCREEN (If not logged in as admin)
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
        <div className="relative w-full max-w-md rounded-3xl bg-[#0d0e17] border border-red-500/40 p-6 sm:p-8 text-center space-y-6 shadow-[0_0_60px_rgba(239,68,68,0.25)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              Restricted Area
            </span>
            <h3 className="text-2xl font-black text-white mt-2">MovieDuniya Admin Login</h3>
            <p className="text-xs text-zinc-300 mt-1">
              Enter your authorized administrator credentials to manage catalog and video streaming.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="rehmanrauf228@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Admin Passkey / PIN
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Authorized credentials: Owner email or passkey (e.g. movieduniya2026)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmittingLogin ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
            </button>
          </form>

          <p className="text-[11px] text-zinc-400">
            Protected with Row Level Security (RLS) &amp; Session Tokens.
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 2: AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0c0d16] border border-white/10 shadow-[0_0_60px_rgba(229,9,20,0.3)] p-5 sm:p-8 my-auto overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  MovieDuniya Admin Console
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                  Authorized Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Logged in as <span className="text-zinc-200 font-semibold">{currentUser?.email}</span> • Full CRUD &amp; Cloud Database Access
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Logout */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#141520] p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingId ? 'Edit Movie' : 'Add Movie'}</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'manage'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Catalog ({movies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'database'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase</span>
              </button>

              <button
                onClick={() => setActiveTab('subscribers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'subscribers'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Subscriptions</span>
              </button>
            </div>

            <button
              onClick={() => {
                onAdminLogout();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-colors"
              title="Log out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}
          >
            {toastMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: ADD NEW MOVIE / EDIT MOVIE FORM */}
        {/* ============================================================== */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSubmitMovie} className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Carry On Jatta 4 / Maula Jatt / Pathaan"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Language *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Punjabi">Punjabi Movies</option>
                  <option value="Pakistani">Pakistani Movies</option>
                  <option value="Hindi">Hindi Movies</option>
                  <option value="English">English Movies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Description / Synopsis
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Storyline synopsis, star cast, plot details..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Latest">Latest Movies</option>
                  <option value="Trending">Trending Movies</option>
                  <option value="Punjabi">Punjabi Cinema</option>
                  <option value="Pakistani">Pakistani Cinema</option>
                  <option value="Hindi">Hindi Cinema</option>
                  <option value="English">English Cinema</option>
                  <option value="Movies">Blockbuster Movies</option>
                  <option value="Web Series">Web Series</option>
                  <option value="Recently Added">Recently Added</option>
                </select>
              </div>

              {/* Release Year */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Release Year
                </label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Duration / Length
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2h 20m"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Poster & Backdrop Cover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Poster Thumbnail URL *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://.../poster.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#141522] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'poster')}
                    />
                  </label>
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-zinc-400">Presets:</span>
                  {samplePosterPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPosterUrl(p.url)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Wide Backdrop Cover (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    placeholder="https://.../banner.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#141522] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'backdrop')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Video File / Authorized MP4 or HLS Stream */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Movie Video URL (Authorized MP4 or HLS .m3u8 Stream) *
                </label>
                <span className="text-[10px] text-zinc-400">
                  Supports CloudFront, Wasabi, CDN, Mux, Cloud Storage
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4 or https://.../playlist.m3u8"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#141522] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap">
                  <span>Upload MP4</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                </label>
              </div>

              {/* Video Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-zinc-400 font-semibold">Authorized Stream Samples:</span>
                {sampleVideoPresets.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setVideoUrl(v.url)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Genres
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(g)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Add genre (e.g. Comedy, Thriller)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#141522] border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Toggles Grid: VIP, Featured, Trending, Publish */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#121320] border border-white/5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVIP}
                  onChange={(e) => setIsVIP(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP Only</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Subscribers only</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Featured</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Highlight in Hero</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Trending</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Trending rail</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Publish Now</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Live on homepage</div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                    setPosterUrl('');
                    setBackdropUrl('');
                    setVideoUrl('');
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer"
              >
                {editingId ? 'Save Changes & Sync' : 'Publish Movie to Homepage'}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MANAGE FILMS & LIVE CATALOG */}
        {/* ============================================================== */}
        {activeTab === 'manage' && (
          <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#141520] border border-white/5">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="Filter movies by title..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={manageLanguage}
                  onChange={(e) => setManageLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#0c0d16] border border-white/10 text-white text-xs"
                >
                  <option value="All">All Languages</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Pakistani">Pakistani</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>

                <button
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                    setPosterUrl('');
                    setVideoUrl('');
                    setActiveTab('upload');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Movie</span>
                </button>
              </div>
            </div>

            {/* Movies List */}
            <div className="space-y-2.5">
              {filteredCatalog.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#121320] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                        {m.isVIP ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            VIP
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            FREE
                          </span>
                        )}
                        {m.isFeatured && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {m.language} Cinema • {m.category} • {m.releaseYear} • {m.duration}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-md mt-0.5">
                        Stream: {m.videoUrl}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Instant Publish / Unpublish Toggle */}
                    <button
                      onClick={() => {
                        const updated = { ...m, isPublished: !m.isPublished };
                        onUpdateMovie(updated);
                        if (isSupabaseConfigured()) upsertSupabaseMovie(updated);
                        showToast(`Movie "${m.title}" is now ${updated.isPublished ? 'Published' : 'Unpublished (Draft)'}`);
                      }}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        m.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={m.isPublished ? 'Published (Click to Unpublish)' : 'Unpublished (Click to Publish)'}
                    >
                      {m.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEditMovie(m)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Movie Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteWithConfirmation(m.id, m.title)}
                      className="p-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors cursor-pointer"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No movies found matching current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SUPABASE CLOUD DATABASE CONFIGURATION & SQL SCHEMA */}
        {/* ============================================================== */}
        {activeTab === 'database' && (
          <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-[#121320] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Supabase Cloud Database Connection</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      supabaseStatus.success
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${supabaseStatus.success ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{supabaseStatus.success ? 'Connected' : 'Offline / Local Storage'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300">
                Connect your Supabase project to persist movies in PostgreSQL with Row Level Security (RLS). You can enter your credentials below or provide them in <code className="text-red-400">.env</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
                    Supabase Public Anon Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {supabaseStatus.checked && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    supabaseStatus.success ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {supabaseStatus.message}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Test Connection</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleSyncToSupabase}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Push Local Movies to Supabase</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleFetchFromSupabase}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Fetch Cloud Catalog</span>
                </button>
              </div>
            </div>

            {/* Supabase SQL Migration Script Box */}
            <div className="p-4 rounded-2xl bg-[#121320] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    One-Click Supabase SQL Setup (Table &amp; Security Rules)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Copy and run this in your Supabase Dashboard ➜ SQL Editor to create the movies table with Row Level Security.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 3000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSchema ? 'Copied!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-[#07070a] border border-white/5 text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-48">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SUBSCRIBERS & PAYMENT VERIFICATIONS */}
        {/* ============================================================== */}
        {activeTab === 'subscribers' && (
          <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            
            {/* 0. Payment Receiving Accounts Setup */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121320] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Your Payment Receiving Accounts (ادائیگی وصول کرنے کے اکاؤنٹس)
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      یہاں درج کردہ JazzCash اور Easypaisa نمبرز گاہک کو سبسکرپشن خریدتے وقت نظر آئیں گے۔
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSavingPayAccounts}
                  onClick={handleSaveAccounts}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer self-start sm:self-auto transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingPayAccounts ? 'Saving...' : 'Save to Firebase'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* JazzCash */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>JazzCash Receiving Account</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Account Number / Phone</label>
                    <input
                      type="text"
                      value={payAccounts.jazzcashNumber}
                      onChange={(e) => setPayAccounts({ ...payAccounts, jazzcashNumber: e.target.value })}
                      placeholder="03001234567"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Account Title (نام)</label>
                    <input
                      type="text"
                      value={payAccounts.jazzcashTitle}
                      onChange={(e) => setPayAccounts({ ...payAccounts, jazzcashTitle: e.target.value })}
                      placeholder="Rehman Rauf"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Easypaisa */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Easypaisa Receiving Account</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Account Number / Phone</label>
                    <input
                      type="text"
                      value={payAccounts.easypaisaNumber}
                      onChange={(e) => setPayAccounts({ ...payAccounts, easypaisaNumber: e.target.value })}
                      placeholder="03451234567"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Account Title (نام)</label>
                    <input
                      type="text"
                      value={payAccounts.easypaisaTitle}
                      onChange={(e) => setPayAccounts({ ...payAccounts, easypaisaTitle: e.target.value })}
                      placeholder="Rehman Rauf"
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Bank Account */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-400">
                    <Building className="w-4 h-4 text-purple-400" />
                    <span>Bank Transfer Details (Optional)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={payAccounts.bankName}
                        onChange={(e) => setPayAccounts({ ...payAccounts, bankName: e.target.value })}
                        placeholder="Meezan Bank Limited"
                        className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Account Title</label>
                      <input
                        type="text"
                        value={payAccounts.bankTitle}
                        onChange={(e) => setPayAccounts({ ...payAccounts, bankTitle: e.target.value })}
                        placeholder="Rehman Rauf"
                        className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">IBAN / Account Number</label>
                      <input
                        type="text"
                        value={payAccounts.bankIban}
                        onChange={(e) => setPayAccounts({ ...payAccounts, bankIban: e.target.value })}
                        placeholder="PK36MEZN..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0c0d16] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Pending Verifications Queue (Crucial User Requirement) */}
            {(() => {
              const pendingTxs = transactions.filter((t) => t.status === 'PENDING');
              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141524] border border-amber-500/40 shadow-lg shadow-amber-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <span>Pending Payment Verifications</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                            {pendingTxs.length} Pending
                          </span>
                        </h4>
                        <p className="text-[11px] text-amber-300/80">
                          صارفین کی جمع کروائی گئی ادائیگیاں • تصدیق کے بعد مووی اسٹریمنگ چالو ہوگی
                        </p>
                      </div>
                    </div>
                  </div>

                  {pendingTxs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-400 bg-black/30 rounded-xl border border-white/5">
                      ✓ No pending payments. All consumer payments are currently verified!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingTxs.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-white">{tx.userEmail}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                                {tx.gateway}
                              </span>
                              <span className="text-xs font-black text-amber-400">
                                {tx.currency} {tx.amount}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-300">
                              <div>
                                <span className="text-zinc-500">Plan:</span>{' '}
                                <span className="font-semibold text-white">{tx.planName}</span>
                              </div>
                              <div>
                                <span className="text-zinc-500">Sender Phone/Acc:</span>{' '}
                                <span className="font-mono font-bold text-amber-300">{tx.accountReference}</span>
                              </div>
                              <div>
                                <span className="text-zinc-500">Transaction Ref:</span>{' '}
                                <span className="font-mono font-bold text-white">{tx.transactionRef}</span>
                              </div>
                              <div>
                                <span className="text-zinc-500">Submitted:</span>{' '}
                                <span className="text-zinc-400">
                                  {new Date(tx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                                  {new Date(tx.paidAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Approval and Reject Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (onApproveTransaction) {
                                  onApproveTransaction(tx.id);
                                  showToast(`Payment verified! Subscription activated for ${tx.userEmail}`, 'success');
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer transform hover:scale-105 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>✓ Verify &amp; Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (onRejectTransaction) {
                                  onRejectTransaction(tx.id);
                                  showToast(`Transaction rejected for ${tx.userEmail}`, 'error');
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#121320] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Total Verified Revenue</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  Rs. {transactions.filter((t) => t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">Verified via JazzCash / Easypaisa</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121320] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Active Subscribers</div>
                <div className="text-2xl font-black text-white mt-1">
                  {transactions.filter((t) => t.status === 'SUCCESS').length} Verified
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">Full Streaming Access Unlocked</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121320] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Catalog Titles</div>
                <div className="text-2xl font-black text-red-500 mt-1">{movies.length} Titles</div>
                <div className="text-[10px] text-zinc-400 mt-1">Punjabi, Pakistani, Hindi, English</div>
              </div>
            </div>

            {/* 3. Verified Subscribers List */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">All Recorded Transactions</h4>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#121320] text-center text-xs text-zinc-500">
                    No transactions recorded yet.
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#121320] border border-white/5 text-xs gap-2"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{t.userEmail}</span>
                          <span className="font-mono text-[10px] text-zinc-400">({t.transactionRef})</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Account: {t.accountReference}</span>
                          <span>•</span>
                          <span>{new Date(t.paidAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="sm:text-center">
                        <div className="font-semibold text-zinc-300">{t.planName}</div>
                        <div className="text-[10px] uppercase font-bold text-zinc-500">{t.gateway}</div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <span className="font-bold text-amber-400">{t.currency} {t.amount}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : t.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {t.status === 'SUCCESS' ? 'VERIFIED ACTIVE' : t.status === 'PENDING' ? 'PENDING VERIFICATION' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
