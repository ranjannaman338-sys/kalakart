import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { SafeImage } from './SafeImage';

export function CategoryCard({ category }) {
  if (!category) return null;

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal-900 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-5"
    >
      {/* Background Image with Dark Gradient Overlay */}
      <SafeImage
        src={category.image}
        alt={category.name}
        type="category"
        imgClassName="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-white">
        <h3 className="font-serif text-lg md:text-xl font-bold tracking-tight mb-1 group-hover:text-terracotta-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-cream-200 line-clamp-2 mb-3 leading-relaxed opacity-90">
          {category.description}
        </p>
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-terracotta-300 group-hover:text-white transition-colors">
          <span>Explore Crafts</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export function ArtisanCard({ artisan }) {
  if (!artisan) return null;

  return (
    <div className="bg-white rounded-2xl border border-cream-200/90 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Banner / Header */}
        <div className="relative h-28 rounded-xl overflow-hidden bg-cream-100 mb-4">
          {artisan.banner ? (
            <SafeImage
              src={artisan.banner}
              alt={artisan.shopName}
              type="banner"
              imgClassName="w-full h-full object-cover"
              className="w-full h-full"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-terracotta-100 to-cream-200" />
          )}

          {/* Logo Badge */}
          <div className="absolute -bottom-2 left-4 w-12 h-12 rounded-xl bg-white p-0.5 shadow-md border border-cream-200 overflow-hidden">
            <SafeImage
              src={artisan.logo || artisan.userId?.avatar}
              alt={artisan.shopName}
              type="logo"
              imgClassName="w-full h-full object-cover rounded-lg"
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>

        {/* Shop Name & Details */}
        <div className="pt-2">
          <div className="flex items-center space-x-1.5 mb-1">
            <h4 className="font-serif text-base font-bold text-charcoal-900 truncate">
              {artisan.shopName}
            </h4>
            <ShieldCheck className="w-4 h-4 text-olive-600 flex-shrink-0" title="Verified Artisan" />
          </div>

          <div className="flex items-center space-x-1 text-xs text-charcoal-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
            <span className="truncate">{artisan.location}</span>
          </div>

          <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
            {artisan.description}
          </p>
        </div>
      </div>

      <Link
        to={`/artisans/${artisan.slug}`}
        className="w-full py-2 bg-cream-50 hover:bg-terracotta-500 hover:text-white text-charcoal-800 border border-cream-300 hover:border-terracotta-500 rounded-lg text-xs font-semibold text-center transition-colors shadow-sm flex items-center justify-center space-x-1"
      >
        <span>View Artisan Shop</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
