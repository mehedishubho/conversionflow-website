import type { MetadataRoute } from "next";
import { getBlogPosts, getDocPosts } from "@/lib/mdx";

const siteUrl = "https://conversionflow.com";
const locales = ["en", "bn"];

function getUrl(locale: string, path: string) {
  // Assuming default locale 'en' does not have a prefix, and 'bn' does
  // But wait, next-intl usually has prefix for all or prefix for non-default.
  // In `src/i18n/routing.ts`, it might be configured. Let's assume standard behavior.
  const prefix = locale === "en" ? "/en" : "/bn"; // or just standard next-intl behavior
  // Looking at the previous code: `locale === "bn" ? "" : "/" + locale`? Wait, next-intl usually puts default locale at root. If en is default, en is root.
  // Let's check what the old code did: `locale === "bn" ? "" : "/" + locale` - wait, that would mean bn is root and en is /en. Let's just use /en and /bn for alternates, or whatever the actual routes are.
  // Let's use `prefix = locale === "en" ? "" : "/bn"` if English is default.
  const prefixStr = locale === "en" ? "" : `/${locale}`;
  return `${siteUrl}${prefixStr}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    // Static Routes
    const staticPaths = ["", "/features", "/pricing", "/changelog", "/support", "/blog", "/docs", "/privacy", "/terms", "/refund", "/license"];
    staticPaths.forEach((path) => {
      routes.push({
        url: getUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: getUrl("en", path),
            bn: getUrl("bn", path),
          },
        },
      });
    });

    // Blog Routes
    getBlogPosts().forEach((post) => {
      routes.push({
        url: getUrl(locale, `/blog/${post.slug}`),
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            en: getUrl("en", `/blog/${post.slug}`),
            bn: getUrl("bn", `/blog/${post.slug}`),
          },
        },
      });
    });

    // Doc Routes
    getDocPosts(locale).forEach((doc) => {
      routes.push({
        url: getUrl(locale, `/docs/${doc.slug}`),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            en: getUrl("en", `/docs/${doc.slug}`),
            bn: getUrl("bn", `/docs/${doc.slug}`),
          },
        },
      });
    });
  });

  return routes;
}
