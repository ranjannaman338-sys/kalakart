import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { SafeImage } from '../common/SafeImage';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isSaved = isInWishlist(product._id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-cream-200/90 hover:border-terracotta-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <Link to={`/product/${product._id}`} className="relative block overflow-hidden bg-cream-50 aspect-square">
          <SafeImage
            src={product.images?.[0]}
            alt={product.name}
            type="product"
            imgClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            className="w-full h-full"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
            {discountPercent && (
              <span className="px-2 py-0.5 bg-terracotta-500 text-white text-[11px] font-bold rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 bg-charcoal-800 text-white text-[11px] font-bold rounded-md shadow-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
              isSaved
                ? 'bg-red-50 text-red-500 shadow-sm'
                : 'bg-white/80 hover:bg-white text-charcoal-600 hover:text-red-500 shadow-sm'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
          </button>
        </Link>

        {/* Product Details */}
        <div className="p-4">
          {/* Artisan & Category Tag */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-1.5">
            <span className="truncate max-w-[150px] font-medium text-olive-700">
              {product.sellerProfileId?.shopName || 'Artisan Workshop'}
            </span>
            {product.categoryId?.name && (
              <span className="text-charcoal-400 truncate max-w-[100px]">
                {product.categoryId.name}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product._id}`}
            className="block font-serif font-semibold text-charcoal-900 group-hover:text-terracotta-600 transition-colors text-base line-clamp-1 mb-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars rating={product.averageRating || 5.0} reviewCount={product.reviewCount || 0} size="sm" />
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-cream-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif font-bold text-lg text-charcoal-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-charcoal-400 line-through">
                ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isOutOfStock
              ? 'bg-cream-200 text-charcoal-400 cursor-not-allowed'
              : 'bg-cream-100 hover:bg-terracotta-500 text-charcoal-800 hover:text-white border border-cream-300 hover:border-terracotta-500 shadow-sm'
          }`}
          title={isOutOfStock ? 'Currently out of stock' : 'Add to shopping cart'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}
