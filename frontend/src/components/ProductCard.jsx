import React from 'react';
import { Star, ExternalLink, Sparkles, Store } from 'lucide-react';
import { formatINR } from '../utils/currency';
import ProductImage from './ProductImage';

export default function ProductCard({ product, onSelect }) {
  const officialUrl = product.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(product.brand + ' ' + product.name)}`;
  const isDirectBrandStore = officialUrl && !officialUrl.includes('sephora.com');

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white border border-dermo-warm/90 hover:border-dermo-teal/40 transition-all duration-300 hover:shadow-xl hover:shadow-dermo-teal/5 overflow-hidden group">
      {/* Product Image Banner */}
      <div 
        className={`relative h-44 w-full bg-dermo-sand overflow-hidden ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={() => onSelect && onSelect(product)}
      >
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.label || product.category}
          brand={product.brand}
          className="group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/95 text-dermo-teal backdrop-blur-sm shadow-sm border border-dermo-warm/50">
            {product.label || product.category}
          </span>
          {product.match_score && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-emerald-700 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              {product.match_score}% Match
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 rounded-full text-xs font-bold text-amber-700 flex items-center gap-1 shadow-sm border border-dermo-warm/50">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{product.rank ? Number(product.rank).toFixed(1) : (product.rating ? Number(product.rating).toFixed(1) : '4.5')}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold text-dermo-accent tracking-wider uppercase">
              {product.brand}
            </p>
            {product.budget_tier && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                product.budget_tier.id === 'budget' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : product.budget_tier.id === 'mid'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {product.budget_tier.label.split('/')[0].trim()}
              </span>
            )}
          </div>
          <h4 className="font-serif font-bold text-base text-dermo-charcoal group-hover:text-dermo-teal transition-colors line-clamp-2">
            {product.name}
          </h4>

          {product.match_reason && (
            <p className="text-xs text-dermo-sage bg-dermo-sageLight/50 p-2.5 rounded-xl border border-dermo-sage/20 leading-relaxed">
              <strong className="text-dermo-teal font-medium">Why it fits:</strong> {product.match_reason}
            </p>
          )}

          {product.active_matches && product.active_matches.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.active_matches.map((active) => (
                <span
                  key={active}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-dermo-sand text-dermo-teal border border-dermo-warm flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-dermo-gold" />
                  {active}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-stone-500 line-clamp-2 pt-1 font-sans leading-relaxed">
            {product.ingredients || 'Verified commercial cosmetic formulation.'}
          </p>
        </div>

        {/* Footer & Purchase CTA */}
        <div className="space-y-3 pt-3 border-t border-dermo-warm/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-stone-500 block uppercase font-medium">Retail Price</span>
              <span className="text-base font-bold text-dermo-charcoal">
                {formatINR(product.price_inr, product.price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className="px-3 py-2 rounded-xl bg-dermo-sand hover:bg-dermo-warm text-dermo-charcoal text-xs font-semibold border border-dermo-warm transition-all"
                  title="Compare Store Prices & Details"
                >
                  Compare Prices
                </button>
              )}
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dermo-teal hover:bg-dermo-tealDark text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                title={`Visit Official Store for ${product.name}`}
              >
                <span>{isDirectBrandStore ? 'Brand Store' : 'Visit Store'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-dermo-gold" />
              </a>
            </div>
          </div>

          {/* Multi-Store Quick Links Row */}
          <div className="pt-2 border-t border-dermo-warm/50 flex items-center justify-between gap-1 text-[10px] flex-wrap">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
              <Store className="w-3 h-3 text-dermo-teal" />
              Buy On:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <a
                href={`https://www.amazon.in/s?k=${encodeURIComponent((product.brand + ' ' + product.name).trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition-colors"
                title="Search and Buy on Amazon India"
              >
                Amazon
              </a>
              <a
                href={`https://www.flipkart.com/search?q=${encodeURIComponent((product.brand + ' ' + product.name).trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition-colors"
                title="Search and Buy on Flipkart"
              >
                Flipkart
              </a>
              <a
                href={`https://www.nykaa.com/search/result/?q=${encodeURIComponent((product.brand + ' ' + product.name).trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold border border-pink-200 transition-colors"
                title="Search and Buy on Nykaa"
              >
                Nykaa
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}