import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { Package, ArrowRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderApi.getOrders();
        if (res.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          description="You haven't ordered any handmade goods yet. Explore our artisan catalog to find unique treasures crafted with love."
          actionText="Browse Marketplace"
          actionLink="/shop"
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      ORDER_PLACED: 'bg-blue-50 text-blue-700 border-blue-200',
      CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
      SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
      OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      DELIVERED: 'bg-olive-50 text-olive-700 border-olive-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
          map[status] || 'bg-cream-100 text-charcoal-700'
        }`}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">My Orders</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Track fulfillment status, view invoices, and review your delivered handcrafted pieces
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6 shadow-sm hover:border-terracotta-200 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cream-100 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-charcoal-800">
                    Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                  {getStatusBadge(order.orderStatus)}
                </div>
                <p className="text-[11px] text-charcoal-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="text-right">
                <span className="font-serif text-lg font-bold text-charcoal-900">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-charcoal-500">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'} •{' '}
                  <span className={order.paymentStatus === 'PAID' ? 'text-olive-700 font-bold' : 'text-amber-700'}>
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Thumbnail row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 overflow-x-auto py-1">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-2 flex-shrink-0 bg-cream-50 p-1.5 rounded-xl border border-cream-100">
                    <img
                      src={it.productImageSnapshot || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                      alt={it.productNameSnapshot}
                      className="w-12 h-12 rounded-lg object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                    <div className="text-xs max-w-[120px] pr-2">
                      <p className="font-medium text-charcoal-900 truncate">
                        {it.productNameSnapshot}
                      </p>
                      <p className="text-[10px] text-charcoal-500">Qty: {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to={`/orders/${order._id}`}
                className="flex items-center space-x-1.5 px-4 py-2 bg-cream-100 hover:bg-terracotta-500 text-charcoal-800 hover:text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
              >
                <span>Track Order</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
