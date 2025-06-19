import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative backdrop-blur-lg bg-deep-blue/30 border border-aqua-glow/20 
        rounded-2xl shadow-deep-glow overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Ambient light effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-aqua-glow/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-aqua-glow/10 to-transparent animate-shimmer pointer-events-none" />
    </motion.div>
  );
};

export default GlassCard;
