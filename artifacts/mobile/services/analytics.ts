/**
 * Mekazon Analytics Service
 *
 * Buffers events locally in AsyncStorage and logs them in dev.
 * When you have developer accounts and EAS set up:
 *
 *   FIREBASE SETUP STEPS:
 *   1. Go to console.firebase.google.com → New project → "Mekazon"
 *   2. Add iOS app (bundle ID: com.mekazon.app) → download GoogleService-Info.plist
 *   3. Add Android app (package: com.mekazon.app) → download google-services.json
 *   4. Place both files in artifacts/mobile/
 *   5. pnpm --filter @workspace/mobile add @react-native-firebase/app @react-native-firebase/analytics
 *   6. Uncomment the Firebase block in track() below
 *   7. Firebase console → Integrations → Link to Google Analytics → pick your GA4 property
 *      → all events will then appear in your existing Google Analytics dashboard
 *
 * Event names follow GA4 standard ecommerce naming so they map automatically.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@mekazon_analytics_queue";
const MAX_QUEUE = 200;

export type AnalyticsEvent =
  | { name: "screen_view"; params: { screen_name: string; screen_class?: string } }
  | { name: "select_item"; params: { item_id: string; item_name: string; item_category: string } }
  | { name: "add_to_cart"; params: { item_id: string; item_name: string; price: number; currency: string; quantity: number } }
  | { name: "remove_from_cart"; params: { item_id: string; item_name: string } }
  | { name: "begin_checkout"; params: { value: number; currency: string; num_items: number } }
  | { name: "search"; params: { search_term: string } }
  | { name: "select_promotion"; params: { promotion_id: string; promotion_name: string } }
  | { name: "select_country"; params: { country: string; source: "onboarding" | "profile" } }
  | { name: "basket_view"; params: { basket_id: string; basket_name: string; country: string } }
  | { name: "meal_view"; params: { meal_id: string; meal_name: string } }
  | { name: "login"; params: { method: string } }
  | { name: "sign_up"; params: { method: string } }
  | { name: "tutorial_complete"; params: Record<string, never> };

type QueuedEvent = AnalyticsEvent & { ts: number };

async function enqueue(event: AnalyticsEvent): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedEvent[] = raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
    queue.push({ ...event, ts: Date.now() });
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // analytics must never throw
  }
}

async function track(event: AnalyticsEvent): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics] ${event.name}`, event.params);
  }

  // ── Uncomment after EAS + Firebase setup ──────────────────────────────────
  // import analytics from "@react-native-firebase/analytics";
  // try { await analytics().logEvent(event.name, event.params as Record<string, string | number>); } catch {}
  // ──────────────────────────────────────────────────────────────────────────

  await enqueue(event);
}

/** Read and clear the local queue (for future server-side sync) */
export async function flushAnalyticsQueue(): Promise<QueuedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const queue = JSON.parse(raw) as QueuedEvent[];
    await AsyncStorage.removeItem(QUEUE_KEY);
    return queue;
  } catch {
    return [];
  }
}

/** Import Analytics in any screen to track events */
export const Analytics = {
  screenView: (name: string, cls?: string) =>
    track({ name: "screen_view", params: { screen_name: name, screen_class: cls } }),

  addToCart: (itemId: string, itemName: string, price: number, currency = "AED", qty = 1) =>
    track({ name: "add_to_cart", params: { item_id: itemId, item_name: itemName, price, currency, quantity: qty } }),

  removeFromCart: (itemId: string, itemName: string) =>
    track({ name: "remove_from_cart", params: { item_id: itemId, item_name: itemName } }),

  beginCheckout: (value: number, numItems: number, currency = "AED") =>
    track({ name: "begin_checkout", params: { value, currency, num_items: numItems } }),

  search: (term: string) =>
    track({ name: "search", params: { search_term: term } }),

  promoClick: (id: string, name: string) =>
    track({ name: "select_promotion", params: { promotion_id: id, promotion_name: name } }),

  selectCountry: (country: string, source: "onboarding" | "profile") =>
    track({ name: "select_country", params: { country, source } }),

  basketView: (id: string, name: string, country: string) =>
    track({ name: "basket_view", params: { basket_id: id, basket_name: name, country } }),

  mealView: (id: string, name: string) =>
    track({ name: "meal_view", params: { meal_id: id, meal_name: name } }),

  login: (method = "otp") =>
    track({ name: "login", params: { method } }),

  signUp: (method = "otp") =>
    track({ name: "sign_up", params: { method } }),

  onboardingComplete: () =>
    track({ name: "tutorial_complete", params: {} }),

  selectItem: (id: string, name: string, category: string) =>
    track({ name: "select_item", params: { item_id: id, item_name: name, item_category: category } }),
};
