import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { DashboardSidebar, DashboardMobileHeader, DashboardStatCard} from '../../components/dashboard/DashboardLayout';
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingAndEmpty';
import toast from 'react-hot-toast';

export function SellerProductForm() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    materials: '',
    dimensions: '',
    weight: '',
    preparationTime: '2-4 business days',
    images: [''],
    status: 'active',
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const catRes = await categoryApi.getCategories();
        if (catRes.success) {
          setCategories(catRes.data.categories || []);
        }

        if (isEditing) {
          const prodRes = await productApi.getProduct(productId);
          if (prodRes.success && prodRes.data?.product) {
            const p = prodRes.data.product;
            setForm({
              name: p.name || '',
              description: p.description || '',
              categoryId: p.categoryId?._id || p.categoryId || '',
              price: p.price || '',
              compareAtPrice: p.compareAtPrice || '',
              stock: p.stock ?? '',
              materials: p.materials || '',
              dimensions: p.dimensions || '',
              weight: p.weight || '',
              preparationTime: p.preparationTime || '2-4 business days',
              images: p.images?.length > 0 ? p.images : [''],
              status: p.status || 'active',
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load initial form data');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [productId, isEditing]);

  const handleImageChange = (index, value) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ''] });
  };

  const removeImageField = (index) => {
    if (form.images.length <= 1) {
      setForm({ ...form, images: [''] });
      return;
    }
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated });
  };

  // Support local sample image upload or Cloudinary
  const handleFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await productApi.uploadImage({ image: reader.result });
        if (res.success && res.data?.url) {
          handleImageChange(index, res.data.url);
          toast.success('Image attached successfully!');
        }
      } catch (err) {
        toast.error('Image upload failed');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validImages = form.images.filter((img) => img && img.trim().length > 0);
    if (validImages.length === 0) {
      toast.error('Please provide at least one valid product image URL.');
      return;
    }

    if (!form.categoryId) {
      toast.error('Please select a craft category.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      price: parseFloat(form.price),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : 0,
      stock: parseInt(form.stock, 10),
      materials: form.materials.trim(),
      dimensions: form.dimensions.trim(),
      weight: form.weight.trim(),
      preparationTime: form.preparationTime.trim(),
      images: validImages,
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEditing) {
        const res = await productApi.updateProduct(productId, payload);
        if (res.success) {
          toast.success('Product updated successfully!');
          navigate('/seller/products');
        }
      } else {
        const res = await productApi.createProduct(payload);
        if (res.success) {
          toast.success('Handmade product listed successfully!');
          navigate('/seller/products');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-ivory">
        <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <DashboardMobileHeader title="Product Form" onMenuOpen={() => setMobileOpen(true)} />
      <main className="flex-1 p-10 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <DashboardSidebar role="seller" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-cream-50/50 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-cream-200">
          <Link
            to="/seller/products"
            className="p-2 rounded-lg bg-white border border-cream-200 text-charcoal-700 hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal-900">
              {isEditing ? 'Edit Product Listing' : 'Publish New Handmade Creation'}
            </h1>
            <p className="text-xs text-charcoal-500">
              Provide thorough specifications to showcase the authenticity of your handmade piece
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 text-xs">
          {/* 1. Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-sm text-charcoal-900 uppercase tracking-wider pb-2 border-b border-cream-100">
              1. General Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-charcoal-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Speckled Terracotta Serving Bowl"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Craft Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Listing Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                >
                  <option value="active">Active (Visible in Catalog)</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-charcoal-700 mb-1">
                  Artisan Description & Craft Story * (min 15 characters)
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your creative process, the traditional tools used, and special care instructions..."
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. Pricing & Inventory */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-sm text-charcoal-900 uppercase tracking-wider pb-2 border-b border-cream-100">
              2. Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="1250"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  placeholder="1500 (optional discount)"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 3. Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-sm text-charcoal-900 uppercase tracking-wider pb-2 border-b border-cream-100">
              3. Craft Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Handmade Materials</label>
                <input
                  type="text"
                  value={form.materials}
                  onChange={(e) => setForm({ ...form, materials: e.target.value })}
                  placeholder="e.g. Sheesham wood, Brass inlays, Organic beeswax"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="e.g. 10 x 8 x 2 inches"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Product Weight</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g. 650 g"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Artisan Prep Time</label>
                <input
                  type="text"
                  value={form.preparationTime}
                  onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                  placeholder="e.g. 2-4 business days"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Product Images */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-cream-100">
              <h2 className="font-serif font-bold text-sm text-charcoal-900 uppercase tracking-wider">
                4. Product Images *
              </h2>
              <button
                type="button"
                onClick={addImageField}
                className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Image</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-cream-50/60 p-3 rounded-xl border border-cream-200">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-12 h-12 rounded-lg object-cover bg-white flex-shrink-0"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop'}}
          />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-cream-200 flex items-center justify-center text-charcoal-400 flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <input
                    type="url"
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="flex-1 px-3 py-2 bg-white border border-cream-200 rounded-lg text-xs focus:outline-none focus:border-terracotta-500"
                  />

                  {/* Upload file fallback */}
                  <label className="p-2 bg-white hover:bg-cream-100 border border-cream-300 rounded-lg cursor-pointer text-charcoal-700" title="Upload local image">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, idx)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="p-2 text-charcoal-400 hover:text-red-600 rounded-lg"
                    title="Remove image field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link
              to="/seller/products"
              className="px-6 py-3 border border-cream-300 hover:bg-cream-100 text-charcoal-700 rounded-xl font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl shadow-md shadow-terracotta-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving Creation...' : isEditing ? 'Update Listing' : 'Publish Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
