import { Router, type IRouter } from "express";

import { logger } from "../lib/logger";
import {
  sendVerification,
  checkVerification,
  TWILIO_CONFIGURED,
} from "../lib/twilio";
import { findOrCreateCustomerByPhone } from "../lib/shopifyCustomer";
import { createSessionToken, SESSION_CONFIGURED } from "../lib/session";

const router: IRouter = Router();

/** Accept only E.164 phone numbers, e.g. +9715XXXXXXXX. */
function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return /^\+[1-9]\d{6,14}$/.test(trimmed) ? trimmed : null;
}

// POST /api/auth/send-otp  { phone }
router.post("/auth/send-otp", async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) {
    return res.status(400).json({
      error: "invalid_phone",
      message: "Phone must be in E.164 format, e.g. +9715XXXXXXXX",
    });
  }
  if (!TWILIO_CONFIGURED) {
    return res
      .status(503)
      .json({ error: "otp_unavailable", message: "OTP service not configured" });
  }
  try {
    const result = await sendVerification(phone);
    if (!result.ok) return res.status(502).json({ error: "send_failed" });
    return res.json({ sent: true });
  } catch (err) {
    logger.error({ err }, "send-otp failed");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/auth/verify-otp  { phone, code }
// → { valid: true, shopifyCustomerId, token } on success
router.post("/auth/verify-otp", async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code =
    typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!phone || !code) {
    return res.status(400).json({ valid: false, error: "invalid_request" });
  }
  if (!TWILIO_CONFIGURED) {
    return res.status(503).json({ valid: false, error: "otp_unavailable" });
  }
  try {
    const result = await checkVerification(phone, code);
    if (!result.ok) return res.status(502).json({ valid: false, error: "verify_failed" });
    if (!result.valid) return res.json({ valid: false });

    // Best-effort: link the verified phone to a Shopify customer. Never blocks login.
    let shopifyCustomerId: string | null = null;
    try {
      const customer = await findOrCreateCustomerByPhone(phone);
      shopifyCustomerId = customer?.id ?? null;
    } catch (err) {
      logger.warn({ err }, "shopify customer link failed");
    }

    // Mint a signed session token so later requests (order history) are trusted
    // without the app holding any Shopify secret. Empty string if no SESSION_SECRET.
    const token = createSessionToken({ phone, cid: shopifyCustomerId });
    if (!SESSION_CONFIGURED) {
      logger.warn(
        "SESSION_SECRET not set — login works but no session token is issued, so order history will be unavailable.",
      );
    }

    return res.json({ valid: true, shopifyCustomerId, token });
  } catch (err) {
    logger.error({ err }, "verify-otp failed");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});

export default router;