import { getBlogPosts } from "@/lib/mdx";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const posts = getBlogPosts();
  return <BlogPageClient posts={posts} />;
}
