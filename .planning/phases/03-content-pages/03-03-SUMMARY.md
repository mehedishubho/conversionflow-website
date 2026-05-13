# Plan 03-03 Summary: Changelog and Support Pages

**Status:** Complete
**Completed:** 2026-05-11

## What Was Built

### Changelog Page (`/changelog`)
- Small page hero with eyebrow, title, subtitle
- 3 version entries (v0.0.14, v0.0.13, v0.0.12) ordered newest-first
- Each entry has version badge, date, name, and categorized changes
- Change types tagged with colored badges (New=green, Improved=accent, Fix=orange)
- Latest version has accent badge; older versions have muted badge

### Support Page (`/support`)
- Small page hero with eyebrow, title, subtitle
- 3 support method cards (Email, WhatsApp, Documentation)
- Email card links to `mailto:mhs@wpmhs.com`
- Contact form with 5 fields: Name, Email, License Key, Subject, Message
- Form inputs styled with design tokens (focus states with accent glow)

Added CSS classes to `globals.css`:
- `.clog-list`, `.clog-item`, `.clog-v`, `.clog-date`, `.clog-name` — changelog
- `.clog-changes`, `.clog-tag`, `.ct-new`, `.ct-fix`, `.ct-imp`, `.clog-entry` — change entries
- `.support-grid`, `.support-card`, `.sc-icon`, `.sc-title`, `.sc-desc` — support cards
- `.contact-form`, `.form-grid`, `.form-group`, `.form-input` — contact form
- Responsive rules for `.support-grid` and `.form-grid`

## Key Files
- `src/app/changelog/page.tsx` — Changelog page (server component)
- `src/app/support/page.tsx` — Support page (server component)
- `src/app/globals.css` — New CSS utility classes added

## Requirements Addressed
- CHNG-01: Changelog page exists at `/changelog` route ✓
- CHNG-02: Version entries displayed with dates and change descriptions ✓
- CHNG-03: Changes categorized (new features, improvements, bug fixes) ✓
- SUPP-01: Support page exists at `/support` route ✓
- SUPP-02: FAQ section on pricing page addresses common questions ✓
- SUPP-03: Contact information and support channel links provided ✓
