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
    buyAgainLabel: "Shop Now",
    exploreLabel: "My Orders",
  },
  kenya: {
    title: "Taste of Nairobi,\nin the Gulf.",
    tagline: "Everything you crave, delivered.",
    buyAgainLabel: "Shop Now",
    exploreLabel: "My Orders",
  },
  ethiopia: {
    title: "Ye ina bet\nt'aam is here.",
    tagline: "Authentic. Sourced. Delivered.",
    buyAgainLabel: "Shop Now",
    exploreLabel: "My Orders",
  },
  other: {
    title: "West Africa\nin the UAE.",
    tagline: "Your favourites, close to home.",
    buyAgainLabel: "Shop Now",
    exploreLabel: "My Orders",
  },
  all: {
    title: "One app.\nEvery African kitchen.",
    tagline: "The whole continent, delivered.",
    buyAgainLabel: "Shop Now",
    exploreLabel: "My Orders",
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
// Meal Recipes — shown when a user taps a Meal Inspiration card
// Edit ingredient lists, steps, and prep info here without changing any code.
// ---------------------------------------------------------------------------
export interface MealRecipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  tip?: string;
}

export const MEAL_RECIPES: Record<string, MealRecipe> = {
  "lifestyle-ugali": {
    name: "Ugali & Sukuma Wiki",
    description: "The ultimate Kenyan and East African comfort meal — dense maize porridge paired with sautéed collard greens. Simple, filling, and deeply nostalgic.",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: "4",
    ingredients: [
      "2 cups maize flour (unga)",
      "4 cups water",
      "1 tsp salt",
      "1 bunch sukuma wiki (collard greens), chopped",
      "1 medium onion, diced",
      "2 tomatoes, chopped",
      "2 tbsp cooking oil",
      "Salt and pepper to taste",
    ],
    steps: [
      "Bring 4 cups of water to a boil in a heavy pot. Add salt.",
      "Gradually add maize flour while stirring constantly to prevent lumps.",
      "Reduce heat to low. Continue stirring for 10–15 minutes until the ugali pulls away from the sides of the pot.",
      "Shape into a mound and cover. Rest for 5 minutes.",
      "In a separate pan, heat oil over medium heat. Fry onions until golden.",
      "Add tomatoes and cook until soft. Season with salt and pepper.",
      "Add chopped sukuma wiki. Stir-fry for 5–7 minutes until wilted but still bright green.",
      "Serve ugali with sukuma wiki on the side.",
    ],
    tip: "Wet your hands before shaping the ugali — it won't stick and you'll get a perfect dome.",
  },
  "lifestyle-injera": {
    name: "Ethiopian Injera Spread",
    description: "A festive Ethiopian sharing platter — spongy sourdough injera topped with colourful wots (stews). The centrepiece of any Ethiopian gathering.",
    prepTime: "20 min (+ 2 days ferment)",
    cookTime: "30 min",
    servings: "4–6",
    ingredients: [
      "2 cups teff flour",
      "2½ cups water",
      "½ tsp salt",
      "250g beef or lentils for tibs/misir wot",
      "3 tbsp berbere spice",
      "2 tbsp niter kibbeh (spiced butter)",
      "1 onion, finely chopped",
      "3 cloves garlic",
      "1 cup shiro powder mixed with water",
    ],
    steps: [
      "Mix teff flour with 2 cups water. Cover and ferment at room temperature for 2 days until bubbly and sour.",
      "Stir in remaining water and salt to make a thin, pourable batter.",
      "Heat a flat non-stick pan on medium-high. Pour batter in a spiral from outside in.",
      "Cover and cook for 2–3 minutes until holes appear on the surface and edges lift. Do not flip.",
      "For berbere wot: fry onion in niter kibbeh until deeply caramelised (20 min), add garlic, then berbere. Add meat or lentils, cover and simmer 25 min.",
      "Prepare shiro wot by cooking shiro paste in water with onion, stirring continuously until thick.",
      "Arrange injera flat and spoon wots on top in separate mounds.",
    ],
    tip: "Injera is best shared — tear a piece and use it to scoop the stews. No utensils needed.",
  },
  "lifestyle-matooke": {
    name: "Ugandan Matooke Feast",
    description: "Steamed green bananas cooked to a soft, golden mash — Uganda's beloved staple. Rich, earthy, and always made with love.",
    prepTime: "20 min",
    cookTime: "45 min",
    servings: "4",
    ingredients: [
      "6–8 unripe matooke (green bananas), peeled",
      "1 cup groundnut (peanut) sauce",
      "500g beef or chicken (optional)",
      "1 onion, sliced",
      "2 tomatoes, chopped",
      "Fresh banana leaves or foil for wrapping",
      "Salt to taste",
    ],
    steps: [
      "Peel matooke wearing gloves to avoid sap stains. Rinse well.",
      "Line a pot with banana leaves. Stack matooke on top and wrap tightly.",
      "Add a little water to the pot base. Steam on low heat for 40–45 minutes until tender.",
      "Mash lightly inside the banana leaf wrapping — traditional matooke stays semi-chunky.",
      "In a separate pan, fry onions until golden. Add tomatoes and cook 5 minutes.",
      "Add meat if using, brown all sides, then cover and simmer 25 minutes.",
      "Stir in groundnut sauce, simmer 5 more minutes.",
      "Serve matooke with the groundnut stew poured over.",
    ],
    tip: "The banana leaves add a subtle sweetness. If you can't find them, wrap in foil — it works beautifully.",
  },
  "lifestyle-coffee": {
    name: "Ethiopian Coffee Ceremony",
    description: "The ancient Ethiopian coffee ritual — roasting, grinding, and brewing fresh beans. More than coffee, it is community, hospitality, and conversation.",
    prepTime: "10 min",
    cookTime: "30 min",
    servings: "4–6 (3 rounds)",
    ingredients: [
      "100g green Ethiopian coffee beans",
      "4 cups water",
      "2–3 tbsp sugar (to taste)",
      "Pinch of cardamom or cinnamon (optional)",
      "Frankincense or incense for atmosphere",
      "Popcorn or kolo (roasted barley) to serve alongside",
    ],
    steps: [
      "Wash the green coffee beans and pat dry.",
      "Roast beans in a dry pan over medium heat, stirring constantly for 10–15 minutes until dark brown and fragrant.",
      "Grind the hot roasted beans in a traditional mortar or coffee grinder.",
      "Add water to a jebena (clay pot) or small saucepan. Bring to a boil.",
      "Add ground coffee. Simmer on low heat for 10 minutes — do not boil hard.",
      "Strain through a fine sieve or coffee filter into small ceramic cups.",
      "The first round (abol) is the strongest. Two more rounds follow with the same grounds.",
      "Serve with sugar and snacks. The ceremony is meant to be slow and social.",
    ],
    tip: "True Ethiopian ceremony has three rounds. Staying for all three is a sign of respect and friendship.",
  },
  "lifestyle-spices": {
    name: "African Spice Blends",
    description: "A guide to the bold, layered spice blends that define African cooking — from Ethiopian berbere to Ugandan rolex spice mix.",
    prepTime: "15 min",
    cookTime: "5 min",
    servings: "Makes ~100g per blend",
    ingredients: [
      "For Berbere: 3 tbsp chili flakes, 1 tbsp paprika, 1 tsp fenugreek, 1 tsp coriander, 1 tsp black pepper, ½ tsp allspice, ½ tsp ginger, pinch of cloves and cinnamon",
      "For Pilau Masala: 2 tbsp cumin, 1 tbsp black pepper, 1 tbsp cardamom, 1 tsp cinnamon, ½ tsp cloves",
      "For Suya Spice: 2 tbsp groundnut powder, 1 tbsp paprika, 1 tsp ginger, 1 tsp garlic powder, salt",
    ],
    steps: [
      "Lightly toast whole spices in a dry pan over low heat for 2–3 minutes until fragrant. Do not burn.",
      "Allow to cool completely before grinding.",
      "Grind toasted spices in a spice grinder or mortar and pestle to a fine powder.",
      "For berbere, mix all ground spices together and store in an airtight jar.",
      "For pilau masala, combine and use immediately or store up to 3 months.",
      "For suya spice, mix all ingredients cold — no toasting needed.",
      "Label each blend with the date. Most blends stay fragrant for 3–6 months.",
    ],
    tip: "Buy whole spices and grind fresh — pre-ground spices lose their potency within weeks.",
  },
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
