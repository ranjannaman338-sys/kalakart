import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { FolderTree, Tag, Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      image: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await adminApi.updateCategory(editingCategory._id, form);
        if (res.success) {
          toast.success('Category updated successfully!');
          setModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await adminApi.createCategory(form);
        if (res.success) {
          toast.success('Category created successfully!');
          setModalOpen(false);
          loadCategories();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete/deactivate this category?')) return;
    try {
      const res = await adminApi.deleteCategory(id);
      if (res.success) {
        toast.success(res.data.message || 'Category processed');
        loadCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove category');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Categories & Coupons" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900">Craft Categories</h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage product taxonomy and collection navigation
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-cream-100 overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-charcoal-900">{cat.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cat.isActive ? 'bg-olive-50 text-olive-700' : 'bg-red-50 text-red-600'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 line-clamp-2">{cat.description}</p>
                    <p className="text-[11px] font-mono text-charcoal-400">Slug: /{cat.slug}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-cream-100 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-charcoal-600 hover:text-olive-700 hover:bg-cream-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-charcoal-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Deactivate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200 space-y-4">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 font-bold text-charcoal-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded border-cream-300 text-terracotta-600 focus:ring-terracotta-500"
                    />
                    <span>Active in Public Store</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-cream-300 rounded-lg text-charcoal-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg font-semibold"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function AdminCoupons() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderValue: '0',
    maximumDiscount: '0',
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '100',
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons();
      if (res.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minimumOrderValue: parseFloat(form.minimumOrderValue || 0),
        maximumDiscount: parseFloat(form.maximumDiscount || 0),
        expiryDate: form.expiryDate,
        usageLimit: parseInt(form.usageLimit || 100, 10),
        isActive: form.isActive,
      };

      const res = await adminApi.createCoupon(payload);
      if (res.success) {
        toast.success(`Coupon ${payload.code} created successfully!`);
        setModalOpen(false);
        loadCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const res = await adminApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      if (res.success) {
        toast.success(`Coupon ${coupon.code} status updated.`);
        loadCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update coupon');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <DashboardMobileHeader title="Discount Coupons" onMenuOpen={() => setMobileOpen(true)} />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900">Discount Coupons</h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage promotional codes, discount thresholds, and campaign limits
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min Order</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-cream-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-900 text-sm">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-terracotta-600">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        {c.maximumDiscount > 0 && ` (Max ₹${c.maximumDiscount})`}
                      </td>
                      <td className="py-3 px-4 text-charcoal-700">₹{c.minimumOrderValue}</td>
                      <td className="py-3 px-4 text-charcoal-600">
                        {c.usageCount} / {c.usageLimit}
                      </td>
                      <td className="py-3 px-4 text-charcoal-500">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.isActive ? 'bg-olive-50 text-olive-700' : 'bg-red-50 text-red-600'}`}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleCoupon(c)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            c.isActive
                              ? 'text-red-600 hover:bg-red-50 border border-red-200'
                              : 'text-olive-700 hover:bg-olive-50 border border-olive-200'
                          }`}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Coupon Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200 space-y-4">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Create Promotion Coupon
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. KALA20"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg uppercase font-mono font-bold focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg font-semibold"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.minimumOrderValue}
                      onChange={(e) => setForm({ ...form, minimumOrderValue: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.maximumDiscount}
                      onChange={(e) => setForm({ ...form, maximumDiscount: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-cream-300 rounded-lg text-charcoal-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg font-semibold"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
