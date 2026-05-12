import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { getDocPosts } from "@/lib/mdx";

export const dynamicParams = false;

export function generateStaticParams() {
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
  const doc = getDocPosts().find((item) => item.slug === slug);

  if (!doc) return { title: "Page Not Found" };

  return {
    title: doc.title,
    description: `WooBooster ${doc.title} documentation and guide.`,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocPosts().find((item) => item.slug === slug);

  if (!doc) notFound();

  const { default: Doc } = await import(`@/content/docs/${slug}.mdx`);

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
