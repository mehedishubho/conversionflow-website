import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { getDocPosts } from "@/lib/mdx";

// Static imports for MDX content — avoids dynamic import() which causes
// "Expected a suspended thenable" during static generation with Turbopack + React 19.
import GettingStartedEn from "@/content/docs/getting-started.mdx";
import CourierSyncEn from "@/content/docs/courier-sync.mdx";
import MetaCapiEn from "@/content/docs/meta-capi.mdx";
import FraudShieldEn from "@/content/docs/fraud-shield.mdx";
import AnalyticsEn from "@/content/docs/analytics.mdx";
import GettingStartedBn from "@/content/docs/getting-started.bn.mdx";

const docComponents: Record<string, Record<string, React.ComponentType>> = {
  en: {
    "getting-started": GettingStartedEn,
    "courier-sync": CourierSyncEn,
    "meta-capi": MetaCapiEn,
    "fraud-shield": FraudShieldEn,
    "analytics": AnalyticsEn,
  },
  bn: {
    "getting-started": GettingStartedBn,
    // Bengali docs that don't have a .bn.mdx file fall back to English
    "courier-sync": CourierSyncEn,
    "meta-capi": MetaCapiEn,
    "fraud-shield": FraudShieldEn,
    "analytics": AnalyticsEn,
  },
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    { locale: "en", slug: "getting-started" },
    { locale: "en", slug: "courier-sync" },
    { locale: "en", slug: "meta-capi" },
    { locale: "en", slug: "fraud-shield" },
    { locale: "en", slug: "analytics" },
    { locale: "bn", slug: "getting-started" },
    { locale: "bn", slug: "courier-sync" },
    { locale: "bn", slug: "meta-capi" },
    { locale: "bn", slug: "fraud-shield" },
    { locale: "bn", slug: "analytics" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getDocPosts(locale).find((item) => item.slug === slug);

  if (!doc) return { title: "Page Not Found" };

  return {
    title: doc.title,
    description: `ConversionFlow ${doc.title} documentation and guide.`,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = getDocPosts(locale).find((item) => item.slug === slug);

  if (!doc) notFound();

  const Doc = docComponents[locale]?.[slug];
  if (!Doc) notFound();

  return (
    <>
      <h1 className="sec-title" style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}>
        {doc.title}
      </h1>
      <div className="mt-8">
        <TableOfContents />
        <article className="prose dark:prose-invert max-w-none">
          <Doc />
        </article>
      </div>
    </>
  );
}
