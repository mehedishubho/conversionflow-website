---
phase: 20
slug: migration-cleanup
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-04
---

# Phase 20 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Code removal → Runtime | Removing central API field references; must ensure no runtime code paths still depend on them | None (deletion only) |
| Migration script → Database | Script has full DB access via DATABASE_URL for data transforms | License keys, API tokens, user data |
| Migration script → Email service | Script sends emails via Resend API with API tokens in plaintext | API tokens (one-time delivery) |
| Migration script → Filesystem | Script writes backups and log files to disk | Database dump (full backup) |
| Admin settings page → Database | Live query for license count and migration status; admin-only access | License count (low sensitivity) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-20-01 | Tampering | central-api.ts deletion | mitigate | Grep-verified zero imports before deletion; build verification post-deletion | closed |
| T-20-02 | Information Disclosure | .env.example cleanup | accept | Placeholder values only; real credentials replaced with placeholders (CR-02 fix) | closed |
| T-20-03 | Denial of Service | Schema column removal | mitigate | Code references removed first; migration script (Plan 02) handles actual DB column drops | closed |
| T-20-04 | Information Disclosure | API token in email | mitigate | HTML escaping added for all user-controlled fields (CR-03 fix); email sent once per token; logs store only hashes | closed |
| T-20-05 | Tampering | Data loss during migration | mitigate | pg_dump backup before writes; dry-run mode; completion flag prevents re-runs; execFileSync prevents command injection (WR-01 fix) | closed |
| T-20-06 | Denial of Service | FK constraint failure | mitigate | FK data validation inside db.transaction() before schema changes; atomic abort on validation failure | closed |
| T-20-07 | Denial of Service | Bulk email rate limit | accept | Batched sends with 2-second pauses; individual failures logged but do not abort migration | closed |
| T-20-08 | Information Disclosure | License count displayed | accept | Low-sensitivity metric visible only to admin users behind requireAdmin() auth gate | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-20-01 | T-20-02 | .env.example contains only placeholder values; no real secrets exposed | Phase 20 planning | 2026-06-04 |
| AR-20-02 | T-20-07 | Bulk email rate limits handled by batched sends; individual failures non-blocking | Phase 20 planning | 2026-06-04 |
| AR-20-03 | T-20-08 | License count is a low-sensitivity admin-only metric | Phase 20 planning | 2026-06-04 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-04 | 8 | 8 | 0 | gsd-secure-phase (automated) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-04
