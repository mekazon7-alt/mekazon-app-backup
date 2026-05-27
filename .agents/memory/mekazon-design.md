---
name: Mekazon Design System
description: Color tokens and visual direction for the Mekazon mobile app — critical to maintain across all future changes
---

# Mekazon Design System

## Palette (constants/colors.ts)
- background: #F7F8F2 (warm natural cream — NEVER use black/dark as main background)
- primary: #4E7234 (olive green — buttons, active states, icons)
- accent: #C4541A (terracotta — CTAs, eyebrow labels, sale badges)
- secondary: #EBF0DE (pale sage — chips, muted backgrounds)
- mutedForeground: #728054 (warm sage gray)
- border: #DDE8C8 (natural green-tinted border)

## Visual rules
- The app must feel like a premium organic food brand / warm kitchen — NOT fintech, NOT dark tech
- Onboarding screen: light cream background with food photo thumbnails on country cards
- Home screen: cream background with daylight food imagery in hero banner
- Avoid all black-heavy or "cyber" aesthetics
- More whitespace and breathing room (paddingHorizontal: 22, section marginBottom: 32)

**Why:** User explicitly rejected dark brown/black UI multiple times. The emotional goal is freshness + home + trust + culture.
**How to apply:** Any new screen or component must default to colors.background (#F7F8F2) not dark colors. Primary interactions use olive green (#4E7234), strong CTAs use terracotta (#C4541A).
