import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { couponApi } from '../../api/otherApi';
import { authApi } from '../../api/authApi';
import {
  MapPin,
  Tag,
  CreditCard,
  Truck,
  ShieldCheck,
  Check,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function Checkout() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Pricing & Payment State
  const [pricing, setPricing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Idempotency key generated once per checkout session
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Load saved addresses
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await authApi.getAddresses();
        if (res.success && res.data?.addresses?.length > 0) {
          setSavedAddresses(res.data.addresses);
          const defaultIdx = res.data.addresses.findIndex((a) => a.isDefault);
          setSelectedAddressIndex(defaultIdx >= 0 ? defaultIdx : 0);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        setIsAddingNewAddress(true);
      }
    }
    loadAddresses();
  }, []);

  // Validate and recalculate pricing with backend
  useEffect(() => {
    async function validateOrderPricing() {
      if (!items || items.length === 0) {
        navigate('/cart');
        return;
      }

      setLoadingPricing(true);
      try {
        const res = await orderApi.validateCheckout({
          couponCode: appliedCoupon ? appliedCoupon.code : '',
        });
        if (res.success) {
          setPricing(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Pricing validation failed');
      } finally {
        setLoadingPricing(false);
      }
    }

    validateOrderPricing();
  }, [appliedCoupon, items, navigate]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const res = await couponApi.validateCoupon(
        couponCode.trim(),
        pricing?.subtotal || 0
      );
      if (res.success) {
        setAppliedCoupon(res.data);
        toast.success(res.data.message || 'Coupon applied successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    let finalAddress;
    if (isAddingNewAddress || savedAddresses.length === 0) {
      if (
        !addressForm.name ||
        !addressForm.phone ||
        !addressForm.street ||
        !addressForm.city ||
        !addressForm.state ||
        !addressForm.postalCode
      ) {
        toast.error('Please fill in all required delivery address fields.');
        return;
      }
      finalAddress = addressForm;
    } else {
      finalAddress = savedAddresses[selectedAddressIndex];
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        address: {
          name: finalAddress.name,
          phone: finalAddress.phone,
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state,
          postalCode: finalAddress.postalCode,
          country: finalAddress.country || 'India',
        },
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        paymentMethod,
        idempotencyKey,
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.success && res.data) {
        const order = res.data;

        // If Razorpay online payment was selected
        if (paymentMethod === 'RAZORPAY') {
          try {
            const rzpRes = await orderApi.createRazorpayOrder(order._id);
            if (rzpRes.success) {
              toast.info('Razorpay test payment order initialized. Redirecting to invoice.');
            }
          } catch (e) {
            toast.error('Razorpay test gateway unavailable; order placed with Cash on Delivery fallback.');
          }
        }

        await clearCart();
        toast.success('Order placed successfully! Thank you for supporting our artisans.');
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please review your cart.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Checkout</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Complete your delivery details and choose your preferred payment option
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Delivery Address, Coupons, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Delivery Address Section */}
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-terracotta-500" />
                <h2 className="font-serif font-bold text-base text-charcoal-900">
                  1. Delivery Address
                </h2>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewAddress ? 'Select Saved' : 'Add New'}</span>
                </button>
              )}
            </div>

            {/* Select from Saved Addresses */}
            {!isAddingNewAddress && savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-terracotta-500 bg-terracotta-50/40 ring-2 ring-terracotta-200'
                        : 'border-cream-200 hover:border-cream-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="mt-1 text-terracotta-600 focus:ring-terracotta-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-charcoal-900">{addr.name}</p>
                          <p className="text-charcoal-600 mt-0.5">{addr.street}</p>
                          <p className="text-charcoal-600">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-charcoal-500 mt-1">Phone: {addr.phone}</p>
                        </div>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-olive-700 bg-olive-100 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* New Address Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="Recipient's full name"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-charcoal-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="Flat/House No., Street, Landmark"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="e.g. 560038"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-200 rounded-lg text-charcoal-500 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Coupon Discount Section */}
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-cream-100">
              <Tag className="w-5 h-5 text-terracotta-500" />
              <h2 className="font-serif font-bold text-base text-charcoal-900">
                2. Discount Coupon
              </h2>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3.5 bg-olive-50 border border-olive-200 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-olive-800">
                    Coupon "{appliedCoupon.code}" Applied!
                  </p>
                  <p className="text-[11px] text-olive-600 mt-0.5">
                    Saved ₹{appliedCoupon.discountAmount} on this order
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10, KALA15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs uppercase font-semibold focus:outline-none focus:border-terracotta-500"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-5 py-2 bg-charcoal-800 hover:bg-charcoal-900 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </form>
            )}

            <p className="text-[11px] text-charcoal-400">
              Try demo coupons: <strong>WELCOME10</strong> (10% off) or <strong>KALA15</strong> (15% off orders over ₹1200)
            </p>
          </div>

          {/* 3. Payment Method Section */}
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-cream-100">
              <CreditCard className="w-5 h-5 text-terracotta-500" />
              <h2 className="font-serif font-bold text-base text-charcoal-900">
                3. Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-terracotta-500 bg-terracotta-50/40 ring-2 ring-terracotta-200'
                    : 'border-cream-200 hover:border-cream-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-terracotta-600 focus:ring-terracotta-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-charcoal-900 flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-terracotta-600" />
                      <span>Cash on Delivery (Recommended)</span>
                    </p>
                    <p className="text-[11px] text-charcoal-500 mt-1 leading-relaxed">
                      Pay easily in cash or UPI QR at your doorstep upon safe delivery.
                    </p>
                  </div>
                </div>
              </label>

              {/* Online Payment (Razorpay Test Mode) */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-terracotta-500 bg-terracotta-50/40 ring-2 ring-terracotta-200'
                    : 'border-cream-200 hover:border-cream-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-terracotta-600 focus:ring-terracotta-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-charcoal-900 flex items-center space-x-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Razorpay Online Payment (UPI / Cards / NetBanking)</span>
                    </p>
                    <p className="text-[11px] text-charcoal-500 mt-1 leading-relaxed">
                      Secure encrypted server verification. (Operates in Test Mode when keys are configured).
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-cream-100">
              Verified Order Summary
            </h2>

            {loadingPricing ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                {/* Items list snapshot */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {pricing?.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center space-x-3 truncate">
                        <img
                          src={it.productImageSnapshot || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                          alt={it.productNameSnapshot}
                          className="w-10 h-10 rounded-lg object-cover bg-cream-50 flex-shrink-0"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                        <div className="truncate">
                          <p className="font-semibold text-charcoal-900 truncate">
                            {it.productNameSnapshot}
                          </p>
                          <p className="text-charcoal-500 text-[11px]">
                            Qty: {it.quantity} × ₹{it.unitPriceSnapshot}
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-charcoal-900 ml-4 flex-shrink-0">
                        ₹{Number(it.lineTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-cream-100 text-xs">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-charcoal-900">
                      ₹{Number(pricing?.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-charcoal-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-charcoal-900">
                      {pricing?.shippingAmount === 0 ? (
                        <span className="text-olive-700 font-bold">FREE</span>
                      ) : (
                        `₹${pricing?.shippingAmount}`
                      )}
                    </span>
                  </div>

                  {pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-olive-700 font-semibold">
                      <span>Discount Coupon</span>
                      <span>-₹{pricing.discountAmount}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-cream-100 flex justify-between text-sm font-bold text-charcoal-900">
                    <span className="font-serif text-base">Final Total</span>
                    <span className="font-serif text-xl text-terracotta-600">
                      ₹{Number(pricing?.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder || !pricing}
                  className="w-full py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-terracotta-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {submittingOrder ? 'Placing Order...' : `Confirm & Place Order (₹${Number(pricing?.totalAmount || 0).toLocaleString('en-IN')})`}
                  </span>
                </button>

                <p className="text-[11px] text-center text-charcoal-400">
                  By confirming your order, you directly support local artisan communities and fair rural trade.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
