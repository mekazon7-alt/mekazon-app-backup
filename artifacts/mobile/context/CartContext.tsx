import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Analytics } from "@/services/analytics";

import type { Product } from "@/constants/personalization";
import { getCheckoutUrl } from "@/services/shopify/cart";
import { saveOrder, generateOrderId, type LocalOrder } from "@/services/orderHistoryService";

const CART_STORAGE_KEY = "@mekazon_cart_items";
const CART_ID_KEY = "@mekazon_cart_id";

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutExtras {
  vatAmount?: number;
  deliveryFee?: number | null;
  estimatedTotal?: number;
  emirate?: string;
  country?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
  checkoutLoading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  shopifyCheckout: (extras?: CheckoutExtras) => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalSavings: 0,
  checkoutLoading: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  shopifyCheckout: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load persisted cart on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch {}
      }
      setHydrated(true);
    });
  }, []);

  // Persist cart whenever it changes (but not before hydration)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Savings = sum of (compareAtPrice - price) * quantity for items that have compareAtPrice
  const totalSavings = items.reduce((sum, item) => {
    if (item.compareAtPrice && item.compareAtPrice > item.price) {
      return sum + (item.compareAtPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const addItem = (product: Product) => {
    Analytics.addToCart(product.id, product.name, product.price);
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
    const item = items.find((i) => i.id === productId);
    if (item) Analytics.removeFromCart(item.id, item.name);
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  const shopifyCheckout = useCallback(async (extras?: CheckoutExtras) => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const itemsWithVariant = items.filter((item) => !!item.variantId);
      const itemsWithoutVariant = items.filter((item) => !item.variantId);

      if (itemsWithoutVariant.length > 0 && itemsWithVariant.length === 0) {
        await Linking.openURL("https://www.mekazon.com/cart");
        return;
      }

      const lineItems = itemsWithVariant.map((item) => ({
        variantId: item.variantId!,
        quantity: item.quantity,
      }));

      const checkoutUrl = await getCheckoutUrl(lineItems.length > 0 ? lineItems : []);

      const vat = extras?.vatAmount ?? 0;
      const delivery = extras?.deliveryFee ?? null;
      const estimated = extras?.estimatedTotal ?? totalPrice + vat + (delivery ?? 0);

      const order: LocalOrder = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal: totalPrice,
        vatAmount: vat,
        deliveryFee: delivery,
        estimatedTotal: estimated,
        checkoutUrl,
        emirate: extras?.emirate,
        country: extras?.country,
        status: "sent_to_shopify",
      };
      await saveOrder(order);
      setItems([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      Analytics.beginCheckout(estimated, items.length);
      await AsyncStorage.removeItem(CART_ID_KEY);
      await Linking.openURL(checkoutUrl);
    } catch (err) {
      console.warn("[Mekazon] Checkout error:", err);
      await Linking.openURL("https://www.mekazon.com/cart");
    } finally {
      setCheckoutLoading(false);
    }
  }, [items, totalPrice]);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, totalSavings, checkoutLoading, addItem, removeItem, updateQuantity, clearCart, shopifyCheckout }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}