---
name: Basket detail sheet
description: BasketCard opens a bottom-sheet Modal on tap showing basket contents (items string[]) and an Add to Cart CTA — consumers need to see contents before buying.
---

**Rule:** The BasketCard `handlePress` opens a `showDetail` Modal. The "Add" button in the card footer still uses `e.stopPropagation()` to add without opening the sheet.

**Why:** Baskets are bundles (e.g. AED 89). Consumers won't buy blind — they need to see what's inside. Tapping only triggering haptics was a dead-end UX. Each `Basket` has `items: string[]` (defined in `constants/personalization.ts`) listing human-readable item names.

**How to apply:** The detail Modal is self-contained inside `BasketCard.tsx`. It uses the same `lifestyleImage` as the card for the sheet hero. The sheet Add button calls `handleAddToCart()` then `setShowDetail(false)`.
