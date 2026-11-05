import React from 'react';
import { Calendar, Check, ArrowRight, Crown } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../utils/movieEngine';

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  activePlanId?: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  activePlanId
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="pricing-plans">
      {/* Header with Red Bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Choose Your Subscription Plan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Watch unlimited Punjabi, English, Pakistani &amp; Hindi movies with no ads in crisp HD &amp; 4K.
          </p>
        </div>
      </div>

      {/* 3 Cards Grid matching the Reference Image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isPopular = plan.isPopular;
          const isBestValue = plan.isBestValue;
          const isActive = activePlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'bg-gradient-to-b from-[#1c131a] to-[#120f18] border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.35)] md:-translate-y-2'
                  : isBestValue
                  ? 'bg-[#12131c] border border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                  : 'bg-[#12131c] border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Most Popular Badge at top center */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/50">
                    ★ Most Popular
                  </span>
                </div>
              )}

              {/* Best Value Badge on top right with Crown */}
              {isBestValue && (
                <div className="absolute -top-3 right-4">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/40">
                    <Crown className="w-3.5 h-3.5 fill-black text-black" />
                    <span>Best Value</span>
                  </div>
                </div>
              )}

              {/* Card Top: Icon & Plan Name */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={`p-2.5 rounded-xl ${isPopular ? 'bg-red-500/20 text-red-400' : isBestValue ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-amber-300'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {plan.name}
                  </h3>
                </div>

                {/* Price Display */}
                <div className="text-center my-6">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold text-amber-400">
                      {plan.currency}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">
                      {plan.periodText}
                    </span>
                  </div>
                  {isActive && (
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      Current Active Plan
                    </span>
                  )}
                </div>

                {/* Features List with Green Checkmarks */}
                <div className="space-y-3.5 pt-2 pb-6 border-t border-white/5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-sm font-medium text-zinc-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full group flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isPopular
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:shadow-[0_0_35px_rgba(239,68,68,0.9)]'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50'
                  }`}
                >
                  <span>{isActive ? 'Renew Plan' : 'Subscribe Now'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
