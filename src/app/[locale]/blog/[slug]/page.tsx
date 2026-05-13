import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getBlogPosts } from "@/lib/mdx";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.flatMap(post => [
    { locale: "en", slug: post.slug },
    { locale: "bn", slug: post.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPosts().find((item) => item.slug === slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | WooBooster`,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((item) => item.slug === slug);

  if (!post) notFound();

  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
            <span>{date}</span>
            <span aria-hidden="true">/</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-7 py-16">
        <article className="prose dark:prose-invert max-w-none">
          <Post />
        </article>
      </div>
    </>
  );
}
