import { pageSeo } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Read custom additions from settings if available
    let customContent = "";
    try {
      const row = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "seo_llms_txt_custom"))
        .limit(1);
      if (row.length > 0 && row[0].value) {
        customContent = row[0].value;
      }
    } catch {
      // DB not available, skip custom content
    }

    const siteUrl = siteConfig.url;
    const features = pageSeo.features;
    const pricing = pageSeo.pricing;
    const docs = pageSeo.docs;
    const support = pageSeo.support;
    const changelog = pageSeo.changelog;
    const faq = pageSeo.faq;

    const lines: string[] = [
      `# ${siteConfig.name}`,
      ``,
      `> Commerce tracking, courier automation, COD fraud protection, and analytics for WooCommerce stores.`,
      ``,
      `## Product`,
      ``,
      `- [${features.title}](${siteUrl}${features.path}): ${features.description}`,
      ``,
      `## Pricing`,
      ``,
      `- [${pricing.title}](${siteUrl}${pricing.path}): ${pricing.description}`,
      ``,
      `## Documentation`,
      ``,
      `- [${docs.title}](${siteUrl}${docs.path}): ${docs.description}`,
      ``,
      `## Support`,
      ``,
      `- [${support.title}](${siteUrl}${support.path}): ${support.description}`,
      ``,
      `## Optional`,
      ``,
      `- [${changelog.title}](${siteUrl}${changelog.path}): ${changelog.description}`,
      `- [${faq.title}](${siteUrl}${faq.path}): ${faq.description}`,
    ];

    if (customContent.trim()) {
      lines.push("", customContent.trim());
    }

    const content = lines.join("\n");

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("llms.txt generation failed:", error);
    // Minimal fallback on any failure
    const fallback = [
      `# ${siteConfig.name}`,
      ``,
      `> Commerce tracking, courier automation, COD fraud protection, and analytics for WooCommerce stores.`,
      ``,
      `Website: ${siteConfig.url}`,
    ].join("\n");

    return new Response(fallback, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
