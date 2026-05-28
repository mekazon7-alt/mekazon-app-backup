import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AdminBasket, AdminMeal, AdminCategory, AppContentData } from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";
import { appContentService } from "@/services/content/appContentService";

interface AppContentContextType {
  isLoading: boolean;
  rawData: AppContentData | null;
  getBasketsForCountry: (country: HomeCountry) => AdminBasket[];
  getMealsForCountry: (country: HomeCountry) => AdminMeal[];
  getCategoriesForCountry: (country: HomeCountry) => AdminCategory[];
  reload: () => Promise<void>;
}

const AppContentContext = createContext<AppContentContextType>({
  isLoading: true,
  rawData: null,
  getBasketsForCountry: () => [],
  getMealsForCountry: () => [],
  getCategoriesForCountry: () => [],
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
      return data.categories
        .filter((c) => c.active && (c.country === country || c.country === "all"))
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  return (
    <AppContentContext.Provider
      value={{ isLoading, rawData: data, getBasketsForCountry, getMealsForCountry, getCategoriesForCountry, reload }}
    >
      {children}
    </AppContentContext.Provider>
  );
}

export function useAppContent() {
  return useContext(AppContentContext);
}
