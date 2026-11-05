import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface PaymentOptionsStripProps {
  onSelectGateway?: (gateway: string) => void;
}

export const PaymentOptionsStrip: React.FC<PaymentOptionsStripProps> = ({ onSelectGateway }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Red Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]" />
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Secure Payment Options
        </h2>
      </div>

      {/* Main Payment Container matching Reference */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12131b] via-[#161724] to-[#12131b] border border-white/10 p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Subtle background red accent glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Payment Gateways Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 flex-1">
            {/* JazzCash */}
            <div
              onClick={() => onSelectGateway && onSelectGateway('jazzcash')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-amber-500/30 hover:border-amber-400 hover:scale-105 transition-all cursor-pointer shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-[#f39c12] flex items-center justify-center text-[10px] font-black text-black">
                JC
              </div>
              <span className="text-base font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Jazz<span className="text-red-500">Cash</span>
              </span>
            </div>

            {/* Easypaisa */}
            <div
              onClick={() => onSelectGateway && onSelectGateway('easypaisa')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-emerald-500/30 hover:border-emerald-400 hover:scale-105 transition-all cursor-pointer shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-[#00b050] flex items-center justify-center text-[11px] font-black text-white italic">
                e
              </div>
              <span className="text-base font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                easypaisa
              </span>
            </div>

            {/* VISA */}
            <div
              onClick={() => onSelectGateway && onSelectGateway('card')}
              className="flex items-center px-4 py-2 rounded-xl bg-black/60 border border-blue-500/30 hover:border-blue-400 hover:scale-105 transition-all cursor-pointer shadow-sm group"
            >
              <span className="text-base font-black italic tracking-wider text-blue-400 group-hover:text-blue-300">
                VISA
              </span>
            </div>

            {/* MasterCard */}
            <div
              onClick={() => onSelectGateway && onSelectGateway('card')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-red-500/30 hover:border-red-400 hover:scale-105 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex -space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#eb001b]" />
                <div className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-90" />
              </div>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white">
                mastercard
              </span>
            </div>

            {/* PayPal */}
            <div
              onClick={() => onSelectGateway && onSelectGateway('card')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/60 border border-cyan-500/30 hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer shadow-sm group"
            >
              <span className="text-base font-black italic text-[#0079C1]">
                Pay<span className="text-[#00457C]">Pal</span>
              </span>
            </div>

            {/* 100% Secure & Trusted */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-semibold">
                <span className="block text-[11px] leading-tight text-white">100% Secure</span>
                <span className="block text-[9px] text-zinc-400 leading-tight">&amp; Trusted</span>
              </div>
            </div>
          </div>

          {/* Red Pill Safe & Secure Card on Right matching image */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-400/30">
              <div className="p-2 rounded-xl bg-black/20 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-white">
                  Safe &amp; Secure Payments
                </div>
                <div className="text-[11px] text-red-100 font-medium">
                  Your Data is Always Protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
