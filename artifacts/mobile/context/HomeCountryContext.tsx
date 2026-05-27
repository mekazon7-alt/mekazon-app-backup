import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { type HomeCountry, COUNTRY_CONFIGS, type CountryConfig } from "@/constants/personalization";

const STORAGE_KEY = "@mekazon_home_country";

interface HomeCountryContextType {
  homeCountry: HomeCountry | null;
  countryConfig: CountryConfig | null;
  isLoading: boolean;
  setHomeCountry: (country: HomeCountry) => Promise<void>;
  clearHomeCountry: () => Promise<void>;
}

const HomeCountryContext = createContext<HomeCountryContextType>({
  homeCountry: null,
  countryConfig: null,
  isLoading: true,
  setHomeCountry: async () => {},
  clearHomeCountry: async () => {},
});

export function HomeCountryProvider({ children }: { children: React.ReactNode }) {
  const [homeCountry, setHomeCountryState] = useState<HomeCountry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          setHomeCountryState(value as HomeCountry);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setHomeCountry = async (country: HomeCountry) => {
    await AsyncStorage.setItem(STORAGE_KEY, country);
    setHomeCountryState(country);
  };

  const clearHomeCountry = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setHomeCountryState(null);
  };

  return (
    <HomeCountryContext.Provider
      value={{
        homeCountry,
        countryConfig: homeCountry ? COUNTRY_CONFIGS[homeCountry] : null,
        isLoading,
        setHomeCountry,
        clearHomeCountry,
      }}
    >
      {children}
    </HomeCountryContext.Provider>
  );
}

export function useHomeCountry() {
  return useContext(HomeCountryContext);
}
