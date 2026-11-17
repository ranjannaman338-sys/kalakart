import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { EmptyState, LoadingSpinner } from '../../components/common/LoadingAndEmpty';

export function Wishlist() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our curated collection of pottery, wooden crafts, textiles, and jewelry, and save your favorite artisan pieces."
          actionText="Explore Handmade Collection"
          actionLink="/shop"
        />
      </div>
    );
  }

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Handcrafted treasures you have saved for later
          </p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 mt-2 sm:mt-0"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const product = item;
          if (!product) return null;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-cream-50">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                </Link>

                <div className="p-4">
                  <p className="text-[11px] font-medium text-olive-700 truncate mb-1">
                    {product.sellerProfileId?.shopName || 'Artisan Workshop'}
                  </p>
                  <Link
                    to={`/product/${product._id}`}
                    className="block font-serif font-semibold text-charcoal-900 hover:text-terracotta-600 transition-colors text-sm line-clamp-1 mb-2"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-baseline space-x-2">
                    <span className="font-serif font-bold text-base text-charcoal-900">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.compareAtPrice > product.price && (
                      <span className="text-xs text-charcoal-400 line-through">
                        ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full py-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-cream-200 text-white disabled:text-charcoal-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
                </button>

                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="w-full py-1.5 text-xs text-charcoal-500 hover:text-red-600 font-medium flex items-center justify-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
