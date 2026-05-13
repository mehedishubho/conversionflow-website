import { getBlogPosts } from "@/lib/mdx";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export default function BlogPage() {
  const posts = getBlogPosts();
  return <BlogPageClient posts={posts} />;
}
