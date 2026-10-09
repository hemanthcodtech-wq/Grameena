import { useState } from 'react';
import { Save, Store, Mail, Phone, MapPin, Globe } from 'lucide-react';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Grameena Bharatham',
    tagline: 'The Taste of Rural Andhra',
    email: 'sudhakar.moparru@gmail.com',
    phone: '+91 81436 80630',
    address: 'JKC Road, Guntur, Andhra Pradesh - 520006',
    facebook: '#',
    instagram: 'https://www.instagram.com/grameenabharatham',
    whatsapp: 'https://wa.me/+918143680630'
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully! (Frontend Only)');
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your website details and contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Store className="text-[#113C2B]" size={24} />
            <h2 className="text-lg font-bold text-gray-800">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input 
                type="text" 
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input 
                type="text" 
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <MapPin className="text-[#113C2B]" size={24} />
            <h2 className="text-lg font-bold text-gray-800">Contact Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-gray-400"/> Support Email
              </label>
              <input 
                type="email" 
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={16} className="text-gray-400"/> Primary Phone Number
              </label>
              <input 
                type="text" 
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400"/> Store Address
              </label>
              <textarea 
                name="address"
                value={settings.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none resize-none" 
              ></textarea>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Globe className="text-[#113C2B]" size={24} />
            <h2 className="text-lg font-bold text-gray-800">Social Media Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input 
                type="text" 
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp URL</label>
              <input 
                type="text" 
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input 
                type="text" 
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#113C2B] focus:border-[#113C2B] outline-none" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button 
            type="submit"
            className="bg-[#F8B319] hover:bg-[#e09c13] text-[#113C2B] px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform transform hover:-translate-y-1"
          >
            <Save size={20} />
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
