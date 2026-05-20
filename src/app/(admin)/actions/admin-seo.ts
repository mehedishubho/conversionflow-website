"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

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

export async function pingSearchEngines(): Promise<{
  google: boolean;
  bing: boolean;
  timestamp: string;
}> {
  await requireAdmin();
  const siteUrl = "https://conversionflow.com";
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const now = new Date().toISOString();
  let googleOk = false;
  let bingOk = false;

  try {
    const gRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { method: "GET", signal: AbortSignal.timeout(10000) }
    );
    googleOk = gRes.ok;
  } catch {
    /* ping best-effort */
  }
  try {
    const bRes = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { method: "GET", signal: AbortSignal.timeout(10000) }
    );
    bingOk = bRes.ok;
  } catch {
    /* ping best-effort */
  }

  // Store the timestamp in settings
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "seo_sitemap_last_generated"))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value: now, updatedAt: new Date() })
      .where(eq(settings.key, "seo_sitemap_last_generated"));
  } else {
    await db.insert(settings).values({
      key: "seo_sitemap_last_generated",
      value: now,
    });
  }

  return { google: googleOk, bing: bingOk, timestamp: now };
}
