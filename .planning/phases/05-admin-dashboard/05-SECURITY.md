---
phase: 05
slug: admin-dashboard
status: verified
threats_open: 0
asvs_level: 2
created: 2026-05-18
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| URL searchParams -> server action | Date range and filter values from URL passed to SQL queries | Low — validated against hardcoded enums |
| Client component -> server action | OrderId, role, ban values from UI sent to server actions | Medium — requireAdmin guard + input validation |
| Email sending | Resend API call with customer email address | PII — admin-authorized action |
| User data visibility | Admin viewing other users' data (orders, licenses, activity) | PII — admin-authorized access |
| Notification type filter | Admin notification queries filter by type array | Low — hardcoded whitelist |
| CSV export -> file download | Client-side Blob generation with data from server | Business data — admin-authorized |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | S | admin-dashboard.ts | mitigate | requireAdmin() guard on all server actions | closed |
| T-05-02 | T | getRevenueChartData | mitigate | Date range validated against hardcoded enum before sql.raw(); truncMap hardcoded | closed |
| T-05-03 | I | Dashboard page | accept | Admin-only pages, authorized data | closed |
| T-05-04 | T | markAsPaid | mitigate | verifyOrder validates order is pending + requireAdmin guard | closed |
| T-05-05 | T | sendPaymentReminder | mitigate | Validates orderId exists + pending status + customer email before sending | closed |
| T-05-06 | I | Invoice data | accept | Admin-only business records | closed |
| T-05-07 | T | changeUserRole | mitigate | Role validated against VALID_ROLES enum | closed |
| T-05-08 | T | toggleUserBan | mitigate | Validate ban boolean + require non-empty reason + requireAdmin | closed |
| T-05-09 | E | Role elevation | mitigate | Server compares caller role: only super_admin can assign super_admin | closed |
| T-05-10 | I | User detail page | accept | Admin-only page, authorized data | closed |
| T-05-11 | T | getFullActivity | mitigate | Event type mapped through hardcoded filter map; Drizzle parameterized queries | closed |
| T-05-12 | I | CSV export data | accept | Admin-only export of business data | closed |
| T-05-13 | T | CSV injection | mitigate | CSV values quoted with double-quote escaping; BOM prefix | closed |
| T-05-14 | E | Admin notification access | mitigate | getAdminNotifications checks session role is admin/super_admin | closed |
| T-05-15 | I | Notification data leakage | mitigate | Admin notifications scoped to userId with ADMIN_NOTIFICATION_TYPES whitelist | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-03 | Dashboard displays aggregate data admin is authorized to see | Security audit | 2026-05-18 |
| AR-05-02 | T-05-06 | Invoice data is business records admin is authorized to manage | Security audit | 2026-05-18 |
| AR-05-03 | T-05-10 | User detail page shows data admin is authorized to manage | Security audit | 2026-05-18 |
| AR-05-04 | T-05-12 | CSV export is admin-only export of authorized business data | Security audit | 2026-05-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-18 | 15 | 15 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-18
