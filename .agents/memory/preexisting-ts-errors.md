---
name: Pre-existing TypeScript errors (mobile)
description: Four known TS errors that exist before any work begins — ignore them in typecheck output.
---

**Files with pre-existing errors:**
- `app/onboarding.tsx` — ReactNode type mismatch
- `hooks/useColors.ts` — Record cast overlap issue
- `services/shopify/mock-data.ts` — quantityAvailable not in ShopifyProductVariant
- `app/(tabs)/index.tsx` — `heroImg: any` cast (line ~785, inside ReadyFood IIFE)

**Why:** These were present before the QA pass and are accepted technical debt. Do not attempt to fix them unless explicitly asked — they do not affect runtime behavior.

**How to apply:** When running typecheck, if only these four errors appear, the build is clean.
