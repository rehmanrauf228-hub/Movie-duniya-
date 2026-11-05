import React from 'react';
import { Clapperboard, Zap, Headphones, Heart, ArrowRight } from 'lucide-react';

interface TrustFooterBannerProps {
  onJoinToday: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
}

export const TrustFooterBanner: React.FC<TrustFooterBannerProps> = ({
  onJoinToday,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact
}) => {
  return (
    <footer className="w-full mt-12 border-t border-white/5 bg-[#08090f] relative overflow-hidden">
      {/* Upper Features & CTA Banner matching Reference */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-[#0e0f17] border border-white/10 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* 4 Feature Highlights matching Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 flex-1">
            {/* HD Quality Streaming */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Clapperboard className="w-6 h-6 text-zinc-200" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-white">HD Quality</div>
                <div className="text-xs text-zinc-400">Streaming</div>
              </div>
            </div>

            {/* Instant Access */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 shadow-sm">
                <Zap className="w-6 h-6 fill-red-500 text-red-500" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-white">Instant</div>
                <div className="text-xs text-zinc-400">Access</div>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 shadow-sm">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-white">24/7</div>
                <div className="text-xs text-zinc-400">Support</div>
              </div>
            </div>

            {/* Made for Movie Lovers */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0 shadow-sm">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-white">Made for</div>
                <div className="text-xs text-zinc-400">Movie Lovers</div>
              </div>
            </div>
          </div>

          {/* Red Accent Banner on Right: Join MovieDuniya Today! */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <button
              onClick={onJoinToday}
              className="w-full lg:w-auto group flex items-center justify-between sm:justify-start gap-4 px-6 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-400/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <div className="text-left">
                <div className="text-base sm:text-lg font-black tracking-tight">
                  Join Movie<span className="text-amber-300">Duniya</span> Today!
                </div>
                <div className="text-xs text-red-100 font-medium">
                  and Get Unlimited Entertainment
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Lower Footer Navigation and Legal */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} <span className="text-zinc-300 font-semibold">MovieDuniya</span>. All rights reserved. Only authentic Punjabi, English, Pakistani &amp; Hindi entertainment.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <button
              onClick={onOpenContact}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
