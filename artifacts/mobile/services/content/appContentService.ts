import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppContentData, AdminBasket, AdminMeal, AdminCategory, AdminHero } from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";
import { DEFAULT_APP_CONTENT } from "./defaultContent";

const STORAGE_KEY = "@mekazon_admin_content";

const CURRENT_VERSION = DEFAULT_APP_CONTENT.version;

/** Safely resolve countries array — handles legacy `country` string field from older saved data */
function resolveCountries(item: any): string[] {
  if (Array.isArray(item.countries) && item.countries.length > 0) return item.countries;
  if (typeof item.country === "string") return [item.country];
  return ["all"];
}

async function load(): Promise<AppContentData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppContentData;
      if ((parsed.version ?? 0) >= CURRENT_VERSION) return parsed;

      // v4 → v5: multi-country arrays — preserve all content, convert country string → countries array
      if ((parsed.version ?? 0) === 4) {
        const migrated: AppContentData = {
          ...parsed,
          baskets: (parsed.baskets as any[]).map((b) => ({ ...b, countries: resolveCountries(b) })),
          meals: (parsed.meals as any[]).map((m) => ({ ...m, countries: resolveCountries(m) })),
          categories: (parsed.categories as any[]).map((c) => ({ ...c, countries: resolveCountries(c) })),
          promos: ((parsed as any).promos ?? DEFAULT_APP_CONTENT.promos).map((p: any) => ({ ...p, countries: resolveCountries(p) })),
          version: 5,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }

      // v3 → v5: also inject promos + convert countries
      if ((parsed.version ?? 0) === 3) {
        const migrated: AppContentData = {
          ...parsed,
          baskets: (parsed.baskets as any[]).map((b) => ({ ...b, countries: resolveCountries(b) })),
          meals: (parsed.meals as any[]).map((m) => ({ ...m, countries: resolveCountries(m) })),
          categories: (parsed.categories as any[]).map((c) => ({ ...c, countries: resolveCountries(c) })),
          promos: DEFAULT_APP_CONTENT.promos,
          version: 5,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }

      // Older versions: full reset to defaults
    }
  } catch {
    // fall through to defaults
  }
  return { ...DEFAULT_APP_CONTENT };
}

async function save(content: AppContentData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function matchesCountry(countries: string[], target: HomeCountry): boolean {
  return countries.includes(target) || countries.includes("all");
}

export const appContentService = {
  getContent: load,
  saveContent: save,

  async resetContent(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
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

  async reorderBaskets(country: string, orderedIds: string[]): Promise<void> {
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
