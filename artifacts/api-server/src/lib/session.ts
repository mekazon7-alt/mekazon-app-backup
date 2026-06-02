/**
 * Signed session tokens (HMAC).
 * ─────────────────────────────────────────────────────────────────────────────
 * After a phone number is verified we hand the app a compact, signed token that
 * encodes WHO the user is (their phone + linked Shopify customer id) and WHEN it
 * expires. The app sends it back on later requests (e.g. order history) so the
 * server can trust the caller WITHOUT the app ever holding a Shopify secret.
 *
 * Why this matters: without a signed token, an "order history" endpoint that
 * simply took a customerId would let anyone read anyone else's orders. The HMAC
 * signature makes the token un-forgeable — only this server, holding the secret,
 * can mint a valid one.
 *
 * No external dependency: uses Node's built-in `crypto`.
 *
 * Required env:
 *   SESSION_SECRET — a long random string (set it in Render → Environment).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env["SESSION_SECRET"] ?? "";

/** 30 days, in milliseconds. */
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_CONFIGURED = Boolean(SECRET);

export interface SessionPayload {
  /** Verified phone number, E.164. */
  phone: string;
  /** Linked Shopify customer GID, or null if not linked. */
  cid: string | null;
  /** Expiry, epoch milliseconds. */
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(data: string): string {
  return base64url(createHmac("sha256", SECRET).update(data).digest());
}

/** Mint a signed token for a verified user. Returns "" if no SESSION_SECRET. */
export function createSessionToken(input: {
  phone: string;
  cid: string | null;
}): string {
  if (!SESSION_CONFIGURED) return "";
  const payload: SessionPayload = {
    phone: input.phone,
    cid: input.cid,
    exp: Date.now() + TTL_MS,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/** Validate a token. Returns the payload only when signature + expiry both pass. */
export function verifySessionToken(token: unknown): SessionPayload | null {
  if (!SESSION_CONFIGURED) return null;
  if (typeof token !== "string" || !token.includes(".")) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromBase64url(body).toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}