import { getPublishedPosts, getBlogCategories } from "@/lib/blog";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const categorySlug = sp.category;

  const { posts, total, pageSize } = await getPublishedPosts(
    locale,
    page,
    9,
    categorySlug
  );
  const categories = await getBlogCategories(locale);

  return (
    <ScrollReveal>
      <BlogPageClient
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? "",
          coverImage: p.coverImage ?? null,
          authorName: p.authorName,
          locale: p.locale,
          publishedAt: p.publishedAt,
          categoryName: p.categoryName ?? null,
        }))}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))}
        total={total}
        page={page}
        pageSize={pageSize}
        activeCategory={categorySlug ?? null}
        locale={locale}
      />
    </ScrollReveal>
  );
}
