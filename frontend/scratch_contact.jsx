import React, { useState } from 'react';
import { Mail, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import { FadeInUp, StaggerContainer, StaggerItem } from '../components/ScrollAnimations';
import './pages.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    topic: '',
    requirements: ''
  });

  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      question: "Do you provide free site consultations?",
      answer: "Yes, we provide complimentary on-site measurements and design briefings across Kurnool City and surrounding areas."
    },
    {
      question: "What materials do you use for your woodwork?",
      answer: "We use only premium, genuine certified materials including 100% boiling-water-proof (BWP) marine plywood, genuine teak wood, and high-quality branded fittings from Blum, Hettich, Hafele, and Ebco."
    },
    {
      question: "How long does a typical interior project take?",
      answer: "A standard 2BHK or 3BHK turnkey interior project usually takes between 45 to 60 days from the design sign-off to final handover, depending on the scope of custom woodwork."
    },
    {
      question: "Do you handle complete turnkey projects?",
      answer: "Absolutely. We manage everything from civil changes, false ceilings, and electrical work to bespoke carpentry, modular kitchens, and final styling. You won't need to coordinate with multiple contractors."
    },
    {
      question: "Why are your rates more competitive than commercial brokers?",
      answer: "We manufacture directly in our own workshop. This eliminates the middleman inflation and broker commissions, allowing you to save 25-35% while receiving superior craftsmanship."
    }
  ];

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

    const message = `Hello Eco Home Interiors!\n\nI have a new enquiry.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'N/A'}\n*Service Category:* ${service || 'Not specified'}\n*Topic:* ${topic || 'Not specified'}\n*Requirements:* ${requirements}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919885256866?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className="contact-page animate-fade-in">
      <div className="page-header">
        <div className="container text-center">
          <span className="subtitle">Get in Touch</span>
          <TypewriterText 
            Component={motion.h1}
            className="page-title" 
            text="We'd love to hear from you" 
          />
          <p className="page-desc">Have a project in mind? Reach out to us for a free consultation, site visit or any enquiry. Our team is here to help you create your dream space.</p>
        </div>
      </div>

      <div className="container contact-wrapper">
        <div className="contact-info-section">
          <h3>Contact Details</h3>
          
          <div className="contact-card">
            <div className="contact-card-icon"><Phone size={24} /></div>
            <div className="contact-card-content">
              <h4>Phone Numbers</h4>
              <p>+91 98852 56866</p>
              <p>+91 85559 35234</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="contact-card-icon"><Mail size={24} /></div>
            <div className="contact-card-content">
              <h4>Email Address</h4>
              <p>krishna9885256866@gmail.com</p>
            </div>
          </div>
          
          <FadeInUp className="contact-card">
            <div className="contact-card-icon"><MapPin size={24} /></div>
            <div className="contact-card-content">
              <h4>Location</h4>
              <p>D no-87/1392-B-C-11, shop no 2, opp- Omega hospital,<br/>100ft road, vasavi nagar, kurnool city, AP-518002</p>
            </div>
          </FadeInUp>

          {/* Map View */}
          <FadeInUp className="map-container mt-4" style={{ height: '250px', borderRadius: '15px', overflow: 'hidden', marginTop: '2rem' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30712.02761959542!2d78.03835193320343!3d15.803771973258668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb5dda7126f38ab%3A0x4e3d66912751be69!2sOmega%20Cancer%20Hospital%20(Cancer%20Treatment%20Hospital)%20-%20Kurnool!5e0!3m2!1sen!2sin!4v1791522669618!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </FadeInUp>
        </div>

        <FadeInUp className="contact-form-section">
          <h3>Send Us an Enquiry</h3>
          <form onSubmit={handleWhatsAppSubmit}>
            <div className="form-row">
              <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="Your Name *" style={{borderRadius: '12px'}} required />
              </div>
              <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" placeholder="Phone Number *" style={{borderRadius: '12px'}} required />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" placeholder="Email Address" style={{borderRadius: '12px'}} />
              </div>
              <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                <select name="service" value={formData.service} onChange={handleInputChange} className="form-control" style={{appearance: 'none', color: formData.service ? '#fff' : 'rgba(255,255,255,0.7)', borderRadius: '12px'}}>
                  <option value="">Select Service</option>
                  <option value="Modular Wardrobes">Modular Wardrobes</option>
                  <option value="Modular Kitchens">Modular Kitchens</option>
                  <option value="Bedroom Interiors">Bedroom Interiors</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="form-control" placeholder="Project Topic" style={{borderRadius: '12px'}} />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} className="form-control" placeholder="Your Requirements *" style={{borderRadius: '12px', minHeight: '120px'}} required></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" style={{borderRadius: '30px', padding: '1rem', fontSize: '1.1rem'}}>Send via WhatsApp →</button>
          </form>
        </FadeInUp>
        </div>
      </div>

      <section style={{ backgroundColor: 'var(--bg-dark)', padding: '5rem 0' }}>
        <FadeInUp className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="subtitle" style={{ color: 'var(--accent-color)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Have Questions?</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#fff', marginTop: '1rem' }}>Frequently Asked Questions</h2>
          </div>
          
          <StaggerContainer className="faq-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => (
              <StaggerItem 
                key={index} 
                className="faq-item" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(216,170,90,0.2)',
                  overflow: 'hidden'
                }}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.5rem', 
                    backgroundColor: 'transparent', 
                    border: 'none', 
                    color: '#fff', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: openFaq === index ? 'bold' : 'normal', color: openFaq === index ? 'var(--accent-color)' : '#fff' }}>
                    {faq.question}
                  </span>
                  {openFaq === index ? <ChevronUp size={20} color="var(--accent-color)" /> : <ChevronDown size={20} color="#fff" />}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ padding: '0 1.5rem 1.5rem', color: '#ccc', lineHeight: '1.6' }}>
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
    </>
  );
};

export default Contact;
