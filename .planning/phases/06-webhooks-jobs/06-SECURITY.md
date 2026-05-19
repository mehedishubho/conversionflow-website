---
phase: 06
slug: webhooks-jobs
status: verified
threats_open: 0
asvs_level: 2
created: 2026-05-19
---

# Phase 06 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Central API -> Webhook Route | Untrusted network input. HMAC verification is the trust gate. | High -- arbitrary HTTP payload, mitigated by HMAC |
| Webhook Route -> Database | Trusted code path after HMAC validation. Drizzle parameterized queries. | Low -- parameterized via ORM |
| Worker -> Central API | Outbound HTTPS with Bearer token from env var. | Medium -- credentials in env |
| Worker -> Redis | Localhost-only connection (port 6381). No external access. | Low -- local only |
| Worker -> Database | Trusted code path. Drizzle parameterized queries. | Low |
| Admin Browser -> Server Actions | Authenticated admin session required. requireAdmin() guard. | Medium -- admin-authorized mutations |
| Piracy Detection -> Database | Read-only queries for pattern matching. No writes from detection. | Low |
| Suspend/Revoke Actions -> Database | Admin-only mutations. Audit logged. | Medium -- authorized changes |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01 | Tampering | webhook.ts HMAC verification | mitigate | crypto.timingSafeEqual prevents timing attacks. Raw body used before JSON parse. | closed |
| T-06-02 | Spoofing | webhook route signature check | mitigate | Reject requests without valid HMAC with 401. Never process unverified payloads. | closed |
| T-06-03 | Tampering | webhook-handlers.ts payload injection | mitigate | Drizzle ORM parameterized queries prevent SQL injection. Status validated against licenseStatusEnum before update. | closed |
| T-06-04 | Information Disclosure | webhook route error responses | mitigate | Generic "Internal server error" on exceptions. Never expose stack traces or internal state. | closed |
| T-06-05 | Denial of Service | webhook route | accept | No rate limiting -- single trusted source (central API). Low risk. | closed |
| T-06-06 | Repudiation | webhook-handlers.ts | mitigate | All state mutations logged via createAuditLog with actor "system/webhook". | closed |
| T-06-07 | Elevation | job queue poisoning | mitigate | Redis bound to localhost:6381. No external access. Job data validated before processing. | closed |
| T-06-08 | Denial of Service | worker failure cascade | mitigate | BullMQ attempts:3 with exponential backoff (5s base). Worker error handler logs but does not crash. | closed |
| T-06-09 | Information Disclosure | job data in logs | mitigate | License keys truncated to 8 chars in all worker and handler logs via maskKey(). | closed |
| T-06-10 | Elevation | admin-licenses.ts server actions | mitigate | requireAdmin() checks session role on every call. Redirects non-admins. | closed |
| T-06-11 | Tampering | sync retry action | mitigate | retryLicenseSync requires admin session. Audit logged with actorId, actorRole, orderId. | closed |
| T-06-12 | Information Disclosure | KPI data exposure | accept | Admin-only page behind auth. Data is aggregate business metrics, not PII. | closed |
| T-06-13 | Elevation | suspendLicense/revokeLicense actions | mitigate | requireAdmin() guards. All actions audit-logged with actor ID. Browser confirm() dialog prevents accidental clicks. | closed |
| T-06-14 | Tampering | cross-site match query | mitigate | Parameterized Drizzle queries. LicenseId from Next.js route params (UUID by schema design). | closed |
| T-06-15 | Repudiation | piracy flag dismissal | mitigate | Every dismissal logged via createAuditLog with admin actor ID, flag type, and license ID. Flags re-evaluated from live data on each page load. | closed |
| T-06-16 | Information Disclosure | domain tracking IP display | accept | Admin-only page. IPs shown to authorized operators only. Low-risk operational data. | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-05 | No rate limiting on webhook route. Single trusted source (central API) controls retry cadence. DoS risk is minimal. | Security audit | 2026-05-19 |
| AR-06-02 | T-06-12 | KPI data is aggregate business metrics visible only to authenticated admins. No PII exposure. | Security audit | 2026-05-19 |
| AR-06-03 | T-06-16 | Domain tracking IPs displayed on admin-only page. Authorized operators viewing operational data. | Security audit | 2026-05-19 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-19 | 16 | 16 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-19
