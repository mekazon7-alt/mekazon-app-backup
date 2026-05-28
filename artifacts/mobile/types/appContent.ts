import type { HomeCountry } from "@/constants/personalization";

export type ContentCountry = HomeCountry | "all";

/**
 * WHAT IS CONTROLLED BY ADMIN CONTENT vs SHOPIFY
 * ─────────────────────────────────────────────────────────────────────────────
 * SHOPIFY controls:
 *   real products, prices, inventory, collections, checkout, payments, orders
 *
 * APP CONTENT ADMIN controls (this file):
 *   My Baskets, Meal Inspiration, homepage hero copy, app categories,
 *   country-specific sections, recipe details pages, emotional copy
 *
 * EDITABLE WITHOUT CODE (via Admin screen):
 *   All fields below — baskets, meals, categories, hero text
 *
 * STILL REQUIRES DEVELOPER WORK:
 *   Adding new lifestyle images (must be bundled with Metro)
 *   Shopify collection handle changes (must match live store)
 *   New country configs beyond the 5 that exist
 *
 * FUTURE CMS RECOMMENDATION:
 *   Replace AsyncStorage storage with Sanity, Shopify Metaobjects, or Supabase.
 *   The service layer (appContentService.ts) is designed to swap backends
 *   without changing any UI code.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AdminBasket {
  id: string;
  country: ContentCountry;
  name: string;
  tagline: string;
  items: string[];
  price: number;
  currency: string;
  lifestyleImageKey?: string;
  imageUrl?: string;
  cardColor: string;
  active: boolean;
  order: number;
  shopifyHandles?: string[];
}

export interface AdminMeal {
  id: string;
  country: ContentCountry;
  lifestyleImageKey: string;
  imageUrl?: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tip?: string;
  linkedShopifyHandles?: string[];
  active: boolean;
  order: number;
}

export interface AdminCategory {
  id: string;
  country: ContentCountry;
  name: string;
  icon: string;
  /**
   * Future: when user taps this category, fetch products from this Shopify
   * collection handle instead of using keyword filtering.
   */
  shopifyCollectionHandle?: string;
  keywords: string[];
  active: boolean;
  order: number;
}

export interface AdminHero {
  country: HomeCountry;
  title: string;
  tagline: string;
  imageKey: string;
  imageUrl?: string;
}

export interface AppContentData {
  version: number;
  baskets: AdminBasket[];
  meals: AdminMeal[];
  categories: AdminCategory[];
  heroes: AdminHero[];
}
