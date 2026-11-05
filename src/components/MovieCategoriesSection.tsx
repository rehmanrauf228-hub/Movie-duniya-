import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Film, Flame, Sparkles, Tv, Clock } from 'lucide-react';
import { Movie } from '../utils/movieEngine';
import { MovieCard } from './MovieCard';

interface CategoryRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movieId: string) => void;
  watchlist: string[];
  continueWatching: Record<string, { currentTime: number; duration: number }>;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  subtitle,
  icon,
  movies,
  onPlayMovie,
  onToggleWatchlist,
  watchlist,
  continueWatching
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]" />
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h3>
            <span className="text-xs font-bold text-zinc-500 ml-1">
              ({movies.length})
            </span>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#15161f] border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#15161f] border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label={`Next ${title}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movies Row Horizontal Scroller */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-[180px] sm:w-[200px] md:w-[220px] flex-shrink-0"
          >
            <MovieCard
              movie={movie}
              onPlay={onPlayMovie}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={watchlist.includes(movie.id)}
              continueProgress={continueWatching[movie.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface MovieCategoriesSectionProps {
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movieId: string) => void;
  watchlist: string[];
  continueWatching: Record<string, { currentTime: number; duration: number }>;
  filterLanguage?: string;
  filterTab?: string;
}

export const MovieCategoriesSection: React.FC<MovieCategoriesSectionProps> = ({
  movies,
  onPlayMovie,
  onToggleWatchlist,
  watchlist,
  continueWatching,
  filterLanguage,
  filterTab
}) => {
  // Published only
  const published = movies.filter((m) => m.isPublished);

  // Group by language
  const punjabiMovies = published.filter((m) => m.language === 'Punjabi');
  const englishMovies = published.filter((m) => m.language === 'English');
  const pakistaniMovies = published.filter((m) => m.language === 'Pakistani');
  const hindiMovies = published.filter((m) => m.language === 'Hindi');

  // Group by category
  const trendingMovies = published.filter((m) => m.category === 'Trending' || m.views > 100000);
  const latestMovies = published.filter((m) => m.category === 'Latest' || m.releaseYear >= 2024);
  const webSeries = published.filter((m) => m.category === 'Web Series');
  const recentlyAdded = [...published].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* If a language filter is selected, show that language prominently */}
      {filterLanguage && filterLanguage !== 'All' ? (
        <div>
          <CategoryRow
            title={`${filterLanguage} Movies`}
            icon={<Film className="w-5 h-5 text-red-500" />}
            movies={published.filter((m) => m.language.toLowerCase() === filterLanguage.toLowerCase())}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
        </div>
      ) : filterTab === 'movies' ? (
        <>
          <CategoryRow
            title="All Blockbuster Movies"
            icon={<Film className="w-5 h-5 text-red-500" />}
            movies={published.filter((m) => m.category !== 'Web Series')}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
          <CategoryRow
            title="Punjabi Movies"
            movies={punjabiMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
          <CategoryRow
            title="Pakistani Movies"
            movies={pakistaniMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
          <CategoryRow
            title="Hindi Movies"
            movies={hindiMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
          <CategoryRow
            title="English Movies"
            movies={englishMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
        </>
      ) : filterTab === 'series' ? (
        <>
          <CategoryRow
            title="Exclusive Web Series"
            icon={<Tv className="w-5 h-5 text-red-500" />}
            movies={webSeries}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
          <CategoryRow
            title="Trending Series"
            icon={<Flame className="w-5 h-5 text-amber-500" />}
            movies={webSeries.slice().reverse()}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
        </>
      ) : (
        /* Full Home Feed with all 8 requested categories */
        <>
          {/* 1. Trending Movies */}
          <CategoryRow
            title="Trending Movies"
            icon={<Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
            movies={trendingMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 2. Latest Movies */}
          <CategoryRow
            title="Latest Movies"
            icon={<Sparkles className="w-5 h-5 text-red-500" />}
            movies={latestMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 3. Punjabi Movies */}
          <CategoryRow
            title="Punjabi Movies"
            icon={<Film className="w-5 h-5 text-amber-400" />}
            movies={punjabiMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 4. Pakistani Movies */}
          <CategoryRow
            title="Pakistani Movies"
            icon={<Film className="w-5 h-5 text-emerald-400" />}
            movies={pakistaniMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 5. Hindi Movies */}
          <CategoryRow
            title="Hindi Movies"
            icon={<Film className="w-5 h-5 text-rose-400" />}
            movies={hindiMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 6. English Movies */}
          <CategoryRow
            title="English Movies"
            icon={<Film className="w-5 h-5 text-blue-400" />}
            movies={englishMovies}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 7. Web Series */}
          <CategoryRow
            title="Web Series"
            icon={<Tv className="w-5 h-5 text-purple-400" />}
            movies={webSeries}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />

          {/* 8. Recently Added */}
          <CategoryRow
            title="Recently Added"
            icon={<Clock className="w-5 h-5 text-cyan-400" />}
            movies={recentlyAdded}
            onPlayMovie={onPlayMovie}
            onToggleWatchlist={onToggleWatchlist}
            watchlist={watchlist}
            continueWatching={continueWatching}
          />
        </>
      )}
    </section>
  );
};
