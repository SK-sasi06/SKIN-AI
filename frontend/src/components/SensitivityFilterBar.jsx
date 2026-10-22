import React from 'react';
import { Filter, Sparkles, Shield, DollarSign, SlidersHorizontal, Check } from 'lucide-react';

export default function SensitivityFilterBar({
  budgetTier,
  setBudgetTier,
  fragranceFree,
  setFragranceFree,
  alcoholFree,
  setAlcoholFree,
  totalResults
}) {
  const budgetTiers = [
    { id: 'all', label: 'All Budgets', desc: 'Any Price' },
    { id: 'budget', label: 'Affordable / Pharmacy', desc: '< ₹700' },
    { id: 'mid', label: 'Mid-Range Clinical', desc: '₹700 – ₹1,800' },
    { id: 'premium', label: 'Luxury / Premium', desc: '> ₹1,800' }
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-dermo-warm/90 shadow-xs space-y-4">
      {/* Top Bar with Title and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2 text-dermo-charcoal font-semibold text-xs sm:text-sm">
          <SlidersHorizontal className="w-4 h-4 text-dermo-teal" />
          <span>Personalized Formulation & Sensitivity Filters</span>
        </div>
        {totalResults !== undefined && (
          <span className="text-[11px] text-stone-500 font-medium">
            Showing <strong className="text-dermo-teal">{totalResults}</strong> tailored formulation(s)
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Budget Tiers */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            INR Budget Bracket (₹)
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {budgetTiers.map((t) => {
              const active = budgetTier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBudgetTier(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-dermo-teal text-white shadow-xs font-semibold'
                      : 'bg-dermo-sand/60 text-stone-700 hover:bg-dermo-sand border border-dermo-warm/60'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`ml-1.5 text-[10px] ${active ? 'text-white/80' : 'text-stone-400'}`}>
                    ({t.desc})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skin Sensitivity Toggles */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-dermo-teal" />
            Skin Allergy & Sensitivity Exclusions
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFragranceFree(!fragranceFree)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                fragranceFree
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${fragranceFree ? 'bg-white text-emerald-800' : 'border border-stone-400'}`}>
                {fragranceFree && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>Fragrance-Free (Parfum)</span>
            </button>

            <button
              type="button"
              onClick={() => setAlcoholFree(!alcoholFree)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                alcoholFree
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${alcoholFree ? 'bg-white text-emerald-800' : 'border border-stone-400'}`}>
                {alcoholFree && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>Alcohol-Free (Drying Alcohols)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
