import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search, Package, Save, Upload, Loader2, Star, MessageSquare } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockSort, setStockSort] = useState('none');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [editProduct, setEditProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    name: '', description: '', category_id: '', image_url: '', images: [], variants: [], subcategory: '', ingredients: '', precautions: '', storage: '',
    is_active: true, is_bestseller: false, is_trending: false, is_festive: false, is_offer: false, allow_reviews: true, reviews: []
  };
  const [formData, setFormData] = useState(initialForm);
  const [ingredientInput, setIngredientInput] = useState('');
  const [precautionInput, setPrecautionInput] = useState('');
  const [storageInput, setStorageInput] = useState('');

  // Admin Add Review Form State
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [adminReviewName, setAdminReviewName] = useState('');
  const [adminReviewRating, setAdminReviewRating] = useState(5);
  const [adminReviewTitle, setAdminReviewTitle] = useState('');
  const [adminReviewComment, setAdminReviewComment] = useState('');

  const handleAdminAddReview = (e) => {
    e.preventDefault();
    if (!adminReviewName.trim() || !adminReviewComment.trim()) {
      alert('Customer name and review text are required');
      return;
    }
    const newRev = {
      id: Date.now(),
      user_name: adminReviewName.trim(),
      user_email: 'verified_reviewer@grameena.com',
      rating: parseInt(adminReviewRating) || 5,
      title: adminReviewTitle.trim(),
      comment: adminReviewComment.trim(),
      created_at: new Date().toISOString()
    };
    setFormData(f => ({
      ...f,
      reviews: [newRev, ...(Array.isArray(f.reviews) ? f.reviews : [])]
    }));
    setAdminReviewName('');
    setAdminReviewTitle('');
    setAdminReviewComment('');
    setAdminReviewRating(5);
    setShowAddReviewForm(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, stockSort, categoryFilter]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API}/admin/products`, { headers }),
        axios.get(`${API}/admin/categories`, { headers })
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    files.forEach(file => form.append('images', file));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/upload/multiple`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const newUrls = res.data.urls || [];
      setFormData(f => {
        const currentImages = Array.isArray(f.images) ? f.images : (f.image_url ? [f.image_url] : []);
        const combined = [...currentImages, ...newUrls];
        return {
          ...f,
          images: combined,
          image_url: f.image_url || combined[0] || ''
        };
      });
    } catch { 
      alert('Failed to upload image(s)'); 
    } finally { 
      setUploading(false); 
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(f => {
      const currentImages = Array.isArray(f.images) ? f.images : [];
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...f,
        images: updated,
        image_url: updated.length > 0 ? (f.image_url === currentImages[indexToRemove] ? updated[0] : f.image_url) : ''
      };
    });
  };

  const setAsPrimaryImage = (url) => {
    setFormData(f => ({
      ...f,
      image_url: url
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const firstVariant = formData.variants[0] || {};
      const firstPrice = firstVariant.price || formData.price || 0;
      const firstMrp = firstVariant.mrp || formData.mrp || null;
      const totalStock = formData.variants.length > 0 
        ? formData.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
        : (formData.stock || 0);

      const imagesArray = Array.isArray(formData.images) && formData.images.length > 0 
        ? formData.images 
        : (formData.image_url ? [formData.image_url] : []);
      const primaryImg = formData.image_url || imagesArray[0] || '';

      const payload = {
        ...formData,
        price: firstPrice,
        mrp: firstMrp,
        stock: totalStock,
        image_url: primaryImg,
        images: imagesArray,
        subcategory: formData.subcategory,
        ingredients: formData.ingredients,
        precautions: formData.precautions,
        storage: formData.storage
      };
      if (isNew) {
        await axios.post(`${API}/admin/products`, payload, { headers });
      } else {
        await axios.put(`${API}/admin/products/${editProduct.id}`, payload, { headers });
      }
      setEditProduct(null);
      fetchData();
    } catch (err) { 
      console.error('Save product error:', err);
      alert(err.response?.data?.error || 'Failed to save product'); 
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch { alert('Failed to delete'); }
    finally { setIsDeleting(null); }
  };

  const handleToggle = async (id, field, currentValue) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/products/${id}/toggle`, { field, value: !currentValue }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch { alert('Failed to toggle status'); }
  };

  const addVariant = () => setFormData(f => ({
    ...f, 
    variants: [...f.variants, { size: '', price: '', mrp: '', stock: 0 }]
  }));

  const updateVariant = (i, field, val) => {
    const v = [...formData.variants];
    v[i][field] = val;
    setFormData(f => ({ ...f, variants: v }));
  };

  const removeVariant = (i) => {
    const v = [...formData.variants];
    v.splice(i, 1);
    setFormData(f => ({ ...f, variants: v }));
  };

  // Helpers to parse newline or comma separated text into array of points
  const getPointsList = (text) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  };

  const addPointItem = (field, value) => {
    if (!value || !value.trim()) return;
    const current = getPointsList(formData[field]);
    const updated = [...current, value.trim()].join('\n');
    setFormData(f => ({ ...f, [field]: updated }));
  };

  const removePointItem = (field, indexToRemove) => {
    const current = getPointsList(formData[field]);
    const updated = current.filter((_, idx) => idx !== indexToRemove).join('\n');
    setFormData(f => ({ ...f, [field]: updated }));
  };

  // Build SKU rows
  const skuRows = [];
  products.forEach(p => {
    let variants = [];
    try { variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || []); } catch {}
    if (variants.length > 0) {
      variants.forEach((v, vi) => {
        skuRows.push({ product: p, variant: v, vi, skuId: `${p.id}-${vi}` });
      });
    } else {
      skuRows.push({ product: p, variant: null, vi: -1, skuId: `${p.id}-base` });
    }
  });

  const filteredSkus = skuRows.filter(row => {
    const s = search.toLowerCase();
    if (s && !row.product.name?.toLowerCase().includes(s) &&
        !row.variant?.size?.toLowerCase().includes(s)) return false;
    const cat = categories.find(c => c.id === row.product.category_id);
    if (categoryFilter !== 'all' && String(row.product.category_id) !== categoryFilter) return false;
    return true;
  }).sort((a, b) => {
    const stockA = a.variant ? (parseInt(a.variant.stock) || 0) : (parseInt(a.product.stock) || 0);
    const stockB = b.variant ? (parseInt(b.variant.stock) || 0) : (parseInt(b.product.stock) || 0);
    if (stockSort === 'asc') return stockA - stockB;
    if (stockSort === 'desc') return stockB - stockA;
    return 0;
  });

  const totalPages = Math.ceil(filteredSkus.length / itemsPerPage);
  const paginated = filteredSkus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C2B]">Products</h1>
          <p className="text-[#113C2B]/40 text-xs mt-0.5">Manage inventory, variants, and pricing</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#113C2B]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="pl-9 pr-4 py-2 bg-white rounded-xl border border-[#e8dfc8] text-sm focus:outline-none w-full sm:w-56" />
          </div>
          <select value={stockSort} onChange={e => setStockSort(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-[#e8dfc8] text-sm focus:outline-none">
            <option value="none">Stock: Default</option>
            <option value="asc">Stock: Low → High</option>
            <option value="desc">Stock: High → Low</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-[#e8dfc8] text-sm focus:outline-none">
            <option value="all">Category: All</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <button onClick={() => { setFormData(initialForm); setIsNew(true); setEditProduct({}); }}
            className="flex items-center gap-2 bg-[#113C2B] hover:bg-[#F8B319] text-white hover:text-[#113C2B] px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8dfc8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDF9F1] border-b border-[#e8dfc8]">
                <th className="px-4 py-3 text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Product (Variant/Size)</th>
                <th className="px-4 py-3 text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#113C2B]/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfc8]">
              {paginated.map(row => {
                const stock = row.variant ? (parseInt(row.variant.stock) || 0) : (parseInt(row.product.stock) || 0);
                const price = row.variant ? parseFloat(row.variant.price) || 0 : parseFloat(row.product.price) || 0;
                const cat = categories.find(c => c.id === row.product.category_id);
                return (
                  <tr key={row.skuId} className="hover:bg-[#FDF9F1]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#e8dfc8]">
                          {row.product.image_url
                            ? <img src={row.product.image_url} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                          }
                        </div>
                        <div>
                          <div className="font-bold text-[#113C2B] line-clamp-1">{row.product.name}</div>
                          {row.variant && <div className="text-[10px] font-semibold text-gray-500 mb-1">Size: {row.variant.size}</div>}
                          
                          {/* Toggle Pills */}
                          {row.vi <= 0 && ( // Only show on first variant or base product
                            <div className="flex flex-wrap gap-1 mt-1">
                              <button onClick={() => handleToggle(row.product.id, 'is_active', row.product.is_active)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Active</button>
                              <button onClick={() => handleToggle(row.product.id, 'is_bestseller', row.product.is_bestseller)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.is_bestseller ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Bestseller</button>
                              <button onClick={() => handleToggle(row.product.id, 'is_trending', row.product.is_trending)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.is_trending ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Trending</button>
                              <button onClick={() => handleToggle(row.product.id, 'is_festive', row.product.is_festive)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.is_festive ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Festive</button>
                              <button onClick={() => handleToggle(row.product.id, 'is_offer', row.product.is_offer)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.is_offer ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Offer</button>
                              <button onClick={() => handleToggle(row.product.id, 'allow_reviews', row.product.allow_reviews !== false)} className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${row.product.allow_reviews !== false ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                {row.product.allow_reviews !== false ? 'Reviews ON' : 'Reviews OFF'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#113C2B]/70">{cat?.name || 'Uncategorized'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        stock <= 0 ? 'bg-red-100 text-red-700' :
                        stock <= 10 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#113C2B]">₹{price.toFixed(2)}</span>
                        {(row.variant?.mrp || row.product?.mrp) && parseFloat(row.variant?.mrp || row.product?.mrp) > price && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{parseFloat(row.variant?.mrp || row.product?.mrp).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {row.product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {(() => {
                          let revs = [];
                          try { revs = typeof row.product.reviews === 'string' ? JSON.parse(row.product.reviews) : (row.product.reviews || []); } catch {}
                          if (revs.length > 0) {
                            return (
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                {revs.length} {revs.length === 1 ? 'review' : 'reviews'}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => {
                          let variants = [];
                          try { 
                            variants = typeof row.product.variants === 'string' 
                              ? JSON.parse(row.product.variants) 
                              : (row.product.variants || []); 
                            if (!variants || variants.length === 0) {
                              variants = typeof row.product.sizes === 'string'
                                ? JSON.parse(row.product.sizes)
                                : (row.product.sizes || []);
                            }
                          } catch {}
                          let images = [];
                          try {
                            images = typeof row.product.images === 'string'
                              ? JSON.parse(row.product.images)
                              : (row.product.images || []);
                          } catch {}
                          if ((!images || images.length === 0) && row.product.image_url) {
                            images = [row.product.image_url];
                          }
                          let reviews = [];
                          try {
                            reviews = typeof row.product.reviews === 'string'
                              ? JSON.parse(row.product.reviews)
                              : (row.product.reviews || []);
                          } catch {}
                          setFormData({ 
                            ...row.product, 
                            variants, 
                            images: images || [],
                            reviews: reviews || [],
                            allow_reviews: row.product.allow_reviews !== false,
                            is_active: row.product.is_active ?? true,
                            is_bestseller: !!row.product.is_bestseller,
                            is_trending: !!row.product.is_trending,
                            is_festive: !!row.product.is_festive,
                            is_offer: !!row.product.is_offer
                          });
                          setEditProduct(row.product);
                          setIsNew(false);
                        }} className="p-1.5 text-[#113C2B] hover:bg-[#113C2B]/10 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(row.product.id)} disabled={isDeleting === row.product.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50">
                          {isDeleting === row.product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSkus.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-[#113C2B]/50">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#e8dfc8] bg-white">
            <span className="text-sm text-[#113C2B]/60">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSkus.length)} of {filteredSkus.length}
            </span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 border border-[#e8dfc8] rounded-lg text-sm font-semibold text-[#113C2B] hover:bg-[#FDF9F1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 border border-[#e8dfc8] rounded-lg text-sm font-semibold text-[#113C2B] hover:bg-[#FDF9F1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {editProduct !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl">
            <div className="bg-[#FDF9F1] border-b border-[#e8dfc8] px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl font-bold text-[#113C2B]">{isNew ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setEditProduct(null)} className="text-[#113C2B]/50 hover:text-[#113C2B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Product Name</label>
                  <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Category</label>
                  <select value={formData.category_id} onChange={e => {
                      setFormData(f => ({ ...f, category_id: e.target.value, subcategory: '' }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B]">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                {formData.category_id && (() => {
                  const selectedCat = categories.find(c => String(c.id) === String(formData.category_id));
                  let subs = [];
                  if (selectedCat && selectedCat.subcategories) {
                    subs = Array.isArray(selectedCat.subcategories) ? selectedCat.subcategories : (typeof selectedCat.subcategories === 'string' ? JSON.parse(selectedCat.subcategories || '[]') : []);
                  }
                  if (subs.length > 0) {
                    return (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Sub Category</label>
                        <select value={formData.subcategory || ''} onChange={e => setFormData(f => ({ ...f, subcategory: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B]">
                          <option value="">Select Subcategory</option>
                          {subs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Description</label>
                <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B] resize-none" />
              </div>

              {/* Badges & Collection Flags */}
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#e8dfc8]">
                <div className="mb-2.5">
                  <span className="text-xs font-bold text-[#113C2B] block">Collection Highlights & Badges</span>
                  <p className="text-[11px] text-gray-500">Toggle where this product will be showcased on the Home page and store filters</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    formData.is_bestseller ? 'bg-blue-50 border-blue-300 shadow-xs' : 'bg-white border-[#e8dfc8] hover:border-[#113C2B]/30'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.is_bestseller} 
                      onChange={e => setFormData(f => ({ ...f, is_bestseller: e.target.checked }))} 
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#113C2B]">Best Seller</div>
                      <div className="text-[10px] text-gray-500">Home Best Sellers</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    formData.is_trending ? 'bg-purple-50 border-purple-300 shadow-xs' : 'bg-white border-[#e8dfc8] hover:border-[#113C2B]/30'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.is_trending} 
                      onChange={e => setFormData(f => ({ ...f, is_trending: e.target.checked }))} 
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#113C2B]">Trending Now</div>
                      <div className="text-[10px] text-gray-500">Home Trending Section</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    formData.is_festive ? 'bg-orange-50 border-orange-300 shadow-xs' : 'bg-white border-[#e8dfc8] hover:border-[#113C2B]/30'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.is_festive} 
                      onChange={e => setFormData(f => ({ ...f, is_festive: e.target.checked }))} 
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#113C2B]">Festive Special</div>
                      <div className="text-[10px] text-gray-500">Home Festive Section</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    formData.is_offer ? 'bg-red-50 border-red-300 shadow-xs' : 'bg-white border-[#e8dfc8] hover:border-[#113C2B]/30'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={!!formData.is_offer} 
                      onChange={e => setFormData(f => ({ ...f, is_offer: e.target.checked }))} 
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#113C2B]">Special Offer</div>
                      <div className="text-[10px] text-gray-500">Show on Offers Page</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Ingredients */}
                <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#e8dfc8] flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#113C2B]">Ingredients</span>
                      <span className="text-[10px] font-bold bg-[#113C2B]/10 text-[#113C2B] px-2 py-0.5 rounded-full">
                        {getPointsList(formData.ingredients).length} points
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2.5">Add ingredients one by one</p>

                    {/* Integrated Input & Inside Add Button */}
                    <div className="relative flex items-center mb-3">
                      <input 
                        type="text" 
                        value={ingredientInput}
                        onChange={e => setIngredientInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPointItem('ingredients', ingredientInput);
                            setIngredientInput('');
                          }
                        }}
                        placeholder="e.g. Raw Mango, Mustard"
                        className="w-full pl-3 pr-16 py-2 bg-white border border-[#e8dfc8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] shadow-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          addPointItem('ingredients', ingredientInput);
                          setIngredientInput('');
                        }}
                        className="absolute right-1 top-1 bottom-1 px-3 bg-[#113C2B] text-white rounded-lg text-xs font-bold hover:bg-[#F8B319] hover:text-[#113C2B] transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto min-h-[44px] p-2 bg-white/90 rounded-xl border border-[#e8dfc8]/60">
                    {getPointsList(formData.ingredients).length === 0 ? (
                      <span className="text-[11px] text-gray-400 italic p-1">No ingredients added yet</span>
                    ) : (
                      getPointsList(formData.ingredients).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-[#eaf3eb] text-[#113C2B] border border-[#c1e1c5] px-2.5 py-1 rounded-lg text-xs font-medium">
                          {item}
                          <button 
                            type="button" 
                            onClick={() => removePointItem('ingredients', idx)}
                            className="text-gray-400 hover:text-red-500 font-bold ml-0.5 transition-colors"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Precautions & Safety */}
                <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#e8dfc8] flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#113C2B]">Precautions & Safety</span>
                      <span className="text-[10px] font-bold bg-[#113C2B]/10 text-[#113C2B] px-2 py-0.5 rounded-full">
                        {getPointsList(formData.precautions).length} points
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2.5">Add allergen or caution points</p>

                    {/* Integrated Input & Inside Add Button */}
                    <div className="relative flex items-center mb-3">
                      <input 
                        type="text" 
                        value={precautionInput}
                        onChange={e => setPrecautionInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPointItem('precautions', precautionInput);
                            setPrecautionInput('');
                          }
                        }}
                        placeholder="e.g. Contains Mustard Seeds"
                        className="w-full pl-3 pr-16 py-2 bg-white border border-[#e8dfc8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] shadow-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          addPointItem('precautions', precautionInput);
                          setPrecautionInput('');
                        }}
                        className="absolute right-1 top-1 bottom-1 px-3 bg-[#113C2B] text-white rounded-lg text-xs font-bold hover:bg-[#F8B319] hover:text-[#113C2B] transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto min-h-[44px] p-2 bg-white/90 rounded-xl border border-[#e8dfc8]/60">
                    {getPointsList(formData.precautions).length === 0 ? (
                      <span className="text-[11px] text-gray-400 italic p-1">No precautions added yet</span>
                    ) : (
                      getPointsList(formData.precautions).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {item}
                          <button 
                            type="button" 
                            onClick={() => removePointItem('precautions', idx)}
                            className="text-gray-400 hover:text-red-500 font-bold ml-0.5 transition-colors"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Storage & Delivery */}
                <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#e8dfc8] flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#113C2B]">Storage & Delivery</span>
                      <span className="text-[10px] font-bold bg-[#113C2B]/10 text-[#113C2B] px-2 py-0.5 rounded-full">
                        {getPointsList(formData.storage).length} points
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2.5">Add shelf life and handling tips</p>

                    {/* Integrated Input & Inside Add Button */}
                    <div className="relative flex items-center mb-3">
                      <input 
                        type="text" 
                        value={storageInput}
                        onChange={e => setStorageInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPointItem('storage', storageInput);
                            setStorageInput('');
                          }
                        }}
                        placeholder="e.g. Use dry spoon only"
                        className="w-full pl-3 pr-16 py-2 bg-white border border-[#e8dfc8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] shadow-xs"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          addPointItem('storage', storageInput);
                          setStorageInput('');
                        }}
                        className="absolute right-1 top-1 bottom-1 px-3 bg-[#113C2B] text-white rounded-lg text-xs font-bold hover:bg-[#F8B319] hover:text-[#113C2B] transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto min-h-[44px] p-2 bg-white/90 rounded-xl border border-[#e8dfc8]/60">
                    {getPointsList(formData.storage).length === 0 ? (
                      <span className="text-[11px] text-gray-400 italic p-1">No storage tips added yet</span>
                    ) : (
                      getPointsList(formData.storage).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {item}
                          <button 
                            type="button" 
                            onClick={() => removePointItem('storage', idx)}
                            className="text-gray-400 hover:text-red-500 font-bold ml-0.5 transition-colors"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Product Images Gallery (Multiple Images) */}
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#e8dfc8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="text-xs font-bold text-[#113C2B] flex items-center gap-2">
                      <span>Product Gallery & Images</span>
                      <span className="text-[11px] font-semibold bg-[#113C2B]/10 text-[#113C2B] px-2 py-0.5 rounded-full">
                        {Array.isArray(formData.images) ? formData.images.length : (formData.image_url ? 1 : 0)} uploaded
                      </span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">Upload multiple angles / package images. Click "Primary" to choose the main storefront card image.</p>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="img_multi_upload" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleImageUpload} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="img_multi_upload" 
                      className={`inline-flex items-center gap-2 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Upload Images</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Thumbnails grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 pt-2">
                  {(() => {
                    const imgList = Array.isArray(formData.images) && formData.images.length > 0 
                      ? formData.images 
                      : (formData.image_url ? [formData.image_url] : []);
                    
                    if (imgList.length === 0) {
                      return (
                        <div className="col-span-full border border-dashed border-[#e8dfc8] bg-white/60 rounded-xl p-4 text-center">
                          <Package className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                          <p className="text-xs text-gray-400 font-medium">No images uploaded yet. Click "+ Upload Images" to select one or multiple files.</p>
                        </div>
                      );
                    }

                    return imgList.map((url, idx) => {
                      const isPrimary = formData.image_url === url || (idx === 0 && !formData.image_url);
                      return (
                        <div key={idx} className={`relative group rounded-xl overflow-hidden bg-white border-2 shadow-xs transition-all ${isPrimary ? 'border-[#113C2B] ring-2 ring-[#113C2B]/20' : 'border-[#e8dfc8] hover:border-[#113C2B]/40'}`}>
                          <div className="aspect-square w-full overflow-hidden">
                            <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>

                          {/* Primary tag */}
                          {isPrimary && (
                            <span className="absolute top-1 left-1 bg-[#113C2B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Primary
                            </span>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex justify-end">
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-transform active:scale-90"
                                title="Delete image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {!isPrimary && (
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setAsPrimaryImage(url); }}
                                className="w-full bg-[#F8B319] hover:bg-amber-400 text-[#113C2B] text-[10px] font-bold py-1 rounded shadow"
                              >
                                Set Primary
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Variants & Sizes */}
              <div className="border-t border-[#e8dfc8] pt-5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <label className="text-sm font-bold text-[#113C2B]">Variants & Sizes</label>
                    <p className="text-xs text-gray-400 mt-0.5">Define sizes (e.g. 250g, 500g, 1kg) with Our Price, MRP, and Stock</p>
                  </div>
                  <button type="button" onClick={addVariant}
                    className="text-xs bg-[#113C2B] text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#F8B319] hover:text-[#113C2B] font-bold shadow-xs transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {formData.variants.length > 0 ? (
                  <div className="space-y-2">
                    {/* Header Row for Variant Columns */}
                    <div className="grid grid-cols-12 gap-2 px-3 text-[11px] font-bold text-[#113C2B]/60 uppercase tracking-wider">
                      <div className="col-span-4">Size / Weight</div>
                      <div className="col-span-3">Our Price (₹)</div>
                      <div className="col-span-2">MRP (₹)</div>
                      <div className="col-span-2">Stock</div>
                      <div className="col-span-1 text-right"></div>
                    </div>

                    {formData.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <div className="col-span-4">
                          <input 
                            value={v.size} 
                            onChange={e => updateVariant(i, 'size', e.target.value)} 
                            placeholder="e.g. 500g / 1 Litre"
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#113C2B]" 
                          />
                        </div>
                        <div className="col-span-3">
                          <input 
                            type="number" 
                            value={v.price} 
                            onChange={e => updateVariant(i, 'price', e.target.value)} 
                            placeholder="Our Price"
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#113C2B] focus:outline-none focus:border-[#113C2B]" 
                          />
                        </div>
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            value={v.mrp || ''} 
                            onChange={e => updateVariant(i, 'mrp', e.target.value)} 
                            placeholder="MRP"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 focus:outline-none focus:border-[#113C2B]" 
                          />
                        </div>
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            value={v.stock} 
                            onChange={e => updateVariant(i, 'stock', e.target.value)} 
                            placeholder="Stock"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#113C2B]" 
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button 
                            type="button"
                            onClick={() => removeVariant(i)} 
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50/80 p-6 rounded-2xl border border-dashed border-gray-300 text-center">
                    <p className="text-xs text-gray-500 mb-3">No variants added yet. Click below to add product sizes with our price and MRP.</p>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#F8B319] hover:text-[#113C2B] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add First Variant
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Reviews Management in Admin Form */}
              <div className="border-t border-[#e8dfc8] pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-[#113C2B]">Customer Reviews ({Array.isArray(formData.reviews) ? formData.reviews.length : 0})</label>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${formData.allow_reviews !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                        {formData.allow_reviews !== false ? 'Customer Submissions Enabled' : 'Submissions Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Reviews submitted by logged-in customers. You can moderate, delete, or toggle customer reviews permission.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddReviewForm ? 'Cancel' : 'Add Review'}</span>
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#e8dfc8] shadow-xs">
                      <input 
                        type="checkbox" 
                        checked={formData.allow_reviews !== false} 
                        onChange={e => setFormData(f => ({ ...f, allow_reviews: e.target.checked }))} 
                        className="w-4 h-4 text-[#113C2B] rounded focus:ring-[#113C2B]"
                      />
                      <span className="text-xs font-bold text-[#113C2B]">Allow Customers To Review</span>
                    </label>
                  </div>
                </div>

                {/* Admin Add Review Inline Form */}
                {showAddReviewForm && (
                  <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#e8dfc8] mb-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#113C2B]">Add Review on Behalf of Customer / Verified Buyer</span>
                      <button 
                        type="button" 
                        onClick={() => setShowAddReviewForm(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#113C2B] block mb-1">Customer Name *</label>
                        <input
                          type="text"
                          value={adminReviewName}
                          onChange={e => setAdminReviewName(e.target.value)}
                          placeholder="e.g. Ramesh V."
                          className="w-full px-3 py-1.5 bg-white border border-[#e8dfc8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#113C2B] block mb-1">Rating *</label>
                        <select
                          value={adminReviewRating}
                          onChange={e => setAdminReviewRating(parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-[#e8dfc8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B]"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                          <option value="3">⭐⭐⭐ (3 Stars)</option>
                          <option value="2">⭐⭐ (2 Stars)</option>
                          <option value="1">⭐ (1 Star)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#113C2B] block mb-1">Headline (Optional)</label>
                        <input
                          type="text"
                          value={adminReviewTitle}
                          onChange={e => setAdminReviewTitle(e.target.value)}
                          placeholder="e.g. Authentic Flavor"
                          className="w-full px-3 py-1.5 bg-white border border-[#e8dfc8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#113C2B] block mb-1">Review Text *</label>
                      <textarea
                        rows={2}
                        value={adminReviewComment}
                        onChange={e => setAdminReviewComment(e.target.value)}
                        placeholder="Write the customer testimonial or review here..."
                        className="w-full px-3 py-1.5 bg-white border border-[#e8dfc8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddReviewForm(false)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminAddReview}
                        className="px-4 py-1.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        Save Review
                      </button>
                    </div>
                  </div>
                )}

                {Array.isArray(formData.reviews) && formData.reviews.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {formData.reviews.map((rev, revIdx) => (
                      <div key={rev.id || revIdx} className="bg-white p-3.5 rounded-xl border border-[#e8dfc8] flex items-start justify-between gap-3 shadow-xs">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#113C2B]">{rev.user_name || 'Customer'}</span>
                            <span className="text-[10px] text-gray-400">({rev.user_email || 'Verified user'})</span>
                            <div className="flex text-amber-500 ml-1">
                              {[...Array(5)].map((_, s) => (
                                <Star key={s} className={`w-3 h-3 ${s < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {rev.rating || 5}/5
                            </span>
                          </div>
                          {rev.title && <div className="text-xs font-semibold text-gray-800 mb-0.5">{rev.title}</div>}
                          <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                          {rev.created_at && (
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm('Delete this customer review?')) return;
                            setFormData(f => ({
                              ...f,
                              reviews: (f.reviews || []).filter((_, idx) => idx !== revIdx)
                            }));
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/70 p-5 rounded-xl border border-dashed border-[#e8dfc8] text-center">
                    <MessageSquare className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500 font-medium">No customer reviews recorded yet for this product.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">When logged-in customers write reviews on the product details page, they will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#e8dfc8] px-6 py-4 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setEditProduct(null)}
                className="flex-1 px-4 py-2 bg-[#FDF9F1] text-[#113C2B] rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || uploading || !formData.name}
                className="flex-1 px-4 py-2 bg-[#113C2B] text-white rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-[#1A4B3A] transition-colors">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
