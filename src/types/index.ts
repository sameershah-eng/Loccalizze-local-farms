export type FarmCategory =
  | 'Vegetables'
  | 'Fruit'
  | 'Eggs & Dairy'
  | 'Meat'
  | 'Honey'
  | 'Bakery'
  | 'Flowers';

export type Certification =
  | 'Organic'
  | 'Pasture-raised'
  | 'Non-GMO'
  | 'No Antibiotics'
  | 'Regenerative'
  | 'Heirloom';

export interface Farm {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  coverImage: string;
  avatar: string;
  farmerName: string;
  farmerTitle: string;
  town: string;
  state: string;
  zip: string;
  address: string;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  certifications: Certification[];
  farmType: string;
  openToday: boolean;
  pickupDays: string[];
  pickupHours: string;
  deliveryRadiusMiles: number;
  deliveryAvailable: boolean;
  deliveryFee: number;
  minOrder: number;
  establishedYear: number;
  featured: boolean;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  farmId: string;
  farmName: string;
  farmSlug?: string;
  name: string;
  description: string;
  category: FarmCategory;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
  stockCount: number;
  badge?: string;
  organic: boolean;
  harvestDate: string;
}

export interface Review {
  id: string;
  farmId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  verifiedShopper: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  farmId: string;
  farmName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  fulfillmentType: 'pickup' | 'delivery';
  fulfillmentDate: string;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  maxDistance: number;
  certifications: Certification[];
  openOnly: boolean;
  sortBy: 'nearest' | 'rating' | 'newest';
}

export interface OnboardingFormValues {
  // Step 1: Account
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  // Step 2: Farm Details
  farmName: string;
  story: string;
  farmType: string;
  establishedYear: number;
  // Step 3: Location & Pickup
  address: string;
  town: string;
  state: string;
  zip: string;
  pickupDays: string[];
  pickupHours: string;
  deliveryRadiusMiles: number;
  deliveryAvailable: boolean;
  // Step 4: Products
  products: {
    name: string;
    category: FarmCategory;
    price: number;
    unit: string;
    stockCount: number;
  }[];
  // Step 5: Photos & Branding
  coverImage: string;
  certifications: Certification[];
}
