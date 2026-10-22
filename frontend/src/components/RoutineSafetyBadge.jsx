import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Sparkles, Clock, CheckCircle2, ChevronDown, ChevronUp, Layers, Info } from 'lucide-react';

export default function RoutineSafetyBadge({ safetyReport }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!safetyReport) return null;

  const {
    overall_status,
    status_code,
    status_color,
    status_summary,
    conflicts = [],
    cautions = [],
    synergies = [],
    timing_tips = [],
    active_inventory = { morning: {}, evening: {} }
  } = safetyReport;

  const isConflict = status_code === 'conflict';
  const isCaution = status_code === 'caution';
  const isSafe = status_code === 'safe';

  // Styling based on status
  const badgeBg = isConflict
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : isCaution
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900';

  const iconColor = isConflict
    ? 'text-rose-600'
    : isCaution
    ? 'text-amber-600'
    : 'text-emerald-600';

  const statusPillBg = isConflict
    ? 'bg-rose-600 text-white'
    : isCaution
    ? 'bg-amber-600 text-white'
    : 'bg-emerald-700 text-white';

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${badgeBg}`}>
      {/* Header Banner */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-black/[0.02]"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/80 shadow-sm border border-black/5">
            {isConflict ? (
              <AlertOctagon className={`w-6 h-6 ${iconColor}`} />
            ) : isCaution ? (
              <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
            ) : (
              <ShieldCheck className={`w-6 h-6 ${iconColor}`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusPillBg}`}>
                {overall_status}
              </span>
              <span className="text-xs font-semibold text-stone-600">
                Active Ingredient Layering Check
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium mt-1 text-stone-800">
              {status_summary}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-black/10 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-white"
        >
          <span>{isOpen ? 'Hide Breakdown' : 'View Safety Breakdown'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Clinical Breakdown */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-black/5 space-y-4 bg-white/60">
          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                Detected Active Conflicts (Require Spacing)
              </h4>
              <div className="space-y-2">
                {conflicts.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-300/80 text-xs text-rose-900 space-y-1">
                    <div className="font-bold">{c.title}</div>
                    <p className="leading-relaxed text-rose-800/90">{c.description}</p>
                    <div className="mt-2 text-[11px] font-semibold text-rose-950 bg-rose-200/60 p-2 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Dermatologist Solution:</strong> {c.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cautions */}
          {cautions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Layering Precautions
              </h4>
              <div className="space-y-2">
                {cautions.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-xs text-amber-900 space-y-1">
                    <div className="font-bold">{c.title}</div>
                    <p className="leading-relaxed text-amber-800/90">{c.description}</p>
                    <div className="mt-2 text-[11px] font-semibold text-amber-950 bg-amber-200/60 p-2 rounded-lg flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Guideline:</strong> {c.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synergies */}
          {synergies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Active Ingredient Synergies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {synergies.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-300/70 text-xs text-emerald-950 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center justify-between">
                      <span>{s.title}</span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-semibold">{s.status}</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Inventory (Morning vs Evening) */}
          <div className="pt-2 border-t border-black/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              Active Ingredients Present in Your Regimen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <div className="font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                  <span>AM Actives (Morning)</span>
                </div>
                {Object.keys(active_inventory.morning || {}).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(active_inventory.morning).map(([name, prods]) => (
                      <span key={name} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium" title={prods.join(', ')}>
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-400 text-xs italic">Gentle barrier maintenance actives only</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <div className="font-bold text-indigo-700 mb-1.5 flex items-center gap-1">
                  <span>PM Actives (Evening)</span>
                </div>
                {Object.keys(active_inventory.evening || {}).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(active_inventory.evening).map(([name, prods]) => (
                      <span key={name} className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-medium" title={prods.join(', ')}>
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-400 text-xs italic">Gentle barrier maintenance actives only</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
