import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  isHoverable?: boolean;
  className?: string;
  variant?: 'surface' | 'soft' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  isHoverable = false,
  className = '',
  variant = 'surface',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-white border border-[#E7E0D2] shadow-sm shadow-[#1E1B16]/5',
    soft: 'bg-[#F3EEE3] border border-[#E7E0D2]/80',
    glass: 'bg-white/80 backdrop-blur-md border border-[#E7E0D2]/60 shadow-lg shadow-[#1E1B16]/5',
  };

  if (isHoverable) {
    return (
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
        className={`rounded-3xl overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-[#1F4D3A]/8 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`rounded-3xl overflow-hidden ${variantStyles[variant]} ${className}`}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
};
