import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not load the latest harvest data from our local farms. Please check your connection or retry.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-[#C2414B]/30 shadow-sm max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-[#C2414B]/10 flex items-center justify-center text-[#C2414B] mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#1F4D3A] mb-2">{title}</h3>
      <p className="text-sm text-[#6B645A] max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="solid" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try again
        </Button>
      )}
    </div>
  );
};
