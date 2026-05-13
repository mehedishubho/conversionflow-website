---
phase: 09
name: internationalization
date: 2026-05-14
---

# Context: Phase 09 - Internationalization

## Domain Boundary
Implementing bilingual support (English & Bengali) using `next-intl`. This includes structural routing changes, UI string localization, documented content translation, and language-switching interface components.

## Implementation Decisions

### 1. Routing Strategy
- **Approach**: URL-based locale segments using `next-intl`.
- **Default Locale**: `bn` (Bengali).
- **Prefixing**: Use URL prefixes (e.g., `/en/...`). The default locale (`bn`) should ideally be hidden or redirect from the root (e.g., `/features` serves Bengali content by default).
- **Structural Change**: Move existing `src/app` routes into `src/app/[locale]` (or equivalent `next-intl` structure) to support the locale segment.

### 2. User Interface (Switching)
- **Placement**: Implement language switchers in **both** the Navbar and the Footer.
- **Navbar Design**: A quick toggle (e.g., `EN / বাং`) placed near the theme switcher.
- **Footer Design**: A more descriptive selector or link set in the resources/footer area.

### 3. Content Translation (MDX)
- **Blog Articles**: Will **not** be translated. They remain in English.
- **Documentation (Docs)**: **Will** be translated. Require a structure to serve localized MDX files (e.g., `getting-started.en.mdx` and `getting-started.bn.mdx`).
- **Static Pages**: All static marketing pages (Home, Features, Pricing, etc.) will be fully translated using `next-intl` messages.

### 4. Typography & Styling
- **Font Strategy**: **Global** application. When the locale is `bn`, the `Noto Sans Bengali` font should be applied to the entire body to ensure a consistent reading experience.
- **Direction**: LTR (Left-to-Right) for both languages.

## Technical References
- `src/messages/en.json` & `src/messages/bn.json`: Existing translation keys.
- `src/lib/lang.tsx`: Current `LangProvider` (to be superseded/refactored for `next-intl`).
- `src/lib/mdx.ts`: MDX fetching logic (needs to become locale-aware for Docs).

## Deferred Ideas
- **Blog Translation**: Deferred to a later phase if required.
- **Automatic Geo-Detection**: Defaulting language based on IP (deferred; use browser preference/default `en`).
