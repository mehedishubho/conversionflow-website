---
phase: 17-billing-integration
plan: 03
subsystem: billing, portal, email
tags: [checkout, license-key, api-token, email, copy-to-clipboard, credential-card]

# Dependency graph
requires:
  - phase: 17-billing-integration/plan-01
    provides: OrderCompletedHandler, OrderService.completeOrder(), OrderEvents
provides:
  - Extended getOrderDetails() with licenseKey from licenses table
  - CopyButton inline component with clipboard API + fallback
  - Credential display section on checkout success page (green license key card + amber API token notice)
  - Order confirmation email with orange-bordered API token block
  - API token passed to email from OrderCompletedHandler
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [inline component pattern, clipboard API with execCommand fallback, monospace credential display]

key-files:
  created:
    - src/lib/emails/order-confirmation.ts
  modified:
    - src/app/(portal)/actions/checkout.ts
    - src/app/(portal)/dashboard/checkout/success/page.tsx
deviations: []

decisions:
  - id: impl-credential-card
    choice: Inline credential section with green (license key) and amber (API token) cards
    rationale: Per UI-SPEC.md distinct visual blocks for different credential types
  - id: impl-api-token-display
    choice: Success page shows email-delivery notice not actual token
    rationale: API token stored as hash only, plaintext available once during generation
  - id: impl-copy-button
    choice: Inline CopyButton with clipboard API + execCommand fallback
    rationale: Works across browsers including older ones without clipboard API
