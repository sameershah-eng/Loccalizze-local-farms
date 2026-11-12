import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}) => {
  const isSm = size === 'sm';

  return (
    <div className="inline-flex items-center rounded-2xl bg-[#F3EEE3] border border-[#E7E0D2] p-1 gap-1">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center rounded-xl bg-white text-[#1E1B16] hover:bg-[#FBF8F1] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs border border-[#E7E0D2] ${
          isSm ? 'w-7 h-7' : 'w-8 h-8'
        }`}
      >
        <Minus className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      <span
        className={`font-semibold text-[#1E1B16] text-center tabular-nums px-2 ${
          isSm ? 'text-xs min-w-[24px]' : 'text-sm min-w-[32px]'
        }`}
      >
        {value}
      </span>

      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
        className={`flex items-center justify-center rounded-xl bg-white text-[#1E1B16] hover:bg-[#FBF8F1] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs border border-[#E7E0D2] ${
          isSm ? 'w-7 h-7' : 'w-8 h-8'
        }`}
      >
        <Plus className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  );
};
