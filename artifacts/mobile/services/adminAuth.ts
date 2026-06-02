/**
 * Admin Authentication — internal/dev only.
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPER NOTE:
 * Temporary password-based admin access for internal content management.
 *
 * SECURITY:
 *   - Admin tools are COMPLETELY DISABLED in production builds. They are only
 *     reachable in a dev build (`__DEV__`), or when you explicitly opt in by
 *     setting EXPO_PUBLIC_ENABLE_ADMIN="true". In a normal App Store / TestFlight
 *     build neither the entry gesture nor the /admin-content & /debug-collections
 *     routes do anything.
 *   - There is NO hardcoded password. The password comes only from
 *     EXPO_PUBLIC_ADMIN_TOKEN. If that env var is unset, admin is disabled even
 *     in dev. (Set it in your local .env to use admin tools while developing.)
 *
 * REPLACE before any real production admin need with proper backend auth
 * (JWT/session + RBAC).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ADMIN_TOKEN = process.env.EXPO_PUBLIC_ADMIN_TOKEN ?? "";

/** Admin tooling is available only in dev builds, or when explicitly enabled. */
export const ADMIN_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_ADMIN === "true";

let _authenticated = false;

export function checkAdminPassword(password: string): boolean {
  if (!ADMIN_ENABLED) return false; // disabled in production
  if (!ADMIN_TOKEN) return false; // disabled when no password is configured
  return password.trim() === ADMIN_TOKEN;
}

export function isAdminAuthenticated(): boolean {
  return ADMIN_ENABLED && _authenticated;
}

export function setAdminAuthenticated(value: boolean): void {
  _authenticated = ADMIN_ENABLED ? value : false;
}

export function adminLogout(): void {
  _authenticated = false;
}