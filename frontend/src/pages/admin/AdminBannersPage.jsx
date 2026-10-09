import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // stores id of banner being deleted
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
        is_active: banner.is_active
      });
    } else {
      setIsEditing(false);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add or update homepage banners</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#113C2B] hover:bg-[#1A4B3A] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <motion.div 
            key={banner.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="relative h-48 w-full bg-gray-100 border-b border-gray-200 flex items-center justify-center overflow-hidden group">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
              {(banner.heading || banner.sub_content) && (
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-white font-bold text-xl mb-1">{banner.heading}</h4>
                  <p className="text-white/80 text-sm">{banner.sub_content}</p>
                </div>
              )}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {banner.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {banner.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{banner.title}</h3>
              <p className="text-sm text-gray-500 mb-4 truncate">Link: {banner.link_url || 'None'}</p>
              
              <div className="flex items-center gap-3 mt-4">
                <button 
                  onClick={() => handleOpenModal(banner)}
                  disabled={isDeleting === banner.id}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  disabled={isDeleting === banner.id}
                  className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting === banner.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                  {isDeleting === banner.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={() => !isSaving && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={isSaving}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title (Internal)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
                  placeholder="e.g., Diwali Offer Banner" 
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      disabled={isSaving || isUploading}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        setIsUploading(true);
                        try {
                          const uploadData = new FormData();
                          uploadData.append('image', file);
                          
                          const uploadRes = await axios.post(`${API}/upload`, uploadData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          
                          setFormData({...formData, image_url: uploadRes.data.url});
                        } catch (err) {
                          console.error('Image upload failed', err);
                          alert('Failed to upload image. Please try again.');
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#113C2B] file:text-white hover:file:bg-[#1A4B3A] disabled:opacity-50" 
                    />
                    {isUploading && <p className="text-xs text-[#F8B319] mt-1 font-semibold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading image...</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Upload a high-resolution image for best results.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Heading (Optional)</label>
                <input 
                  type="text" 
                  value={formData.heading} 
                  onChange={e => setFormData({...formData, heading: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
                  placeholder="e.g., Authentic Pickles"
                  disabled={isSaving} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Sub-content (Optional)</label>
                <textarea 
                  rows={2}
                  value={formData.sub_content} 
                  onChange={e => setFormData({...formData, sub_content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none resize-none" 
                  placeholder="e.g., Shop our traditional pickles now" 
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect Link (Optional)</label>
                <input 
                  type="text" 
                  value={formData.link_url} 
                  onChange={e => setFormData({...formData, link_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
                  placeholder="e.g., /products" 
                  disabled={isSaving}
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-2">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#113C2B] rounded border-gray-300 focus:ring-[#113C2B]" 
                  disabled={isSaving}
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">Set as Active</label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="px-4 py-2 bg-[#113C2B] hover:bg-[#1A4B3A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Saving...' : (isEditing ? 'Update Banner' : 'Save Banner')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
