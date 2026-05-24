import Link from "next/link";
import type { DatabaseBlogPost } from "@/components/blog/BlogPageClient";
import { GradientThumbnail } from "@/components/blog/GradientThumbnail";

export function BlogCard({ post, index }: { post: DatabaseBlogPost; index: number }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-surface border border-[--border] rounded-[14px] p-7 px-6 transition-all duration-[250ms] hover:border-accent hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    >
      <GradientThumbnail variant={index % 3} />
      <div className="mt-5 text-xs font-bold text-muted">{date}</div>
      <h2 className="font-dm-sans text-base font-extrabold text-foreground mt-2 mb-2">
        {post.title}
      </h2>
      <p className="text-sm text-text2 leading-relaxed">{post.excerpt}</p>
      {post.categoryName && (
        <div className="mt-5 inline-flex rounded-full bg-[--bg2] border border-[--border] px-3 py-1 text-xs font-bold text-muted">
          {post.categoryName}
        </div>
      )}
    </Link>
  );
}
