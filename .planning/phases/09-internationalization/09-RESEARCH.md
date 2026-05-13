---
phase: 09-internationalization
date: 2026-05-14
---

# Research: Phase 09 - Internationalization (Next.js 16 Proxy)

## Domain: Internationalization with Next.js 16 Proxy
Implementing `next-intl` in a Next.js 16 environment where `middleware.ts` is deprecated in favor of `proxy.ts`. The goal is to support English (default) and Bengali using URL prefixes, with a structural move to `src/app/[locale]`.

## 1. Next.js 16 Proxy Pattern
- **Requirement**: The project rules mandate `proxy.ts` instead of `middleware.ts`.
- **Implementation**: `proxy.ts` (or `proxy.js`) acts as the request interceptor. It should export a named function `proxy`.
- **Runtime**: `proxy.ts` runs on the Node.js runtime by default, providing access to standard Node APIs (unlike Edge-only legacy middleware).
- **next-intl Compatibility**: The standard `next-intl/middleware` can be adapted to work within `proxy.ts` or called manually.

## 2. Structural Migration
- **Move to `[locale]`**: All existing routes in `src/app/` (except system files like `favicon.ico`, `sitemap.ts`, `robots.ts`) must be moved to `src/app/[locale]/`.
- **Root Layout**: The root layout at `src/app/[locale]/layout.tsx` will receive the `locale` param and wrap the application.
- **Shared Files**: `sitemap.ts` and `robots.ts` should remain in the root of `src/app/` and be excluded from the proxy matcher.

## 3. i18n Routing Configuration
- **Default Locale**: `bn`.
- **Prefixing Strategy**: `localePrefix: 'as-needed'`.
  - `/` -> Bengali (Prefix hidden).
  - `/en/` -> English (Prefix visible).
  - `/features` -> Bengali.
  - `/en/features` -> English.
- **Config file**: Create `src/i18n/routing.ts` to define the `routing` object.

## 4. MDX Localization (Docs)
- **Pattern**: Parallel files in `src/content/docs/`.
  - `getting-started.mdx` (Default/English).
  - `getting-started.bn.mdx` (Bengali).
- **Fetching**: Update `src/lib/mdx.ts` to accept a `locale` parameter and append the suffix when fetching doc content.
- **Blog**: Remains English-only (fallback to default content).

## 5. Landmines & Gotchas
- **Hydration Mismatches**: `next-themes` and `LangProvider` must be carefully synchronized with the server-detected locale.
- **Proxy Matcher**: Must exclude static assets (`_next`, `api`, images) to prevent infinite loops or unnecessary processing.
- **Navigation Components**: Must use `createNavigation` from `next-intl/navigation` to ensure all `Link` and `useRouter` calls are locale-aware and respect the `as-needed` prefixing.

## 6. Validation Architecture
- **URL Testing**: Verify that `/` serves English and `/bn/` serves Bengali.
- **Language Persistence**: Verify that switching language updates the URL and stays persistent across navigation.
- **Translation Coverage**: Ensure all keys in `en.json` have counterparts in `bn.json`.
- **MDX Fallback**: Verify that missing Bengali docs fallback gracefully or show a clear "Not Translated" state.
- **SEO Verification**: Confirm `sitemap.xml` correctly references both language versions (hreflang).

## 7. Technical Implementation Steps
1. **Setup**: Install `next-intl` (if not present).
2. **Configuration**: Create `src/i18n/routing.ts` and `src/i18n/request.ts`.
3. **Proxy**: Create `src/proxy.ts` exporting `const proxy = createMiddleware(routing)`.
4. **Folder Migration**: Create `src/app/[locale]` and move routes.
5. **Layout & Provider**: Update root layout and wrap with `NextIntlClientProvider`.
6. **Navigation**: Update Navbar/Footer with `next-intl` Link components.
7. **Docs**: Refactor MDX logic for localized doc fetching.
