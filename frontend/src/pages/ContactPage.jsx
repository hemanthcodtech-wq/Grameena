import { Phone, Mail, MapPin, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Animation Components
const FadeInUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const StaggerContainer = ({ children, className = "" }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
      }
    }}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = "", style = {} }) => (
  <motion.div
    className={className}
    style={style}
    variants={{
      hidden: { opacity: 0, y: 50, scale: 0.97 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      }
    }}
  >
    {children}
  </motion.div>
);

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    topic: '',
    requirements: ''
  });

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const { name, phone, email, service, topic, requirements } = formData;
    
    if (!name || !phone || !requirements) {
      alert("Please fill in Name, Phone, and Requirements fields.");
      return;
    }

    const message = `Hello Grameena Bharatham!\n\nI have a new enquiry.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'N/A'}\n*Service Category:* ${service || 'Not specified'}\n*Topic:* ${topic || 'Not specified'}\n*Requirements:* ${requirements}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918143680630?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const faqs = [
    {
      question: "Are the products 100% natural?",
      answer: "Yes! All our products are made using 100% natural, farm-fresh ingredients sourced directly from local farmers in Andhra Pradesh. We do not use any artificial colors or synthetic additives."
    },
    {
      question: "What is the delivery time?",
      answer: "We prepare your order fresh upon receiving it. Orders are typically dispatched within 24 hours and delivered to your doorstep within 2-3 business days across India."
    },
    {
      question: "Do you use preservatives?",
      answer: "Absolutely not. We rely on traditional preservation methods like sun-drying and using pure cold-pressed oils. Our products contain zero chemical preservatives."
    },
    {
      question: "Do you ship outside Andhra Pradesh?",
      answer: "Yes, we ship nationwide! We have partnered with premium delivery services to ensure our authentic rural flavors reach every corner of India safely and freshly."
    }
  ];

  return (
    <div className="font-sans flex flex-col min-h-screen bg-[#FDF9F1]">
      
      {/* Hero Section */}
      <section className="bg-[#113C2B] pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeInUp>
            <span className="text-[#F8B319] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Get in Touch</span>
            <h1 className="font-serif text-[#FDF9F1] text-5xl md:text-6xl font-bold mb-6 leading-tight">We'd love to hear from you</h1>
            <p className="text-green-50/80 text-lg md:text-xl">Have a question in mind? Reach out to us for bulk orders, general enquiries or feedback. Our team is here to help you bring the taste of rural Andhra home.</p>
          </FadeInUp>
        </div>
      </section>

      {/* Contact Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Contact Details & Map */}
          <div>
            <FadeInUp delay={0.1}>
              <h2 className="text-[#113C2B] font-serif text-3xl font-bold mb-10">Contact Details</h2>
            </FadeInUp>
            
            <StaggerContainer className="space-y-8 mb-12">
              <StaggerItem className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#F8B319]/20 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#113C2B]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#113C2B] text-lg mb-1">Phone Numbers</h3>
                  <p className="text-gray-600 font-medium">+91 81436 80630</p>
                </div>
              </StaggerItem>

              <StaggerItem className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#F8B319]/20 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#113C2B]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#113C2B] text-lg mb-1">Email Address</h3>
                  <a href="mailto:sudhakar.moparru@gmail.com" className="text-gray-600 font-medium hover:text-[#F8B319] transition-colors">
                    sudhakar.moparru@gmail.com
                  </a>
                </div>
              </StaggerItem>

              <StaggerItem className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#F8B319]/20 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#113C2B]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#113C2B] text-lg mb-1">Location</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    JKC Road, Guntur,<br/>Andhra Pradesh - 520006
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <FadeInUp delay={0.4} className="rounded-3xl overflow-hidden shadow-lg h-[300px] border border-[#e8dfc8]">
              <iframe 
                src="https://maps.google.com/maps?q=Mangalagiri,%20Guntur,%20Andhra%20Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </FadeInUp>
          </div>

          {/* Right Column: Form */}
          <div>
            <FadeInUp delay={0.2} className="bg-[#113C2B] p-8 md:p-12 rounded-[40px] shadow-2xl h-full flex flex-col justify-center">
              <h2 className="text-[#F8B319] font-serif text-3xl font-bold mb-8">Send Us an Enquiry</h2>
              
              <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name *" 
                      required 
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F8B319] transition-colors"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number *" 
                      required 
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F8B319] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address" 
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F8B319] transition-colors"
                    />
                  </div>
                  <div>
                    <select 
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F8B319] transition-colors appearance-none"
                      style={{ color: formData.service ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    >
                      <option value="" className="text-black">Select Enquiry Type</option>
                      <option value="Bulk Order" className="text-black">Bulk Order</option>
                      <option value="Product Enquiry" className="text-black">Product Enquiry</option>
                      <option value="Delivery Issue" className="text-black">Delivery Issue</option>
                      <option value="Other" className="text-black">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input 
                    type="text" 
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="Subject Topic" 
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F8B319] transition-colors"
                  />
                </div>

                <div>
                  <textarea 
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Your Requirements *" 
                    required 
                    rows="5" 
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F8B319] transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#F8B319] hover:bg-[#e0a012] text-[#113C2B] font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2 text-lg"
                >
                  Send via WhatsApp <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </FadeInUp>
          </div>

        </div>
      </section>

      {/* FAQs Section */}
      <section className="bg-[#113C2B] py-24 px-4 sm:px-6 lg:px-8 mt-auto">
        <FadeInUp className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#F8B319] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Have Questions?</span>
            <h2 className="text-[#FDF9F1] font-serif text-4xl lg:text-5xl font-bold">Frequently Asked Questions</h2>
          </div>
          
          <StaggerContainer className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <StaggerItem 
                key={index} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(248,179,25,0.2)'
                }}
                className="overflow-hidden"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`text-lg font-bold transition-colors ${openFaq === index ? 'text-[#F8B319]' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  <span className="shrink-0 ml-4 transition-transform duration-300">
                    {openFaq === index ? <ChevronUp className="w-6 h-6 text-[#F8B319]" /> : <ChevronDown className="w-6 h-6 text-white" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-green-100/80 leading-relaxed text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeInUp>
      </section>

    </div>
  );
};

export default ContactPage;
