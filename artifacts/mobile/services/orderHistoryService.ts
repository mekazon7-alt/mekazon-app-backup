/**
 * Local Order History Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Stores orders started from this app in AsyncStorage.
 *
 * IMPORTANT — Scope of this feature:
 * This is NOT a full Shopify order history. It records the moment the user
 * taps "Proceed to Checkout" and is redirected to Shopify. We do not know
 * the final status of the order (paid, cancelled, etc.) without connecting
 * to the Shopify Customer Account API or a backend webhook.
 *
 * Labels in the UI must clearly say "Orders started from this app" or
 * "Recent app orders" — never "Order confirmed" or "Order complete".
 *
 * Future integration path:
 *   - Shopify Customer Account API (requires customer login via Shopify OAuth)
 *   - Backend webhook that receives Shopify order webhooks and looks up by phone
 *   - Store phone number at checkout via Shopify cart attributes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@mekazon_order_history";
const MAX_ORDERS = 50;

export interface LocalOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface LocalOrder {
  id: string;
  date: string; // ISO string
  items: LocalOrderItem[];
  subtotal: number;
  vatAmount: number;
  deliveryFee: number | null;
  estimatedTotal: number;
  checkoutUrl: string;
  emirate?: string;
  country?: string;
  /** Always "sent_to_shopify" — we don't know actual Shopify order status */
  status: "sent_to_shopify";
}

export async function saveOrder(order: LocalOrder): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const orders: LocalOrder[] = raw ? JSON.parse(raw) : [];
    orders.unshift(order); // newest first
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(orders.slice(0, MAX_ORDERS)));
  } catch {}
}

export async function loadOrders(): Promise<LocalOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearOrders(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MKZ-${ts}-${rand}`;
}
