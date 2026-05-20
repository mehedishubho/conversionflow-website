import Link from "next/link";
import { GradientThumbnail } from "@/components/blog/GradientThumbnail";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  locale: string;
  publishedAt: Date | null;
  categoryName: string | null;
}

export function BlogCard({ post, index }: { post: DbPost; index: number }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-surface border border-[--border] rounded-[14px] p-7 px-6 transition-all duration-[250ms] hover:border-accent hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    >
      {post.coverImage ? (
        <div className="rounded-lg overflow-hidden aspect-video">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <GradientThumbnail variant={index % 3} />
      )}
      <div className="mt-5 text-xs font-bold text-muted">
        {date && <>{date}</>}
        {date && post.categoryName && <span className="mx-2">&middot;</span>}
        {post.categoryName && <>{post.categoryName}</>}
      </div>
      <h2 className="font-dm-sans text-base font-extrabold text-foreground mt-2 mb-2">
        {post.title}
      </h2>
      <p className="text-sm text-text2 leading-relaxed">{post.excerpt}</p>
      <div className="mt-5 inline-flex rounded-full bg-[--bg2] border border-[--border] px-3 py-1 text-xs font-bold text-muted">
        {post.authorName}
      </div>
    </Link>
  );
}
