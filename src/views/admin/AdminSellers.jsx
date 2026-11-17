import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { Store, ShieldCheck, Check, X, AlertTriangle, Eye } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function AdminSellers() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getSellers(params);
      if (res.success) {
        setSellers(res.data.sellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, [statusFilter]);

  const handleApprove = async (seller) => {
    try {
      const res = await adminApi.updateSellerStatus(seller._id, { status: 'approved' });
      if (res.success) {
        toast.success(`Shop "${seller.shopName}" has been approved!`);
        loadSellers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve seller');
    }
  };

  const handleOpenReject = (seller) => {
    setSelectedSeller(seller);
    setRejectionReason('Application lacks sufficient documentation of handmade craft process.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedSeller) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateSellerStatus(selectedSeller._id, {
        status: 'rejected',
        rejectionReason,
      });
      if (res.success) {
        toast.success(`Application for "${selectedSeller.shopName}" was rejected.`);
        setRejectModalOpen(false);
        loadSellers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject application');
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspend = async (seller) => {
    const nextStatus = seller.applicationStatus === 'suspended' ? 'approved' : 'suspended';
    try {
      const res = await adminApi.updateSellerStatus(seller._id, { status: nextStatus });
      if (res.success) {
        toast.success(`Shop "${seller.shopName}" status changed to ${nextStatus}.`);
        loadSellers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update seller');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="admin" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="Seller Applications" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Artisan Seller Applications
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Review studio credentials, approve master craftspeople, and enforce handmade standards
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {['', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-white border border-cream-200 text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              {st === '' ? 'All Applications' : st}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-xs text-charcoal-500">
              No seller applications found in this category.
            </div>
          ) : (
            sellers.map((seller) => (
              <div
                key={seller._id}
                className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cream-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={seller.logo || seller.userId?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'}
                      alt={seller.shopName}
                      className="w-12 h-12 rounded-xl object-cover bg-cream-100"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=200&auto=format&fit=crop'}}
          />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif font-bold text-base text-charcoal-900">
                          {seller.shopName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            seller.applicationStatus === 'approved'
                              ? 'bg-olive-50 text-olive-700 border border-olive-200'
                              : seller.applicationStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {seller.applicationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500">
                        Artisan: <strong>{seller.userId?.name}</strong> ({seller.userId?.email}) • Location: <strong>{seller.location}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center space-x-2">
                    {seller.applicationStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(seller)}
                          className="px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Shop</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(seller)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {seller.applicationStatus === 'approved' && (
                      <button
                        onClick={() => handleSuspend(seller)}
                        className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                      >
                        Suspend Studio
                      </button>
                    )}

                    {seller.applicationStatus === 'suspended' && (
                      <button
                        onClick={() => handleSuspend(seller)}
                        className="px-3.5 py-1.5 bg-olive-700 text-white hover:bg-olive-800 rounded-lg text-xs font-semibold"
                      >
                        Reactivate Studio
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-charcoal-600 leading-relaxed bg-cream-50/50 p-4 rounded-xl border border-cream-100">
                  <p className="font-semibold text-charcoal-800 mb-1">Craft Description & Technique:</p>
                  <p>{seller.description}</p>
                  {seller.rejectionReason && (
                    <p className="text-red-600 mt-2 font-medium">
                      Rejection Reason: {seller.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Application Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200 space-y-4">
              <h3 className="font-serif font-bold text-base text-charcoal-900">
                Reject Application: {selectedSeller?.shopName}
              </h3>
              <p className="text-xs text-charcoal-500">
                Please provide a constructive reason for this decision so the artisan can revise their craft details.
              </p>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-red-500"
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 rounded-lg text-xs font-medium text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
