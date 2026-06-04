import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { getDocPosts } from "@/lib/mdx";

import GettingStartedBn from "@/content/docs/getting-started.bn.mdx";
import CourierSyncEn from "@/content/docs/courier-sync.mdx";
import MetaCapiEn from "@/content/docs/meta-capi.mdx";
import FraudShieldEn from "@/content/docs/fraud-shield.mdx";
import AnalyticsEn from "@/content/docs/analytics.mdx";

const docComponents: Record<string, React.ComponentType> = {
  "getting-started": GettingStartedBn,
  "courier-sync": CourierSyncEn,
  "meta-capi": MetaCapiEn,
  "fraud-shield": FraudShieldEn,
  "analytics": AnalyticsEn,
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    { slug: "getting-started" },
    { slug: "courier-sync" },
    { slug: "meta-capi" },
    { slug: "fraud-shield" },
    { slug: "analytics" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocPosts("bn").find((item) => item.slug === slug);

  if (!doc) return { title: "Page Not Found" };

  return {
    title: doc.title,
    description: `ConversionFlow ${doc.title} documentation and guide.`,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocPosts("bn").find((item) => item.slug === slug);

  if (!doc) notFound();

  const Doc = docComponents[slug];
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
