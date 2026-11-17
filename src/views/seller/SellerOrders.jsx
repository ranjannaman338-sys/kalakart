import React, { useState, useEffect } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function SellerOrders() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [fulfillments, setFulfillments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadFulfillments = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getOrders();
      if (res.success) {
        setFulfillments(res.data.fulfillments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFulfillments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await sellerApi.updateFulfillmentStatus(id, {
        status: newStatus,
        note: `Status updated to ${newStatus} by artisan studio`,
      });
      if (res.success) {
        toast.success(`Fulfillment updated to ${newStatus}`);
        loadFulfillments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Customer Orders" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Artisan Orders</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Orders containing handcrafted creations from your workshop
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : fulfillments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-xs text-charcoal-500">
            No customer orders assigned to your workshop yet.
          </div>
        ) : (
          <div className="space-y-6">
            {fulfillments.map((f) => {
              const order = f.orderId;
              const isUpdating = updatingId === f._id;

              return (
                <div
                  key={f._id}
                  className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cream-100 gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-charcoal-900">
                          Order #{order?._id ? order._id.substring(order._id.length - 8).toUpperCase() : f._id.substring(f._id.length - 8).toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-charcoal-800">
                          {f.fulfillmentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-400 mt-0.5">
                        Received on {new Date(order?.createdAt || f.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Status updater dropdown */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-charcoal-600">Update Status:</span>
                      <select
                        disabled={isUpdating || f.fulfillmentStatus === 'DELIVERED' || f.fulfillmentStatus === 'CANCELLED'}
                        value={f.fulfillmentStatus}
                        onChange={(e) => handleStatusChange(f._id, e.target.value)}
                        className="px-3 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-xs font-bold text-charcoal-800 focus:outline-none focus:border-terracotta-500 disabled:opacity-50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING (Crafting/Packing)</option>
                        <option value="SHIPPED">SHIPPED (Dispatched)</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  {/* Items list & Delivery destination snapshot */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Items */}
                    <div className="md:col-span-8 space-y-3">
                      <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal-500">
                        Items to Dispatch
                      </h4>
                      <div className="divide-y divide-cream-100">
                        {f.items?.map((it, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <img
                                src={it.productImageSnapshot || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                                alt={it.productNameSnapshot}
                                className="w-10 h-10 rounded-lg object-cover bg-cream-50"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                              <div>
                                <p className="font-bold text-charcoal-900">{it.productNameSnapshot}</p>
                                <p className="text-[11px] text-charcoal-500">
                                  Quantity: <strong>{it.quantity}</strong> × ₹{it.unitPriceSnapshot}
                                </p>
                              </div>
                            </div>
                            <span className="font-serif font-bold text-charcoal-900">
                              ₹{Number(it.lineTotal).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Destination Info */}
                    <div className="md:col-span-4 bg-cream-50/70 p-4 rounded-xl border border-cream-100 text-xs space-y-1.5">
                      <h4 className="font-serif font-bold uppercase tracking-wider text-charcoal-500 text-[11px] flex items-center space-x-1 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                        <span>Shipping Address</span>
                      </h4>
                      <p className="font-bold text-charcoal-900">{order?.addressSnapshot?.name}</p>
                      <p className="text-charcoal-600">{order?.addressSnapshot?.street}</p>
                      <p className="text-charcoal-600">
                        {order?.addressSnapshot?.city}, {order?.addressSnapshot?.state} - {order?.addressSnapshot?.postalCode}
                      </p>
                      <p className="text-charcoal-500 pt-1 font-medium">Contact: {order?.addressSnapshot?.phone}</p>
                      <p className="text-charcoal-500 text-[11px] pt-1">
                        Payment: <strong>{order?.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
