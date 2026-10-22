import React, { useState } from 'react';
import { Sparkles, Package } from 'lucide-react';

const FALLBACK_CATEGORY_IMAGES = {
  Moisturizer: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  Cleanser: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  Treatment: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
  'Face Mask': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
  'Eye Cream': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
  Sunscreen: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  'Sun protect': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
};

export default function ProductImage({ src, alt, category, brand, className = '' }) {
  const [hasError, setHasError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const initialSrc = src || FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES.Moisturizer;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  const handleError = () => {
    if (!fallbackAttempted && category && FALLBACK_CATEGORY_IMAGES[category]) {
      setFallbackAttempted(true);
      setCurrentSrc(FALLBACK_CATEGORY_IMAGES[category]);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-dermo-sand via-dermo-cream to-dermo-warm flex flex-col items-center justify-center p-4 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-dermo-teal mb-2">
          <Package className="w-6 h-6 text-dermo-accent" />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-dermo-accent">{brand || 'Dermatology'}</span>
        <span className="text-xs font-serif font-bold text-dermo-charcoal line-clamp-1 mt-0.5">{category || 'Skincare'}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Product formulation'}
      onError={handleError}
      className={`w-full h-full object-cover transition-transform duration-500 ${className}`}
      loading="lazy"
    />
  );
}