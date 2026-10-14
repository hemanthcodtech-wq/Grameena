import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Store, Mail, Phone, MapPin, Globe, Megaphone, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const AdminSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newScrollerMsg, setNewScrollerMsg] = useState('');
  
  const [newTestimonial, setNewTestimonial] = useState({ name: '', location: '', text: '' });

  const defaultSettings = {
    siteName: 'Grameena Bharatham',
    tagline: 'The Taste of Rural Andhra',
    email: 'sudhakar.moparru@gmail.com',
    phone: '+91 81436 80630',
    address: 'JKC Road, Guntur, Andhra Pradesh - 520006',
    facebook: '#',
    instagram: 'https://www.instagram.com/grameenabharatham',
    whatsapp: 'https://wa.me/+918143680630',
    youtube: '',
    twitter: '',
    scrollerMessages: [
      '✨ 100% Homemade & Authentic Andhra Pickles & Snacks',
      '🚚 Free Shipping on Orders above ₹999',
      '🌿 Zero Preservatives, Made with Cold Pressed Oils'
    ],
    testimonials: [
      { text: "The mango pickle is just amazing! Tastes exactly like homemade. Reminds me of my grandmother's recipe.", name: "Sridevi", location: "Hyderabad" },
      { text: "Pure and natural oils. I can smell the authenticity as soon as I open the bottle. Highly recommended!", name: "Ramesh", location: "Vijayawada" },
      { text: "Crispy and tasty snacks. My family loves it. Best snacks I've ever ordered online.", name: "Lakshmi", location: "Guntur" }
    ]
  };

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && Object.keys(res.data).length > 0) {
        setSettings(s => ({
          ...s,
          ...res.data,
          scrollerMessages: res.data.scrollerMessages || s.scrollerMessages,
          testimonials: res.data.testimonials || s.testimonials
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleAddScrollerMessage = () => {
    if (!newScrollerMsg.trim()) return;
    setSettings(s => ({
      ...s,
      scrollerMessages: [...(s.scrollerMessages || []), newScrollerMsg.trim()]
    }));
    setNewScrollerMsg('');
  };

  const handleRemoveScrollerMessage = (idx) => {
    setSettings(s => ({
      ...s,
      scrollerMessages: s.scrollerMessages.filter((_, i) => i !== idx)
    }));
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) {
      alert('Please enter at least customer name and review text');
      return;
    }
    setSettings(s => ({
      ...s,
      testimonials: [...(s.testimonials || []), { ...newTestimonial }]
    }));
    setNewTestimonial({ name: '', location: '', text: '' });
  };

  const handleRemoveTestimonial = (idx) => {
    setSettings(s => ({
      ...s,
      testimonials: s.testimonials.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Store settings, social links & scrollers saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#113C2B]" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-5xl w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#113C2B]">Store & Scroller Settings</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Customize website details, announcement ticker, social media links, and customer reviews scroller
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* Customer Announcement Marquee Scroller Customizer */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#e8dfc8]">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e8dfc8]">
            <Megaphone className="text-[#113C2B] shrink-0" size={22} />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#113C2B]">Top Announcement Bar Scroller</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Live scrolling marquee messages visible at the very top of all customer pages</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                value={newScrollerMsg}
                onChange={e => setNewScrollerMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddScrollerMessage();
                  }
                }}
                placeholder="e.g. 🚚 Free shipping across Andhra on orders above ₹999!"
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm shadow-xs"
              />
              <button 
                type="button" 
                onClick={handleAddScrollerMessage}
                className="px-4 py-2.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus size={16} /> Add Message
              </button>
            </div>

            {/* List of active scroller messages */}
            <div className="space-y-2 pt-2">
              {(!settings.scrollerMessages || settings.scrollerMessages.length === 0) ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 italic">
                  No announcement messages added.
                </div>
              ) : (
                settings.scrollerMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#FAF7F0] border border-[#e8dfc8] rounded-xl">
                    <span className="text-xs sm:text-sm text-[#113C2B] font-medium flex items-center gap-2 pr-2">
                      <span className="w-5 h-5 rounded-full bg-[#113C2B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="break-words">{msg}</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveScrollerMessage(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"
                      title="Remove message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Customer Testimonials Scroller Customizer */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#e8dfc8]">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e8dfc8]">
            <MessageSquare className="text-[#113C2B] shrink-0" size={22} />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#113C2B]">Customer Reviews Scroller (What Our Family Says)</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Live testimonials scroller displayed near the bottom of the home page</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#113C2B] mb-1">Customer Name</label>
                <input 
                  type="text" 
                  value={newTestimonial.name}
                  onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  placeholder="e.g. Sridevi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#113C2B] outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#113C2B] mb-1">Customer Location / City</label>
                <input 
                  type="text" 
                  value={newTestimonial.location}
                  onChange={e => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#113C2B] outline-none text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#113C2B] mb-1">Review Quote</label>
                <textarea 
                  rows={2}
                  value={newTestimonial.text}
                  onChange={e => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  placeholder="e.g. Authentic Andhra taste, reminds me of village sweets and pickles!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#113C2B] outline-none text-xs resize-none"
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAddTestimonial}
              className="px-4 py-2 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Plus size={14} /> Add Review Card
            </button>

            {/* List of active reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(settings.testimonials || []).map((t, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF7F0] border border-[#e8dfc8] rounded-xl flex flex-col justify-between">
                  <p className="text-xs text-gray-700 italic mb-2">"{t.text}"</p>
                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-xs">
                    <div>
                      <span className="font-bold text-[#113C2B]">{t.name}</span>
                      {t.location && <span className="text-gray-400 ml-1.5">({t.location})</span>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTestimonial(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-100">
            <Store className="text-[#113C2B] shrink-0" size={22} />
            <h2 className="text-base sm:text-lg font-bold text-gray-800">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input 
                type="text" 
                name="siteName"
                value={settings.siteName || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input 
                type="text" 
                name="tagline"
                value={settings.tagline || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-100">
            <MapPin className="text-[#113C2B] shrink-0" size={22} />
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Contact Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-gray-400"/> Support Email
              </label>
              <input 
                type="email" 
                name="email"
                value={settings.email || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={16} className="text-gray-400"/> Primary Phone Number
              </label>
              <input 
                type="text" 
                name="phone"
                value={settings.phone || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400"/> Store Address
              </label>
              <textarea 
                name="address"
                value={settings.address || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm resize-none" 
              ></textarea>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-100">
            <Globe className="text-[#113C2B] shrink-0" size={22} />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Social Media & Messaging Links</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Links saved here are automatically synced and displayed across Footer, Contact Page, and Support</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input 
                type="text" 
                name="instagram"
                value={settings.instagram || ''}
                onChange={handleChange}
                placeholder="https://www.instagram.com/yourpage"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">WhatsApp URL / Number</label>
              <input 
                type="text" 
                name="whatsapp"
                value={settings.whatsapp || ''}
                onChange={handleChange}
                placeholder="https://wa.me/+918143680630 or phone number"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input 
                type="text" 
                name="facebook"
                value={settings.facebook || ''}
                onChange={handleChange}
                placeholder="https://www.facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">YouTube Channel URL</label>
              <input 
                type="text" 
                name="youtube"
                value={settings.youtube || ''}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@yourchannel"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Twitter / X URL</label>
              <input 
                type="text" 
                name="twitter"
                value={settings.twitter || ''}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none text-xs sm:text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#113C2B] hover:bg-[#F8B319] text-white hover:text-[#113C2B] px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
