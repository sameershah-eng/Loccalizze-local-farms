import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  // Lock body scroll when open
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

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#143326]/60 backdrop-blur-sm"
          />

          {/* Dialog Container (Bottom sheet on mobile, centered card on desktop) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[#FBF8F1] rounded-t-3xl sm:rounded-3xl border border-[#E7E0D2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}
          >
            {/* Mobile sheet drag handle */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D4CABC] rounded-full mx-auto mb-4" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h3 className="font-serif text-2xl font-bold text-[#1F4D3A] tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-[#6B645A] mt-1">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 -mr-2 -mt-2 text-[#6B645A] hover:text-[#1E1B16] rounded-full hover:bg-[#F3EEE3] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
