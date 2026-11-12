import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  undoAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'success', undoAction }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, type, undoAction }]);

      setTimeout(() => {
        removeToast(id);
      }, 4200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className="pointer-events-auto bg-[#1F4D3A] text-white p-4 rounded-2xl shadow-xl shadow-[#143326]/20 border border-[#2A684F] flex items-start gap-3 backdrop-blur-md"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-[#A8D672]" />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-[#C2414B]" />
                )}
                {toast.type === 'info' && (
                  <Info className="w-5 h-5 text-[#F2A541]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A8D672]">
                    {toast.title}
                  </p>
                )}
                <p className="text-sm font-medium text-white/95 leading-snug">
                  {toast.message}
                </p>
                {toast.undoAction && (
                  <button
                    onClick={() => {
                      toast.undoAction?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-[#F2A541] hover:underline"
                  >
                    Undo action
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="text-white/60 hover:text-white transition-colors p-1 -mr-1 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
