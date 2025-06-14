import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';
import IconWrapper from '../../utils/IconWrapper';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-glass-light-bg backdrop-blur-md border-t border-glass-light-border text-ocean-text-dark py-8"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-heading text-ocean-dark">Marine<span className="text-ocean-primary">Watch</span></h3>
            <p className="text-sm text-ocean-text-light mt-2">© {new Date().getFullYear()} All rights reserved.</p>
          </div>

          <nav className="mb-4 md:mb-0">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-md">
              <li><a href="/about" className="hover:text-ocean-primary transition-colors duration-200">About</a></li>
              <li><a href="/sightings" className="hover:text-ocean-primary transition-colors duration-200">Sightings</a></li>
              <li><a href="/map" className="hover:text-ocean-primary transition-colors duration-200">Map</a></li>
              <li><a href="/upload" className="hover:text-ocean-primary transition-colors duration-200">Upload</a></li>
              <li><a href="/profile" className="hover:text-ocean-primary transition-colors duration-200">Profile</a></li>
            </ul>
          </nav>

          <div className="flex space-x-6">
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="text-ocean-dark hover:text-ocean-primary transition-colors duration-200 text-xl">
              <IconWrapper><FaGithub /></IconWrapper>
            </a>
            <a href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer" className="text-ocean-dark hover:text-ocean-primary transition-colors duration-200 text-xl">
              <IconWrapper icon={<FaTwitter />} />
            </a>
            <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="text-ocean-dark hover:text-ocean-primary transition-colors duration-200 text-xl">
              <IconWrapper icon={<FaLinkedin />} />
            </a>
          </div>
        </div>
        <p className="mt-6 text-sm text-ocean-text-light flex justify-center items-center gap-1">
          Made with <IconWrapper icon={<FaHeart className="text-ocean-accent-red" />} /> for the ocean.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;