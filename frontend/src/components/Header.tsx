import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaRightFromBracket, FaBars, FaXmark } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-deep-blue/80 backdrop-blur-md fixed w-full z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-display font-bold text-white">
                        MarineScope
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden text-white p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <IconWrapper>{(isMenuOpen ? FaXmark : FaBars as any)()}</IconWrapper>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className="text-white hover:text-aqua-glow transition-colors">
                            Home
                        </Link>
                        <Link to="/species" className="text-white hover:text-aqua-glow transition-colors">
                            Species
                        </Link>
                        <Link to="/observations" className="text-white hover:text-aqua-glow transition-colors">
                            Observations
                        </Link>
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="text-white hover:text-aqua-glow transition-colors flex items-center gap-2">
                                    <IconWrapper>{(FaUser as any)()}</IconWrapper>
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:text-aqua-glow transition-colors flex items-center gap-2"
                                >
                                    <IconWrapper>{(FaRightFromBracket as any)()}</IconWrapper>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-white hover:text-aqua-glow transition-colors">
                                Login
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="lg:hidden py-4 space-y-4">
                        <Link
                            to="/"
                            className="block text-white hover:text-aqua-glow transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/species"
                            className="block text-white hover:text-aqua-glow transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Species
                        </Link>
                        <Link
                            to="/observations"
                            className="block text-white hover:text-aqua-glow transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Observations
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="block text-white hover:text-aqua-glow transition-colors flex items-center gap-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <IconWrapper>{(FaUser as any)()}</IconWrapper>
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="block text-white hover:text-aqua-glow transition-colors flex items-center gap-2 w-full text-left"
                                >
                                    <IconWrapper>{(FaRightFromBracket as any)()}</IconWrapper>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block text-white hover:text-aqua-glow transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header; 