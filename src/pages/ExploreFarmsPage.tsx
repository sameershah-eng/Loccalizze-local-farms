import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Heart,
  Grid,
  List,
  Store,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useFarms } from '../hooks/useData';
import { Farm, Certification, FilterOptions } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { useToast } from '../context/ToastContext';

const ALL_CERTIFICATIONS: Certification[] = [
  'Organic',
  'Pasture-raised',
  'Non-GMO',
  'Regenerative',
  'Heirloom',
];

const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruit',
  'Eggs & Dairy',
  'Meat',
  'Honey',
  'Bakery',
  'Flowers',
];

export const ExploreFarmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState(urlQuery);
  const [category, setCategory] = useState(urlCategory);
  const [maxDistance, setMaxDistance] = useState(40);
  const [selectedCerts, setSelectedCerts] = useState<Certification[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'rating' | 'newest'>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [hoveredFarmId, setHoveredFarmId] = useState<string | null>(null);

  const [savedFarms, setSavedFarms] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('loccalizze_saved_farms');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Keep query params synced
  useEffect(() => {
    if (urlQuery !== search) setSearch(urlQuery);
    if (urlCategory !== category) setCategory(urlCategory);
  }, [urlQuery, urlCategory]);

  const filterOptions: FilterOptions = useMemo(
    () => ({
      search,
      category,
      maxDistance,
      certifications: selectedCerts,
      openOnly,
      sortBy,
    }),
    [search, category, maxDistance, selectedCerts, openOnly, sortBy]
  );

  const { data: farms = [], isLoading, isError, refetch } = useFarms(filterOptions);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setMaxDistance(40);
    setSelectedCerts([]);
    setOpenOnly(false);
    setSortBy('nearest');
    setSearchParams({});
  };

  const toggleCert = (cert: Certification) => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const toggleSave = (farmId: string, farmName: string, e: React.MouseEvent) => {
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
      message: `${farmName} ${isNowSaved ? 'saved.' : 'removed.'}`,
      type: 'info',
    });
  };

  const activeFilterCount =
    (category !== 'All' ? 1 : 0) +
    (selectedCerts.length > 0 ? selectedCerts.length : 0) +
    (openOnly ? 1 : 0) +
    (maxDistance < 40 ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FBF8F1] pt-24 pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E7E0D2]">
          <div>
            <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
              Local Directory
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1">
              Explore Family Farms
            </h1>
            <p className="text-sm text-[#6B645A] mt-1">
              Direct farmstand pickups, CSA shares, and transparent regenerative agriculture.
            </p>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-[#6B645A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farm or town..."
                className="w-full bg-white border border-[#E7E0D2] rounded-2xl pl-10 pr-4 py-2 text-sm text-[#1E1B16] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A]/20 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B645A] hover:text-[#1E1B16]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-[#E7E0D2] px-3.5 py-2 rounded-2xl text-xs font-bold text-[#1E1B16] hover:bg-[#F3EEE3]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#1F4D3A]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1F4D3A] text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle (Grid/List) */}
            <div className="hidden sm:flex items-center p-1 bg-[#F3EEE3] rounded-2xl border border-[#E7E0D2]">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1F4D3A] shadow-xs'
                    : 'text-[#6B645A] hover:text-[#1E1B16]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#1F4D3A] shadow-xs'
                    : 'text-[#6B645A] hover:text-[#1E1B16]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Sticky Filter Bar */}
        <div className="hidden lg:flex items-center justify-between gap-4 py-4 border-b border-[#E7E0D2] text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#1F4D3A] text-white shadow-xs'
                    : 'bg-white text-[#6B645A] hover:text-[#1E1B16] border border-[#E7E0D2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Open Today Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E1B16]">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="rounded text-[#1F4D3A] focus:ring-[#1F4D3A]"
              />
              <span>Open today only</span>
            </label>

            {/* Distance Slider */}
            <div className="flex items-center gap-2 font-semibold text-[#6B645A]">
              <span>Within</span>
              <span className="font-bold text-[#1F4D3A]">{maxDistance} mi</span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-24 accent-[#1F4D3A]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-[#6B645A]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E7E0D2] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#1E1B16] focus:outline-none"
              >
                <option value="nearest">Nearest</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <span className="text-xs text-[#6B645A]">Active filters:</span>
            {category !== 'All' && (
              <Badge variant="leaf" size="sm">
                Category: {category}
                <button onClick={() => setCategory('All')} className="ml-1 hover:text-[#1F4D3A]">
                  ×
                </button>
              </Badge>
            )}
            {openOnly && (
              <Badge variant="neutral" size="sm">
                Open today only
                <button onClick={() => setOpenOnly(false)} className="ml-1 hover:text-[#1F4D3A]">
                  ×
                </button>
              </Badge>
            )}
            {selectedCerts.map((c) => (
              <Badge key={c} variant="neutral" size="sm">
                {c}
                <button onClick={() => toggleCert(c)} className="ml-1 hover:text-[#1F4D3A]">
                  ×
                </button>
              </Badge>
            ))}
            {search && (
              <Badge variant="neutral" size="sm">
                Search: {search}
                <button onClick={() => setSearch('')} className="ml-1 hover:text-[#1F4D3A]">
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#C2414B] font-semibold hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area (Split Grid on Desktop: Farms + Stylized SVG Map) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Farms List / Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between text-xs text-[#6B645A]">
              <span>
                Showing <strong className="text-[#1E1B16]">{farms.length}</strong> local farms
              </span>
            </div>

            {/* States */}
            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                    : 'space-y-4'
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-4 border border-[#E7E0D2] space-y-3">
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                title="Could not load farms"
                message="We encountered an issue fetching farm listings. If you tested with ?simulateError=1, try clearing the query param."
                onRetry={() => refetch()}
              />
            ) : farms.length === 0 ? (
              <EmptyState
                title="No farms match your filters"
                description="Try loosening your distance radius, unchecking certifications, or searching for a broader town."
                actionText="Reset all filters"
                onAction={handleClearFilters}
              />
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                    : 'space-y-4'
                }
              >
                {farms.map((farm) => {
                  const isSaved = savedFarms.includes(farm.id);
                  const isHovered = hoveredFarmId === farm.id;

                  if (viewMode === 'list') {
                    return (
                      <Card
                        key={farm.id}
                        isHoverable
                        onMouseEnter={() => setHoveredFarmId(farm.id)}
                        onMouseLeave={() => setHoveredFarmId(null)}
                        onClick={() => navigate(`/farms/${farm.slug}`)}
                        className={`p-4 flex flex-col sm:flex-row gap-4 cursor-pointer transition-all ${
                          isHovered ? 'ring-2 ring-[#1F4D3A]' : ''
                        }`}
                      >
                        <div className="relative w-full sm:w-48 h-40 rounded-2xl overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={farm.coverImage}
                            alt={farm.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={(e) => toggleSave(farm.id, farm.name, e)}
                            aria-label={isSaved ? `Unsave ${farm.name}` : `Save ${farm.name}`}
                            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-md"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isSaved ? 'fill-[#C2414B] text-[#C2414B]' : 'text-[#6B645A]'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#6B645A] mb-1">
                              <span className="flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#1F4D3A]" />
                                {farm.town}, {farm.state} · {farm.distanceMiles} mi
                              </span>
                              <span className="flex items-center gap-1 text-[#F2A541] font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {farm.rating} ({farm.reviewCount})
                              </span>
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#1F4D3A]">
                              {farm.name}
                            </h3>
                            <p className="text-xs text-[#6B645A] mt-1 line-clamp-2">
                              {farm.tagline}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {farm.certifications.slice(0, 3).map((c) => (
                                <Badge key={c} variant="leaf" size="sm">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="pt-3 mt-3 border-t border-[#E7E0D2] flex justify-between items-center text-xs">
                            <span className="text-[#6BBF59] font-bold">
                              {farm.openToday ? 'Open today for pickup' : `Pickup: ${farm.pickupDays.join(', ')}`}
                            </span>
                            <span className="font-bold text-[#1F4D3A] flex items-center gap-1">
                              Explore Harvest <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  }

                  return (
                    <Card
                      key={farm.id}
                      isHoverable
                      onMouseEnter={() => setHoveredFarmId(farm.id)}
                      onMouseLeave={() => setHoveredFarmId(null)}
                      onClick={() => navigate(`/farms/${farm.slug}`)}
                      className={`group flex flex-col justify-between cursor-pointer transition-all ${
                        isHovered ? 'ring-2 ring-[#1F4D3A]' : ''
                      }`}
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <ImageWithFallback
                          src={farm.coverImage}
                          alt={farm.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          {farm.openToday ? (
                            <span className="bg-white/95 backdrop-blur-md text-[#1F4D3A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                              Open today
                            </span>
                          ) : (
                            <span className="bg-[#143326]/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md">
                              Next: {farm.pickupDays[0]}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => toggleSave(farm.id, farm.name, e)}
                          aria-label={isSaved ? `Unsave ${farm.name}` : `Save ${farm.name}`}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-[#1E1B16] transition-transform active:scale-90 shadow-sm"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-[#C2414B] text-[#C2414B]' : 'text-[#6B645A]'
                            }`}
                          />
                        </button>

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

                          <div className="flex flex-wrap gap-1 mt-3">
                            {farm.certifications.slice(0, 2).map((c) => (
                              <Badge key={c} variant="leaf" size="sm">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#E7E0D2] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-[#F2A541] font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{farm.rating}</span>
                            <span className="text-[#6B645A] font-normal">({farm.reviewCount})</span>
                          </div>

                          <span className="font-semibold text-[#1F4D3A] flex items-center gap-1">
                            View Harvest
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stylized SVG Map Placeholder on Desktop (4 cols) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-5 border border-[#E7E0D2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#1F4D3A]">
                    Regional Farm Map
                  </h4>
                  <p className="text-xs text-[#6B645A]">
                    Texas Hill Country & Brazos Valley
                  </p>
                </div>
                <Badge variant="leaf" size="sm">
                  {farms.length} Pins
                </Badge>
              </div>

              {/* Stylized Vector Map representation */}
              <div className="relative w-full h-[480px] bg-[#F3EEE3] rounded-2xl overflow-hidden border border-[#E7E0D2] p-4 flex flex-col justify-between">
                {/* Decorative topographic lines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
                  viewBox="0 0 300 400"
                  fill="none"
                >
                  <path
                    d="M-50,100 Q80,180 200,90 T400,220"
                    stroke="#1F4D3A"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M-30,250 Q100,320 250,220 T400,380"
                    stroke="#1F4D3A"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M50,40 Q180,80 320,30"
                    stroke="#6BBF59"
                    strokeWidth="1.5"
                  />
                  {/* Stylized river */}
                  <path
                    d="M120,-10 C140,90 100,160 160,260 C200,320 180,420 190,450"
                    stroke="#A8D672"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Farm Pins */}
                <div className="relative w-full h-full">
                  {farms.map((farm, idx) => {
                    // Position based on lat/lng relative offset
                    const topPercent = Math.min(
                      85,
                      Math.max(15, 50 - (farm.lat - 30.2) * 50)
                    );
                    const leftPercent = Math.min(
                      85,
                      Math.max(15, 50 + (farm.lng - -97.5) * 45)
                    );

                    const isHighlighted = hoveredFarmId === farm.id;

                    return (
                      <button
                        key={farm.id}
                        onClick={() => navigate(`/farms/${farm.slug}`)}
                        onMouseEnter={() => setHoveredFarmId(farm.id)}
                        onMouseLeave={() => setHoveredFarmId(null)}
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 group cursor-pointer`}
                      >
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md text-xs font-bold transition-all ${
                            isHighlighted
                              ? 'bg-[#F2A541] text-white scale-125 z-20 shadow-lg'
                              : 'bg-[#1F4D3A] text-white hover:bg-[#143326]'
                          }`}
                        >
                          <Store className="w-3 h-3" />
                          <span className="hidden group-hover:inline max-w-[120px] truncate">
                            {farm.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="relative z-10 bg-white/90 backdrop-blur-md p-2 rounded-xl text-[11px] text-[#6B645A] border border-[#E7E0D2] flex items-center justify-between">
                  <span>Hover a pin to preview farm</span>
                  <span className="font-semibold text-[#1F4D3A]">Real farm gate coordinates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Modal
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        title="Filter Local Farms"
      >
        <div className="space-y-6 pt-2">
          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-[#1E1B16] uppercase tracking-wider block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    category === cat
                      ? 'bg-[#1F4D3A] text-white'
                      : 'bg-white border border-[#E7E0D2] text-[#6B645A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1B16] mb-2">
              <span>Maximum Distance</span>
              <span className="text-[#1F4D3A]">{maxDistance} miles</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-[#1F4D3A]"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="text-xs font-bold text-[#1E1B16] uppercase tracking-wider block mb-2">
              Growing Certifications
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CERTIFICATIONS.map((cert) => {
                const checked = selectedCerts.includes(cert);
                return (
                  <button
                    key={cert}
                    onClick={() => toggleCert(cert)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      checked
                        ? 'bg-[#6BBF59] text-white'
                        : 'bg-white border border-[#E7E0D2] text-[#6B645A]'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                    <span>{cert}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open today */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E7E0D2] cursor-pointer">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="w-4 h-4 text-[#1F4D3A] rounded"
              />
              <span className="text-sm font-bold text-[#1E1B16]">
                Only show farms open today
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#E7E0D2] flex gap-3">
            <Button
              variant="outline"
              className="w-1/3"
              onClick={handleClearFilters}
            >
              Reset
            </Button>
            <Button
              variant="gradient"
              className="w-2/3"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Apply ({farms.length} farms)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
