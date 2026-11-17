import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { EmptyState } from '../../components/common/LoadingAndEmpty';

export function Cart() {
  const { items, subtotal, shippingAmount, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any artisanal treasures to your bag yet. Browse our handmade catalog to discover unique creations."
          actionText="Start Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Shopping Cart</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Review your selected handmade goods before secure checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline font-semibold mt-2 sm:mt-0"
        >
          Clear entire cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const pId = item.productId?._id || item.productId;
            const isOutOfStock = item.stock <= 0;

            return (
              <div
                key={pId}
                className="bg-white rounded-2xl border border-cream-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${pId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-cream-50 flex-shrink-0 border border-cream-100"
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                  </Link>

                  {/* Info */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-olive-700">
                      {item.seller?.shopName || 'Artisan Workshop'}
                    </p>
                    <Link
                      to={`/product/${pId}`}
                      className="font-serif font-bold text-sm sm:text-base text-charcoal-900 hover:text-terracotta-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-baseline space-x-2 text-xs">
                      <span className="font-semibold text-charcoal-900">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      {item.compareAtPrice > item.price && (
                        <span className="text-charcoal-400 line-through">
                          ₹{Number(item.compareAtPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {isOutOfStock && (
                      <span className="inline-block text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Currently Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-100">
                  <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-white mb-2">
                    <button
                      onClick={() => updateQuantity(pId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-charcoal-600 hover:bg-cream-100 disabled:opacity-30 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-charcoal-900 min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(pId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2.5 py-1 text-charcoal-600 hover:bg-cream-100 disabled:opacity-30 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(pId)}
                      className="text-charcoal-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-cream-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <div className="flex items-center space-x-1">
                  <span>Shipping Fee</span>
                  {shippingAmount === 0 && (
                    <span className="text-[10px] font-bold text-olive-700 bg-olive-50 px-1.5 py-0.2 rounded">
                      FREE
                    </span>
                  )}
                </div>
                <span className="font-semibold text-charcoal-900">
                  {shippingAmount === 0 ? '₹0' : `₹${shippingAmount}`}
                </span>
              </div>

              {subtotal < 999 && (
                <div className="p-2.5 bg-terracotta-50 rounded-xl text-[11px] text-terracotta-700 flex items-center space-x-2">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Add ₹{999 - subtotal} more of handmade goods for <strong>Free Delivery</strong>!
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-cream-100 flex justify-between text-sm font-bold text-charcoal-900">
                <span className="font-serif text-base">Estimated Total</span>
                <span className="font-serif text-xl text-terracotta-600">
                  ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-terracotta-500/20 flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-[11px] text-charcoal-500 pt-2 border-t border-cream-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-olive-600" />
                <span>Cash on delivery available at checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-olive-600" />
                <span>100% verified artisan handcrafted items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
