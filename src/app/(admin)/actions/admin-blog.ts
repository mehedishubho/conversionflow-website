"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import type { SeoOverrides } from "./admin-page-seo";

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
  tags?: string[];
  authorName: string;
  locale: "en" | "bn";
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  seoOverrides?: SeoOverrides;
}

export interface CategoryInput {
  name: string;
  slug: string;
  locale: "en" | "bn";
  description?: string;
}

// ──────────────────────────────────────────────
// Auth Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Blog Post Actions
// ──────────────────────────────────────────────

export async function createBlogPost(data: BlogPostInput) {
  const { userId, role } = await requireAdmin();

  try {
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        tags: data.tags || [],
        authorName: data.authorName,
        locale: data.locale,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        seoOverrides: data.seoOverrides,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "blog_post.created",
      targetType: "blog_post",
      targetId: newPost.id,
      details: { title: data.title, slug: data.slug },
    });

    return { success: true, id: newPost.id };
  } catch (error: unknown) {
    console.error("Failed to create blog post:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { error: "A post with this slug already exists." };
    }
    return { error: "Failed to create blog post." };
  }
}

export async function updateBlogPost(postId: string, data: BlogPostInput) {
  const { userId, role } = await requireAdmin();

  try {
    const [existingPost] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (!existingPost) {
      return { error: "Blog post not found." };
    }

    const wasDraft = existingPost.status === "draft";
    const willBePublished = data.status === "published";

    await db
      .update(blogPosts)
      .set({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        tags: data.tags || [],
        authorName: data.authorName,
        locale: data.locale,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        seoOverrides: data.seoOverrides,
        publishedAt: wasDraft && willBePublished ? new Date() : existingPost.publishedAt,
      })
      .where(eq(blogPosts.id, postId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "blog_post.updated",
      targetType: "blog_post",
      targetId: postId,
      details: { title: data.title, slug: data.slug },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update blog post:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { error: "A post with this slug already exists." };
    }
    return { error: "Failed to update blog post." };
  }
}

export async function getPostById(postId: string) {
  await requireAdmin();

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  return post || null;
}

export async function deleteBlogPost(postId: string) {
  const { userId, role } = await requireAdmin();

  await db.delete(blogPosts).where(eq(blogPosts.id, postId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "blog_post.deleted",
    targetType: "blog_post",
    targetId: postId,
  });

  return { success: true };
}

export async function toggleBlogPostStatus(postId: string) {
  const { userId, role } = await requireAdmin();

  const [existingPost] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!existingPost) {
    return { error: "Blog post not found." };
  }

  const newStatus = existingPost.status === "published" ? "draft" : "published";

  await db
    .update(blogPosts)
    .set({
      status: newStatus,
      publishedAt: newStatus === "published" ? new Date() : existingPost.publishedAt,
    })
    .where(eq(blogPosts.id, postId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "blog_post.status_toggled",
    targetType: "blog_post",
    targetId: postId,
    details: { oldStatus: existingPost.status, newStatus },
  });

  return { success: true };
}

export async function getAllPosts(page = 1, pageSize = 20) {
  await requireAdmin();

  const offset = (page - 1) * pageSize;

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
      categoryId: blogPosts.categoryId,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogPosts);

  return {
    posts,
    total: Number(count),
    pageSize,
  };
}

// ──────────────────────────────────────────────
// Category Actions
// ──────────────────────────────────────────────

export async function createBlogCategory(data: CategoryInput) {
  const { userId, role } = await requireAdmin();

  try {
    const [newCategory] = await db
      .insert(blogCategories)
      .values({
        name: data.name,
        slug: data.slug,
        locale: data.locale,
        description: data.description,
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "blog_category.created",
      targetType: "blog_category",
      targetId: newCategory.id,
      details: { name: data.name, slug: data.slug },
    });

    return { success: true, id: newCategory.id };
  } catch (error: unknown) {
    console.error("Failed to create category:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { error: "A category with this slug already exists." };
    }
    return { error: "Failed to create category." };
  }
}

export async function updateBlogCategory(categoryId: string, data: CategoryInput) {
  const { userId, role } = await requireAdmin();

  try {
    await db
      .update(blogCategories)
      .set({
        name: data.name,
        slug: data.slug,
        locale: data.locale,
        description: data.description,
      })
      .where(eq(blogCategories.id, categoryId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "blog_category.updated",
      targetType: "blog_category",
      targetId: categoryId,
      details: { name: data.name, slug: data.slug },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update category:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { error: "A category with this slug already exists." };
    }
    return { error: "Failed to update category." };
  }
}

export async function deleteBlogCategory(categoryId: string) {
  const { userId, role } = await requireAdmin();

  await db.delete(blogCategories).where(eq(blogCategories.id, categoryId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "blog_category.deleted",
    targetType: "blog_category",
    targetId: categoryId,
  });

  return { success: true };
}

export async function getAllCategories() {
  await requireAdmin();

  return db
    .select()
    .from(blogCategories)
    .orderBy(desc(blogCategories.createdAt));
}
