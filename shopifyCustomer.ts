/**
 * Shopify customer link + order history (best-effort).
 * ─────────────────────────────────────────────────────────────────────────────
 * After a phone number is verified, we tie it to a Shopify customer record so
 * the app can show order history, re-order, and saved addresses from Shopify.
 *
 * Requires an Admin API access token (separate from the Storefront token):
 *   SHOPIFY_STORE_DOMAIN        — e.g. bbpdqw-tj.myshopify.com
 *   SHOPIFY_ADMIN_API_TOKEN     — Admin API access token (secret)
 *   SHOPIFY_ADMIN_API_VERSION   — optional, defaults to 2024-10
 *
 * This is intentionally non-blocking: if it isn't configured or fails, OTP login
 * still succeeds; we just don't attach a Shopify customer id or order history.
 *
 * NOTE on phone → orders: the Admin API can't filter ORDERS by phone directly.
 * The reliable path is phone → CUSTOMER (searchable by phone) → that customer's
 * orders. Pure guest checkouts that never attach to a customer record can't be
 * found this way; that's a known limitation, documented here on purpose.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORE_DOMAIN = process.env["SHOPIFY_STORE_DOMAIN"] ?? "";
const ADMIN_TOKEN = process.env["SHOPIFY_ADMIN_API_TOKEN"] ?? "";
const API_VERSION = process.env["SHOPIFY_ADMIN_API_VERSION"] ?? "2024-10";

export const SHOPIFY_ADMIN_CONFIGURED = Boolean(STORE_DOMAIN && ADMIN_TOKEN);

export interface ShopifyCustomerRef {
  id: string;
  phone: string | null;
  displayName?: string | null;
  email?: string | null;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variantId: string | null;
  price: number;
}

export interface OrderSummary {
  id: string;
  name: string; // e.g. "#1042"
  processedAt: string; // ISO date
  financialStatus: string; // e.g. "PAID"
  fulfillmentStatus: string; // e.g. "FULFILLED"
  currency: string; // e.g. "AED"
  total: number;
  items: OrderLineItem[];
}

async function adminGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/** Find a customer by phone, or create one. Returns null when Admin API isn't configured. */
export async function findOrCreateCustomerByPhone(
  phone: string,
): Promise<ShopifyCustomerRef | null> {
  if (!SHOPIFY_ADMIN_CONFIGURED) return null;

  const found = await findCustomerByPhone(phone);
  if (found) return found;

  const created = await adminGraphql<{
    customerCreate: {
      customer: ShopifyCustomerRef | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation CreateCustomer($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id phone displayName email }
        userErrors { message }
      }
    }`,
    { input: { phone } },
  );
  return created.customerCreate.customer;
}

/** Look up a customer by phone (no create). Returns null if none / not configured. */
export async function findCustomerByPhone(
  phone: string,
): Promise<ShopifyCustomerRef | null> {
  if (!SHOPIFY_ADMIN_CONFIGURED) return null;
  const search = await adminGraphql<{
    customers: { edges: { node: ShopifyCustomerRef }[] };
  }>(
    `query FindCustomer($q: String!) {
      customers(first: 1, query: $q) {
        edges { node { id phone displayName email } }
      }
    }`,
    { q: `phone:${phone}` },
  );
  return search.customers.edges[0]?.node ?? null;
}

interface RawOrderNode {
  id: string;
  name: string;
  processedAt: string;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: { id: string } | null;
        originalUnitPriceSet: { shopMoney: { amount: string } };
      };
    }[];
  };
}

function mapOrder(node: RawOrderNode): OrderSummary {
  return {
    id: node.id,
    name: node.name,
    processedAt: node.processedAt,
    financialStatus: node.displayFinancialStatus ?? "UNKNOWN",
    fulfillmentStatus: node.displayFulfillmentStatus ?? "UNFULFILLED",
    currency: node.currentTotalPriceSet.shopMoney.currencyCode,
    total: Number(node.currentTotalPriceSet.shopMoney.amount) || 0,
    items: node.lineItems.edges.map((e) => ({
      title: e.node.title,
      quantity: e.node.quantity,
      variantId: e.node.variant?.id ?? null,
      price: Number(e.node.originalUnitPriceSet.shopMoney.amount) || 0,
    })),
  };
}

const ORDER_FIELDS = `
  id
  name
  processedAt
  displayFinancialStatus
  displayFulfillmentStatus
  currentTotalPriceSet { shopMoney { amount currencyCode } }
  lineItems(first: 50) {
    edges {
      node {
        title
        quantity
        variant { id }
        originalUnitPriceSet { shopMoney { amount } }
      }
    }
  }
`;

/** Fetch recent orders for a Shopify customer GID. */
export async function getOrdersForCustomer(
  customerId: string,
  limit = 20,
): Promise<OrderSummary[]> {
  if (!SHOPIFY_ADMIN_CONFIGURED) return [];
  const data = await adminGraphql<{
    customer: { orders: { edges: { node: RawOrderNode }[] } } | null;
  }>(
    `query CustomerOrders($id: ID!, $n: Int!) {
      customer(id: $id) {
        orders(first: $n, reverse: true, sortKey: PROCESSED_AT) {
          edges { node { ${ORDER_FIELDS} } }
        }
      }
    }`,
    { id: customerId, n: limit },
  );
  const edges = data.customer?.orders.edges ?? [];
  return edges.map((e) => mapOrder(e.node));
}

/**
 * Convenience: phone → customer → orders. Falls back to an empty list when the
 * Admin API isn't configured, the phone has no customer, or it has no orders.
 */
export async function getRecentOrdersByPhone(
  phone: string,
  limit = 20,
): Promise<OrderSummary[]> {
  if (!SHOPIFY_ADMIN_CONFIGURED) return [];
  const customer = await findCustomerByPhone(phone);
  if (!customer) return [];
  return getOrdersForCustomer(customer.id, limit);
}