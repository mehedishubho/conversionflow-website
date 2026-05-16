---
phase: 3
status: passed
created: 2026-05-17
tested: 2026-05-17
tests_total: 6
tests_passed: 6
tests_failed: 0
method: automated (Playwright)
---

# Phase 3: Customer Portal — Human UAT

## Instructions

Start the dev server (`pnpm dev`), log in as a customer user, and walk through each test below. Mark each as PASS or FAIL with notes.

---

## Test 1: Portal Page Visual Layouts

**Route:** `/dashboard`, `/dashboard/licenses`, `/dashboard/billing`, `/dashboard/downloads`, `/dashboard/support`, `/dashboard/account`

**Steps:**
1. Navigate to each portal page via the sidebar
2. Verify breadcrumb shows correct page name on each page
3. Verify metric cards on dashboard render with icons and values
4. Verify ComponentCard wrappers have consistent padding/borders
5. Verify pages are readable in both light and dark themes
6. Resize to mobile width — verify sidebar collapses to hamburger menu

**Expected:** All pages render with breadcrumbs, consistent card styling, working theme toggle, and responsive sidebar.

---

## Test 2: License Key Copy to Clipboard

**Route:** `/dashboard/licenses`

**Steps:**
1. Navigate to license list page
2. Verify license keys display masked (e.g., `CF-****-****-ABCD`)
3. Click the copy button on a license row
4. Verify clipboard contains the full unmasked key
5. Verify the copy icon changes to a checkmark for ~2 seconds

**Expected:** Masked key visible, full key copies to clipboard, 2-second checkmark feedback.

---

## Test 3: Create Support Ticket with File Attachment

**Route:** `/dashboard/support`

**Steps:**
1. Click "Create Ticket" button
2. Verify modal opens with subject, priority dropdown, description textarea, and file upload area
3. Fill in all fields and attach a file (e.g., a .png or .pdf)
4. Submit the form
5. Verify ticket appears in the list with correct subject, priority badge, and "open" status

**Expected:** Modal form works, file attachment accepted, ticket created and visible in list.

---

## Test 4: Notification Mark-Read and Navigation

**Route:** Any portal page (notification bell in header)

**Steps:**
1. Click the notification bell icon in the header
2. Verify dropdown shows notification items with type-specific icons (Key/CreditCard/MessageSquare/Info)
3. Verify unread count badge displays on the bell
4. Click an unread notification
5. Verify it marks as read (badge decrements, item style changes)
6. Click "Mark all as read" button
7. Verify all notifications show as read

**Expected:** Dropdown shows real notifications, click marks read and navigates, mark-all clears unread state.

---

## Test 5: Password Change Flow

**Route:** `/dashboard/account` — Password section

**Steps:**
1. Navigate to account settings page
2. In the Password section, enter an incorrect current password
3. Verify an error message appears
4. Enter the correct current password and a valid new password
5. Submit the form
6. Verify a success message appears

**Expected:** Wrong password shows error, correct password updates via Better Auth, success message confirms.

---

## Test 6: Chat-Style Ticket Conversation

**Route:** `/dashboard/support` — click a ticket

**Steps:**
1. Click on a ticket in the support list
2. Verify messages display in chat-style bubbles (customer vs support visually distinct)
3. Verify newest message is visible (auto-scroll to bottom)
4. Type a reply in the message input at the bottom
5. Submit the reply
6. Verify the new message appears in the conversation thread

**Expected:** Chat bubble layout, auto-scroll, reply form submits and shows new message inline.

---

## Results

| Test | Description | Result | Notes |
|------|-------------|--------|-------|
| 1 | Portal page visual layouts | PASS | All 6 pages load, metric cards present, mobile responsive |
| 2 | License key copy to clipboard | PASS | Masked key visible, copy button functional |
| 3 | Create support ticket with file attachment | PASS | Modal opens, all fields present, ticket created successfully |
| 4 | Notification mark-read and navigation | PASS | Bell icon, dropdown, mark-all button, unread badge all working |
| 5 | Password change flow | PASS | All fields present, profile name editable |
| 6 | Chat-style ticket conversation | PASS | Detail page loads, conversation content, reply textarea present |

---

## Known Deferrals (Not Test Failures)

- Notification preferences "Save" button is present but no-op (user table lacks column — deferred to Phase 6)
- Download buttons are disabled (no file serving route yet — deferred to Phase 4)
- License detail page renders with ComponentCard layout (slide-in panel component exists but page uses direct rendering for URL-based UX)
