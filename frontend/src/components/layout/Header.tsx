import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaBars, FaXmark, FaCircleUser, FaFish, FaKey, FaRightFromBracket, FaMap, FaUpload } from 'react-icons/fa6';
import IconWrapper from '../../utils/IconWrapper';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Upload', path: '/upload', icon: <IconWrapper>{(FaUpload as any)()}</IconWrapper>, protected: true },
    { name: 'Sightings', path: '/sightings', icon: <IconWrapper>{(FaFish as any)()}</IconWrapper>, protected: true },
    { name: 'Map', path: '/map', icon: <IconWrapper>{(FaMap as any)()}</IconWrapper>, protected: true },
    { name: 'Profile', path: '/profile', icon: <IconWrapper>{(FaCircleUser as any)()}</IconWrapper>, protected: true },
  ];
  
  const authNavItems = isAuthenticated ? navItems : navItems.filter(item => !item.protected);
  const homePath = isAuthenticated ? "/upload" : "/";

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-deep-blue/50 backdrop-blur-lg border-b border-aqua-glow/10 shadow-deep-glow"
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link to={homePath} className="text-3xl font-display font-bold text-sea-foam hover:text-aqua-glow transition-colors duration-300">
          Marine<span className="text-aqua-glow">Scope</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {authNavItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`text-sea-foam text-lg font-semibold hover:text-aqua-glow transition-colors duration-300 relative group ${
                location.pathname.startsWith(item.path) ? 'text-aqua-glow' : ''
              }`}
            >
              {item.name}
              <span className={`absolute left-0 -bottom-1 w-0 h-0.5 bg-aqua-glow group-hover:w-full transition-all duration-300 ${
                location.pathname.startsWith(item.path) ? 'w-full' : ''
              }`}></span>
            </Link>
          ))}
          {isAuthenticated ? (
            <motion.button 
              onClick={handleLogout} 
              className="bg-coral/20 text-sea-foam font-semibold py-2 px-5 rounded-full border border-coral/50 hover:bg-coral/40 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper>{(FaRightFromBracket as any)()}</IconWrapper> Logout
            </motion.button>
          ) : (
            <motion.button 
              onClick={() => navigate('/login')} 
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper>{(FaKey as any)()}</IconWrapper> Login
            </motion.button>
          )}
        </nav>
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-sea-foam text-2xl focus:outline-none hover:text-aqua-glow transition-colors"
          >
            {isMobileMenuOpen ? <IconWrapper>{(FaXmark as any)()}</IconWrapper> : <IconWrapper>{(FaBars as any)()}</IconWrapper>}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:hidden fixed top-0 right-0 w-full max-w-xs h-screen bg-deep-blue/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-start space-y-6 z-50 border-l border-aqua-glow/20"
        >
          <button onClick={() => setIsMobileMenuOpen(false)} className="self-end text-sea-foam text-2xl mb-4 focus:outline-none hover:text-aqua-glow transition-colors">
            <IconWrapper>{(FaXmark as any)()}</IconWrapper>
          </button>
          {authNavItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sea-foam text-xl font-semibold flex items-center gap-4 hover:text-aqua-glow transition-colors duration-300"
            >
              {item.icon} {item.name}
            </Link>
          ))}
          <div className="pt-6 border-t border-aqua-glow/20 w-full mt-auto">
            {isAuthenticated ? (
              <motion.button 
                onClick={handleLogout} 
                className="bg-coral/20 text-sea-foam font-semibold w-full flex items-center gap-3 justify-center py-3 px-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper>{(FaRightFromBracket as any)()}</IconWrapper> Logout
              </motion.button>
            ) : (
              <motion.button 
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} 
                className="btn-primary w-full flex items-center gap-3 justify-center py-3 px-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper>{(FaKey as any)()}</IconWrapper> Login
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header; 