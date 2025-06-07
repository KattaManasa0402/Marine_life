import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = "px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:bg-primary-focus hover:text-white transition-colors";
  const activeLinkClass = "bg-secondary text-white";

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-info transition-colors">
              Marine<span className="text-secondary">Watch</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-baseline space-x-4 ml-10">
            <NavLink to="/" className={({ isActive }) => isActive ? `${linkClass} ${activeLinkClass}` : linkClass}>Feed</NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? `${linkClass} ${activeLinkClass}` : linkClass}>Map</NavLink>
            {user && <NavLink to="/upload" className={({ isActive }) => isActive ? `${linkClass} ${activeLinkClass}` : linkClass}>Upload</NavLink>}
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NavLink to="/profile" className="font-medium text-gray-200 hover:text-white transition-colors">
                  {user.username} <span className="text-accent font-bold">({user.score} pts)</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="bg-transparent border border-accent text-accent hover:bg-accent hover:text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-gray-200 hover:text-white transition-colors">Login</Link>
                <Link
                  to="/register"
                  className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;