---
name: UX audit & persona fixes
description: All issues found in the general UX audit + 4-persona cultural review, and their fix status
---

## Fixed (all resolved)

### From general UX audit
- Debug menu (Shopify Collections) now hidden behind admin login — not visible to customers
- Dev note on Login screen removed
- Dev note on OTP verify screen removed
- Admin modal dev note ("Replace with proper backend auth...") removed
- WhatsApp Support button now opens wa.me/971561167903 (live link)
- Dead profile menu buttons (Saved Items, Repeat Orders, Addresses, Payment) removed
- Cart "Clear" now shows confirmation dialog before wiping
- Orders "Clear history" now shows confirmation dialog
- Reorder button added to every order card — re-adds all items to cart
- "Order directly through Shopify checkout" → "Secure checkout, cash on delivery available"
- "Payment processed securely via Shopify" → "Payment processed securely"
- "Powered by Shopify. Orders... via mekazon.com" → "Your orders and payments are handled securely through mekazon.com"
- "Same-day delivery available — Dubai, Uganda orders" → "Same-day delivery available for your area"
- Deals category now opens "Deals Coming Soon" modal instead of silently filtering to nothing

### From 4-persona cultural review
- **Kenya flag FIXED**: was Green/Red/Black, now correct Black/Red/Green in all 3 locations (personalization.ts CountryConfig, ONBOARDING_OPTIONS, onboarding card)
- **Uganda greeting FIXED**: "Webale nyo" (means "thank you") → "Tukusanyukira" (means "we welcome you")
- **"Other African Countries" renamed** to "West & Central Africa" (honest about content)
- **Ugandan Family Feast basket** image was `lifestyle-ugali` (Kenyan dish) → corrected to `lifestyle-matooke`
- **Chai & Chapati Bundle** renamed to "Chai & Mandazi Bundle" (can't make chapati with maize flour — was culturally incorrect)
- **Nyama Choma Night** renamed to "Nyama Choma Spice Night" (no meat products in store, name was misleading)
- **Coffee Ceremony Kit** item "Incense pack" replaced with "Niter Kibbeh" (actual product in store)

## Known remaining / not in scope
- No product detail screen (user chose to skip for launch)
- No Tigrinya/Oromo language options (polish level)
- "Stockfish (Panla)" — Panla is Yoruba-specific (polish level)
- "Palm Oil (Zomi)" — Zomi is Ghanaian-specific (polish level)
- West & Central Africa section has no East/Southern African content — future content expansion needed
- Mursik described as "powder" — Kalenjin diaspora may notice (polish level)

## Key architecture facts
- All country flags defined in TWO places: `COUNTRY_CONFIGS` (CountryConfig.flagColors) AND `ONBOARDING_OPTIONS` array — must update both
- Basket `lifestyleImageKey` must match keys in `LIFESTYLE_IMAGES` static require map in index.tsx
- Deals and Ready Food category names trigger modal intercept in index.tsx onPress handler
- WhatsApp support number: +971561167903
