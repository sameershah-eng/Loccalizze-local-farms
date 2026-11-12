import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Star,
  Clock,
  Truck,
  Heart,
  Share2,
  ShieldCheck,
  Calendar,
  Store,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { useFarm, useProducts, useReviews } from '../hooks/useData';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Stepper } from '../components/ui/Stepper';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';

export const FarmDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: farm, isLoading: isLoadingFarm } = useFarm(slug);
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(farm?.id);
  const { data: reviews = [] } = useReviews(farm?.id);

  const { addToCart, totalItems, subtotal, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews' | 'pickup'>('products');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isFollowing, setIsFollowing] = useState(false);

  const setQty = (prodId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [prodId]: val }));
  };

  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
    showToast({
      title: !isFollowing ? 'Following farm' : 'Unfollowed farm',
      message: !isFollowing
        ? `You will now receive alerts whenever ${farm?.name} updates their seasonal harvest.`
        : `Removed ${farm?.name} from your following list.`,
      type: 'info',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: farm?.name,
        text: farm?.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        title: 'Link copied',
        message: 'Farm profile link copied to clipboard.',
        type: 'success',
      });
    }
  };

  if (isLoadingFarm) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-64 sm:h-96 w-full rounded-3xl" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] pt-32 pb-20 max-w-md mx-auto px-4 text-center">
        <EmptyState
          title="Farm Not Found"
          description="We couldn't locate this farm profile. It may have updated its name or address."
          actionText="Browse all farms"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F1] pt-20 pb-28">
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/farms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B645A] hover:text-[#1F4D3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Farms</span>
        </Link>
      </div>

      {/* Hero Cover Gallery & Farm Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden h-72 sm:h-96 shadow-lg border border-[#E7E0D2]">
          <ImageWithFallback
            src={farm.coverImage}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#143326]/85 via-transparent to-black/20" />

          {/* Top badges & share */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="flex gap-2">
              {farm.openToday ? (
                <span className="bg-[#1F4D3A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md">
                  Open Today for Pickup
                </span>
              ) : (
                <span className="bg-[#143326]/90 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                  Next Pickup: {farm.pickupDays[0]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                aria-label="Share farm"
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-[#1E1B16] shadow-sm transition-transform active:scale-95"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleFollow}
                aria-label="Follow farm"
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-[#1E1B16] shadow-sm transition-transform active:scale-95"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFollowing ? 'fill-[#C2414B] text-[#C2414B]' : 'text-[#6B645A]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Banner Identity overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <img
                src={farm.avatar}
                alt={farm.farmerName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-2 border-white object-cover shadow-xl shrink-0"
              />
              <div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
                  {farm.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {farm.town}, {farm.state}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#F2A541] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {farm.rating} ({farm.reviewCount} reviews)
                  </span>
                </p>
              </div>
            </div>

            <Button
              variant={isFollowing ? 'outline' : 'gradient'}
              size="md"
              onClick={handleToggleFollow}
              className={isFollowing ? 'bg-white/90 text-[#1F4D3A] border-none' : ''}
              leftIcon={<Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />}
            >
              {isFollowing ? 'Following Farm' : 'Follow Farm'}
            </Button>
          </div>
        </div>

        {/* Quick Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#6B645A]">Farmstand Days</p>
              <p className="text-xs font-bold text-[#1E1B16] truncate">
                {farm.pickupDays.join(', ')}
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#6B645A]">Hours</p>
              <p className="text-xs font-bold text-[#1E1B16] truncate">
                {farm.pickupHours}
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#6B645A]">Doorstep Delivery</p>
              <p className="text-xs font-bold text-[#1E1B16] truncate">
                {farm.deliveryAvailable ? `Within ${farm.deliveryRadiusMiles} mi` : 'Pickup only'}
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#6B645A]">Practices</p>
              <p className="text-xs font-bold text-[#1E1B16] truncate">
                {farm.certifications.slice(0, 2).join(' · ')}
              </p>
            </div>
          </div>
        </div>

        {/* Animated Tabs Navigation */}
        <div className="border-b border-[#E7E0D2] flex gap-2 my-6">
          {[
            { id: 'products', label: `Harvest Store (${products.length})` },
            { id: 'about', label: 'Story & Soil' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'pickup', label: 'Pickup & Directions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative pb-3 px-4 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab.id ? 'text-[#1F4D3A]' : 'text-[#6B645A] hover:text-[#1E1B16]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="farmDetailTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F4D3A]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                  Fresh Available Harvest
                </h3>
                <p className="text-xs text-[#6B645A]">
                  Reserved online, picked fresh before your arrival.
                </p>
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-4 border border-[#E7E0D2] space-y-3">
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No current listings"
                description="This farm is preparing its next weekly harvest schedule."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const qty = quantities[prod.id] || 1;
                  return (
                    <Card
                      key={prod.id}
                      className="bg-white p-4 flex flex-col justify-between group"
                    >
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
                        <ImageWithFallback
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {prod.badge && (
                          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md text-[#1F4D3A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                            {prod.badge}
                          </span>
                        )}
                        {prod.stockCount <= 8 && (
                          <span className="absolute bottom-2.5 left-2.5 bg-[#C2414B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Only {prod.stockCount} left
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#6B645A] mb-1">
                            <span>{prod.category}</span>
                            <span className="text-[#6BBF59] font-semibold">{prod.harvestDate}</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#1E1B16] group-hover:text-[#1F4D3A]">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-[#6B645A] mt-1 line-clamp-2">
                            {prod.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#E7E0D2] flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-serif text-xl font-bold text-[#1F4D3A]">
                                ${prod.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-[#6B645A] ml-1">/ {prod.unit}</span>
                            </div>

                            <Stepper
                              size="sm"
                              value={qty}
                              onChange={(val) => setQty(prod.id, val)}
                              max={prod.stockCount}
                            />
                          </div>

                          <Button
                            variant="gradient"
                            size="md"
                            className="w-full"
                            onClick={() => handleAddToCart(prod)}
                            leftIcon={<ShoppingBag className="w-4 h-4" />}
                          >
                            Add {qty} to Cart · ${(prod.price * qty).toFixed(2)}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: About Story & Soil */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E0D2] space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                  Our Story & Growing Philosophy
                </h3>
                <p className="text-sm text-[#1E1B16] leading-relaxed">
                  {farm.story}
                </p>
                <div className="pt-4 border-t border-[#E7E0D2] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#6B645A]">Established</span>
                    <p className="font-bold text-[#1E1B16] text-sm">{farm.establishedYear}</p>
                  </div>
                  <div>
                    <span className="text-[#6B645A]">Lead Grower</span>
                    <p className="font-bold text-[#1E1B16] text-sm">{farm.farmerName}</p>
                  </div>
                  <div>
                    <span className="text-[#6B645A]">Farming Model</span>
                    <p className="font-bold text-[#1E1B16] text-sm">{farm.farmType}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E0D2] space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#1F4D3A]">
                  Certifications & Soil Commitments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {farm.certifications.map((c) => (
                    <div
                      key={c}
                      className="p-3 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2] flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#6BBF59] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[#1F4D3A]">{c}</p>
                        <p className="text-[11px] text-[#6B645A]">Inspected & third-party verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Farmer Sidebar Card */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#E7E0D2] text-center space-y-4">
                <img
                  src={farm.avatar}
                  alt={farm.farmerName}
                  className="w-24 h-24 rounded-3xl object-cover mx-auto shadow-md border-2 border-[#1F4D3A]"
                />
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#1F4D3A]">
                    {farm.farmerName}
                  </h4>
                  <p className="text-xs text-[#6B645A]">{farm.farmerTitle}</p>
                </div>
                <p className="text-xs text-[#6B645A] leading-relaxed italic">
                  &quot;Thank you for supporting small family agriculture. When you buy our food, you keep our soil healthy for the next generation.&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                  Community Reviews
                </h3>
                <p className="text-xs text-[#6B645A]">
                  Verified shoppers who pick up harvest at this farm.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#E7E0D2]">
                <Star className="w-5 h-5 fill-[#F2A541] text-[#F2A541]" />
                <span className="font-serif text-xl font-bold text-[#1F4D3A]">
                  {farm.rating}
                </span>
                <span className="text-xs text-[#6B645A]">/ 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-3xl border border-[#E7E0D2] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#1E1B16]">{rev.author}</p>
                        <p className="text-xs text-[#6B645A]">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex text-[#F2A541]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1E1B16] leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                  {rev.verifiedShopper && (
                    <Badge variant="leaf" size="sm">
                      Verified Shopper
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Pickup & Directions */}
        {activeTab === 'pickup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E0D2] space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                Farmstand Pickup Instructions
              </h3>
              <p className="text-sm text-[#1E1B16] leading-relaxed">
                When you arrive at {farm.address}, pull into the gravel driveway marked with the wooden Loccalizze sign. Your reserved harvest crate will be chilled in the front barn with your name tag attached.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2]">
                  <span className="font-bold text-[#1F4D3A]">Pickup Address:</span>
                  <p className="text-[#1E1B16] mt-0.5">{farm.address}, {farm.town}, {farm.state} {farm.zip}</p>
                </div>
                <div className="p-3 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2]">
                  <span className="font-bold text-[#1F4D3A]">Hours & Days:</span>
                  <p className="text-[#1E1B16] mt-0.5">{farm.pickupDays.join(', ')} · {farm.pickupHours}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E0D2] space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                Local Doorstep Delivery
              </h3>
              <p className="text-sm text-[#1E1B16] leading-relaxed">
                {farm.deliveryAvailable
                  ? `This farm delivers directly to homes within a ${farm.deliveryRadiusMiles} mile radius of ${farm.town}. Delivery fee is $${farm.deliveryFee.toFixed(2)} (or free on orders over $${farm.minOrder * 2}).`
                  : 'This farm currently offers barnstand pickup only to ensure produce is transferred straight from the ground to your basket.'}
              </p>
              <div className="p-4 bg-[#F3EEE3] rounded-2xl border border-[#E7E0D2] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#1F4D3A] shrink-0" />
                <span className="text-xs font-semibold text-[#1F4D3A]">
                  Fresh deliveries packed in insulated reusable crates
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky "View Cart" Bar on Mobile when items exist */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-[#E7E0D2] z-30 sm:hidden shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#6B645A]">
                  {totalItems} item{totalItems > 1 ? 's' : ''} in cart
                </p>
                <p className="font-serif text-lg font-bold text-[#1F4D3A]">
                  ${subtotal.toFixed(2)}
                </p>
              </div>
              <Button
                variant="gradient"
                size="md"
                className="flex-1"
                onClick={() => setIsCartOpen(true)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                View Cart & Checkout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
