---
name: Mekazon Shopify Architecture
description: How Shopify Storefront API is integrated for country-personalized product feeds
---

# Shopify Service Layer

## Key files
- `services/shopify/types.ts` — Full Storefront API types (ShopifyProduct, ShopifyCollection, etc.)
- `services/shopify/mock-data.ts` — Realistic mock data per collection, Shopify GID format
- `services/shopify/client.ts` — Real API client + mock fallback (USE_MOCK = no env vars)
- `services/shopify/transforms.ts` — ShopifyProduct → app Product type with handle→imageKey map
- `services/shopify/index.ts` — Exports: `getProductsForCountry(country)` is the main entry point
- `constants/collections.ts` — Country → collection handle + full home experience config (baskets, hero, categories)

## Country → Collection handle map
| HomeCountry | Shopify Handle |
|---|---|
| uganda | ugandan-products |
| kenya | kenyan-products |
| ethiopia | ethiopian-products |
| other | other-african-products |
| all | all-african-products |

## Context changes
- `HomeCountryContext` now exposes: `experience` (CollectionExperience) + `shopifyProducts` (Product[]) + `productsLoading`
- `countryConfig` from old personalization.ts is REMOVED from context — use `experience` instead
- `personalization.ts` still owns the Product/Basket/HomeCountry types; `collections.ts` owns the experience config

## To connect real Shopify
Add two env vars:
- `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` — e.g. `mekazon.myshopify.com`
- `EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` — public storefront access token
Client auto-detects and switches from mock to real API. No code changes needed.

## Image fallback chain
1. Local `imageKey` → local asset require() map (preferred for trust/branding)
2. `remoteImageUrl` → Shopify CDN url (when real API is connected)
3. `cardColor` → colored dot placeholder
