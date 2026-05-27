import type { ShopifyProduct } from "./types";
import type { Product } from "@/constants/personalization";

const HANDLE_TO_IMAGE_KEY: Record<string, string> = {
  "royco-mchuzi-mix-200g": "product-royco",
  "unga-maize-flour-2kg": "product-unga",
  "posho-maize-flour-2kg": "product-unga",
  "teff-flour-1kg": "product-teff",
  "berbere-spice-blend-200g": "product-berbere",
  "ethiopian-coffee-yirgacheffe-250g": "product-coffee",
  "matooke-fresh-bunch": "lifestyle-matooke",
  "injera-ready-5pcs": "lifestyle-injera",
  "jollof-spice-mix-200g": "lifestyle-spices",
  "pilau-masala-100g": "lifestyle-spices",
  "mitmita-pepper-100g": "lifestyle-spices",
  "suya-spice-blend-150g": "lifestyle-spices",
};

const TAG_LABELS: Record<string, string> = {
  popular: "Popular",
  "must-have": "Must-Have",
  loved: "Loved",
  staple: "Staple",
  fresh: "Fresh",
  authentic: "Authentic",
  new: "New",
  hot: "Hot",
  bestseller: "Bestseller",
};

const TYPE_COLORS: Record<string, string> = {
  "Flours & Grains": "#C4A24A",
  "Fresh Produce": "#4A7A32",
  "Spices & Seasonings": "#C05020",
  "Condiments": "#8B5E3C",
  "Sauces": "#CC3322",
  "Dairy & Spreads": "#6B8FCC",
  "Beverages": "#8B4513",
  "Coffee & Tea": "#3D1C0A",
  "Legumes & Pulses": "#8B7355",
  "Nuts & Seeds": "#9B7040",
  "Ready Foods": "#C4A86E",
  "Oils & Fats": "#CC5500",
  "Seafood": "#D4C096",
  "Soups & Stews": "#8B5E3C",
  "Specialty": "#D4A800",
};

function resolveTag(tags: string[]): string | undefined {
  for (const tag of tags) {
    const label = TAG_LABELS[tag.toLowerCase()];
    if (label) return label;
  }
  return undefined;
}

function resolveCardColor(productType: string, tags: string[]): string {
  const byType = TYPE_COLORS[productType];
  if (byType) return byType;
  if (tags.includes("fresh")) return "#4A7A32";
  if (tags.includes("spice") || tags.includes("berbere")) return "#C05020";
  if (tags.includes("coffee")) return "#3D1C0A";
  return "#8B7A5C";
}

export function shopifyProductToProduct(item: ShopifyProduct): Product {
  const imageKey = HANDLE_TO_IMAGE_KEY[item.handle];
  const remoteImageUrl =
    !imageKey && item.featuredImage ? item.featuredImage.url : undefined;

  return {
    id: item.id,
    name: item.title,
    description: item.description,
    price: parseFloat(item.priceRange.minVariantPrice.amount),
    currency: item.priceRange.minVariantPrice.currencyCode,
    unit: item.variants.nodes[0]?.title === "Default Title"
      ? ""
      : (item.variants.nodes[0]?.title ?? ""),
    tag: resolveTag(item.tags),
    cardColor: resolveCardColor(item.productType, item.tags),
    imageKey,
    remoteImageUrl,
    shopifyHandle: item.handle,
    variantId: item.variants.nodes[0]?.id,
  };
}

export function shopifyProductsToProducts(items: ShopifyProduct[]): Product[] {
  return items.map(shopifyProductToProduct);
}
