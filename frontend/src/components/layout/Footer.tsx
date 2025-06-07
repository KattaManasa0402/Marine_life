import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral text-gray-300 mt-auto">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center flex-col sm:flex-row">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h3 className="text-lg font-bold text-white">Marine<span className="text-secondary">Watch</span></h3>
            <p className="text-sm text-gray-400">Community Marine Life Monitoring Platform.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-secondary transition-colors">Feed</Link>
            <Link to="/map" className="hover:text-secondary transition-colors">Map</Link>
            <Link to="/upload" className="hover:text-secondary transition-colors">Upload</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} MarineWatch. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;