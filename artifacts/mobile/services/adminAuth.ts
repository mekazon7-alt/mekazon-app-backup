/**
 * Admin Authentication — MVP / Temporary
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPER NOTE:
 * This is a temporary, password-based admin authentication system intended
 * for internal use only during early development. It uses a hardcoded password
 * and an in-memory session (session clears when the app is closed or restarted).
 *
 * THIS MUST BE REPLACED before any public or production release with:
 *   - A proper backend authentication system (JWT, session tokens)
 *   - Role-based access control (RBAC)
 *   - Secure credential storage (never hardcode passwords in production)
 *   - Recommended future stack: Supabase Auth, Firebase Auth, or a custom API
 *
 * Password management:
 *   - Current password is stored in this file for MVP only
 *   - A "Change Password" UI placeholder exists in the Admin screen
 *   - Actual password change functionality requires a backend
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ADMIN_PASSWORD = "mekazon-2024";

let _authenticated = false;

export function checkAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_PASSWORD;
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
