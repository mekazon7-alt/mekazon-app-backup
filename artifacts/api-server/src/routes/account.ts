/**
 * Account management endpoint.
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/account/delete
 *   Header: Authorization: Bearer <session token from verify-otp>
 *   → { deleted: boolean }
 *
 * Apple App Store Guideline 5.1.1(v) REQUIRES any app with account creation to
 * let users delete their account + personal data from inside the app. This
 * endpoint deletes the linked Shopify customer record. The app additionally
 * clears all device-local data (session + local order history) on its side.
 *
 * We trust only the HMAC-signed session token, so a client can only ever delete
 * its OWN account.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router, type IRouter } from "express";

import { logger } from "../lib/logger";
import { verifySessionToken } from "../lib/session";
import { deleteCustomer, SHOPIFY_ADMIN_CONFIGURED } from "../lib/shopifyCustomer";

const router: IRouter = Router();

function bearer(req: { headers: Record<string, unknown> }): string | null {
  const h = req.headers["authorization"];
  if (typeof h !== "string") return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1] ?? null;
}

// POST /api/account/delete
router.post("/account/delete", async (req, res) => {
  const session = verifySessionToken(bearer(req));
  if (!session) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // No linked Shopify customer (or Admin API not configured) → nothing to delete
  // server-side; the app still clears its local data, so the account is gone.
  if (!session.cid || !SHOPIFY_ADMIN_CONFIGURED) {
    return res.json({ deleted: false });
  }

  try {
    const deleted = await deleteCustomer(session.cid);
    return res.json({ deleted });
  } catch (err) {
    logger.error({ err }, "account delete failed");
    return res.status(502).json({ error: "delete_failed" });
  }
});

export default router;