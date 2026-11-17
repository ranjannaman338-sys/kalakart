import React, { useState, useEffect } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { Store, MapPin, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function SellerProfilePage() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { sellerProfile, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    shopName: '',
    description: '',
    location: '',
    logo: '',
    banner: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await sellerApi.getProfile();
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          setProfile(p);
          setForm({
            shopName: p.shopName || '',
            description: p.description || '',
            location: p.location || '',
            logo: p.logo || '',
            banner: p.banner || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await sellerApi.updateProfile(form);
      if (res.success) {
        toast.success('Artisan shop profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update shop profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-ivory">
        <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <DashboardMobileHeader title="Shop Profile" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-10 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Artisan Studio Profile</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Update your workshop brand identity, bio, and workshop location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 text-xs bg-white p-8 rounded-2xl border border-cream-200 shadow-sm">
          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1">
              Workshop / Craft Cluster Location *
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1">
              Studio Story & Craft Technique Description *
            </label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                Studio Logo URL
              </label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                Workshop Banner URL
              </label>
              <input
                type="url"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-cream-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Updating Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
