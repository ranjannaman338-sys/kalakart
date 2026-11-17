import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { CategoryCard } from '../../components/common/Cards';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await categoryApi.getCategories();
        if (res.success) setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
          Regional Specialties & Techniques
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Explore Traditional Craft Disciplines
        </h1>
        <p className="text-sm text-charcoal-600 leading-relaxed font-sans">
          From ancient terracotta pottery and Madhubani folk paintings to hand-carved sheesham wood and lost-wax brass, browse our curated craft disciplines.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
