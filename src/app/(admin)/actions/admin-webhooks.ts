"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { webhooks, webhookDeliveries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return { session, userId: session.user.id, role };
}

function generateSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

export interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  status: string;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

export async function getAdminWebhooks(): Promise<WebhookRow[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: webhooks.id,
      url: webhooks.url,
      events: webhooks.events,
      status: webhooks.status,
      lastTriggeredAt: webhooks.lastTriggeredAt,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .orderBy(desc(webhooks.createdAt));

  return rows.map((r) => ({
    ...r,
    events: (r.events as string[]) ?? [],
  }));
}

export interface WebhookDeliveryRow {
  id: string;
  webhookUrl: string;
  event: string;
  statusCode: number | null;
  success: boolean | null;
  attempts: number | null;
  createdAt: Date;
}

export async function getWebhookDeliveries(limit = 50): Promise<WebhookDeliveryRow[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: webhookDeliveries.id,
      webhookId: webhookDeliveries.webhookId,
      event: webhookDeliveries.event,
      statusCode: webhookDeliveries.statusCode,
      success: webhookDeliveries.success,
      attempts: webhookDeliveries.attempts,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);

  const webhookIds = [...new Set(rows.map((r) => r.webhookId))];
  if (webhookIds.length === 0) return [];

  const webhookRows = await db
    .select({ id: webhooks.id, url: webhooks.url })
    .from(webhooks);

  const urlMap = new Map(webhookRows.map((w) => [w.id, w.url]));

  return rows.map((r) => ({
    id: r.id,
    webhookUrl: urlMap.get(r.webhookId) ?? "Deleted webhook",
    event: r.event,
    statusCode: r.statusCode,
    success: r.success,
    attempts: r.attempts,
    createdAt: r.createdAt,
  }));
}

export async function createWebhook(
  url: string,
  events: string[]
): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  if (!url.startsWith("https://")) {
    return { error: "Webhook URL must use HTTPS" };
  }
  if (events.length === 0) {
    return { error: "Select at least one event" };
  }

  try {
    const secret = generateSecret();
    await db.insert(webhooks).values({ url, events, secret });

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "webhook.created",
      targetType: "webhook",
      details: { url, events },
    });

    return { success: true };
  } catch {
    return { error: "Failed to create webhook" };
  }
}

export async function deleteWebhook(
  webhookId: string
): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "webhook.deleted",
      targetType: "webhook",
      targetId: webhookId,
    });

    return { success: true };
  } catch {
    return { error: "Failed to delete webhook" };
  }
}

export async function toggleWebhookStatus(
  webhookId: string
): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    const [existing] = await db
      .select({ id: webhooks.id, status: webhooks.status })
      .from(webhooks)
      .where(eq(webhooks.id, webhookId))
      .limit(1);

    if (!existing) return { error: "Webhook not found" };

    const newStatus = existing.status === "active" ? "inactive" : "active";
    await db
      .update(webhooks)
      .set({ status: newStatus })
      .where(eq(webhooks.id, webhookId));

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "webhook.status_changed",
      targetType: "webhook",
      targetId: webhookId,
      details: { from: existing.status, to: newStatus },
    });

    return { success: true };
  } catch {
    return { error: "Failed to toggle webhook status" };
  }
}
