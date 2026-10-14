import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle, Loader2, UploadCloud, Link as LinkIcon, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const initialForm = {
    id: null,
    title: '',
    image_url: '',
    link_url: '',
    heading: '',
    sub_content: '',
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setIsEditing(true);
      setFormData({
        id: banner.id,
        title: banner.title || '',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
        heading: banner.heading || '',
        sub_content: banner.sub_content || '',
        is_active: banner.is_active ?? true
      });
    } else {
      setIsEditing(false);
      setFormData(initialForm);
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
      const uploadRes = await axios.post(`${API}/upload`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: uploadRes.data.url }));
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Failed to upload image. Please try again or paste image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a banner title.');
      return;
    }
    if (!formData.image_url.trim()) {
      alert('Please upload or provide a banner image URL.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        title: formData.title,
        image_url: formData.image_url,
        link_url: formData.link_url,
        heading: formData.heading,
        sub_content: formData.sub_content,
        is_active: formData.is_active
      };

      if (isEditing) {
        await axios.put(`${API}/admin/banners/${formData.id}`, payload, { headers });
      } else {
        await axios.post(`${API}/admin/banners`, payload, { headers });
      }
      
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#113C2B] flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
            <Layers className="w-6 h-6 text-[#113C2B]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-gray-900 tracking-tight">
              Homepage Banners
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage promotional sliders, hero graphics & links ({banners.length} total)
            </p>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#113C2B] hover:bg-[#1A4B3A] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 text-[#F8B319]" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">No homepage banners yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Add seasonal festival banners, special discount announcements or hero sliders.
          </p>
          <button 
            onClick={() => handleOpenModal()} 
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#113C2B] bg-[#113C2B]/10 hover:bg-[#113C2B]/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {banners.map((banner) => (
            <motion.div 
              key={banner.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col justify-between overflow-hidden group hover:shadow-md"
            >
              <div>
                {/* Banner Graphic Preview */}
                <div className="relative aspect-[16/9] w-full bg-stone-100 border-b border-stone-100 flex items-center justify-center overflow-hidden">
                  {banner.image_url ? (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 gap-1">
                      <ImageIcon className="h-10 w-10 stroke-[1.5]" />
                      <span className="text-xs">No Graphic</span>
                    </div>
                  )}

                  {/* Text Overlay Simulation */}
                  {(banner.heading || banner.sub_content) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      {banner.heading && (
                        <h4 className="font-bold text-sm sm:text-base leading-tight font-serif text-[#F8B319]">
                          {banner.heading}
                        </h4>
                      )}
                      {banner.sub_content && (
                        <p className="text-xs text-white/90 line-clamp-1 mt-0.5">
                          {banner.sub_content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Indicator Badge */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-md ${
                    banner.is_active 
                      ? 'bg-emerald-600/90 text-white' 
                      : 'bg-red-600/90 text-white'
                  }`}>
                    {banner.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {banner.is_active ? 'Live on Store' : 'Draft / Inactive'}
                  </div>
                </div>
                
                {/* Banner Content Details */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-[#113C2B] transition-colors truncate">
                    {banner.title}
                  </h3>
                  
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                    <LinkIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">
                      {banner.link_url ? banner.link_url : <span className="italic text-stone-400">No redirect URL</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-stone-400">
                  ID: #{banner.id}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(banner)}
                    disabled={isDeleting === banner.id}
                    className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200/80 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Edit2 size={14} className="text-emerald-700" /> 
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    disabled={isDeleting === banner.id}
                    className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200/80 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-sm"
                  >
                    {isDeleting === banner.id ? <Loader2 size={14} className="animate-spin text-red-600" /> : <Trash2 size={14} className="text-red-600" />} 
                    <span className="hidden sm:inline">{isDeleting === banner.id ? 'Deleting' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Responsive Modal (Bottom sheet on mobile, centered dialog on desktop) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] border border-stone-200"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/70 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#113C2B]">
                    <Layers className="w-5 h-5 text-[#113C2B]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                      {isEditing ? 'Edit Homepage Banner' : 'Add New Homepage Banner'}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      {isEditing ? `Updating banner #${formData.id}` : 'Display customized promotions on the storefront'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => !isSaving && setIsModalOpen(false)} 
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-stone-200/50 transition-colors disabled:opacity-50" 
                  disabled={isSaving}
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              {/* Modal Scrollable Body */}
              <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Banner Title (Internal Identifier) *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all" 
                    placeholder="e.g. Dasara & Diwali Festival Special" 
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Banner Graphic *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="w-24 h-16 rounded-lg bg-stone-200 overflow-hidden shrink-0 flex items-center justify-center border border-stone-300">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-400" />
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
                            disabled={isSaving || isUploading}
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
                        placeholder="Or paste banner image URL..." 
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#113C2B]"
                        value={formData.image_url} 
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Recommended resolution: 1920x600 for wide desktop & responsive mobile view.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Overlay Heading (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={formData.heading} 
                      onChange={e => setFormData({...formData, heading: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all" 
                      placeholder="e.g. 100% Authentic Pickles"
                      disabled={isSaving} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Redirect Link (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={formData.link_url} 
                      onChange={e => setFormData({...formData, link_url: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all" 
                      placeholder="e.g. /products or /offers" 
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Overlay Subtext (Optional)
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.sub_content} 
                    onChange={e => setFormData({...formData, sub_content: e.target.value})}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all resize-none" 
                    placeholder="e.g. Freshly handcrafted with cold-pressed gingelly oil." 
                    disabled={isSaving}
                  />
                </div>
                
                {/* Active Toggle Switch */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <label htmlFor="active" className="text-xs font-bold text-gray-900 cursor-pointer block">
                      Active on Homepage
                    </label>
                    <span className="text-[11px] text-stone-500">
                      When enabled, this banner will appear in customer storefront rotation.
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    id="active" 
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 accent-[#113C2B] rounded cursor-pointer" 
                    disabled={isSaving}
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
                    {isSaving && <Loader2 size={16} className="animate-spin text-[#F8B319]" />}
                    {isSaving ? 'Saving...' : (isEditing ? 'Update Banner' : 'Publish Banner')}
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

export default AdminBannersPage;
