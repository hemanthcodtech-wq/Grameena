import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PoliciesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'refunds', label: 'Refunds & Returns' },
  ];

  const termsClauses = [
    { title: "1. Acceptance of Terms", content: "By accessing and using Grameena Bharatham, you accept and agree to be bound by the terms and provision of this agreement." },
    { title: "2. Description of Service", content: "Grameena Bharatham provides users with access to a rich collection of resources, including various food products, which may be accessed through any various medium or device now known or hereafter developed." },
    { title: "3. Registration Obligations", content: "In consideration of your use of the Service, you represent that you are of legal age to form a binding contract and are not a person barred from receiving services under the laws of India." },
    { title: "4. Member Account, Password and Security", content: "You will receive a password and account designation upon completing the Service's registration process. You are responsible for maintaining the confidentiality of the password and account." },
    { title: "5. Member Conduct", content: "You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials, whether publicly posted or privately transmitted, are the sole responsibility of the person from which such Content originated." },
    { title: "6. Special Admonitions for International Use", content: "Recognizing the global nature of the Internet, you agree to comply with all local rules regarding online conduct and acceptable Content." },
    { title: "7. Indemnity", content: "You agree to indemnify and hold Grameena Bharatham, and its subsidiaries, affiliates, officers, agents, co-branders or other partners, and employees, harmless from any claim or demand." },
    { title: "8. No Resale of Service", content: "You agree not to reproduce, duplicate, copy, sell, trade, resell or exploit for any commercial purposes, any portion of the Service." },
    { title: "9. General Practices Regarding Use and Storage", content: "You acknowledge that Grameena Bharatham may establish general practices and limits concerning use of the Service." },
    { title: "10. Modifications to Service", content: "Grameena Bharatham reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice." },
    { title: "11. Termination", content: "You agree that Grameena Bharatham may, under certain circumstances and without prior notice, immediately terminate your account." },
    { title: "12. Dealings with Advertisers", content: "Your correspondence or business dealings with, or participation in promotions of, advertisers found on or through the Service, are solely between you and such advertiser." },
    { title: "13. Links", content: "The Service may provide, or third parties may provide, links to other World Wide Web sites or resources." },
    { title: "14. Grameena Bharatham's Proprietary Rights", content: "You acknowledge and agree that the Service and any necessary software used in connection with the Service contain proprietary and confidential information." },
    { title: "15. Disclaimer of Warranties", content: "You expressly understand and agree that your use of the service is at your sole risk." },
    { title: "16. Limitation of Liability", content: "You expressly understand and agree that Grameena Bharatham shall not be liable to you for any direct, indirect, incidental, special, consequential or exemplary damages." },
    { title: "17. Exclusions and Limitations", content: "Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for incidental or consequential damages." },
    { title: "18. Special Admonition for Services Relating to Financial Matters", content: "If you intend to create or join any service, receive or request any news, messages, alerts or other information from the Service concerning companies, stock quotes, investments or securities, please read the above Sections 15 and 16 again." },
    { title: "19. Notice", content: "Grameena Bharatham may provide you with notices, including those regarding changes to the TOS, by email, regular mail, or postings on the Service." },
    { title: "20. Trademark Information", content: "The Grameena Bharatham, Grameena Bharatham logo, trademarks and service marks and other Grameena Bharatham logos and product and service names are trademarks of Grameena Bharatham." },
    { title: "21. Copyrights and Copyright Agents", content: "Grameena Bharatham respects the intellectual property of others, and we ask our users to do the same." },
    { title: "22. General Information", content: "The TOS constitute the entire agreement between you and Grameena Bharatham and govern your use of the Service." },
    { title: "23. Violations", content: "Please report any violations of the TOS to our Customer Care group." },
    { title: "24. Food Safety and Allergens", content: "All our products are manufactured in facilities that process peanuts, tree nuts, and dairy. Consumers with allergies must review ingredient lists carefully." },
    { title: "25. Pricing and Currency", content: "All prices are listed in Indian Rupees (INR) and are subject to change without notice. Applicable taxes are calculated at checkout." },
    { title: "26. Dispute Resolution", content: "Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in Andhra Pradesh, India." }
  ];

  return (
    <div className="min-h-screen bg-[#FDF9F1] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#113C2B] mb-4">Legal & Policies</h1>
          <div className="w-24 h-1 bg-[#F8B319] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">Please review our policies, terms, and guidelines below to understand how we operate and protect your data.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8dfc8] lg:sticky lg:top-32">
              <h3 className="font-serif font-bold text-[#113C2B] text-xl mb-6">Contents</h3>
              <nav className="flex flex-col space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-left px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#113C2B] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#e8dfc8]">
              
              {activeTab === 'terms' && (
                <div className="prose prose-green max-w-none">
                  <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-6">Terms & Conditions</h2>
                  <p className="text-gray-600 mb-8">Last Updated: October 2026</p>
                  
                  <div className="space-y-8">
                    {termsClauses.map((clause, idx) => (
                      <div key={idx} id={`clause-${idx}`} className="scroll-mt-32">
                        <h4 className="text-xl font-bold text-[#113C2B] mb-3">{clause.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{clause.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="prose prose-green max-w-none">
                  <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-6">Privacy Policy</h2>
                  <p className="text-gray-600 mb-8">Your privacy is important to us. This Privacy Policy outlines how your data is collected, used, and protected.</p>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <h4 className="text-xl font-bold text-[#113C2B]">1. Information We Collect</h4>
                    <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">2. Use of Information</h4>
                    <p>We may use the information we collect about you to provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">3. Sharing of Information</h4>
                    <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">4. Data Security</h4>
                    <p>We implement appropriate technical and organizational measures to protect the personal data that we process about you against unauthorized access, accidental loss, destruction, or alteration.</p>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="prose prose-green max-w-none">
                  <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-6">Shipping & Delivery</h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <h4 className="text-xl font-bold text-[#113C2B]">1. Processing Time</h4>
                    <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">2. Shipping Rates & Delivery Estimates</h4>
                    <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery typically takes 3-5 business days depending on your location in India.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">3. Shipment Confirmation & Order Tracking</h4>
                    <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">4. Damages</h4>
                    <p>Grameena Bharatham is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.</p>
                  </div>
                </div>
              )}

              {activeTab === 'refunds' && (
                <div className="prose prose-green max-w-none">
                  <h2 className="text-3xl font-serif font-bold text-[#113C2B] mb-6">Refunds & Returns</h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <h4 className="text-xl font-bold text-[#113C2B]">1. Returns</h4>
                    <p>Since our products are perishable food items, we do not accept returns. However, if you receive a defective or incorrect item, please contact us within 24 hours of delivery.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">2. Refunds (if applicable)</h4>
                    <p>Once your claim is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">3. Late or Missing Refunds</h4>
                    <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted.</p>
                    <h4 className="text-xl font-bold text-[#113C2B]">4. Exchanges</h4>
                    <p>We only replace items if they are defective or damaged during transit. If you need to exchange it for the same item, send us an email at our contact address.</p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
