import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Calendar, Droplets } from 'lucide-react';

const REACTION_TYPES = [
  { label: 'Dryness / Tightness', val: 'Dryness', desc: 'Skin feels taut, stripped, or flaky' },
  { label: 'Irritation / Burning', val: 'Irritation / Burning', desc: 'Stinging sensation after product application' },
  { label: 'Redness / Flushing', val: 'Redness / Flush', desc: 'Noticeable erythema or blotchy vascular warmth' },
  { label: 'Breakout / Purging', val: 'Breakout / Purging', desc: 'Emergence of small papules or pustules' },
  { label: 'Peeling / Flaking', val: 'Peeling / Flaking', desc: 'Desquamation of outer epidermal stratum' },
  { label: 'Itchiness / Pruritus', val: 'Itchiness', desc: 'Sensory tingling or urge to scratch' },
  { label: 'Calm & Balanced', val: 'Calm & Balanced', desc: 'Barrier is resilient and comfortable' }
];

export default function LogReactionModal({ isOpen, onClose, onSaved }) {
  const [logDate, setLogDate] = useState('2026-10-22');
  const [reactionType, setReactionType] = useState('Dryness');
  const [severity, setSeverity] = useState('Mild');
  const [suspectedProduct, setSuspectedProduct] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSaved({
        log_date: logDate,
        reaction_type: reactionType,
        severity,
        suspected_product: suspectedProduct.trim(),
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to log reaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-dermo-warm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-rose-900 to-rose-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Log Skin Reaction</h2>
              <p className="text-xs text-white/80">Record sensitivity, dryness, or irritation signs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Observation Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Reaction Type
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REACTION_TYPES.map(rx => (
                <label
                  key={rx.val}
                  onClick={() => setReactionType(rx.val)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    reactionType === rx.val
                      ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{rx.label}</div>
                    <div className="text-[11px] text-stone-500 font-normal">{rx.desc}</div>
                  </div>
                  <input
                    type="radio"
                    name="rxType"
                    checked={reactionType === rx.val}
                    onChange={() => setReactionType(rx.val)}
                    className="accent-rose-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Observed Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Mild', 'Moderate', 'Severe'].map(sev => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    severity === sev
                      ? sev === 'Mild'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : sev === 'Moderate'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Suspected Trigger or Product
            </label>
            <input
              type="text"
              value={suspectedProduct}
              onChange={(e) => setSuspectedProduct(e.target.value)}
              placeholder="e.g. New Vitamin C Serum, Low humidity, Outdoor AC"
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Notes & Skin Response
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tightness along cheeks 20 mins after cleansing; calmed down after applying ceramide cream."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-full text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-md transition-all"
            >
              {submitting ? 'Saving...' : 'Record Reaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
