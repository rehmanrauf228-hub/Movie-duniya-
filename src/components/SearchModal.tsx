import React, { useState } from 'react';
import { X, Search, Film, Star, Play, Crown } from 'lucide-react';
import { Movie, filterMovies } from '../utils/movieEngine';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  onPlayMovie,
  initialQuery = ''
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState(initialQuery);
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = filterMovies(
    movies,
    query,
    selectedLang === 'All' ? undefined : selectedLang,
    selectedCategory === 'All' ? undefined : selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0f1019] border border-white/10 shadow-[0_0_60px_rgba(229,9,20,0.3)] p-6 sm:p-8 mt-6 sm:mt-12 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Punjabi, English, Pakistani & Hindi movies, web series, genres..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/60 border border-white/15 text-white text-base sm:text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-500"
          />
          <Search className="w-6 h-6 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/5">
          <span className="text-xs font-bold text-zinc-500 mr-1">Language:</span>
          {['All', 'Punjabi', 'English', 'Pakistani', 'Hindi'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedLang === lang
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'bg-[#161724] text-zinc-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}

          <span className="text-xs font-bold text-zinc-500 ml-4 mr-1">Category:</span>
          {['All', 'Movies', 'Web Series', 'Latest', 'Trending'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'bg-[#161724] text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
          <span>Found {filtered.length} titles</span>
          {query && (
            <span>
              Matches for &ldquo;<span className="text-white font-bold">{query}</span>&rdquo;
            </span>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                onClose();
                onPlayMovie(movie);
              }}
              className="group relative rounded-2xl overflow-hidden bg-[#151624] border border-white/5 hover:border-red-500/50 transition-all cursor-pointer"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                {/* VIP badge */}
                <div className="absolute top-2 left-2">
                  {movie.isVIP ? (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black">
                      <Crown className="w-2.5 h-2.5 fill-black" />
                      <span>VIP</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                      FREE
                    </span>
                  )}
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>{movie.language}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                  {movie.title}
                </h4>
                <div className="text-[10px] text-zinc-500 mt-0.5">{movie.releaseYear} • {movie.duration}</div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-400 space-y-3">
            <Film className="w-12 h-12 mx-auto text-zinc-600" />
            <div className="text-base font-bold text-white">No Movies Found</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              We couldn&apos;t find any titles matching your query. Try searching for &ldquo;Punjabi&rdquo;, &ldquo;Maula Jatt&rdquo;, or &ldquo;Comedy&rdquo;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
