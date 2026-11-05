import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Film,
  Users,
  BarChart3,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Check,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  Crown
} from 'lucide-react';
import { Movie, UserAccount } from '../utils/movieEngine';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onAddMovie: (movie: Movie) => void;
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  currentUser: UserAccount | null;
  onSwitchToAdmin: () => void;
}

export const AdminUploadModal: React.FC<AdminUploadModalProps> = ({
  isOpen,
  onClose,
  movies,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
  currentUser,
  onSwitchToAdmin
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'subscribers'>('upload');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'Punjabi' | 'English' | 'Pakistani' | 'Hindi' | 'Other'>('Punjabi');
  const [category, setCategory] = useState<'Movies' | 'Web Series' | 'Latest' | 'Trending' | 'Recently Added'>('Latest');
  const [genres, setGenres] = useState<string[]>(['Action', 'Comedy']);
  const [customGenre, setCustomGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [duration, setDuration] = useState('2h 15m');
  const [rating, setRating] = useState('8.5');
  const [posterUrl, setPosterUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isVIP, setIsVIP] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  const [successToast, setSuccessToast] = useState('');

  const samplePosterPresets = [
    { label: 'Punjabi Hero', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop' },
    { label: 'Action Epic', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop' },
    { label: 'Pakistani Cinema', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800&auto=format&fit=crop' },
    { label: 'Bollywood Glamour', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop' }
  ];

  const sampleVideoPresets = [
    { label: 'Big Buck Bunny (1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: 'Elephants Dream (4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { label: 'Tears of Steel (Sci-Fi)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { label: 'Sintel (Action Fantasy)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      if (target === 'poster') {
        setPosterUrl(fakeUrl);
      } else {
        setVideoUrl(fakeUrl);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const movieObj: Movie = {
      id: editingId || 'mov-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim() || 'Exciting entertainment on MovieDuniya streaming.',
      language,
      category,
      genre: genres.length > 0 ? genres : ['Entertainment'],
      releaseYear: Number(releaseYear) || 2024,
      duration: duration || '2h 10m',
      rating: rating || '8.0',
      poster: posterUrl || samplePosterPresets[0].url,
      videoUrl: videoUrl || sampleVideoPresets[0].url,
      isVIP,
      isPublished,
      views: editingId ? movies.find((m) => m.id === editingId)?.views || 1000 : 0,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      onUpdateMovie(movieObj);
      setSuccessToast(`Movie "${title}" updated successfully!`);
    } else {
      onAddMovie(movieObj);
      setSuccessToast(`Movie "${title}" published and added to homepage!`);
    }

    // Reset Form
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPosterUrl('');
    setVideoUrl('');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const startEditMovie = (movie: Movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setDescription(movie.description);
    setLanguage(movie.language);
    setCategory(movie.category);
    setGenres(movie.genre);
    setReleaseYear(movie.releaseYear);
    setDuration(movie.duration);
    setRating(movie.rating);
    setPosterUrl(movie.poster);
    setVideoUrl(movie.videoUrl);
    setIsVIP(movie.isVIP);
    setIsPublished(movie.isPublished);
    setActiveTab('upload');
  };

  // If user is not admin, show authorization screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-md rounded-3xl bg-[#0f1018] border border-red-500/40 p-8 text-center space-y-6 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Administrator Access Only</h3>
            <p className="text-sm text-zinc-300 mt-2">
              The movie upload and publishing console is restricted to authorized MovieDuniya administrators.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => {
                onSwitchToAdmin();
              }}
              className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer transition-all"
            >
              Sign In as Admin (rehmanrauf228@gmail.com)
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0d0e16] border border-white/10 shadow-[0_0_60px_rgba(229,9,20,0.3)] p-6 sm:p-8 my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
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
                  Authorized
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Upload films, manage publishing status, and monitor subscriptions.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#141520] p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Edit Movie' : 'Upload Movie'}</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'manage'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Manage Films ({movies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Subscriptions</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {successToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TAB 1: UPLOAD / EDIT MOVIE FORM */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
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
                  placeholder="e.g. Carry On Jatta 4 / The Legend Continues"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Punjabi">Punjabi Movies</option>
                  <option value="English">English Movies</option>
                  <option value="Pakistani">Pakistani Movies</option>
                  <option value="Hindi">Hindi Movies</option>
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
                placeholder="Synopsis of the movie, cast, plot summary..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Latest">Latest Movies</option>
                  <option value="Trending">Trending Movies</option>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
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
                  placeholder="e.g. 2h 25m or 10 Episodes"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Poster Upload or URL */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Movie Poster &amp; Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://example.com/poster.jpg or select preset below"
                  className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold whitespace-nowrap">
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'poster')}
                  />
                </label>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-zinc-500 font-semibold">Presets:</span>
                {samplePosterPresets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPosterUrl(p.url)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video File Upload or Authorized Video Stream URL */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Movie Video File or Authorized Stream URL
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/.../movie.mp4"
                  className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#151624] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
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

              {/* Quick Video Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-zinc-500 font-semibold">Authorized Streams:</span>
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
                  placeholder="Add genre (e.g. Action)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#151624] border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* VIP & Publish Toggles */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#141522] border border-white/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVIP}
                  onChange={(e) => setIsVIP(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP Subscription Protected</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Require active subscriber plan to watch
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Publish Immediately</div>
                  <div className="text-[10px] text-zinc-400">
                    Show movie on homepage rails and search
                  </div>
                </div>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                    setPosterUrl('');
                    setVideoUrl('');
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Publish Movie to MovieDuniya'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MANAGE FILMS */}
        {activeTab === 'manage' && (
          <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1 space-y-3">
            <div className="text-xs text-zinc-400 pb-2">
              All movies currently uploaded in database. You can edit, delete, or toggle published status.
            </div>

            {movies.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#141522] border border-white/5 hover:border-white/15 transition-all"
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
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {m.language} • {m.category} • {m.releaseYear} • {m.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Publish toggle */}
                  <button
                    onClick={() =>
                      onUpdateMovie({
                        ...m,
                        isPublished: !m.isPublished
                      })
                    }
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      m.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={m.isPublished ? 'Published (Click to Unpublish)' : 'Unpublished (Click to Publish)'}
                  >
                    {m.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => startEditMovie(m)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Movie"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteMovie(m.id)}
                    className="p-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SUBSCRIBERS & REVENUE STATS */}
        {activeTab === 'subscribers' && (
          <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#141522] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Total Revenue</div>
                <div className="text-2xl font-black text-amber-400 mt-1">Rs. 1,489,200</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">+18.5% this month</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141522] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Active VIP Subscribers</div>
                <div className="text-2xl font-black text-white mt-1">3,842 Users</div>
                <div className="text-[10px] text-zinc-400 mt-1">JazzCash, Easypaisa, Cards</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141522] border border-white/5">
                <div className="text-xs text-zinc-400 font-semibold">Published Catalog</div>
                <div className="text-2xl font-black text-red-500 mt-1">{movies.length} Titles</div>
                <div className="text-[10px] text-zinc-400 mt-1">Punjabi, English, Pakistani, Hindi</div>
              </div>
            </div>

            {/* Recent Subscribers List */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Recent Subscriber Activations</h4>
              <div className="space-y-2">
                {[
                  { name: 'Bilal Khan', email: 'bilal.k@gmail.com', plan: '3 Months Plan', amount: 'Rs. 499', method: 'JazzCash', status: 'ACTIVE' },
                  { name: 'Hamza Farooq', email: 'hamza.f@gmail.com', plan: '1 Year Plan', amount: 'Rs. 2,999', method: 'Easypaisa', status: 'ACTIVE' },
                  { name: 'Ayesha Malik', email: 'ayesha.m@yahoo.com', plan: 'Monthly Plan', amount: 'Rs. 199', method: 'Debit Card', status: 'ACTIVE' },
                  { name: 'Zeeshan Ali', email: 'zeeshan.ali@gmail.com', plan: '3 Months Plan', amount: 'Rs. 499', method: 'Bank Transfer', status: 'ACTIVE' }
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141522] border border-white/5 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-zinc-400">{s.email}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-zinc-300">{s.plan}</div>
                      <div className="text-[10px] text-zinc-500">{s.method}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-400">{s.amount}</span>
                      <span className="block text-[9px] text-emerald-400 font-black">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
