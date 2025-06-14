import React from 'react';
import { ReactNode } from 'react';

interface IconWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children, className }) => {
  return <span className={className}>{children}</span>;
};

export default IconWrapper;