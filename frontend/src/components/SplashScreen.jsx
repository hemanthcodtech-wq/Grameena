import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

// SVG Leaf for falling leaves animation
const Leaf = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21.2 3.80005C21.2 3.80005 18.2 1.80005 13.2 2.80005C8.2 3.80005 4.2 9.80005 3.2 13.8C2.2 17.8 4.2 21.8 4.2 21.8C4.2 21.8 6.2 21.8 9.2 18.8C12.2 15.8 17.2 9.80005 21.2 3.80005Z" fill="#2d6a4f" opacity="0.8" />
  </svg>
);

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    sessionStorage.setItem('splashShown', 'true');

    // Cinematic Sequence Timing
    const timers = [
      setTimeout(() => setPhase(1), 800),   // Show Background & Sunrise
      setTimeout(() => setPhase(2), 2000),  // Show Logo & Tagline
      setTimeout(() => setPhase(3), 3500),  // Show Products & Loader
      setTimeout(() => setIsVisible(false), 5500) // End Splash
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] overflow-hidden bg-[#FDF9F1] flex flex-col items-center justify-center font-sans"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
      >
        {/* Scene 1: Sunrise & Background (Using hero.jpg as base, warmed up) */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 bg-cover bg-bottom opacity-40"
            style={{ backgroundImage: "url('/images/hero.jpg')", filter: 'sepia(40%) brightness(1.1) contrast(1.1)' }}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 5, ease: "easeOut" }}
          />
          {/* Golden Sunrise Glow */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-t from-[#F8B319] to-transparent blur-[80px]"
            style={{ width: '60vw', height: '60vw', maxWidth: '600px', maxHeight: '600px' }}
            initial={{ bottom: '-50%', opacity: 0 }}
            animate={{ bottom: '-10%', opacity: 0.7 }}
            transition={{ duration: 4, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF9F1]/80 via-transparent to-[#FDF9F1]/80" />
        </div>

        {/* Scene 2: Falling Leaves overlay */}
        {phase >= 1 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`leaf-${i}`}
                className="absolute"
                initial={{ 
                  top: '-10%', 
                  left: `${Math.random() * 100}%`,
                  rotate: 0,
                  scale: 0.4 + Math.random() * 0.6
                }}
                animate={{ 
                  top: '110%', 
                  left: `${Math.random() * 100}%`,
                  rotate: 360 
                }}
                transition={{ 
                  duration: 4 + Math.random() * 3, 
                  ease: "linear",
                  delay: Math.random() * 1
                }}
              >
                <Leaf className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Scene 3: Logo & Tagline */}
        <div className="z-20 flex flex-col items-center justify-center w-full px-4 -mt-16 md:-mt-24">
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Backlight for logo */}
              <motion.div 
                className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-150"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              />
              
              <img 
                src={logoImg} 
                alt="Grameena Bharatham" 
                className="relative w-64 md:w-80 lg:w-[450px] object-contain drop-shadow-2xl z-10 mb-4"
              />
              
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-[#113C2B] font-serif italic text-xl md:text-2xl lg:text-3xl tracking-wide font-bold">
                  The Taste of Rural Andhra
                </h2>
                {/* Golden Underline */}
                <motion.div 
                  className="h-1 bg-gradient-to-r from-transparent via-[#F8B319] to-transparent mt-2"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Scene 4: Functional Loading Spinner & Products */}
        {phase >= 2 && (
          <motion.div 
            className="absolute bottom-12 md:bottom-24 left-0 w-full flex flex-col items-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {/* Spinning Loader */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                {/* Outer spinning ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2d6a4f] border-r-[#2d6a4f]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner static leaf */}
                <Leaf className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <p className="mt-3 text-[#113C2B] text-sm md:text-base font-semibold tracking-widest uppercase">
                Loading...
              </p>
            </div>
            
            {/* Bottom Products Display */}
            <motion.div 
              className="flex items-end justify-center gap-4 md:gap-8 px-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <img src="/images/pickles.jpg" className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-full border-4 border-[#FDF9F1] shadow-2xl" alt="Pickles" />
              <img src="/images/oils.jpg" className="w-24 h-24 md:w-40 md:h-40 object-cover rounded-full border-4 border-[#FDF9F1] shadow-2xl -translate-y-4" alt="Oils" />
              <img src="/images/snacks.jpg" className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-full border-4 border-[#FDF9F1] shadow-2xl" alt="Snacks" />
            </motion.div>
          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
