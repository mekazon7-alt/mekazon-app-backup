# Mekazon

The emotional home for Africans living abroad — a culturally intelligent marketplace for the African diaspora in UAE/GCC. Not a grocery app. The future digital home of African culture, food, and community.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54), expo-router (file-based routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo mobile app
  - `app/onboarding.tsx` — "Choose Your Home" onboarding flow
  - `app/(tabs)/` — Main 5-tab app (Home, Search, Cart, Orders, Profile)
  - `constants/personalization.ts` — Source of truth for all country-specific data
  - `constants/colors.ts` — Warm cream/terracotta design tokens
  - `context/HomeCountryContext.tsx` — AsyncStorage-backed country preference
  - `context/CartContext.tsx` — In-memory cart state
  - `assets/images/` — Two image systems (see below)

## Image System (Two Types)

### 1. Real Product Images (Trust & Authenticity)
For packaged goods — shows authentic product packaging to build trust:
- `product-royco.png` — Royco Mchuzi Mix
- `product-unga.png` — Ugali maize flour
- `product-teff.png` — Ethiopian teff flour
- `product-berbere.png` — Berbere spice blend
- `product-coffee.png` — Ethiopian single-origin coffee

### 2. Emotional Lifestyle Images (Discovery & Craving)
For baskets, onboarding cards, meal inspiration, and hero sections:
- `lifestyle-ugali.png` — Steaming ugali & sukuma wiki scene
- `lifestyle-injera.png` — Ethiopian injera spread
- `lifestyle-matooke.png` — Fresh matooke in woven basket
- `lifestyle-coffee.png` — Ethiopian coffee ceremony
- `lifestyle-spices.png` — Colorful African spices flat lay
- `hero-uganda/kenya/ethiopia/pan-african.png` — Country hero banners

## Architecture decisions

- **Onboarding-first personalization**: First screen is always "Choose Your Home" — stores choice in AsyncStorage; drives all content throughout the app
- **Country configs as data**: All country-specific content (products, baskets, categories, copy) lives in `constants/personalization.ts` — easy to extend
- **Two-image philosophy**: Product cards use real product imagery; baskets and emotional sections use lifestyle imagery — these serve different psychological roles (trust vs. craving)
- **Warm design system**: Color theme is cream/beige (#FAF7F2) with terracotta primary (#C8581C) — NOT dark/tech/cold. Onboarding stays intentionally dark/dramatic for first impression
- **Dark onboarding → warm home**: Contrast between dramatic dark onboarding and warm cream home screen creates emotional impact on first entry

## Product

- 5-country personalization: Uganda, Kenya, Ethiopia, Other African Countries, Show Me Everything
- Country-specific products, baskets, categories, search suggestions, hero text, greetings
- Home tab: hero banner, Buy Again, Explore, category chips, My Baskets, Cravings Right Now, Meal Inspiration
- Profile tab: Change home country via bottom sheet (persists to AsyncStorage)
- Cart with quantity controls

## User preferences

- The app should feel warm, premium, emotional — NOT dark/cold/tech
- Images must serve dual purposes: product trust (real packaging) + emotional lifestyle (food scenes)
- Cultural authenticity matters: native language greetings, country-specific food references
- Never use emojis in the app UI

## Gotchas

- The `CARD_IMAGES` and product image maps use static `require()` — if you add new image files, you must add them to these maps AND the images must exist before Metro bundles
- Country config changes in `constants/personalization.ts` automatically cascade to ALL screens — it's the single source of truth
- The `ALL` country config spreads products from other configs — keep it in sync if you add products

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
