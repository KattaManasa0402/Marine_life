import React from 'react';

interface OceanBackgroundProps {
    children: React.ReactNode;
}

const OceanBackground: React.FC<OceanBackgroundProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {children}
        </div>
    );
};

export default OceanBackground; 