"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { eq, and, sql, ilike } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

// ──────────────────────────────────────────────
// Auth guard
// ──────────────────────────────────────────────

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

export interface RedirectRow {
  id: string;
  fromUrl: string;
  toUrl: string;
  type: "301" | "302";
  isRegex: boolean;
  hitCount: number;
  status: "active" | "inactive";
  createdAt: Date;
}

interface RedirectInput {
  fromUrl: string;
  toUrl: string;
  type: "301" | "302";
  isRegex: boolean;
}

// ──────────────────────────────────────────────
// Regex safety validation
// ──────────────────────────────────────────────

const REDOS_PATTERNS = /(\.+\+)+|(\.\*)\*|(\.+\+)|(\.\+)\+/;

function validateRegex(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern);
  } catch {
    return { valid: false, error: "Invalid regex pattern." };
  }

  if (REDOS_PATTERNS.test(pattern)) {
    return {
      valid: false,
      error: "Potentially dangerous regex pattern (nested quantifiers). Please simplify.",
    };
  }

  return { valid: true };
}

// ──────────────────────────────────────────────
// CRUD Actions
// ──────────────────────────────────────────────

export async function getRedirects(
  page = 1,
  pageSize = 20,
  search?: string,
  status?: string
): Promise<{
  redirects: RedirectRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  await requireAdmin();

  const conditions = [];

  if (search) {
    conditions.push(ilike(redirects.fromUrl, `%${search}%`));
  }

  if (status && status !== "all") {
    conditions.push(eq(redirects.status, status as "active" | "inactive"));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const offset = (page - 1) * pageSize;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(redirects)
      .where(whereClause)
      .orderBy(sql`${redirects.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(redirects)
      .where(whereClause),
  ]);

  return {
    redirects: rows as RedirectRow[],
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}

export async function createRedirect(
  data: RedirectInput
): Promise<{ success: boolean; error?: string }> {
  const { userId, role } = await requireAdmin();

  if (!data.fromUrl.trim() || !data.toUrl.trim()) {
    return { success: false, error: "From URL and To URL are required." };
  }

  if (data.isRegex) {
    const validation = validateRegex(data.fromUrl);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
  }

  await db.insert(redirects).values({
    fromUrl: data.fromUrl.trim(),
    toUrl: data.toUrl.trim(),
    type: data.type,
    isRegex: data.isRegex,
    status: "active",
  });

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "redirect.created",
    targetType: "redirect",
    details: { fromUrl: data.fromUrl, toUrl: data.toUrl, type: data.type },
  });

  return { success: true };
}

export async function updateRedirect(
  id: string,
  data: Partial<RedirectInput & { status: "active" | "inactive" }>
): Promise<{ success: boolean; error?: string }> {
  const { userId, role } = await requireAdmin();

  if (data.isRegex && data.fromUrl) {
    const validation = validateRegex(data.fromUrl);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.fromUrl !== undefined) updateData.fromUrl = data.fromUrl.trim();
  if (data.toUrl !== undefined) updateData.toUrl = data.toUrl.trim();
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isRegex !== undefined) updateData.isRegex = data.isRegex;
  if (data.status !== undefined) updateData.status = data.status;

  await db
    .update(redirects)
    .set(updateData)
    .where(eq(redirects.id, id));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "redirect.updated",
    targetType: "redirect",
    targetId: id,
    details: { updates: updateData },
  });

  return { success: true };
}

export async function deleteRedirects(
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  const { userId, role } = await requireAdmin();

  if (ids.length === 0) {
    return { success: false, error: "No redirect IDs provided." };
  }

  await db
    .delete(redirects)
    .where(sql`${redirects.id} = ANY(${ids})`);

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "redirect.bulk_deleted",
    targetType: "redirect",
    details: { count: ids.length, ids },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// CSV Import / Export
// ──────────────────────────────────────────────

export async function importRedirectsCsv(
  csvText: string
): Promise<{ success: boolean; imported: number; error?: string }> {
  const { userId, role } = await requireAdmin();

  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { success: false, imported: 0, error: "CSV file is empty." };
  }

  // Skip header row if it contains "from"
  const startIndex = lines[0].toLowerCase().includes("from") ? 1 : 0;

  const rows: { fromUrl: string; toUrl: string }[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV injection prevention: reject lines starting with dangerous characters
    if (/^[=+\-@]/.test(line)) continue;

    const parts = line.split(",");
    if (parts.length !== 2) continue;

    const fromUrl = parts[0].trim();
    const toUrl = parts[1].trim();

    if (!fromUrl || !toUrl) continue;

    rows.push({ fromUrl, toUrl });
  }

  if (rows.length === 0) {
    return {
      success: false,
      imported: 0,
      error: "No valid redirect entries found in CSV.",
    };
  }

  // Insert with conflict handling
  for (const row of rows) {
    await db
      .insert(redirects)
      .values({
        fromUrl: row.fromUrl,
        toUrl: row.toUrl,
        type: "301",
        isRegex: false,
        status: "active",
      })
      .onConflictDoNothing();
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "redirect.csv_imported",
    targetType: "redirect",
    details: { imported: rows.length },
  });

  return { success: true, imported: rows.length };
}

export async function exportRedirectsCsv(): Promise<string> {
  await requireAdmin();

  const rows = await db
    .select()
    .from(redirects)
    .orderBy(sql`${redirects.createdAt} DESC`);

  const header = "from_url,to_url";
  const lines = rows.map((row) => `${row.fromUrl},${row.toUrl}`);

  return [header, ...lines].join("\n");
}
