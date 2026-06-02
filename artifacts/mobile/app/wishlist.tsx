import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Product } from "@/constants/personalization";

const WISHLIST_KEY = "@mekazon_wishlist";

interface WishlistContextType {
  items: Product[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  clearWishlist: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(WISHLIST_KEY).then((raw) => {
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  // Persist whenever items change
  useEffect(() => {
    AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items]);

  const isWishlisted = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      return exists ? prev.filter((i) => i.id !== product.id) : [product, ...prev];
    });
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}