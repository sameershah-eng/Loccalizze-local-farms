import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';

// Contexts
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

// Layout & UI
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { BrandLoader } from './components/ui/BrandLoader';

// Pages
import { HomePage } from './pages/HomePage';
import { ExploreFarmsPage } from './pages/ExploreFarmsPage';
import { FarmDetailPage } from './pages/FarmDetailPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/farms" element={<ExploreFarmsPage />} />
          <Route path="/farms/:slug" element={<FarmDetailPage />} />
          <Route path="/join" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [loaderComplete, setLoaderComplete] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartProvider>
          {/* Initial brand loader (~1.5s) */}
          {!loaderComplete && (
            <BrandLoader onComplete={() => setLoaderComplete(true)} />
          )}

          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <AnimatedRoutes />
              <Footer />
              <CartDrawer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
