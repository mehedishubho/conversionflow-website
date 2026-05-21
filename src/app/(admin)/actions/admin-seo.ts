"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings, seo404Errors } from "@/lib/db/schema";
import { eq, inArray, desc, sql } from "drizzle-orm";
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

export async function get404Errors(limit = 50): Promise<{
  errors: Array<{
    id: string;
    url: string;
    referrer: string | null;
    hitCount: number;
    lastSeenAt: Date;
    createdAt: Date;
  }>;
  total: number;
}> {
  await requireAdmin();

  const errors = await db
    .select()
    .from(seo404Errors)
    .orderBy(desc(seo404Errors.lastSeenAt))
    .limit(limit);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(seo404Errors);

  return {
    errors,
    total: Number(countResult[0]?.count ?? 0),
  };
}

export async function getSitemapHealth(): Promise<{
  totalUrls: number;
  lastGenerated: string;
  xmlValid: boolean;
  sitemapEnabled: boolean;
}> {
  await requireAdmin();

  try {
    const sitemapModule = await import("@/app/sitemap");
    const sitemapFn = sitemapModule.default;
    const entries = await sitemapFn();

    const [enabledRow, lastGenRow] = await Promise.all([
      db
        .select()
        .from(settings)
        .where(eq(settings.key, "seo_sitemap_enabled"))
        .limit(1),
      db
        .select()
        .from(settings)
        .where(eq(settings.key, "seo_sitemap_last_generated"))
        .limit(1),
    ]);

    return {
      totalUrls: entries.length,
      lastGenerated: lastGenRow[0]?.value ?? "Never",
      xmlValid: Array.isArray(entries) && entries.length >= 0,
      sitemapEnabled: enabledRow[0]?.value !== "false",
    };
  } catch {
    return {
      totalUrls: 0,
      lastGenerated: "Never",
      xmlValid: false,
      sitemapEnabled: false,
    };
  }
}

export async function log404Error(
  url: string,
  referrer: string | null
): Promise<{ success: boolean }> {
  try {
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return { success: false };
    }

    const sanitizedUrl = url.replace(/<[^>]*>/g, "");
    const sanitizedReferrer = referrer ? referrer.replace(/<[^>]*>/g, "") : null;

    await db
      .insert(seo404Errors)
      .values({ url: sanitizedUrl, referrer: sanitizedReferrer })
      .onConflictDoUpdate({
        target: seo404Errors.url,
        set: {
          hitCount: sql`${seo404Errors.hitCount} + 1`,
          lastSeenAt: new Date(),
          referrer: sanitizedReferrer ?? sql`COALESCE(${seo404Errors.referrer}, '')`,
        },
      });

    return { success: true };
  } catch {
    return { success: false };
  }
}
