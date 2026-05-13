import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'bn'],

  // Used when no locale matches
  defaultLocale: 'bn',

  // '/bn' for Bengali, '/' for English (default)
  // Actually, if default is 'bn', then '/' is Bengali and '/en' is English.
  // The plan said: "default locale bn, and localePrefix: 'as-needed'".
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
