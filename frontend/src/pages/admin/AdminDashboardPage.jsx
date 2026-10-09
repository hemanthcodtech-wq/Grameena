import { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Users, IndianRupee, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'bg-green-100 text-green-700' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
    { title: 'Total Products', value: stats.totalProducts, icon: Tag, color: 'bg-purple-100 text-purple-700' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-orange-100 text-orange-700' }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grameena-600"></div></div>;
  }

  return (
    <div className="w-full h-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back to Grameena Bharatham Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="admin-card flex items-center justify-between group hover:border-grameena-300 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-full ${stat.color} bg-opacity-50 group-hover:bg-opacity-100 transition-all`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 admin-card h-96 flex flex-col justify-center items-center text-center">
        <TrendingUp className="w-16 h-16 text-grameena-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Detailed analytics coming soon</h3>
        <p className="text-gray-500 mt-2">We are working on bringing more insights to your dashboard.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
