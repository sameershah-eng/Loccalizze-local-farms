import React, { useState } from 'react';
import { Sprout } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackKeyword?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackKeyword = 'farm,vegetables',
  className = '',
  containerClassName = '',
  aspectRatio,
  ...props
}) => {
  const [stage, setStage] = useState<'primary' | 'fallback1' | 'fallback2'>('primary');
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (stage === 'primary') {
      setStage('fallback1');
      setIsLoaded(false);
    } else if (stage === 'fallback1') {
      setStage('fallback2');
      setIsLoaded(true);
    }
  };

  const getSource = () => {
    if (stage === 'primary') return src;
    if (stage === 'fallback1') {
      return `https://loremflickr.com/1200/800/${encodeURIComponent(fallbackKeyword)}?random=${encodeURIComponent(alt)}`;
    }
    return '';
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F3EEE3] ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading shimmer placeholder */}
      {!isLoaded && stage !== 'fallback2' && (
        <div className="absolute inset-0 bg-[#F3EEE3] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#1F4D3A]/20 border-t-[#1F4D3A] animate-spin" />
        </div>
      )}

      {/* Visual Content or Gradient Fallback */}
      {stage === 'fallback2' ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F4D3A] to-[#143326] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#A8D672]/20 flex items-center justify-center text-[#A8D672] mb-2">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-white/80 max-w-[80%] truncate">
            {alt || 'Loccalizze Harvest'}
          </span>
        </div>
      ) : (
        <img
          src={getSource()}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
