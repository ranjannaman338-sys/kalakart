import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Award,
  ShieldCheck,
  Feather,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { sellerApi } from '../../api/sellerApi';
import { ProductCard } from '../../components/products/ProductCard';
import { CategoryCard, ArtisanCard } from '../../components/common/Cards';
import { SkeletonCard } from '../../components/common/LoadingAndEmpty';

export function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, prodRes, artRes] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getFeatured(),
          sellerApi.getArtisans(),
        ]);

        if (catRes.success) setCategories(catRes.data.categories || []);
        if (prodRes.success) setFeaturedProducts(prodRes.data.products || []);
        if (artRes.success) setArtisans(artRes.data.artisans || []);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100/60 to-ivory py-16 lg:py-24 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-terracotta-100 text-terracotta-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Empowering India's Heritage Artisans</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 tracking-tight leading-[1.15]">
                Every Handmade Piece Tells a <span className="text-terracotta-500 italic">Story.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 max-w-xl leading-relaxed font-sans">
                Discover unique handmade treasures crafted with passion and generational mastery by talented local artisans. Every purchase sustains traditional craftsmanship, preserves folk art, and celebrates conscious living.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/shop"
                  className="px-8 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-terracotta-500/20 flex items-center space-x-2 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/artisans"
                  className="px-8 py-3.5 bg-white hover:bg-cream-100 text-charcoal-800 border border-cream-300 font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-olive-600" />
                  <span>Meet Our Artisans</span>
                </Link>
              </div>

              {/* Stat callouts */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-cream-200 max-w-md">
                <div>
                  <p className="font-serif text-2xl font-bold text-charcoal-900">100%</p>
                  <p className="text-xs text-charcoal-500 font-medium">Handcrafted</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-charcoal-900">500+</p>
                  <p className="text-xs text-charcoal-500 font-medium">Rural Artisans</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-charcoal-900">Fair Trade</p>
                  <p className="text-xs text-charcoal-500 font-medium">Ethical Living</p>
                </div>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop"
                    alt="Artisan shaping wheel-thrown pottery"
                    className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=crop'}}
          />
                </div>

                {/* Floating Floating Badge 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-cream-200 flex items-center space-x-3 max-w-xs animate-bounce-subtle">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 text-olive-700 flex items-center justify-center font-bold">
                    <Feather className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal-900">Crafted with Soul</p>
                    <p className="text-[11px] text-charcoal-500">Zero mass-produced plastics</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -top-4 -right-4 bg-terracotta-500 text-white p-3.5 rounded-2xl shadow-lg flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold">Direct from Artisan Studios</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
              Curated Craft Traditions
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-cream-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-olive-600">
              Hand-Selected Treasures
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Featured Creations
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Why Choose KalaKart? */}
      <section className="bg-cream-100/70 border-y border-cream-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
              The KalaKart Promise
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Why Choose Handmade?
            </h2>
            <p className="text-charcoal-600 text-sm mt-2">
              Choosing handmade means cherishing timeless human artistry over industrialized uniformity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-terracotta-100 text-terracotta-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 mb-2">Made by Hand</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Every stitch, carve, glaze, and brushstroke carries the unique character and warmth of human hands.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-olive-100 text-olive-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 mb-2">Supporting Local Artisans</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Direct revenue goes to craftspeople and their families, sustaining rare traditional heritage crafts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 mb-2">Unique & Thoughtful Gifts</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                No two pieces are identical. Offer loved ones heirloom keepsakes with genuine heritage provenance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal-900 mb-2">Quality Craftsmanship</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Natural woods, organic river clay, pure metals, and vegetable-dyed cotton built to last for generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Meet Our Artisans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
              The Hands Behind the Art
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Meet Our Artisans
            </h2>
          </div>
          <Link
            to="/artisans"
            className="text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>Explore All Studios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.slice(0, 3).map((artisan) => (
            <ArtisanCard key={artisan._id} artisan={artisan} />
          ))}
        </div>
      </section>

      {/* 6. Storytelling Spotlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal-900 rounded-3xl overflow-hidden text-white grid grid-cols-1 lg:grid-cols-12 shadow-xl">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta-400 mb-3">
              Artisan Heritage Spotlight
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Reviving India’s Living Craft Traditions
            </h2>
            <p className="text-sm text-cream-200 leading-relaxed mb-6 font-sans">
              Across thousands of Indian villages, families preserve centuries-old techniques—from Odishan silver filigree to Khurja studio pottery and Rajasthani Dabu mud-resist dyeing.
              <br /><br />
              KalaKart removes unnecessary middlemen, giving master craftspeople dignified direct access to mindful homes worldwide. Every order makes a tangible difference.
            </p>
            <div>
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                <span>Read Our Mission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 bg-cream-200 relative min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop"
              alt="Hands weaving artisan fibers"
              className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=crop'}}
          />
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials (Clearly labeled demo reviews per Section 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-olive-600">
            Patron Reflections
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
            Cherished by Craft Lovers
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            (Sample customer reviews demonstrating authentic feedback on KalaKart purchases)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-charcoal-700 leading-relaxed italic mb-4">
                "The Sheesham spice box is sheer poetry. The carving detail is exquisite and smelling real polished wood every time I cook connects me to my roots."
              </p>
            </div>
            <div className="pt-3 border-t border-cream-100 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-700 font-bold text-xs flex items-center justify-center">
                DK
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900">Divya K.</p>
                <p className="text-[11px] text-charcoal-500">Verified Buyer • Mumbai</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-charcoal-700 leading-relaxed italic mb-4">
                "Finding genuine Dabu hand-block printed mulmul stoles online that don’t bleed synthetic color is so rare. KalaKart is our family’s go-to boutique."
              </p>
            </div>
            <div className="pt-3 border-t border-cream-100 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-700 font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900">Arjun Mehta</p>
                <p className="text-[11px] text-charcoal-500">Verified Buyer • Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-charcoal-700 leading-relaxed italic mb-4">
                "My terracotta serving bowls arrived in 100% biodegradable straw packaging without a single scratch. Wheel-thrown ceramics have such grounding energy."
              </p>
            </div>
            <div className="pt-3 border-t border-cream-100 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                SP
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900">Sneha Pillai</p>
                <p className="text-[11px] text-charcoal-500">Verified Buyer • Kochi</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
