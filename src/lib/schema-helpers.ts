import { siteConfig } from "@/lib/site";

function parseSameAs(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function organizationSchema(overrides?: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: overrides?.org_name || siteConfig.legalName,
    url: overrides?.org_url || siteConfig.url,
    email: overrides?.org_email || siteConfig.supportEmail,
    logo: overrides?.org_logo || undefined,
    sameAs: overrides?.org_same_as
      ? parseSameAs(overrides.org_same_as)
      : [
          "https://facebook.com/conversionflow",
          "https://linkedin.com/company/conversionflow",
        ],
  };
}

export function websiteSchema(overrides?: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: overrides?.site_name || siteConfig.legalName,
    url: overrides?.site_url || siteConfig.url,
    ...(overrides?.search_action_url
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: overrides.search_action_url,
            "query-input": "required name=search_term_string",
          },
        }
      : {
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
  };
}

export function productSchema(overrides?: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: overrides?.product_name || siteConfig.legalName,
    applicationCategory: overrides?.product_category || "BusinessApplication",
    operatingSystem:
      overrides?.product_os || "Web, WordPress, Laravel, Node.js",
    url: overrides?.product_url || siteConfig.url,
    ...(overrides?.product_description
      ? { description: overrides.product_description }
      : {}),
    offers: {
      "@type": "AggregateOffer",
      lowPrice: overrides?.product_low_price || "18",
      highPrice: overrides?.product_high_price || "210",
      priceCurrency: overrides?.product_currency || "USD",
      offerCount: overrides?.product_offer_count || "9",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
  overrides?: Record<string, string>
) {
  const baseUrl = overrides?.breadcrumb_base_url || siteConfig.url;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
