import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerProfilePage = () => {
  const { user, token, updateUser, refreshUser } = useAuth();
  
  // Profile update state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || 'India'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(res.data.user);
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters long');
    }

    setPasswordSaving(true);
    try {
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8dfc8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#113C2B] text-[#F8B319] font-serif text-2xl font-bold flex items-center justify-center shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#113C2B]">{user?.name || 'Customer'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Account
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                Joined: {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-sm space-y-6">
        <div className="border-b border-[#f0e8d5] pb-4">
          <h3 className="text-lg font-serif font-bold text-[#113C2B]">Personal Information</h3>
          <p className="text-xs text-gray-500 mt-0.5">Update your contact details and shipping preferences.</p>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Primary Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Country / Region</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-6 py-2.5 bg-[#113C2B] text-white rounded-xl font-bold hover:bg-[#1A4B3A] transition-all shadow-sm disabled:opacity-50"
            >
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-sm space-y-6">
        <div className="border-b border-[#f0e8d5] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#113C2B] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" /> Change Password
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Ensure your account is using a secure, long password.</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5 text-xs max-w-xl">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                placeholder="Enter your existing password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F1] border border-[#e8dfc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B]"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-sm disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CustomerProfilePage;
