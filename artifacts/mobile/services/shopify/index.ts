export type { ShopifyProduct, ShopifyCollection, ShopifyCollectionSummary, ShopifyMoneyV2 } from "./types";
export { getCollections, getCollectionByHandle, getProductsByCollectionHandle } from "./client";
export { shopifyProductToProduct, shopifyProductsToProducts } from "./transforms";

import type { HomeCountry } from "@/constants/personalization";
import { getProductsByCollectionHandle } from "./client";
import { shopifyProductsToProducts } from "./transforms";
import type { Product } from "@/constants/personalization";

// ---------------------------------------------------------------------------
// Collection handle mapping — edit these to match your Shopify collection URLs
// Each value is the "handle" shown in: Shopify Admin → Products → Collections → [collection] → URL
// ---------------------------------------------------------------------------
export const COUNTRY_COLLECTION_HANDLES: Record<HomeCountry, string> = {
  uganda:   "uganda-food-staff",
  kenya:    "kenyan-foodstuff",
  ethiopia: "ethiopia-food-near-me",
  other:    "west-africa",
  all:      "all-product",
};

export async function getProductsForCountry(country: HomeCountry): Promise<Product[]> {
  const handle = COUNTRY_COLLECTION_HANDLES[country];
  const shopifyProducts = await getProductsByCollectionHandle(handle, {
    sortKey: "BEST_SELLING",
    first: 24,
  });
  return shopifyProductsToProducts(shopifyProducts);
}
