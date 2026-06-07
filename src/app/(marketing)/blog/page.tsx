import { createPageMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/blog";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const generateMetadata = () => createPageMetadata("blog", "en");
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default async function BlogPage() {
  const { posts } = await getPublishedPosts("bn", 1, 12);

  return (
    <ScrollReveal>
      <BlogPageClient posts={posts} />
    </ScrollReveal>
  );
}
