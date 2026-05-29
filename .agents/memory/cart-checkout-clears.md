---
name: Cart clears after checkout
description: shopifyCheckout must call setItems([]) after saveOrder so the cart empties when user goes to Shopify — prevents accidental double-orders on return.
---

**Rule:** Inside `CartContext.tsx > shopifyCheckout`, call `setItems([])` immediately after `await saveOrder(order)`, before opening the Shopify URL.

**Why:** Without it, when the user returns to the app after completing (or abandoning) checkout, the cart still shows all items. They can tap Checkout again, creating a duplicate order. The order is already saved to local history before checkout opens, so clearing the cart is safe.

**How to apply:** Never call `clearCart()` from a callback outside the function — use `setItems([])` directly inside `shopifyCheckout` since `clearCart` is a separate function and would require extra deps in the useCallback.
