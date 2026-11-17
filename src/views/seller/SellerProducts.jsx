import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';
import { productApi } from '../../api/productApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { Plus, Edit3, Trash2, Eye, Search } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import { ConfirmationModal } from '../../components/common/ModalsAndPagination';
import toast from 'react-hot-toast';

export function SellerProducts() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getProducts();
      if (res.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await productApi.deleteProduct(productToDelete._id);
      if (res.success) {
        toast.success('Product deactivated successfully.');
        setDeleteModalOpen(false);
        loadProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DashboardMobileHeader title="My Products" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-900">My Product Listings</h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage inventory, pricing, and active status for your workshop creations
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center space-x-4 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-xs text-charcoal-500">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-cream-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-cream-50 flex-shrink-0"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                          <div className="truncate max-w-[180px]">
                            <p className="font-bold text-charcoal-900 truncate">{prod.name}</p>
                            <p className="text-[10px] text-charcoal-400 truncate">
                              Prep: {prod.preparationTime || '2-4 days'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-600">
                        {prod.categoryId?.name || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-charcoal-900">
                          ₹{Number(prod.price).toLocaleString('en-IN')}
                        </div>
                        {prod.compareAtPrice > prod.price && (
                          <div className="text-[10px] text-charcoal-400 line-through">
                            ₹{Number(prod.compareAtPrice).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 0
                              ? 'text-red-600'
                              : prod.stock <= 5
                              ? 'text-amber-600'
                              : 'text-olive-700'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-charcoal-800">
                          ★ {prod.averageRating || 5.0}
                        </span>{' '}
                        <span className="text-charcoal-400">({prod.reviewCount || 0})</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            prod.status === 'active'
                              ? 'bg-olive-50 text-olive-700 border border-olive-200'
                              : 'bg-cream-100 text-charcoal-500'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/product/${prod._id}`}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-terracotta-600 hover:bg-cream-100"
                            title="Preview on shop"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/seller/products/${prod._id}/edit`}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-olive-700 hover:bg-cream-100"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setProductToDelete(prod);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-red-600 hover:bg-red-50"
                            title="Deactivate Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deactivate confirmation modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Deactivate Product Listing?"
          message={`Are you sure you want to deactivate "${productToDelete?.name}"? It will no longer appear in the public catalog.`}
          confirmText={deleting ? 'Deactivating...' : 'Deactivate Listing'}
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      </main>
    </div>
  );
}
