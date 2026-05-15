# Phase 1: Database, Auth, and Route Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 01-foundation
**Areas discussed:** Auth page design, Dual login flow, Schema scope, Post-login routing, Registration fields, Email verification UX, First admin setup, Session duration, Password requirements, Login rate limiting, Dev environment (Redis), Auth page i18n, Email provider for auth, Account management location, Password reset UX

---

## Auth Page Design

| Option | Description | Selected |
|--------|-------------|----------|
| Port dashboard auth forms | Use backenddashboard SignInForm/SignUpForm as-is, swap fonts, rewire ThemeContext to next-themes | ✓ |
| Custom ConversionFlow auth | Build from scratch with glassmorphism, accent colors, Syne headings | |
| Dashboard layout + CF branding | Dashboard form layout with ConversionFlow colors/fonts/logo | |

**User's choice:** Port dashboard auth forms — fastest path
**Notes:** Swap Outfit font for DM Sans/Syne, rewire ThemeContext to existing next-themes

---

## Auth Page i18n

| Option | Description | Selected |
|--------|-------------|----------|
| English only | Auth pages in English only, no Bengali. Simpler — outside [locale] route group. | ✓ |
| Yes, with language toggle | Add lightweight i18n with Bengali support on auth pages | |

**User's choice:** English only for auth pages
**Notes:** BD WooCommerce store owners are comfortable with English login forms

---

## Dual Login Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Shared login + role redirect | One /login page, server checks role, redirects accordingly | ✓ |
| Separate customer + admin login | Two pages: /login and /admin/login | |

**User's choice:** Shared login with role-based redirect
**Notes:** Simple URL, less confusion for users

---

## Post-login Routing

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed redirect per role | Customer → /portal/dashboard, Admin → /admin/dashboard, Support → /admin/dashboard | ✓ |
| Role-based redirect + permission nav | Fixed redirects + support_staff gets limited admin nav based on permissions | |

**User's choice:** Fixed redirect per role
**Notes:** Support staff gets same admin dashboard access in Phase 1

---

## Registration Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Email + password (minimal) | Name collected later. Fastest signup. | |
| Name + email + password | Slightly more friction but name available immediately. | |
| Name + email + password + phone | Phone needed for BD payment verification (bKash/Nagad). More fields upfront. | ✓ |

**User's choice:** Name + email + password + phone
**Notes:** Phone is forward-looking for Phase 4 BD payment verification

---

## Email Verification UX

| Option | Description | Selected |
|--------|-------------|----------|
| Block until verified | User must verify email before logging in. | |
| Auto-login, limited access | Auto-login, browse but can't purchase until verified. | |
| Auto-login, full access | Auto-login with full access. Verification email sent but optional. | ✓ |

**User's choice:** Auto-login with full access
**Notes:** Lowest friction — verification email is informational only

---

## First Admin Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Seed script from env vars | pnpm db:seed creates super_admin from ADMIN_EMAIL, ADMIN_PASSWORD | |
| Setup wizard page | /admin/setup route, only works when no admin exists | |
| Manual database insert | Insert admin row via SQL/Drizzle studio | |

**User's choice:** Setup wizard page (primary) + seed script (backup)
**Notes:** User explicitly requested both — setup wizard as primary method protected from abuse, seed script for emergency/backup

---

## Session Duration

| Option | Description | Selected |
|--------|-------------|----------|
| 30 days | Good balance of security and convenience. Standard for SaaS. | ✓ |
| 7 days | More secure but re-login annoyance. | |
| 24 hours | Most secure, highest friction. Banking-level. | |

**User's choice:** 30 days

---

## Password Requirements

| Option | Description | Selected |
|--------|-------------|----------|
| Min 8 chars, no rules | Simple, familiar for BD customers | ✓ |
| Min 8 chars + mixed case + number | More secure but could frustrate non-technical users | |
| Min 12 chars + full complexity | Strongest but high friction for target audience | |

**User's choice:** Min 8 chars, no complexity rules
**Notes:** Suitable for BD audience who may not use password managers

---

## Login Rate Limiting

| Option | Description | Selected |
|--------|-------------|----------|
| 5 attempts, 15-min lockout | Standard protection without being too aggressive | ✓ |
| 10 attempts, CAPTCHA/email unlock | Less aggressive, fewer false positives | |
| Progressive delay, no lockout | Slows down responses, no account lockout | |

**User's choice:** 5 failed attempts → 15-minute lockout

---

## Dev Environment (Redis)

| Option | Description | Selected |
|--------|-------------|----------|
| Docker Redis + in-memory fallback | Add Redis to docker-compose, fallback when unavailable | ✓ |
| Docker Redis only | Dev requires Docker. Simpler code. | |
| In-memory dev, Redis prod | Simplest dev but dev/prod parity issue. | |

**User's choice:** Docker Redis + in-memory fallback
**Notes:** Zero config for Docker users, still works without Docker

---

## Email Provider for Auth

| Option | Description | Selected |
|--------|-------------|----------|
| Resend (already installed) | Same provider as contact form. Consistent delivery. | ✓ |
| Separate SMTP provider | Different provider for auth. Separates channels. | |

**User's choice:** Resend
**Notes:** Already installed and configured for contact form emails

---

## Account Management Location

| Option | Description | Selected |
|--------|-------------|----------|
| Portal sidebar account page | /portal/account for customers, /admin/settings for admins | ✓ |
| Separate account route | /account outside portal layout, accessible from anywhere | |

**User's choice:** Portal sidebar account page
**Notes:** Fits naturally in sidebar navigation for both customer and admin

---

## Password Reset UX

| Option | Description | Selected |
|--------|-------------|----------|
| 1-hour link, auto-login after reset | Standard, secure. User gets new session immediately. | ✓ |
| 24-hour link, auto-login after reset | More generous window, less secure. | |
| 1-hour link, manual re-login | More secure, standard for high-security apps. | |

**User's choice:** 1-hour expiry link, auto-login after reset

---

## Schema Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full schema upfront | All 8 tables in Phase 1. Later phases add data flows. | ✓ |
| Auth-only now, rest later | Only users, sessions, audit_logs. Add tables per phase. | |

**User's choice:** Full 8-table schema upfront
**Notes:** users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons

---

## Claude's Discretion

- Drizzle migration strategy (push vs generate + migrate)
- Drizzle schema file organization
- Better Auth configuration details
- Redis client implementation choice
- BullMQ worker configuration
- Environment variable structure
- proxy.ts auth middleware implementation
- Setup wizard abuse protection mechanism
- Audit log storage format

## Deferred Ideas

- Social login (Google) — Better Auth supports it, can add in future phase
- Support staff limited admin access — deferred to Phase 2 (dashboard shell)
