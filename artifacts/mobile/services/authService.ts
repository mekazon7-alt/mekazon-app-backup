/**
 * Auth Service — Real OTP via Twilio Verify
 * Backend: Cloudflare Worker (twilio-worker.js)
 * Channels: SMS (live) + WhatsApp (coming soon)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, UserProfile } from "@/types/user";

const SESSION_KEY = "@mekazon_auth_session";

// ── Replace with your deployed Cloudflare Worker URL ──
const OTP_API_URL =
  (process.env.EXPO_PUBLIC_OTP_API_URL as string | undefined) ??
  "https://mekazon-otp.YOUR-SUBDOMAIN.workers.dev";

let _pendingPhone = "";
let _pendingChannel: "sms" | "whatsapp" = "sms";

export function setPendingPhone(phone: string) {
  _pendingPhone = phone;
}

export function getPendingPhone(): string {
  return _pendingPhone;
}

export function setPendingChannel(channel: "sms" | "whatsapp") {
  _pendingChannel = channel;
}

export function getPendingChannel(): "sms" | "whatsapp" {
  return _pendingChannel;
}

/**
 * Sends an OTP to the given phone number via SMS or WhatsApp
 */
export async function sendOTP(
  phone: string,
  channel: "sms" | "whatsapp" = "sms"
): Promise<void> {
  _pendingPhone = phone;
  _pendingChannel = channel;

  const response = await fetch(`${OTP_API_URL}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, channel }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to send OTP");
  }
}

/**
 * Verifies the OTP entered by the user via Twilio Verify
 */
export async function verifyOTP(otp: string): Promise<boolean> {
  const response = await fetch(`${OTP_API_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: _pendingPhone, code: otp }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.success === true;
}

export async function saveSession(user: UserProfile): Promise<AuthSession> {
  const session: AuthSession = { user, createdAt: Date.now() };
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

export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<void> {
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