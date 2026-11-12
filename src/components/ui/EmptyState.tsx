import React from 'react';
import { Sprout } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-[#E7E0D2] shadow-sm max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-[#F3EEE3] flex items-center justify-center text-[#1F4D3A] mb-4 border border-[#E7E0D2]">
        {icon || <Sprout className="w-8 h-8 text-[#1F4D3A]" />}
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#1F4D3A] mb-2">{title}</h3>
      <p className="text-sm text-[#6B645A] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="solid" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
