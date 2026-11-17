import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { Package, Search, Eye, ShieldAlert, Check } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      const res = await adminApi.getProducts(params);
      if (res.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminApi.updateProductStatus(product._id, nextStatus);
      if (res.success) {
        toast.success(`Product "${product.name}" status set to ${nextStatus}.`);
        loadProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update product status');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Marketplace Orders" onMenuOpen={() => setMobileOpen(true)} />

      <DashboardMobileHeader title="Product Moderation" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Product Listing Moderation
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Review and moderate artisan product listings across the marketplace
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Artisan Studio</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-cream-50/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-cream-50 flex-shrink-0"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                          <div className="truncate max-w-[180px]">
                            <p className="font-bold text-charcoal-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-charcoal-400">ID: {p._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-olive-700">
                        {p.sellerProfileId?.shopName || p.sellerId?.name || 'Artisan'}
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-600">
                        {p.categoryId?.name || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 font-serif font-bold text-charcoal-900">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-charcoal-700">
                        {p.stock} units
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'active'
                              ? 'bg-olive-50 text-olive-700 border border-olive-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            p.status === 'active'
                              ? 'text-red-600 hover:bg-red-50 border border-red-200'
                              : 'text-olive-700 hover:bg-olive-50 border border-olive-200'
                          }`}
                        >
                          {p.status === 'active' ? 'Deactivate' : 'Publish / Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function AdminOrders() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getOrders(params);
      if (res.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, orderStatus) => {
    try {
      const res = await adminApi.updateOrderStatus(orderId, { orderStatus });
      if (res.success) {
        toast.success(`Order status updated to ${orderStatus}.`);
        loadOrders();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Marketplace Orders" onMenuOpen={() => setMobileOpen(true)} />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Marketplace Orders
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Global view of all orders, payments, and delivery statuses
          </p>
        </div>

        {/* Filter by Status */}
        <div className="flex space-x-2">
          {['', 'ORDER_PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white border border-cream-200 text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              {st === '' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-cream-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-900">
                        #{o._id.slice(-8).toUpperCase()}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-charcoal-900">{o.addressSnapshot?.name || o.userId?.name}</p>
                        <p className="text-[10px] text-charcoal-400">{o.addressSnapshot?.city}, {o.addressSnapshot?.state}</p>
                      </td>

                      <td className="py-3 px-4 text-charcoal-500">
                        {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </td>

                      <td className="py-3 px-4 font-serif font-bold text-charcoal-900">
                        ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal-800">{o.paymentMethod}</span> •{' '}
                        <span className={o.paymentStatus === 'PAID' ? 'text-olive-700 font-bold' : 'text-amber-700 font-bold'}>
                          {o.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-charcoal-800">
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                          className="px-2.5 py-1 bg-cream-50 border border-cream-300 rounded-lg text-xs font-bold text-charcoal-800"
                        >
                          <option value="ORDER_PLACED">ORDER PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
