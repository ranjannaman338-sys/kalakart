import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sellerApi } from '../../api/sellerApi';
import { Store, Sparkles, MapPin, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function SellerApply() {
  const { user, isSeller, sellerProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: '',
    description: '',
    location: '',
    logo: '',
    banner: '',
  });
  const [loading, setLoading] = useState(false);

  // If already a seller or already submitted application
  if (isSeller || sellerProfile) {
    if (sellerProfile?.applicationStatus === 'approved') {
      navigate('/seller/dashboard');
      return null;
    }
    return <SellerPending />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName || !form.description || !form.location) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (form.description.length < 20) {
      toast.error('Shop description must be at least 20 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await sellerApi.apply(form);
      if (res.success) {
        toast.success(res.data.message);
        await refreshUser();
        navigate('/seller/pending');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit seller application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center space-y-3 mb-10">
        <div className="w-12 h-12 bg-olive-100 text-olive-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Store className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-olive-600">
          Artisan Studio Partnership
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Apply to Showcase on KalaKart
        </h1>
        <p className="text-sm text-charcoal-600 max-w-xl mx-auto leading-relaxed">
          Join India’s premier handmade marketplace. Connect with discerning patrons who value your authentic craftsmanship, fair prices, and generational heritage.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 p-8 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Artisan Shop / Studio Name *
            </label>
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
              placeholder="e.g. Mitti & Clay Studio, Marwar Woodcrafts"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Craft Cluster & Workshop Location *
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900"
              placeholder="e.g. Khurja, Uttar Pradesh / Udaipur, Rajasthan"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Studio Story & Craft Technique * (min 20 characters)
            </label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 text-charcoal-900 leading-relaxed"
              placeholder="Tell our patrons about your heritage craft, raw materials used (e.g. natural river clay, seasoned sheesham, pure brass), and artisanal technique..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Studio Logo URL (Optional)
              </label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Workshop Banner URL (Optional)
              </label>
              <input
                type="url"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-cream-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-terracotta-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Store className="w-4 h-4" />
              <span>{loading ? 'Submitting Application...' : 'Submit Artisan Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SellerPending() {
  const { sellerProfile } = useAuth();
  const status = sellerProfile?.applicationStatus || 'pending';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      {status === 'pending' && (
        <div className="bg-white rounded-3xl border border-cream-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Artisan Application Pending Review
          </h2>
          <p className="text-xs text-charcoal-600 leading-relaxed max-w-md mx-auto">
            Thank you for applying to join KalaKart! Our curation committee is reviewing your studio credentials and handmade craft specifications. Applications are typically reviewed within 24 to 48 hours.
          </p>
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-charcoal-700 text-left">
            <p><strong>Shop Name:</strong> {sellerProfile?.shopName}</p>
            <p className="mt-1"><strong>Location:</strong> {sellerProfile?.location}</p>
            <p className="mt-1"><strong>Status:</strong> <span className="text-amber-700 font-bold uppercase">Pending Verification</span></p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-white rounded-3xl border border-cream-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Application Status: Needs Revision
          </h2>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {sellerProfile?.rejectionReason || 'The application was not approved as it requires additional details regarding handmade authenticity.'}
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-block px-5 py-2.5 bg-charcoal-900 text-white rounded-xl text-xs font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="bg-white rounded-3xl border border-cream-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-olive-100 text-olive-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Congratulations! You are an Approved Artisan
          </h2>
          <p className="text-xs text-charcoal-600">
            Your shop is verified. You can now publish handmade products and fulfill orders.
          </p>
          <div className="pt-2">
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center space-x-1.5 px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs"
            >
              <span>Go to Seller Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
