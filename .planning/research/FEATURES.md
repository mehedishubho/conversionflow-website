# Feature Landscape

**Domain:** Self-Contained Licensing System for SaaS Platform
**Researched:** 2026-05-29
**Overall confidence:** MEDIUM

## Executive Summary

Self-contained licensing systems for WordPress plugins and SaaS products follow well-established patterns. Based on research of Easy Digital Downloads Software Licensing, Keygen, WooCommerce license managers, and SaaS licensing practices, the feature landscape is clear: **table stakes** include license generation/validation, activation tracking, domain binding, and subscription lifecycle management. **Differentiators** include offline validation, advanced analytics, and automated compliance enforcement.

**Context Change from v2.0:** This research replaces the central API dependency (`license.devsroom.com`) with completely self-contained licensing managed within ConversionFlow. All licensing operations - generation, validation, activation, revocation - are now internal.

## Table Stakes

Features users expect in a licensing system. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **License Key Generation** | Core requirement - customers expect unique keys for purchases | Medium | Standard formats: 25-32 character alphanumeric strings, often segmented (XXXX-XXXX-XXXX-XXXX) |
| **License Validation API** | Plugin must verify license authenticity on each update check | Medium | Standard endpoints: `/activate`, `/deactivate`, `/check` - returns JSON with status |
| **Domain-Based Activation** | Prevents key sharing - binds license to specific site | Medium | Uses `home_url()` or `site_url()` - stores in license_activations table |
| **Activation Limits** | Control distribution - limit how many sites can use one key | Medium | Per-plan limits (1, 3, 5, unlimited) - enforced on activation |
| **License Status Management** | Track lifecycle: active, expired, revoked, suspended | Low | Standard states across all licensing systems |
| **Customer Portal** | Customers expect self-service key management | Medium | View keys, manage activations, download updates |
| **Subscription Expiry Tracking** | Recurring billing requires expiration dates | Low | Store `expires_at` - check on validation |
| **License Revocation** | Admin must disable problematic licenses | Low | Change status to `revoked` - validation fails |
| **Activation History** | Compliance and security - track where/when keys used | Low | Log table with timestamps, IPs, domains |
| **Update Distribution** | Licensed products expect automatic updates | High | Build update package, serve via API with license check |
| **Grace Periods** | Avoid service interruption during renewal | Low | 7-30 days after expiry - still validates |
| **Admin Dashboard** | Internal management of all licensing operations | High | CRUD for products, plans, licenses, customers |
| **Plan Management** | Different tiers need different rules | Medium | Plans define: activation limits, features, expiry |
| **Product Versioning** | Track software versions and their downloads | Low | Products have current_version, download_url, changelog |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Cryptographic Offline Validation** | Plugin works without internet - embedded public key verification | High | Use ECC/RSA signatures - key contains encoded dataset + signature |
| **Real-time Analytics Dashboard** | Business intelligence on activations, revenue, compliance | Medium | Track active installs, geographic distribution, churn |
| **Automated Compliance Enforcement** | Detect and block overuse automatically | High | Background jobs check limits, auto-disable violations |
| **Hardware Fingerprinting** | Advanced anti-piracy - bind to server characteristics | High | Capture server signatures - harder to spoof than domains |
| **API Rate Limiting** | Prevent abuse of public validation endpoints | Medium | Per-key rate limits, DDoS protection |
| **Graceful Degradation Mode** | Better UX when expired - limited features vs hard stop | Medium | Configurable behavior per plan |
| **Multi-Product License Keys** | One key unlocks bundle of products | Medium | Key linked to multiple product SKUs |
| **License Transfer System** | Customers can move activations between sites | Low | Deactivate old domain before activating new |
| **Webhook Integration** | Notify external systems on license events | Medium | POST to configured URLs on activate, expire, renew |
| **Usage Metrics Tracking** | Understand how licenses are actually used | High | Optional telemetry - feature usage, version stats |
| **Domain Whitelisting for Dev** | Allow localhost/staging without counting | Low | Configurable domain patterns that bypass limits |
| **Bulk Operations** | Manage many licenses at once (for agencies) | Medium | Bulk generate, bulk extend, bulk revoke |
| **License Preview Mode** | Test drive before purchase - time-limited trial keys | Medium | Auto-expiring trial licenses with full features |
| **Renewal Automation** | Auto-charge subscriptions on expiry | High | Integration with payment gateways, dunning management |
| **Compliance Reports** | Export data for audits, revenue recognition | Medium | CSV/PDF exports of license status history |
| **Activation Geo-Location** | Track where licenses are activated geographically | Medium | IP geolocation on activation, map visualization |
| **License Audit Trail** | Complete history of all license state changes | Medium | Who changed what, when, why - critical for disputes |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Phone-Home Every Request** | Performance killer, creates dependency | Cache validation for 24-72 hours |
| **Obscure Key Formats** | Harder for customers to read/email, no security benefit | Use clear, standard segmented format |
| **Hardware Binding Without Fallback** | Server changes break license, support nightmare | Domain-based primary + optional fingerprint |
| **Silent Revocation** | Customers need to know why license stopped working | Always send email notification, show reason in plugin |
| **Complex Activation Workflows** | Friction increases abandonment | Simple: enter key → click activate |
| **Version-Locked Keys** | Prevents updates, security risk | Key valid across all versions unless explicitly revoked |
| **Time-Bomb Expired Logic** (plugin stops working after date) | Poor UX, trust issue | Graceful degradation, keep working but show renewal notice |
| **Custom Proprietary Encryption** | Security through obscurity, hard to audit | Use standard crypto (ECC/RSA) with public vetting |
| **Tight Coupling to Payment Provider** | Hard to switch gateways | Abstract payment events into licensing events |
| **Central API Dependency** (v2.0 pattern) | Defeats purpose of self-contained system | All licensing operations local, no external calls |

## Feature Dependencies

```
Product Creation → Plan Configuration → License Generation → License Activation → License Validation
Customer Registration → Order/Payment → License Assignment
License Validation → Update Check → Plugin Update Download
Subscription Plan → Renewal Processing → License Extension
Domain Activation → Activation Limit Check → Activation Success/Failure
License Status → Compliance Enforcement → Notification
```

### Dependency Detail

1. **Product Management** must exist before:
   - Plan creation (plans belong to products)
   - License generation (licenses reference products)
   - Order processing (orders contain product SKUs)

2. **Plan Configuration** must exist before:
   - License generation (licenses inherit plan rules)
   - Activation limit enforcement (limits defined per plan)
   - Pricing display (plans contain pricing)

3. **License Generation** requires:
   - Product exists
   - Plan configured
   - Customer exists (for assignment)
   - Order/payment reference (for audit trail)

4. **License Activation** requires:
   - Valid license key exists
   - License status is `active` or `trial`
   - Domain provided by client
   - Activation limit check passes

5. **License Validation** requires:
   - License key exists
   - License status is `active` (not `revoked`, `suspended`, `expired`)
   - Domain matches activation record (if bound)
   - Current date within validity period

6. **Subscription Renewals** require:
   - Payment gateway integration
   - License exists to extend
   - Renewal logic (extend `expires_at` or set for lifetime)

7. **License Revocation/Suspension** requires:
   - License exists
   - Admin action (manual) or automated rule
   - Notification system (inform customer)
   - Plugin respects status on next validation

## Detailed Behaviors by Category

### Product/Plan Management

**Expected Behaviors:**
- Products represent the actual software (e.g., "ConversionFlow Plugin")
- Each product has multiple plans (e.g., Starter, Professional, Agency)
- Plans define: price, activation limits, feature flags, expiry duration
- Products track versions (current version, download URL)

**Table Stakes:**
- CRUD operations for products and plans
- Plan pricing in multiple currencies (BDT, USD)
- Version management with download URLs
- Plan comparison matrix display

**Differentiators:**
- Feature flagging per plan (granular permission control)
- Version-specific license requirements (upgrade prompts)
- Bundle products (one plan includes multiple products)

**Data Model:**
```sql
products (id, name, slug, current_version, download_url, created_at)
plans (id, product_id, name, slug, price_bdt, price_usd, max_activations, is_lifetime, support_days, created_at)
product_versions (id, product_id, version, download_url, changelog, released_at)
```

### License Key Generation and Format

**Expected Behaviors:**
- Keys are unique, unpredictable strings
- Standard format: 25-32 characters, segmented (XXXX-XXXX-XXXX-XXXX)
- Keys embed product reference and plan reference
- Keys are stored with metadata (creation date, customer, order)

**Table Stakes:**
- Alphanumeric generation (no ambiguous characters like O/0, I/l/1)
- Case-insensitive format
- Uniqueness guarantee (database constraint)
- Association with product, plan, customer

**Differentiators:**
- Cryptographic signing (offline validation possible)
- Embedded metadata in key (expiration, features)
- Segmented by product type (CF-XXXX-XXXX vs LARAVEL-XXXX-XXXX)

**Common Formats (from research):**
```
Easiest:      md5(uniqid()) → 32 hex chars
Standard:     XXXX-XXXX-XXXX-XXXX (4 segments of 4)
EDD Style:    prefixed + segmented → CFP-XXXX-XXXX-XXXX-XXXX
Keygen:       Base64-encoded signed dataset
```

**Recommended Format for ConversionFlow:**
```
CFP-XXXXX-XXXXX-XXXXX (15 chars + prefix, segmented)
- Prefix identifies product (CFP = ConversionFlow Plugin)
- Case-insensitive
- No ambiguous chars (exclude: 0, O, 1, l, I)
- Database unique index on key
```

### License Validation Logic

**Expected Behaviors:**
- Validation API endpoint receives: license_key, domain, action
- Returns: status, expiry date, current version, download URL
- Validation checks: status (active), domain match, within expiry

**Table Stakes:**
- `/api/v1/license/validate` - check key validity
- `/api/v1/license/activate` - bind to domain, increment count
- `/api/v1/license/deactivate` - unbind domain, decrement count
- Return JSON with: `valid: true/false`, `expires_at`, `version`

**Differentiators:**
- Offline validation (public key embedded in plugin)
- Caching headers (reduce server load)
- Rate limiting per key
- Detailed response (feature flags, plan type)

**Validation Flow:**
```
1. Lookup license by key
2. Check status (must be 'active')
3. Check expiry (must be > now, or within grace period)
4. Check domain (if bound, must match activation record)
5. Check activation limit (if enforcing)
6. Return: valid + metadata OR error + reason
```

**API Response Format:**
```json
{
  "valid": true,
  "license_key": "CFP-XXXXX-XXXXX-XXXXX",
  "status": "active",
  "expires_at": "2026-12-31T23:59:59Z",
  "plan": "professional",
  "activations": {
    "current": 2,
    "limit": 3
  },
  "version": {
    "current": "2.5.0",
    "download_url": "https://conversionflow.com/downloads/cfp-2.5.0.zip"
  }
}
```

### Domain Activation Tracking

**Expected Behaviors:**
- Each activation records: license_id, domain, activated_at, ip_address
- Domain normalization (strip protocol, www, trailing slash)
- Deactivation removes record, decrements count

**Table Stakes:**
- `license_activations` table with foreign key to licenses
- Domain normalization function
- Activate/deactivate endpoints
- Query: activations per license count

**Differentiators:**
- Subdomain wildcards (license covers *.example.com)
- Staging domain whitelisting (dev.site.com, staging.site.com bypass limits)
- Activations geo-location tracking
- Domain change detection (alert if domain changes drastically)

**Domain Normalization Pattern:**
```typescript
// normalizeDomain("https://www.example.com/") → "example.com"
// normalizeDomain("http://sub.example.com") → "sub.example.com"
function normalizeDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url; // fallback to input
  }
}
```

**Data Model:**
```sql
license_activations (
  id, 
  license_id, 
  domain, 
  activated_at, 
  deactivated_at, 
  ip_address, 
  user_agent, 
  geo_country
)
```

### Activation Limit Enforcement

**Expected Behaviors:**
- Each plan defines max activations (1, 3, 5, unlimited)
- Activation checks current count vs plan limit
- Error returned if limit reached

**Table Stakes:**
- Plan has `max_activations` field
- Count active activations before allowing new one
- Error message: "License already activated on 3 sites (limit: 3)"

**Differentiators:**
- Over-activation with admin approval
- Temporary activations (time-limited, don't count against limit)
- Automatic cleanup of stale activations (inactive > 90 days)
- Soft limits (allow but notify, vs hard blocks)

**Enforcement Logic:**
```
1. Fetch plan.max_activations for license
2. Count active activations in license_activations table (where deactivated_at IS NULL)
3. If count >= max_activations → reject with error
4. If unlimited (null or -1) → allow
```

**Error Response When Limit Reached:**
```json
{
  "valid": false,
  "error": "activation_limit_exceeded",
  "message": "This license is already activated on 3 sites. Deactivate a site to activate here, or upgrade your plan.",
  "activations": [
    {"domain": "example.com", "activated_at": "2026-01-15"},
    {"domain": "store.example.com", "activated_at": "2026-02-20"},
    {"domain": "shop.example.com", "activated_at": "2026-03-10"}
  ]
}
```

### Subscription Renewals

**Expected Behaviors:**
- Subscriptions have billing cycles and expiry dates
- Renewals extend license expiry
- Failed payments trigger grace period then suspension

**Table Stakes:**
- `expires_at` field on licenses
- Payment webhook triggers renewal processing
- Renewal extends `expires_at` by subscription period
- Grace period logic (still valid for N days after expiry)

**Differentiators:**
- Automatic renewal payment processing
- Dunning management (retry failed payments)
- Renewal reminders (7 days, 3 days, 1 day before)
- Proration for plan upgrades

**Renewal Flow:**
```
1. Payment webhook received (success)
2. Lookup license by order/customer
3. Calculate new expiry date (current + period)
4. Update license.expires_at
5. Send renewal confirmation email
6. Optionally: extend all activations with new expiry
```

**Grace Period Logic:**
```typescript
function isLicenseValid(license: License): boolean {
  if (license.status !== 'active') return false;
  if (license.plan.is_lifetime) return true;
  
  const now = new Date();
  const expires = new Date(license.expires_at);
  const gracePeriodDays = license.plan.grace_period_days || 30;
  
  // Valid if not expired, or within grace period
  return expires > now || 
         (expires <= now && (now.getTime() - expires.getTime()) / (1000 * 60 * 60 * 24) <= gracePeriodDays);
}
```

### Lifetime Licenses

**Expected Behaviors:**
- One-time payment, no expiry
- `expires_at` is null or far-future (e.g., 2099-12-31)
- Validation never fails due to expiry

**Table Stakes:**
- Plan type flag: `is_lifetime: true`
- `expires_at` = null for lifetime licenses
- Validation skips expiry check for lifetime

**Differentiators:**
- Lifetime with support expiry (license is lifetime, but updates expire)
- Upgrade paths from lifetime to newer product versions
- Transferability (lifetime license can be resold/transferred)

**Data Model:**
```sql
plans (
  ...
  is_lifetime BOOLEAN DEFAULT false,
  support_days INTEGER,  -- null = lifetime support
  ...
)

licenses (
  ...
  expires_at TIMESTAMP,  -- null for lifetime
  support_expires_at TIMESTAMP,
  ...
)
```

### License Revocation/Suspension

**Expected Behaviors:**
- Admin can manually revoke any license
- Suspended licenses fail validation with reason
- Customers are notified of status change

**Table Stakes:**
- License status field: `active`, `suspended`, `revoked`, `expired`
- Admin endpoint to change status
- Validation fails for non-active statuses
- Email notification on status change

**Differentiators:**
- Automated revocation rules (e.g., refund → auto revoke)
- Suspension reasons stored (audit trail)
- Scheduled revocation (set to revoke on future date)
- Temporary suspension (auto-reinstate after payment)

**Revocation vs Suspension:**
- **Revoked**: Permanent, typically from refund or ToS violation
- **Suspended**: Temporary, typically from payment issue, can be reinstated

**Status Transitions:**
```
active → suspended (payment failed, admin action)
active → revoked (refund, ToS violation)
suspended → active (payment received)
suspended → revoked (grace period expired)
active → expired (time-based, subscription end)
expired → active (renewal purchased)
```

**API Response for Suspended/Revoked:**
```json
{
  "valid": false,
  "error": "license_suspended",
  "message": "This license has been suspended due to payment failure. Please update your payment method.",
  "status": "suspended",
  "reason": "payment_failed",
  "can_reinstate": true
}
```

## MVP Recommendation

For ConversionFlow v3.0 self-contained licensing, prioritize in this order:

**Phase 1 - Core Licensing:**
1. Product/Plan Management (CRUD)
2. License Key Generation (standard format)
3. License Validation API (activate, deactivate, check)
4. Domain Activation Tracking (basic, no limits)

**Phase 2 - Enforcement & Lifecycle:**
5. Activation Limit Enforcement (plan-based)
6. License Status Management (active, expired, revoked)
7. Customer Portal (view keys, manage activations)
8. Admin Dashboard (manage all entities)

**Phase 3 - Subscription & Renewals:**
9. Subscription Expiry Tracking
10. Renewal Processing (webhook-based)
11. Grace Period Logic
12. Lifetime License Support

**Defer to post-MVP:**
- Cryptographic offline validation (differentiator, not required)
- Hardware fingerprinting (complexity high, value uncertain)
- Advanced analytics (can be added incrementally)
- Automated compliance enforcement (manual is fine initially)

## Sources

- [Easy Digital Downloads - Software Licensing Features](https://easydigitaldownloads.com/features/software-licensing/) - HIGH confidence, official documentation
- [EDD Software Licensing Documentation](https://easydigitaldownloads.com/docs/software-licensing-activating-checking-and-deactivating-license-keys-in-wordpress-plugins/) - HIGH confidence, implementation guide
- [Keygen Offline Licensing Documentation](https://keygen.sh/docs/choosing-a-licensing-model/offline-licenses/) - HIGH confidence, authoritative source
- [Keygen Cryptographic Verification Examples](https://github.com/keygen-sh/example-cryptographic-verification) - HIGH confidence, implementation code
- [WooCommerce License Manager Plugins](https://wckeymanager.com/best-license-manager-plugins-for-woocommerce-2026/) - MEDIUM confidence, feature comparison
- [SaaS Suspension Rights Practices](https://www.jdsupra.com/legalnews/suspension-rights-in-saas-agreements-3726642/) - MEDIUM confidence, legal framework
- [Subscription Renewal Practices](https://woocommerce.com/document/api-manager-subscriptions/) - MEDIUM confidence, standard patterns
- [Domain-Bound Licensing Architecture](https://dev.to/trafficorchestrator/building-a-domain-bound-software-licensing-system-architecture-deep-dive-1d1h) - MEDIUM confidence, architectural guide
- [Cryptolens Offline Verification](https://help.cryptolens.io/examples/offline-verification) - MEDIUM confidence, public-key cryptography approach
- [Freemius Software Licensing](https://freemius.com/software-licensing/) - MEDIUM confidence, WordPress plugin SaaS patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Core License Generation | HIGH | Well-established patterns from multiple sources |
| Domain Activation Tracking | HIGH | Standard WordPress plugin pattern |
| Activation Limit Enforcement | HIGH | Common feature across all licensing systems |
| Subscription/Renewal Handling | MEDIUM | Patterns consistent but implementation varies |
| Cryptographic Offline Validation | HIGH | Keygen documentation is authoritative |
| License Revocation/Suspension | MEDIUM | Legal frameworks consistent, technical implementation straightforward |
| Product/Plan Management | MEDIUM | Research focused on licensing itself, less on product configuration |
