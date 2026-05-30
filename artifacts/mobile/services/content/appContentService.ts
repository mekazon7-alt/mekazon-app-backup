/**
 * App Content Service — Firebase-first with local cache fallback
 * ─────────────────────────────────────────────────────────────────────────────
 * BEFORE:  AsyncStorage only — admin edits visible on one device only.
 * NOW:     Firebase Firestore — admin edits visible to ALL users instantly.
 *
 * STRATEGY:
 *   1. On every app launch, try to fetch from Firestore (network)
 *   2. If successful → update local AsyncStorage cache → use this data
 *   3. If network fails → fall back to local cache (last known good)
 *   4. If no cache → use hardcoded DEFAULT_APP_CONTENT
 *
 * ADMIN WRITES:
 *   Admin saves → write to Firestore + update local cache
 *   All other users see the change on next app open (or background refresh)
 *
 * NO CODE CHANGES NEEDED elsewhere:
 *   AppContentContext, index.tsx, admin-content.tsx all call the same
 *   appContentService API as before. This file is a drop-in replacement.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AppContentData,
  AdminBasket,
  AdminMeal,
  AdminCategory,
  AdminHero,
  AdminPromo,
} from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";
import { DEFAULT_APP_CONTENT } from "./defaultContent";
import {
  fetchFromFirestore,
  saveToFirestore,
  seedFirestoreIfEmpty,
} from "./firestoreProvider";
import { isFirebaseConfigured } from "./firebaseConfig";

const CACHE_KEY = "@mekazon_content_cache_v5";
const CURRENT_VERSION = DEFAULT_APP_CONTENT.version;

function resolveCountries(item: Record<string, unknown>): string[] {
  if (Array.isArray(item.countries) && (item.countries as unknown[]).length > 0)
    return item.countries as string[];
  if (typeof item.country === "string") return [item.country];
  return ["all"];
}

function migrateContent(raw: AppContentData): AppContentData {
  const version = raw.version ?? 0;
  if (version >= CURRENT_VERSION) return raw;
  return {
    ...raw,
    baskets: ((raw.baskets ?? []) as Record<string, unknown>[]).map((b) => ({
      ...b,
      countries: resolveCountries(b),
    })) as AppContentData["baskets"],
    meals: ((raw.meals ?? []) as Record<string, unknown>[]).map((m) => ({
      ...m,
      countries: resolveCountries(m),
    })) as AppContentData["meals"],
    categories: ((raw.categories ?? []) as Record<string, unknown>[]).map(
      (c) => ({ ...c, countries: resolveCountries(c) })
    ) as AppContentData["categories"],
    promos:
      ((raw as Record<string, unknown>).promos as AppContentData["promos"]) ??
      DEFAULT_APP_CONTENT.promos,
    version: CURRENT_VERSION,
  };
}

async function readCache(): Promise<AppContentData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return migrateContent(JSON.parse(raw) as AppContentData);
  } catch {
    return null;
  }
}

async function writeCache(data: AppContentData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* non-critical */ }
}

async function load(): Promise<AppContentData> {
  if (isFirebaseConfigured()) {
    // Seed Firestore on first ever launch (no-op if already seeded)
    seedFirestoreIfEmpty(DEFAULT_APP_CONTENT).catch(() => {});

    const remote = await fetchFromFirestore();
    if (remote) {
      const migrated = migrateContent(remote);
      await writeCache(migrated);
      return migrated;
    }
    console.warn("[Mekazon] Firestore unavailable — using local cache");
  }

  const cached = await readCache();
  if (cached) return cached;
  return { ...DEFAULT_APP_CONTENT };
}

async function save(data: AppContentData): Promise<void> {
  await writeCache(data);
  if (isFirebaseConfigured()) {
    const ok = await saveToFirestore(data);
    if (!ok) {
      console.warn("[Mekazon] Firestore save failed — saved locally only");
    }
  }
}

function matchesCountry(countries: string[] | undefined, target: HomeCountry): boolean {
  if (!countries || countries.length === 0) return false;
  return countries.includes(target) || countries.includes("all");
}

export const appContentService = {
  getContent: load,
  saveContent: save,

  async resetContent(): Promise<void> {
    await AsyncStorage.removeItem(CACHE_KEY);
  },

  async refreshFromCloud(): Promise<AppContentData> {
    if (isFirebaseConfigured()) {
      const remote = await fetchFromFirestore();
      if (remote) {
        const migrated = migrateContent(remote);
        await writeCache(migrated);
        return migrated;
      }
    }
    return load();
  },

  async getBasketsForCountry(country: HomeCountry): Promise<AdminBasket[]> {
    const c = await load();
    return c.baskets
      .filter((b) => b.active && matchesCountry(b.countries, country))
      .sort((a, b) => a.order - b.order);
  },

  async getMealsForCountry(country: HomeCountry): Promise<AdminMeal[]> {
    const c = await load();
    return c.meals
      .filter((m) => m.active && matchesCountry(m.countries, country))
      .sort((a, b) => a.order - b.order);
  },

  async getCategoriesForCountry(country: HomeCountry): Promise<AdminCategory[]> {
    const c = await load();
    return c.categories
      .filter((cat) => cat.active && matchesCountry(cat.countries, country))
      .sort((a, b) => a.order - b.order);
  },

  async getHero(country: HomeCountry): Promise<AdminHero | undefined> {
    const c = await load();
    return c.heroes.find((h) => h.country === country);
  },

  async getActivePromos(country: HomeCountry): Promise<AdminPromo[]> {
    const c = await load();
    return (c.promos ?? [])
      .filter((p) => p.active && matchesCountry(p.countries, country))
      .sort((a, b) => a.order - b.order);
  },

  async upsertBasket(basket: AdminBasket): Promise<void> {
    const c = await load();
    const idx = c.baskets.findIndex((b) => b.id === basket.id);
    if (idx >= 0) c.baskets[idx] = basket;
    else c.baskets.push(basket);
    await save(c);
  },

  async deleteBasket(id: string): Promise<void> {
    const c = await load();
    c.baskets = c.baskets.filter((b) => b.id !== id);
    await save(c);
  },

  async upsertMeal(meal: AdminMeal): Promise<void> {
    const c = await load();
    const idx = c.meals.findIndex((m) => m.id === meal.id);
    if (idx >= 0) c.meals[idx] = meal;
    else c.meals.push(meal);
    await save(c);
  },

  async deleteMeal(id: string): Promise<void> {
    const c = await load();
    c.meals = c.meals.filter((m) => m.id !== id);
    await save(c);
  },

  async upsertCategory(category: AdminCategory): Promise<void> {
    const c = await load();
    const idx = c.categories.findIndex((cat) => cat.id === category.id);
    if (idx >= 0) c.categories[idx] = category;
    else c.categories.push(category);
    await save(c);
  },

  async deleteCategory(id: string): Promise<void> {
    const c = await load();
    c.categories = c.categories.filter((cat) => cat.id !== id);
    await save(c);
  },

  async upsertHero(hero: AdminHero): Promise<void> {
    const c = await load();
    const idx = c.heroes.findIndex((h) => h.country === hero.country);
    if (idx >= 0) c.heroes[idx] = hero;
    else c.heroes.push(hero);
    await save(c);
  },

  async upsertPromo(promo: AdminPromo): Promise<void> {
    const c = await load();
    if (!c.promos) c.promos = [];
    const idx = c.promos.findIndex((p) => p.id === promo.id);
    if (idx >= 0) c.promos[idx] = promo;
    else c.promos.push(promo);
    await save(c);
  },

  async deletePromo(id: string): Promise<void> {
    const c = await load();
    c.promos = (c.promos ?? []).filter((p) => p.id !== id);
    await save(c);
  },

  async reorderBaskets(_country: string, orderedIds: string[]): Promise<void> {
    const c = await load();
    orderedIds.forEach((id, i) => {
      const item = c.baskets.find((b) => b.id === id);
      if (item) item.order = i + 1;
    });
    await save(c);
  },

  async reorderMeals(orderedIds: string[]): Promise<void> {
    const c = await load();
    orderedIds.forEach((id, i) => {
      const item = c.meals.find((m) => m.id === id);
      if (item) item.order = i + 1;
    });
    await save(c);
  },
};