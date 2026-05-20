import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";

export async function getPublishedPosts(
  locale: string,
  page = 1,
  pageSize = 9,
  categorySlug?: string
) {
  const offset = (page - 1) * pageSize;

  const conditions = [
    eq(blogPosts.status, "published"),
    eq(blogPosts.locale, locale as "en" | "bn"),
  ];

  if (categorySlug) {
    const [cat] = await db
      .select({ id: blogCategories.id })
      .from(blogCategories)
      .where(
        and(
          eq(blogCategories.slug, categorySlug),
          eq(blogCategories.locale, locale as "en" | "bn")
        )
      )
      .limit(1);
    if (cat) {
      conditions.push(eq(blogPosts.categoryId, cat.id));
    }
  }

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      authorName: blogPosts.authorName,
      locale: blogPosts.locale,
      publishedAt: blogPosts.publishedAt,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      ogImage: blogPosts.ogImage,
      tags: blogPosts.tags,
      categoryId: blogPosts.categoryId,
      categoryName: blogCategories.name,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(and(...conditions));

  return { posts, total: Number(count), page, pageSize };
}

export async function getPostBySlug(slug: string, locale: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.locale, locale as "en" | "bn"),
        eq(blogPosts.status, "published")
      )
    );
  return post ?? null;
}

export async function getBlogCategories(locale: string) {
  return db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.locale, locale as "en" | "bn"))
    .orderBy(blogCategories.name);
}

export async function getPostCount(locale: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.locale, locale as "en" | "bn"),
        eq(blogPosts.status, "published")
      )
    );
  return Number(count);
}
