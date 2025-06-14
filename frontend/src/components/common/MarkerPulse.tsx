import React from 'react';
import { motion } from 'framer-motion';

interface MarkerPulseProps {
  color: string;
  size?: number;
  onClick?: () => void;
  validated?: boolean;
}

const MarkerPulse: React.FC<MarkerPulseProps> = ({ 
  color = 'bg-aqua-glow', 
  size = 6, 
  onClick, 
  validated = false
}) => {
  return (
    <motion.div
      className="relative cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Outer ring with pulse animation */}
      <div className={`absolute inset-0 rounded-full ${color} opacity-20 group-hover:opacity-40 animate-ping`}></div>
      
      {/* Main marker point */}
      <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center border border-white/50 shadow-lg`}>
        {validated && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {/* Bottom indicator that appears on hover */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default MarkerPulse;
