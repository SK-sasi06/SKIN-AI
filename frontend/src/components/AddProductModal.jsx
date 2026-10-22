import React, { useState } from 'react';
import { X, PackagePlus, Calendar, Tag, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Cleanser',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Treatment',
  'Toner',
  'Eye Cream',
  'Face Oil'
];

export default function AddProductModal({ isOpen, onClose, onSaved }) {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Serum');
  const [startDate, setStartDate] = useState('2026-10-22');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }
    setSubmitting(true);
    try {
      await onSaved({
        product_name: productName.trim(),
        brand: brand.trim(),
        category,
        start_date: startDate,
        notes: notes.trim()
      });
      onClose();
      setProductName('');
      setBrand('');
      setNotes('');
    } catch (err) {
      alert(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full border border-dermo-warm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-dermo-tealDark to-dermo-teal p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <PackagePlus className="w-5 h-5 text-dermo-gold" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Add to Vanity Shelf</h2>
              <p className="text-xs text-white/80">Track product start date and active days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Niacinamide 10% + Zinc 1%"
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-sm focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. The Ordinary"
                className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              First Used / Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">
              The app calculates days of active usage from this date to measure indicator progression.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Active Actives & Formulation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Target concern: Redness and sebum control. Use 3 drops AM/PM."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-dermo-warm bg-dermo-cream text-xs focus:outline-none focus:ring-2 focus:ring-dermo-teal/40"
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
              className="px-6 py-2 rounded-full text-xs font-bold text-white bg-dermo-teal hover:bg-dermo-tealDark shadow-md transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
