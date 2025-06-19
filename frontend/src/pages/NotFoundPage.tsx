import React from 'react';
import { Link } from 'react-router-dom';
import { FaHouse } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-deep-blue to-black p-4">
            <div className="text-center">
                <h1 className="text-9xl font-display font-bold text-aqua-glow mb-4">404</h1>
                <h2 className="text-3xl font-display font-semibold text-white mb-6">Page Not Found</h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                    <IconWrapper>{(FaHouse as any)()}</IconWrapper>
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage; 