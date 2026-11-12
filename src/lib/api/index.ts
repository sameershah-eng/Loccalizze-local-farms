import { Farm, Product, Order, Review, FilterOptions } from '../../types';
import { INITIAL_FARMS } from '../../data/mock/farms';
import { INITIAL_PRODUCTS } from '../../data/mock/products';
import { INITIAL_ORDERS } from '../../data/mock/orders';
import { INITIAL_REVIEWS } from '../../data/mock/reviews';

const FARMS_STORAGE_KEY = 'loccalizze_farms_v1';
const PRODUCTS_STORAGE_KEY = 'loccalizze_products_v1';
const ORDERS_STORAGE_KEY = 'loccalizze_orders_v1';
const REVIEWS_STORAGE_KEY = 'loccalizze_reviews_v1';

// Helper to check for simulated error parameter (?simulateError=1)
function shouldSimulateError(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('simulateError') === '1';
}

function delay(ms: number = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Storage helpers with fallback
export function getStoredFarms(): Farm[] {
  try {
    const raw = localStorage.getItem(FARMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FARMS_STORAGE_KEY, JSON.stringify(INITIAL_FARMS));
      return INITIAL_FARMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FARMS;
  }
}

export function saveStoredFarms(farms: Farm[]): void {
  try {
    localStorage.setItem(FARMS_STORAGE_KEY, JSON.stringify(farms));
  } catch (e) {
    console.error('Failed to save farms to localStorage', e);
  }
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

// API methods
export async function fetchFarms(filters?: Partial<FilterOptions>): Promise<Farm[]> {
  await delay(650);
  if (shouldSimulateError()) {
    throw new Error('Simulated network error: Unable to load local farms. Try toggling ?simulateError=0');
  }

  let list = getStoredFarms();

  if (filters) {
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.town.toLowerCase().includes(q) ||
          f.zip.includes(q) ||
          f.tagline.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      const cat = filters.category;
      // find farms producing this category
      const products = getStoredProducts().filter((p) => p.category === cat);
      const farmIds = new Set(products.map((p) => p.farmId));
      list = list.filter((f) => farmIds.has(f.id));
    }

    if (filters.maxDistance && filters.maxDistance > 0) {
      list = list.filter((f) => f.distanceMiles <= filters.maxDistance!);
    }

    if (filters.openOnly) {
      list = list.filter((f) => f.openToday);
    }

    if (filters.certifications && filters.certifications.length > 0) {
      list = list.filter((f) =>
        filters.certifications!.every((cert) => f.certifications.includes(cert))
      );
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'nearest') {
        list = [...list].sort((a, b) => a.distanceMiles - b.distanceMiles);
      } else if (filters.sortBy === 'rating') {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'newest') {
        list = [...list].sort((a, b) => b.establishedYear - a.establishedYear);
      }
    }
  }

  return list;
}

export async function fetchFarmBySlug(slug: string): Promise<Farm | null> {
  await delay(500);
  if (shouldSimulateError()) {
    throw new Error('Simulated network error: Unable to load farm profile.');
  }

  const farms = getStoredFarms();
  const farm = farms.find((f) => f.slug === slug || f.id === slug);
  return farm || null;
}

export async function fetchProducts(farmId?: string, category?: string): Promise<Product[]> {
  await delay(600);
  if (shouldSimulateError()) {
    throw new Error('Simulated network error: Unable to load fresh produce.');
  }

  let list = getStoredProducts();
  if (farmId) {
    list = list.filter((p) => p.farmId === farmId);
  }
  if (category && category !== 'All') {
    list = list.filter((p) => p.category === category);
  }
  return list;
}

export async function fetchReviews(farmId?: string): Promise<Review[]> {
  await delay(450);
  const list = getStoredReviews();
  if (farmId) {
    return list.filter((r) => r.farmId === farmId);
  }
  return list;
}

export async function fetchOrders(farmId: string = 'farm-1'): Promise<Order[]> {
  await delay(500);
  if (shouldSimulateError()) {
    throw new Error('Simulated network error: Unable to load farm orders.');
  }
  const orders = getStoredOrders();
  return orders.filter((o) => o.farmId === farmId);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  await delay(400);
  const orders = getStoredOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...orders[idx], status };
  saveStoredOrders(orders);
  return orders[idx];
}

export async function saveProduct(product: Partial<Product> & { farmId: string }): Promise<Product> {
  await delay(500);
  const products = getStoredProducts();
  if (product.id) {
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...product } as Product;
      saveStoredProducts(products);
      return products[idx];
    }
  }
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    farmId: product.farmId,
    farmName: product.farmName || 'Willow Creek Farm',
    farmSlug: 'willow-creek-farm',
    name: product.name || 'Untitled Harvest',
    description: product.description || '',
    category: product.category || 'Vegetables',
    price: Number(product.price) || 5.0,
    unit: product.unit || 'lb',
    image: product.image || '/src/assets/images/produce_heirloom_basket_1794498934192.jpg',
    inStock: product.inStock ?? true,
    stockCount: Number(product.stockCount) || 10,
    organic: product.organic ?? true,
    harvestDate: 'Just added',
    badge: product.badge,
  };
  products.unshift(newProduct);
  saveStoredProducts(products);
  return newProduct;
}

export async function deleteProduct(productId: string): Promise<void> {
  await delay(350);
  const products = getStoredProducts().filter((p) => p.id !== productId);
  saveStoredProducts(products);
}

export async function createFarmProfile(newFarm: Omit<Farm, 'id'>): Promise<Farm> {
  await delay(800);
  const farms = getStoredFarms();
  const id = `farm-${Date.now()}`;
  const farm: Farm = {
    ...newFarm,
    id,
  };
  farms.unshift(farm);
  saveStoredFarms(farms);
  return farm;
}

export async function placeOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  await delay(600);
  const orders = getStoredOrders();
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: 'Just now',
  };
  orders.unshift(newOrder);
  saveStoredOrders(orders);
  return newOrder;
}
