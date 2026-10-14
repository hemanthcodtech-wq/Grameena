import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Percent, Layers, ShoppingBag, Check, X, ShieldAlert } from 'lucide-react';

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection mode states in modal
  const [categoryScope, setCategoryScope] = useState('all'); // 'all' or 'specific'
  const [productScope, setProductScope] = useState('all'); // 'all' or 'specific'
  const [productSearch, setProductSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    discount_percentage: '',
    description: '',
    valid_until: '',
    is_active: true,
    applicable_categories: [],
    applicable_products: []
  });
  const [editingId, setEditingId] = useState(null);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/offers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const [catsRes, prodsRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/api/admin/categories`, { headers }),
        axios.get(`${apiUrl}/api/admin/products`, { headers })
      ]);

      if (catsRes.status === 'fulfilled') setCategories(catsRes.value.data || []);
      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value.data || []);
    } catch (err) {
      console.error('Error fetching auxiliary data:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchAuxData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      discount_percentage: '',
      description: '',
      valid_until: '',
      is_active: true,
      applicable_categories: [],
      applicable_products: []
    });
    setCategoryScope('all');
    setProductScope('all');
    setProductSearch('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      applicable_categories: categoryScope === 'specific' ? formData.applicable_categories : [],
      applicable_products: productScope === 'specific' ? formData.applicable_products : []
    };

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/offers/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/offers`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error saving offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    let cats = [];
    if (offer.applicable_categories) {
      cats = typeof offer.applicable_categories === 'string'
        ? JSON.parse(offer.applicable_categories)
        : offer.applicable_categories;
    }

    let prods = [];
    if (offer.applicable_products) {
      prods = typeof offer.applicable_products === 'string'
        ? JSON.parse(offer.applicable_products)
        : offer.applicable_products;
    }

    setFormData({
      title: offer.title,
      discount_percentage: offer.discount_percentage,
      description: offer.description || '',
      valid_until: offer.valid_until ? new Date(offer.valid_until).toISOString().slice(0, 16) : '',
      is_active: offer.is_active,
      applicable_categories: Array.isArray(cats) ? cats : [],
      applicable_products: Array.isArray(prods) ? prods.map(p => String(p)) : []
    });

    setCategoryScope(Array.isArray(cats) && cats.length > 0 ? 'specific' : 'all');
    setProductScope(Array.isArray(prods) && prods.length > 0 ? 'specific' : 'all');
    setEditingId(offer.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      setDeletingId(id);
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/offers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchOffers();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const toggleCategory = (catName) => {
    setFormData(prev => {
      const exists = prev.applicable_categories.includes(catName);
      return {
        ...prev,
        applicable_categories: exists
          ? prev.applicable_categories.filter(c => c !== catName)
          : [...prev.applicable_categories, catName]
      };
    });
  };

  const toggleProduct = (prodId) => {
    const idStr = String(prodId);
    setFormData(prev => {
      const exists = prev.applicable_products.includes(idStr);
      return {
        ...prev,
        applicable_products: exists
          ? prev.applicable_products.filter(p => p !== idStr)
          : [...prev.applicable_products, idStr]
      };
    });
  };

  const filteredOffers = offers.filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredModalProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#113C2B]">Offers & Discounts</h1>
          <p className="text-gray-500 mt-1">Manage promotional offers applicable to specific categories or products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#F8B319] hover:bg-[#e09c13] text-[#113C2B] font-bold px-6 py-2.5 rounded-xl flex items-center shadow-md transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Offer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Offer Title</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Target Scope</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading offers...</td></tr>
              ) : filteredOffers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No offers found</td></tr>
              ) : (
                filteredOffers.map((offer) => {
                  let cats = [];
                  if (offer.applicable_categories) {
                    cats = typeof offer.applicable_categories === 'string'
                      ? JSON.parse(offer.applicable_categories)
                      : offer.applicable_categories;
                  }
                  let prods = [];
                  if (offer.applicable_products) {
                    prods = typeof offer.applicable_products === 'string'
                      ? JSON.parse(offer.applicable_products)
                      : offer.applicable_products;
                  }

                  const hasCats = Array.isArray(cats) && cats.length > 0;
                  const hasProds = Array.isArray(prods) && prods.length > 0;
                  const isUniversal = !hasCats && !hasProds;

                  return (
                    <tr key={offer.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#113C2B] flex items-center gap-2">
                          <Percent className="w-4 h-4 text-[#F8B319]" />
                          {offer.title}
                        </div>
                        {offer.description && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{offer.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                          {offer.discount_percentage}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {isUniversal && (
                            <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full w-max">
                              All Products & Categories
                            </span>
                          )}
                          {hasCats && (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full w-max">
                              <Layers className="w-3 h-3" />
                              {cats.length} {cats.length === 1 ? 'Category' : 'Categories'} ({cats.slice(0, 2).join(', ')}{cats.length > 2 ? '...' : ''})
                            </span>
                          )}
                          {hasProds && (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full w-max">
                              <ShoppingBag className="w-3 h-3" />
                              {prods.length} Specific {prods.length === 1 ? 'Product' : 'Products'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${offer.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(offer)} className="text-gray-400 hover:text-[#113C2B] transition-colors" title="Edit Offer">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(offer.id)} 
                            disabled={deletingId === offer.id}
                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete Offer"
                          >
                            {deletingId === offer.id ? (
                              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#113C2B] flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#113C2B]">{editingId ? 'Edit Offer' : 'Add New Offer'}</h3>
                  <p className="text-xs text-gray-500">Configure promotional discount and applicable items</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Offer Basics */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B]"
                    placeholder="e.g. Traditional Pickles Mega Sale"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B]"
                      placeholder="e.g. 15.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Valid Until (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.valid_until}
                      onChange={e => setFormData({...formData, valid_until: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B]"
                    placeholder="e.g. Get 15% off on all cold-pressed oils & spicy homemade pickles"
                  />
                </div>
              </div>

              {/* TARGET RESTRICTIONS SECTION */}
              <div className="pt-4 border-t border-gray-200 space-y-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-700">
                    Applicable Eligibility (Categories & Products)
                  </h4>
                </div>

                {/* 1. Category Scope */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#113C2B] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" /> Category Eligibility
                    </span>
                    <div className="flex bg-gray-200/70 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => { setCategoryScope('all'); setFormData({...formData, applicable_categories: []}); }}
                        className={`px-3 py-1 rounded-md transition-all ${categoryScope === 'all' ? 'bg-white text-[#113C2B] shadow-sm' : 'text-gray-600'}`}
                      >
                        All Categories
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryScope('specific')}
                        className={`px-3 py-1 rounded-md transition-all ${categoryScope === 'specific' ? 'bg-[#113C2B] text-white shadow-sm' : 'text-gray-600'}`}
                      >
                        Specific Categories
                      </button>
                    </div>
                  </div>

                  {categoryScope === 'specific' && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-500">Select categories eligible for this discount:</p>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                        {categories.map(c => {
                          const isSelected = formData.applicable_categories.includes(c.name);
                          return (
                            <button
                              type="button"
                              key={c.id || c.name}
                              onClick={() => toggleCategory(c.name)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-[#113C2B] text-white border-[#113C2B]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3 text-[#F8B319]" /> : <Plus className="w-3 h-3 text-gray-400" />}
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      {formData.applicable_categories.length > 0 && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Selected: {formData.applicable_categories.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Product Scope */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#113C2B] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" /> Product Eligibility
                    </span>
                    <div className="flex bg-gray-200/70 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => { setProductScope('all'); setFormData({...formData, applicable_products: []}); }}
                        className={`px-3 py-1 rounded-md transition-all ${productScope === 'all' ? 'bg-white text-[#113C2B] shadow-sm' : 'text-gray-600'}`}
                      >
                        All Products
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductScope('specific')}
                        className={`px-3 py-1 rounded-md transition-all ${productScope === 'specific' ? 'bg-[#113C2B] text-white shadow-sm' : 'text-gray-600'}`}
                      >
                        Specific Products
                      </button>
                    </div>
                  </div>

                  {productScope === 'specific' && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Search product to include..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#113C2B]"
                      />
                      
                      <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-white">
                        {filteredModalProducts.length === 0 ? (
                          <p className="text-xs text-gray-400 p-2 text-center">No products found</p>
                        ) : (
                          filteredModalProducts.map(p => {
                            const pIdStr = String(p.id);
                            const isSelected = formData.applicable_products.includes(pIdStr);
                            return (
                              <div
                                key={p.id}
                                onClick={() => toggleProduct(p.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                  isSelected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="w-4 h-4 text-[#113C2B] rounded border-gray-300 pointer-events-none"
                                  />
                                  <div className="truncate">
                                    <span className="font-semibold text-gray-800">{p.name}</span>
                                    <span className="text-[10px] text-gray-400 ml-2">({p.category || 'General'})</span>
                                  </div>
                                </div>
                                <span className="text-gray-500 font-mono text-[11px] flex-shrink-0">
                                  ₹{p.sizes && p.sizes[0]?.price ? p.sizes[0].price : '—'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {formData.applicable_products.length > 0 && (
                        <div className="flex items-center justify-between text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          <span>{formData.applicable_products.length} product(s) selected</span>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, applicable_products: []})}
                            className="text-red-500 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 text-[#113C2B] rounded border-gray-300 focus:ring-[#113C2B]"
                  />
                  <label htmlFor="is_active" className="ml-2 font-medium text-gray-700 cursor-pointer text-sm">
                    Offer is Active
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] shadow-md transition-colors flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Save Changes' : 'Create Offer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersPage;
