import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { reviewApi } from '../../api/otherApi';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  Star,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { OrderStatusTimeline } from '../../components/common/OrderStatusTimeline';
import { RatingStars } from '../../components/common/RatingStars';
import { ConfirmationModal } from '../../components/common/ModalsAndPagination';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');
  const [cancelling, setCancelling] = useState(false);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getOrder(orderId);
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
        setReviews(res.data.reviews || []);
      } else {
        setError('Order not found or access denied.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(orderId, cancelReason);
      if (res.success) {
        toast.success('Your order has been cancelled and inventory has been restored.');
        setCancelModalOpen(false);
        fetchOrderDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReview = (product) => {
    setReviewTargetProduct(product);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment || reviewComment.length < 5) {
      toast.error('Please write at least 5 characters in your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewApi.submitReview({
        productId: reviewTargetProduct.productId,
        orderId: order._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success('Your review has been published! Thank you for supporting the artisan.');
        setReviewModalOpen(false);
        fetchOrderDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 px-4">
        <EmptyState
          title="Order Not Found"
          description={error || 'We could not find the specified order under your account.'}
          actionText="View All Orders"
          actionLink="/orders"
        />
      </div>
    );
  }

  const isEligibleForCancellation = ['ORDER_PLACED', 'CONFIRMED'].includes(order.orderStatus);
  const isDelivered = order.orderStatus === 'DELIVERED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Back Link & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/orders"
            className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal-900">
              Order #{order._id.substring(order._id.length - 8).toUpperCase()}
            </h1>
            <p className="text-xs text-charcoal-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {isEligibleForCancellation && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Visual Tracking Progress Timeline */}
      <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
        <h2 className="font-serif font-bold text-sm text-charcoal-900 uppercase tracking-wider mb-2">
          Fulfillment Timeline
        </h2>
        <OrderStatusTimeline
          currentStatus={order.orderStatus}
          statusHistory={order.statusHistory || []}
        />
      </div>

      {/* Grid: Ordered Items + Address & Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ordered Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-charcoal-900 pb-2 border-b border-cream-100">
              Handcrafted Items ({order.items?.length})
            </h2>

            <div className="divide-y divide-cream-100">
              {order.items?.map((item, idx) => {
                const alreadyReviewed = reviews.some(
                  (r) => r.productId?.toString() === item.productId?.toString()
                );

                return (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 truncate">
                      <img
                        src={item.productImageSnapshot || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                        alt={item.productNameSnapshot}
                        className="w-16 h-16 rounded-xl object-cover bg-cream-50 flex-shrink-0"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                      <div className="space-y-1 truncate">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-serif font-bold text-sm text-charcoal-900 hover:text-terracotta-600 transition-colors truncate block"
                        >
                          {item.productNameSnapshot}
                        </Link>
                        <p className="text-xs text-charcoal-500">
                          Qty: {item.quantity} × ₹{item.unitPriceSnapshot}
                        </p>

                        {/* If order is delivered, show review button */}
                        {isDelivered && (
                          <div className="pt-1">
                            {alreadyReviewed ? (
                              <span className="text-[11px] font-semibold text-olive-700 flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(item)}
                                className="text-xs font-bold text-terracotta-600 hover:underline flex items-center space-x-1"
                              >
                                <Star className="w-3 h-3 fill-terracotta-500" />
                                <span>Write a Review</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
                      ₹{Number(item.lineTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery Address & Invoice Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Address Snapshot */}
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-terracotta-500" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-charcoal-600 leading-relaxed bg-cream-50/70 p-3.5 rounded-xl border border-cream-100">
              <p className="font-bold text-charcoal-900">{order.addressSnapshot?.name}</p>
              <p>{order.addressSnapshot?.street}</p>
              <p>
                {order.addressSnapshot?.city}, {order.addressSnapshot?.state} - {order.addressSnapshot?.postalCode}
              </p>
              <p className="mt-1 text-charcoal-500 font-medium">Phone: {order.addressSnapshot?.phone}</p>
            </div>
          </div>

          {/* Payment & Charges */}
          <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-terracotta-500" />
              <span>Payment Details</span>
            </h3>

            <div className="text-xs text-charcoal-600 space-y-1.5 bg-cream-50/70 p-3.5 rounded-xl border border-cream-100">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-charcoal-900">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-olive-700' : 'text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-cream-100">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">
                  ₹{Number(order.subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-charcoal-900">
                  {order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount}`}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-olive-700 font-semibold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-cream-100 flex justify-between text-sm font-bold text-charcoal-900">
                <span className="font-serif">Total Amount</span>
                <span className="font-serif text-lg text-terracotta-600">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel This Order?"
        message="Are you sure you want to cancel this order? Handcrafted items will be returned to inventory immediately."
        confirmText={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* Customer Review Modal for Delivered Purchases */}
      {reviewModalOpen && reviewTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-cream-200">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
              Review Handcrafted Creation
            </h3>
            <p className="text-xs text-charcoal-500 mb-4">
              {reviewTargetProduct.productNameSnapshot}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          reviewRating >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-charcoal-700 ml-2">
                    {reviewRating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Your Reflection & Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on texture, weight, finish, packaging, and the artisan's craft..."
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
