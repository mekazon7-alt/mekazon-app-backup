/**
 * Shopify Cart API — Storefront API cart mutations
 *
 * TO CONNECT TO REAL SHOPIFY:
 * Set env vars in your Expo/EAS config:
 *   EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=mekazon.myshopify.com
 *   EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<storefront access token>
 *
 * Orders placed via the Shopify checkoutUrl will appear in Shopify Admin > Orders automatically.
 *
 * PAYMENT METHODS: Cash on Delivery and online payment are configured in Shopify Admin > Payments.
 * The app redirects to Shopify checkout which handles all payment options natively.
 */

const SHOPIFY_STORE_DOMAIN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN as string | undefined) ?? "";
const SHOPIFY_STOREFRONT_TOKEN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN as string | undefined) ?? "";

const USE_MOCK = !SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN;

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
    };
    price: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: ShopifyCartLine[] };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
}

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          product { id title handle }
        }
      }
    }
  }
  cost {
    totalAmount { amount currencyCode }
    subtotalAmount { amount currencyCode }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const ADD_LINES_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const UPDATE_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const REMOVE_LINES_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) { ${CART_FIELDS} }
  }
`;

async function storefrontMutate<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify cart error: ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 120));
}

function mockCart(overrides: Partial<ShopifyCart> = {}): ShopifyCart {
  return {
    id: "gid://shopify/Cart/mock-cart-001",
    checkoutUrl: "https://www.mekazon.com/cart",
    totalQuantity: 0,
    lines: { nodes: [] },
    cost: {
      totalAmount: { amount: "0.00", currencyCode: "AED" },
      subtotalAmount: { amount: "0.00", currencyCode: "AED" },
    },
    ...overrides,
  };
}

export async function createCart(
  lines: Array<{ variantId: string; quantity: number }> = []
): Promise<ShopifyCart> {
  if (USE_MOCK) {
    await simulateLatency();
    return mockCart();
  }
  const data = await storefrontMutate<{
    cartCreate: { cart: ShopifyCart };
  }>(CREATE_CART_MUTATION, {
    input: {
      lines: lines.map(({ variantId, quantity }) => ({
        merchandiseId: variantId,
        quantity,
      })),
    },
  });
  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: Array<{ variantId: string; quantity: number }>
): Promise<ShopifyCart> {
  if (USE_MOCK) {
    await simulateLatency();
    return mockCart({ id: cartId });
  }
  const data = await storefrontMutate<{
    cartLinesAdd: { cart: ShopifyCart };
  }>(ADD_LINES_MUTATION, {
    cartId,
    lines: lines.map(({ variantId, quantity }) => ({
      merchandiseId: variantId,
      quantity,
    })),
  });
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  if (USE_MOCK) {
    await simulateLatency();
    return mockCart({ id: cartId });
  }
  const data = await storefrontMutate<{
    cartLinesUpdate: { cart: ShopifyCart };
  }>(UPDATE_LINES_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  if (USE_MOCK) {
    await simulateLatency();
    return mockCart({ id: cartId });
  }
  const data = await storefrontMutate<{
    cartLinesRemove: { cart: ShopifyCart };
  }>(REMOVE_LINES_MUTATION, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (USE_MOCK) {
    await simulateLatency();
    return mockCart({ id: cartId });
  }
  const data = await storefrontMutate<{ cart: ShopifyCart | null }>(
    GET_CART_QUERY,
    { cartId }
  );
  return data.cart;
}

export async function getCheckoutUrl(
  items: Array<{ variantId: string; quantity: number }>
): Promise<string> {
  if (USE_MOCK) {
    return "https://www.mekazon.com/cart";
  }
  const cart = await createCart(items);
  return cart.checkoutUrl;
}
