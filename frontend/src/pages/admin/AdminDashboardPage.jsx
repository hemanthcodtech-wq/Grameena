import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Tag, 
  Users, 
  IndianRupee, 
  ArrowRight,
  Clock,
  CheckCircle2,
  PackageOpen,
  MapPin,
  ExternalLink,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${apiUrl}/api/admin/dashboard-stats`, { headers }),
          axios.get(`${apiUrl}/api/admin/orders`, { headers })
        ]);

        setStats(statsRes.data);
        setRecentOrders((ordersRes.data || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sendWhatsAppUpdate = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch {}

    const customerName = (address.firstName ? `${address.firstName} ${address.lastName || ''}`.trim() : null) || order.user_name || address.name || 'Valued Customer';
    let phone = (address.phone || address.mobile || order.user_phone || '').replace(/[^0-9]/g, '');

    // Format Indian mobile number if missing 91 country code
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    const itemsSummary = items.map((it, idx) => {
      const name = it.name || it.product?.name || 'Delicacy';
      const size = it.size || it.weight || it.variant?.size || '';
      const qty = it.quantity || it.qty || 1;
      return `  • ${name}${size ? ` (${size})` : ''} x ${qty}`;
    }).join('\n');

    const statusTitle = (order.status || 'processing').toUpperCase();
    const orderNumber = order.order_number || order.id;
    const amount = Number(order.total).toFixed(2);
    const destination = [address.city, address.state].filter(Boolean).join(', ') || 'your doorstep';

    // Beautiful WhatsApp message template
    const message = 
`🙏 *Namaste ${customerName}!*

Greetings from *Grameena Bharatham* - _The Taste of Rural Andhra_ 🌿

We have an exciting update regarding your traditional delicacies order! 🍯✨

━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${orderNumber}
📊 *Status:* *${statusTitle}*
💰 *Total Amount:* ₹${amount}
📍 *Delivering To:* ${destination}
━━━━━━━━━━━━━━━━━━━━━

*Ordered Delicacies:*
${itemsSummary || '  • Authentic Homemade Andhra Specials'}

${order.status === 'delivered' 
  ? '🎉 *Your package has been delivered!* We hope you relish the authentic flavors. If you loved the taste, do share your review!'
  : order.status === 'shipped'
  ? '🚚 *Your parcel has been dispatched!* Prepared fresh in small artisanal batches with pure cold-pressed oils. It will reach your doorstep shortly.'
  : '🥣 *Your order is being freshly prepared & packaged!* With zero chemical preservatives, straight from rural Andhra with traditional love.'
}

Need help with your order? Reply directly to this chat or call us at *+91 81436 80630*.

Thank you for being part of our Grameena Bharatham family! ❤️`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const copyOrderRef = (id, ref) => {
    navigator.clipboard?.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statCards = [
    { title: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { title: 'Total Products', value: stats.totalProducts, icon: Tag, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#113C2B] tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Welcome back to Grameena Bharatham Administration</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-white border border-[#e8dfc8] hover:border-[#113C2B] text-[#113C2B] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards - 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#e8dfc8] shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4"
            >
              <div className="order-2 sm:order-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5 truncate">{stat.title}</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-[#113C2B] truncate">{stat.value}</h3>
              </div>
              <div className={`order-1 sm:order-2 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border ${stat.color} shrink-0`}>
                <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders Section with WhatsApp Updates */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e8dfc8] shadow-xs p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#113C2B] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#F8B319]" /> Recent Customer Orders
            </h2>
            <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">
              Live orders & instant dispatch notifications via WhatsApp
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#113C2B] hover:text-[#F8B319] transition-colors self-start sm:self-auto"
          >
            <span>View All Orders ({stats.totalOrders})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order, i) => {
              let items = [];
              try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}
              let address = {};
              try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch {}

              const customerName = (address.firstName ? `${address.firstName} ${address.lastName || ''}`.trim() : null) || order.user_name || address.name || 'Guest Customer';
              const customerPhone = address.phone || address.mobile || order.user_phone || '';
              const customerEmail = address.email || order.user_email || '—';
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const isCopied = copiedId === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="py-4 sm:py-5 first:pt-0 last:pb-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 group"
                >
                  {/* Order Summary & Customer Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono font-black text-xs sm:text-sm text-[#113C2B]">
                        #{order.order_number || order.id}
                      </span>
                      <button
                        onClick={() => copyOrderRef(order.id, order.order_number || order.id)}
                        title="Copy Order ID"
                        className="text-gray-400 hover:text-gray-600 p-1 rounded active:scale-90 transition-transform"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F8B319]" /> {orderDate}
                      </span>

                      <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status || 'pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs text-gray-600">
                      <span className="font-bold text-[#113C2B] text-xs sm:text-sm">{customerName}</span>
                      {customerPhone && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 font-medium">{customerPhone}</span>
                        </>
                      )}
                      {(address.city || address.state) && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 flex items-center gap-0.5 truncate max-w-[150px] sm:max-w-none">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {[address.city, address.state].filter(Boolean).join(', ')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Items preview tag list */}
                    {items.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 flex items-start sm:items-center gap-1.5 overflow-hidden">
                        <span className="text-[11px] font-semibold text-gray-400 shrink-0">Items:</span>
                        <p className="text-[11px] sm:text-xs text-gray-700 truncate">
                          {items.map(it => `${it.name || it.product?.name || 'Delicacy'} (${it.quantity || it.qty || 1})`).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & WhatsApp Action (Mobile Full-Width Responsive) */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                    <div>
                      <div className="font-serif font-black text-base sm:text-xl text-[#113C2B]">
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium block">
                        {order.payment_method === 'razorpay' ? 'Razorpay' : 'Prepaid'}
                      </span>
                    </div>

                    <button
                      onClick={() => sendWhatsAppUpdate(order)}
                      title={`Send WhatsApp notification to ${customerName}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp Update</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
