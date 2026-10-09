import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ArrowRight, ShoppingBag, Leaf, ShieldCheck, Truck, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import heroImg from '../assets/hero.jpg';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// ProductCard extracted to components/ProductCard.jsx

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes, bannerRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products/categories/all'),
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/public/banners')
        ]);
        
        const colors = ['bg-orange-50', 'bg-yellow-50', 'bg-green-50', 'bg-red-50', 'bg-blue-50'];
        const mappedCategories = catRes.data.map((c, i) => ({
          ...c,
          color: colors[i % colors.length]
        }));
        
        setCategories(mappedCategories);
        setProducts(prodRes.data);
        setBanners(bannerRes.data);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  // Simple Auto-Slider for Banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Filter products based on toggles
  const trendingProducts = products.filter(p => p.is_active && p.is_trending).slice(0, 4);
  const festiveProducts = products.filter(p => p.is_active && p.is_festive).slice(0, 4);
  const offerProducts = products.filter(p => p.is_active && p.is_offer).slice(0, 4);

  const bestsellingProducts = [];

  const testimonials = [
    { text: "The mango pickle is just amazing! Tastes exactly like homemade. Reminds me of my grandmother's recipe.", name: "Sridevi", location: "Hyderabad" },
    { text: "Pure and natural oils. I can smell the authenticity as soon as I open the bottle. Highly recommended!", name: "Ramesh", location: "Vijayawada" },
    { text: "Crispy and tasty snacks. My family loves it. Best snacks I've ever ordered online.", name: "Lakshmi", location: "Guntur" },
  ];

  return (
    <div className="w-full flex flex-col bg-[#FDF9F1] font-sans overflow-hidden">
      
      {/* 1. Full-Width Hero Banner */}
      <section className="w-full bg-[#113C2B] relative overflow-hidden h-[400px] md:h-[60vh] max-h-[800px] group">
        <Link to={banners.length > 0 && banners[currentBanner].link_url ? banners[currentBanner].link_url : "/products"} className="block w-full h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full absolute inset-0"
            >
              <img 
                src={banners.length > 0 ? banners[currentBanner].image_url : heroImg} 
                alt="Grameena Bharatham Authentic Food" 
                className="w-full h-full object-cover md:object-cover"
              />
              {/* Optional Text Overlay */}
              {banners.length > 0 && (banners[currentBanner].heading || banners[currentBanner].sub_content) && (
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6 md:p-12">
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg"
                  >
                    {banners[currentBanner].heading}
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow-md"
                  >
                    {banners[currentBanner].sub_content}
                  </motion.p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Link>
        
        {/* Banner Controls */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {banners.map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.preventDefault(); setCurrentBanner(i); }}
                className={`w-3 h-3 rounded-full transition-all ${i === currentBanner ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. New Categories Layout */}
      <section className="bg-white py-24 rounded-t-[60px] border-t border-[#f0e6d2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#113C2B] mb-4">Shop By Category</h2>
            <div className="w-24 h-1 bg-[#F8B319] mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-lg">Explore our authentic range of homemade delicacies</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-8 lg:gap-12">
            {categories.map((cat, idx) => (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group cursor-pointer flex flex-col items-center"
              >
                {/* Circular Image Container */}
                <div className="relative w-20 h-20 sm:w-64 sm:h-64 mb-2 sm:mb-8">
                  {/* Decorative background blob */}
                  <div className={`absolute inset-0 rounded-full ${cat.color || 'bg-[#113C2B]'} scale-110 group-hover:scale-125 transition-transform duration-500`}></div>
                  
                  <div className="absolute inset-0 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-xl z-10 group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={cat.image_url || cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  {/* Floating Action Button */}
                  <div className="absolute bottom-0 right-0 sm:right-4 w-6 h-6 sm:w-12 sm:h-12 bg-[#113C2B] text-white rounded-full shadow-lg z-20 flex items-center justify-center opacity-100 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
                  </div>
                </div>

                <div className="text-center z-10">
                  <h3 className="text-xs sm:text-2xl font-bold text-[#113C2B] font-serif mb-0.5 sm:mb-2 group-hover:text-[#F8B319] transition-colors line-clamp-1 sm:line-clamp-none">{cat.name}</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500 italic hidden sm:block">{cat.description || 'Authentic flavors'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="w-full py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#113C2B] font-serif mb-2 md:mb-3">Trending Now</h2>
              <p className="text-gray-500 text-sm md:text-lg">Our most loved authentic recipes</p>
            </div>
            <Link to="/products" className="text-[#113C2B] font-bold flex items-center gap-1 hover:text-[#F8B319] transition-colors pb-1 text-sm md:text-base">
              View <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {trendingProducts.map((prod, idx) => (
              <ProductCard key={prod.id} prod={prod} idx={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 3.5 Festive Collection */}
      {festiveProducts.length > 0 && (
        <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#F8B319] font-serif mb-2 md:mb-3">Festive Collection</h2>
              <p className="text-gray-500 text-sm md:text-lg">Specially curated for your celebrations</p>
            </div>
            <Link to="/products" className="text-[#F8B319] font-bold flex items-center gap-1 hover:text-[#e09c13] transition-colors pb-1 text-sm md:text-base">
              View <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {festiveProducts.map((prod, idx) => (
              <ProductCard key={prod.id} prod={prod} idx={idx} badge="FESTIVE" />
            ))}
          </div>
        </section>
      )}

      {/* 3.75 Explore All Products */}
      {products.length > 0 && (
        <section className="w-full py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#113C2B] font-serif mb-2 md:mb-3">Explore All Delicacies</h2>
              <p className="text-gray-500 text-sm md:text-lg">Discover our complete range of pure, authentic flavors</p>
            </div>
            <Link to="/products" className="text-[#113C2B] font-bold flex items-center gap-1 hover:text-[#F8B319] transition-colors pb-1 text-sm md:text-base">
              View <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.filter(p => !p.is_trending && !p.is_festive).slice(0, 8).map((prod, idx) => (
              <ProductCard key={prod.id} prod={prod} idx={idx} />
            ))}
          </div>
          
          <div className="flex justify-center mt-12">
            <Link to="/products" className="px-8 py-4 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] rounded-full font-bold transition-colors inline-flex items-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300">
              Load More Products
            </Link>
          </div>
        </section>
      )}

      {/* 4. Banner Promotion Separated */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#113C2B] rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="relative z-10 md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Bring Home the <span className="text-[#F8B319]">True Essence</span> of Andhra
            </h2>
            <p className="text-green-100 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
              Experience the magic of traditional stone grinders, sun-drying, and grandma's secret spices. 100% natural, always.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#F8B319]" /> Free Delivery over ₹999
              </div>
            </div>
          </div>
          
          <div className="relative z-10 md:w-1/3 flex justify-center">
             <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-dashed border-[#F8B319]/50 p-2">
               <div className="w-full h-full rounded-full overflow-hidden">
                 <img src={heroImg} alt="Spices" className="w-full h-full object-cover" />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#113C2B] mb-4">What Our Family Says</h2>
          <div className="w-24 h-1 bg-[#F8B319] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-lg">Real Taste. Real Smiles.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white p-10 rounded-[32px] shadow-sm border border-[#e8dfc8] relative pt-12"
            >
              <Quote className="absolute top-8 left-8 w-10 h-10 text-[#F8B319]/20 rotate-180" />
              <div className="flex items-center space-x-1 mb-6 relative z-10">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-[#F8B319] text-[#F8B319]" />
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-8 italic text-lg leading-relaxed relative z-10">
                "{test.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                <div className="w-12 h-12 rounded-full bg-[#113C2B] text-white flex items-center justify-center font-bold text-xl font-serif">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#113C2B]">{test.name}</p>
                  <p className="text-sm text-gray-500">{test.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
