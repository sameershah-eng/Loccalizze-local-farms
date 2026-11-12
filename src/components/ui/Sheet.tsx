import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'bottom';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#143326]/60 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.div
            initial={position === 'right' ? { x: '100%' } : { y: '100%' }}
            animate={position === 'right' ? { x: 0 } : { y: 0 }}
            exit={position === 'right' ? { x: '100%' } : { y: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#FBF8F1] shadow-2xl border-l border-[#E7E0D2] flex flex-col z-10 ${className}`}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E7E0D2] flex items-center justify-between bg-white/60 backdrop-blur-md">
              {title ? (
                <h3 className="font-serif text-xl font-bold text-[#1F4D3A] tracking-tight">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="p-2 text-[#6B645A] hover:text-[#1E1B16] rounded-full hover:bg-[#F3EEE3] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
