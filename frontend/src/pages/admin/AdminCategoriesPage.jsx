import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
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
      const res = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        subcategories: formData.subcategories 
          ? formData.subcategories.split(',').map(s => s.trim()).filter(Boolean) 
          : []
      };
      
      if (editingCategory) {
        await axios.put(`http://localhost:5000/api/admin/categories/${editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/categories', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grameena-600"></div></div>;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', image_url: '', subcategories: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </button>
      </div>

      <div className="admin-card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search categories..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {filtered.map(c => {
          const subs = Array.isArray(c.subcategories) ? c.subcategories : (typeof c.subcategories === 'string' ? JSON.parse(c.subcategories || '[]') : []);
          return (
          <div key={c.id} className="admin-card flex flex-col justify-between">
            <div>
              <div className="h-40 bg-earth-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                {c.image_url ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Image</span>}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description || 'No description provided.'}</p>
              {subs.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Subcategories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {subs.map((s, i) => (
                      <span key={i} className="text-[10px] bg-earth-100 text-gray-700 px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-earth-100">
              <button onClick={() => { 
                setEditingCategory(c); 
                setFormData({
                  ...c, 
                  subcategories: (Array.isArray(c.subcategories) ? c.subcategories : (typeof c.subcategories === 'string' ? JSON.parse(c.subcategories || '[]') : [])).join(', ')
                }); 
                setIsModalOpen(true); 
              }} className="p-2 text-grameena-600 hover:bg-grameena-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        )})}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-earth-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subcategories (comma separated)</label>
                <input type="text" placeholder="e.g. Veg, Non-Veg, Sweets" className="input-field" value={formData.subcategories} onChange={(e) => setFormData({...formData, subcategories: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input type="text" className="input-field" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows="3" className="input-field" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
