# Mekazon — Production Readiness Checklist

## App Store (Apple) & Google Play Readiness

### Assets
- [ ] App icon — 1024×1024 PNG, no alpha, no rounded corners (both platforms)
- [ ] Adaptive icon — Android foreground + background layers (app.json `android.adaptiveIcon`)
- [ ] Splash screen — correct dimensions, no text clipped on notched devices
- [ ] Screenshots for App Store — 6.7" iPhone, iPad (if Universal), and at least one Arabic RTL screenshot
- [ ] Screenshots for Google Play — phone and tablet

### App Identity
- [ ] `app.json` → `name`: "Mekazon"
- [ ] `app.json` → `slug`: "mekazon"
- [ ] `app.json` → `ios.bundleIdentifier`: com.mekazon.app
- [ ] `app.json` → `android.package`: com.mekazon.app
- [ ] `app.json` → `version` and `buildNumber` / `versionCode` bumped before each submission
- [ ] `app.json` → `ios.supportsTablet`: false (phone-only for now)

### Permissions
- [ ] Camera — only request if used; justify in App Store review notes
- [ ] Location — currently not requested at OS level (only emirate selection via UI)
- [ ] Push Notifications — add `expo-notifications` + server token before enabling
- [ ] Remove any unused permissions from `app.json` `plugins`

### Privacy & Legal
- [ ] Privacy Policy URL added to App Store Connect and Google Play Console
- [ ] Privacy Policy URL reachable in-app (Profile → Privacy Policy)
- [ ] Terms of Service URL reachable in-app (Profile → Terms)
- [ ] Data Safety form filled in Google Play (data collected: name, phone, delivery address, order history)
- [ ] App Privacy labels filled in App Store Connect (same categories)
- [ ] No tracking SDKs without ATT prompt (iOS 14+)

### Checkout & Payments
- [x] Shopify Storefront cart creates a real checkout URL
- [x] Checkout opens in-browser (WebBrowser) not in a WebView (App Store policy)
- [ ] Shopify checkout tested end-to-end with a live order
- [ ] Cash on Delivery tested
- [ ] Card payment (Ziina) tested
- [ ] Confirm Shopify checkout URL is HTTPS

### Content & UX
- [x] Remove "Free Delivery" claim from cart (misleading — actual fee shown at Shopify checkout)
- [ ] All "See All" buttons navigate correctly
- [ ] Empty states shown for cart, orders, search
- [ ] Loading states on all async screens (products, orders)
- [ ] Error states with retry option on product load failure
- [ ] No placeholder or "lorem ipsum" copy visible to end users
- [ ] No developer/debug menu visible to end users (remove or gate behind dev flag)

### Login & Orders
- [ ] Guest checkout flow tested end-to-end
- [ ] Phone-number login (OTP) — add expo-auth-session or Shopify Customer Accounts
- [ ] Order history: fetch from Shopify Customer API after login
- [ ] Re-order: pre-fill cart from past order
- [ ] Saved addresses: stored in Shopify Customer profile

### Internationalisation
- [ ] Arabic (RTL) layout tested on a real device
- [ ] Amharic text renders correctly (font fallback)
- [ ] Swahili translations complete
- [ ] All hardcoded English strings moved to `lib/i18n/en.json`
- [ ] Date/currency formatting locale-aware

### Performance
- [ ] Images use `expo-image` with caching (already in place)
- [ ] Shopify product fetch has error boundary and retry
- [ ] No console.log/console.warn calls in production build
- [ ] JS bundle size profiled with `expo export --profile`

### Build
- [ ] `eas build --profile production --platform ios` passes
- [ ] `eas build --profile production --platform android` passes
- [ ] OTA updates configured (`expo-updates` + EAS Update channel)
- [ ] Environment variables set in EAS Secrets (not in source code)
  - `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN`
  - `EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`

### App Store Review Notes to Prepare
- Payment method: Shopify checkout (external browser), Cash on Delivery
- Login: Guest checkout available; optional Shopify Customer account
- Demo account credentials for reviewer
- Note that app serves the African diaspora in UAE — culturally-specific content is intentional

---

## Known Gaps Before Launch

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Phone OTP login | Users don't use email |
| P0 | Order history screen | Needs Shopify Customer API |
| P0 | Re-order button | Needs order history |
| P1 | Push notifications | expo-notifications + FCM/APNs |
| P1 | Arabic RTL full test | Test on real device |
| P1 | Privacy Policy page | At minimum a web URL |
| P2 | Wishlist / Saved items | Shopify Customer API |
| P2 | Basket add-to-cart | BasketCard "Add" button wires to cart |
| P2 | Search → live results | Currently shows suggestions only |
| P3 | Referral / share | Nice-to-have for growth |
