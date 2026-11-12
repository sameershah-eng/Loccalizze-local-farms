import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sprout, ArrowRight, X } from 'lucide-react';
import { useFarms, useProducts } from '../../hooks/useData';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: farms = [] } = useFarms();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredFarms = query.trim()
    ? farms
        .filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.town.toLowerCase().includes(query.toLowerCase()) ||
            f.farmType.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const filteredProducts = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.farmName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSelectFarm = (slug: string) => {
    navigate(`/farms/${slug}`);
    onClose();
  };

  const handleSelectProduct = (farmSlug: string = 'willow-creek-farm') => {
    navigate(`/farms/${farmSlug}`);
    onClose();
  };

  const handleViewAllFarms = () => {
    navigate(`/farms?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#143326]/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-[#FBF8F1] rounded-3xl border border-[#E7E0D2] shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E7E0D2] bg-white">
              <Search className="w-5 h-5 text-[#6B645A] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search heirloom tomatoes, honey, farms in Brenham..."
                className="w-full bg-transparent text-base text-[#1E1B16] placeholder:text-[#6B645A]/50 outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search input"
                  className="p-1 text-[#6B645A] hover:text-[#1E1B16] rounded-full hover:bg-[#F3EEE3]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:inline-block text-[11px] font-semibold text-[#6B645A] bg-[#F3EEE3] px-2 py-0.5 rounded-md border border-[#E7E0D2]">
                ESC
              </span>
            </div>

            {/* Suggestions & Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {!query.trim() ? (
                <div>
                  <p className="text-xs font-bold text-[#6B645A] uppercase tracking-wider mb-2 px-2">
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {['Heirloom tomatoes', 'Pasture eggs', 'Raw wildflower honey', 'Fredericksburg peaches', 'Organic sourdough'].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="text-xs font-medium bg-white hover:bg-[#F3EEE3] text-[#1E1B16] border border-[#E7E0D2] rounded-xl px-3 py-1.5 transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : filteredFarms.length === 0 && filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-[#6B645A]">
                  <Sprout className="w-8 h-8 mx-auto text-[#6B645A]/60 mb-2" />
                  <p className="text-sm font-semibold">No direct matches found</p>
                  <p className="text-xs mt-1">Try searching for &quot;Brenham&quot;, &quot;Honey&quot;, or &quot;Vegetables&quot;</p>
                </div>
              ) : (
                <>
                  {/* Matching Farms */}
                  {filteredFarms.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#6B645A] uppercase tracking-wider mb-2 px-2">
                        Farms ({filteredFarms.length})
                      </p>
                      <div className="space-y-1">
                        {filteredFarms.map((farm) => (
                          <button
                            key={farm.id}
                            onClick={() => handleSelectFarm(farm.slug)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-all text-left group border border-transparent hover:border-[#E7E0D2]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={farm.coverImage}
                                alt={farm.name}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#1E1B16] group-hover:text-[#1F4D3A] truncate">
                                  {farm.name}
                                </p>
                                <p className="text-xs text-[#6B645A] flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{farm.town}, {farm.state} · {farm.distanceMiles} mi</span>
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#6B645A] group-hover:text-[#1F4D3A] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#6B645A] uppercase tracking-wider mb-2 px-2">
                        Produce & Harvest ({filteredProducts.length})
                      </p>
                      <div className="space-y-1">
                        {filteredProducts.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod.farmSlug)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-all text-left group border border-transparent hover:border-[#E7E0D2]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#1E1B16] group-hover:text-[#1F4D3A] truncate">
                                  {prod.name}
                                </p>
                                <p className="text-xs text-[#6B645A]">
                                  {prod.farmName} · <span className="font-semibold text-[#1F4D3A]">${prod.price.toFixed(2)}</span> / {prod.unit}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#1F4D3A] bg-[#6BBF59]/15 px-2.5 py-1 rounded-full shrink-0 ml-2">
                              View farm
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions */}
            {query.trim() && (
              <div className="p-3 bg-[#F3EEE3] border-t border-[#E7E0D2] flex justify-end">
                <button
                  onClick={handleViewAllFarms}
                  className="text-xs font-bold text-[#1F4D3A] hover:underline flex items-center gap-1 px-3 py-1.5"
                >
                  <span>See all search results in Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
