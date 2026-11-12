import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-[#1E1B16] tracking-tight">
            {label}
            {props.required && <span className="text-[#C2414B] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#6B645A] pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border text-sm text-[#1E1B16] placeholder:text-[#6B645A]/50 rounded-2xl py-2.5 transition-all duration-200 outline-none min-h-[44px] ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-[#C2414B] focus:border-[#C2414B] focus:ring-2 focus:ring-[#C2414B]/20'
                : 'border-[#E7E0D2] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A]/20 hover:border-[#D4CABC]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#6B645A] shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-[#C2414B] mt-0.5">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#6B645A] mt-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
