# Discussion Log: Phase 09 - Internationalization

## Session Information
- **Date**: 2026-05-14
- **Participants**: Antigravity (AI), User (Human)

## Areas Discussed

### 1. Routing Strategy
- **Options presented**: Prefix everything vs Default locale.
- **Decision**: Use URL prefix with `en` as default.
- **Rationale**: Standard `next-intl` approach while keeping clean URLs for the primary English audience.

### 2. Language Switcher UX
- **Options presented**: Navbar toggle vs Footer selector.
- **Decision**: Both.
- **Rationale**: Provides maximum accessibility for users to switch languages at any point on the page.

### 3. MDX Content Translation
- **Options presented**: Parallel files for all MDX vs UI-only.
- **Decision**: Blog articles will not be translated, but Documentation will be.
- **Rationale**: Prioritizing documentation for usability in the local market while keeping the blog lean.

### 4. Bengali Font Application
- **Options presented**: Global overwrite vs Hybrid.
- **Decision**: Global.
- **Rationale**: Ensures a consistent and readable experience for Bengali speakers across the entire interface.

## Deferred Ideas
- Blog translation.
- IP-based auto-detection.
