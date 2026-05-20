"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

const SEO_KEYS = [
  // General SEO (10)
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_canonical_url",
  "seo_separator",
  "seo_robots_default",
  "seo_og_image",
  "seo_auto_meta",
  "seo_lowercase_urls",
  "seo_trailing_slash",
  // Verification (5)
  "seo_verify_google",
  "seo_verify_bing",
  "seo_verify_yandex",
  "seo_verify_baidu",
  "seo_verify_pinterest",
  // Sitemaps (8)
  "seo_sitemap_enabled",
  "seo_sitemap_pages",
  "seo_sitemap_blog",
  "seo_sitemap_docs",
  "seo_sitemap_landing",
  "seo_sitemap_excludes",
  "seo_sitemap_frequency",
  "seo_sitemap_auto_regenerate",
  // Robots (2)
  "seo_robots_txt",
  "seo_ai_bots",
] as const;

export type SeoKey = (typeof SEO_KEYS)[number];

export const GENERAL_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(0, 10);
export const VERIFICATION_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(10, 15);
export const SITEMAP_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(15, 23);
export const ROBOTS_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(23, 25);

export interface SeoSettingsData {
  [key: string]: string;
}

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

export async function getSeoSettings(keys?: string[]): Promise<SeoSettingsData> {
  await requireAdmin();

  const queryKeys = keys
    ? keys.filter((k) => (SEO_KEYS as readonly string[]).includes(k))
    : [...SEO_KEYS];

  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, queryKeys));

  const map: SeoSettingsData = {};
  for (const key of queryKeys) {
    const row = rows.find((r) => r.key === key);
    map[key] = row?.value ?? "";
  }
  return map;
}

export async function saveSeoSettings(data: SeoSettingsData): Promise<{ success: boolean }> {
  const { userId, role } = await requireAdmin();

  const updatedKeys: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (!(SEO_KEYS as readonly string[]).includes(key)) continue;

    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }

    updatedKeys.push(key);
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.seo_settings_updated",
    targetType: "settings",
    targetId: "seo",
    details: {
      action: "seo_settings_updated",
      keys: updatedKeys,
    },
  });

  return { success: true };
}

export async function getSeoScore(): Promise<{
  filled: number;
  total: number;
  percentage: number;
}> {
  await requireAdmin();

  const allSettings = await getSeoSettings();
  const filled = Object.values(allSettings).filter(
    (v) => v !== "" && v !== undefined
  ).length;

  return {
    filled,
    total: SEO_KEYS.length,
    percentage: Math.round((filled / SEO_KEYS.length) * 100),
  };
}
