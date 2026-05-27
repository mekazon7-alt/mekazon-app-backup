export type { ShopifyProduct, ShopifyCollection, ShopifyCollectionSummary, ShopifyMoneyV2 } from "./types";
export { getCollections, getCollectionByHandle, getProductsByCollectionHandle } from "./client";
export { shopifyProductToProduct, shopifyProductsToProducts } from "./transforms";

import type { HomeCountry } from "@/constants/personalization";
import { getProductsByCollectionHandle } from "./client";
import { shopifyProductsToProducts } from "./transforms";
import type { Product } from "@/constants/personalization";

export const COUNTRY_COLLECTION_HANDLES: Record<HomeCountry, string> = {
  uganda: "ugandan-products",
  kenya: "kenyan-products",
  ethiopia: "ethiopian-products",
  other: "other-african-products",
  all: "all-african-products",
};

export async function getProductsForCountry(country: HomeCountry): Promise<Product[]> {
  const handle = COUNTRY_COLLECTION_HANDLES[country];
  const shopifyProducts = await getProductsByCollectionHandle(handle, {
    sortKey: "BEST_SELLING",
    first: 24,
  });
  return shopifyProductsToProducts(shopifyProducts);
}
