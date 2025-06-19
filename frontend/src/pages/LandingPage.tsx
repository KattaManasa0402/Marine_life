import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera } from 'react-icons/fa6';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

const LandingPage = () => {
  const [animateTitle, setAnimateTitle] = useState(false);

  // Trigger title animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => setAnimateTitle(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-blue/30 to-deep-blue/60 backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              animate={{
                filter: animateTitle ? 'drop-shadow(0 0 8px #80FFDB) drop-shadow(0 0 15px #00F5FF) drop-shadow(0 0 8px #80FFDB)' : 'none'
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <motion.h1 
                className="text-6xl md:text-7xl lg:text-8xl font-display font-bold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow via-azure to-bioluminescent">
                  MarineScope:
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-bioluminescent via-ocean-light to-aqua-glow">
                  Dive into Discovery
                </span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Join our global network of marine enthusiasts documenting and 
              preserving ocean life around the world
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Link 
                to="/map" 
                className="relative overflow-hidden bg-gradient-to-r from-azure to-aqua-glow text-white font-semibold text-lg px-10 py-4 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-aqua-glow to-bioluminescent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Start Exploring
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-20 translate-y-1 group-hover:translate-y-0 transition-all duration-300"></div>
              </Link>
              
              <Link 
                to="/feed" 
                className="relative overflow-hidden bg-gradient-to-r from-deep-sea to-ocean-mid text-white font-semibold text-lg px-10 py-4 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,119,182,0.5)] group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-ocean-mid to-azure opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Recent Sightings
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-20 translate-y-1 group-hover:translate-y-0 transition-all duration-300"></div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow via-azure to-bioluminescent inline-block pb-2">
              Explore the Ocean World
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <GlassCard className="p-8 h-full flex flex-col items-center text-center">
                  <motion.div 
                    className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gradient-to-br from-ocean-light to-deep-sea text-white shadow-lg relative"
                    whileHover={{ 
                      rotate: 5, 
                      boxShadow: '0 0 25px rgba(0, 245, 255, 0.6)',
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-aqua-glow to-azure opacity-30 blur-md"></div>
                    <div className="relative z-10">
                      <IconWrapper>{(FaCamera as any)({ className: "text-5xl text-aqua-glow mb-4" })}</IconWrapper>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-aqua-glow">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/80 flex-grow">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-blue/20 to-ocean-mid/10 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 text-center h-full">
                  <motion.p 
                    className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow to-azure mb-3"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-lg text-white/80">{stat.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sightings Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-bioluminescent via-aqua-glow to-azure inline-block pb-2">
              Recent Discoveries
            </span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <GlassCard className="overflow-hidden h-full hover:shadow-[0_0_25px_rgba(0,245,255,0.2)]">
                  <div className="relative">
                    <img 
                      src={`https://source.unsplash.com/random/400x300/?ocean,underwater,marine,${index}`}
                      alt="Marine sighting" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-aqua-glow/80 text-deep-blue text-xs font-semibold py-1 px-2 rounded-full backdrop-blur-sm">
                      Verified
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-display text-xl mb-2 text-white">Common Dolphin</h3>
                    <div className="flex items-center text-xs text-white/70 mb-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Mediterranean Sea</span>
                      <span className="mx-2">•</span>
                      <span>2 days ago</span>
                    </div>
                    <p className="text-white/70 text-sm mb-4">
                      Spotted near coral reef formations, displaying healthy behavior patterns and normal group dynamics.
                    </p>
                    <Link 
                      to="/feed" 
                      className="text-aqua-glow text-sm font-medium flex items-center hover:text-white transition-colors duration-300"
                    >
                      <span>View Details</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/feed" 
              className="inline-flex items-center text-aqua-glow hover:text-white transition-colors duration-300 group"
            >
              <span className="text-lg font-semibold">View All Sightings</span>
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-blue/50 to-ocean-mid/30 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow to-azure inline-block">
                  Explore the Map
                </span>
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Our interactive 3D map displays marine life sightings from around the world. View detailed information about each discovery, including species identification, health assessment, and precise location data.
              </p>
              <Link 
                to="/map" 
                className="relative group flex items-center font-semibold text-aqua-glow hover:text-white transition-colors duration-300"
              >
                <span>Open Interactive Map</span>
                <svg className="w-6 h-6 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-aqua-glow group-hover:w-full transition-all duration-300"></span>
              </Link>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-aqua-glow/20 to-azure/20 rounded-lg blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.div>
                <GlassCard className="overflow-hidden rounded-lg border border-white/10">
                  <img 
                    src="https://source.unsplash.com/random/800x600/?globe,map,ocean" 
                    alt="Interactive Map" 
                    className="w-full h-64 md:h-80 object-cover" 
                  />
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-blue/70 to-ocean-mid/50 backdrop-blur-sm -z-10"></div>
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="px-8 py-16 border border-white/20">
              <motion.div
                className="inline-block mb-6"
                animate={{
                  boxShadow: ["0 0 0 rgba(0, 245, 255, 0)", "0 0 20px rgba(0, 245, 255, 0.5)", "0 0 0 rgba(0, 245, 255, 0)"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              >
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-azure via-aqua-glow to-bioluminescent">
                    Join MarineScope Today
                  </span>
                </h2>
              </motion.div>
              
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Become part of our global community dedicated to marine conservation. Each observation contributes to our understanding and protection of the ocean ecosystem.
              </p>
              
              <Link 
                to="/register"
                className="relative overflow-hidden bg-gradient-to-r from-aqua-glow to-azure text-white font-semibold text-lg px-12 py-5 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] inline-block group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-azure to-bioluminescent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center z-10">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Join the Community
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-20 translate-y-1 group-hover:translate-y-0 transition-all duration-300"></div>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Feature Data
const features = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>,
    title: "Document Marine Life",
    description: "Upload your ocean discoveries and contribute to our global database of marine species observations."
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>,
    title: "Interactive Mapping",
    description: "Explore marine life sightings on our interactive globe with precise geographic tracking."
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>,
    title: "Community Validation",
    description: "Help verify AI-powered species identification and earn points for your contributions to science."
  }
];

// Stats Data
const stats = [
  { value: "15,000+", label: "Species Documented" },
  { value: "92,300+", label: "Observations" },
  { value: "8,400+", label: "Community Members" },
  { value: "186", label: "Countries Represented" }
];

export default LandingPage;