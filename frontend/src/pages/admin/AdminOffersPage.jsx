import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Percent } from 'lucide-react';

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    discount_percentage: '',
    is_active: true
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

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/offers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/offers`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setIsModalOpen(false);
      setFormData({ title: '', discount_percentage: '', is_active: true });
      setEditingId(null);
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert('Error saving offer');
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      discount_percentage: offer.discount_percentage,
      is_active: offer.is_active
    });
    setEditingId(offer.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/offers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchOffers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredOffers = offers.filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#113C2B]">Offers & Discounts</h1>
          <p className="text-gray-500 mt-1">Manage promotional offers and sales</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', discount_percentage: '', is_active: true });
            setEditingId(null);
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
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading offers...</td></tr>
              ) : filteredOffers.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No offers found</td></tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#113C2B] flex items-center gap-2">
                        <Percent className="w-4 h-4 text-[#F8B319]" />
                        {offer.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                        {offer.discount_percentage}% OFF
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${offer.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(offer)} className="text-gray-400 hover:text-[#113C2B] transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(offer.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-[#113C2B]">{editingId ? 'Edit Offer' : 'Add New Offer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B]"
                    placeholder="e.g. Festival Special Offer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B]"
                    placeholder="e.g. 15.00"
                  />
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 text-[#113C2B] rounded border-gray-300 focus:ring-[#113C2B]"
                  />
                  <label htmlFor="is_active" className="ml-2 font-medium text-gray-700 cursor-pointer">Offer is Active</label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#113C2B] hover:bg-[#1A4B3A] shadow-md transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Create Offer'}
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
