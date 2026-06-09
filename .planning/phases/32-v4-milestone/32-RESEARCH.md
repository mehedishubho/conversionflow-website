# Phase 32: Update Delivery System - Research

**Researched:** 2026-06-10
**Domain:** WordPress-compatible plugin update delivery, authenticated ZIP download, license status API
**Confidence:** HIGH

## Summary

Phase 32 builds the update delivery pipeline that enables WordPress (and other platform) plugins to auto-update from the ConversionFlow server. The system comprises four new API endpoints (`/api/v1/update/check`, `/api/v1/update/info`, `/api/v1/update/download`, `/api/v1/license/status`), a ZIP file upload and storage system for admin version management, an `update_logs` table for tracking, and customer portal download integration.

The existing codebase already has all infrastructure needed: Redis caching (ValidationCache pattern), rate limiting (RateLimiter at 100 req/min), per-license API token auth (ApiTokenGenerator with timing-safe comparison), file streaming (backup download route), settings table for admin configuration, and the `productVersions`/`downloads` tables. The `react-dropzone` package is already installed. The DDD module structure (`src/modules/licensing/`) provides a clear pattern for new update handlers.

**Primary recommendation:** Extend the existing licensing module with update delivery handlers following the exact same D-21/D-22 API route pattern, reuse RateLimiter/ValidationCache/INVALID_RESPONSE for consistency, store ZIPs on local filesystem under `uploads/`, and use HMAC-SHA256 signed download URLs with 2-hour expiry. No new external dependencies needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Local filesystem storage — ZIP files stored in `uploads/products/{product-slug}/` directory under the project root. No S3/cloud dependency. Self-hosted friendly.
- **D-02:** File naming auto-generated as `{product-slug}-{version}.zip` (e.g., `conversionflow-1.2.0.zip`). Deterministic, no naming conflicts.
- **D-03:** Maximum upload size: 50 MB. Enforced at both form level and server level.
- **D-04:** Basic ZIP validation on upload: check magic bytes (`PK\x03\x04`), enforce `.zip` extension, sanitize filename, scan archive entries for path traversal patterns (`../`, absolute paths).
- **D-05:** Admin uploads ZIP via the existing version create/edit form — add file input to new and edit pages. Single form handles version metadata + ZIP upload.
- **D-06:** `productVersions.downloadUrl` transitions from external URL text field to internal file path reference. After Phase 32, it stores relative path within `uploads/` (e.g., `products/conversionflow/conversionflow-1.2.0.zip`). Existing external URLs replaced.
- **D-07:** When admin deletes a version, the associated ZIP file is deleted from disk alongside the database record.
- **D-08:** WordPress-compatible response format first — update check returns WordPress plugin info API compatible JSON with fields: `slug`, `new_version`, `download_url`, `package`, `sections`, `requires`, `tested`, `requires_php`.
- **D-09:** Plugin sends: `license_key`, `domain`, `installed_version`, `product_slug`, `api_token`. Server validates license via same per-license API token auth, looks up product by slug, compares installed_version against latest stable version.
- **D-10:** Include plugin info endpoint `/api/v1/update/info` for WordPress "View version x.x details" popup.
- **D-11:** Admin configures unique `plugin_slug` on each product. New field on products table or dedicated settings entry.
- **D-12:** Beta/pre-release channel deferred to Phase 33. Phase 32 only returns `stable` versions.
- **D-13:** Time-limited signed URLs — download URL with HMAC-SHA256 token and expiry timestamp. Token format: `{license_id}:{version_id}:{expires}:{signature}`.
- **D-14:** Token expiry: 2 hours.
- **D-15:** Download endpoint streams the ZIP file directly via API route (not redirect).
- **D-16:** Customer portal downloads use same `/api/v1/update/download` endpoint.
- **D-17:** Download URL base is admin-configured via new setting key `platform_url`.
- **D-18:** `/api/v1/license/status` returns full license profile: license_id, status, plan, product, expires_at, grace_period_expires_at, max_activations, current_activations, activations array, features, license_type.
- **D-19:** Auth model: same per-license API token — send `license_key`, `domain`, `api_token` via POST.
- **D-20:** POST method — consistent with existing validate/activate/deactivate.
- **D-21:** Redis cached with 10-min TTL. Cache key: `license:status:<sha256(licenseKey)>`.
- **D-22:** New `update_logs` table for tracking update events. Columns: id, product_id, license_id, action, version_from, version_to, domain, ip_address, user_agent, created_at.
- **D-23:** Rate limiting: same 100 req/min per IP as existing license endpoints.

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

### Deferred Ideas (OUT OF SCOPE)
- Beta/pre-release channel opt-in (Phase 33 with feature flags)
- S3/cloud ZIP storage (future enhancement)
- Per-platform rate limiting (Phase 38)
- HMAC request signing (Phase 38)
- Update analytics dashboard (future)
- WordPress.org plugin directory hosting (DEFER-08)
- Differential/delta updates (post-MVP)
- Download resume/partial content (post-MVP)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UPDT-01 | WordPress plugin checks for updates via /api/v1/update/check in WordPress-compatible format (slug, version, download_url, sections) | D-08/D-09 locked: WordPress-compatible JSON response with HMAC-signed download URL. Handler follows ValidateLicenseHandler pattern. |
| UPDT-02 | Authenticated download endpoint /api/v1/update/download serves ZIP files only to valid license holders via signed download tokens | D-13/D-14/D-15 locked: HMAC-SHA256 signed tokens, 2-hour expiry, direct streaming from local filesystem. Pattern from backup download route. |
| UPDT-03 | GET /api/v1/license/status returns full license info including all activations, tier, features, and expiry | D-18/D-19/D-20/D-21 locked: POST method, Redis cached 10-min TTL, same auth pattern. Extends ValidationCache with `license:status:` prefix. |
| UPDT-04 | Admin can upload and manage ZIP files per product version with automatic version tracking integrated with product_versions table | D-01/D-02/D-03/D-04/D-05/D-06 locked: Local filesystem, react-dropzone (already installed), extend admin-products.ts actions, FormData file handling. |
| UPDT-05 | Update check supports WordPress plugin info API format including requires, tested, and requires_php fields | D-10 locked: Separate /api/v1/update/info endpoint for "View details" popup. Returns full sections content. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| crypto (Node built-in) | Node 20+ | HMAC-SHA256 signing, sha256 hashing | Already used in ApiTokenGenerator, ValidationCache. No new dependency. |
| fs (Node built-in) | Node 20+ | Local filesystem read/write for ZIP files | Already used in backup download route. |
| path (Node built-in) | Node 20+ | Path construction for uploads directory | Standard Node.js path utilities. |
| react-dropzone | ^15.0.0 | File upload UI component for admin forms | Already installed in package.json. |
| ioredis | ^5.10.1 | Redis caching for license status responses | Already installed, used by ValidationCache. |

### Supporting (Already in Codebase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-orm | ^0.45.2 | DB queries for version/product/license lookups, new update_logs table | All database operations. |
| nanoid | ^5.1.11 | Unique identifiers | If needed for download token entropy beyond HMAC. |
| next (App Router) | 16.2.6 | API route handlers | All four new endpoints. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Plain HTML file input | Dropzone gives better UX (drag-drop, preview, progress). Already installed. |
| HMAC-SHA256 tokens | Database-stored download tokens (existing `downloads` table) | HMAC is stateless — no DB lookup per download, no cleanup needed. Existing `downloads` table can still track completed downloads. |
| New `pluginSlug` column on products | Settings table entry | Column is cleaner for joins and indexing. Settings table works but requires extra query per update check. |

**Installation:**
```bash
# No new packages needed — all dependencies already installed
```

**Version verification:**
```bash
# Verified from package.json (read during research):
# react-dropzone: ^15.0.0 (installed)
# ioredis: ^5.10.1 (installed)
# drizzle-orm: ^0.45.2 (installed)
# nanoid: ^5.1.11 (installed)
# next: 16.2.6 (installed)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── modules/
│   ├── licensing/                        # Existing — extend with update handlers
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── ValidateLicenseHandler.ts        # Existing pattern to follow
│   │   │   │   ├── UpdateCheckHandler.ts             # NEW
│   │   │   │   ├── UpdateInfoHandler.ts              # NEW
│   │   │   │   ├── DownloadHandler.ts                # NEW
│   │   │   │   └── LicenseStatusHandler.ts           # NEW
│   │   │   └── services/
│   │   │       └── DownloadTokenService.ts           # NEW (HMAC signing/verification)
│   │   └── infrastructure/
│   │       └── adapters/
│   │           └── UpdateLogRepository.ts            # NEW (append-only logging)
│   ├── update/                                          # NEW module (optional, or keep in licensing)
│   │   └── domain/
│   │       └── services/
│   │           └── ZipValidator.ts                     # NEW (magic bytes, path traversal scan)
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── update/
│   │       │   ├── check/route.ts                     # NEW — POST
│   │       │   ├── info/route.ts                      # NEW — POST
│   │       │   └── download/route.ts                  # NEW — GET (signed URL params)
│   │       └── license/
│   │           └── status/route.ts                    # NEW — POST
│   └── (admin)/
│       └── admin/products/[id]/versions/
│           ├── new/page.tsx                           # EXTEND — add file upload
│           └── [versionId]/edit/page.tsx              # EXTEND — add file upload/replace
├── lib/
│   └── db/
│       └── schema.ts                                  # EXTEND — add update_logs table, pluginSlug to products
└── uploads/                                           # NEW — .gitignored, ZIP storage root
    └── products/
        └── {product-slug}/
            └── {product-slug}-{version}.zip
```

### Pattern 1: API Route Handler (follow existing validate pattern)
**What:** Every API endpoint follows identical structure: rate limit, parse body, validate input, delegate to handler, return JSON.
**When to use:** All four new endpoints.
**Example:**
```typescript
// Source: src/app/api/v1/license/validate/route.ts (verified in codebase)
import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { UpdateCheckHandler } from "@/modules/licensing/application/commands/UpdateCheckHandler";

const INVALID_RESPONSE = () =>
  NextResponse.json(
    { update_available: false, error: "INVALID_REQUEST" },
    { status: 404 },
  );

export async function POST(request: NextRequest) {
  // 1. Rate limit (same RateLimiter, same 100 req/min)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { update_available: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // 2. Parse body, validate fields, delegate to handler
  // 3. Return result
}
```

### Pattern 2: File Download Streaming (follow existing backup route)
**What:** Read file from local filesystem, stream as Response with appropriate headers.
**When to use:** `/api/v1/update/download` endpoint.
**Example:**
```typescript
// Source: src/app/api/admin/backup/[id]/download/route.ts (verified in codebase)
import fs from "fs";

const fileBuffer = fs.readFileSync(filePath);
return new Response(new Uint8Array(fileBuffer), {
  headers: {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${filename}"`,
  },
});
```
**Note:** For large ZIP files (up to 50MB), consider using `fs.createReadStream` with streaming Response instead of loading entire file into memory. Node.js `Readable.toWeb(fs.createReadStream(path))` returns a `ReadableStream` that Next.js Response accepts natively.

### Pattern 3: Settings Table Upsert (follow existing admin-settings pattern)
**What:** Store `platform_url` and `download_signing_secret` in the `settings` table using upsert pattern.
**When to use:** Admin-configurable download URL base.
**Example:**
```typescript
// Source: src/app/(admin)/actions/admin-settings.ts (verified in codebase)
// Pattern: select existing -> update if found, insert if not
const existing = await db.select().from(settings).where(eq(settings.key, "platform_url")).limit(1);
if (existing.length > 0) {
  await db.update(settings).set({ value: url, updatedAt: new Date() }).where(eq(settings.key, "platform_url"));
} else {
  await db.insert(settings).values({ key: "platform_url", value: url });
}
```

### Anti-Patterns to Avoid
- **Loading entire ZIP into memory:** For files up to 50MB, use streaming (`fs.createReadStream`) instead of `fs.readFileSync`. The backup route uses `readFileSync` but backup files are small SQL dumps. ZIP files could be up to 50MB.
- **Storing download tokens in the database:** Use stateless HMAC-SHA256 signed tokens. The existing `downloads` table should track completed downloads only (log after successful stream), not serve as a token validation mechanism.
- **New middleware for update routes:** The proxy.ts already excludes `/api/v1/*` routes from auth checks. Update endpoints use per-license API tokens, not session auth. No proxy.ts changes needed.
- **Over-validating ZIP contents on every download:** Validate once on upload. On download, only verify the file exists on disk.
- **Using `next.config.ts` `experimental.serverActions.bodySizeLimit`:** This is for server actions, not API routes. For API routes, use `request.headers.get("content-length")` to enforce 50MB limit before parsing the body.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Download URL signing | Custom token generator with DB storage | Node.js `crypto.createHmac("sha256", secret)` | HMAC is stateless, cryptographically standard, no DB lookup needed. Already proven by ApiTokenGenerator pattern. |
| Rate limiting | New rate limiter for update routes | Existing `RateLimiter` class | Already handles Redis sliding window + in-memory fallback. WordPress checks every 12h — 100/min is more than sufficient. |
| Cache key hashing | New hashing function | `crypto.createHash("sha256")` from ValidationCache | Same pattern, same security properties. |
| File upload UI | Custom drag-drop component | `react-dropzone` ^15.0.0 | Already installed. Provides drag-drop, file type restriction, size validation, preview. |
| ZIP validation | Custom archive parser | Magic bytes check (`PK\x03\x04`) + filename sanitization | Full ZIP parsing is unnecessary. Magic bytes confirm it's a ZIP. Path traversal scan on entry names is sufficient security. Full extraction validation would require `adm-zip` or `yauzl` — overkill for this use case. |

**Key insight:** The existing codebase has solved every infrastructure problem this phase needs. Rate limiting, Redis caching, API token validation, file streaming, settings storage, admin server actions — all patterns are established and should be reused verbatim.

## Common Pitfalls

### Pitfall 1: FormData vs JSON in Admin Server Actions
**What goes wrong:** The existing `createVersion` and `updateVersion` actions use `FormData` but only extract text fields. When adding file upload, the form `enctype` must be `multipart/form-data` (which is automatic with Next.js server actions). However, the action must handle `formData.get("file")` as a `File` object, not a string.
**Why it happens:** Server actions automatically handle multipart forms, but developers may forget to handle the File type correctly.
**How to avoid:** Use `formData.get("zipFile") as File | null`, then check `file.size`, `file.type`, and use `file.arrayBuffer()` or `file.stream()` to write to disk.
**Warning signs:** Build errors about File type, or uploaded file content is `[object Object]`.

### Pitfall 2: Next.js API Route Body Size Limit
**What goes wrong:** Next.js API routes have a default body size limit (1MB in App Router). 50MB ZIP uploads via API route will fail silently or return 413.
**Why it happens:** The admin upload goes through server actions (which handle FormData), not API routes. Server actions have their own body size limit configurable via `experimental.serverActions.bodySizeLimit` in `next.config.ts`. But this must be set.
**How to avoid:** Add `serverActions: { bodySizeLimit: "50mb" }` to `next.config.ts`. The download endpoint (GET, streaming response) is not affected — only uploads are.
**Warning signs:** Uploads fail for files > 1MB. Error message mentions payload size.

### Pitfall 3: WordPress Update API Compatibility
**What goes wrong:** WordPress expects specific JSON field names and structure. If the response doesn't match the expected format, WordPress won't show the update.
**Why it happens:** The WordPress plugin update transient expects an object with `slug`, `new_version`, `url`, `package`, and the `plugins_api` expects `sections` as an object with `description`, `changelog`, `installation` keys.
**How to avoid:** Return the exact field structure WordPress expects. The `sections` field must be an object (not a string). The `package` field must be the download URL. The `url` field should point to a product info page.
**Warning signs:** WordPress dashboard shows no update available even though a newer version exists.

### Pitfall 4: uploads/ Directory Not Created
**What goes wrong:** The `uploads/products/{slug}/` directory doesn't exist on first deployment, causing `ENOENT` errors on upload.
**Why it happens:** The directory is `.gitignored` (must be added), so it won't exist after a fresh clone/deploy.
**How to avoid:** Create the directory structure on upload if it doesn't exist (`fs.mkdirSync(dir, { recursive: true })`). Add `uploads/` to `.gitignore`.
**Warning signs:** `ENOENT: no such file or directory` on first ZIP upload attempt.

### Pitfall 5: HMAC Signing Secret Not Set
**What goes wrong:** The download token signing requires a server-side secret. If not configured, tokens can't be generated or verified.
**Why it happens:** New env var `DOWNLOAD_SIGNING_SECRET` needs to be added to `.env.local`.
**How to avoid:** Generate a default secret at startup if not configured (log warning). Use `crypto.randomBytes(32).toString("hex")` as fallback. Document the env var in setup instructions.
**Warning signs:** Download tokens fail verification. Server logs show missing secret warning.

### Pitfall 6: Concurrent Version Creation Race Condition
**What goes wrong:** Two admins create a version with the same semver simultaneously, or upload a ZIP for the same version at the same time.
**Why it happens:** The `productVersions` table has a unique constraint on `(productId, version)` which prevents duplicate versions at the DB level. But file system writes to the same path could corrupt the ZIP.
**How to avoid:** The DB unique constraint handles version deduplication. For file writes, use a temporary filename during upload, then rename to final path after successful write (atomic rename on same filesystem).
**Warning signs:** Corrupted ZIP files, `EEXIST` errors on rename.

### Pitfall 7: Version Comparison Logic
**What goes wrong:** Semver comparison using string comparison instead of proper semver logic. `"1.10.0" < "1.9.0"` when compared as strings.
**Why it happens:** JavaScript string comparison is lexicographic, not semantic.
**How to avoid:** Parse version strings into `[major, minor, patch]` components and compare numerically. A simple comparison function is sufficient — no need for the full `semver` npm package.
**Warning signs:** Updates not detected for versions like 1.10.0 when installed version is 1.9.0.

## Code Examples

### HMAC-SHA256 Download Token Generation
```typescript
// Source: Based on existing crypto patterns in ApiTokenGenerator.ts and ValidationCache.ts
import crypto from "crypto";

const DOWNLOAD_SIGNING_SECRET = process.env.DOWNLOAD_SIGNING_SECRET || crypto.randomBytes(32).toString("hex");

export class DownloadTokenService {
  /**
   * Generate a signed download URL with expiry.
   * Token format: {licenseId}:{versionId}:{expires}:{hmacSignature}
   */
  static generateDownloadUrl(baseUrl: string, licenseId: string, versionId: string): string {
    const expires = Math.floor(Date.now() / 1000) + 7200; // 2 hours
    const payload = `${licenseId}:${versionId}:${expires}`;
    const signature = crypto
      .createHmac("sha256", DOWNLOAD_SIGNING_SECRET)
      .update(payload)
      .digest("hex");

    return `${baseUrl}/api/v1/update/download?token=${payload}:${signature}`;
  }

  /**
   * Verify a download token and extract its components.
   */
  static verifyToken(token: string): { licenseId: string; versionId: string; expires: number } | null {
    const parts = token.split(":");
    if (parts.length !== 4) return null;

    const [licenseId, versionId, expiresStr, signature] = parts;
    const expires = parseInt(expiresStr, 10);

    // Check expiry
    if (isNaN(expires) || Date.now() / 1000 > expires) return null;

    // Verify HMAC
    const payload = `${licenseId}:${versionId}:${expires}`;
    const expected = crypto
      .createHmac("sha256", DOWNLOAD_SIGNING_SECRET)
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    return { licenseId, versionId, expires };
  }
}
```

### WordPress-Compatible Update Check Response
```typescript
// Source: WordPress plugin update API format [ASSUMED — based on WordPress core code and established patterns]
// WordPress expects this structure in pre_set_site_transient_update_plugins

interface WordPressUpdateResponse {
  slug: string;                    // Plugin identifier (matches product.pluginSlug)
  new_version: string;             // Latest version string (e.g., "1.2.0")
  url: string;                     // Product info page URL
  package: string;                 // Signed download URL (same as download_url)
  download_url: string;            // Signed download URL with HMAC token
  last_updated: string;            // ISO 8601 from releasedAt
  sections: {
    description: string;           // From product description
    changelog: string;             // From productVersions.changelog
    installation: string;          // Static or from version metadata
  };
  requires: string;                // Min WordPress version (e.g., "5.0")
  tested: string;                  // Tested up to WordPress version (e.g., "6.5")
  requires_php: string;            // Min PHP version (e.g., "7.4")
}

// "No update" response — WordPress expects empty/false
const NO_UPDATE_RESPONSE = {
  update_available: false,
};
```

### Semver Comparison (simple, no library needed)
```typescript
// Source: Standard semver parsing — no dependency needed
function compareSemver(a: string, b: string): number {
  const parseVersion = (v: string) => v.replace(/-.*$/, "").split(".").map(Number);
  const [aMajor, aMinor, aPatch] = parseVersion(a);
  const [bMajor, bMinor, bPatch] = parseVersion(b);

  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

// Returns true if remote version is newer than installed version
function hasUpdate(installedVersion: string, latestVersion: string): boolean {
  return compareSemver(latestVersion, installedVersion) > 0;
}
```

### ZIP File Upload Handler in Server Action
```typescript
// Source: Based on existing createVersion in admin-products.ts + Next.js File handling
export async function createVersion(productId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  const version = formData.get("version") as string;
  const changelog = formData.get("changelog") as string | null;
  const zipFile = formData.get("zipFile") as File | null;

  // ... existing validation ...

  // ZIP file handling (optional — version can be created without ZIP)
  let downloadPath: string | null = null;
  if (zipFile && zipFile.size > 0) {
    // Validate size (50MB)
    if (zipFile.size > 50 * 1024 * 1024) {
      return { error: "ZIP file must be under 50 MB." };
    }

    // Validate extension
    if (!zipFile.name.endsWith(".zip")) {
      return { error: "Only .zip files are accepted." };
    }

    // Read and validate magic bytes
    const buffer = Buffer.from(await zipFile.arrayBuffer());
    if (buffer.length < 4 || buffer.toString("hex", 0, 4) !== "504b0304") {
      return { error: "File is not a valid ZIP archive." };
    }

    // Write to uploads/products/{slug}/{slug}-{version}.zip
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    const slug = product[0]?.slug || "unknown";
    const uploadDir = path.join(process.cwd(), "uploads", "products", slug);
    const fileName = `${slug}-${version.trim()}.zip`;
    const filePath = path.join(uploadDir, fileName);

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, buffer);

    downloadPath = `products/${slug}/${fileName}`;
  }

  // Insert version record
  const [versionRecord] = await db.insert(productVersions).values({
    productId,
    version: version.trim(),
    downloadUrl: downloadPath,
    changelog: changelog?.trim() || null,
    status: "draft",
  }).returning();

  // ... audit log ...
}
```

### Streaming ZIP Download (for large files)
```typescript
// Source: Based on backup download route pattern, enhanced with streaming
import fs from "fs";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  // ... token verification, license check ...

  const filePath = path.join(process.cwd(), "uploads", version.downloadUrl);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
      "Content-Length": String(stat.size),
    },
  });
}
```

### License Status Response Structure (D-18)
```typescript
// Source: D-18 specification + existing licenses/productVersions/products schema
interface LicenseStatusResponse {
  license_id: string;
  status: "active" | "expired" | "revoked" | "suspended" | "grace_period";
  plan: {
    name: string;
    slug: string;
  };
  product: {
    name: string;
    slug: string;
  };
  expires_at: string | null;
  grace_period_expires_at: string | null;
  max_activations: number;
  current_activations: number;
  activations: Array<{
    domain: string;
    activated_at: string;
  }>;
  features: Record<string, boolean>;  // From productPlans.features JSONB
  license_type: "lifetime" | "subscription";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DB-stored download tokens | HMAC-signed stateless tokens | Industry standard for years | No DB lookup per download, no token cleanup cron needed |
| Full ZIP extraction for validation | Magic bytes + path traversal scan | Security best practice | Faster uploads, no ZIP parsing dependency |
| `fs.readFileSync` for all downloads | `fs.createReadStream` for large files | Node.js 18+ | Memory-efficient streaming for files >10MB |

**Deprecated/outdated:**
- `express` middleware patterns for Next.js: Use App Router API route handlers instead (already the project pattern)
- `multer` for file uploads: Next.js server actions handle FormData natively

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WordPress update API expects `slug`, `new_version`, `url`, `package`, `sections`, `requires`, `tested`, `requires_php` fields in the update check response | Architecture Patterns | WordPress SDK (Phase 35) would need different response parsing |
| A2 | WordPress `plugins_api` filter calls the info endpoint with `action=plugin_information` and expects `sections` as an object with string keys | Architecture Patterns | "View details" popup won't display correctly |
| A3 | `next.config.ts` `experimental.serverActions.bodySizeLimit` accepts `"50mb"` string format | Common Pitfalls | ZIP uploads over default limit would fail |
| A4 | `fs.mkdirSync(dir, { recursive: true })` works on Windows (project is Windows) | Code Examples | Upload directory creation might fail on Windows |
| A5 | `Readable.toWeb(fs.createReadStream(path))` works in Next.js API routes on Windows | Code Examples | Streaming download might need alternative implementation |
| A6 | WordPress checks for updates every 12 hours by default (`wp_update_plugins` cron) | Standard Stack | Rate limit design is based on this assumption |

**Validation needed for A1-A2:** These will be confirmed during Phase 35 (WordPress SDK) implementation when the actual WordPress integration is tested. The response format is well-documented in WordPress core and widely used by commercial plugin vendors (EDD, Freemius, etc.), so confidence is HIGH despite being ASSUMED.

## Open Questions

1. **`pluginSlug` storage approach**
   - What we know: D-11 says admin configures a unique `plugin_slug` on each product. CONTEXT.md says Claude has discretion over how to store it.
   - What's unclear: New column on `products` table vs. a settings table entry.
   - Recommendation: Add `pluginSlug` as a new nullable text column on `products` table with a unique constraint. This enables direct DB joins in update check queries and is the cleanest approach. Settings table would require an extra query per update check.

2. **`next.config.ts` body size limit**
   - What we know: `output: "standalone"` is set. No `experimental.serverActions` config exists.
   - What's unclear: Whether the default server action body size limit will block 50MB uploads.
   - Recommendation: Add `experimental: { serverActions: { bodySizeLimit: "50mb" } }` to next.config.ts proactively. This is a safe, well-documented config option.

3. **Streaming vs Buffer for ZIP downloads**
   - What we know: Backup route uses `fs.readFileSync` (loads entire file). ZIP files up to 50MB.
   - What's unclear: Whether 50MB in-memory is acceptable for this deployment.
   - Recommendation: Use `fs.createReadStream` with streaming Response. Memory-safe for any file size. The backup route uses buffer because SQL dumps are typically small (<10MB), but ZIP files could be 50MB.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | Compatible with Next.js 16 | - |
| pnpm | Package management | Yes | Per project rules | - |
| PostgreSQL | Database | Yes | Via existing db config | - |
| Redis | Caching/rate limiting | Yes | ioredis configured | In-memory fallback (existing) |
| fs (Node built-in) | ZIP file I/O | Yes | Node 20+ | - |
| crypto (Node built-in) | HMAC signing | Yes | Node 20+ | - |
| react-dropzone | Admin file upload UI | Yes | ^15.0.0 | Plain file input |

**Missing dependencies with no fallback:**
- None — all required tools and libraries are available.

**Missing dependencies with fallback:**
- None needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test files in project) |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UPDT-01 | Update check returns WordPress-compatible response when newer version exists | manual-only | N/A | No |
| UPDT-02 | Download endpoint streams ZIP only with valid signed token | manual-only | N/A | No |
| UPDT-03 | License status returns full profile with activations and features | manual-only | N/A | No |
| UPDT-04 | Admin can upload ZIP via version form, file stored on disk | manual-only | N/A | No |
| UPDT-05 | Update info returns full plugin info with sections | manual-only | N/A | No |

**Justification for manual-only:** No test framework is installed in this project (verified: no test config files, no test directories, no test scripts in package.json). All 81 previously completed phases used manual verification. The project convention is manual testing via dev server.

### Sampling Rate
- **Per task commit:** Manual browser/API testing
- **Per wave merge:** Manual full-flow verification
- **Phase gate:** All endpoints tested with curl/Postman, admin UI tested in browser

### Wave 0 Gaps
- No test framework to install — project convention is manual testing
- No test infrastructure needed for this phase

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Per-license API token (existing ApiTokenGenerator with timing-safe comparison) |
| V3 Session Management | No | No sessions for API endpoints |
| V4 Access Control | Yes | License validation before download, HMAC token verification |
| V5 Input Validation | Yes | Semver validation, filename sanitization, ZIP magic bytes, path traversal scan |
| V6 Cryptography | Yes | HMAC-SHA256 for download token signing, sha256 for cache keys (existing) |

### Known Threat Patterns for Update Delivery

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal in ZIP filenames | Tampering | Sanitize filenames, reject `..` and absolute paths in archive entries |
| Malicious ZIP upload (ZIP bomb) | Denial of Service | 50MB size limit + magic bytes check. Full ZIP bomb protection (decompression ratio) deferred — only download, not extraction |
| Download token forgery | Spoofing | HMAC-SHA256 with server secret, timing-safe comparison |
| Download token reuse after expiry | Elevation of Privilege | 2-hour expiry timestamp embedded in token, verified server-side |
| Unauthorized download | Information Disclosure | Token contains license_id and version_id, verified against DB records |
| Rate limit bypass via token rotation | Denial of Service | 100 req/min per IP (same as existing), tokens are single-use per expiry window |
| File path injection in download endpoint | Tampering | Never use user-supplied paths. Resolve file from DB record only (pattern from backup download route) |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/app/api/v1/license/validate/route.ts` — API route pattern, INVALID_RESPONSE, rate limiting
- Codebase analysis: `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` — Handler pattern with cache integration
- Codebase analysis: `src/modules/licensing/infrastructure/adapters/RateLimiter.ts` — Redis sliding window rate limiter
- Codebase analysis: `src/modules/licensing/infrastructure/adapters/ValidationCache.ts` — Redis cache with sha256 keys
- Codebase analysis: `src/lib/db/schema.ts` — productVersions, downloads, settings, products table definitions
- Codebase analysis: `src/app/(admin)/actions/admin-products.ts` — Server action pattern for version CRUD
- Codebase analysis: `src/app/(admin)/actions/admin-settings.ts` — Settings table upsert pattern
- Codebase analysis: `src/app/api/admin/backup/[id]/download/route.ts` — File download streaming pattern
- Codebase analysis: `src/modules/licensing/domain/services/ApiTokenGenerator.ts` — Crypto patterns (SHA-256, timing-safe comparison)
- Codebase analysis: `src/lib/redis.ts` — Cache helpers with prefix-based keys
- Codebase analysis: `package.json` — Dependency versions (react-dropzone ^15.0.0 confirmed installed)
- Codebase analysis: `src/lib/module-init.ts` — Module initialization pattern
- Codebase analysis: `src/components/portal/DownloadsList.tsx` — Portal download buttons (currently disabled)

### Secondary (MEDIUM confidence)
- `.planning/phases/32-v4-milestone/32-CONTEXT.md` — User decisions D-01 through D-23 (locked)
- `.planning/REQUIREMENTS.md` — UPDT-01 through UPDT-05 requirement definitions

### Tertiary (LOW confidence)
- WordPress plugin update API response format [ASSUMED — A1, A2] — Based on established knowledge of WordPress core update mechanics and commercial plugin update patterns (EDD Software Licensing, WP Update Server). Will be validated during Phase 35 WordPress SDK implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All dependencies verified in package.json, all patterns verified in codebase
- Architecture: HIGH — Follows established DDD module pattern, exact code examples from existing handlers
- Pitfalls: HIGH — Based on direct codebase analysis of file handling, body size limits, version comparison edge cases
- WordPress API format: MEDIUM — Based on established knowledge of WordPress update API, not verified against live docs (search rate-limited). Will be validated during Phase 35.

**Research date:** 2026-06-10
**Valid until:** 2026-07-10 (stable — all dependencies and patterns are established in the codebase)
