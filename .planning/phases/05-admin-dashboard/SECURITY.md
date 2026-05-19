# Phase 05 - Admin Dashboard: Security Verification

**Date:** 2026-05-18
**ASVS Level:** 2
**Block On:** open

---

## Threat Verification Summary

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-05-01 | S | mitigate | CLOSED | `requireAdmin()` guard on all server actions: admin-dashboard.ts:15-30, admin-orders.ts:22-37, admin-users.ts:11-26, admin-activity.ts:10-25, admin-invoices.ts:12-27 |
| T-05-02 | T | mitigate | CLOSED | `DateRange` type is hardcoded union `"7d" \| "30d" \| "90d" \| "year"` (admin-dashboard.ts:36); `truncMap` maps validated range to safe string (admin-dashboard.ts:267-272) before `sql.raw()` |
| T-05-03 | I | accept | CLOSED | Accepted: admin-only authorized data |
| T-05-04 | T | mitigate | CLOSED | `verifyOrder()` calls `requireAdmin()` (admin-orders.ts:44), validates order exists (line 57-59), checks `order.status !== "pending"` (line 61-63) |
| T-05-05 | T | mitigate | CLOSED | `sendPaymentReminder()` calls `requireAdmin()` (admin-invoices.ts:30), validates orderId exists (line 36-44), checks `order.status !== "pending"` (line 46-48), validates customer email (line 58-60) |
| T-05-06 | I | accept | CLOSED | Accepted: admin-only business records |
| T-05-07 | T | mitigate | CLOSED | `VALID_ROLES` hardcoded enum `["customer","admin","support_staff","super_admin"]` (admin-users.ts:144); validated via `VALID_ROLES.includes(newRole)` (line 153) |
| T-05-08 | T | mitigate | CLOSED | `toggleUserBan` calls `requireAdmin()` (admin-users.ts:187); when `ban === true`, requires non-empty reason (lines 203-206) |
| T-05-09 | E | mitigate | OPEN | `changeUserRole` validates role is in `VALID_ROLES` but does NOT prevent an `admin` from escalating to `super_admin`. No caller-role comparison exists between `adminRole` and `newRole`. See admin-users.ts:146-184 |
| T-05-10 | I | accept | CLOSED | Accepted: admin-only page |
| T-05-11 | T | mitigate | CLOSED | Event types mapped through hardcoded `eventTypeMap` (admin-activity.ts:29-35); queries use Drizzle parameterized `sql` template literals with `${auditLogs.action} LIKE` binding (lines 89-90) |
| T-05-12 | I | accept | CLOSED | Accepted: admin-only export |
| T-05-13 | T | mitigate | CLOSED | CSV values escaped via `"${val.replace(/"/g, '""')}"` quoting (csv-export.ts:11); BOM prefix `﻿` prepended (line 23) |
| T-05-14 | E | mitigate | CLOSED | `getAdminNotifications` checks session role is `admin` or `super_admin` (admin-notifications.ts:22-24) |
| T-05-15 | I | mitigate | CLOSED | Admin notifications scoped to `notifications.userId = session.user.id` (admin-notifications.ts:31); plus type restricted to `ADMIN_NOTIFICATION_TYPES` whitelist (lines 9-15, 34) |

---

## Accepted Risks Log

| Threat ID | Category | Rationale |
|-----------|----------|-----------|
| T-05-03 | I (Info Disclosure) | Dashboard page is admin-only; data shown is authorized for admin consumption |
| T-05-06 | I (Info Disclosure) | Invoice data visible only to admin users; business records require admin session |
| T-05-10 | I (Info Disclosure) | User detail page restricted to admin/super_admin roles |
| T-05-12 | I (Info Disclosure) | CSV export accessible only through admin-protected pages and actions |

---

## Open Threats

### T-05-09: Role Elevation -- Admin can set super_admin

**Severity:** E (Elevation of Privilege)
**File:** `src/app/(admin)/actions/admin-users.ts` (lines 146-184)
**Issue:** The `changeUserRole` function validates that `newRole` is in the `VALID_ROLES` list but does not check whether the calling admin's role is sufficient to assign the target role. An `admin` (not `super_admin`) can elevate any user (including themselves) to `super_admin`.
**Expected Mitigation:** Server should compare `adminRole` against `newRole` and reject if caller is `admin` and target role is `super_admin`.
**Suggested Fix:** Add a check such as:
```
if (newRole === "super_admin" && adminRole !== "super_admin") {
  return { error: "Only super admins can assign the super_admin role." };
}
```

---

## Threat Flags from Execution

No unregistered threat flags detected in phase summaries.
