import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, sitemap, robots, and API routes
  if (
    pathname.includes('.') || // matches .ico, .svg, .xml, .txt, etc.
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return;
  }

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
