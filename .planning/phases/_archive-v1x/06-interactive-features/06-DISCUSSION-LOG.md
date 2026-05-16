# Phase 6: Interactive Features - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 06-interactive-features
**Areas discussed:** Currency toggle, Contact form behavior, Buy button links, Count-up animations

---

## Currency Toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle buttons | Simple USD/BDT button pair, one highlighted | ✓ |
| Dropdown select | Dropdown with options, needs click to open | |
| Tab bar | Full-width tab bar above cards | |

**User's choice:** Toggle buttons (compact, clear)
**Notes:** USD default. Swap primary/secondary price when toggling — both always visible, just swap prominence.

## Contact Form Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Validate + success message | Form validates, shows confirmation. No email sending yet | ✓ |
| Full email with Resend | Server action sends email via Resend API | |
| Mailto fallback | Opens email client | |

**User's choice:** Validate + success message (email sending deferred until API key available)

### Validation level

| Option | Description | Selected |
|--------|-------------|----------|
| Basic validation | Required: name, email, message. Email format check | |
| Strict validation | All 4 fields required, email + format checks, character limits | ✓ |

**User's choice:** Strict validation — all fields (name, email, subject, message) required with format checks

## Buy Button Links

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder links | Placeholder URLs, replaceable later | |
| WhatsApp for all | All buttons link to WhatsApp chat | |
| Dual path (placeholder + WhatsApp) | Placeholder for international + WhatsApp for BD | ✓ |

**User's choice:** Dual path — placeholder checkout URLs + WhatsApp option

### WhatsApp on pricing cards

| Option | Description | Selected |
|--------|-------------|----------|
| WhatsApp note on cards | Small "Pay with bKash/Nagad via WhatsApp" below Buy Now | ✓ |
| Separate WhatsApp button | Two CTA buttons per card | |
| No WhatsApp on cards | Keep cards clean | |

**User's choice:** WhatsApp note below Buy Now button — subtle, not a full second CTA

## Count-up Animations

| Option | Description | Selected |
|--------|-------------|----------|
| Full count-up | Animate all TrustBar stats + hero dashboard numbers + chart bars | ✓ |
| TrustBar only | Only animate TrustBar stats | |
| Full with staggered reveal | Full count-up plus staggered fade-in on chart bars and order rows | |

**User's choice:** Full count-up (TrustBar + hero stats + chart bars)

### Duration

| Option | Description | Selected |
|--------|-------------|----------|
| 1.5 seconds | Snappy, doesn't delay | ✓ |
| 2.5 seconds | More dramatic | |

**User's choice:** 1.5 seconds

## Claude's Discretion

- Animation easing curve
- Form error message wording
- WhatsApp pre-filled message text
- Whether to extract useCountUp hook

## Deferred Ideas

- Actual email sending via Resend — needs API key from developer
- Real checkout URLs — developer must provide
