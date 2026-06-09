# Phase 32: Update Delivery System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 32-Update Delivery System
**Areas discussed:** ZIP Storage Strategy, Update Check API Design, Download Auth Flow, License Status Endpoint, Product Slug Mapping, Download URL Base, Update Tracking/Analytics, Rate Limit Policy

---

## ZIP Storage Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Local filesystem uploads | Store in uploads/products/{slug}/, self-hosted, no external dependency | ✓ |
| S3/CDN storage | Upload to S3-compatible storage, better CDN delivery | |
| Hybrid (local + optional S3) | Local primary with optional S3 sync | |

**User's choice:** Local filesystem uploads
**Notes:** Self-hosted friendly, no external dependency. Directory structure: `uploads/products/{slug}/`

| Option | Description | Selected |
|--------|-------------|----------|
| Extend version form | Add file upload to existing version create/edit form | ✓ |
| Separate upload flow | Dedicated upload page independent of version metadata | |

**User's choice:** Extend version form

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generated | {product-slug}-{version}.zip, deterministic, no conflicts | ✓ |
| Preserve original name | Keep uploaded filename, simpler but inconsistent | |

**User's choice:** Auto-generated naming

| Option | Description | Selected |
|--------|-------------|----------|
| 50 MB limit | Reasonable for WordPress plugins | ✓ |
| 100 MB limit | Generous for larger plugins | |
| Configurable in settings | Admin decides, flexible but adds complexity | |

**User's choice:** 50 MB limit

| Option | Description | Selected |
|--------|-------------|----------|
| uploads/products/{slug}/ | Organized per product, human-readable | ✓ |
| uploads/versions/{id}/ | Keyed by version ID, less readable | |

**User's choice:** uploads/products/{slug}/

| Option | Description | Selected |
|--------|-------------|----------|
| Delete ZIP with version | Keeps storage clean | ✓ |
| Keep orphaned files | Safety net but wastes storage | |

**User's choice:** Delete ZIP with version

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with internal path | Fresh start with upload system | ✓ |
| Support both modes | External URLs + uploaded files, two code paths | |

**User's choice:** Replace with internal path only

| Option | Description | Selected |
|--------|-------------|----------|
| Basic ZIP validation | Magic bytes, extension, sanitize, path traversal scan | ✓ |
| Extension + size only | Minimal validation, faster uploads | |

**User's choice:** Basic ZIP validation

---

## Update Check API Design

| Option | Description | Selected |
|--------|-------------|----------|
| WordPress-compatible first | WP-specific fields, other platforms ignore extras | ✓ |
| Generic JSON with platform layer | Platform field, SDK translates to WP format | |
| Separate per-platform endpoints | /check for WP, /check-generic for others | |

**User's choice:** WordPress-compatible first

| Option | Description | Selected |
|--------|-------------|----------|
| Include plugin info endpoint | For WP "View details" popup | ✓ |
| Skip for now | Only update check, plugin info later | |

**User's choice:** Include plugin info endpoint

| Option | Description | Selected |
|--------|-------------|----------|
| license_key + domain + version + slug | Full auth at check time, pre-validates | ✓ |
| slug + version only | Auth happens at download time, lighter check | |

**User's choice:** license_key + domain + version + slug

| Option | Description | Selected |
|--------|-------------|----------|
| Defer beta to Phase 33 | Only stable in Phase 32, beta via feature flags | ✓ |
| Include beta channel now | Admin can push beta updates | |

**User's choice:** Defer beta to Phase 33

---

## Download Auth Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Time-limited signed URL | Short-lived HMAC-signed URL, 2hr expiry | ✓ |
| Permanent download token | Persistent token, simpler but less secure | |
| One-time use token | Very secure but fragile for network issues | |

**User's choice:** Time-limited signed URL (2 hour expiry)

| Option | Description | Selected |
|--------|-------------|----------|
| Stream via API route | Full control over auth, logging, rate limiting | ✓ |
| Redirect to file URL | Faster but bypasses auth after redirect | |

**User's choice:** Stream via API route

| Option | Description | Selected |
|--------|-------------|----------|
| Same endpoint, same tokens | Single download system for auto-update + manual | ✓ |
| Separate portal download endpoint | Different auth flow for portal | |

**User's choice:** Same endpoint for both auto-update and portal downloads

---

## License Status Endpoint

| Option | Description | Selected |
|--------|-------------|----------|
| Full license profile | Activations, tier, features, product info — everything in one call | ✓ |
| Extended summary only | Status, plan, counts — SDKs call other endpoints for details | |

**User's choice:** Full license profile

| Option | Description | Selected |
|--------|-------------|----------|
| Same API token auth | Consistent with all /api/v1/license/* endpoints | ✓ |
| API token without domain | Domain not needed for status | |

**User's choice:** Same API token auth (license_key + domain + api_token)

| Option | Description | Selected |
|--------|-------------|----------|
| POST request | Consistent with existing validate/activate/deactivate | ✓ |
| GET request | RESTful but inconsistent with other endpoints | |

**User's choice:** POST request

| Option | Description | Selected |
|--------|-------------|----------|
| Cache 10 min (like validate) | Reduces DB load, same invalidation triggers | ✓ |
| No cache (always fresh) | Simpler but higher DB load | |

**User's choice:** Cache 10 min with same invalidation triggers

---

## Additional Areas

### Product Slug Mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Admin-configured slug | Explicit field, admin sets to match WP plugin slug | ✓ |
| Reuse existing product slug | Auto-generated from name, no new field | |

**User's choice:** Admin-configured slug

### Download URL Base

| Option | Description | Selected |
|--------|-------------|----------|
| Admin-configured setting | Works for any domain/self-hosted setup | ✓ |
| Auto-detect from request | Breaks behind proxies | |

**User's choice:** Admin-configured `platform_url` setting

### Update Tracking/Analytics

| Option | Description | Selected |
|--------|-------------|----------|
| New update_logs table | Dedicated table for check/info/download events | ✓ |
| Reuse audit_log table | Mixed with admin audit events | |

**User's choice:** New update_logs table

### Rate Limit Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Same 100 req/min | Sufficient for WP 12h check cycle | ✓ |
| Different per endpoint | Tighter for downloads (30/min) | |

**User's choice:** Same 100 req/min per IP

---

## Claude's Discretion

- Exact download token signing implementation (HMAC-SHA256, URL structure)
- Update check response field mapping details
- How plugin_slug is stored (new column vs settings entry)
- Admin version form file upload component
- ZIP file streaming implementation details
- update_logs table indexing strategy
- Portal download button token flow
- Error response format for update endpoints
- Whether to add update_logs to module-init registration

## Deferred Ideas

- Beta/pre-release channel opt-in — Phase 33 (feature flags)
- S3/cloud ZIP storage — future enhancement
- Per-platform rate limiting — Phase 38
- HMAC request signing — Phase 38
- Update analytics dashboard — future enhancement
- WordPress.org plugin directory hosting — DEFER-08
- Differential/delta updates — post-MVP
- Download resume/partial content — post-MVP if needed
