import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#113C2B] text-white border-t-4 border-[#F8B319] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
          <path d="M0,100 C30,80 70,80 100,100 L100,0 L0,0 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-6">
            <Link to="/" className="inline-block bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
              <img src={logoImg} alt="Grameena Bharatham" className="h-16 md:h-20 w-auto object-contain" onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150x60?text=Logo"; }} />
            </Link>
            <div>
              <p className="text-[#F8B319] font-serif text-xl italic mb-3 font-semibold tracking-wide">
                The Taste of Rural Andhra
              </p>
              <p className="text-[#a7f3d0] text-sm md:text-base leading-relaxed max-w-xs opacity-90">
                Every product is handcrafted in small batches using traditional kitchen methods — never in a factory.
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-[#FFF0E6] text-xl font-bold mb-6 font-serif relative inline-block pb-2">
              Categories
              <span className="absolute bottom-0 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-[#F8B319] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {['Pickles', 'Cold Press Oils', 'Snacks', 'Traditional Foods'].map((item) => (
                <li key={item}>
                  <Link to={`/category/${item.toLowerCase().replace(/ /g, '-')}`} className="text-[#a7f3d0] hover:text-[#F8B319] transition-all duration-300 flex items-center group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 text-[#F8B319]">›</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-[#FFF0E6] text-xl font-bold mb-6 font-serif relative inline-block pb-2">
              Quick Links
              <span className="absolute bottom-0 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-[#F8B319] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Shop All', path: '/products' },
                { name: 'Contact', path: '/contact' },
                { name: 'Shipping Policy', path: '/policy/shipping' },
                { name: 'Refund & Returns', path: '/policy/refund' },
                { name: 'Terms & Conditions', path: '/policy/terms' },
                { name: 'Privacy Policy', path: '/policy/privacy' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[#a7f3d0] hover:text-[#F8B319] transition-all duration-300 flex items-center group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 text-[#F8B319]">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-[#FFF0E6] text-xl font-bold mb-6 font-serif relative inline-block pb-2">
              Contact Us
              <span className="absolute bottom-0 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-[#F8B319] rounded-full"></span>
            </h3>
            <ul className="space-y-5 mb-8">
              <li className="flex items-start gap-4 text-[#a7f3d0]">
                <Phone className="w-5 h-5 text-[#F8B319] shrink-0 mt-0.5" />
                <span className="hover:text-white transition-colors cursor-pointer">+91 81436 80630</span>
              </li>
              <li className="flex items-start gap-4 text-[#a7f3d0]">
                <Mail className="w-5 h-5 text-[#F8B319] shrink-0 mt-0.5" />
                <span className="hover:text-white transition-colors cursor-pointer break-all">sudhakar.moparru@gmail.com</span>
              </li>
              <li className="flex items-start gap-4 text-[#a7f3d0]">
                <MapPin className="w-5 h-5 text-[#F8B319] shrink-0 mt-0.5" />
                <span className="leading-relaxed">JKC Road, Guntur,<br />Andhra Pradesh - 520006</span>
              </li>
            </ul>

            <div className="w-full">
              <h4 className="text-[#FDF9F1] font-semibold mb-4 text-center sm:text-left">Follow Us</h4>
              <div className="flex justify-center sm:justify-start gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FFF0E6] hover:bg-[#F8B319] hover:text-[#113C2B] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://www.instagram.com/grameenabharatham" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FFF0E6] hover:bg-[#F8B319] hover:text-[#113C2B] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://wa.me/+918143680630" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FFF0E6] hover:bg-[#F8B319] hover:text-[#113C2B] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[#6ee7b7] text-sm md:text-base">
          <p className="opacity-80 text-center md:text-left">&copy; {new Date().getFullYear()} Grameena Bharatham. All Rights Reserved.</p>
          <div className="font-serif italic text-[#F8B319] text-lg font-medium text-center">Nostalgia Shared from Heart to Heart</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
