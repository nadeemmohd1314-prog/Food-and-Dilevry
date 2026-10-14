import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, OrderItem } from '../types';
import { api } from '../services/api';

interface CartContextType {
  restaurantId: string | null;
  restaurantName: string | null;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedCoupon: string | null;
  couponError: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'food_dilvry_cart_data';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRestaurantId(parsed.restaurantId || null);
        setRestaurantName(parsed.restaurantName || null);
        setItems(parsed.items || []);
        setAppliedCoupon(parsed.appliedCoupon || null);
        setDiscountAmount(parsed.discountAmount || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          restaurantId,
          restaurantName,
          items,
          appliedCoupon,
          discountAmount,
        })
      );
    } catch {
      // ignore
    }
  }, [restaurantId, restaurantName, items, appliedCoupon, discountAmount]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery fee rules: ₹30, free for orders above ₹299
  const deliveryFee = subtotal > 0 ? (subtotal >= 299 ? 0 : 30) : 0;
  const packagingFee = subtotal > 0 ? 20 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * 5) / 100).toFixed(2)); // 5% GST
  const totalAmount = Number((taxableAmount + deliveryFee + packagingFee + taxAmount).toFixed(2));

  // Add Item (with prompt if from a different restaurant)
  const addItem = (item: MenuItem, restId: string, restName: string) => {
    if (restaurantId && restaurantId !== restId && items.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart contains dishes from "${restaurantName}". Would you like to clear your cart and start a fresh order from "${restName}"?`
      );
      if (!confirmSwitch) return;
      setItems([{
        menuItemId: item.id,
        name: item.name,
        price: item.discountPrice || item.price,
        quantity: 1,
        dietary: item.dietary,
      }]);
      setRestaurantId(restId);
      setRestaurantName(restName);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    setRestaurantId(restId);
    setRestaurantName(restName);

    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: 1,
          dietary: item.dietary,
        },
      ];
    });
  };

  // Remove Item
  const removeItem = (menuItemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.menuItemId !== menuItemId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
      return updated;
    });
  };

  // Update Quantity
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  // Apply Coupon
  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await api.coupons.validate(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.code);
        setDiscountAmount(res.discountAmount);
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        items,
        itemCount,
        subtotal,
        deliveryFee,
        packagingFee,
        taxAmount,
        discountAmount,
        totalAmount,
        appliedCoupon,
        couponError,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        applyCouponCode,
        removeCoupon,
        clearCart,
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
