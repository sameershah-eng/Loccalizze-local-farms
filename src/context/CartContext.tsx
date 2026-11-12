import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, CartItem, Order } from '../types';
import { useToast } from './ToastContext';
import { placeOrder } from '../lib/api';

const CART_STORAGE_KEY = 'loccalizze_cart_items_v1';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  isCheckingOut: boolean;
  checkoutSuccessOrder: Order | null;
  setCheckoutSuccessOrder: (order: Order | null) => void;
  handleCheckout: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    fulfillmentType: 'pickup' | 'delivery';
    notes?: string;
  }) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast({
      title: 'Added to cart',
      message: `${quantity}× ${product.name} from ${product.farmName}`,
      type: 'success',
    });
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = items.find((i) => i.product.id === productId);
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    if (itemToRemove) {
      showToast({
        message: `Removed ${itemToRemove.product.name} from your cart`,
        type: 'info',
        undoAction: () => {
          setItems((prev) => [...prev, itemToRemove]);
        },
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );

  const handleCheckout = async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    fulfillmentType: 'pickup' | 'delivery';
    notes?: string;
  }): Promise<boolean> => {
    if (items.length === 0) return false;
    setIsCheckingOut(true);
    try {
      // Primary farm ID (from first item or grouped)
      const primaryFarm = items[0].product;
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        unit: i.product.unit,
      }));

      const newOrder = await placeOrder({
        farmId: primaryFarm.farmId,
        farmName: primaryFarm.farmName,
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone,
        items: orderItems,
        subtotal,
        fulfillmentType: details.fulfillmentType,
        fulfillmentDate:
          details.fulfillmentType === 'pickup'
            ? 'This Saturday, 10:00 AM – 1:00 PM'
            : 'Next delivery window (Friday afternoon)',
        status: 'New',
        notes: details.notes,
      });

      setCheckoutSuccessOrder(newOrder);
      clearCart();
      setIsCartOpen(false);
      showToast({
        title: 'Order Confirmed',
        message: `Your harvest reservation #${newOrder.id} has been placed!`,
        type: 'success',
      });
      return true;
    } catch {
      showToast({
        title: 'Checkout error',
        message: 'Could not process order. Please try again.',
        type: 'error',
      });
      return false;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        isCheckingOut,
        checkoutSuccessOrder,
        setCheckoutSuccessOrder,
        handleCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
