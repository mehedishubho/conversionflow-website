import { getBlogPosts } from "@/lib/mdx";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

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
  return (
    <ScrollReveal>
      <BlogPageClient posts={posts} />
    </ScrollReveal>
  );
}
