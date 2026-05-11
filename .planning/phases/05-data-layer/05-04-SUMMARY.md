---
phase: 05-data-layer
plan: 04
subsystem: infra
tags: [docker, standalone, sharp, next.js, deployment, self-hosted]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js project with working build
provides:
  - Next.js standalone output configuration
  - Multi-stage Dockerfile for production deployment
  - sharp image optimization for self-hosted environments
  - .dockerignore for secure Docker builds
affects: [deployment, docker, image-optimization]

# Tech tracking
tech-stack:
  added: [sharp@0.34.5]
  patterns: [standalone-output, multi-stage-docker, non-root-container]

key-files:
  created:
    - Dockerfile
    - .dockerignore
  modified:
    - next.config.ts
    - package.json
    - pnpm-lock.yaml
    - pnpm-workspace.yaml

key-decisions:
  - "Added pnpm.onlyBuiltDependencies for sharp to bypass pnpm build script security gate"
  - "Used Node 22 Alpine (not 24) per plan specification for Dockerfile base image"

patterns-established:
  - "Standalone output: output: 'standalone' in next.config.ts produces .next/standalone/ with minimal server.js"
  - "Multi-stage Docker build: deps -> builder -> runner with non-root user (nextjs:1001)"

requirements-completed: [FOUND-07]

# Metrics
duration: 5min
completed: 2026-05-11
---

# Phase 5 Plan 04: Self-Hosted Deployment Configuration Summary

**Next.js standalone output, sharp image optimization, and multi-stage Dockerfile for self-hosted deployment**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-11T21:01:49Z
- **Completed:** 2026-05-11T21:06:41Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments
- Configured `output: "standalone"` in next.config.ts, producing minimal `.next/standalone/` deployment bundle
- Installed sharp 0.34.5 with native binary for server-side image optimization on self-hosted deployments
- Created production Dockerfile with 3-stage build (deps, builder, runner) running as non-root user
- Created .dockerignore excluding .git, .planning, node_modules, and other non-essential files

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure standalone output, install sharp, create Dockerfile and .dockerignore** - `230902b` (feat)

## Files Created/Modified
- `next.config.ts` - Added `output: "standalone"` for minimal Docker images
- `package.json` - Added sharp dependency, added `pnpm.onlyBuiltDependencies` for sharp build scripts
- `pnpm-lock.yaml` - Updated with sharp and its dependencies
- `pnpm-workspace.yaml` - Removed sharp from `ignoredBuiltDependencies`
- `Dockerfile` - Multi-stage Docker build with non-root user (nextjs:1001)
- `.dockerignore` - Excludes .git, .planning, node_modules, .next, design docs

## Decisions Made
- Added `pnpm.onlyBuiltDependencies: ["sharp"]` to package.json because pnpm 10 requires explicit approval for package build scripts; without this, sharp's native binary would not compile
- Used Node 22 Alpine as Dockerfile base image per plan specification (stable, widely available)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added pnpm.onlyBuiltDependencies for sharp build scripts**
- **Found during:** Task 1 (Step 3: Install sharp)
- **Issue:** pnpm 10 blocks package build scripts by default. After `pnpm add sharp`, the native binary was not compiled because pnpm requires explicit approval via `onlyBuiltDependencies` or interactive `pnpm approve-builds`
- **Fix:** Added `"pnpm": { "onlyBuiltDependencies": ["sharp"] }` to package.json, then re-ran `pnpm install` to trigger the build
- **Files modified:** package.json
- **Verification:** `node -e "require('sharp')"` passes without error
- **Committed in:** 230902b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for sharp functionality. No scope creep.

## Issues Encounted
- Standalone output in worktree produces nested path structure (`.next/standalone/.claude/worktrees/.../server.js`) -- this is a worktree artifact and does not affect production Docker builds from the actual project root

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Standalone output configured and verified via successful build
- Dockerfile ready for production use with `docker build -t woobooster .`
- sharp installed and functional for `next/image` optimization on self-hosted deployments
- No blockers for subsequent phases

## Self-Check: PASSED

All files verified:
- next.config.ts: FOUND
- package.json: FOUND
- pnpm-lock.yaml: FOUND
- pnpm-workspace.yaml: FOUND
- Dockerfile: FOUND
- .dockerignore: FOUND

All commits verified:
- 230902b: FOUND

---
*Phase: 05-data-layer*
*Completed: 2026-05-11*
