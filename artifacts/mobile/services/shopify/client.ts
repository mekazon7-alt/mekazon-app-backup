import type {
  GetProductsOptions,
  ShopifyCollection,
  ShopifyCollectionSummary,
} from "./types";
import { MOCK_COLLECTIONS, MOCK_COLLECTION_LIST } from "./mock-data";

const SHOPIFY_STORE_DOMAIN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN as string | undefined) ?? "";
const SHOPIFY_STOREFRONT_TOKEN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN as string | undefined) ?? "";

export const USE_MOCK = !SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN;

async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status}`);
  }
  const json = (await response.json()) as { data: T; errors?: unknown[] };
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const COLLECTION_PRODUCTS_QUERY = `
  query CollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          id handle title description productType tags vendor availableForSale
          featuredImage { url altText width height }
          images(first: 3) { nodes { url altText width height } }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          variants(first: 5) {
            nodes { id title availableForSale price { amount currencyCode } }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id handle title description
        image { url altText width height }
        products(first: 1) {
          nodes { id title priceRange { minVariantPrice { amount currencyCode } } featuredImage { url altText width height } }
          pageInfo { hasNextPage }
        }
      }
    }
  }
`;

async function simulateLatency(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 180));
}

export async function getCollections(): Promise<ShopifyCollectionSummary[]> {
  if (USE_MOCK) {
    await simulateLatency();
    return MOCK_COLLECTION_LIST;
  }
  const data = await storefrontFetch<{
    collections: { nodes: ShopifyCollectionSummary[] };
  }>(COLLECTIONS_QUERY, { first: 20 });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string
): Promise<ShopifyCollection | null> {
  if (USE_MOCK) {
    await simulateLatency();
    return MOCK_COLLECTIONS[handle] ?? null;
  }
  const data = await storefrontFetch<{ collection: ShopifyCollection | null }>(
    COLLECTION_PRODUCTS_QUERY,
    { handle, first: 24 }
  );
  return data.collection;
}

export async function getProductsByCollectionHandle(
  handle: string,
  options: GetProductsOptions = {}
): Promise<ShopifyCollection["products"]["nodes"]> {
  if (USE_MOCK) {
    await simulateLatency();
    return MOCK_COLLECTIONS[handle]?.products.nodes ?? [];
  }
  const data = await storefrontFetch<{ collection: ShopifyCollection | null }>(
    COLLECTION_PRODUCTS_QUERY,
    {
      handle,
      first: options.first ?? 24,
      after: options.after ?? null,
      sortKey: options.sortKey ?? "BEST_SELLING",
      reverse: options.reverse ?? false,
    }
  );
  return data.collection?.products.nodes ?? [];
}
