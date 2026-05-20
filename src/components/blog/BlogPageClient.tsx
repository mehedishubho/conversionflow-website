"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPageClientProps {
  posts: DbPost[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  activeCategory: string | null;
  locale: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function BlogPageClient({
  posts,
  categories,
  total,
  page,
  pageSize,
  activeCategory,
  locale,
}: BlogPageClientProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">Blog</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Latest from ConversionFlow
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            Insights, guides, and updates for Bangladeshi WooCommerce store owners.
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                href={`/${locale}/blog`}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  !activeCategory
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-[--border] text-muted hover:border-accent"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/blog?category=${cat.slug}`}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-[--border] text-muted hover:border-accent"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, index) => (
              <StaggerItem key={post.id}>
                <BlogCard post={post} index={index} />
              </StaggerItem>
            ))}
          </StaggerReveal>

          {posts.length === 0 && (
            <div className="text-center py-16 text-muted">
              No posts found.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              {page > 1 && (
                <Link
                  href={`/${locale}/blog?page=${page - 1}${activeCategory ? `&category=${activeCategory}` : ""}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-[--border] hover:border-accent transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/${locale}/blog?page=${page + 1}${activeCategory ? `&category=${activeCategory}` : ""}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-[--border] hover:border-accent transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
