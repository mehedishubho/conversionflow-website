# Phase 32: Update Delivery System - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build update check, plugin info, and authenticated download endpoints so WordPress (and other) plugins can auto-update from the ConversionFlow server. Add a license status endpoint for full license info retrieval. Extend admin product version management with ZIP file uploads.

**In scope:**
- `/api/v1/update/check` — WordPress-compatible update check endpoint
- `/api/v1/update/info` — WordPress plugin info endpoint (for "View details" popup)
- `/api/v1/update/download` — Authenticated ZIP file download with time-limited signed URLs
- `/api/v1/license/status` — Full license profile endpoint (activations, tier, features, expiry)
- ZIP file upload: admin uploads via existing version create/edit form, stored on local filesystem
- ZIP file validation: magic bytes check, extension enforcement, filename sanitization, path traversal scan
- `update_logs` table for tracking update checks and downloads
- Admin-configurable platform URL setting for download URL generation
- Admin-configurable product slug for plugin identification
- Customer portal download buttons enabled using same download endpoint
- Redis caching for license status responses (10-min TTL)
- Rate limiting same as existing: 100 req/min per IP

**NOT in scope (later phases):**
- Feature flags per plan/tier (Phase 33)
- Beta/pre-release channel opt-in (Phase 33 with feature flags)
- Multi-gateway payments (Phase 34)
- WordPress SDK PHP client library (Phase 35)
- HMAC request signing (Phase 38)
- Rate limiting per platform (Phase 38)
- Cryptographic offline validation (post-MVP, DEFER-06)
- S3/cloud storage for ZIP files (future enhancement)

</domain>

<decisions>
## Implementation Decisions

### ZIP File Storage
- **D-01:** Local filesystem storage — ZIP files stored in `uploads/products/{product-slug}/` directory under the project root. No S3/cloud dependency. Self-hosted friendly.
- **D-02:** File naming auto-generated as `{product-slug}-{version}.zip` (e.g., `conversionflow-1.2.0.zip`). Deterministic, no naming conflicts.
- **D-03:** Maximum upload size: 50 MB. Enforced at both form level and server level.
- **D-04:** Basic ZIP validation on upload: check magic bytes (PK header starting with `PK\x03\x04`), enforce `.zip` extension, sanitize filename, scan archive entries for path traversal patterns (`../`, absolute paths).
- **D-05:** Admin uploads ZIP via the existing version create/edit form — add file input to `src/app/(admin)/admin/products/[id]/versions/new/page.tsx` and edit page. Single form handles version metadata + ZIP upload.
- **D-06:** The `product_versions.downloadUrl` field transitions from external URL text field to internal file path reference. After Phase 32, it stores the relative path within `uploads/` (e.g., `products/conversionflow/conversionflow-1.2.0.zip`). Existing external URLs are replaced — fresh start with upload system.
- **D-07:** When admin deletes a version, the associated ZIP file is deleted from disk alongside the database record. Keeps storage clean.

### Update Check API
- **D-08:** WordPress-compatible response format first — the update check returns a WordPress plugin info API compatible JSON response with fields: `slug`, `new_version`, `download_url`, `package` (same as download_url), `sections` (changelog, description), `requires` (min WP version), `tested` (tested up to WP version), `requires_php`. Other platforms can use the same endpoint and ignore extra fields.
- **D-09:** Plugin sends: `license_key`, `domain`, `installed_version`, `product_slug`, `api_token`. Server validates license via same per-license API token auth, looks up product by slug, compares installed_version against latest stable version, returns update info if newer version exists.
- **D-10:** Include plugin info endpoint `/api/v1/update/info` for WordPress "View version x.x details" popup. Returns same data as check but with full `sections` content (description, changelog, installation notes, FAQ). WordPress calls this via the `plugins_api` hook.
- **D-11:** Admin configures a unique `plugin_slug` on each product (e.g., `conversionflow`). This is a new field on the `products` table or a dedicated settings entry. The slug is the identifier the plugin sends in update check requests. Not auto-generated — admin sets it explicitly to match the WordPress plugin directory slug convention.
- **D-12:** Beta/pre-release channel deferred to Phase 33 (feature flags). Phase 32 only returns `stable` versions in update check. The `versionStatusEnum` already has `beta` status — Phase 33 will add a `beta_channel` feature flag to opt in.

### Download Authentication
- **D-13:** Time-limited signed URLs — update check generates a download URL with a cryptographic token and expiry timestamp (e.g., `/api/v1/update/download?token=xxx&expires=1234567890`). Token is HMAC-signed with a server secret. Server verifies signature + expiry on download request.
- **D-14:** Token expiry: 2 hours. WordPress downloads immediately during the update process — 2 hours covers slow connections. After expiry, plugin must re-check for updates to get a fresh URL.
- **D-15:** Download endpoint streams the ZIP file directly via API route (not redirect). Read file from local filesystem, set `Content-Type: application/zip`, `Content-Disposition: attachment`, `Content-Length` headers, stream via Node.js readable stream. Full control over auth, logging, and rate limiting.
- **D-16:** Customer portal downloads use the same `/api/v1/update/download` endpoint. Server-side action generates a download token for the customer's license and version, then redirects or streams. Unifies the download system — single endpoint for auto-update and manual downloads.
- **D-17:** Download URL base is admin-configured via a new setting key `platform_url` (e.g., `https://conversionflow.com`). Stored in the `settings` table. The update check constructs download URLs using this base. Required for self-hosted deployments where auto-detection would fail.

### License Status Endpoint
- **D-18:** `/api/v1/license/status` returns a full license profile: `license_id`, `status`, `plan` (name, slug), `product` (name, slug), `expires_at`, `grace_period_expires_at`, `max_activations`, `current_activations`, `activations` (array of `{domain, activated_at}`), `features` (from plan's JSONB), `license_type` (lifetime/subscription). SDKs get everything needed for admin panel display in one call.
- **D-19:** Auth model: same per-license API token — send `license_key`, `domain`, `api_token` via POST. Consistent with all existing `/api/v1/license/*` endpoints.
- **D-20:** POST method — consistent with existing validate/activate/deactivate. All `/api/v1/license/*` endpoints use POST with JSON body.
- **D-21:** Redis cached with 10-min TTL, same as validate. Cache key: `license:status:<sha256(licenseKey)>`. Invalidation on same domain events (status change, activation/deactivation).

### Update Tracking and Analytics
- **D-22:** New `update_logs` table for tracking update events. Columns: `id` (uuid), `product_id` (fk→products), `license_id` (fk→licenses), `action` (enum: `check`, `info`, `download`), `version_from` (text, nullable — the installed version), `version_to` (text, nullable — the target version), `domain` (text), `ip_address` (text), `user_agent` (text, nullable), `created_at` (timestamp). Queryable for future admin analytics.
- **D-23:** Rate limiting: same 100 req/min per IP as existing license endpoints. Uses the same `RateLimiter` from `src/modules/licensing/infrastructure/adapters/RateLimiter.ts`. WordPress checks every 12h by default — 100/min is more than sufficient.

### Claude's Discretion
- Exact download token signing implementation (HMAC-SHA256 with server secret, URL structure)
- Update check response field mapping details (which `sections` keys to include)
- How `plugin_slug` is stored (new column on products table vs settings table entry)
- Admin version form file upload component implementation (multipart form handling)
- ZIP file streaming implementation details (chunk size, backpressure)
- `update_logs` table indexing strategy
- How portal download button generates and uses the download token client-side
- Error response format for update endpoints (follow existing INVALID_RESPONSE pattern or new codes)
- Whether to add `update_logs` to the existing module-init registration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"Update Delivery (UPDT)" — UPDT-01 through UPDT-05 (update check, authenticated download, license status, ZIP management, WordPress format)
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, self-hosted deployment, per-license API tokens, DDD module structure
- `.planning/ROADMAP.md` §"Phase 32: Update Delivery System" — Success criteria 1-5

### Prior Phase Context (MUST read for integration points)
- `.planning/phases/16-licensing-core/16-CONTEXT.md` — API endpoint contracts (D-22/D-23), validation cache (D-19/D-20/D-21), rate limiting (D-08), per-license API tokens (D-05/D-06), module structure (D-24 through D-27)
- `.planning/phases/15-products-context/15-CONTEXT.md` — Product/plans/versions schema, version management (D-06), admin UI patterns
- `.planning/phases/21-backup-restore/21-CONTEXT.md` — Local filesystem file management, streaming downloads, pg_dump pattern for file I/O

### Existing Schema (must integrate)
- `src/lib/db/schema.ts` — `productVersions` table (lines 565-589): `version`, `downloadUrl`, `changelog`, `status` (stable/beta/draft), `releasedAt`
- `src/lib/db/schema.ts` — `productPlans` table (lines 591-622): `features` JSONB, `maxActivations`, `licenseType`
- `src/lib/db/schema.ts` — `downloads` table (lines 356-366): `downloadToken`, `expiresAt`, `downloadedAt`, `fileName`
- `src/lib/db/schema.ts` — `products` table: `name`, `slug`, `description` (may need `pluginSlug` field)
- `src/lib/db/schema.ts` — `versionStatusEnum`: `stable`, `beta`, `draft`

### Existing API Endpoints (follow conventions)
- `src/app/api/v1/license/validate/route.ts` — POST handler pattern, rate limiting, INVALID_RESPONSE, cache integration
- `src/app/api/v1/license/activate/route.ts` — Same auth pattern
- `src/app/api/invoices/[id]/pdf/route.ts` — File download pattern (streaming Response with headers)
- `src/app/api/admin/backup/[id]/download/route.ts` — File download pattern (local filesystem read and stream)

### Licensing Module (extend)
- `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` — Validation logic, cache integration, grace period handling
- `src/modules/licensing/infrastructure/adapters/RateLimiter.ts` — Redis sliding window rate limiter
- `src/modules/licensing/infrastructure/adapters/ValidationCache.ts` — Redis cache helper
- `src/modules/licensing/index.ts` — Module entry point, add update handler exports

### Admin UI (extend)
- `src/app/(admin)/admin/products/[id]/versions/new/page.tsx` — Add ZIP file upload input
- `src/app/(admin)/admin/products/[id]/versions/[versionId]/edit/page.tsx` — Add ZIP file upload/replace
- `src/app/(admin)/actions/admin-products.ts` — Extend `createVersion` and `updateVersion` with file handling
- `src/components/admin/ProductVersionsTable.tsx` — Show ZIP file status (uploaded/not uploaded)

### Customer Portal (enable downloads)
- `src/components/portal/DownloadsList.tsx` — Enable download buttons, link to download endpoint
- `src/app/(portal)/dashboard/downloads/page.tsx` — Downloads page (already fetches from DB)

### Infrastructure (reuse)
- `src/lib/redis.ts` — ioredis client + cache helpers
- `src/lib/module-init.ts` — Worker/handler registration at startup
- `src/lib/audit.ts` — createAuditLog for admin operations
- `src/shared/domain/valueObjects/LicenseKey.ts` — License key parsing
- `src/shared/domain/valueObjects/Domain.ts` — Domain normalization
- `src/modules/licensing/domain/services/ApiTokenGenerator.ts` — API token validation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`ValidateLicenseHandler`** (`src/modules/licensing/application/commands/ValidateLicenseHandler.ts`) — Full validation flow with cache, grace period, domain check. The new update check handler should validate the license the same way (same auth, same cache strategy) and then additionally check product version.
- **`RateLimiter`** (`src/modules/licensing/infrastructure/adapters/RateLimiter.ts`) — Redis sliding window at 100 req/min. Reuse for update endpoints.
- **`ValidationCache`** (`src/modules/licensing/infrastructure/adapters/ValidationCache.ts`) — Redis cache with prefix-based keys. Add `license:status:` prefix for status cache.
- **`LicenseRepository`** (`src/modules/licensing/infrastructure/repositories/LicenseRepository.ts`) — `findByKey()` for license lookup. Used by all handlers.
- **`ApiTokenGenerator`** (`src/modules/licensing/domain/services/ApiTokenGenerator.ts`) — `validate()` for constant-time token comparison.
- **`productVersions` schema** — Already tracks version, downloadUrl, changelog, status, releasedAt. Phase 32 extends downloadUrl to store local file paths and adds upload logic.
- **`downloads` table** — Already has downloadToken, expiresAt, downloadedAt. Phase 32 can reuse this table or create new download token mechanism for the update flow.
- **Backup download route** (`src/app/api/admin/backup/[id]/download/route.ts`) — File streaming pattern from local filesystem.
- **Invoice PDF route** (`src/app/api/invoices/[id]/pdf/route.ts`) — File download with auth, Content-Disposition header.
- **Admin version actions** (`src/app/(admin)/actions/admin-products.ts`) — `createVersion`, `updateVersion` — extend with file upload handling.

### Established Patterns
- **API route pattern** — POST handler: rate limit check, parse body, validate input, call handler, return JSON. All in `src/app/api/v1/license/*/route.ts`.
- **Identical error responses** — `INVALID_RESPONSE()` function returns same body for all failure cases (D-21, LGEN-09). Update endpoints should follow same pattern.
- **Admin server actions** — `requireAdmin()` guard, FormData parsing, db operations, audit log, revalidatePath.
- **DDD module layering** — Handlers in `application/commands/`, repositories in `infrastructure/repositories/`. New update handlers follow same structure.
- **Cache invalidation via domain events** — Subscribe to `LicenseActivated`, `LicenseDeactivated`, etc. via EventBus.

### Integration Points
- **`productVersions.downloadUrl`** — Currently text field. Phase 32 makes it an internal file path reference. Update `createVersion` and `updateVersion` actions to handle file uploads.
- **`downloads` table** — Customer portal already reads from this table. Phase 32 generates tokens for the update download flow and populates this table (or uses a separate mechanism for update-specific downloads).
- **`src/lib/module-init.ts`** — Register any new event handlers or workers.
- **Customer portal download buttons** — Currently disabled (`disabled` attribute on buttons). Phase 32 enables them by wiring up the download token flow.
- **Settings table** — Add `platform_url` setting for download URL base generation. Follow existing `admin-settings.ts` pattern.
- **Products table** — May need `pluginSlug` field for product-to-plugin mapping in update checks.
- **New `update_logs` table** — Add to schema.ts alongside existing tables.

</code_context>

<specifics>
## Specific Ideas

- The update check response should include `last_updated` timestamp from `productVersions.releasedAt` — WordPress uses this for display.
- Download token signing: HMAC-SHA256 with a server-side secret (from env var `DOWNLOAD_SIGNING_SECRET`). Token format: `{license_id}:{version_id}:{expires}:{signature}`. Server reconstructs HMAC from first three parts and compares with signature.
- The `sections` field in update check response maps from `productVersions.changelog` — the existing changelog text becomes the `changelog` section. Add `description` and `installation` sections from product metadata or dedicated version fields.
- Admin version form: add a file dropzone component (or simple file input) below the changelog textarea. Show current ZIP file status if one is already uploaded (filename, size, upload date). Allow replacing with new upload.
- `platform_url` setting default: derive from `NEXT_PUBLIC_APP_URL` env var or `process.env.NEXT_PUBLIC_SITE_URL` if it exists, otherwise require admin to set it manually.
- Update log entries should be lightweight — no foreign key cascade, just store the IDs as text references. Logs are append-only analytics data, not relational data.
- The portal download flow: customer clicks download, server action generates token, redirect to `/api/v1/update/download?token=xxx&expires=yyy`, browser downloads ZIP.

</specifics>

<deferred>
## Deferred Ideas

- **Beta/pre-release channel opt-in** — deferred to Phase 33 (Feature Flags). Phase 32 only serves `stable` versions in update check. Phase 33 adds a `beta_channel` feature flag.
- **S3/cloud ZIP storage** — future enhancement. Phase 32 uses local filesystem only. If cloud delivery is needed later, add optional S3 sync (similar to backup cloud upload in Phase 21).
- **Per-platform rate limiting** — deferred to Phase 38 (Next.js SDK and API Security). Phase 32 uses same IP-based 100 req/min.
- **HMAC request signing** — deferred to Phase 38. Phase 32 uses existing per-license API token auth.
- **Update analytics dashboard** — Phase 32 creates the `update_logs` table and populates it. A dedicated admin analytics view for update metrics is a future enhancement.
- **WordPress.org plugin directory hosting** — explicitly out of scope per REQUIREMENTS.md (DEFER-08).
- **Differential/delta updates** — post-MVP optimization. Full ZIP download only in Phase 32.
- **Download resume/partial content** — not needed for WordPress auto-updates (single request, complete download). Add later if manual downloads need it.

</deferred>

---

*Phase: 32-v4-milestone*
*Context gathered: 2026-06-09*
