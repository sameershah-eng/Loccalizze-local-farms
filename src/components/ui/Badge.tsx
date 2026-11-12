import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'leaf' | 'harvest' | 'neutral' | 'berry' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    leaf: 'bg-[#6BBF59]/15 text-[#1F4D3A] border border-[#6BBF59]/30 font-semibold',
    harvest: 'bg-[#F2A541]/15 text-[#A65B00] border border-[#F2A541]/30 font-semibold',
    neutral: 'bg-[#F3EEE3] text-[#6B645A] border border-[#E7E0D2] font-medium',
    berry: 'bg-[#C2414B]/15 text-[#9E252E] border border-[#C2414B]/30 font-semibold',
    outline: 'bg-white/80 text-[#1E1B16] border border-[#E7E0D2] font-medium backdrop-blur-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full whitespace-nowrap tracking-tight transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
