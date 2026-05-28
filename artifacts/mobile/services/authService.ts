/**
 * Auth Service — Mock OTP (MVP)
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPER NOTE:
 * Currently uses a fixed mock OTP (123456) for all phone numbers.
 * Replace sendOTP() with a real provider before any production release:
 *   - Twilio Verify: https://www.twilio.com/verify
 *   - Firebase Phone Auth: https://firebase.google.com/docs/auth/web/phone-auth
 *   - Supabase Phone Auth: https://supabase.com/docs/guides/auth/phone-login
 *
 * The verifyOTP() function signature is designed to be provider-agnostic.
 * Session is stored in AsyncStorage (device-local, no backend required for MVP).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, UserProfile } from "@/types/user";

const SESSION_KEY = "@mekazon_auth_session";
const MOCK_OTP = "123456";

let _pendingPhone = "";

export function setPendingPhone(phone: string) {
  _pendingPhone = phone;
}

export function getPendingPhone(): string {
  return _pendingPhone;
}

/**
 * Sends an OTP to the given phone number.
 * Currently mocks a network delay. Replace with a real provider.
 */
export async function sendOTP(phone: string): Promise<void> {
  _pendingPhone = phone;
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 700));
  // TODO: Replace with Twilio / Firebase / Supabase call
}

/**
 * Verifies the OTP entered by the user.
 * Mock accepts "123456" for any phone number.
 */
export async function verifyOTP(otp: string): Promise<boolean> {
  // Simulate verification delay
  await new Promise((r) => setTimeout(r, 500));
  return otp.trim() === MOCK_OTP;
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
