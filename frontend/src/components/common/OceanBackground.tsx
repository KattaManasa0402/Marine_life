import React, { useMemo } from 'react';

interface OceanBackgroundProps {
    children: React.ReactNode;
    bubbleCount?: number;
}

const OceanBackground: React.FC<OceanBackgroundProps> = ({ children, bubbleCount = 0 }) => {
    const bubbles = useMemo(() => {
        return Array.from({ length: bubbleCount }).map((_, i) => {
            const size = Math.floor(Math.random() * 150) + 50; // 50px to 200px
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s
                animationDelay: `${Math.random() * 5}s`,
                top: `${Math.random() * 100}%`,
            };
            return <div key={i} className="bubble" style={style} />;
        });
    }, [bubbleCount]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {bubbles}
            {children}
        </div>
    );
};

export default OceanBackground; 