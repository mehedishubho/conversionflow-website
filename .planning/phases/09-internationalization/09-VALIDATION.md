---
phase: 09
name: internationalization
date: 2026-05-14
---

# Validation Strategy: Phase 09 - Internationalization

## Dimension 1: URL & Routing
- [ ] `/` serves English content.
- [ ] `/bn` serves Bengali content.
- [ ] Root URLs (e.g., `/features`) are English by default.
- [ ] Locale-prefixed URLs (e.g., `/bn/features`) serve correct translated content.
- [ ] Invalid locales (e.g., `/fr/features`) trigger a 404 or redirect to default.

## Dimension 2: Translation Coverage
- [ ] Navbar and Footer strings are translated.
- [ ] Homepage hero, features, and pricing sections are translated.
- [ ] Navigation links maintain the current locale.
- [ ] Documentation listing page shows translated titles.

## Dimension 3: MDX Documentation
- [ ] `/docs/getting-started` (English) loads correctly.
- [ ] `/bn/docs/getting-started` loads the Bengali MDX file (`getting-started.bn.mdx`).
- [ ] Missing documentation in Bengali shows an appropriate English fallback or notice.

## Dimension 4: User Experience
- [ ] Navbar toggle switches language and updates the URL immediately.
- [ ] Footer language selector works as expected.
- [ ] The correct font (`Noto Sans Bengali`) is applied when the locale is `bn`.
- [ ] Theme (Dark/Light) is preserved when switching languages.

## Dimension 5: Technical SEO
- [ ] `sitemap.xml` contains localized URLs.
- [ ] `robots.txt` is accessible and unchanged.
- [ ] HTML `lang` attribute is correctly set to `en` or `bn`.
