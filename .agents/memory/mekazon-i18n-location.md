---
name: Mekazon i18n + Location Architecture
description: Multi-language system (4 langs + RTL) and UAE emirate location selection
---

# i18n

## Structure
- `lib/i18n/en.json`, `ar.json`, `am.json`, `sw.json` — flat key/value translation files
- `lib/i18n/index.ts` — `t(key, language, params?)` fn + LANGUAGE_META + COUNTRY_SUGGESTED_LANGUAGE map
- `context/LanguageContext.tsx` — `useLanguage()` hook; exposes `t(key, params?)`, `language`, `isRTL`, `setLanguage()`
- AsyncStorage key: `@mekazon_language`

## RTL
- Arabic sets `I18nManager.forceRTL(true)` — requires app restart in Expo Go to fully apply
- Check `isRTL` from `useLanguage()` for direction-aware styles

## Country → Suggested Language
- ethiopia → am, kenya → sw, uganda → sw, other/all → en

# Location

## UAE Emirates
- `context/LocationContext.tsx` — `useLocation()` hook; exposes `selectedEmirate`, `setEmirate()`, `deliveryLabel`
- `components/LocationBottomSheet.tsx` — Modal with emirates list, delivery badge, confirm CTA
- AsyncStorage key: `@mekazon_location`
- Dubai = same-day, all others = next-day

# App Flow

## New user flow
1. `app/index.tsx` checks `@mekazon_seen_welcome` → `/welcome` if not seen
2. `/welcome` — emotional full-screen food image + "Start" → `/onboarding`
3. `/onboarding` — Step 1: Choose Home, Step 2: Choose Language → `/(tabs)`
4. Returning user → `/(tabs)` directly

## AsyncStorage keys
- `@mekazon_seen_welcome` — boolean "true" once welcome seen
- `@mekazon_language` — SupportedLanguage ("en"|"ar"|"am"|"sw")
- `@mekazon_location` — UAE_Emirate id ("dubai", "sharjah", etc.)
- `@mekazon_home_country` — HomeCountry value
