import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Search,
  ArrowRight,
  Heart,
  Star,
  ChevronDown,
  ShoppingBag,
  Store,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Leaf,
} from 'lucide-react';
import { useFarms, useProducts } from '../hooks/useData';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { TESTIMONIALS } from '../data/mock/reviews';

const CATEGORIES = [
  { name: 'All', icon: Leaf },
  { name: 'Vegetables', icon: Leaf },
  { name: 'Fruit', icon: Leaf },
  { name: 'Eggs & Dairy', icon: Store },
  { name: 'Meat', icon: ShieldCheck },
  { name: 'Honey', icon: Sparkles },
  { name: 'Bakery', icon: Store },
  { name: 'Flowers', icon: Heart },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedFarms, setSavedFarms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('loccalizze_saved_farms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { data: allProducts = [], isLoading: isLoadingProducts } = useProducts();

  const featuredFarms = allFarms.slice(0, 4);
  const freshProducts = allProducts
    .filter((p) => activeCategory === 'All' || p.category === activeCategory)
    .slice(0, 8);

  const toggleSaveFarm = (farmId: string, farmName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedFarms((prev) => {
      const next = prev.includes(farmId)
        ? prev.filter((id) => id !== farmId)
        : [...prev, farmId];
      try {
        localStorage.setItem('loccalizze_saved_farms', JSON.stringify(next));
      } catch {}
      return next;
    });

    const isNowSaved = !savedFarms.includes(farmId);
    showToast({
      title: isNowSaved ? 'Saved to favorites' : 'Removed from favorites',
      message: `${farmName} ${isNowSaved ? 'saved to your favorites list.' : 'removed.'}`,
      type: 'info',
    });
  };

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      navigate('/farms');
    } else {
      navigate(`/farms?q=${encodeURIComponent(locationInput.trim())}`);
    }
  };

  const handleSelectSuggestion = (town: string) => {
    setLocationInput(town);
    setShowLocationSuggestions(false);
    navigate(`/farms?q=${encodeURIComponent(town)}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92svh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Image with Ken Burns Zoom & Scrim Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            src="/src/assets/images/hero_farm_landscape_1794498933164.jpg"
            alt="Lush rolling green hills of a Texas family farm at sunrise"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'easeOut' }}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradients & Grain Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#143326] via-[#143326]/75 to-[#143326]/40" />
          <div className="absolute inset-0 bg-grain opacity-40 mix-blend-overlay" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#6BBF59]" />
            <span>Fresh from 1,240+ verified local farms near you</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl"
          >
            Know your farmer.{' '}
            <span className="bg-gradient-to-r from-[#6BBF59] via-[#A8D672] to-[#F2A541] bg-clip-text text-transparent">
              Taste the difference.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl font-normal leading-relaxed"
          >
            Discover neighboring family growers, reserve morning-picked produce, and pick up directly at the barn or receive fresh local delivery.
          </motion.p>

          {/* Location Search Bar with Glass Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 sm:mt-10 w-full max-w-xl relative"
          >
            <form
              onSubmit={handleLocationSearch}
              className="relative flex items-center bg-white/95 backdrop-blur-xl p-2 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 focus-within:ring-4 focus-within:ring-[#A8D672]/30 transition-all"
            >
              <div className="pl-3.5 pr-2 text-[#1F4D3A]">
                <MapPin className="w-5 h-5 shrink-0" />
              </div>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                placeholder="Enter your ZIP or city (e.g. Brenham, Austin)..."
                className="w-full bg-transparent text-sm sm:text-base text-[#1E1B16] placeholder:text-[#6B645A]/60 font-medium outline-none py-2"
              />
              <Button
                type="submit"
                variant="gradient"
                size="md"
                className="rounded-xl sm:rounded-2xl"
                rightIcon={<Search className="w-4 h-4" />}
              >
                Find Farms
              </Button>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showLocationSuggestions && locationInput.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E7E0D2] overflow-hidden z-30 text-left p-2"
                >
                  <p className="text-[11px] font-bold text-[#6B645A] uppercase px-3 py-1">
                    Nearby Farm Towns
                  </p>
                  {['Brenham, TX', 'Fredericksburg, TX', 'Round Top, TX', 'Wimberley, TX', 'Dripping Springs, TX']
                    .filter((t) => t.toLowerCase().includes(locationInput.toLowerCase()))
                    .map((town) => (
                      <button
                        key={town}
                        type="button"
                        onClick={() => handleSelectSuggestion(town)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1E1B16] hover:bg-[#F3EEE3] rounded-xl text-left font-medium transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#1F4D3A] shrink-0" />
                        <span>{town}</span>
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating Glass Cards (Over Image) */}
          <div className="w-full max-w-4xl mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Floating Farm Mini-Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/85 backdrop-blur-md border border-white/40 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3.5 text-left text-[#1E1B16]"
            >
              <img
                src="/src/assets/images/hero_farm_landscape_1794498933164.jpg"
                alt="Willow Creek Farm"
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E7E0D2]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#1F4D3A] truncate">
                    Willow Creek Farm
                  </h4>
                  <span className="flex items-center text-xs font-bold text-[#F2A541]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    4.9
                  </span>
                </div>
                <p className="text-xs text-[#6B645A] flex items-center gap-1">
                  <span>Brenham, TX</span>
                  <span>·</span>
                  <span className="font-medium text-[#1F4D3A]">3.2 mi</span>
                  <span>·</span>
                  <span className="text-[#6BBF59] font-semibold">Open today</span>
                </p>
              </div>
              <Link to="/farms/willow-creek-farm">
                <button className="text-xs font-bold text-[#1F4D3A] hover:underline px-2 py-1 bg-[#F3EEE3] rounded-lg">
                  Visit
                </button>
              </Link>
            </motion.div>

            {/* Floating Product Card */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="bg-white/85 backdrop-blur-md border border-white/40 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3.5 text-left text-[#1E1B16]"
            >
              <img
                src="/src/assets/images/produce_heirloom_basket_1794498934192.jpg"
                alt="Heirloom Rainbow Tomatoes"
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E7E0D2]"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#1F4D3A] truncate">
                  Heirloom Tomatoes
                </h4>
                <p className="text-xs text-[#6B645A]">
                  <span className="font-bold text-[#1E1B16]">$5.50</span> / lb · <span className="text-[#A65B00] font-semibold">Picked today 6:30 AM</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="gradient"
                onClick={() => {
                  if (allProducts[0]) addToCart(allProducts[0]);
                }}
              >
                + Add
              </Button>
            </motion.div>
          </div>

          {/* Trust Row & Animated Counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/85 text-xs sm:text-sm font-medium"
          >
            {/* Shopper Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Happy shopper"
                    className="w-7 h-7 rounded-full border-2 border-[#143326] object-cover"
                  />
                ))}
              </div>
              <span>Loved by <strong className="text-white font-bold">38,000+</strong> local shoppers</span>
            </div>

            <span className="hidden sm:inline text-white/30">•</span>

            <div className="flex items-center gap-1.5 text-white/90">
              <ShieldCheck className="w-4 h-4 text-[#A8D672]" />
              <span>100% direct revenue to growers</span>
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <div className="mt-8">
            <button
              onClick={() => {
                const el = document.getElementById('categories');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Scroll down to explore"
              className="text-white/60 hover:text-white transition-colors animate-bounce p-2"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CHIPS ROW */}
      <section id="categories" className="py-6 bg-white border-b border-[#E7E0D2] sticky top-[68px] z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#1F4D3A] text-white border-[#1F4D3A] shadow-sm'
                      : 'bg-[#FBF8F1] text-[#1E1B16] border-[#E7E0D2] hover:bg-[#F3EEE3]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED FARMS NEAR YOU */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
              Community Growers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1">
              Farms near you
            </h2>
            <p className="text-sm text-[#6B645A] mt-1">
              Family-owned operations offering barnside pickup and direct harvest reservations.
            </p>
          </div>
          <Link to="/farms">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore all 12 farms
            </Button>
          </Link>
        </div>

        {isLoadingFarms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-[#E7E0D2] space-y-3">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFarms.map((farm) => {
              const isSaved = savedFarms.includes(farm.id);
              return (
                <Card
                  key={farm.id}
                  isHoverable
                  className="group flex flex-col justify-between cursor-pointer"
                  onClick={() => navigate(`/farms/${farm.slug}`)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <ImageWithFallback
                      src={farm.coverImage}
                      alt={farm.name}
                      fallbackKeyword="farm,agriculture"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Open Today Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {farm.openToday ? (
                        <span className="bg-white/95 backdrop-blur-md text-[#1F4D3A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-white/60">
                          Open today
                        </span>
                      ) : (
                        <span className="bg-[#143326]/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md">
                          Next: {farm.pickupDays[0]}
                        </span>
                      )}
                    </div>

                    {/* Save Heart Button */}
                    <button
                      onClick={(e) => toggleSaveFarm(farm.id, farm.name, e)}
                      aria-label={isSaved ? `Unsave ${farm.name}` : `Save ${farm.name}`}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-[#1E1B16] transition-transform active:scale-90 shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isSaved ? 'fill-[#C2414B] text-[#C2414B]' : 'text-[#6B645A]'
                        }`}
                      />
                    </button>

                    {/* Farmer Avatar in bottom right overlay */}
                    <img
                      src={farm.avatar}
                      alt={farm.farmerName}
                      className="absolute -bottom-4 right-4 w-11 h-11 rounded-2xl border-2 border-white object-cover shadow-md"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B645A] mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1F4D3A]" />
                        <span>{farm.town}, {farm.state}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#1F4D3A]">{farm.distanceMiles} mi</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#1F4D3A] group-hover:text-[#6BBF59] transition-colors leading-snug">
                        {farm.name}
                      </h3>

                      <p className="text-xs text-[#6B645A] mt-1.5 line-clamp-2 leading-relaxed">
                        {farm.tagline}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E7E0D2] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[#F2A541] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{farm.rating}</span>
                        <span className="text-[#6B645A] font-normal">({farm.reviewCount})</span>
                      </div>

                      <span className="font-semibold text-[#1F4D3A] flex items-center gap-1">
                        View Farm
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FRESH THIS WEEK (PRODUCT GRID) */}
      <section id="fresh" className="py-16 sm:py-20 bg-[#F3EEE3]/60 border-y border-[#E7E0D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#F2A541] uppercase tracking-wider">
                Harvested Fresh
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1">
                Fresh this week
              </h2>
              <p className="text-sm text-[#6B645A] mt-1">
                Picked within hours of reservation. Reserve your portion before small batches sell out.
              </p>
            </div>
            <Link to="/farms">
              <Button variant="solid">See All Produce</Button>
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-[#E7E0D2] space-y-3">
                  <Skeleton className="h-44 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {freshProducts.map((prod) => (
                <Card
                  key={prod.id}
                  className="bg-white p-4 flex flex-col justify-between group"
                >
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
                    <ImageWithFallback
                      src={prod.image}
                      alt={prod.name}
                      fallbackKeyword={`farm,${prod.category.toLowerCase()}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md text-[#1F4D3A] text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/60 shadow-xs">
                        {prod.badge}
                      </span>
                    )}
                    {prod.stockCount <= 12 && (
                      <span className="absolute bottom-2.5 left-2.5 bg-[#C2414B]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Only {prod.stockCount} left
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#6B645A] font-medium">
                        {prod.farmName}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-[#1E1B16] mt-0.5 group-hover:text-[#1F4D3A] leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#6B645A] mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E7E0D2] flex items-center justify-between">
                      <div>
                        <span className="font-serif text-xl font-bold text-[#1F4D3A]">
                          ${prod.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#6B645A] ml-1">/ {prod.unit}</span>
                      </div>

                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => addToCart(prod)}
                        leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
            Simple & Transparent
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1">
            How Loccalizze works
          </h2>
          <p className="text-sm text-[#6B645A] mt-2">
            Eliminating food warehouses, cold storage, and distributor middlemen. From soil to your table in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'Discover Nearby Farms',
              desc: 'Browse family growers by town, distance, and farming practices (regenerative, organic, pasture-raised).',
              icon: MapPin,
              tag: 'Real Producers',
            },
            {
              num: '02',
              title: 'Reserve Fresh Harvest',
              desc: 'Select morning-picked vegetables, tree-ripened fruit, raw honey, or eggs at fair market prices.',
              icon: ShoppingBag,
              tag: 'Small Batch',
            },
            {
              num: '03',
              title: 'Pick Up or Delivery',
              desc: 'Pick up your prepared crate directly at the farmstand on open days, or choose local doorstep delivery.',
              icon: Truck,
              tag: 'Zero Middlemen',
            },
          ].map((step, idx) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl p-8 border border-[#E7E0D2] shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-bold text-[#F2A541]">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1F4D3A] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B645A] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E7E0D2]">
                <Badge variant="leaf" size="sm">
                  {step.tag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MEET THE FARMER (STORY SECTION) */}
      <section className="py-20 bg-white border-t border-[#E7E0D2] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Large Asymmetric Farmer Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E7E0D2]">
                <img
                  src="/src/assets/images/farm_farmer_portrait_1794498934361.jpg"
                  alt="Sarah Jenkins, fifth-generation grower at Willow Creek Farm"
                  className="w-full h-[450px] sm:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#143326]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-serif text-xl font-bold">Sarah Jenkins</p>
                  <p className="text-xs text-white/80">Owner & Lead Grower · Willow Creek Farm (Brenham, TX)</p>
                </div>
              </div>
            </div>

            {/* Quote and Story */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
                Farmer Spotlight
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F4D3A] leading-tight">
                &quot;When people know where their food grows, eating becomes an act of care.&quot;
              </h2>
              <p className="text-base text-[#6B645A] leading-relaxed">
                For ninety-five years, Sarah’s family has worked the sandy loam along the river in Brenham. By selling through Loccalizze, Sarah spends less time driving to distant commercial distributors and more time tending her heirloom tomatoes and mentoring young apprentices.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div>
                  <span className="font-serif text-3xl font-bold text-[#1F4D3A]">95+</span>
                  <p className="text-xs text-[#6B645A]">Years of continuous cultivation</p>
                </div>
                <div className="w-px h-10 bg-[#E7E0D2] hidden sm:block" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#1F4D3A]">0 lbs</span>
                  <p className="text-xs text-[#6B645A]">Synthetic pesticides used</p>
                </div>
                <div className="w-px h-10 bg-[#E7E0D2] hidden sm:block" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#1F4D3A]">4.9 ★</span>
                  <p className="text-xs text-[#6B645A]">Average shopper rating (148 reviews)</p>
                </div>
              </div>
              <div className="pt-2">
                <Link to="/farms/willow-creek-farm">
                  <Button variant="solid" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Visit Sarah&apos;s Farm Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ARE YOU A FARM? CTA BAND */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#143326] via-[#1F4D3A] to-[#143326] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-sm">
            <div className="max-w-2xl space-y-4 text-center lg:text-left">
              <span className="text-xs font-bold text-[#A8D672] uppercase tracking-wider">
                Growers & Ranchers
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Are you a local farm? Sell your harvest directly.
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Set up your online farmstand in less than 5 minutes. Accept pre-orders, manage pickup schedules, and keep 100% of your retail margins.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start text-xs text-white/90">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#6BBF59]" /> No listing fees
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#6BBF59]" /> You control prices & days
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#6BBF59]" /> Live order management
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link to="/join" className="w-full sm:w-auto">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  List Your Farm Free
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Preview Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS CAROUSEL */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#F2A541] uppercase tracking-wider">
          Community Stories
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1 mb-12">
          From the folks who eat and grow
        </h2>

        <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-[#E7E0D2] shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-center text-[#F2A541] gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <blockquote className="font-serif text-xl sm:text-2xl text-[#1E1B16] leading-relaxed max-w-2xl mx-auto">
                &quot;{TESTIMONIALS[testimonialIdx].quote}&quot;
              </blockquote>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#E7E0D2] max-w-xs mx-auto">
                <img
                  src={TESTIMONIALS[testimonialIdx].avatar}
                  alt={TESTIMONIALS[testimonialIdx].name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E7E0D2]"
                />
                <div className="text-left">
                  <h4 className="font-bold text-sm text-[#1F4D3A]">
                    {TESTIMONIALS[testimonialIdx].name}
                  </h4>
                  <p className="text-xs text-[#6B645A]">
                    {TESTIMONIALS[testimonialIdx].role} · {TESTIMONIALS[testimonialIdx].location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() =>
                setTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
              }
              aria-label="Previous testimonial"
              className="p-2.5 rounded-full border border-[#E7E0D2] hover:bg-[#F3EEE3] text-[#1E1B16] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === testimonialIdx ? 'w-6 bg-[#1F4D3A]' : 'w-2 bg-[#E7E0D2]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setTestimonialIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))
              }
              aria-label="Next testimonial"
              className="p-2.5 rounded-full border border-[#E7E0D2] hover:bg-[#F3EEE3] text-[#1E1B16] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
