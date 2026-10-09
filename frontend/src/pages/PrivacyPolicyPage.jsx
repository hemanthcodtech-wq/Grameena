import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Bell, Lock, UserX, ChevronDown, Phone } from 'lucide-react';

const sections = [
  {
    id: 'collection',
    icon: <Database className="w-6 h-6 text-[#F8B319]" />,
    title: 'Information We Collect',
    badge: 'Transparent',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: [
      'Personal Information: Name, email address, phone number, and delivery address when you create an account or place an order.',
      'Payment Information: We do not store your full payment card details. Payments are processed via secure, certified payment gateways (Razorpay).',
      'Usage Data: Pages visited, time spent on site, browser type, and device information for analytics and improvements.',
      'Communication Data: Messages, feedback, and reviews you send us via contact forms, WhatsApp, or email.',
      'Location Data: Only if you grant permission — used to suggest nearby delivery timelines.',
    ],
  },
  {
    id: 'use',
    icon: <Eye className="w-6 h-6 text-[#F8B319]" />,
    title: 'How We Use Your Information',
    badge: 'Purpose-Driven',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    content: [
      'To process and deliver your orders and provide order status updates.',
      'To send order confirmations, shipping notifications, and important account communications.',
      'To improve our website, products, and customer experience based on usage analytics.',
      'To send promotional offers and newsletters — only if you have opted in. You may unsubscribe anytime.',
      'To respond to customer queries, complaints, and feedback.',
      'To comply with legal obligations including tax records and regulatory requirements.',
    ],
  },
  {
    id: 'sharing',
    icon: <Shield className="w-6 h-6 text-[#F8B319]" />,
    title: 'Information Sharing & Disclosure',
    badge: 'We Never Sell Your Data',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: [
      'We do NOT sell, rent, or trade your personal information to third parties for marketing purposes — ever.',
      'We share your delivery address and contact number with our logistics partners solely to fulfill your order.',
      'Payment information is shared with our payment gateway (Razorpay) in a secure, encrypted manner.',
      'We may disclose information if required by law, court order, or governmental authority.',
      'In the event of a business merger or acquisition, your data may be transferred to the new entity with the same privacy protections.',
    ],
  },
  {
    id: 'security',
    icon: <Lock className="w-6 h-6 text-[#F8B319]" />,
    title: 'Data Security',
    badge: 'SSL Encrypted',
    badgeColor: 'bg-amber-100 text-amber-700',
    content: [
      'We use industry-standard SSL (Secure Socket Layer) encryption to protect data transmitted between your browser and our servers.',
      'Access to your personal data is restricted to authorized personnel who need it to perform their job functions.',
      'We conduct periodic security audits and keep our systems updated to protect against unauthorized access.',
      'While we implement robust security measures, no method of internet transmission is 100% secure. We encourage you to use strong passwords.',
      'In the event of a data breach that affects your rights, we will notify you within 72 hours as required by applicable law.',
    ],
  },
  {
    id: 'cookies',
    icon: <Bell className="w-6 h-6 text-[#F8B319]" />,
    title: 'Cookies & Tracking',
    badge: 'Your Control',
    badgeColor: 'bg-rose-100 text-rose-700',
    content: [
      'We use cookies to maintain your login session, remember cart items, and personalize your shopping experience.',
      'Analytics cookies (Google Analytics) help us understand how visitors use our site — this data is anonymized.',
      'You can control cookie settings through your browser preferences. Disabling cookies may affect some site functionality.',
      'We use pixels and tracking tools solely to improve our marketing relevance — you may opt out through your ad preferences.',
    ],
  },
  {
    id: 'rights',
    icon: <UserX className="w-6 h-6 text-[#F8B319]" />,
    title: 'Your Rights & Data Control',
    badge: 'You\'re in Control',
    badgeColor: 'bg-teal-100 text-teal-700',
    content: [
      'Access: You can request a copy of all personal data we hold about you by contacting us.',
      'Correction: You can update your personal information at any time from your account dashboard.',
      'Deletion: You may request deletion of your account and associated data. Note: Order history is retained for legal/tax purposes.',
      'Opt-Out: You can unsubscribe from promotional emails at any time using the unsubscribe link in the email.',
      'Data Portability: You may request your data in a machine-readable format.',
      'To exercise any of these rights, contact us at sudhakar.moparru@gmail.com.',
    ],
  },
  {
    id: 'retention',
    icon: <Database className="w-6 h-6 text-[#F8B319]" />,
    title: 'Data Retention',
    badge: 'As Long as Needed',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    content: [
      'We retain your personal data for as long as your account is active or as needed to provide services.',
      'Order data including name, address, and purchase history is retained for 7 years for accounting and tax compliance under Indian law.',
      'Upon account deletion, your personal data is anonymized or deleted within 30 days, except where legal retention is required.',
      'Anonymized analytics data may be retained indefinitely to improve our services.',
    ],
  },
];

function AccordionItem({ section, isOpen, toggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#F8B319]/60 shadow-md' : 'border-[#e8dfc8] shadow-sm'}`}>
      <button onClick={toggle} className="w-full flex items-center justify-between gap-4 p-5 md:p-6 bg-white text-left">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#113C2B] flex items-center justify-center shrink-0">{section.icon}</div>
          <div>
            <h3 className="font-bold text-[#113C2B] text-base md:text-lg">{section.title}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${section.badgeColor}`}>{section.badge}</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#113C2B]/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden bg-[#FDF9F1]">
        <ul className="px-5 md:px-6 py-5 space-y-3 border-t border-[#F8B319]/10">
          {section.content.map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-[#113C2B]/70 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F8B319] shrink-0"></span>{line}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

const PrivacyPolicyPage = () => {
  const [openIdx, setOpenIdx] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-[#FDF9F1] min-h-screen pb-20 font-sans">
      <div className="bg-[#113C2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="font-bold tracking-widest uppercase text-xs mb-4 text-[#F8B319]/70">Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">Privacy Policy</h1>
            <div className="w-20 h-1.5 rounded-full mb-6 bg-[#F8B319]"></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              We respect your privacy. This policy explains what data we collect, why we collect it, and how we protect it. We never sell your data — period.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: October 2026</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 py-8">
          {[{ label: 'Data Sold', value: 'Never' }, { label: 'Encryption', value: 'SSL/TLS' }, { label: 'Retention', value: '7 Years*' }, { label: 'Your Control', value: 'Full Access' }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-4 md:p-5 text-center shadow-sm">
              <p className="text-xl md:text-2xl font-serif font-bold text-[#F8B319]">{s.value}</p>
              <p className="text-[#113C2B]/60 text-xs md:text-sm font-semibold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6">Privacy Details</h2>
            {sections.map((section, i) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <AccordionItem section={section} isOpen={openIdx === i} toggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
              </motion.div>
            ))}
          </div>

          <div className="space-y-5 lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#113C2B] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8B319]/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-[#F8B319]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Data Requests</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">To access, correct, or delete your data, reach out to us directly.</p>
              <a href="mailto:sudhakar.moparru@gmail.com"
                className="block w-full bg-[#F8B319] text-[#113C2B] font-bold py-3 rounded-xl text-sm hover:bg-[#e09c13] transition-all">Email Us</a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-[#113C2B] text-lg">Data Controller</h3>
              <div className="space-y-3">
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Company</p><p className="text-[#113C2B]/80 text-sm mt-0.5">Grameena Bharatham</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Email</p><p className="text-[#113C2B]/80 text-sm mt-0.5">sudhakar.moparru@gmail.com</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Location</p><p className="text-[#113C2B]/80 text-sm mt-0.5">Guntur, Andhra Pradesh, India</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bg-[#FDF9F1] border border-[#F8B319]/20 rounded-2xl p-6">
              <h3 className="font-bold text-[#113C2B] text-base mb-4">Related Policies</h3>
              <Link to="/policy/shipping" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Shipping Policy <span>→</span></Link>
              <Link to="/policy/refund" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Refund & Returns <span>→</span></Link>
              <Link to="/policy/terms" className="flex items-center justify-between pt-3 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Terms & Conditions <span>→</span></Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
