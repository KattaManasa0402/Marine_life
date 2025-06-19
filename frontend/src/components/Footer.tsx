import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';

const Footer: React.FC = () => {
    return (
        <footer className="bg-deep-blue/80 backdrop-blur-md text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">MarineScope</h3>
                        <p className="text-white/70">
                            Exploring and documenting marine life through citizen science.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-white/70 hover:text-aqua-glow transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/species" className="text-white/70 hover:text-aqua-glow transition-colors">
                                    Species
                                </Link>
                            </li>
                            <li>
                                <Link to="/observations" className="text-white/70 hover:text-aqua-glow transition-colors">
                                    Observations
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-aqua-glow transition-colors"
                            >
                                <IconWrapper>{(FaGithub as any)()}</IconWrapper>
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-aqua-glow transition-colors"
                            >
                                <IconWrapper>{(FaTwitter as any)()}</IconWrapper>
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-aqua-glow transition-colors"
                            >
                                <IconWrapper>{(FaLinkedin as any)()}</IconWrapper>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50">
                    <p>&copy; {new Date().getFullYear()} MarineScope. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 