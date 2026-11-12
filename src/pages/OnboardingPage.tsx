import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  Truck,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  Store,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useCreateFarm } from '../hooks/useData';
import { FarmCategory, Certification } from '../types';

const ONBOARDING_STORAGE_KEY = 'loccalizze_farm_onboarding_draft_v2';

const FARM_TYPES = [
  'Vegetables & Herbs',
  'Fruit & Orchards',
  'Dairy & Poultry',
  'Apiary & Honey',
  'Bakery & Grains',
  'Flower Farm',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ALL_CERTS: Certification[] = [
  'Organic',
  'Pasture-raised',
  'Non-GMO',
  'Regenerative',
  'Heirloom',
];

const SAMPLE_COVERS = [
  '/src/assets/images/hero_farm_landscape_1794498933164.jpg',
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=1200&q=80',
  '/src/assets/images/farm_apiary_honey_1794498934885.jpg',
];

// Step Schemas
const step1Schema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number (min 10 digits)'),
});

const step2Schema = z.object({
  farmName: z.string().min(3, 'Farm name must be at least 3 characters'),
  story: z
    .string()
    .min(20, 'Please write at least a couple sentences about your farm (min 20 characters)')
    .max(500, 'Keep story under 500 characters'),
  farmType: z.string().min(1, 'Please select your primary farm type'),
  establishedYear: z
    .number()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
});

const step3Schema = z.object({
  address: z.string().min(5, 'Please enter your street address or farm road'),
  town: z.string().min(2, 'Please enter your town or city'),
  state: z.string().min(2, 'State (e.g. TX)'),
  zip: z.string().min(5, 'Please enter a 5-digit ZIP code'),
  pickupDays: z.array(z.string()).min(1, 'Select at least one pickup day'),
  pickupHours: z.string().min(3, 'e.g. 8:00 AM – 1:00 PM'),
  deliveryRadiusMiles: z.number().min(0).max(100),
  deliveryAvailable: z.boolean(),
});

const step4Schema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(2, 'Product name required'),
        category: z.string(),
        price: z.number().min(0.5, 'Min price is $0.50'),
        unit: z.string().min(1, 'Unit required (e.g. lb, dozen)'),
        stockCount: z.number().min(1, 'Stock must be at least 1'),
      })
    )
    .min(1, 'Please add at least one product to your initial harvest list'),
});

const step5Schema = z.object({
  coverImage: z.string().min(1, 'Please select a cover image'),
  certifications: z.array(z.string()),
});

const fullOnboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

type FormData = z.infer<typeof fullOnboardingSchema>;

const DEFAULT_FORM_VALUES: FormData = {
  fullName: 'Sarah Jenkins',
  email: 'sarah@willowcreekfarm.com',
  password: 'Password123!',
  phone: '(512) 844-9102',
  farmName: 'Willow Creek Farm',
  story: 'Farming along the sandy loam river bottom of Brenham since 1928. We practice regenerative cover cropping, zero synthetic pesticides, and pick every morning before the sun climbs over the oak canopy.',
  farmType: 'Vegetables & Herbs',
  establishedYear: 1928,
  address: '4120 Old Chappell Hill Rd',
  town: 'Brenham',
  state: 'TX',
  zip: '77833',
  pickupDays: ['Tue', 'Thu', 'Sat'],
  pickupHours: '8:00 AM – 1:00 PM',
  deliveryRadiusMiles: 15,
  deliveryAvailable: true,
  products: [
    {
      name: 'Heirloom Rainbow Tomatoes',
      category: 'Vegetables',
      price: 5.5,
      unit: 'lb',
      stockCount: 25,
    },
    {
      name: 'Pasture-Raised Brown Eggs',
      category: 'Eggs & Dairy',
      price: 6.5,
      unit: 'dozen',
      stockCount: 15,
    },
  ],
  coverImage: SAMPLE_COVERS[0],
  certifications: ['Organic', 'Regenerative', 'Heirloom'],
};

function getInitialOnboardingValues(): FormData {
  try {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_FORM_VALUES;
  } catch {
    return DEFAULT_FORM_VALUES;
  }
}

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const createFarmMutation = useCreateFarm();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdFarmSlug, setCreatedFarmSlug] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullOnboardingSchema),
    defaultValues: getInitialOnboardingValues(),
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  // Watch form fields for live preview and draft auto-save
  const watchedValues = watch();

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(watchedValues));
      setIsDraftSaved(true);
      const timer = setTimeout(() => setIsDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    } catch {}
  }, [watchedValues]);

  // Password strength calculator
  const password = watch('password') || '';
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  })();

  const getStrengthLabel = (score: number) => {
    if (score < 50) return { label: 'Weak', color: 'bg-[#C2414B]' };
    if (score < 75) return { label: 'Moderate', color: 'bg-[#F2A541]' };
    return { label: 'Strong', color: 'bg-[#6BBF59]' };
  };

  const stepsList = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Farm Story' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Harvest' },
    { num: 5, label: 'Photos' },
    { num: 6, label: 'Review' },
  ];

  // Validate only the current step before advancing
  const handleNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger(['fullName', 'email', 'password', 'phone']);
    } else if (currentStep === 2) {
      isValid = await trigger(['farmName', 'story', 'farmType', 'establishedYear']);
    } else if (currentStep === 3) {
      isValid = await trigger(['address', 'town', 'state', 'zip', 'pickupDays', 'pickupHours']);
    } else if (currentStep === 4) {
      isValid = await trigger('products');
    } else if (currentStep === 5) {
      isValid = await trigger(['coverImage', 'certifications']);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      setShakeKey((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const onFinalSubmit = async (data: FormData) => {
    const slug = data.farmName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newFarm = {
      slug,
      name: data.farmName,
      tagline: `${data.farmType} grown with pride in ${data.town}, ${data.state}`,
      story: data.story,
      coverImage: data.coverImage,
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      farmerName: data.fullName,
      farmerTitle: 'Owner & Grower',
      town: data.town,
      state: data.state,
      zip: data.zip,
      address: data.address,
      distanceMiles: 4.2,
      rating: 5.0,
      reviewCount: 1,
      certifications: data.certifications as Certification[],
      farmType: data.farmType,
      openToday: true,
      pickupDays: data.pickupDays,
      pickupHours: data.pickupHours,
      deliveryRadiusMiles: data.deliveryRadiusMiles,
      deliveryAvailable: data.deliveryAvailable,
      deliveryFee: 4.5,
      minOrder: 15.0,
      establishedYear: Number(data.establishedYear),
      featured: true,
      lat: 30.2,
      lng: -97.4,
    };

    try {
      await createFarmMutation.mutateAsync(newFarm);
      setCreatedFarmSlug(slug);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1F4D3A', '#6BBF59', '#F2A541', '#A8D672'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  // If successfully submitted, show celebration screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] pt-32 pb-24 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 border border-[#E7E0D2] shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#6BBF59]/20 text-[#1F4D3A] flex items-center justify-center mx-auto border border-[#6BBF59]/30">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
              Congratulations!
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A] mt-1">
              {watchedValues.farmName} is live!
            </h1>
            <p className="text-sm text-[#6B645A] mt-2 max-w-md mx-auto leading-relaxed">
              Your farm profile and fresh harvest listings are now live for neighboring shoppers in {watchedValues.town}.
            </p>
          </div>

          <div className="bg-[#FBF8F1] p-5 rounded-2xl border border-[#E7E0D2] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6B645A]">Farmstand Days</span>
              <span className="font-bold text-[#1E1B16]">{watchedValues.pickupDays?.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B645A]">Initial Produce Items</span>
              <span className="font-bold text-[#1F4D3A]">{watchedValues.products?.length} items listed</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Your Farm Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate(`/farms/${createdFarmSlug}`)}
            >
              View Public Listing
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F1] pt-24 pb-24">
      {/* Top Banner / Progress Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E0D2] gap-4">
          <div>
            <span className="text-xs font-bold text-[#F2A541] uppercase tracking-wider">
              Grower Onboarding · Step {currentStep} of 6
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#1F4D3A] mt-0.5">
              List Your Farm on Loccalizze
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Draft Saved Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-[#6B645A]">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isDraftSaved ? 'bg-[#6BBF59]' : 'bg-[#D4CABC]'
                }`}
              />
              <span>{isDraftSaved ? 'Draft saved' : 'Auto-saving draft'}</span>
            </div>

            {/* Mobile Toggle Preview Button */}
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="lg:hidden px-3 py-1.5 rounded-xl border border-[#E7E0D2] bg-white text-xs font-bold text-[#1F4D3A] hover:bg-[#F3EEE3]"
            >
              {showMobilePreview ? 'Back to Form' : 'Preview Listing'}
            </button>
          </div>
        </div>

        {/* Animated Connected Steps Bar */}
        <div className="mt-6">
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#E7E0D2] -z-0" />
            {/* Filled line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1F4D3A] transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            />

            {stepsList.map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      isPast
                        ? 'bg-[#1F4D3A] text-white'
                        : isCurrent
                        ? 'bg-[#F2A541] text-white ring-4 ring-[#F2A541]/20'
                        : 'bg-white text-[#6B645A] border border-[#E7E0D2]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                  </button>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-[#1F4D3A] font-bold' : 'text-[#6B645A]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Form (7 cols), Right Live Preview (5 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className={`lg:col-span-7 ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>
            <motion.div
              key={shakeKey}
              animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-[#E7E0D2] shadow-sm"
            >
              <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
                {/* STEP 1: ACCOUNT */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4">
                      <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                        Step 1: Your Grower Account
                      </h2>
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        Create your login credentials for managing pre-orders and payouts.
                      </p>
                    </div>

                    <Input
                      label="Your Full Name"
                      {...register('fullName')}
                      error={errors.fullName?.message}
                      placeholder="Sarah Jenkins"
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                      placeholder="sarah@willowcreekfarm.com"
                      required
                    />

                    {/* Password with Strength Meter */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Input
                          label="Account Password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          error={errors.password?.message}
                          placeholder="Create a strong password"
                          required
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-[#6B645A] hover:text-[#1E1B16]"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </div>
                      {password && (
                        <div className="space-y-1 pt-1">
                          <div className="h-1.5 w-full bg-[#E7E0D2] rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getStrengthLabel(passwordStrength).color}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                          <p className="text-[11px] font-semibold text-[#6B645A] flex justify-between">
                            <span>Password Strength</span>
                            <span className="font-bold">{getStrengthLabel(passwordStrength).label}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <Input
                      label="Mobile Phone"
                      type="tel"
                      {...register('phone')}
                      error={errors.phone?.message}
                      placeholder="(512) 844-9102"
                      hint="Shoppers can text this for day-of pickup questions"
                      required
                    />
                  </motion.div>
                )}

                {/* STEP 2: FARM DETAILS */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4">
                      <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                        Step 2: Tell Shoppers About Your Farm
                      </h2>
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        Introduce your heritage, soil ethos, and what makes your produce exceptional.
                      </p>
                    </div>

                    <Input
                      label="Farm / Ranch Name"
                      {...register('farmName')}
                      error={errors.farmName?.message}
                      placeholder="e.g. Willow Creek Farm"
                      required
                    />

                    {/* Story with Character Counter */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-[#1E1B16]">
                          Your Farm Story & Soil Philosophy <span className="text-[#C2414B]">*</span>
                        </label>
                        <span
                          className={`text-[11px] ${
                            (watchedValues.story?.length || 0) > 480 ? 'text-[#C2414B] font-bold' : 'text-[#6B645A]'
                          }`}
                        >
                          {watchedValues.story?.length || 0} / 500
                        </span>
                      </div>
                      <textarea
                        {...register('story')}
                        rows={4}
                        placeholder="Tell the community how long you've been farming, what you grow, and your commitment to clean regenerative practices..."
                        className="w-full bg-white border border-[#E7E0D2] rounded-2xl p-3 text-sm text-[#1E1B16] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A]/20 outline-none resize-none"
                      />
                      {errors.story && (
                        <p className="text-xs font-medium text-[#C2414B]">{errors.story.message}</p>
                      )}
                    </div>

                    {/* Selectable Farm Types */}
                    <div>
                      <label className="text-xs font-bold text-[#1E1B16] block mb-2">
                        Primary Farming Model <span className="text-[#C2414B]">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {FARM_TYPES.map((type) => {
                          const isSelected = watchedValues.farmType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setValue('farmType', type)}
                              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#1F4D3A] text-white border-[#1F4D3A] shadow-sm'
                                  : 'bg-white text-[#1E1B16] border-[#E7E0D2] hover:bg-[#F3EEE3]'
                              }`}
                            >
                              <Sprout className="w-4 h-4 mb-1 text-current" />
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Input
                      label="Year Established"
                      type="number"
                      {...register('establishedYear', { valueAsNumber: true })}
                      error={errors.establishedYear?.message}
                      placeholder="1928"
                      required
                    />
                  </motion.div>
                )}

                {/* STEP 3: LOCATION & PICKUP */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4">
                      <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                        Step 3: Location & Pickup Schedule
                      </h2>
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        Where and when shoppers can pick up their orders.
                      </p>
                    </div>

                    <Input
                      label="Street Address / Farm Gate"
                      {...register('address')}
                      error={errors.address?.message}
                      placeholder="4120 Old Chappell Hill Rd"
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Town / City"
                        {...register('town')}
                        error={errors.town?.message}
                        placeholder="Brenham"
                        required
                      />
                      <Input
                        label="State"
                        {...register('state')}
                        error={errors.state?.message}
                        placeholder="TX"
                        required
                      />
                      <Input
                        label="ZIP Code"
                        {...register('zip')}
                        error={errors.zip?.message}
                        placeholder="77833"
                        required
                      />
                    </div>

                    {/* Pickup Days Chips */}
                    <div>
                      <label className="text-xs font-bold text-[#1E1B16] block mb-2">
                        Weekly Farmstand Open Days <span className="text-[#C2414B]">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const currentDays = watchedValues.pickupDays || [];
                          const isSelected = currentDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? currentDays.filter((d) => d !== day)
                                  : [...currentDays, day];
                                setValue('pickupDays', next);
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#1F4D3A] text-white shadow-xs'
                                  : 'bg-white border border-[#E7E0D2] text-[#6B645A] hover:bg-[#F3EEE3]'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {errors.pickupDays && (
                        <p className="text-xs font-medium text-[#C2414B] mt-1">
                          {errors.pickupDays.message}
                        </p>
                      )}
                    </div>

                    <Input
                      label="Pickup Hours"
                      {...register('pickupHours')}
                      error={errors.pickupHours?.message}
                      placeholder="8:00 AM – 1:00 PM"
                      required
                    />

                    {/* Delivery Radius */}
                    <div className="pt-2 border-t border-[#E7E0D2] space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-[#1E1B16]">
                        <span>Delivery Radius (Optional)</span>
                        <span className="text-[#1F4D3A]">{watchedValues.deliveryRadiusMiles} miles</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        {...register('deliveryRadiusMiles', { valueAsNumber: true })}
                        className="w-full accent-[#1F4D3A]"
                      />
                      <p className="text-xs text-[#6B645A]">
                        Set to 0 if you only offer farmstand pickup.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: PRODUCTS */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4 flex justify-between items-end">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                          Step 4: Initial Harvest Offerings
                        </h2>
                        <p className="text-xs text-[#6B645A] mt-0.5">
                          List 1 or more items available for reservation right now.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        onClick={() =>
                          append({
                            name: '',
                            category: 'Vegetables',
                            price: 5.0,
                            unit: 'lb',
                            stockCount: 10,
                          })
                        }
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="bg-[#FBF8F1] p-4 rounded-2xl border border-[#E7E0D2] space-y-3 relative"
                        >
                          <div className="flex justify-between items-center text-xs font-bold text-[#1F4D3A]">
                            <span>Produce Item #{index + 1}</span>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-[#C2414B] hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Product Name"
                              {...register(`products.${index}.name` as const)}
                              placeholder="e.g. Heirloom Carrots"
                              required
                            />
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-xs font-bold text-[#1E1B16]">Category</label>
                              <select
                                {...register(`products.${index}.category` as const)}
                                className="bg-white border border-[#E7E0D2] rounded-2xl px-3 py-2 text-sm text-[#1E1B16] outline-none min-h-[44px]"
                              >
                                {['Vegetables', 'Fruit', 'Eggs & Dairy', 'Meat', 'Honey', 'Bakery', 'Flowers'].map(
                                  (cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              label="Price ($)"
                              type="number"
                              step="0.25"
                              {...register(`products.${index}.price` as const, { valueAsNumber: true })}
                              placeholder="5.00"
                              required
                            />
                            <Input
                              label="Unit"
                              {...register(`products.${index}.unit` as const)}
                              placeholder="lb, bunch, dozen"
                              required
                            />
                            <Input
                              label="Available Qty"
                              type="number"
                              {...register(`products.${index}.stockCount` as const, { valueAsNumber: true })}
                              placeholder="20"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: PHOTOS & BRANDING */}
                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4">
                      <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                        Step 5: Photos & Growing Certifications
                      </h2>
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        Choose your banner hero image and select third-party badges.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1E1B16] block mb-2">
                        Select Farm Cover Photo
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {SAMPLE_COVERS.map((cover, idx) => (
                          <div
                            key={idx}
                            onClick={() => setValue('coverImage', cover)}
                            className={`relative h-28 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                              watchedValues.coverImage === cover
                                ? 'border-[#1F4D3A] ring-2 ring-[#1F4D3A]/20 scale-[1.02]'
                                : 'border-[#E7E0D2] opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img src={cover} alt="Farm cover option" className="w-full h-full object-cover" />
                            {watchedValues.coverImage === cover && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mock Drag & Drop Box */}
                    <div className="border-2 border-dashed border-[#D4CABC] rounded-2xl p-6 text-center hover:bg-[#F3EEE3]/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-[#1F4D3A] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#1E1B16]">
                        Or drop your own farm photos here
                      </p>
                      <p className="text-[11px] text-[#6B645A] mt-0.5">
                        PNG, JPG or WebP up to 10MB
                      </p>
                    </div>

                    {/* Certifications Checkboxes */}
                    <div>
                      <label className="text-xs font-bold text-[#1E1B16] block mb-2">
                        Growing Practices & Third-Party Certifications
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CERTS.map((cert) => {
                          const currentCerts = watchedValues.certifications || [];
                          const checked = currentCerts.includes(cert);
                          return (
                            <button
                              key={cert}
                              type="button"
                              onClick={() => {
                                const next = checked
                                  ? currentCerts.filter((c) => c !== cert)
                                  : [...currentCerts, cert];
                                setValue('certifications', next);
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
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
                  </motion.div>
                )}

                {/* STEP 6: REVIEW & SUBMIT */}
                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-[#E7E0D2] pb-4">
                      <h2 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                        Step 6: Review Your Farmstand
                      </h2>
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        Double-check your information before publishing live.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Section 1 summary */}
                      <div className="bg-[#FBF8F1] p-4 rounded-2xl border border-[#E7E0D2] flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1F4D3A]">Account & Grower</p>
                          <p className="text-[#1E1B16] mt-0.5">{watchedValues.fullName} ({watchedValues.email})</p>
                          <p className="text-[#6B645A]">{watchedValues.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="font-bold text-[#1F4D3A] hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Section 2 summary */}
                      <div className="bg-[#FBF8F1] p-4 rounded-2xl border border-[#E7E0D2] flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1F4D3A]">{watchedValues.farmName}</p>
                          <p className="text-[#1E1B16] mt-0.5">{watchedValues.farmType} · Est. {watchedValues.establishedYear}</p>
                          <p className="text-[#6B645A] mt-1 line-clamp-2">{watchedValues.story}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="font-bold text-[#1F4D3A] hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Section 3 summary */}
                      <div className="bg-[#FBF8F1] p-4 rounded-2xl border border-[#E7E0D2] flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1F4D3A]">Location & Pickup</p>
                          <p className="text-[#1E1B16] mt-0.5">{watchedValues.address}, {watchedValues.town}, {watchedValues.state}</p>
                          <p className="text-[#6B645A]">Days: {watchedValues.pickupDays?.join(', ')} ({watchedValues.pickupHours})</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="font-bold text-[#1F4D3A] hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Section 4 summary */}
                      <div className="bg-[#FBF8F1] p-4 rounded-2xl border border-[#E7E0D2] flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1F4D3A]">Produce Items ({watchedValues.products?.length})</p>
                          <ul className="mt-1 space-y-0.5 text-[#1E1B16]">
                            {watchedValues.products?.map((p, i) => (
                              <li key={i}>
                                • {p.name} — ${Number(p.price).toFixed(2)} / {p.unit} ({p.stockCount} available)
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="font-bold text-[#1F4D3A] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="pt-6 border-t border-[#E7E0D2] flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 6 ? (
                    <Button
                      type="button"
                      variant="gradient"
                      onClick={handleNextStep}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Continue to Step {currentStep + 1}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      isLoading={createFarmMutation.isPending}
                      rightIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Launch Farmstand Now
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>

          {/* Live Updating Profile Preview Card (Right Column) */}
          <div
            className={`lg:col-span-5 sticky top-28 space-y-3 ${
              showMobilePreview ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#6B645A] uppercase tracking-wider px-2">
              <span>Live Profile Preview</span>
              <span className="text-[#6BBF59] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6BBF59] animate-pulse" />
                Updates live as you type
              </span>
            </div>

            <Card className="bg-white border border-[#E7E0D2] shadow-xl overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={watchedValues.coverImage || SAMPLE_COVERS[0]}
                  alt="Farm preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#143326]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-xl font-bold leading-tight">
                      {watchedValues.farmName || 'Your Farm Name'}
                    </h3>
                    <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {watchedValues.town || 'Town'}, {watchedValues.state || 'State'}
                    </p>
                  </div>
                  <span className="bg-[#1F4D3A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Open for orders
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <p className="text-[#6B645A] line-clamp-3 leading-relaxed">
                    {watchedValues.story || 'Your story and farming ethos will appear here for local neighbors to read.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {watchedValues.certifications?.map((c) => (
                    <Badge key={c} variant="leaf" size="sm">
                      {c}
                    </Badge>
                  ))}
                </div>

                <div className="p-3 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#1F4D3A] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pickup Days:</span>
                  </div>
                  <p className="text-[#1E1B16]">
                    {watchedValues.pickupDays?.length
                      ? watchedValues.pickupDays.join(', ')
                      : 'None selected yet'}{' '}
                    · {watchedValues.pickupHours || '8:00 AM – 1:00 PM'}
                  </p>
                </div>

                {/* Produce snippet */}
                <div>
                  <p className="font-bold text-[#1F4D3A] mb-2">
                    Harvest Preview ({watchedValues.products?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {watchedValues.products?.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 rounded-xl bg-[#F3EEE3]/60 border border-[#E7E0D2]"
                      >
                        <span className="font-semibold text-[#1E1B16] truncate max-w-[140px]">
                          {p.name || 'Produce Item'}
                        </span>
                        <span className="font-serif font-bold text-[#1F4D3A]">
                          ${Number(p.price || 0).toFixed(2)} / {p.unit || 'lb'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
