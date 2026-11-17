import React from 'react';
import { ProductCard } from './ProductCard';
import { SkeletonCard, EmptyState } from '../common/LoadingAndEmpty';
import { PackageOpen } from 'lucide-react';

export function ProductGrid({ products = [], loading = false, emptyMessage = 'No handmade products match your criteria.' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No Products Found"
        description={emptyMessage}
        actionText="Explore All Products"
        actionLink="/shop"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
