/**
 * Auth Service — Phone OTP via the Mekazon api-server (Twilio Verify).
 * ─────────────────────────────────────────────────────────────────────────────
 * sendOTP/verifyOTP call our backend, which talks to Twilio Verify server-side
 * (the Twilio secret never lives in the app bundle).
 *
 * verifyOTP now returns the linked Shopify customer id + a signed session token.
 * The token is stored with the session and sent on order-history requests, so
 * the backend can trust the caller without the app holding any Shopify secret.
 *
 * Configure the backend URL with EXPO_PUBLIC_API_URL (e.g. https://api.mekazon.com).
 * If it is not set, we fall back to a DEV-only mock that accepts "123456" so the
 * app stays testable in preview before the backend is deployed.
 *
 * Session is stored in AsyncStorage (device-local).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, UserProfile } from "@/types/user";

const SESSION_KEY = "@mekazon_auth_session";
const DEV_FALLBACK_OTP = "123456";
const API_URL = (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? "";

let _pendingPhone = "";

export function setPendingPhone(phone: string) {
  _pendingPhone = phone;
}

export function getPendingPhone(): string {
  return _pendingPhone;
}

/** Result of a verify attempt. */
export interface VerifyResult {
  valid: boolean;
  shopifyCustomerId: string | null;
  token: string | null;
}

/** A real Shopify order, as returned by GET /api/orders. */
export interface RemoteOrderItem {
  title: string;
  quantity: number;
  variantId: string | null;
  price: number;
}

export interface RemoteOrder {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currency: string;
  total: number;
  items: RemoteOrderItem[];
}

/**
 * Sends an OTP to the given phone number (E.164, e.g. +9715XXXXXXXX).
 * Calls the backend, which dispatches the SMS via Twilio Verify.
 */
export async function sendOTP(phone: string): Promise<void> {
  _pendingPhone = phone;

  if (!API_URL) {
    // DEV fallback until the OTP backend is deployed.
    if (__DEV__) {
      console.warn(
        "[Mekazon] EXPO_PUBLIC_API_URL not set — using DEV OTP fallback (123456).",
      );
    }
    await new Promise((r) => setTimeout(r, 500));
    return;
  }

  const res = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send OTP (${res.status})`);
  }
}

/**
 * Verifies the code the user entered against the pending phone number.
 * Returns { valid, shopifyCustomerId, token }. valid is true only when the
 * backend (Twilio) approves the code.
 */
export async function verifyOTP(otp: string): Promise<VerifyResult> {
  const code = otp.trim();

  if (!API_URL) {
    // DEV fallback until the OTP backend is deployed.
    await new Promise((r) => setTimeout(r, 400));
    return {
      valid: code === DEV_FALLBACK_OTP,
      shopifyCustomerId: null,
      token: null,
    };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: _pendingPhone, code }),
    });
    if (!res.ok) return { valid: false, shopifyCustomerId: null, token: null };
    const json = (await res.json()) as {
      valid: boolean;
      shopifyCustomerId?: string | null;
      token?: string | null;
    };
    return {
      valid: json.valid === true,
      shopifyCustomerId: json.shopifyCustomerId ?? null,
      token: json.token ?? null,
    };
  } catch {
    return { valid: false, shopifyCustomerId: null, token: null };
  }
}

/**
 * Fetches the logged-in customer's real Shopify orders from the backend.
 * Returns null when there's no backend/session/token (caller falls back to the
 * device-local order history). Returns [] when the customer simply has no orders.
 */
export async function fetchRemoteOrders(): Promise<RemoteOrder[] | null> {
  if (!API_URL) return null;
  const session = await loadSession();
  const token = session?.token;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { orders?: RemoteOrder[] };
    return json.orders ?? [];
  } catch {
    return null;
  }
}

export async function saveSession(
  user: UserProfile,
  token?: string | null,
): Promise<AuthSession> {
  const session: AuthSession = {
    user,
    createdAt: Date.now(),
    ...(token ? { token } : {}),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const session = await loadSession();
  if (!session) return;
  const updated: AuthSession = {
    ...session,
    user: { ...session.user, ...updates },
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Deletes the user's account (Apple Guideline 5.1.1(v)).
 * Asks the backend to delete the linked Shopify customer + personal data, then
 * clears the device-local session regardless of the server result, so the
 * account is gone from this device even if the backend is unreachable.
 * (The caller should also clear local order history.)
 */
export async function deleteAccount(): Promise<void> {
  if (API_URL) {
    const session = await loadSession();
    const token = session?.token;
    if (token) {
      try {
        await fetch(`${API_URL}/api/account/delete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Proceed to clear local data regardless — the user asked to delete.
      }
    }
  }
  await clearSession();
}