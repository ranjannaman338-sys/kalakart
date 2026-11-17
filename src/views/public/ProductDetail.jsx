import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';
import { ProductCard } from '../../components/products/ProductCard';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      setError(null);
      try {
        const res = await productApi.getProduct(productId);
        if (res.success && res.data?.product) {
          setProduct(res.data.product);
          setReviews(res.data.reviews || []);
          setSelectedImage(0);
          setQuantity(1);

          // Fetch related products
          const relRes = await productApi.getRelated(res.data.product._id);
          if (relRes.success) {
            setRelatedProducts(relRes.data.products || []);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProductData();
      window.scrollTo(0, 0);
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 px-4">
        <EmptyState
          title="Product Unavailable"
          description={error || 'The requested handcrafted item could not be found or has been discontinued.'}
          actionText="Browse Marketplace"
          actionLink="/shop"
        />
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-500">
        <Link to="/" className="hover:text-terracotta-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-terracotta-600">Shop</Link>
        {product.categoryId && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.categoryId.slug}`} className="hover:text-terracotta-600">
              {product.categoryId.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-charcoal-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Selected Image */}
          <div className="relative aspect-square max-h-96 rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shadow-sm">
            <img
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-terracotta-500 text-white font-bold text-xs rounded-lg shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images?.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-terracotta-500 ring-2 ring-terracotta-200 scale-95'
                      : 'border-cream-200 hover:border-terracotta-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Artisan & Location Badge */}
          {product.sellerProfileId && (
            <Link
              to={`/artisans/${product.sellerProfileId.slug}`}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cream-100 text-olive-800 text-xs font-semibold hover:bg-cream-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-olive-600" />
              <span>Studio: {product.sellerProfileId.shopName}</span>
              {product.sellerProfileId.location && (
                <span className="text-charcoal-400">({product.sellerProfileId.location})</span>
              )}
            </Link>
          )}

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center space-x-3">
            <RatingStars rating={product.averageRating || 5.0} reviewCount={product.reviewCount || 0} size="md" />
            <span className="text-xs text-charcoal-400">|</span>
            <span className="text-xs text-olive-700 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              100% Genuine Handcrafted
            </span>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-cream-50/80 rounded-2xl border border-cream-200 flex items-baseline space-x-4">
            <span className="font-serif text-3xl font-bold text-charcoal-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-base text-charcoal-400 line-through">
                ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs text-olive-700 font-semibold bg-olive-50 px-2 py-0.5 rounded border border-olive-200">
              Tax included
            </span>
          </div>

          {/* Stock Indicator */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                Currently Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                Only {product.stock} items left in stock — handcrafting more soon
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-olive-700 bg-olive-50 px-2.5 py-1 rounded-md">
                ✓ In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Quantity Selector & CTAs */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-cream-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-2 text-charcoal-600 hover:bg-cream-100 disabled:opacity-30 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-charcoal-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-2 text-charcoal-600 hover:bg-cream-100 disabled:opacity-30 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-terracotta-500/20 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isSaved
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-cream-300 hover:border-red-300 text-charcoal-600 hover:text-red-500 bg-white'
                  }`}
                  title={isSaved ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Reassurance Features */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream-200 text-xs text-charcoal-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-terracotta-500" />
              <span>Free delivery over ₹999</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-terracotta-500" />
              <span>7-day craft exchange</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-terracotta-500" />
              <span>Prep: {product.preparationTime || '2-4 days'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-terracotta-500" />
              <span>Cash on delivery available</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-cream-200 space-y-2">
            <h3 className="font-serif font-bold text-sm text-charcoal-900">
              The Artisan's Notes & Craft Story
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="pt-4 border-t border-cream-200 space-y-3">
            <h3 className="font-serif font-bold text-sm text-charcoal-900">
              Craft Specifications
            </h3>
            <div className="bg-white rounded-xl border border-cream-200 divide-y divide-cream-100 text-xs">
              {product.materials && (
                <div className="flex justify-between py-2.5 px-3.5">
                  <span className="text-charcoal-500 font-medium">Materials</span>
                  <span className="text-charcoal-900 font-semibold">{product.materials}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between py-2.5 px-3.5">
                  <span className="text-charcoal-500 font-medium">Dimensions</span>
                  <span className="text-charcoal-900 font-semibold">{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between py-2.5 px-3.5">
                  <span className="text-charcoal-500 font-medium">Weight</span>
                  <span className="text-charcoal-900 font-semibold">{product.weight}</span>
                </div>
              )}
              {product.preparationTime && (
                <div className="flex justify-between py-2.5 px-3.5">
                  <span className="text-charcoal-500 font-medium">Artisan Prep Time</span>
                  <span className="text-charcoal-900 font-semibold">{product.preparationTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-10 border-t border-cream-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Verified reflections from patrons who ordered this handcrafted piece
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-cream-200 text-center max-w-md mx-auto">
            <p className="text-xs text-charcoal-600 mb-2">
              No customer reviews yet for this newly listed handmade treasure.
            </p>
            <p className="text-[11px] text-charcoal-400">
              Purchased this item? You can submit an authentic review from your completed Orders page!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-cream-200 text-charcoal-800 font-bold text-xs flex items-center justify-center uppercase">
                      {rev.userId?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal-900">{rev.userId?.name || 'Verified Customer'}</p>
                      <p className="text-[10px] text-charcoal-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-cream-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-olive-600">
                You May Also Cherish
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900 mt-1">
                Complementary Handcrafted Pieces
              </h2>
            </div>
            <Link
              to={`/shop?category=${product.categoryId?.slug}`}
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1"
            >
              <span>View More in this Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
