import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search, FolderTree, Tag, UploadCloud, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    subcategories: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      const subs = Array.isArray(category.subcategories)
        ? category.subcategories
        : (typeof category.subcategories === 'string' ? JSON.parse(category.subcategories || '[]') : []);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image_url: category.image_url || '',
        subcategories: subs.join(', ')
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        subcategories: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await axios.post(`${API}/upload`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please enter URL manually or try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        subcategories: formData.subcategories 
          ? formData.subcategories.split(',').map(s => s.trim()).filter(Boolean) 
          : []
      };
      
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category may be affected.')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#113C2B] flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
            <FolderTree className="w-6 h-6 text-[#113C2B]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-gray-900 tracking-tight">
              Categories
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Organize products, subcategories & store displays ({categories.length} total)
            </p>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()} 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#113C2B] hover:bg-[#1A4B3A] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 text-[#F8B319]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Bar & Stat Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-stone-200/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search categories by name or keyword..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113C2B] focus:bg-white transition-all"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-xs font-medium text-gray-500 text-right sm:text-left shrink-0 px-1">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of {categories.length}
        </div>
      </div>

      {/* Categories Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-400">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No categories found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? `No category matches "${searchTerm}". Try a different search.` : "Start by creating your first product category."}
          </p>
          <button 
            onClick={() => handleOpenModal()} 
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#113C2B] bg-[#113C2B]/10 hover:bg-[#113C2B]/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(c => {
            const subs = Array.isArray(c.subcategories) 
              ? c.subcategories 
              : (typeof c.subcategories === 'string' ? JSON.parse(c.subcategories || '[]') : []);

            return (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl shadow-sm border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col justify-between overflow-hidden group hover:shadow-md"
              >
                <div>
                  {/* Category Image Header */}
                  <div className="relative h-44 sm:h-48 bg-stone-100 w-full overflow-hidden flex items-center justify-center border-b border-stone-100">
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        alt={c.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                        <FolderTree className="w-10 h-10 stroke-[1.5]" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-[#113C2B]/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-1 shadow-sm">
                      <Tag className="w-3 h-3 text-[#F8B319]" />
                      <span>{subs.length} {subs.length === 1 ? 'Sub' : 'Subs'}</span>
                    </div>
                  </div>

                  {/* Category Body */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#113C2B] transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {c.description || <span className="italic text-gray-400">No description provided.</span>}
                    </p>

                    {/* Subcategories list */}
                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                        Subcategories
                      </span>
                      {subs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {subs.map((s, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-amber-500/10 text-[#113C2B] font-medium px-2.5 py-0.5 rounded-md border border-amber-500/20"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">None configured</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-stone-400 truncate">
                    ID: #{c.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleOpenModal(c)} 
                      className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200/80 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)} 
                      disabled={deletingId === c.id}
                      className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200/80 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-sm"
                      title="Delete Category"
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      )}
                      <span className="hidden sm:inline">{deletingId === c.id ? 'Deleting' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Responsive Modal (Bottom sheet on mobile, centered modal on desktop) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/70 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#113C2B]">
                    <FolderTree className="w-5 h-5 text-[#113C2B]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      {editingCategory ? `Updating #${editingCategory.id}` : 'Fill in the category specifications'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => !isSaving && setIsModalOpen(false)}
                  disabled={isSaving}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-stone-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Category Name *
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Traditional Andhra Pickles"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Subcategories (Comma separated)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Veg Pickles, Non-Veg Pickles, Podulu" 
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all" 
                    value={formData.subcategories} 
                    onChange={(e) => setFormData({...formData, subcategories: e.target.value})} 
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Separate multiple subcategories with a comma (e.g. Sweets, Hot Snacks, Savory)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Category Banner / Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="w-20 h-20 rounded-lg bg-stone-200 overflow-hidden shrink-0 flex items-center justify-center border border-stone-300">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FolderTree className="w-6 h-6 text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#113C2B] bg-[#113C2B]/10 hover:bg-[#113C2B]/20 px-3 py-2 rounded-lg transition-colors">
                          <UploadCloud className="w-4 h-4 text-[#F8B319]" />
                          <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            disabled={isUploading || isSaving}
                            className="hidden" 
                            onChange={handleImageUpload} 
                          />
                        </label>
                        {formData.image_url && (
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, image_url: ''})}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input 
                        type="url" 
                        placeholder="Or paste image URL directly..." 
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#113C2B]"
                        value={formData.image_url} 
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Description
                  </label>
                  <textarea 
                    rows="3" 
                    placeholder="Brief description for customer catalog and search..." 
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all resize-none" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={isSaving}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving || isUploading}
                    className="inline-flex items-center gap-2 bg-[#113C2B] hover:bg-[#1A4B3A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin text-[#F8B319]" />}
                    {isSaving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoriesPage;
