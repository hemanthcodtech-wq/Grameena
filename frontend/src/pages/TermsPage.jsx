import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, ShoppingBag, AlertCircle, Lock, Scale, ChevronDown, Phone } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    icon: <FileText className="w-6 h-6 text-[#F8B319]" />,
    title: '1. Acceptance of Terms',
    badge: 'Mandatory',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: [
      'By accessing and using the Grameena Bharatham website and mobile application, you accept and agree to be bound by these Terms and Conditions.',
      'If you do not agree to these terms, please do not use our services.',
      'These terms apply to all visitors, users, and customers of Grameena Bharatham.',
      'We reserve the right to modify these terms at any time without prior notice. Continued use of our service constitutes acceptance of updated terms.',
    ],
  },
  {
    id: 'service',
    icon: <ShoppingBag className="w-6 h-6 text-[#F8B319]" />,
    title: '2. Description of Service',
    badge: 'E-Commerce Platform',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    content: [
      'Grameena Bharatham is an online retail platform offering authentic, homemade Andhra food products including pickles, cold-press oils, snacks, and traditional foods.',
      'All products are handcrafted in small batches using traditional recipes — never mass-produced in factories.',
      'Product images are representative; actual product appearance may slightly vary due to natural ingredients.',
      'We reserve the right to add, modify, or discontinue any product without prior notice.',
      'Availability of products may vary based on season and ingredient sourcing.',
    ],
  },
  {
    id: 'account',
    icon: <Users className="w-6 h-6 text-[#F8B319]" />,
    title: '3. User Account & Responsibility',
    badge: 'Your Responsibility',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: [
      'You must be 18 years of age or older to create an account and make purchases on our platform.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree to provide accurate, current, and complete information during registration.',
      'You are fully responsible for all activities that occur under your account.',
      'Notify us immediately if you suspect unauthorized access to your account.',
      'We reserve the right to suspend or terminate accounts that violate our terms.',
    ],
  },
  {
    id: 'orders',
    icon: <ShoppingBag className="w-6 h-6 text-[#F8B319]" />,
    title: '4. Orders, Pricing & Payments',
    badge: 'Important',
    badgeColor: 'bg-amber-100 text-amber-700',
    content: [
      'All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.',
      'Prices may change without prior notice. The price at the time of order placement is the applicable price.',
      'We accept payments via UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD).',
      'Orders are confirmed only upon successful payment processing. We reserve the right to cancel orders due to pricing errors.',
      'For COD orders, please ensure someone is available at the delivery address to accept and pay for the order.',
      'Bulk or wholesale orders require prior approval. Contact us at sudhakar.moparru@gmail.com.',
    ],
  },
  {
    id: 'food',
    icon: <AlertCircle className="w-6 h-6 text-[#F8B319]" />,
    title: '5. Food Safety & Allergen Information',
    badge: 'Critical — Please Read',
    badgeColor: 'bg-red-100 text-red-700',
    content: [
      'All our products are manufactured in a home kitchen that processes peanuts, sesame, mustard, and dairy. Consumers with allergies must review ingredient lists carefully before ordering.',
      'Our products are made with natural ingredients and no artificial preservatives. Shelf life may vary based on storage conditions.',
      'Please store products as directed on the label. Improper storage will affect product quality and shelf life.',
      'If you experience any adverse reaction to our products, discontinue use immediately and consult a healthcare professional.',
      'All ingredient information is provided in good faith and is subject to occasional changes based on seasonal availability.',
      'FSSAI License Number: [To be updated]. Our products comply with FSSAI food safety standards.',
    ],
  },
  {
    id: 'ip',
    icon: <Lock className="w-6 h-6 text-[#F8B319]" />,
    title: '6. Intellectual Property',
    badge: 'All Rights Reserved',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    content: [
      'All content on the Grameena Bharatham platform — including text, images, logos, product names, and recipes — is the exclusive property of Grameena Bharatham.',
      'You may not reproduce, distribute, or use our content for commercial purposes without express written consent.',
      'The Grameena Bharatham name, logo, and brand identity are registered trademarks. Unauthorized use is strictly prohibited.',
      'User-generated content (reviews, photos) shared on our platform may be used by us for marketing with credit to the author.',
    ],
  },
  {
    id: 'conduct',
    icon: <Users className="w-6 h-6 text-[#F8B319]" />,
    title: '7. Prohibited Conduct',
    badge: 'Strictly Enforced',
    badgeColor: 'bg-orange-100 text-orange-700',
    content: [
      'You agree not to use our platform for any unlawful, harmful, or fraudulent activities.',
      'Resale of our products without prior authorization is strictly prohibited.',
      'You must not attempt to gain unauthorized access to our systems, databases, or other users\' accounts.',
      'Posting false, misleading, or defamatory reviews or content about our products or business is prohibited.',
      'Any form of harassment, discrimination, or abusive behavior toward our staff will result in immediate account termination.',
    ],
  },
  {
    id: 'liability',
    icon: <Scale className="w-6 h-6 text-[#F8B319]" />,
    title: '8. Limitation of Liability',
    badge: 'Legal Disclaimer',
    badgeColor: 'bg-gray-100 text-gray-700',
    content: [
      'Grameena Bharatham shall not be liable for any indirect, incidental, or consequential damages arising from use of our products or services.',
      'Our total liability to you shall not exceed the amount paid for the specific order giving rise to the claim.',
      'We are not responsible for delays or failures caused by third-party logistics partners, natural disasters, or government actions.',
      'We make no warranties, express or implied, regarding the fitness of our products for any particular purpose beyond what is stated on the label.',
    ],
  },
  {
    id: 'dispute',
    icon: <Scale className="w-6 h-6 text-[#F8B319]" />,
    title: '9. Governing Law & Dispute Resolution',
    badge: 'Andhra Pradesh Jurisdiction',
    badgeColor: 'bg-teal-100 text-teal-700',
    content: [
      'These Terms and Conditions are governed by the laws of India.',
      'Any disputes arising from these terms or use of our services shall be subject to the exclusive jurisdiction of the courts located in Guntur, Andhra Pradesh, India.',
      'Before initiating legal proceedings, both parties agree to attempt to resolve disputes amicably through direct communication.',
      'For consumer grievances, you may also approach the Consumer Forum under the Consumer Protection Act, 2019.',
    ],
  },
  {
    id: 'contact_terms',
    icon: <FileText className="w-6 h-6 text-[#F8B319]" />,
    title: '10. Contact & Grievance Redressal',
    badge: 'We\'re Here to Help',
    badgeColor: 'bg-green-100 text-green-700',
    content: [
      'For any queries, complaints, or grievances, please contact our customer support team.',
      'Grievance Officer: Sudhakar Moparru, Grameena Bharatham, JKC Road, Guntur, Andhra Pradesh – 520006.',
      'Email: sudhakar.moparru@gmail.com | Phone: +91 81436 80630',
      'We aim to address all grievances within 5 business days.',
      'These terms were last updated in October 2026 and supersede all previous versions.',
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

const TermsPage = () => {
  const [openIdx, setOpenIdx] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-[#FDF9F1] min-h-screen pb-20 font-sans">
      <div className="bg-[#113C2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="font-bold tracking-widest uppercase text-xs mb-4 text-[#F8B319]/70">Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">Terms & Conditions</h1>
            <div className="w-20 h-1.5 rounded-full mb-6 bg-[#F8B319]"></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              Please read these terms carefully before using Grameena Bharatham. By using our services, you agree to be bound by these terms.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: October 2026</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 py-8">
          {[{ label: 'Jurisdiction', value: 'India' }, { label: 'Min. Age', value: '18 Years' }, { label: 'Currency', value: 'INR (₹)' }, { label: 'Governing Law', value: 'AP, India' }].map((s, i) => (
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
            <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-6">Terms of Service</h2>
            {sections.map((section, i) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <AccordionItem section={section} isOpen={openIdx === i} toggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
              </motion.div>
            ))}
          </div>

          <div className="space-y-5 lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#113C2B] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8B319]/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-[#F8B319]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Have Questions?</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">Our team is available Mon–Sat, 9AM–6PM to answer any questions about our terms.</p>
              <a href="https://wa.me/+918143680630" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-[#F8B319] text-[#113C2B] font-bold py-3 rounded-xl text-sm hover:bg-[#e09c13] transition-all">WhatsApp Us</a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white border border-[#F8B319]/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-[#113C2B] text-lg">Grievance Officer</h3>
              <div className="space-y-3">
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Name</p><p className="text-[#113C2B]/80 text-sm mt-0.5">Sudhakar Moparru</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Email</p><p className="text-[#113C2B]/80 text-sm mt-0.5">sudhakar.moparru@gmail.com</p></div>
                <div><p className="text-xs text-[#113C2B]/40 font-semibold uppercase tracking-widest">Address</p><p className="text-[#113C2B]/80 text-sm mt-0.5">JKC Road, Guntur, AP – 520006</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bg-[#FDF9F1] border border-[#F8B319]/20 rounded-2xl p-6">
              <h3 className="font-bold text-[#113C2B] text-base mb-4">Related Policies</h3>
              <Link to="/policy/shipping" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Shipping Policy <span>→</span></Link>
              <Link to="/policy/refund" className="flex items-center justify-between py-3 border-b border-[#F8B319]/10 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Refund & Returns <span>→</span></Link>
              <Link to="/policy/privacy" className="flex items-center justify-between pt-3 text-sm text-[#113C2B]/70 hover:text-[#F8B319] transition-colors">Privacy Policy <span>→</span></Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
