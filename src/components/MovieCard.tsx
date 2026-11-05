import React from 'react';
import { Play, Crown, Star, Heart, Check, Clock } from 'lucide-react';
import { Movie } from '../utils/movieEngine';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onToggleWatchlist: (movieId: string) => void;
  isInWatchlist: boolean;
  continueProgress?: { currentTime: number; duration: number };
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onToggleWatchlist,
  isInWatchlist,
  continueProgress
}) => {
  const percentWatched =
    continueProgress && continueProgress.duration > 0
      ? Math.min(100, Math.round((continueProgress.currentTime / continueProgress.duration) * 100))
      : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111219] border border-white/10 hover:border-red-500/60 shadow-lg hover:shadow-[0_0_25px_rgba(229,9,20,0.35)] transition-all duration-300 transform hover:-translate-y-1">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Elegant placeholder poster
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 opacity-70 group-hover:opacity-85 transition-opacity" />

        {/* Badges on top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
          {/* Language tag */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10">
            {movie.language}
          </span>

          {/* VIP or Free Badge */}
          {movie.isVIP ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/30">
              <Crown className="w-3 h-3 fill-black text-black" />
              <span>VIP</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white shadow-md shadow-emerald-500/30">
              FREE
            </span>
          )}
        </div>

        {/* Center Hover Action: Big Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={() => onPlay(movie)}
            className="w-13 h-13 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_25px_#ef4444] transform scale-90 group-hover:scale-100 transition-transform cursor-pointer"
            aria-label={`Play ${movie.title}`}
          >
            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          </button>
        </div>

        {/* Watchlist toggle in bottom-right corner of image */}
        <div className="absolute bottom-2.5 right-2.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isInWatchlist
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 border border-white/10'
            }`}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {isInWatchlist ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Heart className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Continue watching progress bar */}
        {percentWatched > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800 z-10">
            <div
              className="h-full bg-red-600 shadow-[0_0_8px_#ef4444]"
              style={{ width: `${percentWatched}%` }}
            />
          </div>
        )}
      </div>

      {/* Movie Details Info */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold mb-1">
            <span>{movie.releaseYear}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{movie.duration}</span>
            </div>
          </div>

          <h4
            onClick={() => onPlay(movie)}
            className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h4>

          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
            {movie.description}
          </p>
        </div>

        {/* Genres tag list */}
        <div className="flex flex-wrap items-center gap-1 mt-2.5">
          {movie.genre.slice(0, 2).map((g, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5 font-medium"
            >
              {g}
            </span>
          ))}
          {percentWatched > 0 && (
            <span className="text-[9px] text-red-400 font-bold ml-auto">
              {percentWatched}% watched
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
