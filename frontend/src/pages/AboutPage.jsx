import { ArrowRight, Leaf, ShieldCheck, Soup, Utensils, Home, Sparkles, Users, Sprout, Star, Heart, Factory, CheckCircle2, XCircle, Sun, PackageCheck, Truck, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

// Chainter-inspired animation components
const CurtainImageReveal = ({ src, alt, className = "", style = {}, height = "400px" }) => {
  return (
    <motion.div 
      className={`curtain-reveal-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden', height, ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.img 
        src={src} 
        alt={alt} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        variants={{
          hidden: { scale: 1.05 },
          visible: { scale: 1, transition: { duration: 1.5, ease: 'easeOut' } }
        }}
      />
      <motion.div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#113C2B', // Grameena dark green
          zIndex: 2,
          transformOrigin: 'right'
        }}
        variants={{
          hidden: { scaleX: 1 },
          visible: { scaleX: 0, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }
        }}
      />
      {/* Gold follow line */}
      <motion.div
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '2px',
          backgroundColor: '#F8B319', // Grameena gold
          zIndex: 3
        }}
        variants={{
          hidden: { left: '100%', opacity: 1 },
          visible: { left: '0%', opacity: 0, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }
        }}
      />
    </motion.div>
  );
};

const GoldLineDrawing = ({ width = "100px", height = "2px", direction = "center", delay = 0, style={} }) => {
  return (
    <motion.div
      style={{ width, height, position: 'relative', ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div 
        style={{ 
          width: '100%', height: '100%', 
          background: `linear-gradient(to ${direction === 'center' ? 'right' : direction}, transparent, #F8B319, transparent)`,
          transformOrigin: direction === 'right' ? 'left' : (direction === 'left' ? 'right' : 'center')
        }}
        variants={{
          hidden: { scaleX: 0 },
          visible: { scaleX: 1, transition: { duration: 1.5, delay, ease: [0.65, 0, 0.35, 1] } }
        }}
      />
    </motion.div>
  );
};

const AboutPage = () => {
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="bg-[#FDF9F1] min-h-screen font-sans">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl relative h-[400px] lg:h-[500px]">
            <CurtainImageReveal src="/about_hero.jpg" alt="Rural Andhra tradition" height="100%" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-[#113C2B] font-serif text-5xl lg:text-6xl font-bold mb-4">Our Story</h2>
            
            <div className="h-[40px] mb-6">
              <h3 className="text-[#F8B319] font-serif text-2xl lg:text-3xl font-bold">
                The Taste of Rural Andhra
              </h3>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Grameena Bharatham is born from a single belief — that the true taste of Andhra lies in its villages, its farms and its people. We bring you traditional recipes, pure ingredients and authentic flavors that have been passed down for generations.
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Every product is handcrafted in small batches using traditional kitchen methods — never in a factory. We don't just sell food; we deliver nostalgia, crafted with love by rural artisans and farmers.
            </p>
            <div>
              <button className="bg-[#F8B319] hover:bg-[#e0a012] text-[#113C2B] font-bold px-8 py-3.5 rounded-full flex items-center transition-transform hover:scale-105 shadow-lg">
                Explore Our Range <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counters Section */}
      <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#113C2B] rounded-[40px] p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#F8B319]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-bold text-white font-serif mb-2">
                15,000<span>+</span>
              </h3>
              <p className="text-green-100 font-medium">Happy Families</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#F8B319]">
                <Soup className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-bold text-white font-serif mb-2">
                50<span>+</span>
              </h3>
              <p className="text-green-100 font-medium">Traditional Recipes</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#F8B319]">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-bold text-white font-serif mb-2">
                200<span>+</span>
              </h3>
              <p className="text-green-100 font-medium">Local Farmers Empowered</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#F8B319]">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-bold text-white font-serif mb-2">
                4.9<span>/5</span>
              </h3>
              <p className="text-green-100 font-medium">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full border border-[#F8B319]/30 text-[#F8B319] text-sm font-medium mb-4 bg-orange-50/50">Why Grameena Bharatham</span>
          <h2 className="text-[#113C2B] font-serif text-4xl font-bold">Our Core Values</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <motion.div whileHover={{ y: -5 }} className="bg-[#FFF9F3] border border-[#f5eadf] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEFE5] flex items-center justify-center mb-6 text-[#d67b45]">
              <Home className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[#113C2B] font-serif font-bold text-xl mb-4">Made at Home</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Every product is handcrafted in small batches using traditional kitchen methods — never in a factory.</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-[#FFF9F3] border border-[#f5eadf] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEFE5] flex items-center justify-center mb-6 text-[#d67b45]">
              <Leaf className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[#113C2B] font-serif font-bold text-xl mb-4">No Preservatives</h3>
            <p className="text-gray-500 text-sm leading-relaxed">We use only fresh, natural ingredients sourced from local Andhra farms. Zero artificial additives.</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-[#FFF9F3] border border-[#f5eadf] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEFE5] flex items-center justify-center mb-6 text-[#d67b45]">
              <Heart className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[#113C2B] font-serif font-bold text-xl mb-4">Made with Love</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Every recipe carries the warmth of three generations of rural women who believe food is love.</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-[#FFF9F3] border border-[#f5eadf] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEFE5] flex items-center justify-center mb-6 text-[#d67b45]">
              <Utensils className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[#113C2B] font-serif font-bold text-xl mb-4">Authentic Recipes</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Our recipes are passed down through generations — unchanged, uncompromised, and utterly authentic.</p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full border border-[#F8B319]/30 text-[#d67b45] text-sm font-medium mb-4 bg-orange-50/50">The Comparison</span>
          <h2 className="text-[#113C2B] font-serif text-4xl font-bold mb-4">Why Grameena is Different</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">See how our heirloom small-batch method stands up against conventional snacks and pickles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "100% Homemade",
              pill: "DOMESTIC VS FACTORY",
              icon: "🏡",
              us: "Handcrafted in small batches in domestic kitchens by local home chefs.",
              them: "Mass-manufactured on high-heat automated factory conveyors."
            },
            {
              title: "Fresh Farm Ingredients",
              pill: "PURE VS PROCESSED",
              icon: "🌱",
              us: "Directly sourced from partner farms in rural Andhra Pradesh.",
              them: "Sourced from old wholesale storage stocks and synthetic substitutes."
            },
            {
              title: "Made to Order Fresh",
              pill: "HOT VS STALE",
              icon: "📦",
              us: "Prepared only after you click order, cooled and dispatched in 24 hours.",
              them: "Sitting in distributor warehouses and retail shelves for 6-9 months."
            },
            {
              title: "Heirloom Stone Mortar",
              pill: "HAND VS MACHINE",
              icon: "🏺",
              us: "Ground slowly on traditional stone grinders to preserve natural essential oils.",
              them: "Pulverized in high-heat steel crushers that oxidize nutrients."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-[#FFF0E6] flex flex-col"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#d67b45] text-xs font-bold tracking-wider mb-4">
                  <span className="text-sm">{item.icon}</span> {item.pill}
                </span>
                <h3 className="text-xl font-bold text-[#113C2B] font-serif">{item.title}</h3>
              </div>
              <div className="space-y-4 flex-1">
                <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-green-100">
                  <h4 className="text-green-700 font-bold text-sm mb-1">Grameena way:</h4>
                  <p className="text-green-600 text-xs leading-relaxed">{item.us}</p>
                </div>
                <div className="bg-[#FEF2F2] p-4 rounded-2xl border border-red-100">
                  <h4 className="text-red-600 font-bold text-sm mb-1">Others:</h4>
                  <p className="text-red-500 text-xs leading-relaxed">{item.them}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Process Section */}
      <section className="bg-[#113C2B] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-4 text-[#FDF9F1]">How It's Made</h2>
            <GoldLineDrawing width="150px" direction="center" style={{ margin: '0 auto 1rem auto' }} />
            <p className="text-green-100/80 text-lg">The 6-step journey from our village farms to your dining table.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { step: 1, icon: Sprout, title: "Sourcing", desc: "Handpicked fresh ingredients directly from local Andhra farms — fresh chilies, peanuts, spices, and premium grains." },
              { step: 2, icon: Utensils, title: "Preparation", desc: "Ingredients are ground slowly on traditional stone mortars to retain natural oils, and rolled by hand using heritage methods." },
              { step: 3, icon: Soup, title: "Cooking", desc: "Prepared meticulously in small, artisanal batches and slow-cooked using pure, heart-healthy cold-pressed oils." },
              { step: 4, icon: Sun, title: "Sun Drying", desc: "Naturally sun-dried under warm sunlight to produce perfectly crisp, light, and traditional vadiyalu and papads." },
              { step: 5, icon: PackageCheck, title: "Packing & Hygiene", desc: "Double-sanitized, packed with extreme care in airtight, food-grade containers to preserve authentic aroma and taste." },
              { step: 6, icon: Truck, title: "Delivery Process", desc: "Dispatched within 24 hours of preparation, ensuring the product reaches your doorstep fresh and crisp in 2-3 days." }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/10 relative overflow-hidden group"
                >
                  <div className="absolute -right-6 -top-6 text-[120px] font-black text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-[#F8B319] rounded-2xl flex items-center justify-center mb-6 text-[#113C2B] shadow-lg relative z-10">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-3 relative z-10">{item.title}</h3>
                  <p className="text-green-50/80 leading-relaxed text-sm relative z-10">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-[#113C2B] font-serif text-4xl font-bold text-center mb-4">The People Behind Grameena</h2>
        <GoldLineDrawing width="150px" direction="center" style={{ margin: '0 auto 3rem auto' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { role: "Founder & Head Chef", name: "Recipe Curator", icon: "👩‍🍳", desc: "Grew up watching her grandmother prepare traditional Andhra snacks for every festival." },
            { role: "Quality Team", name: "Freshness Guardians", icon: "🌿", desc: "Ensures every batch meets our strict no-preservative, fresh-ingredient standards." },
            { role: "Delivery Team", name: "Last-Mile Heroes", icon: "🚚", desc: "Delivers your orders fresh across India within 2-3 days of preparation." }
          ].map((member, idx) => (
            <motion.div key={idx} className="bg-white p-8 rounded-[32px] text-center shadow-sm border border-[#e8dfc8]">
              <div className="text-5xl mb-6">{member.icon}</div>
              <h3 className="text-[#113C2B] font-bold text-2xl mb-1">{member.role}</h3>
              <h4 className="text-[#F8B319] font-bold text-sm uppercase tracking-wider mb-4">{member.name}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#EAECE0] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#113C2B] font-serif text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" /> What Our Family Says
            </h2>
            <p className="text-gray-600 text-lg">True stories of nostalgic delight from households across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                text: "The Palli Karam Podi is a game changer! I mix it with hot rice and ghee every day. Fresh, aromatic, and so flavorful. Better than anything store-bought.",
                name: "Priya Reddy", location: "Hyderabad", item: "Loved Palli Karam Podi", initials: "PR"
              },
              {
                text: "Best homemade snacks I've found online. The Murukulu are perfectly crispy and the Butter Murukulu just melt in your mouth. Highly recommend!",
                name: "Ravi Kumar", location: "Warangal", item: "Loved Murukulu", initials: "RK"
              },
              {
                text: "Finally found authentic Andhra podis! The Sambar Podi and Idli Podi are outstanding. Ordering through WhatsApp was super easy.",
                name: "Lakshmi Sharma", location: "Karimnagar", item: "Loved Sambar Podi", initials: "LS"
              }
            ].map((review, idx) => (
              <motion.div key={idx} className="bg-white p-8 rounded-3xl shadow-sm relative pt-12">
                <Quote className="absolute top-6 left-8 w-8 h-8 text-[#e8dfc8] rotate-180" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#F8B319] fill-[#F8B319]" />)}
                </div>
                <p className="text-gray-700 italic mb-8 relative z-10 line-clamp-4">"{review.text}"</p>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                  <div className="w-12 h-12 bg-[#113C2B] text-[#FDF9F1] rounded-full flex items-center justify-center font-bold font-serif text-lg">
                    {review.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#113C2B]">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location} • {review.item}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#113C2B] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('/about_hero.jpg')] bg-cover bg-center"></div>
             <div className="relative z-10">
               <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">Nostalgia Shared from Heart to Heart</h3>
               <p className="text-green-100 italic text-lg max-w-3xl mx-auto">
                 "My whole family loved the Athrasalu — it tasted exactly like what my grandmother used to make during Sankranti. Grameena Bharatham brought our tradition back to our table!"
               </p>
               <p className="mt-6 font-bold text-[#F8B319]">— Divya Sri (Warangal)</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-[40px] overflow-hidden h-[350px] lg:h-[450px] shadow-2xl flex items-center justify-center group">
          <CurtainImageReveal src="/about_footer.jpg" alt="Authenticity Quality Tradition" height="100%" style={{ position: 'absolute', inset: 0 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]"></div>
          
          <div className="relative z-10 text-center text-white px-6 mt-16">
            <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-6 drop-shadow-2xl">
              Authenticity. Quality. Tradition.
            </h2>
            <h3 className="text-2xl lg:text-4xl font-serif italic text-[#F8B319] drop-shadow-md">
              The Taste of Rural Andhra
            </h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
