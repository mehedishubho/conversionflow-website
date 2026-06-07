# Devsroom ConversionFlow — Plugin Features

> **Everything you need to track, convert, and grow your WooCommerce store — in one plugin.**

---

## 🎯 Meta Conversions API (CAPI)

### Server-Side Tracking That Actually Works

Browser pixels miss up to 30% of purchases due to ad blockers and iOS privacy changes. ConversionFlow sends purchase events directly from your server to Facebook — so every sale counts.

- **6 Automated Events** — Purchase, Delivered, Shipping, Returned, Cancelled, Confirmed — all sent automatically on order status changes
- **Auto-Purchase Engine** — Trusted customers? Their purchases are sent instantly. New customers? Hold for manual review. You control the threshold
- **Advanced Matching** — SHA256 hashed email, phone, name, city, and IP for better ad targeting
- **Multi-Pixel Support** — Send events to multiple Facebook pixels at once (agency-friendly)
- **Duplicate Prevention** — UUID-based event IDs ensure Meta never double-counts
- **Test Mode** — Built-in test event codes for safe debugging before going live

---

## 📊 Multi-Channel Tracking

### One Dashboard. 7 Platforms. Zero Headaches.

Stop installing 7 different tracking scripts manually. ConversionFlow injects and manages all your pixels from a single settings page.

| Platform               | What You Get                                                 |
| ---------------------- | ------------------------------------------------------------ |
| **Meta Pixel**         | PageView, ViewContent, AddToCart, InitiateCheckout, Purchase |
| **Google Analytics 4** | Measurement Protocol server-side events + browser tracking   |
| **Google Ads**         | Conversion tracking with AW ID                               |
| **TikTok Pixel**       | Full event tracking with advanced matching                   |
| **Pinterest Tag**      | Conversion events for Pinterest ads                          |
| **Bing UET**           | Microsoft Advertising tracking                               |
| **Google Tag Manager** | Centralized tag management or data-layer-only mode           |

### Privacy Built In

- ✅ GDPR consent management toggle
- ✅ Respects browser Do Not Track (DNT)
- ✅ Domain verification for Meta & Google Ads
- ✅ GA4 server-side container support

---

## 📦 Courier Automation

### Auto-Sync Orders with Steadfast, Pathao & RedX

Stop manually checking courier websites. ConversionFlow syncs your shipment statuses automatically.

- **3 Major Couriers** — Steadfast, Pathao, and RedX integrated out of the box
- **Auto Background Sync** — Choose your interval: 15 min, 1 hour, 6 hours, 12 hours, or daily
- **Auto Status Mapping** — Courier says "Delivered" → WooCommerce order marked complete. "Returned" → marked returned. Automatically
- **Create Shipments from WooCommerce** — No need to open the courier website. Create orders directly from your admin
- **Connection Testing** — Verify your API credentials with one click before saving
- **Retry on Failure** — Up to 3 automatic retry attempts if sync fails
- **Courier Analytics** — See success vs. failure rates per courier right on your dashboard
- **Tracking IDs Stored** — Every tracking number saved as order meta for easy reference

---

## 🛡️ Fraud Shield

### Block Fake Orders Before They Happen

Bad orders cost you money — in courier fees, returned products, and wasted time. Fraud Shield stops them at checkout.

- **Global Blacklist** — Block customers by phone number, email, or IP address
- **Velocity Limits** — Set max orders per phone/email/IP in a 24-hour window to prevent spam orders
- **One-Click Block from Orders Table** — See a bad order? Block the phone, email, and IP in one click
- **Customer History Lookup** — See every customer's past success/cancel ratio before approving
- **Visual History Bar** — Color-coded percentage bar shows delivery reliability at a glance
- **Silent or Visible Blocking** — Choose whether blocked customers see a notice or get blocked silently

---

## 🔄 Incomplete Orders Recovery

### Capture Every Abandoned Checkout — As It Happens

Most stores lose 70% of checkouts to abandonment. ConversionFlow captures customer data **as they type** — so you can recover them.

- **Real-Time Capture** — Name, phone, email, address, cart contents, and cart total saved as the customer types
- **One-Click Convert to Order** — See a hot lead? Convert it to a full WooCommerce order with one click
- **Customer History** — See success/cancel ratio for every lead's phone number
- **IP Geolocation** — Know where your abandonments are coming from (city, region, country)
- **Search & Filter** — Find leads by phone, name, or email instantly
- **CSV Export** — Export all leads for your sales team or CRM
- **Bulk Delete** — Clean up old leads in bulk

---

## 💰 Partial Payment System

### Let Customers Pay in Advance — On Your Terms

COD orders are risky. Partial payments reduce that risk by collecting booking money upfront.

- **Flexible Advance Rules** — Set a fixed amount, a percentage of order total, or let customers choose
- **Gateway-Specific Rules** — Configure separate advance amounts for bKash, Nagad, and Rocket with merchant phone numbers
- **Category & Product Overrides** — Need different advance rules for specific products or categories? No problem
- **Variation Support** — Rules work with product variations too
- **Minimum Advance** — Set a floor so customers can't pay too little

### 🔒 COD Protection (PRO)

- Require booking money on risky COD orders
- Make booking money refundable to build trust
- Configurable fixed or percentage amount

### 📋 Preorder System (PRO)

- Accept preorders for out-of-stock products
- Collect advance payment at preorder
- Customizable preorder message on product page
- Auto-convert to regular order when stock arrives

### 🔔 Payment Notifications

- Advance received confirmation
- Remaining payment reminders (configurable days)
- Payment completion notice
- Preorder updates
- All via email and/or SMS (your choice)

---

## ✅ 10 Custom Order Statuses

### Track Every Stage of Your Order Pipeline

Default WooCommerce has limited statuses. ConversionFlow adds 10 color-coded statuses tailored for COD-heavy markets.

| Status                   | Color       | When It's Used               |
| ------------------------ | ----------- | ---------------------------- |
| 🟢 Purchase              | Green       | Auto-approved trusted orders |
| 🟢 Confirmed             | Light Green | Manually verified orders     |
| 🔵 Shipping              | Blue-Gray   | Out for delivery via courier |
| 🟦 Delivered             | Teal        | Successfully delivered       |
| 🔴 Returned              | Red         | Returned by customer         |
| 🔴 Cancelled             | Red         | Order cancelled              |
| 🟣 Autosave              | Purple      | Auto-saved draft order       |
| 🟣 Partially Paid        | Purple      | Advance payment received     |
| 🟠 Awaiting Verification | Orange      | Pending manual review        |
| 🔴 Payment Due           | Red         | Remaining balance pending    |

Every status automatically triggers the corresponding Meta CAPI event — no manual action needed.

---

## 📈 Smart Dashboard

### Your Store's Performance at a Glance

A modern, beautiful admin dashboard that shows you what matters — without overwhelming you.

- **Revenue Card** — Total revenue for 7, 15, 30, or 90 days
- **Orders Card** — Order count for your selected period
- **Open Leads Card** — Unconverted abandoned checkouts waiting for action
- **Fraud Shielded Card** — Blocked fraud attempts count
- **Revenue Trend Chart** — Daily revenue line graph over time
- **Logistics Chart** — Courier success vs. failure rates
- **Order Volume Chart** — Orders broken down by status
- **Quick Toggles** — Enable or disable features with one click from the dashboard

---

## 📬 Automated Notifications

### Keep Customers Informed — Automatically

Send email and SMS notifications when order status changes. No manual work needed.

- **3 Trigger Events** — Shipped, Delivered, Returned
- **Editable Email Templates** — Customize the HTML email content with placeholders: `[order_id]`, `[customer_name]`, `[tracking_id]`, `[courier_name]`
- **SMS Support** — Works with any SMS gateway via hook integration
- **Per-Event Control** — Enable email, SMS, or both — independently for each event

---

## 📝 Activity Log

### Full Audit Trail for Your Store

Know exactly what happened, when, and by whom.

- Logs every settings change, license action, courier sync, notification, status update, and fraud action
- Tracks user ID, IP address, and timestamp
- Configurable retention: 7, 15, 30 days, or keep forever
- Automatic old log cleanup

---

## 🌙 Modern Admin UI

### Dark Mode. Light Mode. Beautiful Either Way.

ConversionFlow's admin interface looks like a premium SaaS product — not a typical WordPress plugin.

- **Dark / Light Theme** — Toggle instantly, persists across sessions
- **Glassmorphism Design** — Modern translucent cards with smooth animations
- **Responsive Sidebar** — Works perfectly on mobile and tablet
- **Toast Notifications** — Non-blocking feedback for every action
- **Color-Coded Badges** — Instantly recognize order statuses and flags
- **Mobile-First Layout** — Full functionality on any screen size

---

## 🔐 License & Security

### Enterprise-Grade Protection

- **Domain-Bound License** — One license per domain, no sharing
- **AES-256-CBC Encryption** — Your license key is securely encrypted
- **7-Day Free Trial** — Full access to all features, no credit card needed
- **4 License Tiers** — Free, Yearly, 2 Years, Lifetime
- **Remote Activation** — Activate and deactivate from your devsroom.com account
- **Integrity Guard** — Built-in tamper detection keeps your plugin safe

---

## 🔗 WooCommerce Compatibility

### Works With What You Already Use

| Integration                  | Status                                      |
| ---------------------------- | ------------------------------------------- |
| **WooCommerce**              | ✅ Core — required                          |
| **CartFlows**                | ✅ Checkout funnel compatible               |
| **Pixel Your Site**          | ✅ Conflict detection built-in              |
| **Facebook for WooCommerce** | ✅ Conflict detection built-in              |
| **HPOS**                     | ✅ High-Performance Order Storage supported |
| **WordPress Multisite**      | ✅ License per site                         |
| **Any SMS Gateway**          | ✅ Hook-based integration                   |

---

## 💎 License Plans

### Choose the Plan That Fits Your Store

| Feature                              | Free | Yearly | 2 Years | Lifetime |
| ------------------------------------ | ---- | ------ | ------- | -------- |
| Basic Dashboard                      | ✅   | ✅     | ✅      | ✅       |
| Custom Order Statuses                | ✅   | ✅     | ✅      | ✅       |
| Basic Partial Payments               | ✅   | ✅     | ✅      | ✅       |
| Meta CAPI Tracking                   | —    | ✅     | ✅      | ✅       |
| Multi-Channel Tracking (7 platforms) | —    | ✅     | ✅      | ✅       |
| Courier Automation                   | —    | ✅     | ✅      | ✅       |
| Incomplete Orders Recovery           | —    | ✅     | ✅      | ✅       |
| Fraud Shield                         | —    | ✅     | ✅      | ✅       |
| Analytics Dashboard                  | —    | ✅     | ✅      | ✅       |
| Activity Logging                     | —    | ✅     | ✅      | ✅       |
| Advanced Partial Payments            | —    | —      | —       | ✅       |
| COD Protection                       | —    | —      | —       | ✅       |
| Preorder System                      | —    | —      | —       | ✅       |
| Category/Product Rules               | —    | —      | —       | ✅       |
| Priority Support                     | —    | —      | ✅      | ✅       |

---

> **Built by [Devsroom](https://devsroom.com)** — Premium WooCommerce Solutions for Bangladesh & Beyond
