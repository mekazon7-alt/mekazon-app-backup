import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { type HomeCountry, type Product } from "@/constants/personalization";
import { type CollectionExperience, COLLECTION_EXPERIENCES } from "@/constants/collections";
import { getProductsForCountry } from "@/services/shopify";

const STORAGE_KEY = "@mekazon_home_country";

interface HomeCountryContextType {
  homeCountry: HomeCountry | null;
  experience: CollectionExperience | null;
  shopifyProducts: Product[];
  productsLoading: boolean;
  isLoading: boolean;
  setHomeCountry: (country: HomeCountry) => Promise<void>;
  clearHomeCountry: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const HomeCountryContext = createContext<HomeCountryContextType>({
  homeCountry: null,
  experience: null,
  shopifyProducts: [],
  productsLoading: false,
  isLoading: true,
  setHomeCountry: async () => {},
  clearHomeCountry: async () => {},
  refreshProducts: async () => {},
});

export function HomeCountryProvider({ children }: { children: React.ReactNode }) {
  const [homeCountry, setHomeCountryState] = useState<HomeCountry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shopifyProducts, setShopifyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const loadProducts = useCallback(async (country: HomeCountry) => {
    setProductsLoading(true);
    try {
      const products = await getProductsForCountry(country);
      setShopifyProducts(products);
    } catch (err) {
      console.warn("[Mekazon] Failed to load Shopify products:", err);
      setShopifyProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          const country = value as HomeCountry;
          setHomeCountryState(country);
          loadProducts(country);
        }
      })
      .finally(() => setIsLoading(false));
  }, [loadProducts]);

  const setHomeCountry = async (country: HomeCountry) => {
    await AsyncStorage.setItem(STORAGE_KEY, country);
    setHomeCountryState(country);
    await loadProducts(country);
  };

  const clearHomeCountry = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setHomeCountryState(null);
    setShopifyProducts([]);
  };

  const refreshProducts = useCallback(async () => {
    if (homeCountry) await loadProducts(homeCountry);
  }, [homeCountry, loadProducts]);

  const experience = homeCountry ? COLLECTION_EXPERIENCES[homeCountry] : null;

  return (
    <HomeCountryContext.Provider
      value={{
        homeCountry,
        experience,
        shopifyProducts,
        productsLoading,
        isLoading,
        setHomeCountry,
        clearHomeCountry,
        refreshProducts,
      }}
    >
      {children}
    </HomeCountryContext.Provider>
  );
}

export function useHomeCountry() {
  return useContext(HomeCountryContext);
}
