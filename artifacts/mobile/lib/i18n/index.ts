import en from "./en.json";
import ar from "./ar.json";
import am from "./am.json";
import sw from "./sw.json";
import om from "./om.json";

export type SupportedLanguage = "en" | "ar" | "am" | "sw" | "om";

export const LANGUAGE_META: Record<
  SupportedLanguage,
  { label: string; nativeLabel: string; rtl: boolean; flag: string }
> = {
  en: { label: "English", nativeLabel: "English", rtl: false, flag: "🇬🇧" },
  ar: { label: "Arabic", nativeLabel: "العربية", rtl: true, flag: "🇦🇪" },
  am: { label: "Amharic", nativeLabel: "አማርኛ", rtl: false, flag: "🇪🇹" },
  sw: { label: "Swahili", nativeLabel: "Swahili", rtl: false, flag: "🇰🇪" },
  om: { label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo", rtl: false, flag: "🇪🇹" },
};

export const COUNTRY_SUGGESTED_LANGUAGE: Record<string, SupportedLanguage> = {
  ethiopia: "am",
  kenya: "sw",
  uganda: "sw",
  other: "en",
  all: "en",
};

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en,
  ar,
  am,
  sw,
  om,
};

export function t(
  key: string,
  language: SupportedLanguage,
  params?: Record<string, string>
): string {
  const translations = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  let text = translations[key] ?? TRANSLATIONS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
