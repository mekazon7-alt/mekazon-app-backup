import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import React, { createContext, useCallback, useContext, useState } from "react";

import type { Product } from "@/constants/personalization";
import { getCheckoutUrl } from "@/services/shopify/cart";

const CART_ID_KEY = "@mekazon_cart_id";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  checkoutLoading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  shopifyCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  checkoutLoading: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  shopifyCheckout: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  /**
   * Opens Shopify checkout for the current cart items.
   *
   * When EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN + EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
   * are set, this creates a real Shopify cart and opens the hosted checkout URL.
   * Orders will appear in Shopify Admin > Orders automatically.
   *
   * Payment options (Cash on Delivery, online payment) are configured in
   * Shopify Admin > Settings > Payments and appear automatically at checkout.
   */
  const shopifyCheckout = useCallback(async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const lineItems = items
        .filter((item) => !!item.variantId)
        .map((item) => ({
          variantId: item.variantId!,
          quantity: item.quantity,
        }));

      const checkoutUrl = await getCheckoutUrl(
        lineItems.length > 0 ? lineItems : []
      );

      await AsyncStorage.removeItem(CART_ID_KEY);
      await Linking.openURL(checkoutUrl);
    } catch (err) {
      console.warn("[Mekazon] Checkout error:", err);
      await Linking.openURL("https://www.mekazon.com/cart");
    } finally {
      setCheckoutLoading(false);
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        checkoutLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        shopifyCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
