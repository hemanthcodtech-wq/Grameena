import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Truck, 
  RefreshCw, 
  ChevronDown, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PoliciesPage = () => {
  const location = useLocation();

  // Detect URL search query or state if provided
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'terms';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText, desc: 'Rules & service agreement' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, desc: 'Data protection & security' },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck, desc: 'Timelines, dispatch & rates' },
    { id: 'refunds', label: 'Refunds & Returns', icon: RefreshCw, desc: 'Replacements & cancellations' },
  ];

  const termsClauses = [
    { title: "1. Acceptance of Terms", content: "By accessing and using Grameena Bharatham's website and application, you accept and agree to be bound by the terms and provisions of this agreement. These terms apply to all visitors, registered customers, and buyers across India." },
    { title: "2. Description of Service", content: "Grameena Bharatham is an online artisanal e-commerce platform offering 100% authentic homemade Andhra pickles, cold-pressed oils, traditional snacks, and village spice mixes crafted in small batches without artificial colors or chemical preservatives." },
    { title: "3. User Registration & Account Security", content: "You represent that you are at least 18 years old to create an account and transact on our store. You are responsible for maintaining the confidentiality of your account password and for all activities carried out under your profile." },
    { title: "4. Pricing & Product Accuracy", content: "All prices are listed in Indian Rupees (INR) and include applicable GST taxes. We strive for exact product representations; however, natural batches of hand-pounded spices and sun-dried ingredients may vary slightly in shade or pungency." },
    { title: "5. Order Confirmation & Payments", content: "Orders are confirmed only after successful payment clearance via Razorpay (UPI, Net Banking, Cards) or confirmed Cash on Delivery (COD). We reserve the right to cancel orders due to technical errors or inventory unavailability." },
    { title: "6. Food Safety & Allergen Notice", content: "Our homemade products are prepared in traditional kitchens that handle peanuts, sesame seeds, mustard, garlic, and milk solids. If you have severe allergies, please inspect the product ingredients or contact customer support before consumption." },
    { title: "7. Intellectual Property", content: "All brand logos, photography, formulations, and editorial text published on this portal are the intellectual property of Grameena Bharatham. Unauthorized reproduction or commercial re-distribution is strictly prohibited." },
    { title: "8. Limitation of Liability", content: "Grameena Bharatham shall not be liable for any indirect, incidental, or consequential damages resulting from courier transit delays, improper domestic storage of perishable goods, or force majeure events." },
    { title: "9. Governing Law & Jurisdiction", content: "These Terms and Conditions are governed by the laws of India. Any legal disputes or claims shall be subject to the exclusive jurisdiction of the competent courts in Guntur, Andhra Pradesh." }
  ];

  const privacyClauses = [
    { title: "1. Information We Collect", content: "We collect personal details you voluntarily provide when creating an account, placing an order, or contacting our team: including your full name, email address, delivery shipping addresses, and phone numbers." },
    { title: "2. Payment Security", content: "We do not store your debit/credit card numbers or CVV. All electronic transactions are processed through certified, PCI-DSS compliant payment gateways (Razorpay) using bank-grade 256-bit SSL encryption." },
    { title: "3. How We Use Your Data", content: "Your details are utilized strictly to dispatch your orders, send automated SMS/Email shipment tracking alerts, verify customer accounts via OTP, and improve our regional Andhra product offerings." },
    { title: "4. Zero Third-Party Data Selling", content: "We strictly uphold your privacy. We NEVER sell, rent, or trade your contact details to third-party telemarketers or external advertisers." },
    { title: "5. Cookies & Site Analytics", content: "We use lightweight functional cookies to remember items in your shopping bag, maintain logged-in customer sessions, and understand customer website usage patterns." },
    { title: "6. User Rights & Account Deletion", content: "You have the right to inspect, edit, or request complete deletion of your profile data and saved delivery addresses by reaching out to our privacy officer." }
  ];

  const shippingClauses = [
    { title: "1. Order Processing Time", content: "All orders are freshly packed and dispatched within 1–2 business days (Monday to Saturday, excluding national and AP state holidays)." },
    { title: "2. Delivery Timelines", content: "Deliveries within Andhra Pradesh & Telangana typically arrive in 1–3 business days. Deliveries to all other Indian states generally arrive in 4–7 business days via premier express logistics partners." },
    { title: "3. Free Shipping Threshold", content: "Enjoy FREE express shipping on all orders totaling ₹999 or above. Orders below ₹999 incur a nominal flat shipping fee of ₹50 to cover transport and safe food bubble packaging." },
    { title: "4. Tamper-Proof Packaging", content: "All liquid oils and oil-rich traditional pickles are double-sealed with induction wads, leak-proof caps, and cushioned bubble wraps to guarantee safe transit directly to your doorstep." },
    { title: "5. Real-Time Tracking", content: "As soon as your package is dispatched, we provide an SMS and email notification featuring your courier tracking ID and direct tracking link (Delhivery, DTDC, India Post)." }
  ];

  const refundClauses = [
    { title: "1. Return Policy for Perishable Foods", content: "Because pickles, savories, and cold-pressed oils are perishable food consumables, opened containers cannot be physically returned for hygiene and food safety reasons." },
    { title: "2. Damaged or Wrong Item Claims", content: "In the rare event that your package arrives physically broken, leaking, or with the wrong product, please notify our team within 48 hours of delivery with photo/video evidence." },
    { title: "3. 100% Refund or Free Replacement", content: "Upon verification of transit damage or shipment error, we will promptly dispatch a free replacement or initiate a full refund back to your source account." },
    { title: "4. Refund Timeline", content: "Approved refunds are processed through Razorpay within 2–3 business days and typically reflect in your bank account, UPI ID, or card within 5–7 business days." },
    { title: "5. Cancellation Window", content: "Orders can be cancelled free of charge before they are handed over to the courier dispatch team. Once dispatched, standard transit handling applies." }
  ];

  const getClausesForActiveTab = () => {
    switch (activeTab) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'How we collect, safeguard, and respect your personal information.',
          clauses: privacyClauses
        };
      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          subtitle: 'Dispatch timelines, packaging standards, and nationwide transit rates.',
          clauses: shippingClauses
        };
      case 'refunds':
        return {
          title: 'Refund & Cancellation Policy',
          subtitle: 'Our commitment to product freshness, replacements, and easy refunds.',
          clauses: refundClauses
        };
      default:
        return {
          title: 'Terms & Conditions of Service',
          subtitle: 'Legal agreement and operational guidelines for Grameena Bharatham shoppers.',
          clauses: termsClauses
        };
    }
  };

  const activeContent = getClausesForActiveTab();

  return (
    <div className="min-h-screen bg-[#FDF9F1] pt-8 md:pt-14 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumb Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-[#d97706] font-bold text-xs uppercase tracking-widest bg-amber-100/60 px-3.5 py-1 rounded-full border border-amber-200">
            Legal & Trust Center
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#113C2B] mt-4 mb-3">
            Company Policies & Terms
          </h1>
          <div className="w-20 h-1 bg-[#F8B319] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Transparent policies crafted with honesty, ensuring the purest homemade food experience and data security for all our customers.
          </p>
        </div>

        {/* ─── MOBILE SELECTION DROPDOWN (Shown ONLY on Mobile screens) ─── */}
        <div className="block lg:hidden mb-8">
          <div className="bg-white p-4 rounded-2xl border border-[#e8dfc8] shadow-sm space-y-2">
            <label htmlFor="policy-select" className="block text-xs font-bold text-[#113C2B] uppercase tracking-wider">
              Select Policy to View:
            </label>
            <div className="relative">
              <select
                id="policy-select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full appearance-none bg-[#FAF4E6] border border-[#eedfc0] text-[#113C2B] text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C2B] transition-all cursor-pointer"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-[#113C2B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-500 italic pt-1">
              Currently viewing: <span className="font-bold text-[#d97706]">{activeContent.title}</span>
            </p>
          </div>
        </div>

        {/* ─── MAIN CONTENT CONTAINER (Sidebar + Policy Body) ─── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          
          {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
          <div className="hidden lg:block lg:w-1/3 w-full shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8dfc8] sticky top-28 space-y-6">
              <div>
                <h3 className="font-serif font-bold text-[#113C2B] text-xl">Legal Navigation</h3>
                <p className="text-xs text-gray-500 mt-1">Select a document to read details</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all group ${
                        isActive
                          ? 'bg-[#113C2B] text-white shadow-md shadow-[#113C2B]/20'
                          : 'text-gray-700 hover:bg-[#FAF4E6] hover:text-[#113C2B]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-[#F8B319] text-[#113C2B]' : 'bg-gray-100 text-gray-600 group-hover:bg-white'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight">{tab.label}</p>
                          <p className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                            {tab.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-[#F8B319]' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Support Callout Box */}
              <div className="p-4 rounded-2xl bg-[#FAF4E6] border border-[#eedfc0] text-xs text-[#113C2B] space-y-2">
                <p className="font-bold text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" /> Have policy questions?
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our grievance desk is located in Guntur, Andhra Pradesh, ready to clarify any inquiries.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>

          {/* ACTIVE POLICY CONTENT DISPLAY */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#e8dfc8] space-y-8">
              
              {/* Header inside Policy content */}
              <div className="border-b border-[#f0e8d5] pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#d97706] uppercase tracking-wider">
                    Official Document
                  </span>
                  <span className="text-xs text-gray-400">Effective: October 2026</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#113C2B]">
                  {activeContent.title}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
                  {activeContent.subtitle}
                </p>
              </div>

              {/* Clauses list */}
              <div className="space-y-6">
                {activeContent.clauses.map((clause, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FDF9F1] border border-[#eedfc0] space-y-2">
                    <h4 className="text-base font-serif font-bold text-[#113C2B] flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#d97706] mt-2 shrink-0"></span>
                      <span>{clause.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-4">
                      {clause.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Grievance & Contact Footer */}
              <div className="p-6 rounded-2xl bg-[#113C2B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#F8B319]">Grievance Officer Details</h4>
                  <p className="text-xs text-white/80 mt-1">Sudhakar Moparru • Grameena Bharatham</p>
                  <p className="text-xs text-white/60">JKC Road, Guntur, Andhra Pradesh - 520006</p>
                  <p className="text-xs text-white/60">Email: sudhakar.moparru@gmail.com | Phone: +91 81436 80630</p>
                </div>
                <a
                  href="https://wa.me/+918143680630"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#F8B319] text-[#113C2B] rounded-xl text-xs font-bold hover:bg-[#e09c13] transition-colors shrink-0 text-center shadow-sm"
                >
                  WhatsApp Support
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PoliciesPage;
