import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// A single floating particle/bubble
const Bubble = ({ size, initialX, initialY, duration, delay = 0, type = 'bubble' }: any) => {
  const isJellyfish = type === 'jellyfish';
  const isPlankton = type === 'plankton';
  
  let className = "absolute rounded-full ";
  if (isJellyfish) {
    className += "bg-gradient-to-b from-aqua-glow to-transparent opacity-30";
  } else if (isPlankton) {
    className += "bg-bioluminescent opacity-20";
  } else {
    className += "bg-aqua-glow opacity-10";
  }
  
  const animate = isJellyfish ? {
    y: [0, -80, 0],
    scaleY: [1, 1.2, 0.9, 1],
    opacity: [0.2, 0.4, 0.2]
  } : isPlankton ? {
    y: [0, -40],
    x: [0, 10, -10, 5],
    opacity: [0.1, 0.3, 0.1]
  } : {
    y: [0, -100],
    scale: [1, 1.1, 1],
    opacity: [0, 0.2, 0],
  };
  
  // Different shapes for different sea creatures
  const shape = isJellyfish ? {
    borderRadius: '50% 50% 10% 10% / 50% 50% 20% 20%',
    boxShadow: '0 10px 20px -10px rgba(0, 245, 255, 0.3)'
  } : {};

  return (
    <motion.div
      className={className}
      style={{
        width: isJellyfish ? `${size * 3}px` : `${size}px`,
        height: isJellyfish ? `${size * 4}px` : `${size}px`,
        left: `${initialX}%`,
        top: `${initialY}%`,
        ...shape
      }}
      animate={animate}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// Animated deep ocean current
const DeepOceanCurrent = () => {
  return (
    <motion.div 
      className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-deep-sea to-transparent opacity-30"
      animate={{ 
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{ 
        duration: 20, 
        repeat: Infinity,
        ease: 'linear' 
      }}
    />
  );
};

const BackgroundEffects = () => {
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    // Generate random underwater elements
    const bubbles = Array.from({ length: 15 }, (_, i) => {
      const size = Math.random() * 10 + 3;
      const type = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'jellyfish' : 'plankton') : 'bubble';
      return (
        <Bubble 
          key={`bubble-${i}`}
          size={size}
          initialX={Math.random() * 100}
          initialY={Math.random() * 100 + 50}
          duration={Math.random() * 15 + 15}
          delay={Math.random() * 5}
          type={type}
        />
      );
    });
    
    setElements(bubbles);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden">
      {/* Layer 1: Deep Ocean Gradient */}
      <div className="absolute inset-0 bg-deep-ocean-gradient"></div>
      
      {/* Layer 2: Light Rays from top */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-0 left-1/4 w-32 h-screen bg-gradient-radial from-aqua-glow to-transparent opacity-10 blur-xl"></div>
        <div className="absolute top-0 left-3/4 w-48 h-screen bg-gradient-radial from-aqua-glow to-transparent opacity-15 blur-xl"></div>
      </div>
      
      {/* Layer 3: Animated Caustic Light Pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-caustic-pattern opacity-5 animate-pan-bg mix-blend-soft-light"></div>
      
      {/* Layer 4: Deep Ocean Current */}
      <DeepOceanCurrent />
      
      {/* Layer 5: Floating Bubbles and Sea Creatures */}
      <div className="absolute top-0 left-0 w-full h-full">
        {elements}
      </div>
    </div>
  );
};

export default BackgroundEffects;