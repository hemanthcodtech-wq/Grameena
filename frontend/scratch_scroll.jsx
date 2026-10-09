import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Standard Fade & Slide up
export const FadeInUp = ({ children, delay = 0, className = "", style = {} }) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Staggered Container for Lists/Cards
export const StaggerContainer = ({ children, className = "", style = {}, delayChildren = 0 }) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "", style = {} }) => {
  return (
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
};

// Signature Interior Image Curtain Reveal
export const CurtainImageReveal = ({ src, alt, className = "", style = {}, height = "400px" }) => {
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
        className="plum-curtain-mask"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--primary-color)',
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
          backgroundColor: 'var(--accent-color)',
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

// Gold Line Drawing SVG
export const GoldLineDrawing = ({ width = "100%", height = "2px", direction = "right", delay = 0 }) => {
  return (
    <motion.div
      style={{ width, height, margin: '2rem 0', position: 'relative' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div 
        style={{ 
          width: '100%', height: '100%', 
          background: `linear-gradient(to ${direction}, transparent, var(--accent-color), transparent)`,
          transformOrigin: direction === 'right' ? 'left' : 'right'
        }}
        variants={{
          hidden: { scaleX: 0 },
          visible: { scaleX: 1, transition: { duration: 1.5, delay, ease: [0.65, 0, 0.35, 1] } }
        }}
      />
    </motion.div>
  );
};

// Parallax Wrapper
export const ParallaxImage = ({ src, alt, height = "500px" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  
  // Disable parallax on mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  return (
    <div ref={ref} style={{ height, overflow: 'hidden', position: 'relative' }}>
      <motion.img 
        src={src} 
        alt={alt}
        style={{
          width: '100%',
          height: '130%',
          objectFit: 'cover',
          y: isMobile ? 0 : y,
          position: 'absolute',
          top: '-15%'
        }}
      />
    </div>
  );
};
