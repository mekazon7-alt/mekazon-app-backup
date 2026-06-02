/**
 * Order history endpoint.
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/orders
 *   Header: Authorization: Bearer <session token from verify-otp>
 *   → { orders: OrderSummary[] }
 *
 * The session token (HMAC-signed) carries the verified phone + linked Shopify
 * customer id. We trust ONLY what's inside that signed token — the client cannot
 * ask for "someone else's" orders, because it can't forge a token.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router, type IRouter } from "express";

import { logger } from "../lib/logger";
import { verifySessionToken } from "../lib/session";
import {
  getOrdersForCustomer,
  getRecentOrdersByPhone,
  SHOPIFY_ADMIN_CONFIGURED,
} from "../lib/shopifyCustomer";

const router: IRouter = Router();

function bearer(req: { headers: Record<string, unknown> }): string | null {
  const h = req.headers["authorization"];
  if (typeof h !== "string") return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1] ?? null;
}

// GET /api/orders
router.get("/orders", async (req, res) => {
  const session = verifySessionToken(bearer(req));
  if (!session) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!SHOPIFY_ADMIN_CONFIGURED) {
    // Not an error: the app falls back to its local order history.
    return res.json({ orders: [], reason: "shopify_admin_not_configured" });
  }
  try {
    // Prefer the customer id baked into the token; fall back to phone lookup.
    const orders = session.cid
      ? await getOrdersForCustomer(session.cid)
      : await getRecentOrdersByPhone(session.phone);
    return res.json({ orders });
  } catch (err) {
    logger.error({ err }, "order history fetch failed");
    return res.status(502).json({ error: "orders_unavailable" });
  }
});

export default router;