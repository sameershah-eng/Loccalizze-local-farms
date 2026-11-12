import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'gradient' | 'solid' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4D3A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] shrink-0';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-2 min-h-[38px] gap-1.5',
      md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5',
    };

    const variantStyles = {
      gradient:
        'bg-gradient-to-r from-[#F2A541] to-[#E8743B] text-white shadow-md shadow-[#F2A541]/25 hover:shadow-lg hover:shadow-[#F2A541]/35 hover:brightness-105 shine-effect border border-transparent',
      solid:
        'bg-[#1F4D3A] text-white hover:bg-[#143326] shadow-sm shadow-[#143326]/15 hover:shadow-md border border-transparent',
      outline:
        'border border-[#E7E0D2] bg-white text-[#1E1B16] hover:bg-[#F3EEE3] hover:border-[#D4CABC]',
      ghost:
        'text-[#1E1B16] hover:bg-[#F3EEE3]/80 hover:text-[#143326] border border-transparent',
      soft:
        'bg-[#F3EEE3] text-[#1F4D3A] hover:bg-[#EBE4D5] border border-transparent',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span className="whitespace-nowrap truncate">{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
