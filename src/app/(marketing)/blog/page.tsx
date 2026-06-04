import { getPublishedPosts } from "@/lib/blog";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default async function BlogPage() {
  const { posts } = await getPublishedPosts("bn", 1, 12);

  return (
    <ScrollReveal>
      <BlogPageClient posts={posts} />
    </ScrollReveal>
  );
}
