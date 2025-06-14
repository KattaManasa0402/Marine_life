import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCompass, FaCameraRetro, FaChartLine } from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper';

const HomePage: React.FC = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="pb-16">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative text-center py-20 px-4 bg-gradient-hero rounded-b-3xl shadow-lg mb-16"
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl font-heading text-ocean-dark font-extrabold leading-tight mb-6"
          >
            About <span className="text-ocean-primary">MarineWatch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-ocean-text-light mb-8 max-w-2xl mx-auto"
          >
            MarineWatch is your ultimate platform for community-driven marine life monitoring and AI-powered insights. Join us in protecting our oceans!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/upload" className="btn-primary text-xl">
              <IconWrapper icon={<FaCameraRetro className="inline-block mr-3" />} /> Start Uploading
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-16 px-4"
      >
        <h2 className="text-4xl font-heading text-ocean-dark text-center mb-12 font-bold">
          Our <span className="text-ocean-primary">Mission</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div variants={cardVariants} className="glass-card p-8 flex flex-col items-center text-center">
            <IconWrapper icon={<FaCompass className="text-ocean-primary text-5xl mb-4" />} />
            <h3 className="text-2xl font-heading text-ocean-dark font-semibold mb-3">Community-Powered</h3>
            <p className="text-ocean-text-light">
              Upload sightings, vote on AI predictions, and contribute to a global marine database with fellow ocean enthusiasts.
            </p>
          </motion.div>
          <motion.div variants={cardVariants} className="glass-card p-8 flex flex-col items-center text-center">
            <IconWrapper icon={<FaCameraRetro className="text-ocean-primary text-5xl mb-4" />} />
            <h3 className="text-2xl font-heading text-ocean-dark font-semibold mb-3">AI Intelligence</h3>
            <p className="text-ocean-text-light">
              Our advanced AI identifies species and assesses health from your images, providing instant preliminary insights.
            </p>
          </motion.div>
          <motion.div variants={cardVariants} className="glass-card p-8 flex flex-col items-center text-center">
            <IconWrapper icon={<FaChartLine className="text-ocean-primary text-5xl mb-4" />} />
            <h3 className="text-2xl font-heading text-ocean-dark font-semibold mb-3">Protect Our Oceans</h3>
            <p className="text-ocean-text-light">
              By collecting and verifying data, we help researchers and conservationists understand and protect marine ecosystems.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-16 px-4 text-center"
      >
        <h2 className="text-4xl font-heading text-ocean-dark text-center mb-8 font-bold">
          Ready to make a <span className="text-ocean-primary">Difference?</span>
        </h2>
        <p className="text-xl text-ocean-text-light mb-12 max-w-2xl mx-auto">
          Every sighting you share helps us build a clearer picture of marine health. Join MarineWatch today!
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/register" className="btn-primary text-xl">
            Join the Community
          </Link>
          <Link to="/sightings" className="btn-secondary text-xl">
            Explore Sightings
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;