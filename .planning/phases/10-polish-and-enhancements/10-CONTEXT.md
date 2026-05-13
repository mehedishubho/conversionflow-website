# Phase 10 Context: Polish and Enhancements
*Captured: 2026-05-14*

<domain>
**Domain Boundary:** Premium visual polish (custom cursor, Syne 900 typography fix, responsiveness, and advanced animations).
</domain>

<canonical_refs>
## Canonical References
- `woobooster-v2.html` (Original HTML design reference for visual parity)
</canonical_refs>

<decisions>
## Implementation Decisions

### 1. Custom Cursor Implementation
- **Framer Motion Migration:** Rebuild the `CustomCursor` component using Framer Motion instead of vanilla JS `requestAnimationFrame`. This will provide smoother spring physics and maintain consistency with the rest of the site's animation stack.

### 2. Animation Choreography
- **Fade-Ups:** Use Framer Motion to implement clean, simple fade-up animations for page transitions and scroll reveals. Avoid overly complex staggered scale-ins in favor of an elegant, lightweight feel.

### 3. Responsive Degradation Strategy
- **Balanced Degradation (Preferred Strategy):** Preserve multi-column layouts where space permits on tablets (e.g., maintaining a 2-column grid for Bento features), and gracefully stack into a single column for mobile devices to ensure optimal readability.

### 4. Typography Fix
- **Syne Font Fix:** Correct the font configuration in `src/app/[locale]/layout.tsx` where `--font-syne` was accidentally mapped to `DM_Sans`. Import and assign the actual `Syne` Google font to restore the authentic weight 900 headings.
</decisions>

<code_context>
## Codebase Findings
- `src/components/layout/CustomCursor.tsx` already exists but needs refactoring to use `framer-motion`.
- `src/app/[locale]/layout.tsx` contains the typography configuration bug.
- Framer Motion is already installed (`"framer-motion": "^12.38.0"`).
</code_context>

<deferred>
## Deferred Ideas
None.
</deferred>
