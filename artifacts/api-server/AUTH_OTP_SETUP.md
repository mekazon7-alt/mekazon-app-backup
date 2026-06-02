# Phone OTP (Twilio Verify) + Order History — Setup & Activation

The code is wired end-to-end: phone OTP login → links the phone to a Shopify
customer → a signed session → the Orders tab shows the customer's real Shopify
orders with one-tap Reorder. To make it live, do the steps below.

You pay only for the Twilio OTP texts. Storing customer data, reading it back,
and building order history all run on Shopify's included Admin API + this server.

## 1. Twilio (one-time) — DONE
- Account SID (`AC…`), Auth Token, and Verify Service SID (`VA…`) are in the
  Twilio Console (Verify → Services). They map to `TWILIO_ACCOUNT_SID`,
  `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.
- The Auth Token is the one secret still to copy — it's behind the email
  verification code on the Twilio General Settings page.

## 2. Shopify Admin token (for order history)
1. Shopify admin → Settings → Apps and sales channels → Develop apps → Create app.
2. Configure Admin API scopes: `read_customers`, `write_customers`, `read_orders`.
3. Install → copy the Admin API access token (`shpat_…`).
4. Maps to `SHOPIFY_ADMIN_API_TOKEN` (+ `SHOPIFY_STORE_DOMAIN`).

## 3. Deploy the api-server (Render)
1. New → Web Service → connect the GitHub repo, root dir `artifacts/api-server`.
2. Build: `pnpm install && pnpm --filter @workspace/api-server run build`
   Start: `pnpm --filter @workspace/api-server run start`
3. Add a PostgreSQL instance; set `DATABASE_URL`.
4. Add these environment secrets (never in code):
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`
   - `SESSION_SECRET` — generate with:
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_TOKEN` (for order history)
5. Deploy → note the public URL, e.g. `https://mekazon-api.onrender.com`.

## 4. Point the app at it
Set `EXPO_PUBLIC_API_URL` to the Render URL (in `app.json` `extra`/env or EAS
Secrets), then rebuild with EAS. Until it's set, the app uses a DEV fallback that
accepts `123456` so you can keep testing in preview.

## Endpoints
- `POST /api/auth/send-otp`   `{ "phone": "+9715XXXXXXXX" }`
- `POST /api/auth/verify-otp` `{ "phone": "+9715XXXXXXXX", "code": "123456" }`
  → `{ "valid": true, "shopifyCustomerId": "gid://…" | null, "token": "…" }`
- `GET  /api/orders`  header `Authorization: Bearer <token>`
  → `{ "orders": [ { id, name, processedAt, financialStatus,
       fulfillmentStatus, currency, total, items:[{title,quantity,variantId,price}] } ] }`

## Security
- The Twilio Auth Token and Shopify Admin token live ONLY in the server's secret
  store — never in the app bundle, never committed. The repo is public, so this
  separation matters.
- `/api/orders` trusts only the HMAC-signed session token minted at verify time,
  so a client can't request someone else's orders. No `SESSION_SECRET` → login
  still works, but order history stays off (the app falls back to local history).

## Known limitation
Pure guest checkouts that never attach to a customer record can't be matched by
phone. Orders placed by (or attached to) the customer Shopify creates on first
OTP login will appear. To maximise matches, pass the phone at checkout so Shopify
attaches the order to that customer.