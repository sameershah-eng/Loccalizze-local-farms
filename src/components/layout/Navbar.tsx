import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Sprout, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CommandSearch } from './CommandSearch';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();

  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress((scrollY / winHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Determine if header is in dark transparent mode (on home hero before scroll)
  const isTransparent = isHomePage && !isScrolled;

  const navLinks = [
    { label: 'Explore Farms', href: '/farms' },
    { label: 'Fresh This Week', href: '/#fresh' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'For Farms', href: '/join' },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate(href);
      } else {
        const id = href.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          isTransparent
            ? 'h-[88px] bg-transparent text-white'
            : 'h-[68px] bg-[#FBF8F1]/85 backdrop-blur-xl text-[#1E1B16] border-b border-[#E7E0D2]/80 shadow-xs shadow-[#1F4D3A]/5'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isTransparent
                  ? 'bg-white/20 text-white backdrop-blur-md group-hover:bg-white/30'
                  : 'bg-[#1F4D3A] text-[#A8D672] group-hover:bg-[#143326]'
              }`}
            >
              <Sprout className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`font-serif text-2xl font-bold tracking-tight transition-all duration-300 ${
                isTransparent ? 'text-white' : 'text-[#1F4D3A]'
              }`}
            >
              Loccalizze
            </span>
          </Link>

          {/* Center: Desktop Navigation Links with sliding underline */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {navLinks.map((link) => {
              const isActive =
                link.href === location.pathname ||
                (link.href.startsWith('/#') && location.hash === link.href.replace('/', ''));

              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap rounded-full ${
                    isTransparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-[#1E1B16]/80 hover:text-[#1F4D3A]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${
                        isTransparent ? 'bg-[#F2A541]' : 'bg-[#1F4D3A]'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search produce and farms"
              className={`p-2.5 rounded-2xl transition-all duration-200 flex items-center gap-2 ${
                isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#1E1B16] hover:bg-[#F3EEE3]'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-semibold opacity-80">
                Search farms...
              </span>
            </button>

            {/* Cart Icon with popping animated count badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View shopping cart"
              className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
                isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#1E1B16] hover:bg-[#F3EEE3]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F2A541] to-[#E8743B] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-[#F2A541]/30 tabular-nums"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* List Your Farm CTA (Desktop) */}
            <Link to="/join" className="hidden sm:inline-flex">
              <button className="bg-gradient-to-r from-[#F2A541] to-[#E8743B] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-2xl shadow-md shadow-[#F2A541]/25 hover:shadow-lg hover:shadow-[#F2A541]/35 hover:brightness-105 transition-all shine-effect cursor-pointer whitespace-nowrap">
                List Your Farm
              </button>
            </Link>

            {/* Animated Hamburger for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className={`lg:hidden p-2.5 rounded-2xl transition-all duration-200 z-50 ${
                isMobileMenuOpen
                  ? 'text-white'
                  : isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#1E1B16] hover:bg-[#F3EEE3]'
              }`}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5 bg-white' : isTransparent ? 'bg-white' : 'bg-[#1E1B16]'
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 bg-white' : isTransparent ? 'bg-white' : 'bg-[#1E1B16]'
                  }`}
                />
                <span
                  className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2 bg-white' : isTransparent ? 'bg-white' : 'bg-[#1E1B16]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar along bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-[#6BBF59] via-[#F2A541] to-[#E8743B] transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Mobile Full-Screen Staggered Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-[#143326] via-[#1F4D3A] to-[#143326] flex flex-col justify-between p-6 pt-28 text-white"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link, idx) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  onClick={() => handleNavClick(link.href)}
                  className="font-serif text-3xl font-bold text-left hover:text-[#A8D672] transition-colors flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="pt-4 border-t border-white/10"
              >
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-white/80 hover:text-white flex items-center justify-between"
                >
                  <span>Farm Owner Dashboard</span>
                  <span className="text-xs text-[#A8D672] bg-[#A8D672]/20 px-2.5 py-0.5 rounded-full">
                    Demo Farm
                  </span>
                </Link>
              </motion.div>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 pb-6"
            >
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/join');
                }}
                className="w-full bg-gradient-to-r from-[#F2A541] to-[#E8743B] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#F2A541]/30 shine-effect"
              >
                List Your Farm Free
              </button>
              <p className="text-xs text-center text-white/60">
                Join 1,240+ local farms feeding their communities.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Search Overlay */}
      <CommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
