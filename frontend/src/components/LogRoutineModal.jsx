import React, { useState, useEffect } from 'react';
import { X, Check, Clock, AlertCircle, Sparkles, Plus, Trash2, Sun, Moon, Shield } from 'lucide-react';

const COMMON_STEPS = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Treatment',
  'Eye Cream',
  'Face Oil'
];

const SKIN_FEEL_OPTIONS = [
  'Comfortable & calm',
  'Hydrated & plump',
  'Slightly dry / tight',
  'Oily T-zone',
  'Slight redness / warm',
  'Smooth & refined'
];

const REACTION_OPTIONS = [
  'Dryness',
  'Redness / Flush',
  'Irritation / Burning',
  'Breakout / Purging',
  'Peeling / Flaking',
  'Itchiness'
];

const MISSED_REASONS = [
  'Forgot planned routine',
  'Too tired / late night',
  'Traveling / away from home',
  'Skin resting / barrier break',
  'Out of skincare product',
  'Other personal reason'
];

export default function LogRoutineModal({ isOpen, onClose, onSaved, onDelete = null, vanityProducts = [], initialData = null }) {
  const [logDate, setLogDate] = useState('2026-10-22');
  const [period, setPeriod] = useState('morning');
  const [isCompleted, setIsCompleted] = useState(true);
  const [missedReason, setMissedReason] = useState('Too tired / late night');
  const [selectedSteps, setSelectedSteps] = useState(['Cleanser', 'Moisturizer', 'Sunscreen']);
  const [productsUsed, setProductsUsed] = useState([]);
  const [applicationTime, setApplicationTime] = useState('08:30 AM');
  const [skinFeel, setSkinFeel] = useState('Comfortable & calm');
  const [selectedReactions, setSelectedReactions] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate when opening or changing period
  useEffect(() => {
    if (initialData) {
      setLogDate(initialData.log_date || '2026-10-22');
      setPeriod(initialData.period || 'morning');
      setIsCompleted(initialData.is_completed !== false);
      setMissedReason(initialData.missed_reason || 'Too tired / late night');
      setSelectedSteps(initialData.steps && initialData.steps.length > 0 
        ? initialData.steps 
        : (initialData.period === 'evening' ? ['Cleanser', 'Moisturizer'] : ['Cleanser', 'Moisturizer', 'Sunscreen']));
      setProductsUsed(initialData.products || []);
      setApplicationTime(initialData.products?.[0]?.time || (initialData.period === 'evening' ? '10:00 PM' : '08:30 AM'));
      setSkinFeel(initialData.skin_feel || 'Comfortable & calm');
      setSelectedReactions(initialData.reactions || []);
      setNotes(initialData.notes || '');
    } else {
      if (period === 'morning') {
        setSelectedSteps(['Cleanser', 'Moisturizer', 'Sunscreen']);
        setApplicationTime('08:30 AM');
      } else {
        setSelectedSteps(['Cleanser', 'Serum', 'Moisturizer']);
        setApplicationTime('10:00 PM');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleStep = (step) => {
    setSelectedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const toggleReaction = (rx) => {
    setSelectedReactions(prev => 
      prev.includes(rx) ? prev.filter(r => r !== rx) : [...prev, rx]
    );
  };

  const addProductFromVanity = (prod) => {
    const existing = productsUsed.find(p => p.name === prod.product_name);
    if (!existing) {
      setProductsUsed(prev => [
        ...prev,
        {
          name: prod.product_name,
          brand: prod.brand || '',
          category: prod.category || 'Treatment',
          time: applicationTime
        }
      ]);
    }
  };

  const addCustomProduct = () => {
    setProductsUsed(prev => [
      ...prev,
      {
        name: 'New Product',
        brand: '',
        category: 'Serum',
        time: applicationTime
      }
    ]);
  };

  const updateProductItem = (index, field, value) => {
    setProductsUsed(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeProduct = (index) => {
    setProductsUsed(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        log_date: logDate,
        period,
        is_completed: isCompleted,
        missed_reason: isCompleted ? null : missedReason,
        steps: isCompleted ? selectedSteps : [],
        products: isCompleted ? productsUsed : [],
        skin_feel: isCompleted ? skinFeel : '',
        reactions: selectedReactions,
        notes
      };
      await onSaved(payload);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save routine log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-dermo-warm shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-dermo-tealDark to-dermo-teal p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {period === 'morning' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-sky-200" />}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">
                {initialData?.id ? 'Edit Skincare Routine' : 'Record Skincare Routine'}
              </h2>
              <p className="text-xs text-white/80">
                {initialData?.id ? 'Update products, steps, or skin feedback for this session' : 'Track today\'s products, application time, and skin feel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Date & Period Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Routine Date
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-sm focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Session Time of Day
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod('morning')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    period === 'morning'
                      ? 'bg-amber-500/10 border-amber-400 text-amber-800'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Morning (AM)
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('evening')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    period === 'evening'
                      ? 'bg-dermo-teal/10 border-dermo-teal text-dermo-teal'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Evening (PM)
                </button>
              </div>
            </div>
          </div>

          {/* Routine Status Toggle */}
          <div className="p-4 rounded-2xl bg-dermo-sand/60 border border-dermo-warm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-dermo-charcoal">Routine Status</span>
              <p className="text-xs text-stone-500">Did you complete your planned skincare routine?</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompleted(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  !isCompleted
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                Missed / Skipped
              </button>
            </div>
          </div>

          {/* If Missed: Reason selection */}
          {!isCompleted && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Missed Routine Reason (Helps AI analyze barrier patterns)</span>
              </div>
              <select
                value={missedReason}
                onChange={(e) => setMissedReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {MISSED_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* If Completed: Steps, Products, Time */}
          {isCompleted && (
            <>
              {/* Routine Steps Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Completed Routine Steps
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_STEPS.map(step => {
                    const isSelected = selectedSteps.includes(step);
                    return (
                      <button
                        type="button"
                        key={step}
                        onClick={() => toggleStep(step)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-dermo-teal text-white border-dermo-teal shadow-xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-dermo-teal/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-dermo-gold" />}
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time of Application */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Time of Application
                </label>
                <input
                  type="text"
                  value={applicationTime}
                  onChange={(e) => setApplicationTime(e.target.value)}
                  placeholder="e.g. 08:30 AM or 10:15 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-sm focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
                />
              </div>

              {/* Vanity Shelf Products Quick Selector */}
              {vanityProducts.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Quick Add from Vanity Shelf
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vanityProducts.map(p => {
                      const isAdded = productsUsed.some(pu => pu.name === p.product_name);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => addProductFromVanity(p)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <Plus className="w-3 h-3 text-stone-400" />
                          <span>{p.product_name}</span>
                          <span className="text-[10px] text-stone-400">({p.category})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products Detailed List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Specific Products Applied ({productsUsed.length})
                  </label>
                  <button
                    type="button"
                    onClick={addCustomProduct}
                    className="text-xs font-semibold text-dermo-teal hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Custom Product
                  </button>
                </div>

                {productsUsed.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-400">
                    No individual products logged yet. Click "+ Add Custom Product" or select from vanity shelf above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productsUsed.map((prod, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-dermo-cream border border-dermo-warm flex items-center gap-2">
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) => updateProductItem(idx, 'name', e.target.value)}
                          placeholder="Product Name"
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white"
                        />
                        <input
                          type="text"
                          value={prod.brand}
                          onChange={(e) => updateProductItem(idx, 'brand', e.target.value)}
                          placeholder="Brand (optional)"
                          className="w-28 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeProduct(idx)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skin Feel Feedback */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Skin Feel Observation
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_FEEL_OPTIONS.map(feel => (
                    <button
                      type="button"
                      key={feel}
                      onClick={() => setSkinFeel(feel)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        skinFeel === feel
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Skin Reactions */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Skin Reactions (Dryness, Irritation, Redness)</span>
              <span className="text-[10px] text-stone-400 font-normal">Select any notable signs</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REACTION_OPTIONS.map(rx => {
                const isSelected = selectedReactions.includes(rx);
                return (
                  <button
                    type="button"
                    key={rx}
                    onClick={() => toggleReaction(rx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {rx}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Personal Notes & Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Skin felt slightly dry after air conditioned office. Added barrier moisturizer."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            {initialData?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this routine entry?')) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Routine
              </button>
            ) : (
              <div></div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-dermo-teal hover:bg-dermo-tealDark shadow-md transition-all flex items-center gap-2"
              >
                {submitting ? 'Saving...' : initialData?.id ? 'Update Routine' : 'Save Routine'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
