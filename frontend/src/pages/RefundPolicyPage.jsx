import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Clock, XCircle, CheckCircle, ChevronDown, Phone } from 'lucide-react';

const sections = [
  {
    id: 'eligibility',
    icon: <CheckCircle className="w-6 h-6 text-[#F8B319]" />,
    title: 'Return Eligibility',
    badge: 'Within 7 Days',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    content: [
      'Returns are accepted within 7 days of delivery for the following reasons: damaged product, wrong item received, or product quality issues.',
      'To be eligible for a return, the product must be unused, in its original packaging, and in the same condition you received it.',
      'Perishable food items that have been opened or partially consumed cannot be returned due to hygiene and food safety regulations.',
      'Products purchased during sale or at a discounted price are not eligible for return unless they are damaged or defective.',
      'We reserve the right to refuse a return if the item shows signs of use or does not meet our return criteria.',
    ],
  },
  {
    id: 'process',
    icon: <RefreshCw className="w-6 h-6 text-[#F8B319]" />,
    title: 'How to Initiate a Return',
    badge: 'Simple 3-Step Process',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: [
      'Step 1: Contact us within 7 days of receiving your order via WhatsApp (+91 81436 80630) or email (sudhakar.moparru@gmail.com) with your order number and reason for return.',
      'Step 2: Attach clear photographs of the product and packaging clearly showing the issue (damaged, wrong item, etc.).',
      'Step 3: Our team will review your request within 24–48 hours and guide you on the next steps — pickup or drop-off at a nearby courier center.',
      'Please do not ship the product back without prior authorization from our support team.',
      'Once we receive and inspect the returned item, we will notify you about the approval or rejection of your return request.',
    ],
  },
  {
    id: 'refund',
    icon: <Clock className="w-6 h-6 text-[#F8B319]" />,
    title: 'Refund Process & Timeline',
    badge: '5–7 Business Days',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: [
      'Once your return is received and approved, your refund will be processed within 2–3 business days.',
      'Refunds are credited to your original payment method (UPI, Credit/Debit Card, Net Banking, Wallet) within 5–7 business days.',
      'For Cash on Delivery (COD) orders, refunds will be processed via bank transfer. Please provide your bank details when contacting us.',
      'Shipping charges are non-refundable unless the return is due to our error (wrong or damaged item).',
      'If you haven\'t received your refund within 7 business days, please first check with your bank and then contact us.',
    ],
  },
  {
    id: 'exchange',
    icon: <RefreshCw className="w-6 h-6 text-[#F8B319]" />,
    title: 'Product Exchange',
    badge: 'Subject to Availability',
    badgeColor: 'bg-amber-100 text-amber-700',
    content: [
      'We offer product exchanges for damaged or wrong items received, subject to product availability.',
      'To request an exchange, follow the same process as a return (contact us within 7 days with photos).',
      'The replacement product will be dispatched within 2–3 business days after we receive and verify the returned item.',
      'If the exact product is not available, we will offer you an equivalent product or a full refund.',
      'Exchanges are allowed once per order.',
    ],
  },
  {
    id: 'nonreturnable',
    icon: <XCircle className="w-6 h-6 text-[#F8B319]" />,
    title: 'Non-Returnable Items',
    badge: 'Exceptions Apply',
    badgeColor: 'bg-red-100 text-red-700',
    content: [
      'Opened or partially consumed food products cannot be returned for hygiene and safety reasons.',
      'Products that have passed their best-before date at the time of return request.',
      'Items purchased during clearance sales, combo offers, or with additional discounts applied.',
      'Gift vouchers, promotional items, and free samples are not eligible for return or refund.',
      'Products damaged due to improper storage or handling by the customer after delivery.',
    ],
  },
  {
    id: 'damaged',
    icon: <AlertTriangle className="w-6 h-6 text-[#F8B319]" />,
    title: 'Damaged or Defective Products',
    badge: 'Immediate Action Taken',
    badgeColor: 'bg-orange-100 text-orange-700',
    content: [
      'If you receive a damaged, leaking, or defective product, please contact us within 48 hours of delivery.',
      'Take a photograph of the damaged product and packaging and share it with our support team via WhatsApp.',
      'We will arrange a free return pickup and issue a full refund or replacement at no extra charge to you.',
      'Do not discard the damaged product or packaging until our support team confirms the case is closed.',
      'We take product quality very seriously and work hard to ensure every order reaches you in perfect condition.',
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

const RefundPolicyPage = () => {
  const [openIdx, setOpenIdx] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-[#FDF9F1] min-h-screen pb-20 font-sans">
      <div className="bg-[#113C2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="font-bold tracking-widest uppercase text-xs mb-4 text-[#F8B319]/70">Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">Refund & Returns Policy</h1>
            <div className="w-20 h-1.5 rounded-full mb-6 bg-[#F8B319]"></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              Your satisfaction is our priority. We stand behind the quality of every product we sell. If something's not right, we'll make it right.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: October 2026</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 py-8">
          {[{ label: 'Return Window', value: '7 Days' }, { label: 'Refund Time', value: '5–7 Days' }, { label: 'Exchange', value: 'Available' }, { label: 'Damaged Items', value: 'Full Refund' }].map((s, i) => (
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
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6">Policy Details</h2>
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
              <h3 className="font-bold text-white text-lg mb-2">Start a Return</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">Contact us on WhatsApp with your order number and photos to begin your return request.</p>
              <a href="https://wa.me/+918143680630" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-[#F8B319] text-[#113C2B] font-bold py-3 rounded-xl text-sm hover:bg-[#e09c13] transition-all">WhatsApp Us</a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-[#113C2B] text-lg">Contact Details</h3>
              <div className="space-y-3">
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">WhatsApp</p><p className="text-[#113C2B]/80 text-sm mt-0.5">+91 81436 80630</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Email</p><p className="text-[#113C2B]/80 text-sm mt-0.5">sudhakar.moparru@gmail.com</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Hours</p><p className="text-[#113C2B]/80 text-sm mt-0.5">Mon–Sat, 9AM – 6PM IST</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bg-[#FDF9F1] border border-[#F8B319]/20 rounded-2xl p-6">
              <h3 className="font-bold text-[#113C2B] text-base mb-4">Related Policies</h3>
              <Link to="/policy/shipping" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Shipping Policy <span>→</span></Link>
              <Link to="/policy/terms" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Terms & Conditions <span>→</span></Link>
              <Link to="/policy/privacy" className="flex items-center justify-between pt-3 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Privacy Policy <span>→</span></Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
