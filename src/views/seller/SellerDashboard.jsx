import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';
import {
  DashboardSidebar,
  DashboardStatCard, DashboardMobileHeader} from '../../components/dashboard/DashboardLayout';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';

export function SellerDashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await sellerApi.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Seller Dashboard" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-olive-600">
              Artisan Workshop Overview
            </span>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900">
              {data?.shop?.shopName || 'Seller Dashboard'}
            </h1>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardStatCard
                title="Total Revenue"
                value={`₹${Number(data?.stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
                subtitle="From completed delivered orders"
                icon={TrendingUp}
                color="olive"
              />
              <DashboardStatCard
                title="Active Listings"
                value={data?.stats?.activeProducts || 0}
                subtitle={`${data?.stats?.totalProducts || 0} total listings`}
                icon={Package}
                color="terracotta"
              />
              <DashboardStatCard
                title="Pending Orders"
                value={data?.stats?.pendingOrders || 0}
                subtitle="Requires packing/dispatch"
                icon={Clock}
                color="cream"
              />
              <DashboardStatCard
                title="Delivered Orders"
                value={data?.stats?.completedOrders || 0}
                subtitle={`${data?.stats?.totalOrders || 0} total lifetime orders`}
                icon={CheckCircle2}
                color="blue"
              />
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-100">
                <h2 className="font-serif font-bold text-base text-charcoal-900">
                  Monthly Revenue Trend (₹)
                </h2>
                <span className="text-xs text-charcoal-400">Past 6 Months</span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.salesTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E7DB" />
                    <XAxis dataKey="name" stroke="#80857D" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#80857D"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        borderColor: '#F0E7DB',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="revenue" fill="#C85A32" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-100">
                <h2 className="font-serif font-bold text-base text-charcoal-900">
                  Recent Artisan Orders
                </h2>
                <Link
                  to="/seller/orders"
                  className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center space-x-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.recentOrders?.length === 0 ? (
                <p className="text-xs text-charcoal-500 py-6 text-center">
                  No incoming orders yet. As soon as a customer orders your handcrafted pieces, they will appear here!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-cream-200 text-charcoal-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Order Ref</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {data?.recentOrders?.map((ord) => (
                        <tr key={ord._id} className="hover:bg-cream-50/50">
                          <td className="py-3 px-3 font-mono font-bold text-charcoal-800">
                            #{ord.orderId ? ord.orderId.substring(ord.orderId.length - 6).toUpperCase() : ord._id.substring(ord._id.length - 6).toUpperCase()}
                          </td>
                          <td className="py-3 px-3 font-medium text-charcoal-900">
                            {ord.customerName}
                          </td>
                          <td className="py-3 px-3 text-charcoal-500">
                            {new Date(ord.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-3">{ord.itemCount} item(s)</td>
                          <td className="py-3 px-3 font-serif font-bold text-charcoal-900">
                            ₹{Number(ord.total).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-charcoal-800">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
