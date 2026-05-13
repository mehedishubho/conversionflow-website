# Phase 9: Internationalization - Patterns & Architecture

This document outlines the core patterns and file structure for the Internationalization phase, specifically focusing on the Next.js 16 App Router implementation with `next-intl` and the new `proxy.ts` network boundary.

## File Manifest & Data Flow

| File | Role | Data Flow | Closest Analog |
|------|------|-----------|----------------|
| `src/proxy.ts` | Infrastructure | Request → Locale Detection → Rewrites | `middleware.ts` (Legacy) |
| `src/i18n/routing.ts` | Config | next-intl Definition → Nav Utils | N/A |
| `src/i18n/request.ts` | Data Loading | Locale → JSON Messages → Components | N/A |
| `src/app/[locale]/layout.tsx` | Presentation | Locale Prop → i18n Provider → UI | `src/app/layout.tsx` |
| `src/lib/mdx.ts` | Data Fetching | Locale → Slug → .bn.mdx / .en.mdx | `src/lib/mdx.ts` |
| `src/lib/navigation.ts` | Shared Utils | Routing Config → Locale-aware Link | N/A |

## Core Implementation Patterns

### 1. Next.js 16 Proxy Implementation
In Next.js 16, `proxy.ts` replaces `middleware.ts`. It acts as a network boundary for handling manual locale detection and ensuring the default locale (`en`) is correctly routed without prefixes where desired.

```typescript
// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public assets and internal API routes
  if (pathname.match(/\.(.*)$/) || pathname.startsWith('/api')) return;

  // Manual locale detection (Cookie > Accept-Language > Default)
  const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
  
  // Custom logic to handle default locale without prefix
  // ...
}
```

### 2. next-intl Routing Configuration
Centralized configuration for supported locales and navigation utilities.

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // Standard: /bn for Bengali, / for English
});

// Shared navigation utilities
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

### 3. Localized MDX Fetching (src/lib/mdx.ts)
The MDX logic will be updated to handle parallel files for English and Bengali.

```typescript
// src/lib/mdx.ts excerpt
export async function getMdxContent(slug: string, locale: string, type: 'docs' | 'blog') {
  const bnPath = path.join(process.cwd(), `content/${type}/${slug}.bn.mdx`);
  const enPath = path.join(process.cwd(), `content/${type}/${slug}.en.mdx`);
  
  // Docs are translated; Blog is English-only
  const targetPath = (locale === 'bn' && type === 'docs' && fs.existsSync(bnPath)) 
    ? bnPath 
    : enPath;
  
  return fs.readFileSync(targetPath, 'utf8');
}
```

### 4. Locale-Aware UI Components
The `Navbar` and `Footer` will use the localized `Link` to maintain the user's selected language.

```tsx
// src/components/layout/Navbar.tsx (Pattern)
import { Link } from '@/i18n/routing';

export function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href}>
      {children}
    </Link>
  );
}
```

## Migration Steps
1. **Directory Restructuring**: Move routes from `src/app/*` to `src/app/[locale]/*`.
2. **Infrastructure Update**: Create `src/proxy.ts` and `src/i18n/*` files.
3. **Typography**: Apply `Noto Sans Bengali` globally to the `body` in `src/app/[locale]/layout.tsx` when `locale === 'bn'`.
