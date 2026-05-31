/**
 * AppContentContext — Firebase-aware
 * Adds `syncStatus` and `refreshFromCloud` so the UI can show
 * "syncing..." and admins can force a refresh.
 * All existing consumers (index.tsx, admin-content.tsx) work unchanged.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AdminBasket, AdminMeal, AdminCategory, AdminPromo, AppContentData } from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";
import { appContentService } from "@/services/content/appContentService";
import { isFirebaseConfigured } from "@/services/content/firebaseConfig";

export type SyncStatus = "idle" | "syncing" | "synced" | "offline";

interface AppContentContextType {
  isLoading: boolean;
  syncStatus: SyncStatus;
  rawData: AppContentData | null;
  isFirebase: boolean;
  getBasketsForCountry: (country: HomeCountry) => AdminBasket[];
  getMealsForCountry: (country: HomeCountry) => AdminMeal[];
  getCategoriesForCountry: (country: HomeCountry) => AdminCategory[];
  getActivePromos: (country: HomeCountry) => AdminPromo[];
  reload: () => Promise<void>;
  refreshFromCloud: () => Promise<void>;
}

const AppContentContext = createContext<AppContentContextType>({
  isLoading: true,
  syncStatus: "idle",
  rawData: null,
  isFirebase: false,
  getBasketsForCountry: () => [],
  getMealsForCountry: () => [],
  getCategoriesForCountry: () => [],
  getActivePromos: () => [],
  reload: async () => {},
  refreshFromCloud: async () => {},
});

function matchesCountry(countries: string[] | undefined, target: HomeCountry): boolean {
  if (!countries || countries.length === 0) return false;
  return countries.includes(target) || countries.includes("all");
}

/**
 * Deduplicates items so that country-specific items take priority over "all".
 * If a user is from "uganda" and we have both uganda-specific AND "all" items
 * with the same name, only the uganda-specific one shows.
 */
function deduplicateByName<T extends { countries: string[]; name?: string; id: string }>(
  items: T[],
  country: HomeCountry
): T[] {
  const specificItems = items.filter(i => i.countries.includes(country));
  const specificNames = new Set(specificItems.map(i => i.name ?? i.id));
  return items.filter(i => 
    i.countries.includes(country) || 
    (!i.countries.includes(country) && !specificNames.has(i.name ?? i.id))
  );
}

export function AppContentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const reload = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const content = await appContentService.getContent();
      setData(content);
      setSyncStatus(isFirebaseConfigured() ? "synced" : "offline");
    } catch (e) {
      console.warn("[AppContent] load failed:", e);
      setSyncStatus("offline");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setSyncStatus("syncing");
    try {
      const content = await appContentService.refreshFromCloud();
      setData(content);
      setSyncStatus("synced");
    } catch {
      setSyncStatus("offline");
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const getBasketsForCountry = useCallback(
    (country: HomeCountry): AdminBasket[] => {
      if (!data) return [];
      const matchedBaskets = data.baskets.filter((b) => b.active && matchesCountry(b.countries, country));
      return deduplicateByName(matchedBaskets, country).sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getMealsForCountry = useCallback(
    (country: HomeCountry): AdminMeal[] => {
      if (!data) return [];
      const matchedMeals = data.meals.filter((m) => m.active && matchesCountry(m.countries, country));
      return deduplicateByName(matchedMeals, country).sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getCategoriesForCountry = useCallback(
    (country: HomeCountry): AdminCategory[] => {
      if (!data) return [];
      const matched = data.categories.filter((c) => c.active && matchesCountry(c.countries, country));
      return deduplicateByName(matched, country).sort((a, b) => a.order - b.order);
    },
    [data]
  );

  const getActivePromos = useCallback(
    (country: HomeCountry) => {
      if (!data?.promos) return [];
      return data.promos
        .filter((p) => p.active && matchesCountry(p.countries, country))
        .sort((a, b) => a.order - b.order);
    },
    [data]
  );

  return (
    <AppContentContext.Provider
      value={{
        isLoading,
        syncStatus,
        rawData: data,
        isFirebase: isFirebaseConfigured(),
        getBasketsForCountry,
        getMealsForCountry,
        getCategoriesForCountry,
        getActivePromos,
        reload,
        refreshFromCloud,
      }}
    >
      {children}
    </AppContentContext.Provider>
  );
}

export function useAppContent() {
  return useContext(AppContentContext);
}