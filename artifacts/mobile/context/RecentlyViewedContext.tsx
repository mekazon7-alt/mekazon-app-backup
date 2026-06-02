import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Product } from "@/constants/personalization";

const RECENT_KEY = "@mekazon_recently_viewed";
const MAX_RECENT = 8;

interface RecentlyViewedContextType {
  items: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
  items: [],
  addRecentlyViewed: () => {},
  clearRecentlyViewed: () => {},
});

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(items));
  }, [items]);

  const addRecentlyViewed = useCallback((product: Product) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== product.id);
      return [product, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => setItems([]), []);

  return (
    <RecentlyViewedContext.Provider value={{ items, addRecentlyViewed, clearRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}