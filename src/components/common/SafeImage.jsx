/**
 * SafeImage — an <img> wrapper that gracefully falls back to a category-
 * appropriate placeholder whenever the src URL fails to load.
 *
 * Usage:
 *   <SafeImage src={url} alt="..." type="product" className="..." />
 *
 * `type` values:
 *   "product"   → artisan craft placeholder
 *   "category"  → craft-category placeholder
 *   "artisan"   → artisan portrait placeholder
 *   "banner"    → wide shop banner placeholder
 *   "avatar"    → small circular user placeholder
 *   "logo"      → small square shop-logo placeholder
 */
import React, { useState } from 'react';
import { Package, User, Store, Image } from 'lucide-react';

// High-quality, freely embeddable fallback images (Picsum / Unsplash)
const FALLBACKS = {
  product:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
  category: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=600&auto=format&fit=crop',
  artisan:  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=crop',
  banner:   'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
  avatar:   'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=200&auto=format&fit=crop',
  logo:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=200&auto=format&fit=crop',
};

// Inline SVG placeholder rendered when even the fallback URL fails
function PlaceholderBox({ type = 'product', className = '' }) {
  const Icon = type === 'artisan' || type === 'avatar' ? User : type === 'logo' ? Store : Package;
  return (
    <div
      className={`flex flex-col items-center justify-center bg-cream-100 text-cream-400 ${className}`}
      aria-hidden="true"
    >
      <Icon className="w-1/4 h-1/4 opacity-40" strokeWidth={1.2} />
    </div>
  );
}

export function SafeImage({
  src,
  alt = '',
  type = 'product',
  className = '',
  imgClassName = '',
  style,
  loading = 'lazy',
  ...rest
}) {
  const [currentSrc, setCurrentSrc] = useState(src || null);
  const [triedFallback, setTriedFallback] = useState(false);
  const [failed, setFailed] = useState(!src); // immediately failed if no src

  const handleError = () => {
    if (!triedFallback) {
      // First failure → try category-specific fallback
      const fb = FALLBACKS[type] || FALLBACKS.product;
      if (currentSrc !== fb) {
        setTriedFallback(true);
        setCurrentSrc(fb);
        return;
      }
    }
    // Both src and fallback failed → show inline placeholder
    setFailed(true);
  };

  if (failed) {
    return <PlaceholderBox type={type} className={`${className} ${imgClassName}`} style={style} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={imgClassName || className}
      style={style}
      loading={loading}
      onError={handleError}
      {...rest}
    />
  );
}

export default SafeImage;
