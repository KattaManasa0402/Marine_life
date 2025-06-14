import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaSignInAlt, FaUserPlus, FaUserCircle, FaUpload, FaMap, FaFish, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import IconWrapper from '../../utils/IconWrapper';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Upload', path: '/upload', icon: <IconWrapper><FaUpload /></IconWrapper>, protected: true },
    { name: 'Sightings', path: '/sightings', icon: <IconWrapper><FaFish /></IconWrapper>, protected: true },
    { name: 'Map', path: '/map', icon: <IconWrapper><FaMap /></IconWrapper>, protected: true },
    { name: 'Profile', path: '/profile', icon: <IconWrapper><FaUserCircle /></IconWrapper>, protected: true },
    { name: 'About', path: '/about', icon: <IconWrapper><FaInfoCircle /></IconWrapper>, protected: false },
  ];

  const authNavItems = isAuthenticated
    ? navItems
    : navItems.filter(item => !item.protected);

  const mobileMenuVariants = {
    hidden: { x: "100%" },
    visible: { x: "0%", transition: { type: "spring", stiffness: 120, damping: 20 } },
    exit: { x: "100%", transition: { duration: 0.3 } }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-glass-light-bg backdrop-blur-md border-b border-glass-light-border shadow-sm"
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        {/* Logo/Site Title */}
        <Link to={isAuthenticated ? "/upload" : "/login"} className="text-3xl font-heading text-ocean-dark hover:text-ocean-primary transition-colors duration-300">
          Marine<span className="text-ocean-primary">Watch</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {authNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-ocean-text-dark text-lg font-semibold hover:text-ocean-primary transition-colors duration-300 relative group"
            >
              {item.name}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-ocean-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
          {isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn-secondary py-2 px-6"
            >
              <IconWrapper><FaSignOutAlt className="inline-block mr-2" /></IconWrapper> Logout
            </motion.button>
          ) : (
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="btn-primary py-2 px-6"
              >
                <IconWrapper><FaSignInAlt className="inline-block mr-2" /></IconWrapper> Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="btn-secondary py-2 px-6"
              >
                <IconWrapper><FaUserPlus className="inline-block mr-2" /></IconWrapper> Register
              </motion.button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-ocean-dark text-2xl focus:outline-none">
            {isMobileMenuOpen ? <IconWrapper><FaTimes /></IconWrapper> : <IconWrapper><FaBars /></IconWrapper>}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Conditionally rendered) */}
      {isMobileMenuOpen && (
        <motion.nav
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={mobileMenuVariants}
          className="md:hidden fixed top-0 right-0 w-64 h-screen bg-glass-light-bg backdrop-blur-lg shadow-xl py-8 px-6 flex flex-col items-start space-y-6 z-50"
        >
          <button onClick={() => setIsMobileMenuOpen(false)} className="self-end text-ocean-dark text-2xl mb-4 focus:outline-none">
            <IconWrapper><FaTimes /></IconWrapper>
          </button>
          {authNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-ocean-text-dark text-xl font-semibold flex items-center gap-3 hover:text-ocean-primary transition-colors duration-300"
            >
              {item.icon} {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-ocean-medium w-full">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="btn-secondary w-full flex items-center gap-3 justify-center py-2 px-4"
              >
                <IconWrapper><FaSignOutAlt /></IconWrapper> Logout
              </motion.button>
            ) : (
              <div className="flex flex-col space-y-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="btn-primary w-full flex items-center gap-3 justify-center py-2 px-4"
                >
                  <IconWrapper><FaSignInAlt /></IconWrapper> Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                  className="btn-secondary w-full flex items-center gap-3 justify-center"
                >
                  <IconWrapper><FaUserPlus /></IconWrapper> Register
                </motion.button>
              </div>
            )}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
};

export default Header;