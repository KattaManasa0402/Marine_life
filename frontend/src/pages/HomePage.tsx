import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCompass, FaCameraRetro, FaChartLine } from 'react-icons/fa6';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

const HomePage: React.FC = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    <div className="pb-16 text-sea-foam">
      {/* Hero Section */}
      <motion.section 
        initial="hidden" 
        animate="visible" 
        variants={sectionVariants} 
        className="relative text-center py-20 px-4 mb-16 overflow-hidden"
      >
        <div className="bubble w-96 h-96 -top-48 -left-48"></div>
        <div className="bubble w-64 h-64 -bottom-32 -right-32"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.8 }} 
            className="text-6xl font-display font-extrabold leading-tight mb-6"
          >
            Dive into <span className="text-aqua-glow">MarineScope</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4, duration: 0.8 }} 
            className="text-xl text-sea-foam/80 mb-8 max-w-2xl mx-auto"
          >
            Join our community in exploring and protecting the wonders of marine life through AI-powered insights and collaborative monitoring.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/upload" className="btn-primary text-xl flex items-center justify-center gap-3 w-max mx-auto">
              <IconWrapper>{(FaCameraRetro as any)()}</IconWrapper> Start Your Journey
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={sectionVariants} 
        className="py-16 px-4 relative"
      >
        <div className="bubble w-72 h-72 top-1/4 -right-36"></div>
        <div className="bubble w-56 h-56 bottom-1/4 -left-28"></div>
        <h2 className="text-4xl font-display text-center mb-12 font-bold">
          Our <span className="text-aqua-glow">Mission</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div variants={cardVariants}>
            <GlassCard className="p-8 h-full flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <IconWrapper>{(FaCompass as any)({ className: "text-aqua-glow text-5xl mb-4" })}</IconWrapper>
              <h3 className="text-2xl font-display font-semibold mb-3">Community-Powered</h3>
              <p className="text-sea-foam/70">Join fellow ocean enthusiasts in documenting and validating marine life sightings through our collaborative platform.</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={cardVariants}>
            <GlassCard className="p-8 h-full flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <IconWrapper>{(FaCameraRetro as any)({ className: "text-aqua-glow text-5xl mb-4" })}</IconWrapper>
              <h3 className="text-2xl font-display font-semibold mb-3">AI Intelligence</h3>
              <p className="text-sea-foam/70">Experience instant species identification and health assessment powered by cutting-edge artificial intelligence.</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={cardVariants}>
            <GlassCard className="p-8 h-full flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <IconWrapper>{(FaChartLine as any)({ className: "text-aqua-glow text-5xl mb-4" })}</IconWrapper>
              <h3 className="text-2xl font-display font-semibold mb-3">Protect Our Oceans</h3>
              <p className="text-sea-foam/70">Contribute to marine conservation efforts by helping build a comprehensive database of marine life observations.</p>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;