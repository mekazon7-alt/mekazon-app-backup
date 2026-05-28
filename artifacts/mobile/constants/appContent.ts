/**
 * appContent.ts — All non-Shopify, editable content for Mekazon
 *
 * WHAT LIVES HERE:
 *   Welcome screen copy, hero banners, trust messages, section titles,
 *   meal inspiration labels, promotional copy, support links.
 *
 * WHAT DOES NOT LIVE HERE:
 *   Products, prices, inventory → Shopify
 *   Baskets, categories, country flag colours → constants/collections.ts
 *
 * WHO EDITS THIS:
 *   Anyone on the team who needs to update marketing copy, images, or
 *   emotional content without touching Shopify or app code logic.
 */

// ---------------------------------------------------------------------------
// Welcome Screen
// ---------------------------------------------------------------------------
export const WELCOME = {
  title: "Your home,\ndelivered.",
  subtitle: "The African diaspora marketplace — built for the UAE.",
  ctaLabel: "Choose your home",
  logoTagline: "Mekazon",
};

// ---------------------------------------------------------------------------
// Hero Banner copy — displayed over the hero image on the home screen
// Each country key matches the HomeCountry type.
// ---------------------------------------------------------------------------
export const HERO_COPY: Record<
  string,
  { title: string; tagline: string; buyAgainLabel: string; exploreLabel: string }
> = {
  uganda: {
    title: "Your home basket\nis ready.",
    tagline: "Food that feels like home.",
    buyAgainLabel: "Buy Again",
    exploreLabel: "Explore",
  },
  kenya: {
    title: "Taste of Nairobi,\nin the Gulf.",
    tagline: "Everything you crave, delivered.",
    buyAgainLabel: "Buy Again",
    exploreLabel: "Explore",
  },
  ethiopia: {
    title: "Ye ina bet\nt'aam is here.",
    tagline: "Authentic. Sourced. Delivered.",
    buyAgainLabel: "Buy Again",
    exploreLabel: "Explore",
  },
  other: {
    title: "West Africa\nin the UAE.",
    tagline: "Your favourites, close to home.",
    buyAgainLabel: "Buy Again",
    exploreLabel: "Explore",
  },
  all: {
    title: "One app.\nEvery African kitchen.",
    tagline: "The whole continent, delivered.",
    buyAgainLabel: "Buy Again",
    exploreLabel: "Explore",
  },
};

// ---------------------------------------------------------------------------
// Trust Bar — shown at the bottom of the home screen
// ---------------------------------------------------------------------------
export const TRUST_ITEMS = [
  { iconName: "shield-checkmark-outline" as const, label: "Quality Guaranteed" },
  { iconName: "flash-outline" as const, label: "Fast Delivery" },
  { iconName: "people-outline" as const, label: "Trusted by Thousands" },
] satisfies Array<{ iconName: string; label: string }>;

// ---------------------------------------------------------------------------
// Section titles and subtitles on the home screen
// ---------------------------------------------------------------------------
export const HOME_SECTIONS = {
  baskets: {
    title: "My Baskets",
    subtitle: (countryName: string) => `Curated for ${countryName}`,
  },
  cravings: {
    title: "Cravings Right Now",
    subtitle: "Popular in your community today",
  },
  mealInspiration: {
    title: "Meal Inspiration",
    subtitle: "Dishes to cook this week",
  },
  madeFor: {
    title: (countryName: string) => `Made for ${countryName}`,
    subtitle: "Authentic, sourced just for you",
  },
};

// ---------------------------------------------------------------------------
// Meal Inspiration — labels for each lifestyle image key
// ---------------------------------------------------------------------------
export const MEAL_INSPIRATION_LABELS: Record<string, string> = {
  "lifestyle-ugali": "Ugali & Sukuma Wiki",
  "lifestyle-injera": "Ethiopian Injera Spread",
  "lifestyle-matooke": "Ugandan Matooke Feast",
  "lifestyle-coffee": "Ethiopian Coffee Ceremony",
  "lifestyle-spices": "African Spice Selection",
};

// ---------------------------------------------------------------------------
// Announcement Banner (optional — set to null to hide)
// ---------------------------------------------------------------------------
export const ANNOUNCEMENT_BANNER: {
  message: string;
  ctaLabel?: string;
  ctaRoute?: string;
} | null = null;
// Example:
// export const ANNOUNCEMENT_BANNER = {
//   message: "Free delivery this weekend on orders over AED 80",
//   ctaLabel: "Shop now",
//   ctaRoute: "/(tabs)/search",
// };

// ---------------------------------------------------------------------------
// App-wide legal / support links
// ---------------------------------------------------------------------------
export const APP_LINKS = {
  privacyPolicy: "https://mekazon.com/privacy",
  termsOfService: "https://mekazon.com/terms",
  supportWhatsApp: "https://wa.me/971XXXXXXXXX",
  supportEmail: "support@mekazon.com",
  website: "https://mekazon.com",
};

// ---------------------------------------------------------------------------
// Onboarding language selection screen
// ---------------------------------------------------------------------------
export const LANGUAGE_SCREEN = {
  title: "Choose your language",
  subtitle: "You can change this at any time in your profile.",
  skipLabel: "Skip",
  continueLabel: "Continue",
};

// ---------------------------------------------------------------------------
// Empty state copy
// ---------------------------------------------------------------------------
export const EMPTY_STATES = {
  cart: {
    title: "Your cart is empty",
    subtitle: "Add something delicious from the home screen.",
  },
  orders: {
    title: "No orders yet",
    subtitle: "Your order history will appear here once you place your first order.",
  },
  search: {
    title: "Nothing found",
    subtitle: "Try a different search or browse your country's collection.",
  },
};

// ---------------------------------------------------------------------------
// Cart screen
// ---------------------------------------------------------------------------
export const CART_CONTENT = {
  deliveryNote: "Delivery fee calculated at checkout",
  checkoutDisclaimer: "Payment processed securely via Shopify. Cash on delivery available.",
};
