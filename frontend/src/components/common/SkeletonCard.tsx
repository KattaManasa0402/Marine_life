import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <motion.div
    className="glass-card rounded-xl shadow-md overflow-hidden"
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
  >
    <div className="h-48 bg-base-200"></div>
    <div className="p-5">
      <div className="h-6 bg-base-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-base-200 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-base-200 rounded w-1/4"></div>
    </div>
  </motion.div>
);

export default SkeletonCard;