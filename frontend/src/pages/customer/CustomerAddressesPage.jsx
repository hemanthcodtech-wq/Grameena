import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Phone, 
  Home, 
  Briefcase, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerAddressesPage = () => {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    mobile: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
    country: 'India',
    is_default: false
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAddresses();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      name: addr.name || '',
      mobile: addr.mobile || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || 'Andhra Pradesh',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      is_default: !!addr.is_default
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await axios.delete(`${API_URL}/api/auth/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await axios.put(`${API_URL}/api/auth/address/${addr.id}`, {
        ...addr,
        is_default: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.mobile || !formData.line1 || !formData.city || !formData.pincode) {
      return setFormError('Please fill all required fields');
    }

    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingId) {
        await axios.put(`${API_URL}/api/auth/address/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/api/auth/address`, formData, config);
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8dfc8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#113C2B]">Saved Addresses</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage your delivery destinations for quick checkout and order dispatch.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address cards list */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-[#113C2B] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[#113C2B] font-medium text-xs">Loading saved addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#e8dfc8] shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF4E6] border border-[#eedfc0] flex items-center justify-center mx-auto mb-4 text-[#113C2B]">
            <MapPin className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#113C2B]">No saved addresses</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            Add your primary shipping address to enjoy seamless 1-click checkout.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#113C2B] text-white rounded-xl text-xs font-bold hover:bg-[#1A4B3A] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative shadow-sm hover:shadow-md ${
                addr.is_default ? 'border-[#113C2B] ring-2 ring-[#113C2B]/10' : 'border-[#e8dfc8]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#113C2B]">{addr.name}</span>
                    {addr.is_default && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 hover:text-[#113C2B] hover:bg-[#FAF4E6] rounded-lg transition-colors"
                      title="Edit Address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state} - <span className="font-semibold text-gray-800">{addr.pincode}</span></p>
                  <p className="font-medium text-gray-500 pt-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {addr.mobile}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#f0e8d5] flex items-center justify-between">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Primary Delivery Location
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#e8dfc8] shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f0e8d5]">
                <h3 className="font-serif font-bold text-lg text-[#113C2B]">
                  {editingId ? 'Edit Address' : 'Add New Delivery Address'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address Line 1 (Flat, House No, Street) *</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat / Building No, Street"
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address Line 2 (Area, Landmark)</label>
                  <input
                    type="text"
                    placeholder="Near temple, colony, area"
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vijayawada"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Andhra Pradesh"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-bold text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="6 digits"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-[#113C2B] rounded border-[#e8dfc8] focus:ring-[#113C2B]"
                  />
                  <label htmlFor="is_default" className="text-gray-700 font-semibold cursor-pointer">
                    Set this as my default delivery address
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0e8d5]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
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

export default CustomerAddressesPage;
