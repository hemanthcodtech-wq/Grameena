import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    if (!isVisible) return;
    
    sessionStorage.setItem('splashShown', 'true');

    // Splash screen duration: 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] overflow-hidden bg-[#FDF9F1] flex items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
      >
        {/* Main Poster Image with slow subtle zoom */}
        <motion.img 
          src="/images/splash.jpg" 
          alt="Grameena Bharatham Splash Screen"
          className="absolute inset-0 w-full h-full object-cover sm:object-contain bg-[#FDF9F1]"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ 
            scale: { duration: 6, ease: "easeOut" },
            opacity: { duration: 1, ease: "easeOut" }
          }}
        />

        {/* Dynamic Falling Leaves Overlay to bring it to life */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute"
              initial={{ 
                top: '-10%', 
                left: `${Math.random() * 100}%`,
                rotate: 0,
                scale: 0.5 + Math.random() * 0.8
              }}
              animate={{ 
                top: '110%', 
                left: `${Math.random() * 100}%`,
                rotate: 360 
              }}
              transition={{ 
                duration: 4 + Math.random() * 4, 
                ease: "linear",
                delay: Math.random() * 2
              }}
            >
              <Leaf className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
