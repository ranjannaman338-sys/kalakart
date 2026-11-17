import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { sellerApi } from '../../api/sellerApi';
import { ProductGrid } from '../../components/products/ProductGrid';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingAndEmpty';

export function ArtisanDetail() {
  const { slug } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      setError(null);
      try {
        const res = await sellerApi.getArtisanDetail(slug);
        if (res.success && res.data?.artisan) {
          setArtisan(res.data.artisan);
          setProducts(res.data.products || []);
        } else {
          setError('Artisan studio not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load artisan profile');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadStudio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="py-20 px-4">
        <EmptyState
          title="Artisan Profile Unavailable"
          description={error || 'The requested artisan studio profile could not be located.'}
          actionText="Meet All Artisans"
          actionLink="/artisans"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Link
        to="/artisans"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-charcoal-600 hover:text-terracotta-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Artisans</span>
      </Link>

      {/* Artisan Studio Header Banner */}
      <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-48 sm:h-64 bg-cream-100 relative">
          {artisan.banner ? (
            <img src={artisan.banner} alt={artisan.shopName} className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop'}}
          />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-terracotta-100 via-cream-200 to-olive-100" />
          )}
        </div>

        {/* Profile Info Row */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-cream-100">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 border-2 border-cream-200 shadow-md overflow-hidden flex-shrink-0">
                <img
                  src={artisan.logo || artisan.userId?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'}
                  alt={artisan.shopName}
                  className="w-full h-full object-cover rounded-xl"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=200&auto=format&fit=crop'}}
          />
              </div>
              <div className="pb-1">
                <div className="flex items-center space-x-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    {artisan.shopName}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-olive-600 flex-shrink-0" title="Verified Artisan Studio" />
                </div>
                <p className="text-xs text-charcoal-500 font-medium mt-0.5">
                  Artisan: {artisan.userId?.name}
                </p>
                <div className="flex items-center space-x-1 text-xs text-terracotta-600 mt-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{artisan.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-charcoal-500 bg-cream-50 px-4 py-2 rounded-xl border border-cream-200">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              <span>Studio Partner since {new Date(artisan.approvedAt || artisan.createdAt).getFullYear()}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-6 max-w-3xl">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 mb-2">
              Studio Story & Craft Technique
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
              {artisan.description}
            </p>
          </div>
        </div>
      </div>

      {/* Artisan's Products Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Handcrafted Creations by {artisan.shopName} ({products.length})
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Every piece is shipped directly from their workshop
          </p>
        </div>

        <ProductGrid
          products={products}
          emptyMessage={`No active product listings currently available from ${artisan.shopName}.`}
        />
      </div>
    </div>
  );
}
