import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search, Package, Save, Upload, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

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
    name: '', description: '', category_id: '', image_url: '', variants: [], subcategory: '', ingredients: '', precautions: '', storage: ''
  };
  const [formData, setFormData] = useState(initialForm);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/upload`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setFormData(f => ({ ...f, image_url: res.data.url }));
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formData,
        price: formData.variants.length === 0 ? formData.price : null,
        stock: formData.variants.length === 0 ? formData.stock : null,
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
    } catch { alert('Failed to save product'); }
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
    ...f, variants: [...f.variants, { size: '', price: '', stock: 0 }]
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
                    <td className="px-4 py-3 text-sm font-bold text-[#113C2B]">₹{price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {row.product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => {
                          let variants = [];
                          try { variants = typeof row.product.variants === 'string' ? JSON.parse(row.product.variants) : (row.product.variants || []); } catch {}
                          setFormData({ ...row.product, variants });
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
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Ingredients</label>
                  <textarea value={formData.ingredients || ''} onChange={e => setFormData(f => ({ ...f, ingredients: e.target.value }))} rows={2} placeholder="e.g. Mango, Chilli Powder..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B] resize-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Precautions & Safety</label>
                  <textarea value={formData.precautions || ''} onChange={e => setFormData(f => ({ ...f, precautions: e.target.value }))} rows={2} placeholder="e.g. Contains peanuts"
                    className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B] resize-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Storage & Delivery</label>
                  <textarea value={formData.storage || ''} onChange={e => setFormData(f => ({ ...f, storage: e.target.value }))} rows={2} placeholder="e.g. Store in cool place"
                    className="w-full px-3 py-2 rounded-xl bg-[#FDF9F1] border border-[#e8dfc8] focus:outline-none focus:ring-1 focus:ring-[#113C2B] resize-none text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#113C2B]/70 mb-2 block">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-[#e8dfc8] overflow-hidden flex items-center justify-center">
                    {formData.image_url
                      ? <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                      : <Package className="w-6 h-6 text-gray-400" />
                    }
                  </div>
                  <div>
                    <input type="file" id="img_upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label htmlFor="img_upload" className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#113C2B] border border-[#e8dfc8] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                      <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="border-t border-[#e8dfc8] pt-5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <label className="text-sm font-bold text-[#113C2B]">Variants & Sizes</label>
                    <p className="text-[10px] text-gray-400 mt-0.5">Leave empty to use base price & stock below.</p>
                  </div>
                  <button onClick={addVariant}
                    className="text-xs bg-[#113C2B] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#F8B319] hover:text-[#113C2B] transition-colors">
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>

                {formData.variants.length > 0 ? (
                  <div className="space-y-2">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <input value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="Size/Weight (e.g. 500g)"
                          className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none" />
                        <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} placeholder="Price (₹)"
                          className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none" />
                        <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="Stock"
                          className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none" />
                        <button onClick={() => removeVariant(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Base Price (₹)</label>
                      <input type="number" value={formData.price || ''} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#113C2B]" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#113C2B]/70 mb-1 block">Base Stock</label>
                      <input type="number" value={formData.stock || ''} onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#113C2B]" placeholder="0" />
                    </div>
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
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
