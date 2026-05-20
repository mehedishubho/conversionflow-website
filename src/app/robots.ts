import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const siteUrl = "https://conversionflow.com";

interface ParsedRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: string;
}

function parseRobotsContent(content: string): {
  rules: ParsedRule[];
  sitemap: string;
  host: string;
} {
  const rules: ParsedRule[] = [];
  let sitemap = "";
  let host = "";
  let currentRule: ParsedRule | null = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const [, directive, value] = match;
    const normalizedDirective = directive.trim().toLowerCase();
    const trimmedValue = value.trim();

    switch (normalizedDirective) {
      case "user-agent":
        if (currentRule) {
          rules.push(currentRule);
        }
        currentRule = { userAgent: trimmedValue, allow: [], disallow: [] };
        break;
      case "allow":
        if (currentRule && trimmedValue) {
          currentRule.allow.push(trimmedValue);
        }
        break;
      case "disallow":
        if (currentRule && trimmedValue) {
          currentRule.disallow.push(trimmedValue);
        }
        break;
      case "crawl-delay":
        if (currentRule) {
          currentRule.crawlDelay = trimmedValue;
        }
        break;
      case "sitemap":
        sitemap = trimmedValue;
        break;
      case "host":
        host = trimmedValue;
        break;
    }
  }

  if (currentRule) {
    rules.push(currentRule);
  }

  return { rules, sitemap, host };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Try to read robots.txt content from DB
  let dbContent: string | null = null;
  try {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "seo_robots_txt"))
      .limit(1);
    if (row.length > 0 && row[0].value) {
      dbContent = row[0].value;
    }
  } catch {
    /* fallback to hardcoded default */
  }

  // If DB has robots.txt content, parse and use it
  if (dbContent) {
    try {
      const parsed = parseRobotsContent(dbContent);

      // Build MetadataRoute.Robots from parsed content
      const mainRule = parsed.rules.find((r) => r.userAgent === "*") ||
        parsed.rules[0] || { userAgent: "*", allow: [], disallow: [] };

      const additionalRules = parsed.rules.filter(
        (r) => r.userAgent !== "*" && r !== mainRule
      );

      const result: MetadataRoute.Robots = {
        rules: [
          {
            userAgent: mainRule.userAgent,
            allow: mainRule.allow.length > 0 ? mainRule.allow : "/",
            disallow: mainRule.disallow.length > 0 ? mainRule.disallow : [],
          },
          ...additionalRules.map((rule) => ({
            userAgent: rule.userAgent,
            allow: rule.allow.length > 0 ? rule.allow : undefined as unknown as string,
            disallow: rule.disallow.length > 0 ? rule.disallow : "/",
          })),
        ],
        sitemap: parsed.sitemap || `${siteUrl}/sitemap.xml`,
        host: parsed.host || siteUrl,
      };

      return result;
    } catch {
      /* parsing failed, fall through to default */
    }
  }

  // Hardcoded default fallback
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_next/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
