import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (
    pathname.includes('.') || // matches .ico, .svg, .xml, .txt, etc.
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return;
  }

  const authPage = isAuthPage(pathname);
  const portalRoute = isPortalRoute(pathname);
  const adminRoute = isAdminRoute(pathname);
  const setupPage = isSetupPage(pathname);
  const nonMarketingRoute = authPage || portalRoute || adminRoute || setupPage;

  const sessionCookie = request.cookies.get('better-auth.session_token');

  // Protected routes (portal + admin, excluding setup): redirect to login if no session
  if ((portalRoute || adminRoute) && !setupPage && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    const fullUrl = request.nextUrl.search
      ? pathname + request.nextUrl.search
      : pathname;
    loginUrl.searchParams.set('callbackUrl', fullUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages: redirect logged-in users to their appropriate dashboard
  if (authPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Non-marketing routes: pass through without i18n
  if (nonMarketingRoute) {
    return NextResponse.next();
  }

  // Marketing routes: apply i18n routing
  return handleI18nRouting(request);
}

// Config for the proxy (equivalent to middleware matcher)
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the last locale for all requests that use to be locale-prefixed
    '/(bn|en)/:path*',

    // Enable redirects for pathnames without a locale
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
