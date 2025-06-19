import React from 'react';

interface IconWrapperProps {
  children: React.ReactElement<any, any>;
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {children}
    </span>
  );
};

export default IconWrapper;