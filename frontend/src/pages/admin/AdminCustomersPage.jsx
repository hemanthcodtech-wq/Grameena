import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Shield, User, Clock, ShoppingBag, IndianRupee, Ban, CheckCircle, Trash2, Loader2 } from 'lucide-react';

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [blockingId, setBlockingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (window.confirm(`Change role to ${newRole}?`)) {
      setRoleUpdatingId(id);
      try {
        await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${id}/role`, { role: newRole }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to change role');
      } finally {
        setRoleUpdatingId(null);
      }
    }
  };

  const handleToggleBlock = async (user) => {
    const action = user.is_blocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name || user.email}?`)) return;
    setBlockingId(user.id);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${user.id}/block`, {
        is_blocked: !user.is_blocked
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to ${action} user`);
    } finally {
      setBlockingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete customer ${user.name || user.email}? This action cannot be undone.`)) return;
    setDeletingId(user.id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#113C2B]">Customers</h1>
          <p className="text-gray-500 mt-1">View order histories, manage customer accounts, blocks, and roles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#113C2B] focus:ring-1 focus:ring-[#113C2B] transition-all bg-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Orders</th>
                <th className="px-6 py-4 font-bold">Total Spent</th>
                <th className="px-6 py-4 font-bold">Status & Role</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading customers...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No customers found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-[#FAF7F0]/60 transition-colors ${user.is_blocked ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${user.is_blocked ? 'bg-red-100 text-red-600' : 'bg-[#113C2B]/10 text-[#113C2B]'}`}>
                          {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-[#113C2B] flex items-center gap-2">
                            <span>{user.name || 'Anonymous User'}</span>
                            {user.is_blocked && (
                              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Ban className="w-2.5 h-2.5" /> Blocked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#113C2B]" />
                        <span>{user.order_count || 0} {user.order_count === 1 ? 'order' : 'orders'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#113C2B] text-sm flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 inline" />
                        <span>{(parseFloat(user.total_spent) || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-500 gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Role toggle button */}
                        <button 
                          onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'customer' : 'admin')} 
                          disabled={roleUpdatingId === user.id}
                          className="text-xs font-semibold text-gray-600 hover:text-[#113C2B] border border-gray-200 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          title="Change Role"
                        >
                          {roleUpdatingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span>{user.role === 'admin' ? 'Demote' : 'Admin'}</span>
                        </button>

                        {/* Block / Unblock button */}
                        <button 
                          onClick={() => handleToggleBlock(user)} 
                          disabled={blockingId === user.id}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 disabled:opacity-50 ${
                            user.is_blocked 
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
                              : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                          title={user.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {blockingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : user.is_blocked ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>{user.is_blocked ? 'Unblock' : 'Block'}</span>
                        </button>

                        {/* Delete Customer Button */}
                        <button 
                          onClick={() => handleDeleteUser(user)} 
                          disabled={deletingId === user.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Customer"
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
    </div>
  );
};

export default AdminCustomersPage;
