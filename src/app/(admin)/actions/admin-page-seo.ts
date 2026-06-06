"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings, blogPosts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

export interface SeoOverrides {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  robots?: { index: boolean; follow: boolean };
  ogImage?: string;
  schemaType?: string;
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
// Marketing Pages SEO (stored in settings table)
// ──────────────────────────────────────────────

export async function getPageSeoOverrides(pageKey: string) {
  await requireAdmin();

  const setting = await db
    .select()
    .from(settings)
    .where(eq(settings.key, `seo_page_overrides_${pageKey}`))
    .limit(1);

  if (setting.length === 0 || !setting[0].value) {
    return {};
  }

  try {
    return JSON.parse(setting[0].value) as SeoOverrides;
  } catch {
    return {};
  }
}

export async function savePageSeoOverrides(
  pageKey: string,
  overrides: SeoOverrides
) {
  const { userId, role } = await requireAdmin();

  const value = JSON.stringify(overrides);

  await db
    .insert(settings)
    .values({
      key: `seo_page_overrides_${pageKey}`,
      value,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "page_seo.updated",
    targetType: "page_seo",
    targetId: pageKey,
    details: { pageKey, overrides },
  });

  return { success: true };
}

export async function getAllPageSeoOverrides(): Promise<
  Record<string, SeoOverrides>
> {
  await requireAdmin();

  const allSettings = await db
    .select()
    .from(settings)
    .where(sql`key LIKE ${`seo_page_overrides_%`}`);

  const result: Record<string, SeoOverrides> = {};

  for (const setting of allSettings) {
    const pageKey = setting.key.replace("seo_page_overrides_", "");
    try {
      result[pageKey] = JSON.parse(setting.value) as SeoOverrides;
    } catch {
      result[pageKey] = {};
    }
  }

  return result;
}

// ──────────────────────────────────────────────
// Blog Posts SEO (stored in JSONB column)
// ──────────────────────────────────────────────

export async function getBlogSeoOverrides(postId: string) {
  await requireAdmin();

  const [post] = await db
    .select({ seoOverrides: blogPosts.seoOverrides })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post) {
    return {};
  }

  return (post.seoOverrides as SeoOverrides) || {};
}

export async function saveBlogSeoOverrides(
  postId: string,
  overrides: SeoOverrides
) {
  const { userId, role } = await requireAdmin();

  await db
    .update(blogPosts)
    .set({ seoOverrides: overrides })
    .where(eq(blogPosts.id, postId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "blog_seo.updated",
    targetType: "blog_post",
    targetId: postId,
    details: { postId, overrides },
  });

  return { success: true };
}
