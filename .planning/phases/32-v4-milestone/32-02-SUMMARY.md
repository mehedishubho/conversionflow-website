---
phase: 32-v4-milestone
plan: 02
subsystem: admin, storage
tags: [zip-upload, file-handling, admin-ui, server-actions, magic-bytes, path-sanitization]

# Dependency graph
requires:
  - phase: 32-v4-milestone/plan-01
    provides: pluginSlug column on products table, schema extensions
provides:
  - handleZipUpload helper with magic bytes validation, extension check, and filename sanitization
  - ZIP file upload in createVersion and updateVersion server actions
  - ZIP file cleanup on deleteVersion (fs.unlinkSync)
  - 50MB bodySizeLimit in next.config.ts for server action uploads
  - uploads/ directory gitignored
  - File upload UI in version create and edit forms
  - ZIP file status column in ProductVersionsTable
  - pluginSlug display on product detail page
affects: [32-03-PLAN, 32-04-PLAN, phase-35-wordpress-sdk]

# Tech tracking
tech-stack:
  added: []
patterns: [ZIP magic bytes validation (PK\x03\x04), atomic file write via temp+rename, filename sanitization regex, FormData file upload with server actions]

key-files:
  created: []
  modified:
    - next.config.ts
    - .gitignore
    - src/app/(admin)/actions/admin-products.ts
    - src/components/admin/ProductVersionsTable.tsx
    - src/app/(admin)/admin/products/[id]/page.tsx
    - src/app/(admin)/admin/products/[id]/versions/new/page.tsx
    - src/app/(admin)/admin/products/[id]/versions/[versionId]/edit/page.tsx

key-decisions:
  - "Native HTML file input used instead of react-dropzone for simpler server action FormData integration"
  - "Atomic file write pattern: write to .tmp then rename to final path, prevents corruption on concurrent writes"
  - "ZIP file upload is optional at creation time -- can be added later via edit form"
  - "downloadUrl field stores relative path within uploads/ directory (e.g., products/slug/slug-1.2.0.zip)"

patterns-established:
  - "handleZipUpload pattern: validate size/extension/magic-bytes, sanitize filename, atomic write, return relative path"
  - "File replacement pattern: look up existing downloadUrl, delete old file from disk, write new file, update DB record"
  - "Version deletion cleanup: look up downloadUrl before DB delete, unlink file from disk after DB delete"

requirements-completed: [UPDT-04]

# Metrics
duration: 1min
completed: 2026-06-11
---

# Phase 32 Plan 02: Admin ZIP Upload System Summary

**Admin ZIP file upload with magic bytes validation, atomic filesystem writes, version form file inputs, and 50MB server action body size limit**

## Performance

- **Duration:** 1 min (previously committed, verified in this execution)
- **Started:** 2026-06-11T11:42:39Z
- **Completed:** 2026-06-11T11:44:01Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Admin can upload ZIP files via version create and edit forms with native HTML file input
- ZIP validation enforces magic bytes (PK\x03\x04), .zip extension, and 50MB size limit
- Atomic file writes prevent corruption via temp file + rename pattern
- Deleting a version cleans up the associated ZIP file from disk
- Product detail page displays the pluginSlug field for WordPress plugin identification

## Task Commits

Each task was committed atomically:

1. **Task 1: Infrastructure config and server action ZIP handling** - `2bfeaf6` (feat)
2. **Task 2: Admin version form file upload UI** - `8442154` (feat)

## Files Created/Modified
- `next.config.ts` - Added experimental.serverActions.bodySizeLimit of 50MB for ZIP uploads
- `.gitignore` - Added uploads/ directory exclusion
- `src/app/(admin)/actions/admin-products.ts` - Added handleZipUpload helper, ZIP handling in createVersion/updateVersion, file cleanup in deleteVersion, pluginSlug in updateProduct
- `src/components/admin/ProductVersionsTable.tsx` - Changed Download column to File column showing ZIP uploaded/No file status
- `src/app/(admin)/admin/products/[id]/page.tsx` - Added pluginSlug display in product details
- `src/app/(admin)/admin/products/[id]/versions/new/page.tsx` - Replaced downloadUrl text input with file upload input for ZIP files
- `src/app/(admin)/admin/products/[id]/versions/[versionId]/edit/page.tsx` - Added file upload input with current file status display and replacement messaging

## Decisions Made
- Native HTML `<input type="file">` used instead of react-dropzone -- simpler, works natively with server actions and FormData without requiring a client component boundary
- Atomic file write pattern (temp file + rename) prevents corruption from concurrent writes to the same version path
- ZIP upload is optional at version creation -- admin can create a version record first and upload the ZIP later via edit
- downloadUrl field stores relative path within uploads/ (e.g., `products/conversionflow/conversionflow-1.2.0.zip`) per D-06

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required for this plan.

## Next Phase Readiness
- Admin ZIP upload system fully operational for product version management
- DownloadUrl field now stores internal file paths ready for the download endpoint in Plan 03
- Product detail page shows pluginSlug for WordPress plugin identification
- Plan 03 can build the API routes for update check, download, info, and license status using the stored file paths

## Self-Check: PASSED

- All 7 modified files verified present on disk with expected content
- Task 1 commit `2bfeaf6` verified in git log
- Task 2 commit `8442154` verified in git log
- All 10 acceptance criteria verified via automated checks

---
*Phase: 32-v4-milestone*
*Completed: 2026-06-11*
