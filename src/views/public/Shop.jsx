import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X, RefreshCw, Check } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { ProductGrid } from '../../components/products/ProductGrid';
import { Pagination } from '../../components/common/ModalsAndPagination';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter parameters from URL
  const q = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(q);

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.getCategories();
        if (res.success) setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products from backend when URL parameters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
      };
      if (q) params.q = q;
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      if (inStock) params.inStock = 'true';

      const res = await productApi.getProducts(params);
      if (res.success) {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q, selectedCategory, sort, minPrice, maxPrice, minRating, inStock, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', localSearch.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-cream-200 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Handmade Craft Catalog
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Showing {totalCount} authentic artisanal items directly from maker studios
          </p>
        </div>

        {/* Controls: Search, Sort & Filter toggle */}
        <div className="flex items-center space-x-3">
          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-charcoal-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 bg-white border border-cream-200 rounded-lg text-xs font-medium text-charcoal-800 focus:outline-none focus:border-terracotta-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="featured">Featured & Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-cream-100 rounded-lg text-xs font-semibold text-charcoal-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-serif font-bold text-sm text-charcoal-900">Filter By</h3>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-terracotta-600 hover:text-terracotta-700 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2">
                Search
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Pottery, scarf, bag..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-cream-50 border border-cream-200 rounded-lg text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-800"
                />
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-2.5" />
              </form>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2">
                Category
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                    !selectedCategory ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'text-charcoal-700 hover:bg-cream-50'
                  }`}
                >
                  <span>All Categories</span>
                  {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-terracotta-50 text-terracotta-700 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2">
                Price (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="px-2.5 py-1.5 bg-cream-50 border border-cream-200 rounded-lg text-xs focus:outline-none focus:border-terracotta-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="px-2.5 py-1.5 bg-cream-50 border border-cream-200 rounded-lg text-xs focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2">
                Minimum Rating
              </label>
              <div className="space-y-1">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam('minRating', minRating === String(r) ? '' : String(r))}
                    className={`w-full text-left text-xs px-2.5 py-1 rounded-md flex items-center justify-between ${
                      minRating === String(r) ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'text-charcoal-700 hover:bg-cream-50'
                    }`}
                  >
                    <span>★ {r} stars & above</span>
                    {minRating === String(r) && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-cream-100">
              <label className="flex items-center space-x-2 text-xs font-medium text-charcoal-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParam('inStock', e.target.checked)}
                  className="rounded border-cream-300 text-terracotta-600 focus:ring-terracotta-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid & Pagination */}
        <main className="md:col-span-3">
          {/* Active Filter Pills */}
          {(q || selectedCategory || minPrice || maxPrice || minRating || inStock) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-charcoal-500">Active filters:</span>
              {q && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 rounded-full text-xs text-charcoal-700">
                  <span>Search: "{q}"</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('q', '')} />
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 rounded-full text-xs text-charcoal-700">
                  <span>Category: {selectedCategory}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('category', '')} />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 rounded-full text-xs text-charcoal-700">
                  <span>Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      updateParam('minPrice', '');
                      updateParam('maxPrice', '');
                    }}
                  />
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 rounded-full text-xs text-charcoal-700">
                  <span>Rating: {minRating}+ ★</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('minRating', '')} />
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 rounded-full text-xs text-charcoal-700">
                  <span>In Stock</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('inStock', false)} />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-terracotta-600 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParam('page', p)}
          />
        </main>
      </div>
    </div>
  );
}
