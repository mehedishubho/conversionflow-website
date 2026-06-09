---
phase: 27-customer-billing-integration
plan: FIX
type: execute
wave: 1
depends_on: []
files_modified:
  - src/modules/notifications/application/catalog/EventCatalog.ts
  - src/modules/notifications/application/services/NotificationService.ts
  - src/app/(portal)/actions/checkout.ts
  - src/app/(portal)/dashboard/checkout/page.tsx
  - src/app/(admin)/actions/admin-products.ts
  - src/app/(admin)/actions/admin-coupons.ts
  - src/app/(admin)/admin/coupons/page.tsx
  - src/app/(admin)/admin/coupons/new/page.tsx
  - src/components/admin/CouponsTable.tsx
  - src/data/dashboard-nav.ts
  - src/components/admin/OrdersTable.tsx
  - src/app/(admin)/admin/orders/[id]/page.tsx
autonomous: true
requirements:
  - LSTAT-05
  - LSTAT-06
  - ARCH-06
  - ARCH-08

must_haves:
  truths:
    - "Order completed event sends exactly ONE email — the correct one from OrderCompletedHandler"
    - "Admin price changes in dashboard propagate to checkout page immediately"
    - "Admin can create, list, toggle, and delete coupon codes from /admin/coupons"
    - "All orders show a View Details link regardless of status"
    - "Completed orders display Verified badge instead of no action"
  artifacts:
    - path: "src/app/(admin)/actions/admin-coupons.ts"
      provides: "CRUD server actions for coupon management"
      exports: ["listCoupons", "createCoupon", "toggleCouponActive", "deleteCoupon"]
    - path: "src/app/(admin)/admin/coupons/page.tsx"
      provides: "Admin coupon list page"
    - path: "src/app/(admin)/admin/coupons/new/page.tsx"
      provides: "Create coupon form page"
    - path: "src/components/admin/CouponsTable.tsx"
      provides: "Coupon list table component"
    - path: "src/app/(admin)/admin/orders/[id]/page.tsx"
      provides: "Order detail page"
  key_links:
    - from: "src/data/dashboard-nav.ts"
      to: "/admin/coupons"
      via: "nav entry with Ticket icon"
      pattern: "Coupons.*admin/coupons"
    - from: "src/app/(admin)/actions/admin-products.ts"
      to: "src/app/(portal)/actions/checkout.ts"
      via: "clearPlanPricesCache() call after plan update"
      pattern: "clearPlanPricesCache"
    - from: "src/modules/notifications/application/catalog/EventCatalog.ts"
      to: "order.completed"
      via: "channels array without email"
      pattern: "channels.*in_app"
---

<objective>
Fix 4 diagnosed gaps from Phase 27 UAT testing.

Purpose: Resolve 4 major-severity issues found during UAT — duplicate emails on order completion, stale price cache after admin plan updates, missing coupon admin UI, and non-interactive order rows for completed orders.

Output: All 4 gaps closed, UAT tests 2/6/9/10 passing on re-test.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/17-billing-integration/27-UAT.md

<interfaces>
<!-- Existing patterns executor must use -->

From src/lib/db/schema.ts (coupons table):
```typescript
export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "flat"]);
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: integer("value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});
```

From src/lib/auth-guard.ts:
```typescript
export async function requireAdmin(): Promise<{ session: SessionWithRole }>
```

From src/data/dashboard-nav.ts (adminNavItems pattern):
```typescript
import { Ticket } from "lucide-react";
// Add to adminNavItems array:
{ name: "Coupons", icon: Ticket, path: "/admin/coupons" }
```

From src/modules/notifications/application/catalog/EventCatalog.ts:
```typescript
// Current order.completed entry (line 30):
"order.completed": {
  channels: ["email", "in_app"],  // email causes duplicate
  template: "sendOrderConfirmationEmail",
  category: "billing",
  title: "Order Confirmed",
},
```

From src/app/(portal)/actions/checkout.ts:
```typescript
// Module-level cache that never invalidates (line 29):
let cachedPlanPrices: Record<string, { amount: number; productId: string }> | null = null;
// getPlanPrices() at line 36 returns cached value if set
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix duplicate email race condition (Gap 3 — UAT Test 9)</name>
  <files>src/modules/notifications/application/catalog/EventCatalog.ts, src/modules/notifications/application/services/NotificationService.ts</files>
  <action>
Two-part fix for the duplicate email sent when an order completes.

**Part A — EventCatalog.ts:** Change the `order.completed` entry's `channels` from `["email", "in_app"]` to `["in_app"]` only. The `OrderCompletedHandler` in the billing module already sends the correct, fully-populated email directly via `sendOrderConfirmationEmail()`. The NotificationService was also enqueueing a SECOND email job with undefined subject/html/from fields through BullMQ — that broken second email is what the customer sees. By removing "email" from the catalog channels, NotificationService will only create an in-app notification for `order.completed`, which is the correct behavior (in_app notification stays, email is already handled by the billing handler).

**Part B — NotificationService.ts (defensive guard):** In the `handleEvent` method, inside the email enqueue block (around line 152-166), add a validation check before adding to the email queue. If the event type does not have a real email template that the email worker can use (check that `entry.template` maps to an actual importable function), skip the enqueue. This is a safety net: add a check `if (!entry.template || entry.channels.includes("email") === false)` before the `emailQueue.add()` call — actually, since we already filtered by `enabledChannels`, just add a comment explaining why order.completed is in_app only and that billing handlers own the email for that event.

**Why this approach:** The cleanest fix is removing "email" from the catalog entry. The OrderCompletedHandler already sends the correct email with licenseKey and apiToken. The NotificationService was never meant to duplicate that email — it was an accidental overlap. The in_app channel is still valuable for the notification bell UI.
  </action>
  <verify>
    <automated>cd "d:\Devsroom-Work\conversionflow-website" && grep -n '"order.completed"' src/modules/notifications/application/catalog/EventCatalog.ts | head -5</automated>
    Expected: The channels array for order.completed should show ["in_app"] only, not ["email", "in_app"].
  </verify>
  <done>
    - EventCatalog order.completed channels changed to ["in_app"] only
    - Only ONE email sent on order completion (from OrderCompletedHandler)
    - In-app notification still created for notification bell
    - No more broken second email with undefined fields
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix stale price cache after admin plan updates (Gap 4 — UAT Test 10)</name>
  <files>src/app/(portal)/actions/checkout.ts, src/app/(portal)/dashboard/checkout/page.tsx, src/app/(admin)/actions/admin-products.ts</files>
  <action>
Three-part fix to synchronize price sources after admin updates.

**Part A — checkout.ts:** Export a `clearPlanPricesCache()` function that sets `cachedPlanPrices = null`. This allows admin mutations to invalidate the module-level cache. Place it right after the `getPlanPrices()` function:

```typescript
/** Invalidate cached plan prices. Call after admin plan mutations. */
export function clearPlanPricesCache(): void {
  cachedPlanPrices = null;
}
```

Also export `getPlanPrices` so the checkout page can call it as a server action. Change the existing `getPlanPrices()` from a private function to an exported async function. Add `"use server"` at the top — but wait, checkout.ts already has `"use server"`. So just make the function exported.

**Part B — admin-products.ts:** In the `updatePlan()` function, after the successful `db.update()` and audit log (around line 549-558), add cache invalidation and path revalidation:

```typescript
import { clearPlanPricesCache } from "@/app/(portal)/actions/checkout";
import { revalidatePath } from "next/cache";

// After the db.update() and audit log in updatePlan():
clearPlanPricesCache();
revalidatePath("/dashboard/checkout");
```

Do the same in `createPlan()` and `deletePlan()` — any plan mutation should clear the cache.

**Part C — checkout/page.tsx:** Replace the hardcoded `planPrices` object (lines 17-21) with a dynamic server-side fetch. Since this is a `"use client"` component, the prices are used client-side. The fix: create a new exported server action in checkout.ts called `getCheckoutPrices()` that calls the existing `getPlanPrices()` and returns a simple `Record<string, number>`. Then in the checkout page, fetch prices in the existing `useEffect` alongside VAT and payment accounts. Add a `planPrice` state and fetch it on mount:

```typescript
// Remove hardcoded planPrices object (lines 17-21)
// Add to the useEffect load() function:
const pricesResult = await getCheckoutPrices();
setPlanPriceMap(pricesResult);
```

Where `getCheckoutPrices()` is a new exported async function in checkout.ts:
```typescript
export async function getCheckoutPrices(): Promise<Record<string, number>> {
  const prices = await getPlanPrices();
  const result: Record<string, number> = {};
  for (const [name, data] of Object.entries(prices)) {
    result[name.toLowerCase()] = data.amount;
  }
  return result;
}
```

Add `planPriceMap` state and use it to resolve `basePrice` instead of the hardcoded object.
  </action>
  <verify>
    <automated>cd "d:\Devsroom-Work\conversionflow-website" && grep -n "clearPlanPricesCache" src/app/(admin)/actions/admin-products.ts && grep -n "revalidatePath" src/app/(admin)/actions/admin-products.ts && grep -n "getCheckoutPrices" src/app/(portal)/dashboard/checkout/page.tsx</automated>
    Expected: clearPlanPricesCache called in admin-products.ts, revalidatePath called after plan mutations, checkout page uses dynamic prices.
  </verify>
  <done>
    - clearPlanPricesCache() exported from checkout.ts
    - Admin plan mutations (create, update, delete) invalidate the cache
    - revalidatePath("/dashboard/checkout") called after plan mutations
    - Checkout page fetches prices from server instead of hardcoded object
    - Admin can change plan price and see it reflected on checkout immediately
  </done>
</task>

<task type="auto">
  <name>Task 3: Create Coupon Admin UI (Gap 1 — UAT Test 2)</name>
  <files>src/app/(admin)/actions/admin-coupons.ts, src/app/(admin)/admin/coupons/page.tsx, src/app/(admin)/admin/coupons/new/page.tsx, src/components/admin/CouponsTable.tsx, src/data/dashboard-nav.ts</files>
  <action>
Build the complete coupon CRUD admin interface. Follow the established patterns from admin-orders.ts (requireAdmin guard, audit logging) and admin products page (ComponentCard, table component, server actions).

**File 1 — src/app/(admin)/actions/admin-coupons.ts:**
Create with these exported server actions:

1. `listCoupons()` — Query all coupons from DB, ordered by createdAt desc. Return array of coupon rows. No auth needed (called from server component), but add `requireAdmin()` from `@/lib/auth-guard` for safety.

2. `createCoupon(formData: FormData)` — Validate: code (required, uppercase, min 3 chars), type ("percentage" or "flat"), value (required positive int, if percentage must be 1-100), minOrderAmount (optional int), maxUses (optional int), expiresAt (optional ISO date string). Insert into coupons table. Audit log `coupon.created`. Return `{ success: true }` or `{ error: string }`.

3. `toggleCouponActive(couponId: string)` — Fetch coupon, flip active boolean. Audit log `coupon.toggled`. Return success/error.

4. `deleteCoupon(couponId: string)` — Delete from coupons table. Audit log `coupon.deleted`. Return success/error.

Use `requireAdmin()` guard pattern from admin-orders.ts (import from `@/lib/auth-guard`). Import `coupons` from `@/lib/db/schema`, `db` from `@/lib/db`, `createAuditLog` from `@/lib/audit`.

**File 2 — src/components/admin/CouponsTable.tsx:**
Client component (`"use client"`). Follow OrdersTable pattern:
- Props: `coupons` array, `onToggleActive`, `onDelete`
- Columns: Code, Type (percentage/flat badge), Value, Min Order, Uses (current/max), Expires, Status (active/inactive badge), Actions
- Actions: Toggle Active/Inactive button, Delete button with confirmation
- Use same UI components: Table, Badge, Button, Modal from existing imports
- Format: percentage shows "20%", flat shows "500 BDT"

**File 3 — src/app/(admin)/admin/coupons/page.tsx:**
Server component. Follow admin/products/page.tsx pattern:
- `await requireAdmin()` from auth-guard
- `export const dynamic = "force-dynamic"`
- Query coupons from DB
- PageBreadcrumb, ComponentCard wrapper
- "Add Coupon" link to /admin/coupons/new
- Render CouponsTable with server actions bound

**File 4 — src/app/(admin)/admin/coupons/new/page.tsx:**
Server component with a client form. Create a simple form (can be inline, no separate component file needed — use the pattern from other admin forms):
- Fields: Code (text), Type (select: percentage/flat), Value (number), Min Order Amount (number, optional), Max Uses (number, optional), Expires At (date input, optional)
- Submit calls `createCoupon` action
- Redirect to /admin/coupons on success
- Show error message on failure

Actually, since this needs `"use client"` for form state, create the page as a server component wrapper that imports a client `CreateCouponForm` component. Or use the simpler approach: make the new page a server component with a form that has `action={createCoupon}` using the Next.js server action form pattern (no client JS needed for basic forms). Use `<form action={createCoupon}>` with native inputs.

**File 5 — src/data/dashboard-nav.ts:**
Add to `adminNavItems` array, between "Products" and "Licenses" (after line 42):
```typescript
{ name: "Coupons", icon: Ticket, path: "/admin/coupons" },
```
Import `Ticket` from lucide-react (already in the import block — check and add if missing).
  </action>
  <verify>
    <automated>cd "d:\Devsroom-Work\conversionflow-website" && test -f src/app/\(admin\)/actions/admin-coupons.ts && test -f src/app/\(admin\)/admin/coupons/page.tsx && test -f src/components/admin/CouponsTable.tsx && grep -c "Coupons" src/data/dashboard-nav.ts</automated>
    Expected: All 3 new files exist, dashboard-nav has Coupons entry (count > 0).
  </verify>
  <done>
    - /admin/coupons route shows coupon list with table
    - Admin can create new coupons via /admin/coupons/new
    - Admin can toggle coupon active/inactive
    - Admin can delete coupons
    - "Coupons" appears in admin sidebar navigation
    - All coupon actions are audit-logged
    - Coupons table shows code, type, value, usage count, expiry, status
  </done>
</task>

<task type="auto">
  <name>Task 4: Add View Details to all orders and order detail page (Gap 2 — UAT Test 6)</name>
  <files>src/components/admin/OrdersTable.tsx, src/app/(admin)/admin/orders/[id]/page.tsx</files>
  <action>
Two-part fix to make all orders interactive regardless of status.

**Part A — OrdersTable.tsx:**
1. Add a "View Details" link to ALL orders regardless of status. In the Actions column `<div className="flex items-center gap-2">`, add a Link component before the status-specific buttons:

```tsx
import Link from "next/link";

// Inside the actions cell, before the conditional status buttons:
<Link
  href={`/admin/orders/${order.id}`}
  className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
>
  View Details
</Link>
```

This link appears for ALL order statuses (pending, completed, failed, refunded).

2. For completed orders, change the display from showing only "Refund" button to showing both a green "Verified" badge AND the Refund button:

```tsx
{order.status === "completed" && (
  <>
    <Badge variant="light" color="success" size="sm">Verified</Badge>
    <Button size="sm" variant="outline" className="!text-error-500 ..." onClick={...} disabled={isPending}>
      Refund
    </Button>
  </>
)}
```

3. For failed/refunded orders, change "No actions" text to still show "View Details" link (which is already added above).

**Part B — src/app/(admin)/admin/orders/[id]/page.tsx:**
Create a new order detail page. Server component following admin pattern:

```tsx
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { orders, user, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  // Fetch order with user info
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return <div>Order not found</div>;
  }

  // Fetch user
  const [orderUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, order.userId))
    .limit(1);

  // Fetch linked license (if any)
  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.orderId, id))
    .limit(1);

  // Render: order info card + customer info + linked license card
  // Show: order ID, status badge, plan, amount, payment method, payment ref,
  //       created date, coupon code, discount, tax
  // Customer card: name, email
  // License card (if exists): license key, status badge, max activations, expires at
  // Back link to /admin/orders
}
```

The page should display:
- Order Information card: ID, Status (badge), Plan, Amount (BDT formatted), Payment Method, Transaction ID, Coupon Code, Discount Amount, Tax Amount, Created Date
- Customer Information card: Name, Email
- License card (only if license exists): License Key (monospace, copyable text), Status badge, Activations, Expires At
- "Back to Orders" link at the top
  </action>
  <verify>
    <automated>cd "d:\Devsroom-Work\conversionflow-website" && test -f src/app/\(admin\)/admin/orders/\[id\]/page.tsx && grep -c "View Details" src/components/admin/OrdersTable.tsx</automated>
    Expected: Order detail page exists, OrdersTable has "View Details" links.
  </verify>
  <done>
    - Every order row shows "View Details" link regardless of status
    - Completed orders show green "Verified" badge next to Refund button
    - /admin/orders/[id] shows full order details with customer and license info
    - Admin can navigate from order list to order detail and back
    - Failed/refunded orders show "View Details" instead of just "No actions"
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Admin → Coupon CRUD | Authenticated admin creates/modifies discount codes |
| Admin → Order detail | Authenticated admin views order/license info |
| NotificationService → Email queue | Internal event-to-email pipeline |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-27F-01 | E (Elevation) | admin-coupons actions | mitigate | requireAdmin() guard on all coupon actions, consistent with existing admin-actions pattern |
| T-27F-02 | T (Tampering) | coupon value/type | mitigate | Server-side validation: percentage value 1-100, required fields checked, code uppercase normalized |
| T-27F-03 | I (Info Disclosure) | order detail page | mitigate | requireAdmin() guard, only accessible to admin/super_admin roles |
| T-27F-04 | D (DoS) | price cache invalidation | accept | Cache invalidation is O(1), called only on admin plan mutations (rare) |
</threat_model>

<verification>
1. EventCatalog order.completed channels == ["in_app"] only
2. clearPlanPricesCache() exported from checkout.ts
3. admin-products.ts calls clearPlanPricesCache() in createPlan, updatePlan, deletePlan
4. checkout/page.tsx uses dynamic prices, no hardcoded planPrices object
5. /admin/coupons route renders coupon list
6. /admin/coupons/new creates a coupon
7. "Coupons" in admin sidebar nav
8. OrdersTable shows "View Details" link for all statuses
9. Completed orders show "Verified" badge
10. /admin/orders/[id] renders order detail with license info
</verification>

<success_criteria>
All 4 UAT test failures resolved:
- Test 2 (Coupons): Admin can create/manage coupons from /admin/coupons
- Test 6 (Order interactivity): All orders are clickable with View Details; completed show Verified badge
- Test 9 (Email): Exactly ONE correct email sent on order completion
- Test 10 (Price cache): Admin price changes propagate to checkout immediately
</success_criteria>

<output>
After completion, create `.planning/phases/17-billing-integration/27-FIX-SUMMARY.md`
</output>
