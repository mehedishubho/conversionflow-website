import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and updates for Bangladeshi WooCommerce store owners.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Blog</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Latest from WooBooster
          </div>
          <p className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}>
            Insights, guides, and updates for Bangladeshi WooCommerce store owners.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
