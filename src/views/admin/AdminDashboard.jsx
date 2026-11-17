import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardSidebar, DashboardStatCard, DashboardMobileHeader} from '../../components/dashboard/DashboardLayout';
import { Users, Store, Package, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
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

export function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getDashboard();
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
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Admin Dashboard" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Platform Governance Console
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            KalaKart Marketplace Administration
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Platform-wide metrics, artisan applications, and marketplace moderation
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
              <DashboardStatCard
                title="Total Sales"
                value={`₹${Number(data?.stats?.totalSales || 0).toLocaleString('en-IN')}`}
                icon={TrendingUp}
                color="olive"
              />
              <DashboardStatCard
                title="Total Orders"
                value={data?.stats?.totalOrders || 0}
                icon={ShoppingBag}
                color="blue"
              />
              <DashboardStatCard
                title="All Users"
                value={data?.stats?.totalUsers || 0}
                icon={Users}
                color="cream"
              />
              <DashboardStatCard
                title="Artisans"
                value={data?.stats?.totalSellers || 0}
                subtitle="Approved Studios"
                icon={Store}
                color="terracotta"
              />
              <DashboardStatCard
                title="Pending Apps"
                value={data?.stats?.pendingSellers || 0}
                subtitle="Requires Review"
                icon={AlertCircle}
                color="cream"
              />
              <DashboardStatCard
                title="Products"
                value={data?.stats?.totalProducts || 0}
                icon={Package}
                color="olive"
              />
            </div>

            {/* Platform Sales Chart */}
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-100">
                <h2 className="font-serif font-bold text-base text-charcoal-900">
                  Platform Gross Merchandise Volume (₹)
                </h2>
                <span className="text-xs text-charcoal-400">Past 6 Months</span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E7DB" />
                    <XAxis dataKey="name" stroke="#80857D" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#80857D"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        name === 'revenue' ? `₹${Number(val).toLocaleString('en-IN')}` : val,
                        name === 'revenue' ? 'Sales Revenue' : 'Orders Placed',
                      ]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        borderColor: '#F0E7DB',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="revenue" fill="#5A784B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
