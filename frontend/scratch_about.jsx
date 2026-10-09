import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ShieldCheck, Users, Clock, MessageSquare, Hammer, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import StickyStory from '../components/StickyStory';
import { FadeInUp, GoldLineDrawing, CurtainImageReveal, StaggerContainer, StaggerItem } from '../components/ScrollAnimations';
import aboutStoryImg from '../assets/about-story.jpg';
import process1 from '../assets/gallery1.jpg';
import process2 from '../assets/gallery2.jpg';
import process3 from '../assets/gallery4.jpg';
import process4 from '../assets/gallery3.jpg';

import './pages.css';

const About = () => {
  return (
    <div className="about-page animate-fade-in">
      <div className="page-header" style={{paddingBottom: '120px'}}>
        <div className="container text-center">
          <span className="subtitle">About Us</span>
          <TypewriterText 
            Component={motion.h1}
            className="page-title" 
            text="Crafting Spaces<br/>with Passion & Precision" 
          />
          <p className="page-desc">ECO Home Interiors and Wood Works is a trusted name in custom interiors, modular solutions and premium wood works. We turn your ideas into beautifully crafted spaces.</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="container section" style={{marginTop: '-60px', position: 'relative', zIndex: 10, padding: 0}}>
        <div className="about-story-container">
          <div className="about-story-image" style={{ borderRadius: '10px', overflow: 'hidden' }}>
            <CurtainImageReveal src={aboutStoryImg} alt="Carpenter crafting premium wood" height="500px" />
          </div>
          <FadeInUp className="about-story-content">
            <span className="subtitle">Our Story</span>
            <h2 className="section-title">Design • Build • Transform</h2>
            <GoldLineDrawing width="100px" direction="left" />
            <p style={{color: '#666', lineHeight: 1.8, marginBottom: '1.5rem'}}>
              What started as a passion for wood and design has grown into a full-service interior solutions brand. ECO Home Interiors and Wood Works was founded with a simple belief — great spaces improve lives. We combine modern design with traditional craftsmanship to create interiors that are elegant, functional, and built to last.
            </p>
            <p style={{color: '#666', lineHeight: 1.8}}>
              From conceptualizing personalized modular wardrobes and modern kitchens to executing full-scale luxury home renovations, our team is dedicated to bringing your unique vision to life with uncompromising quality and attention to detail.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Premium Sticky Story Section replacing the old static Process */}
      <StickyStory />



      {/* The 5 Pillars Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container">
          <FadeInUp className="text-center" style={{ marginBottom: '4rem' }}>
            <span className="subtitle" style={{ color: 'var(--accent-color)', letterSpacing: '3px', fontSize: '0.9rem', fontWeight: 'bold' }}>THE 5 PILLARS</span>
            <h2 className="section-title" style={{ color: '#222', fontSize: '3rem', marginTop: '1rem', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>Why Hyderabad Homeowners Choose ECO Home Interiors</h2>
            <GoldLineDrawing width="100px" direction="center" style={{ margin: '0 auto 1.5rem auto' }} />
            <p style={{ color: '#666', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem' }}>
              Our unyielding commitment to material authenticity, millimeter precision, and honest pricing.
            </p>
          </FadeInUp>
          
          <StaggerContainer className="pillars-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <StaggerItem className="pillar-card" style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '15px', borderTop: '4px solid var(--accent-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <Hammer size={40} style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', color: '#222', marginBottom: '1rem' }}>15+ Years Master Woodcraft</h3>
              <p style={{ color: '#666', lineHeight: '1.8' }}>Generational carpentry mastery ensuring solid joinery, durable carcasses, and rich architectural finishes that withstand decades of usage.</p>
            </StaggerItem>
            
            <StaggerItem className="pillar-card" style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '15px', borderTop: '4px solid var(--accent-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <Banknote size={40} style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', color: '#222', marginBottom: '1rem' }}>Direct Workshop Rates</h3>
              <p style={{ color: '#666', lineHeight: '1.8' }}>Save 25-35% compared to commercial design brokers. We manufacture directly in our Tolichowki workshop without unnecessary middleman inflation.</p>
            </StaggerItem>
            
            <StaggerItem className="pillar-card" style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '15px', borderTop: '4px solid var(--accent-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <ShieldCheck size={40} style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', color: '#222', marginBottom: '1rem' }}>Genuine Certified Materials</h3>
              <p style={{ color: '#666', lineHeight: '1.8' }}>100% boiling-water-proof (BWP) marine plywood, genuine teak wood, and branded fittings from Blum, Hettich, Hafele, and Ebco.</p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section" style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '6rem 0', textAlign: 'center' }}>
        <FadeInUp className="container">
          <h2 className="section-title" style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Discuss Your Project with Master Craftsmen</h2>
          <GoldLineDrawing width="100px" direction="center" style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ color: '#eaeaea', maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
            We provide free on-site consultations across Kurnool City and surrounding areas.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>Request Site Visit</Link>
            <a href="https://wa.me/919885256866?text=Hello%20ECO%20Home%20Interiors%2C%0A%0AI%20am%20looking%20for%20interior%20design%20%26%20bespoke%20carpentry%20services.%20I%20would%20like%20to%20schedule%20a%20site%20consultation%20and%20discuss%20my%20project%20requirements.%0A%0AThank%20you!" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: '#25D366', color: '#fff', backgroundColor: '#25D366', padding: '15px 30px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} /> WhatsApp Us Direct
            </a>
          </div>
        </FadeInUp>
      </section>

    </div>
  );
};

export default About;
