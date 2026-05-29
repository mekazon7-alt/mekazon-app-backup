import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AdminBasket, AdminMeal, AdminCategory, AdminPromo, AppContentData } from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";
import { appContentService } from "@/services/content/appContentService";

interface AppContentContextType {
  isLoading: boolean;
  rawData: AppContentData | null;
  getBasketsForCountry: (country: HomeCountry) => AdminBasket[];
  getMealsForCountry: (country: HomeCountry) => AdminMeal[];
  getCategoriesForCountry: (country: HomeCountry) => AdminCategory[];
  getActivePromos: (country: HomeCountry) => AdminPromo[];
  reload: () => Promise<void>;
}

const AppContentContext = createContext<AppContentContextType>({
  isLoading: true,
  rawData: null,
  getBasketsForCountry: () => [],
  getMealsForCountry: () => [],
  getCategoriesForCountry: () => [],
  getActivePromos: () => [],
  reload: async () => {},
});

export function AppContentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const content = await appContentService.getContent();
      setData(content);
    } catch (e) {
      console.warn("[AppContent] load failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const getBasketsForCountry = useCallback(
    (country: HomeCountry): AdminBasket[] => {
      if (!data) return [];
      return data.baskets
        .filter((b) => b.active && (b.country === country || b.country === "all"))
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getMealsForCountry = useCallback(
    (country: HomeCountry): AdminMeal[] => {
      if (!data) return [];
      return data.meals
        .filter((m) => m.active && (m.country === country || m.country === "all"))
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getCategoriesForCountry = useCallback(
    (country: HomeCountry): AdminCategory[] => {
      if (!data) return [];
      // Strict match — only return categories for this specific country.
      // "all" categories are shown only when homeCountry === "all" (Show Everything).
      // This prevents doubles when country-specific + "all" share the same category name.
      return data.categories
        .filter((c) => c.active && c.country === country)
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getActivePromos = useCallback(
    (country: HomeCountry) => {
      if (!data?.promos) return [];
      return data.promos
        .filter((p) => p.active && (p.country === country || p.country === "all"))
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  return (
    <AppContentContext.Provider
      value={{ isLoading, rawData: data, getBasketsForCountry, getMealsForCountry, getCategoriesForCountry, getActivePromos, reload }}
    >
      {children}
    </AppContentContext.Provider>
  );
}

export function useAppContent() {
  return useContext(AppContentContext);
}
