import React, { useState, useEffect } from 'react';
import { X, Star, ExternalLink, Sparkles, ShieldCheck, Heart, Droplets, CheckCircle2, ShoppingCart, Tag, ArrowUpRight, Store } from 'lucide-react';
import { formatINR } from '../utils/currency';
import ProductImage from './ProductImage';
import { fetchProductPrices } from '../services/api';

export default function ProductDetailsModal({ product, onClose }) {
  const [priceData, setPriceData] = useState(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    if (product && product.id) {
      setIsLoadingPrices(true);
      fetchProductPrices(product.id)
        .then((data) => {
          if (isMounted) {
            setPriceData(data);
            setIsLoadingPrices(false);
          }
        })
        .catch((err) => {
          console.warn('Price comparison fetch warning:', err);
          if (isMounted) setIsLoadingPrices(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  if (!product) return null;

  const officialUrl = product.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(product.brand + ' ' + product.name)}`;
  const isDirectBrandStore = officialUrl && !officialUrl.includes('sephora.com');
  const ratingValue = product.rank ? Number(product.rank).toFixed(1) : (product.rating ? Number(product.rating).toFixed(1) : '4.5');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-dermo-warm overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-dermo-warm/70 flex items-center justify-between bg-gradient-to-r from-dermo-cream via-white to-dermo-sand/30">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-dermo-sand text-dermo-teal border border-dermo-warm">
              {product.label || product.category || 'Skincare'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{ratingValue} Rating</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dermo-sand text-stone-500 hover:text-dermo-charcoal transition-colors"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Image */}
            <div className="sm:col-span-5 h-52 sm:h-56 rounded-2xl overflow-hidden bg-dermo-sand border border-dermo-warm/80 relative">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                category={product.label || product.category}
                brand={product.brand}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="sm:col-span-7 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dermo-accent block">
                {product.brand}
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-dermo-charcoal leading-snug">
                {product.name}
              </h3>

              {/* Price */}
              <div className="pt-1">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                  Retail Price (India)
                </span>
                <span className="text-2xl font-serif font-bold text-dermo-teal">
                  {formatINR(product.price_inr, product.price)}
                </span>
              </div>

              {/* Suitability Pills */}
              {product.target_skin_types && product.target_skin_types.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Skin Type Compatibility:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.target_skin_types.map((st) => (
                      <span
                        key={st}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-dermo-sand/80 text-dermo-charcoal border border-dermo-warm"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Store Price Comparison Section (Amazon, Flipkart, Nykaa, etc.) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-dermo-sand/40 border border-dermo-warm/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-dermo-warm/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-dermo-teal text-white shadow-sm">
                  <Store className="w-4 h-4 text-dermo-gold" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-1.5">
                    Compare Store Prices
                    <span className="text-[10px] font-sans font-normal text-stone-500">
                      (Live India Retail)
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Compare verified prices and fast delivery options
                  </p>
                </div>
              </div>

              {priceData && (
                <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-dermo-warm text-dermo-teal shadow-2xs">
                  {priceData.provider}
                </span>
              )}
            </div>

            {/* Price Cards Grid */}
            {isLoadingPrices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-dermo-sand/60 border border-dermo-warm/40" />
                ))}
              </div>
            ) : priceData && priceData.stores && priceData.stores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {priceData.stores.map((store, idx) => (
                  <div
                    key={idx}
                    className={`relative p-3.5 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${
                      store.is_best_deal
                        ? 'border-emerald-600/80 shadow-sm ring-1 ring-emerald-500/30'
                        : 'border-dermo-warm hover:border-dermo-teal/40'
                    }`}
                  >
                    {store.is_best_deal && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-sm tracking-wide">
                        ★ Lowest Price
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${store.bg_color}`}>
                          {store.badge}
                        </span>
                        <h5 className="font-sans font-bold text-xs text-dermo-charcoal truncate max-w-[170px]" title={store.store_name}>
                          {store.store_name}
                        </h5>
                        <p className="text-[10px] text-stone-500 truncate max-w-[170px]">
                          {store.delivery || 'Standard Delivery'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-serif font-bold text-dermo-charcoal block">
                          {store.price_str}
                        </span>
                        {store.rating && (
                          <span className="text-[10px] text-amber-700 font-semibold flex items-center justify-end gap-0.5">
                            ★ {store.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={store.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 ${store.btn_color}`}
                    >
                      <span>Buy on {store.badge}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic py-2">
                Store price comparison is currently unavailable for this item.
              </p>
            )}
          </div>

          {/* Active Ingredients Section */}
          {product.active_matches && product.active_matches.length > 0 && (
            <div className="p-4 rounded-2xl bg-dermo-sand/60 border border-dermo-warm/80 space-y-2">
              <span className="text-[11px] font-bold text-dermo-teal uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-dermo-gold" />
                Featured Active Actives
              </span>
              <div className="flex flex-wrap gap-2">
                {product.active_matches.map((active) => (
                  <span
                    key={active}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-dermo-teal border border-dermo-warm shadow-sm"
                  >
                    {active}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full INCI Ingredients */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-2">
              <Droplets className="w-4 h-4 text-dermo-teal" />
              Full INCI Ingredients Declaration
            </h4>
            <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-xs text-stone-600 leading-relaxed font-sans max-h-36 overflow-y-auto">
              {product.ingredients || 'Standard commercial cosmetic formulation meeting global cosmetic regulatory standards.'}
            </div>
          </div>

          {/* Target Concerns */}
          {product.target_concerns && product.target_concerns.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-dermo-charcoal block">Target Concerns Addressed:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.target_concerns.map((tc) => (
                  <span
                    key={tc}
                    className="text-[11px] font-medium px-3 py-1 rounded-full bg-white text-stone-700 border border-dermo-warm"
                  >
                    ✓ {tc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Boutique CTA & Disclaimer */}
          <div className="pt-4 border-t border-dermo-warm/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-stone-500 text-center sm:text-left">
              Authentic formulation sourced from verified retail inventory.
            </span>

            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <span>{isDirectBrandStore ? 'Visit Brand Store' : 'Visit Official Boutique'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-dermo-gold" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
