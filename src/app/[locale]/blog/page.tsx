import { getPublishedPosts } from "@/lib/blog";
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
  const { locale } = await params;
  const { posts } = await getPublishedPosts(locale, 1, 12);

  return (
    <ScrollReveal>
      <BlogPageClient posts={posts} />
    </ScrollReveal>
  );
}
