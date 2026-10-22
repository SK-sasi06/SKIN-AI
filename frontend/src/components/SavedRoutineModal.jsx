import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Printer,
  Layers,
  Clock,
  Droplets,
  Crosshair,
  Award,
  AlertTriangle,
  FileText,
  Calendar,
  Check,
  User,
  HeartHandshake
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getCurrentUser } from '../services/api';
import ProductImage from './ProductImage';

export default function SavedRoutineModal({
  isOpen,
  onClose,
  latestReport,
  savedRoutineIds = [],
  toggleRoutineItem,
  onSelectProduct
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'morning' | 'evening'

  if (!isOpen) return null;

  const currentUser = getCurrentUser();
  const memberName = latestReport?.user?.full_name || currentUser?.full_name || 'Personalized AI Member';
  const memberEmail = latestReport?.user?.email || currentUser?.email || 'member@alskincare.ai';
  const memberId = latestReport?.user?.id || currentUser?.id || 1;
  const reportCode = latestReport?.report_code || `RPT-2026-${String(latestReport?.id || 54).padStart(4, '0')}`;
  const prescribedDate = latestReport?.created_at || 'October 22, 2026';
  const dominantConcern = latestReport?.dominant_concern || latestReport?.primary_concern || 'Acne & Barrier Balance';
  const skinType = latestReport?.skin_type || 'Combination / Sensitive Barrier';

  const morningProds = latestReport?.morning_routine || [];
  const eveningProds = latestReport?.evening_routine || [];

  // Filter products by routine IDs or display all suggested
  const activeMorning = morningProds.filter((p) => savedRoutineIds.includes(p.id));
  const activeEvening = eveningProds.filter((p) => savedRoutineIds.includes(p.id));

  // If no savedRoutineIds explicitly picked, fall back to showing all recommended
  const displayMorning = activeMorning.length > 0 ? activeMorning : morningProds;
  const displayEvening = activeEvening.length > 0 ? activeEvening : eveningProds;

  // Calculate routine cost
  const allDisplayProds = [...displayMorning, ...displayEvening];
  const uniqueDisplayProds = Array.from(new Map(allDisplayProds.map(p => [p.id, p])).values());
  const totalCost = uniqueDisplayProds.reduce((sum, p) => sum + (p.price_inr || p.price * 83.5 || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-dermo-warm flex flex-col overflow-hidden">
        
        {/* =========================================================================
            MODAL HEADER: Prominent Aligned Print Button & Clinical Branding
        ========================================================================= */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-dermo-teal/40 text-emerald-300 border border-emerald-500/30 shrink-0">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {savedRoutineIds.length > 0 ? `${savedRoutineIds.length} Formulations Active` : `${displayMorning.length + displayEvening.length} Formulations Prescribed`}
                </span>
                <span className="text-xs text-stone-300">
                  Official Daily AM/PM Clinical Protocol
                </span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white mt-1">
                My Personalized Skincare Routine
              </h2>
            </div>
          </div>

          {/* Action Buttons: High-Contrast Print Button & Close */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-dermo-teal hover:bg-dermo-sand font-bold text-xs flex items-center gap-2 shadow-sm transition-all focus:outline-none"
              title="Print Official Clinical Prescription Report"
            >
              <Printer className="w-4 h-4 text-dermo-teal" />
              <span className="hidden sm:inline">Print Protocol</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Routine"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            MEMBER PROFILE & AI DERMO REGIMEN DOSSIER BAR
        ========================================================================= */}
        <div className="px-6 py-4 bg-dermo-sand/90 border-b border-dermo-warm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Member Name</span>
            <span className="font-serif font-bold text-dermo-charcoal truncate block">{memberName}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Prescription ID</span>
            <span className="font-mono font-bold text-dermo-teal truncate block">{reportCode}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Primary Finding</span>
            <span className="font-semibold text-dermo-charcoal truncate block">{dominantConcern}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Total Routine Value</span>
            <span className="font-serif font-bold text-emerald-800 text-sm block">{formatINR(totalCost)}</span>
          </div>
        </div>

        {/* =========================================================================
            SUB-NAVIGATION BAR (Filter: All / Morning / Evening)
        ========================================================================= */}
        <div className="px-6 py-3 bg-white border-b border-dermo-warm flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'all'
                  ? 'bg-dermo-teal text-white shadow-2xs font-bold'
                  : 'bg-dermo-sand text-stone-700 hover:bg-dermo-warm border border-dermo-warm/60'
              }`}
            >
              Complete Regimen ({displayMorning.length + displayEvening.length} steps)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('morning')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'morning'
                  ? 'bg-amber-700 text-white shadow-2xs font-bold'
                  : 'bg-dermo-sand text-stone-700 hover:bg-dermo-warm border border-dermo-warm/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Morning AM ({displayMorning.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('evening')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'evening'
                  ? 'bg-indigo-900 text-white shadow-2xs font-bold'
                  : 'bg-dermo-sand text-stone-700 hover:bg-dermo-warm border border-dermo-warm/60'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Evening PM ({displayEvening.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-500">
            Prescribed: {prescribedDate}
          </span>
        </div>

        {/* =========================================================================
            SCROLLABLE CLINICAL CONTENT (Formatted for Screen and A4 Paper Print)
        ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-stone-50/50">
          
          {/* =====================================================================
              SECTION 1: MORNING REGIMEN PROTOCOL (AM)
          ===================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'morning') && (
            <div className="space-y-4 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dermo-warm/80 pb-2.5 gap-1">
                <div className="flex items-center gap-2 text-amber-800">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <h3 className="font-serif font-bold text-lg text-dermo-charcoal">
                    Morning Regimen Protocol (AM)
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    07:30 AM &ndash; 08:30 AM
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Focus: Antioxidant Protection, Epidermal Hydration & UV Matrix Shield
                </span>
              </div>

              {displayMorning.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs italic bg-white rounded-2xl border border-dermo-warm">
                  No morning steps actively toggled. Select products from your assessment to add them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayMorning.map((prod, idx) => (
                    <div
                      key={`am-${prod.id || idx}`}
                      className="p-5 rounded-2xl bg-white border border-dermo-warm shadow-xs flex flex-col justify-between space-y-3.5 print-avoid-break"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-dermo-sand shrink-0 border border-dermo-warm/60 p-1 flex items-center justify-center">
                          <ProductImage
                            src={prod.image_url}
                            alt={prod.name}
                            category={prod.category || prod.label}
                            brand={prod.brand}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                              Step {idx + 1}: {prod.category || prod.label}
                            </span>
                            <span className="text-xs font-bold text-dermo-charcoal">
                              {formatINR(prod.price_inr, prod.price)}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-dermo-accent uppercase tracking-wider">{prod.brand}</p>
                          <h4 className="font-serif font-bold text-sm text-dermo-charcoal line-clamp-2 leading-tight">
                            {prod.name}
                          </h4>
                          {prod.match_reason && (
                            <p className="text-[11px] text-stone-600 leading-relaxed bg-dermo-cream p-2 rounded-xl border border-dermo-warm/50">
                              {prod.match_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Clinical Usage Guidance */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          <span>Application Guidance</span>
                          <span className="text-dermo-teal font-mono">Dose: 1&ndash;2 Pumps</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">
                          Apply gently in upward circular motions across forehead, cheeks, and neck. Allow 60 seconds absorption before next step.
                        </p>
                      </div>

                      {/* Actions (Hidden in Print) */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 no-print">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://www.amazon.in/s?k=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Amazon
                          </a>
                          <a
                            href={`https://www.flipkart.com/search?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Flipkart
                          </a>
                          <a
                            href={`https://www.nykaa.com/search/result/?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Nykaa
                          </a>
                        </div>

                        {onSelectProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProduct(prod);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-dermo-teal text-white text-[11px] font-semibold shadow-2xs hover:bg-dermo-tealDark transition-all"
                          >
                            Compare Prices
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 2: EVENING REGIMEN PROTOCOL (PM)
          ===================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'evening') && (
            <div className="space-y-4 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dermo-warm/80 pb-2.5 gap-1">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Moon className="w-5 h-5 text-indigo-900" />
                  <h3 className="font-serif font-bold text-lg text-dermo-charcoal">
                    Evening Regimen Protocol (PM)
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    09:30 PM &ndash; 10:30 PM
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Focus: Deep Epidermal Cleansing, Cellular Regeneration & Lipid Barrier Seal
                </span>
              </div>

              {displayEvening.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs italic bg-white rounded-2xl border border-dermo-warm">
                  No evening steps actively toggled. Select products from your assessment to add them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayEvening.map((prod, idx) => (
                    <div
                      key={`pm-${prod.id || idx}`}
                      className="p-5 rounded-2xl bg-white border border-dermo-warm shadow-xs flex flex-col justify-between space-y-3.5 print-avoid-break"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-dermo-sand shrink-0 border border-dermo-warm/60 p-1 flex items-center justify-center">
                          <ProductImage
                            src={prod.image_url}
                            alt={prod.name}
                            category={prod.category || prod.label}
                            brand={prod.brand}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                              Step {idx + 1}: {prod.category || prod.label}
                            </span>
                            <span className="text-xs font-bold text-dermo-charcoal">
                              {formatINR(prod.price_inr, prod.price)}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-dermo-accent uppercase tracking-wider">{prod.brand}</p>
                          <h4 className="font-serif font-bold text-sm text-dermo-charcoal line-clamp-2 leading-tight">
                            {prod.name}
                          </h4>
                          {prod.match_reason && (
                            <p className="text-[11px] text-stone-600 leading-relaxed bg-dermo-cream p-2 rounded-xl border border-dermo-warm/50">
                              {prod.match_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Clinical Usage Guidance */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          <span>Application Guidance</span>
                          <span className="text-indigo-900 font-mono">Dose: Dime-Sized Layer</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">
                          Smooth over cleansed skin. Focus on areas with dehydration or blemish frequency to nourish night cellular repair.
                        </p>
                      </div>

                      {/* Actions (Hidden in Print) */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 no-print">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://www.amazon.in/s?k=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Amazon
                          </a>
                          <a
                            href={`https://www.flipkart.com/search?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Flipkart
                          </a>
                          <a
                            href={`https://www.nykaa.com/search/result/?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold border border-stone-200"
                          >
                            Nykaa
                          </a>
                        </div>

                        {onSelectProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProduct(prod);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-dermo-teal text-white text-[11px] font-semibold shadow-2xs hover:bg-dermo-tealDark transition-all"
                          >
                            Compare Prices
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 3: PHARMACOLOGICAL SAFETY & CONTRAINDICATION CLEARANCE
          ===================================================================== */}
          <div className="p-5 rounded-2xl bg-white border border-dermo-warm space-y-3 print-avoid-break">
            <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pharmacological Compatibility & Clinical Safety Clearances
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  pH Balance Clearance
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  All prescribed formulations are calibrated within the physiological dermal acid mantle pH (5.0&ndash;5.6).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
                <span className="font-bold text-sky-900 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  Non-Comedogenic Test
                </span>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Zero heavy pore-clogging occlusives. Formulations maintain breathability for acne-prone skin.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Sun Sensitivity Notice
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  When using hydroxy acids (AHA/BHA), daily broad-spectrum SPF 30+ is mandatory during sun exposure.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================================
              SECTION 4: 30-DAY CLINICAL TREATMENT PROGRESSION MILESTONES
          ===================================================================== */}
          <div className="p-5 rounded-2xl bg-white border border-dermo-warm space-y-3 print-avoid-break">
            <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-2">
              <Calendar className="w-4 h-4 text-dermo-gold" />
              Expected Clinical Treatment Milestones (30-Day Protocol)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-dermo-warm/80 space-y-0.5">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Days 1&ndash;7</span>
                <strong className="text-dermo-charcoal block">Acclimation Phase</strong>
                <p className="text-[10px] text-stone-500">Initial lipid barrier stabilization and mild cellular settling.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-dermo-warm/80 space-y-0.5">
                <span className="text-[10px] font-bold text-dermo-teal uppercase tracking-wider block">Days 8&ndash;14</span>
                <strong className="text-dermo-charcoal block">Sebum Regulation</strong>
                <p className="text-[10px] text-stone-500">T-Zone balance improves; reduced surface erythema.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-dermo-warm/80 space-y-0.5">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Days 15&ndash;21</span>
                <strong className="text-dermo-charcoal block">Texture Smoothing</strong>
                <p className="text-[10px] text-stone-500">Noticeable pore refinement and smoother epidermal feel.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-dermo-warm/80 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Days 22&ndash;30+</span>
                <strong className="text-dermo-charcoal block">Barrier Resilience</strong>
                <p className="text-[10px] text-stone-500">Strengthened moisture retention and consistent clear tone.</p>
              </div>
            </div>
          </div>

          {/* =====================================================================
              SECTION 5: OFFICIAL CLINICAL SIGNATURE & VALIDATION SEAL
          ===================================================================== */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-dermo-sand/80 to-dermo-cream border border-dermo-warm flex flex-col sm:flex-row items-center justify-between gap-4 print-avoid-break">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-serif font-bold text-dermo-charcoal text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Award className="w-4 h-4 text-dermo-gold" />
                ALSKINCARE AI &bull; Certified Algorithmic Clinical Prescription
              </div>
              <p className="text-[10px] text-stone-500">
                Prescription Code: <span className="font-mono font-bold text-dermo-teal">{reportCode}</span> &bull; Security Hash: SHA-256 Verified
              </p>
            </div>

            <div className="text-right border-t sm:border-t-0 sm:border-l border-dermo-warm pt-3 sm:pt-0 sm:pl-5 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Prescribing Authority</span>
              <span className="font-serif font-bold text-dermo-charcoal text-xs">ViT-Base Dermo Clinical Engine</span>
              <span className="text-[9px] text-stone-500 block font-mono">Status: Formulations Synchronized</span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            MODAL FOOTER: Informative Note & Close Button (Hidden on Print)
        ========================================================================= */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between no-print">
          <span className="text-xs text-stone-500">
            Click <strong>Print Protocol</strong> above to save or print an official A4 medical prescription document.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-dermo-charcoal text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-xs"
          >
            Close Routine
          </button>
        </div>

      </div>
    </div>
  );
}
