import type { HomeCountry } from "./personalization";
import type { Basket } from "./personalization";

export interface CollectionExperience {
  country: HomeCountry;
  collectionHandle: string;
  name: string;
  flagColors: [string, string, string];
  heroTitle: string;
  heroSubtitle: string;
  nativeGreeting: string;
  tagline: string;
  heroImageKey: "hero-uganda" | "hero-kenya" | "hero-ethiopia" | "hero-pan-african";
  cardImageKey: string;
  categories: Array<{ name: string; icon: string }>;
  baskets: Basket[];
  searchSuggestions: string[];
  notificationHint: string;
}

const UGANDA_BASKETS: Basket[] = [
  { id: "ugb1", name: "Matooke Cook-Up", tagline: "Everything for a Sunday matooke feast", items: ["Matooke x2", "Groundnut Paste", "Sukuma Wiki", "Cassava Flour"], price: 59.00, currency: "AED", cardColor: "#4A7A32", lifestyleImageKey: "lifestyle-matooke" },
  { id: "ugb2", name: "Ugandan Family Feast", tagline: "Feed the family, feel at home", items: ["Posho 2kg", "Matooke x3", "G-Nut Soup Mix", "Ugandan Chili Sauce", "Sukuma Wiki x2"], price: 89.00, currency: "AED", cardColor: "#8B5E3C", lifestyleImageKey: "lifestyle-ugali" },
  { id: "ugb3", name: "Weekend Rolex Kit", tagline: "Roll it up the Ugandan way", items: ["Rolex Spice Mix", "Sukuma Wiki", "Groundnut Paste", "Cassava Flour"], price: 42.00, currency: "AED", cardColor: "#C4A24A", lifestyleImageKey: "lifestyle-spices" },
];

const KENYA_BASKETS: Basket[] = [
  { id: "keb1", name: "Kenyan Family Ugali Kit", tagline: "The complete Kenyan dinner, always", items: ["Unga 2kg", "Sukuma Wiki x2", "Royco Mchuzi Mix", "Blue Band"], price: 49.00, currency: "AED", cardColor: "#4A7A32", lifestyleImageKey: "lifestyle-ugali" },
  { id: "keb2", name: "Chai & Chapati Bundle", tagline: "Morning rituals, never missed", items: ["Kenyan Chai Masala", "Blue Band", "Unga 1kg", "Royco Mix"], price: 41.00, currency: "AED", cardColor: "#8B4513", lifestyleImageKey: "lifestyle-coffee" },
  { id: "keb3", name: "Nyama Choma Night", tagline: "For when you need that smoky taste", items: ["Pilau Masala", "Royco Mchuzi Mix", "Githeri Mix", "Chai Masala"], price: 37.00, currency: "AED", cardColor: "#8B3A2A", lifestyleImageKey: "lifestyle-spices" },
];

const ETHIOPIA_BASKETS: Basket[] = [
  { id: "etb1", name: "Coffee Ceremony Kit", tagline: "The full Ethiopian coffee ritual", items: ["Ethiopian Coffee 250g", "Tej Honey Mix", "Teff Flour", "Incense pack"], price: 79.00, currency: "AED", cardColor: "#3D1C0A", lifestyleImageKey: "lifestyle-coffee" },
  { id: "etb2", name: "Tibs Weekend Feast", tagline: "Sizzling tibs, just like Addis", items: ["Berbere x2", "Niter Kibbeh", "Mitmita", "Shiro Powder", "Injera x5"], price: 89.00, currency: "AED", cardColor: "#8B3A1A", lifestyleImageKey: "lifestyle-injera" },
  { id: "etb3", name: "Injera Starter Pack", tagline: "Make injera from scratch", items: ["Teff Flour 1kg", "Shiro Powder", "Berbere", "Niter Kibbeh"], price: 67.00, currency: "AED", cardColor: "#8B6914", lifestyleImageKey: "lifestyle-spices" },
];

const OTHER_BASKETS: Basket[] = [
  { id: "afb1", name: "West African Jollof Night", tagline: "Make the jollof everyone talks about", items: ["Jollof Spice Mix", "Suya Spice", "Palm Oil", "Plantain x2"], price: 49.00, currency: "AED", cardColor: "#C04020", lifestyleImageKey: "lifestyle-spices" },
  { id: "afb2", name: "Pan-African Feast", tagline: "A taste of the whole continent", items: ["Egusi", "Fufu Flour", "Ogbono Seeds", "Stockfish", "Palm Oil"], price: 79.00, currency: "AED", cardColor: "#3A6B2A", lifestyleImageKey: "hero-pan-african" },
  { id: "afb3", name: "African Pantry Staples", tagline: "Never run out of the essentials", items: ["Fufu Flour x2", "Jollof Spice x2", "Palm Oil", "Stockfish"], price: 62.00, currency: "AED", cardColor: "#6B3A1A", lifestyleImageKey: "lifestyle-spices" },
];

const ALL_BASKETS: Basket[] = [UGANDA_BASKETS[0], KENYA_BASKETS[0], ETHIOPIA_BASKETS[0], OTHER_BASKETS[0]];

export const COLLECTION_EXPERIENCES: Record<HomeCountry, CollectionExperience> = {
  uganda: {
    country: "uganda",
    collectionHandle: "uganda-food-staff",
    name: "Uganda",
    flagColors: ["#000000", "#FFCC00", "#DD0000"],
    heroTitle: "Ebyo eby'ewaka.",
    heroSubtitle: "Tastes of home, delivered to you in the UAE.",
    nativeGreeting: "Webale nyo",
    tagline: "Your Ugandan home in Dubai",
    heroImageKey: "hero-uganda",
    cardImageKey: "lifestyle-matooke",
    categories: [
      { name: "Fresh", icon: "leaf" },
      { name: "Staples", icon: "nutrition" },
      { name: "Sauces", icon: "flask" },
      { name: "Spices", icon: "color-palette" },
      { name: "Drinks", icon: "cafe" },
      { name: "Deals", icon: "pricetag" },
    ],
    baskets: UGANDA_BASKETS,
    searchSuggestions: ["matooke", "posho flour", "cassava", "groundnut paste", "sukuma wiki", "rolex spice"],
    notificationHint: "Your matooke is almost out — time to reorder?",
  },
  kenya: {
    country: "kenya",
    collectionHandle: "kenyan-foodstuff",
    name: "Kenya",
    flagColors: ["#006600", "#CC0001", "#000000"],
    heroTitle: "Ladha ya nyumbani.",
    heroSubtitle: "The flavors of home, wherever you are.",
    nativeGreeting: "Karibu nyumbani",
    tagline: "Your Kenyan home in the Gulf",
    heroImageKey: "hero-kenya",
    cardImageKey: "lifestyle-ugali",
    categories: [
      { name: "Flours", icon: "nutrition" },
      { name: "Sauces", icon: "flask" },
      { name: "Dairy", icon: "cafe" },
      { name: "Tea", icon: "cafe" },
      { name: "Legumes", icon: "leaf" },
      { name: "Deals", icon: "pricetag" },
    ],
    baskets: KENYA_BASKETS,
    searchSuggestions: ["unga flour", "royco", "blue band", "kenyan tea", "githeri", "pilau masala"],
    notificationHint: "Don't let the unga run out — reorder now?",
  },
  ethiopia: {
    country: "ethiopia",
    collectionHandle: "ethiopia-food-near-me",
    name: "Ethiopia",
    flagColors: ["#009A44", "#FCDD09", "#EF3340"],
    heroTitle: "Ye ina bet t'aam.",
    heroSubtitle: "Bringing the taste of home to the Gulf.",
    nativeGreeting: "Ina bet yasazinal",
    tagline: "Your Ethiopian home in the UAE",
    heroImageKey: "hero-ethiopia",
    cardImageKey: "lifestyle-injera",
    categories: [
      { name: "Grains", icon: "nutrition" },
      { name: "Spices", icon: "color-palette" },
      { name: "Coffee", icon: "cafe" },
      { name: "Ready", icon: "fast-food" },
      { name: "Sauces", icon: "flask" },
      { name: "Deals", icon: "pricetag" },
    ],
    baskets: ETHIOPIA_BASKETS,
    searchSuggestions: ["teff flour", "injera", "berbere", "shiro", "ethiopian coffee", "niter kibbeh"],
    notificationHint: "Berbere running low — your next tibs night is waiting.",
  },
  other: {
    country: "other",
    collectionHandle: "west-africa",
    name: "Other African Countries",
    flagColors: ["#009A44", "#FCDD09", "#CC0000"],
    heroTitle: "Africa's Finest.",
    heroSubtitle: "Every taste of the continent, in one place.",
    nativeGreeting: "Welcome home",
    tagline: "Your African home in the UAE",
    heroImageKey: "hero-pan-african",
    cardImageKey: "hero-pan-african",
    categories: [
      { name: "West African", icon: "globe" },
      { name: "Grains", icon: "nutrition" },
      { name: "Spices", icon: "color-palette" },
      { name: "Soups", icon: "flask" },
      { name: "Snacks", icon: "fast-food" },
      { name: "Deals", icon: "pricetag" },
    ],
    baskets: OTHER_BASKETS,
    searchSuggestions: ["egusi", "fufu", "jollof spice", "suya", "plantain", "ogbono", "palm oil"],
    notificationHint: "Your egusi is almost out — shop now?",
  },
  all: {
    country: "all",
    collectionHandle: "all-product",
    name: "All of Africa",
    flagColors: ["#C8581C", "#C8581C", "#C8581C"],
    heroTitle: "One App. Every African Kitchen.",
    heroSubtitle: "The whole continent, delivered to your door.",
    nativeGreeting: "Welcome home",
    tagline: "The African diaspora marketplace",
    heroImageKey: "hero-pan-african",
    cardImageKey: "hero-pan-african",
    categories: [
      { name: "Uganda", icon: "leaf" },
      { name: "Kenya", icon: "nutrition" },
      { name: "Ethiopia", icon: "cafe" },
      { name: "West Africa", icon: "globe" },
      { name: "Spices", icon: "color-palette" },
      { name: "Coffee", icon: "cafe" },
    ],
    baskets: ALL_BASKETS,
    searchSuggestions: ["matooke", "unga flour", "injera", "berbere", "jollof spice", "teff", "royco", "egusi"],
    notificationHint: "Explore this week's African deals and bundles",
  },
};
