"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tags: string[];
  authorName: string;
  locale: "en" | "bn";
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  locale: "en" | "bn";
}

// ──────────────────────────────────────────────
// Post Actions
// ──────────────────────────────────────────────

export async function getAllPosts(page = 1, pageSize = 20, locale?: string) {
  await requireAdmin();

  const offset = (page - 1) * pageSize;
  const conditions = locale
    ? [eq(blogPosts.locale, locale as "en" | "bn")]
    : [];

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      authorName: blogPosts.authorName,
      locale: blogPosts.locale,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      categoryName: blogCategories.name,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { posts, total: Number(count), page, pageSize };
}

export async function getPostById(id: string) {
  await requireAdmin();

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  return post ?? null;
}

export async function createBlogPost(data: BlogPostInput) {
  const { userId, role } = await requireAdmin();

  if (!data.title || !data.slug || !data.content) {
    return { error: "Title, slug, and content are required." };
  }

  const [post] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt ?? null,
      coverImage: data.coverImage ?? null,
      categoryId: data.categoryId ?? null,
      tags: data.tags,
      authorName: data.authorName,
      locale: data.locale,
      status: data.status,
      publishedAt: data.status === "published" ? new Date() : null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ogImage: data.ogImage ?? null,
    })
    .returning();

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_post_created",
    targetType: "blog_post",
    targetId: post.id,
    details: { title: data.title, locale: data.locale, status: data.status },
  });

  return { success: true, id: post.id };
}

export async function updateBlogPost(id: string, data: Partial<BlogPostInput>) {
  const { userId, role } = await requireAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.authorName !== undefined) updateData.authorName = data.authorName;
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined)
    updateData.seoDescription = data.seoDescription;
  if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;

  if (data.status === "published") {
    const [existing] = await db
      .select({ status: blogPosts.status, publishedAt: blogPosts.publishedAt })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
    updateData.status = "published";
  } else if (data.status === "draft") {
    updateData.status = "draft";
  }

  await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_post_updated",
    targetType: "blog_post",
    targetId: id,
    details: { updatedFields: Object.keys(updateData) },
  });

  return { success: true };
}

export async function deleteBlogPost(id: string) {
  const { userId, role } = await requireAdmin();

  await db.delete(blogPosts).where(eq(blogPosts.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_post_deleted",
    targetType: "blog_post",
    targetId: id,
  });

  return { success: true };
}

export async function toggleBlogPostStatus(id: string) {
  const { userId, role } = await requireAdmin();

  const [post] = await db
    .select({ status: blogPosts.status, publishedAt: blogPosts.publishedAt })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  if (!post) return { error: "Post not found." };

  const newStatus = post.status === "published" ? "draft" : "published";

  await db
    .update(blogPosts)
    .set({
      status: newStatus,
      publishedAt: newStatus === "published" && !post.publishedAt ? new Date() : post.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_post_status_toggled",
    targetType: "blog_post",
    targetId: id,
    details: { from: post.status, to: newStatus },
  });

  if (newStatus === "published") {
    const [fullPost] = await db
      .select({ title: blogPosts.title, slug: blogPosts.slug, locale: blogPosts.locale })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    try {
      await sendNotification(userId, "system.blog_published", {
        postTitle: fullPost?.title || "Untitled",
        slug: fullPost?.slug || "",
        locale: fullPost?.locale || "en",
      });
    } catch (e) {
      console.error("Failed to send blog notification:", e);
    }
  }

  return { success: true, newStatus };
}

// ──────────────────────────────────────────────
// Category Actions
// ──────────────────────────────────────────────

export async function getAllCategories() {
  await requireAdmin();
  return db.select().from(blogCategories).orderBy(blogCategories.name);
}

export async function createBlogCategory(data: CategoryInput) {
  const { userId, role } = await requireAdmin();

  if (!data.name || !data.slug) {
    return { error: "Name and slug are required." };
  }

  const [category] = await db
    .insert(blogCategories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      locale: data.locale,
    })
    .returning();

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_category_created",
    targetType: "blog_category",
    targetId: category.id,
    details: { name: data.name, locale: data.locale },
  });

  return { success: true, id: category.id };
}

export async function updateBlogCategory(
  id: string,
  data: Partial<CategoryInput>
) {
  const { userId, role } = await requireAdmin();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.locale !== undefined) updateData.locale = data.locale;

  await db
    .update(blogCategories)
    .set(updateData)
    .where(eq(blogCategories.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_category_updated",
    targetType: "blog_category",
    targetId: id,
  });

  return { success: true };
}

export async function deleteBlogCategory(id: string) {
  const { userId, role } = await requireAdmin();

  await db
    .update(blogPosts)
    .set({ categoryId: null, updatedAt: new Date() })
    .where(eq(blogPosts.categoryId, id));

  await db.delete(blogCategories).where(eq(blogCategories.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.blog_category_deleted",
    targetType: "blog_category",
    targetId: id,
  });

  return { success: true };
}
