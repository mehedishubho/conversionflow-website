import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";

export const dynamicParams = false;

export async function generateStaticParams() {
  // For static generation, we'll generate params for published posts
  // This will be populated once you have database posts
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug, locale);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug, locale);

  if (!post) notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      <div className="page-hero-sm !pb-14">
        <div className="max-w-[760px] mx-auto px-7 page-hero-sm-inner">
          <Link
            href="/blog"
            className="text-[13px] font-semibold text-muted hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
          >
            <span aria-hidden="true">←</span>
            Back to blog
          </Link>
          <h1
            className="sec-title"
            style={{ fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-2px" }}
          >
            {post.title}
          </h1>
          <div className="text-sm text-muted mt-3 flex items-center justify-center gap-3">
            {post.authorName && <span>By {post.authorName}</span>}
            {post.authorName && date && <span aria-hidden="true">/</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-7 py-16">
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}
        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </>
  );
}
