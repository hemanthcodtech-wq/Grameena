import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, ShieldCheck, ChevronDown, Phone, Mail } from 'lucide-react';

const sections = [
  {
    id: 'processing',
    icon: <Clock className="w-6 h-6 text-[#F8B319]" />,
    title: 'Order Processing Time',
    badge: '1–2 Business Days',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    content: [
      'All orders are processed within 1–2 business days (Monday through Saturday, excluding public holidays).',
      'You will receive an order confirmation SMS/email immediately after placing your order.',
      'A shipping confirmation message with your tracking number is sent once your order has been dispatched.',
      'Orders placed after 4:00 PM IST will be processed the next business day.',
      'During festival seasons (Diwali, Sankranthi, etc.), processing may take up to 3 business days due to high volume.',
    ],
  },
  {
    id: 'delivery',
    icon: <Truck className="w-6 h-6 text-[#F8B319]" />,
    title: 'Delivery Timeline',
    badge: '3–7 Business Days',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: [
      'Standard delivery across Andhra Pradesh and Telangana takes 1–3 business days after dispatch.',
      'Pan-India delivery (other states) typically takes 4–7 business days depending on location.',
      'Remote, rural or hilly areas may require an additional 2–3 business days beyond the standard timeline.',
      'We currently ship via trusted partners including Delhivery, DTDC, and India Post.',
      'Delivery timelines may be affected during peak festival seasons, natural calamities, or government holidays.',
    ],
  },
  {
    id: 'coverage',
    icon: <MapPin className="w-6 h-6 text-[#F8B319]" />,
    title: 'Shipping Coverage & Charges',
    badge: 'Pan India',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: [
      'We ship to all pin codes across India through our trusted logistics partners.',
      'Free shipping on all orders above ₹999.',
      'A flat shipping charge of ₹50 is applied on orders below ₹999.',
      'For bulk orders above ₹5,000, we offer special delivery arrangements — please contact us.',
      'Currently, we do not offer international shipping. Please contact us for special arrangements.',
    ],
  },
  {
    id: 'packaging',
    icon: <Package className="w-6 h-6 text-[#F8B319]" />,
    title: 'Our Food-Safe Packaging',
    badge: 'Food-Grade & Eco Friendly',
    badgeColor: 'bg-amber-100 text-amber-700',
    content: [
      'All Grameena Bharatham products are packed in food-grade, tamper-proof packaging to preserve freshness and authenticity.',
      'We use eco-conscious packaging materials wherever possible, reducing our environmental footprint.',
      'Liquid products (pickles, oils) are sealed with food-safe lids and bubble-wrapped for transit safety.',
      'Each order is packed with care and includes a handwritten thank-you note to our valued customers.',
      'We do not use any artificial preservatives; our packaging is designed to maintain product shelf life naturally.',
    ],
  },
  {
    id: 'tracking',
    icon: <ShieldCheck className="w-6 h-6 text-[#F8B319]" />,
    title: 'Order Tracking',
    badge: 'Real-Time Updates',
    badgeColor: 'bg-rose-100 text-rose-700',
    content: [
      'Once your order is dispatched, you will receive a tracking number via SMS and email.',
      'You can track your order on the respective courier partner\'s website using this number.',
      'If your shipment is delayed beyond 10 business days, please contact us immediately for assistance.',
      'We will coordinate with the logistics partner to resolve any delivery issues as promptly as possible.',
      'In case of delivery failure, the courier partner will make 2–3 delivery attempts before returning the package to us.',
    ],
  },
  {
    id: 'damaged',
    icon: <ShieldCheck className="w-6 h-6 text-[#F8B319]" />,
    title: 'Damaged or Lost Shipments',
    badge: "We've Got You Covered",
    badgeColor: 'bg-teal-100 text-teal-700',
    content: [
      'In the rare case your order arrives damaged, please photograph the package and products and contact us within 48 hours of delivery.',
      'We will arrange a replacement or full refund for verified damage claims — no questions asked.',
      'For orders marked as delivered but not received, please check with neighbors or building security first, then contact us.',
      'Lost shipment claims must be raised within 7 days of the expected delivery date.',
      'Grameena Bharatham is not responsible for delays or losses caused by incorrect shipping address provided by the customer.',
    ],
  },
];

function AccordionItem({ section, isOpen, toggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#F8B319]/60 shadow-md' : 'border-[#e8dfc8] shadow-sm'}`}>
      <button onClick={toggle} className="w-full flex items-center justify-between gap-4 p-5 md:p-6 bg-white text-left">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#113C2B] flex items-center justify-center shrink-0">
            {section.icon}
          </div>
          <div>
            <h3 className="font-bold text-[#113C2B] text-base md:text-lg">{section.title}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${section.badgeColor}`}>
              {section.badge}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#113C2B]/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden bg-[#FDF9F1]"
      >
        <ul className="px-5 md:px-6 py-5 space-y-3 border-t border-[#F8B319]/10">
          {section.content.map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-[#113C2B]/70 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F8B319] shrink-0"></span>
              {line}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

const ShippingPolicyPage = () => {
  const [openIdx, setOpenIdx] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-[#FDF9F1] min-h-screen pb-20 font-sans">
      {/* Hero */}
      <div className="bg-[#113C2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="font-bold tracking-widest uppercase text-xs mb-4 text-[#F8B319]/70">Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">Shipping Policy</h1>
            <div className="w-20 h-1.5 rounded-full mb-6 bg-[#F8B319]"></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              We want your Grameena Bharatham experience to be seamless — from farm to your doorstep. Here's everything you need to know about how we deliver.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: October 2026</p>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 py-8">
          {[
            { label: 'Processing', value: '1–2 Days' },
            { label: 'Delivery', value: '3–7 Days' },
            { label: 'Coverage', value: 'Pan India' },
            { label: 'Free Shipping', value: 'Above ₹999' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-4 md:p-5 text-center shadow-sm">
              <p className="text-xl md:text-2xl font-serif font-bold text-[#F8B319]">{s.value}</p>
              <p className="text-[#113C2B]/60 text-xs md:text-sm font-semibold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Accordion */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6">Policy Details</h2>
            {sections.map((section, i) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <AccordionItem section={section} isOpen={openIdx === i} toggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-[#113C2B] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8B319]/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-[#F8B319]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Need Help?</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">We're here to help with any shipping concerns — call or WhatsApp us.</p>
              <a href="https://wa.me/+918143680630" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-[#F8B319] text-[#113C2B] font-bold py-3 rounded-xl text-sm hover:bg-[#e09c13] transition-all">
                WhatsApp Us
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-[#113C2B] text-lg">Contact Details</h3>
              <div className="space-y-3">
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Phone / WhatsApp</p><p className="text-[#113C2B]/80 text-sm mt-0.5">+91 81436 80630</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Email</p><p className="text-[#113C2B]/80 text-sm mt-0.5">sudhakar.moparru@gmail.com</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Hours</p><p className="text-[#113C2B]/80 text-sm mt-0.5">Mon–Sat, 9AM – 6PM IST</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bg-[#FDF9F1] border border-[#F8B319]/20 rounded-2xl p-6">
              <h3 className="font-bold text-[#113C2B] text-base mb-4">Related Policies</h3>
              <Link to="/policy/refund" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Refund & Returns <span>→</span></Link>
              <Link to="/policy/terms" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Terms & Conditions <span>→</span></Link>
              <Link to="/policy/privacy" className="flex items-center justify-between pt-3 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Privacy Policy <span>→</span></Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
