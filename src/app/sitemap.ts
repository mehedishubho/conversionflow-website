import type { MetadataRoute } from "next";
import { getDocPosts } from "@/lib/mdx";
import { getPublishedPosts } from "@/lib/blog";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const siteUrl = "https://conversionflow.com";
const locales = ["en", "bn"];

function getUrl(locale: string, path: string) {
  const prefixStr = locale === "en" ? "" : `/${locale}`;
  return `${siteUrl}${prefixStr}${path}`;
}

// Revalidate every hour (3600 seconds).
// NOTE: `export const revalidate` must be a static literal — Next.js parses it at build time.
// For on-demand revalidation, use `revalidateTag('sitemap')` from a server action instead.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Read DB settings for sitemap configuration
  let sitemapOverrides: Record<string, string> = {};
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(
        inArray(settings.key, [
          "seo_sitemap_enabled",
          "seo_sitemap_pages",
          "seo_sitemap_blog",
          "seo_sitemap_docs",
          "seo_sitemap_landing",
          "seo_sitemap_excludes",
          "seo_sitemap_auto_regenerate",
        ])
      );
    for (const row of rows) sitemapOverrides[row.key] = row.value;
  } catch {
    /* fallback to defaults */
  }

  // If sitemap is explicitly disabled, return empty
  if (sitemapOverrides.seo_sitemap_enabled === "false") {
    return [];
  }

  const routes: MetadataRoute.Sitemap = [];

  // Parse exclude patterns
  const excludePatterns = (sitemapOverrides.seo_sitemap_excludes ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const isExcluded = (url: string): boolean => {
    const path = new URL(url).pathname;
    return excludePatterns.some((pattern) => path.startsWith(pattern));
  };

  for (const locale of locales) {
    // Static Routes (always included as part of pages)
    const includePages = sitemapOverrides.seo_sitemap_pages !== "false";
    if (includePages) {
      const staticPaths = [
        "",
        "/features",
        "/pricing",
        "/changelog",
        "/support",
        "/blog",
        "/docs",
        "/privacy",
        "/terms",
        "/refund",
        "/license",
      ];
      staticPaths.forEach((path) => {
        const url = getUrl(locale, path);
        if (!isExcluded(url)) {
          routes.push({
            url,
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
        }
      });
    }

    // Blog Routes
    const includeBlog = sitemapOverrides.seo_sitemap_blog !== "false";
    if (includeBlog) {
      const { posts } = await getPublishedPosts(locale, 1, 1000); // Get all published posts
      posts.forEach((post) => {
        const url = getUrl(locale, `/blog/${post.slug}`);
        if (!isExcluded(url)) {
          routes.push({
            url,
            lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
            alternates: {
              languages: {
                en: getUrl("en", `/blog/${post.slug}`),
                bn: getUrl("bn", `/blog/${post.slug}`),
              },
            },
          });
        }
      });
    }

    // Doc Routes
    const includeDocs = sitemapOverrides.seo_sitemap_docs !== "false";
    if (includeDocs) {
      getDocPosts(locale).forEach((doc) => {
        const url = getUrl(locale, `/docs/${doc.slug}`);
        if (!isExcluded(url)) {
          routes.push({
            url,
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
        }
      });
    }

    // Landing Pages (not currently generated dynamically, placeholder for future)
    const includeLanding = sitemapOverrides.seo_sitemap_landing === "true";
    if (includeLanding) {
      // Landing pages will be added when landing page data source is available
    }
  }

  return routes;
}
