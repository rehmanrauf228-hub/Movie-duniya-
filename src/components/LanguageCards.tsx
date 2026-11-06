import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';

interface LanguageCardsProps {
  onSelectLanguage: (lang: string) => void;
  onViewAll: () => void;
  selectedLanguage: string;
}

export const LanguageCards: React.FC<LanguageCardsProps> = ({
  onSelectLanguage,
  onViewAll,
  selectedLanguage
}) => {
  const categories = [
    {
      id: 'Punjabi',
      title: 'Punjabi',
      subtitle: 'Movies',
      image: getAssetUrl('/assets/generated/cat-punjabi.png'),
      badge: '250+ Titles',
      color: 'from-amber-600/40'
    },
    {
      id: 'English',
      title: 'English',
      subtitle: 'Movies',
      image: getAssetUrl('/assets/generated/cat-english.png'),
      badge: '1,200+ Titles',
      color: 'from-blue-600/40'
    },
    {
      id: 'Pakistani',
      title: 'Pakistani',
      subtitle: 'Movies',
      image: getAssetUrl('/assets/generated/cat-pakistani.png'),
      badge: '400+ Titles',
      color: 'from-emerald-600/40'
    },
    {
      id: 'Hindi',
      title: 'Hindi',
      subtitle: 'Movies',
      image: getAssetUrl('/assets/generated/cat-hindi.png'),
      badge: '1,800+ Titles',
      color: 'from-rose-600/40'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Red Bar and View All */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Browse by Language
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="group flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Cards Grid matching the Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedLanguage === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectLanguage(cat.id)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 border ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-[1.02]'
                  : 'border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:-translate-y-1'
              } bg-[#111218]`}
            >
              {/* Image from extracted reference */}
              <div className="relative aspect-[2/1] w-full overflow-hidden">
                <img
                  src={cat.image}
                  alt={`${cat.title} Movies`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback gradient if file missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent`} />

                {/* Card footer overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                      {cat.badge}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm shadow-red-600">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-end">
                    {/* Circular Play Button matching image */}
                    <div className="w-10 h-10 rounded-full border border-white/40 bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-500 group-hover:shadow-[0_0_15px_#ef4444] transition-all">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
