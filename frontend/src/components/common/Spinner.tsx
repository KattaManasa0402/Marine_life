import React from 'react';

interface SpinnerProps {
  size?: string;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = '8', color = 'ocean-primary' }) => {
  const colorVariants: { [key: string]: string } = {
    'ocean-primary': 'border-ocean-primary',
    'ocean-dark': 'border-ocean-dark',
    'ocean-medium': 'border-ocean-medium',
    'white': 'border-white',
  };
  const sizeVariants: { [key: string]: string } = {
    '4': 'w-4 h-4', '6': 'w-6 h-6', '8': 'w-8 h-8',
    '12': 'w-12 h-12', '16': 'w-16 h-16',
  };
  const spinnerColorClass = colorVariants[color] || colorVariants['ocean-primary'];
  const spinnerSizeClass = sizeVariants[size] || sizeVariants['8'];

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${spinnerSizeClass} ${spinnerColorClass} border-4 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default Spinner;