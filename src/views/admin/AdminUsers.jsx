import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { Users, Search, Shield, User, Store } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function AdminUsers() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      const res = await adminApi.getUsers(params);
      if (res.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleActive = async (user) => {
    try {
      const res = await adminApi.updateUser(user._id, { isActive: !user.isActive });
      if (res.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
        loadUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminApi.updateUser(userId, { role: newRole });
      if (res.success) {
        toast.success(`User role changed to ${newRole}.`);
        loadUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Users Management" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">User Management</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage customer, artisan seller, and administrator accounts
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-charcoal-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-cream-200 rounded-xl text-xs font-semibold text-charcoal-800"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller / Artisan</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
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
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-cream-50/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-cream-200 text-charcoal-800 font-bold flex items-center justify-center uppercase">
                            {u.name?.[0] || 'U'}
                          </div>
                          <span className="font-bold text-charcoal-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-cream-50 border border-cream-200 rounded-md text-[11px] font-bold uppercase tracking-wider text-charcoal-800"
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.isActive
                              ? 'bg-olive-50 text-olive-700 border border-olive-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            u.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-olive-700 hover:bg-olive-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
