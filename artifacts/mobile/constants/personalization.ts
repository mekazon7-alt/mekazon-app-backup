export type HomeCountry = "uganda" | "kenya" | "ethiopia" | "other" | "all";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  tag?: string;
  cardColor: string;
}

export interface Basket {
  id: string;
  name: string;
  tagline: string;
  items: string[];
  price: number;
  currency: string;
  cardColor: string;
}

export interface CountryConfig {
  id: HomeCountry;
  name: string;
  flagColors: [string, string, string];
  heroTitle: string;
  heroSubtitle: string;
  nativeGreeting: string;
  tagline: string;
  categories: string[];
  products: Product[];
  baskets: Basket[];
  searchSuggestions: string[];
  notificationHint: string;
  heroImageKey: "hero-uganda" | "hero-kenya" | "hero-ethiopia" | "hero-pan-african";
}

const UGANDA: CountryConfig = {
  id: "uganda",
  name: "Uganda",
  flagColors: ["#000000", "#FFCC00", "#DD0000"],
  heroTitle: "Ebyo eby'ewaka.",
  heroSubtitle: "Tastes of home, delivered to you in the UAE.",
  nativeGreeting: "Webale nyo",
  tagline: "Your Ugandan home in Dubai",
  categories: ["Starchy Staples", "Sauces & Pastes", "Fresh Produce", "Spices", "Grains & Flours", "Drinks"],
  products: [
    { id: "ug1", name: "Matooke Bunches", description: "Fresh green cooking bananas, unripe", price: 18.50, currency: "AED", unit: "per bunch", tag: "Popular", cardColor: "#3D6B2C" },
    { id: "ug2", name: "Posho (Maize Flour)", description: "Finest white maize flour, 2kg", price: 12.00, currency: "AED", unit: "2kg bag", tag: "Staple", cardColor: "#C4A24A" },
    { id: "ug3", name: "Cassava Flour", description: "Sun-dried cassava, stone-ground", price: 14.00, currency: "AED", unit: "1kg", cardColor: "#D4B896" },
    { id: "ug4", name: "Groundnut Paste", description: "Pure roasted groundnut paste, no additives", price: 16.00, currency: "AED", unit: "500g jar", tag: "Loved", cardColor: "#8B5E3C" },
    { id: "ug5", name: "Sukuma Wiki", description: "Fresh African kale, packed", price: 8.00, currency: "AED", unit: "per pack", cardColor: "#2D7A2D" },
    { id: "ug6", name: "Rolex Spice Mix", description: "Authentic Ugandan Rolex seasoning blend", price: 9.50, currency: "AED", unit: "100g", tag: "New", cardColor: "#B85C30" },
    { id: "ug7", name: "Ugandan Chili Sauce", description: "Hot & smoky traditional chili sauce", price: 11.00, currency: "AED", unit: "250ml bottle", cardColor: "#C03030" },
    { id: "ug8", name: "G-Nut Soup Mix", description: "Ready groundnut soup powder", price: 13.00, currency: "AED", unit: "200g", cardColor: "#9B7040" },
  ],
  baskets: [
    { id: "ugb1", name: "Matooke Cook-Up", tagline: "Everything for a Sunday matooke feast", items: ["Matooke x2", "Groundnut Paste", "Sukuma Wiki", "Cassava Flour"], price: 59.00, currency: "AED", cardColor: "#3D6B2C" },
    { id: "ugb2", name: "Ugandan Family Feast", tagline: "Feed the family, feel at home", items: ["Posho 2kg", "Matooke x3", "G-Nut Soup Mix", "Ugandan Chili Sauce", "Sukuma Wiki x2"], price: 89.00, currency: "AED", cardColor: "#8B5E3C" },
    { id: "ugb3", name: "Weekend Rolex Kit", tagline: "Roll it up the Ugandan way", items: ["Rolex Spice Mix", "Sukuma Wiki", "Groundnut Paste", "Cassava Flour"], price: 42.00, currency: "AED", cardColor: "#C4A24A" },
  ],
  searchSuggestions: ["matooke", "posho flour", "cassava", "groundnut paste", "sukuma wiki", "rolex spice", "matoke bunches", "ugali"],
  notificationHint: "Your matooke is almost out — time to reorder?",
  heroImageKey: "hero-uganda",
};

const KENYA: CountryConfig = {
  id: "kenya",
  name: "Kenya",
  flagColors: ["#006600", "#CC0001", "#000000"],
  heroTitle: "Ladha ya nyumbani.",
  heroSubtitle: "The flavors of home, wherever you are.",
  nativeGreeting: "Asante sana",
  tagline: "Your Kenyan home in the Gulf",
  categories: ["Flours & Grains", "Sauces & Seasonings", "Dairy & Spreads", "Tea & Beverages", "Legumes", "Snacks"],
  products: [
    { id: "ke1", name: "Unga (Maize Flour)", description: "Premium Kenyan white maize flour", price: 13.50, currency: "AED", unit: "2kg bag", tag: "Staple", cardColor: "#C4A24A" },
    { id: "ke2", name: "Royco Mchuzi Mix", description: "Authentic Kenyan cooking spice blend", price: 8.00, currency: "AED", unit: "200g", tag: "Must-Have", cardColor: "#CC4422" },
    { id: "ke3", name: "Blue Band Margarine", description: "Original Kenyan Blue Band spread", price: 14.00, currency: "AED", unit: "500g", tag: "Loved", cardColor: "#3366CC" },
    { id: "ke4", name: "Kenyan Chai Masala", description: "Spiced tea blend with cardamom & ginger", price: 11.00, currency: "AED", unit: "100g tin", cardColor: "#8B4513" },
    { id: "ke5", name: "Githeri Mix", description: "Maize & beans, pre-soaked and ready", price: 9.50, currency: "AED", unit: "500g", cardColor: "#8B7355" },
    { id: "ke6", name: "Pilau Masala", description: "Kenyan pilau spice blend, fragrant & bold", price: 10.00, currency: "AED", unit: "100g", tag: "New", cardColor: "#C05020" },
    { id: "ke7", name: "Sukuma Wiki", description: "Fresh African kale, packed crisp", price: 8.00, currency: "AED", unit: "per pack", cardColor: "#2D7A2D" },
    { id: "ke8", name: "Mursik (Sour Milk Powder)", description: "Kalenjin-style fermented milk powder", price: 19.00, currency: "AED", unit: "300g", cardColor: "#D4C0A0" },
  ],
  baskets: [
    { id: "keb1", name: "Kenyan Family Ugali Kit", tagline: "The complete Kenyan dinner, always", items: ["Unga 2kg", "Sukuma Wiki x2", "Royco Mchuzi Mix", "Blue Band"], price: 49.00, currency: "AED", cardColor: "#3D6B2C" },
    { id: "keb2", name: "Chai & Chapati Bundle", tagline: "Morning rituals, never missed", items: ["Kenyan Chai Masala", "Blue Band", "Unga 1kg", "Royco Mix"], price: 41.00, currency: "AED", cardColor: "#8B4513" },
    { id: "keb3", name: "Nyama Choma Night", tagline: "For when you need that smoky taste", items: ["Pilau Masala", "Royco Mchuzi Mix", "Githeri Mix", "Chai Masala"], price: 37.00, currency: "AED", cardColor: "#8B3A2A" },
  ],
  searchSuggestions: ["unga flour", "royco", "blue band", "kenyan tea", "githeri", "pilau masala", "sukuma wiki", "mursik"],
  notificationHint: "Don't let the unga run out — reorder now?",
  heroImageKey: "hero-kenya",
};

const ETHIOPIA: CountryConfig = {
  id: "ethiopia",
  name: "Ethiopia",
  flagColors: ["#009A44", "#FCDD09", "#EF3340"],
  heroTitle: "Ye ina bet t'aam.",
  heroSubtitle: "Bringing the taste of home to the Gulf.",
  nativeGreeting: "Ameseginalehu",
  tagline: "Your Ethiopian home in the UAE",
  categories: ["Flours & Grains", "Spices & Berbere", "Coffee & Drinks", "Ready Foods", "Sauces & Oils", "Ceremonial"],
  products: [
    { id: "et1", name: "Teff Flour", description: "Premium white & brown teff, for injera", price: 22.00, currency: "AED", unit: "1kg", tag: "Authentic", cardColor: "#8B6914" },
    { id: "et2", name: "Injera (Ready)", description: "Freshly made injera, same-day delivery", price: 28.00, currency: "AED", unit: "5 pieces", tag: "Fresh", cardColor: "#C4A86E" },
    { id: "et3", name: "Berbere Spice Blend", description: "Bold Ethiopian berbere, 12-spice mix", price: 15.00, currency: "AED", unit: "200g", tag: "Must-Have", cardColor: "#CC2200" },
    { id: "et4", name: "Shiro Powder", description: "Roasted chickpea powder for shiro stew", price: 14.00, currency: "AED", unit: "500g", cardColor: "#C4944A" },
    { id: "et5", name: "Ethiopian Coffee", description: "Single-origin Yirgacheffe beans, whole", price: 35.00, currency: "AED", unit: "250g bag", tag: "Loved", cardColor: "#3D1C0A" },
    { id: "et6", name: "Niter Kibbeh", description: "Spiced Ethiopian clarified butter", price: 18.00, currency: "AED", unit: "300g jar", cardColor: "#D4A020" },
    { id: "et7", name: "Mitmita Pepper", description: "Hot Ethiopian bird's eye chili powder", price: 12.00, currency: "AED", unit: "100g", cardColor: "#C03030" },
    { id: "et8", name: "Tej (Honey Wine Mix)", description: "Ethiopian honey wine brewing kit", price: 32.00, currency: "AED", unit: "kit", tag: "New", cardColor: "#D4A800" },
  ],
  baskets: [
    { id: "etb1", name: "Coffee Ceremony Kit", tagline: "The full Ethiopian coffee ritual", items: ["Ethiopian Coffee 250g", "Tej Honey Mix", "Teff Flour", "Incense pack"], price: 79.00, currency: "AED", cardColor: "#3D1C0A" },
    { id: "etb2", name: "Tibs Weekend Feast", tagline: "Sizzling tibs, just like Addis", items: ["Berbere x2", "Niter Kibbeh", "Mitmita", "Shiro Powder", "Injera x5"], price: 89.00, currency: "AED", cardColor: "#8B3A1A" },
    { id: "etb3", name: "Injera Starter Pack", tagline: "Make injera from scratch", items: ["Teff Flour 1kg", "Shiro Powder", "Berbere", "Niter Kibbeh"], price: 67.00, currency: "AED", cardColor: "#8B6914" },
  ],
  searchSuggestions: ["teff flour", "injera", "berbere", "shiro", "ethiopian coffee", "niter kibbeh", "mitmita", "yirgacheffe"],
  notificationHint: "Berbere running low — your next tibs night is waiting.",
  heroImageKey: "hero-ethiopia",
};

const OTHER: CountryConfig = {
  id: "other",
  name: "African Countries",
  flagColors: ["#009A44", "#FCDD09", "#CC0000"],
  heroTitle: "Africa's Finest.",
  heroSubtitle: "Every taste of the continent, in one place.",
  nativeGreeting: "Welcome home",
  tagline: "Your African home in the UAE",
  categories: ["West African", "East African", "North African", "Grains & Flours", "Spices", "Drinks"],
  products: [
    { id: "af1", name: "Egusi (Melon Seeds)", description: "Dried melon seeds for Nigerian soups", price: 16.00, currency: "AED", unit: "500g", tag: "Popular", cardColor: "#C4A24A" },
    { id: "af2", name: "Fufu Flour", description: "West African cassava & plantain blend", price: 14.00, currency: "AED", unit: "1kg", cardColor: "#D4C08A" },
    { id: "af3", name: "Jollof Spice Mix", description: "West African jollof rice seasoning", price: 10.00, currency: "AED", unit: "200g", tag: "Loved", cardColor: "#C04020" },
    { id: "af4", name: "Suya Spice Blend", description: "Northern Nigerian grilling spice", price: 11.00, currency: "AED", unit: "150g", tag: "Hot", cardColor: "#CC5522" },
    { id: "af5", name: "Plantain (Unripe)", description: "Green plantains for kelewele & chips", price: 12.00, currency: "AED", unit: "per bunch", cardColor: "#4A7A20" },
    { id: "af6", name: "Ogbono Seeds", description: "African mango seeds for draw soup", price: 18.00, currency: "AED", unit: "200g", cardColor: "#6B3A1A" },
    { id: "af7", name: "Stockfish (Panla)", description: "Norwegian dried cod, African style", price: 24.00, currency: "AED", unit: "per piece", cardColor: "#D4C096" },
    { id: "af8", name: "Palm Oil (Zomi)", description: "Red palm oil, unrefined Ghanaian style", price: 15.00, currency: "AED", unit: "500ml", cardColor: "#CC5500" },
  ],
  baskets: [
    { id: "afb1", name: "West African Jollof Night", tagline: "Make the jollof everyone talks about", items: ["Jollof Spice Mix", "Suya Spice", "Palm Oil", "Plantain x2"], price: 49.00, currency: "AED", cardColor: "#C04020" },
    { id: "afb2", name: "Pan-African Feast", tagline: "A taste of the whole continent", items: ["Egusi", "Fufu Flour", "Ogbono Seeds", "Stockfish", "Palm Oil"], price: 79.00, currency: "AED", cardColor: "#3A6B2A" },
    { id: "afb3", name: "African Pantry Staples", tagline: "Never run out of the essentials", items: ["Fufu Flour x2", "Jollof Spice x2", "Palm Oil", "Stockfish"], price: 62.00, currency: "AED", cardColor: "#6B3A1A" },
  ],
  searchSuggestions: ["egusi", "fufu", "jollof spice", "suya", "plantain", "ogbono", "stockfish", "palm oil"],
  notificationHint: "Your egusi is almost out — shop now?",
  heroImageKey: "hero-pan-african",
};

const ALL: CountryConfig = {
  id: "all",
  name: "All of Africa",
  flagColors: ["#009A44", "#FCDD09", "#CC0000"],
  heroTitle: "One App. Every African Kitchen.",
  heroSubtitle: "The whole continent, delivered to your door.",
  nativeGreeting: "Welcome",
  tagline: "The African diaspora marketplace",
  categories: ["Uganda", "Kenya", "Ethiopia", "West Africa", "North Africa", "Coffee & Tea"],
  products: [
    ...UGANDA.products.slice(0, 2),
    ...KENYA.products.slice(0, 2),
    ...ETHIOPIA.products.slice(0, 2),
    ...OTHER.products.slice(0, 2),
  ],
  baskets: [
    UGANDA.baskets[0],
    KENYA.baskets[0],
    ETHIOPIA.baskets[0],
    OTHER.baskets[0],
  ],
  searchSuggestions: ["matooke", "unga flour", "injera", "berbere", "jollof spice", "teff", "royco", "egusi"],
  notificationHint: "Explore this week's African deals and bundles",
  heroImageKey: "hero-pan-african",
};

export const COUNTRY_CONFIGS: Record<HomeCountry, CountryConfig> = {
  uganda: UGANDA,
  kenya: KENYA,
  ethiopia: ETHIOPIA,
  other: OTHER,
  all: ALL,
};

export const ONBOARDING_OPTIONS: Array<{
  id: HomeCountry;
  name: string;
  subtitle: string;
  flagColors: [string, string, string];
}> = [
  { id: "uganda", name: "Uganda", subtitle: "Matooke, posho, groundnuts, sukuma wiki", flagColors: ["#000000", "#FFCC00", "#DD0000"] },
  { id: "kenya", name: "Kenya", subtitle: "Unga, Royco, Blue Band, Kenyan tea, ugali", flagColors: ["#006600", "#CC0001", "#000000"] },
  { id: "ethiopia", name: "Ethiopia", subtitle: "Injera, teff, berbere, coffee, shiro", flagColors: ["#009A44", "#FCDD09", "#EF3340"] },
  { id: "other", name: "Other African Countries", subtitle: "Egusi, fufu, jollof, suya, plantain", flagColors: ["#009A44", "#FCDD09", "#CC0000"] },
  { id: "all", name: "Show Me Everything", subtitle: "All African foods, no filter", flagColors: ["#F5C400", "#F5C400", "#F5C400"] },
];
