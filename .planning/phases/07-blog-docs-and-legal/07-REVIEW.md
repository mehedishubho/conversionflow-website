---
phase: 07-blog-docs-and-legal
status: clean
depth: standard
reviewed: 2026-05-12
---

# Phase 07 Code Review

## Findings

No unresolved issues remain in Phase 7 changed source files.

## Fixed During Review

### [P2] Defer TableOfContents state update

`src/components/docs/TableOfContents.tsx` initially called `setHeadings()` synchronously inside the mount effect after querying MDX headings. React lint flagged this as a synchronous state update in an effect. The fix defers heading discovery to `requestAnimationFrame()` and cancels the frame on cleanup.

Commit: `b3aa0fb`

## Verification

- `pnpm build` passed.
- `pnpm exec eslint` passed for Phase 7 changed source/config files.

## Notes

Full `pnpm lint` currently scans existing `.claude/worktrees/**/.next` generated output and a pre-existing `src/components/layout/Navbar.tsx` effect pattern, so it fails outside the Phase 7 source scope. Those were not introduced by this phase.
