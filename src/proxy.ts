import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redirects, settings } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';


// ──────────────────────────────────────────────
// Regex rules cache (60 second TTL)
// ──────────────────────────────────────────────

let regexRulesCache: { data: typeof redirects.$inferSelect[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute

// ──────────────────────────────────────────────
// Regex safety validation (ReDoS protection)
// ──────────────────────────────────────────────

const REDOS_PATTERNS = /(\.+\+)+|(\.\*)\*|(\.+\+)|(\.\+)\+/;

function validateRegex(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern);
  } catch {
    return { valid: false, error: "Invalid regex pattern." };
  }

  if (REDOS_PATTERNS.test(pattern)) {
    return {
      valid: false,
      error: "Potentially dangerous regex pattern (nested quantifiers). Please simplify.",
    };
  }

  return { valid: true };
}

// Route category definitions
const AUTH_PAGES = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

const PORTAL_PREFIXES = [
  '/dashboard',
  '/licenses',
  '/billing',
  '/downloads',
  '/tickets',
  '/notifications',
  '/checkout',
  '/account',
];

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname === p);
}

function isPortalRoute(pathname: string): boolean {
  return PORTAL_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function isSetupPage(pathname: string): boolean {
  return pathname === '/admin/setup';
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (
    pathname.includes('.') || // matches .ico, .svg, .xml, .txt, etc.
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return;
  }

  // ──────────────────────────────────────────────
  // Redirect matching (before auth checks)
  // ──────────────────────────────────────────────
  try {
    // Exact match lookup
    const exactMatches = await db
      .select()
      .from(redirects)
      .where(and(eq(redirects.fromUrl, pathname), eq(redirects.status, 'active')))
      .limit(1);

    if (exactMatches.length > 0) {
      const match = exactMatches[0];
      // Fire-and-forget hit count increment (best-effort metric, uses atomic DB increment)
      db.update(redirects)
        .set({ hitCount: sql`${redirects.hitCount} + 1` })
        .where(eq(redirects.id, match.id))
        .catch(() => {
          // Hit count failures don't block redirects
        });
      return NextResponse.redirect(new URL(match.toUrl, request.url), {
        status: parseInt(match.type),
      });
    }

    // Regex match lookup (only if no exact match)
    // Use cache to reduce database load
    const now = Date.now();
    if (!regexRulesCache || now - regexRulesCache.timestamp > CACHE_TTL) {
      const rules = await db
        .select()
        .from(redirects)
        .where(and(eq(redirects.isRegex, true), eq(redirects.status, 'active')));
      regexRulesCache = { data: rules, timestamp: now };
    }
    const regexRules = regexRulesCache.data;

    for (const rule of regexRules) {
      try {
        // Validate regex pattern before execution to prevent ReDoS attacks
        const validation = validateRegex(rule.fromUrl);
        if (!validation.valid) {
          continue; // Skip invalid patterns
        }

        const regex = new RegExp(rule.fromUrl);
        const match = regex.exec(pathname);
        if (match) {
          // Fire-and-forget hit count increment (best-effort metric, uses atomic DB increment)
          db.update(redirects)
            .set({ hitCount: sql`${redirects.hitCount} + 1` })
            .where(eq(redirects.id, rule.id))
            .catch(() => {
              // Hit count failures don't block redirects
            });

          // Build destination with capture group replacement
          const destination = rule.toUrl.replace(/\$(\d+)/g, (_, idx) => {
            const groupIndex = parseInt(idx);
            return match[groupIndex] ?? '';
          });

          return NextResponse.redirect(new URL(destination, request.url), {
            status: parseInt(rule.type),
          });
        }
      } catch {
        // Skip invalid regex patterns
      }
    }
  } catch {
    // DB unavailability gracefully falls through to existing logic
  }

  const authPage = isAuthPage(pathname);
  const portalRoute = isPortalRoute(pathname);
  const adminRoute = isAdminRoute(pathname);
  const setupPage = isSetupPage(pathname);
  const nonMarketingRoute = authPage || portalRoute || adminRoute || setupPage;

  // ──────────────────────────────────────────────
  // Maintenance mode check (Phase 21, D-07)
  // ──────────────────────────────────────────────
  if (nonMarketingRoute && !adminRoute) {
    try {
      const maintenanceRow = await db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, "maintenance_mode"))
        .limit(1);

      if (maintenanceRow.length > 0 && maintenanceRow[0].value === "true") {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
    } catch {
      // DB unavailability gracefully falls through
    }
  }

  const sessionCookie = request.cookies.get('better-auth.session_token');

  // Validate session server-side when a cookie exists.
  // better-auth with cookieCache leaves cookies around for expired/invalid sessions,
  // so checking only cookie existence causes redirect loops:
  //   /dashboard → page redirects to /login → proxy sees cookie → redirects to /dashboard → ∞
  let hasValidSession = false;
  if (sessionCookie) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      hasValidSession = !!session;
    } catch {
      // Session validation failed (expired, tampered, DB error) — treat as unauthenticated
      hasValidSession = false;
    }
  }

  // Protected routes (portal + admin, excluding setup): redirect to login if no valid session
  if ((portalRoute || adminRoute) && !setupPage && !hasValidSession) {
    const loginUrl = new URL('/login', request.url);
    const fullUrl = request.nextUrl.search
      ? pathname + request.nextUrl.search
      : pathname;
    loginUrl.searchParams.set('callbackUrl', fullUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages: redirect logged-in users to their appropriate dashboard
  if (authPage && hasValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Non-marketing routes: pass through
  if (nonMarketingRoute) {
    return NextResponse.next();
  }

  // Marketing routes: pass through
  return NextResponse.next();
}

// Config for the proxy (equivalent to middleware matcher)
export const config = {
  matcher: [
    // Match root path
    '/',

    // Match all non-static, non-api routes
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
