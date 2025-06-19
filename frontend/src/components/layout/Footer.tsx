import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaFish, FaWater, FaLeaf } from 'react-icons/fa6';
import IconWrapper from '../../utils/IconWrapper';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-deep-blue/50 backdrop-blur-md border-t border-aqua-glow/10 text-sea-foam/70 py-12 mt-16 z-10 relative"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold text-sea-foam">
              Marine<span className="text-aqua-glow">Scope</span>
            </h3>
            <p className="text-sea-foam/60">
              Empowering marine conservation through community-driven monitoring and AI-powered insights.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sea-foam/70 hover:text-aqua-glow transition-colors duration-200 text-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper>{(FaGithub as any)()}</IconWrapper>
              </motion.a>
              <motion.a 
                href="https://twitter.com/your-profile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sea-foam/70 hover:text-aqua-glow transition-colors duration-200 text-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper>{(FaTwitter as any)()}</IconWrapper>
              </motion.a>
              <motion.a 
                href="https://linkedin.com/in/your-profile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sea-foam/70 hover:text-aqua-glow transition-colors duration-200 text-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper>{(FaLinkedin as any)()}</IconWrapper>
              </motion.a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-sea-foam">Quick Links</h4>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sea-foam/60 hover:text-aqua-glow transition-colors duration-200 flex items-center gap-2">
                    <IconWrapper>{(FaFish as any)()}</IconWrapper> About
                  </Link>
                </li>
                <li>
                  <Link to="/sightings" className="text-sea-foam/60 hover:text-aqua-glow transition-colors duration-200 flex items-center gap-2">
                    <IconWrapper>{(FaWater as any)()}</IconWrapper> Sightings
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="text-sea-foam/60 hover:text-aqua-glow transition-colors duration-200 flex items-center gap-2">
                    <IconWrapper>{(FaLeaf as any)()}</IconWrapper> Map
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-sea-foam">Contact</h4>
            <p className="text-sea-foam/60">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            <a href="mailto:contact@marinescope.com" className="text-aqua-glow hover:text-sea-foam transition-colors duration-200">
              contact@marinescope.com
            </a>
          </div>
        </div>
        
        <div className="pt-8 border-t border-aqua-glow/10 text-center">
          <p className="text-sm text-sea-foam/50 flex justify-center items-center gap-1.5">
            Made with <IconWrapper>{(FaHeart as any)({ className: "text-coral animate-pulse" })}</IconWrapper> for the ocean
          </p>
          <p className="text-xs text-sea-foam/40 mt-2">
            © {new Date().getFullYear()} MarineScope. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;