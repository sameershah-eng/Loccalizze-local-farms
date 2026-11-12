import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFarms,
  fetchFarmBySlug,
  fetchProducts,
  fetchReviews,
  fetchOrders,
  updateOrderStatus,
  saveProduct,
  deleteProduct,
  createFarmProfile,
  placeOrder,
} from '../lib/api';
import { Farm, Product, Order, FilterOptions } from '../types';

export function useFarms(filters?: Partial<FilterOptions>) {
  return useQuery({
    queryKey: ['farms', filters],
    queryFn: () => fetchFarms(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFarm(slug: string | undefined) {
  return useQuery({
    queryKey: ['farm', slug],
    queryFn: () => (slug ? fetchFarmBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProducts(farmId?: string, category?: string) {
  return useQuery({
    queryKey: ['products', farmId, category],
    queryFn: () => fetchProducts(farmId, category),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReviews(farmId?: string) {
  return useQuery({
    queryKey: ['reviews', farmId],
    queryFn: () => fetchReviews(farmId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrders(farmId: string = 'farm-1') {
  return useQuery({
    queryKey: ['orders', farmId],
    queryFn: () => fetchOrders(farmId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Partial<Product> & { farmId: string }) => saveProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (farmData: Omit<Farm, 'id'>) => createFarmProfile(farmData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id' | 'createdAt'>) => placeOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
