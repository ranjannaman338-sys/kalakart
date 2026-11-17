import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';
import { ArtisanCard } from '../../components/common/Cards';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import { Compass, Sparkles } from 'lucide-react';

export function Artisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await sellerApi.getArtisans();
        if (res.success) setArtisans(res.data.artisans || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-olive-600">
          The Craftspeople Behind KalaKart
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Meet Our Approved Artisans & Weavers
        </h1>
        <p className="text-sm text-charcoal-600 leading-relaxed font-sans">
          Discover verified studios shaping natural clay, weaving organic cottons, and forging heritage metals across the craft clusters of India.
        </p>

        <div className="pt-2">
          <Link
            to="/seller/apply"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-olive-700 hover:bg-olive-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Are you an artisan? Apply to sell on KalaKart</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artisans.map((artisan) => (
            <ArtisanCard key={artisan._id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  );
}
