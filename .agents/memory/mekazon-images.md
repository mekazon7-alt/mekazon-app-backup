---
name: Mekazon Image Philosophy
description: Two distinct image systems in Mekazon — real product packaging vs lifestyle emotional imagery
---

# Two Image Systems

## 1. Real Product Images (Trust layer)
- File pattern: product-*.png (product-royco, product-unga, product-teff, product-berbere, product-coffee)
- Used in: ProductCard image area, displayed with contentFit="contain" on pale sage background
- Purpose: Build purchase trust through authentic product packaging recognition
- Generation rule: "product photo, clean background, sharp packaging photography"

## 2. Emotional Lifestyle Images (Craving/emotion layer)
- File pattern: lifestyle-*.png (lifestyle-ugali, lifestyle-injera, lifestyle-matooke, lifestyle-coffee, lifestyle-spices)
- Also: hero-*.png (hero-uganda, hero-kenya, hero-ethiopia, hero-pan-african)
- Used in: BasketCard backgrounds, hero banner, onboarding country cards, Meal Inspiration section
- Purpose: Trigger nostalgia, craving, and emotional connection
- Generation rule: ALWAYS use "bright natural daylight, clean background, premium food photography" — NEVER "dark, moody, dramatic"

**Why:** User explicitly defined this dual-image architecture. Dark/moody lifestyle images were rejected; bright daylight is the required aesthetic.
**How to apply:** When generating new food images, lifestyle images must be bright + daylight. Product images must show packaging clearly on clean backgrounds.
