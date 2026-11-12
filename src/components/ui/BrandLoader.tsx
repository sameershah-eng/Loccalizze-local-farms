import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  onComplete,
  minDurationMs = 1500,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const word = 'Loccalizze';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF8F1] overflow-hidden select-none"
        >
          {/* Animated SVG Sprout / Leaf drawing itself */}
          <div className="relative mb-6">
            <svg
              width="72"
              height="72"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              {/* Soil base */}
              <motion.path
                d="M12 40C18 38 30 38 36 40"
                stroke="#1F4D3A"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />

              {/* Stem curling up */}
              <motion.path
                d="M24 39C24 30 23 23 25 14"
                stroke="#1F4D3A"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
              />

              {/* Left organic leaf */}
              <motion.path
                d="M24 26C18 24 13 28 15 35C20 35 24 31 24 26Z"
                stroke="#6BBF59"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
              />

              {/* Right fresh leaf */}
              <motion.path
                d="M25 18C31 16 35 19 33 26C28 26 25 22 25 18Z"
                stroke="#A8D672"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.65, ease: 'easeOut' }}
              />
            </svg>
          </div>

          {/* Loccalizze wordmark letter by letter */}
          <div className="flex items-center gap-0.5 overflow-hidden">
            {word.split('').map((letter, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.3 + idx * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`font-serif text-3xl sm:text-4xl font-bold tracking-tight ${
                  letter === 'l' && idx === 5 ? 'text-[#6BBF59]' : 'text-[#1F4D3A]'
                }`}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-xs font-semibold tracking-wider text-[#6B645A] uppercase mt-2"
          >
            Local Farms · Honest Harvest
          </motion.p>

          {/* Thin gradient progress bar */}
          <div className="w-48 h-1 bg-[#E7E0D2] rounded-full overflow-hidden mt-6">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#6BBF59] via-[#F2A541] to-[#E8743B]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
