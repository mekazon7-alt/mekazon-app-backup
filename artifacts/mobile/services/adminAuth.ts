/**
 * Admin Authentication — MVP / Temporary
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPER NOTE:
 * This is a temporary, password-based admin authentication system intended
 * for internal use only during early development.
 *
 * THIS MUST BE REPLACED before any public or production release with:
 *   - A proper backend authentication system (JWT, session tokens)
 *   - Role-based access control (RBAC)
 *   - Recommended future stack: Supabase Auth, Firebase Auth, or a custom API
 *
 * Password is read from EXPO_PUBLIC_ADMIN_TOKEN env variable.
 * Set it in your .env file: EXPO_PUBLIC_ADMIN_TOKEN=your-secret-here
 * If not set, admin access is disabled entirely.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ADMIN_TOKEN = process.env.EXPO_PUBLIC_ADMIN_TOKEN ?? "mekazon-2024";

let _authenticated = false;

export function checkAdminPassword(password: string): boolean {
  if (!ADMIN_TOKEN) return false; // admin disabled if env var not set
  return password.trim() === ADMIN_TOKEN;
}

export function isAdminAuthenticated(): boolean {
  return _authenticated;
}

export function setAdminAuthenticated(value: boolean): void {
  _authenticated = value;
}

export function adminLogout(): void {
  _authenticated = false;
}