import type { MetadataRoute } from "next";
import { getBlogPosts, getDocPosts } from "@/lib/mdx";
import { siteConfig } from "@/lib/site";
import { landingPages } from "@/data/landing-pages";

const siteUrl = siteConfig.url;
const locales = ["en", "bn"];

function getUrl(locale: string, path: string) {
  const prefixStr = locale === "bn" ? "" : `/${locale}`;
  return `${siteUrl}${prefixStr}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    // Static Routes
    const staticPaths = ["", "/features", "/pricing", "/changelog", "/faq", "/platform-comparison", "/support", "/blog", "/docs", "/privacy", "/terms", "/refund", "/license"];
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

    landingPages.forEach((page) => {
      routes.push({
        url: getUrl(locale, `/${page.slug}`),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            en: getUrl("en", `/${page.slug}`),
            bn: getUrl("bn", `/${page.slug}`),
          },
        },
      });
    });
  });

  return routes;
}
