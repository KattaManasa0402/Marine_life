import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div
      className={`relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hoverEffect ? { 
        y: -5, 
        boxShadow: '0 15px 30px rgba(0, 150, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.4)', 
      } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
