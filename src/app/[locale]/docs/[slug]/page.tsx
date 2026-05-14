import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { getDocPosts } from "@/lib/mdx";

export const dynamicParams = false;

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
  const doc = getDocPosts(locale).find((item) => item.slug === slug);

  if (!doc) notFound();

  // Determine if we have a localized MDX file
  let Doc;
  try {
    if (locale === 'bn') {
      Doc = (await import(`@/content/docs/${slug}.bn.mdx`)).default;
    } else {
      throw new Error('Fallback to English');
    }
  } catch (e) {
    Doc = (await import(`@/content/docs/${slug}.mdx`)).default;
  }

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
