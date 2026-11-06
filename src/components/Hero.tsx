import React from 'react';
import { Play, Crown, Sparkles } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';

interface HeroProps {
  onStartWatching: () => void;
  onSubscribe: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartWatching, onSubscribe }) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 lg:pt-8 lg:pb-16 bg-gradient-to-b from-[#0e0f17] via-[#07070a] to-[#07070a]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[32rem] h-[32rem] bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[440px]">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 z-10 space-y-6 text-center lg:text-left">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-medium tracking-wide text-zinc-200">
                Welcome to
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic tracking-tight uppercase leading-none drop-shadow-2xl">
                <span className="text-white">Movie</span>
                <span className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 bg-clip-text text-transparent glow-text-red ml-1">
                  Duniya
                </span>
              </h1>
            </div>

            {/* Watch • Upload • Enjoy */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-lg sm:text-2xl font-bold tracking-wider text-white">
              <span>Watch</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
              <span>Upload</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
              <span>Enjoy</span>
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Your Ultimate Destination for{' '}
              <span className="text-amber-400 font-bold glow-text-gold">
                Punjabi, English, Pakistani &amp; Hindi Movies!
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartWatching}
                className="group flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-base shadow-[0_0_30px_rgba(229,9,20,0.6)] hover:shadow-[0_0_40px_rgba(229,9,20,0.8)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <span>Start Watching Now</span>
              </button>

              <button
                onClick={onSubscribe}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#16141c]/90 hover:bg-[#201d29] border border-amber-500/50 hover:border-amber-400 text-white font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Subscribe Now</span>
              </button>
            </div>

            {/* Small stats badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>10,000+ Hours of Content</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>4K Ultra HD &amp; Dolby 5.1</span>
              </div>
            </div>
          </div>

          {/* Right Hero Cinematic Graphic matching Reference Image */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600/30 via-rose-600/20 to-amber-500/20 rounded-3xl blur-2xl opacity-75" />

              {/* The extracted high-res hero montage with 4 characters & 3D crown emblem */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                <img
                  src={getAssetUrl('/assets/generated/hero-characters.png')}
                  alt="MovieDuniya Characters and 3D Crown Emblem"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Sub-overlay labels for characters */}
                <div className="absolute bottom-3 left-3 right-3 hidden sm:flex items-center justify-between pointer-events-none">
                  <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/30 text-[11px] font-bold text-zinc-200">
                    Punjabi • English • Pakistani • Hindi
                  </div>
                  <div className="bg-red-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md shadow-red-600/40">
                    HD Premium
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Red Glowing Neon Ribbon along the bottom of the hero section */}
      <div className="relative w-full mt-6 h-4 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_#ef4444]" />
        <div className="absolute inset-x-12 top-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent blur-[1px]" />
      </div>
    </section>
  );
};
