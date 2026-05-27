import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";

import {
  type SupportedLanguage,
  LANGUAGE_META,
  t as translate,
} from "@/lib/i18n";

const STORAGE_KEY = "@mekazon_language";

interface LanguageContextType {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  isRTL: false,
  setLanguage: async () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in LANGUAGE_META) {
        const lang = stored as SupportedLanguage;
        setLanguageState(lang);
        const isRTL = LANGUAGE_META[lang].rtl;
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
    const isRTL = LANGUAGE_META[lang].rtl;
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  }, []);

  const tFn = useCallback(
    (key: string, params?: Record<string, string>) =>
      translate(key, language, params),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL: LANGUAGE_META[language].rtl,
        setLanguage,
        t: tFn,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
