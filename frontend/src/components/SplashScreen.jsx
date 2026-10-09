import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './SplashScreen.css';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    sessionStorage.setItem('splashShown', 'true');

    // Sequence timing
    // Phase 0: Leaf appears (0s)
    // Phase 1: Draw abstract farm/leaf outline (1s)
    // Phase 2: Show full logo (2.5s)
    // Phase 3: Ribbon & Tagline (3.5s)
    // Phase 4: Curtain exit (5s)
    // Remove from DOM (6s)

    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5000),
      setTimeout(() => setIsVisible(false), 5800)
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div 
          className="splash-screen cinematic-splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Gold Curtain effect overlay during exit */}
          <motion.div 
            className="splash-curtain"
            initial={{ scaleY: 0 }}
            exit={{ 
              scaleY: 1, 
              transformOrigin: 'bottom',
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
            }}
          />

          <div className="splash-content" style={{ zIndex: 10 }}>
            <div className="cinematic-logo-container">
              
              {/* Phase 0 & 1: Abstract Logo Construction */}
              <AnimatePresence>
                {phase < 2 && (
                  <motion.div 
                    className="abstract-logo-drawing flex flex-col items-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  >
                    {/* Glowing Leaf Seed */}
                    <motion.div 
                      className="glowing-leaf"
                      initial={{ opacity: 0, y: 20, scale: 0.5 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C7 2 3 7 3 12C3 17 7 22 12 22C17 22 21 17 21 12C21 7 17 2 12 2ZM12 20C8.13 20 5 16.87 5 13C5 9.13 8.13 6 12 6C15.87 6 19 9.13 19 13C19 16.87 15.87 20 12 20ZM12 8C9.24 8 7 10.24 7 13C7 15.76 9.24 18 12 18C14.76 18 17 15.76 17 13C17 10.24 14.76 8 12 8Z" fill="#F8B319" className="leaf-glow"/>
                      </svg>
                    </motion.div>

                    {/* Leaf/Farm Outline Drawing */}
                    {phase >= 1 && (
                      <motion.svg 
                        className="farm-outline mt-2"
                        width="80" height="80" viewBox="0 0 100 100" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.path 
                          d="M50 90 C 10 90, 10 50, 50 10 C 90 50, 90 90, 50 90 Z"
                          fill="transparent"
                          stroke="#F8B319"
                          strokeWidth="2.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <motion.path 
                          d="M50 90 V 10"
                          fill="transparent"
                          stroke="#F8B319"
                          strokeWidth="1.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
                        />
                      </motion.svg>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phase 2: Full Logo Reveal */}
              {phase >= 2 && (
                <motion.div
                  className="full-logo-reveal"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <div 
                    className="bg-white rounded-3xl shadow-[0_0_60px_rgba(248,179,25,0.4)] flex items-center justify-center"
                    style={{ width: 'min(80vw, 320px)', height: '140px' }}
                  >
                    <img src={logoImg} alt="Grameena Bharatham" className="w-full h-full object-contain p-4" onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150x60?text=Logo"; }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Phase 3: Ribbon and Tagline */}
            {phase >= 3 && (
              <motion.div 
                className="tagline-container cinematic-tagline mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="cinematic-ribbon-wrapper mb-4">
                  <motion.div 
                    className="cinematic-gold-ribbon bg-[#F8B319] h-[1px] w-32 mx-auto"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
                  />
                </div>
                <p className="splash-tagline text-[#FDF9F1] font-serif text-xl tracking-wide italic">The Taste of Rural Andhra</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
