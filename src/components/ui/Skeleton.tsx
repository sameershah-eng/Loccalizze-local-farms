import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const variantStyles = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-3/4',
  };

  return (
    <div
      className={`animate-pulse bg-[#F3EEE3] border border-[#E7E0D2]/50 ${variantStyles[variant]} ${className}`}
    />
  );
};
