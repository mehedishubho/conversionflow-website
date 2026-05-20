"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import nodemailer from "nodemailer";

// ──────────────────────────────────────────────
// Admin Role Guard
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
// Settings lookup helper
// ──────────────────────────────────────────────

async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

// ──────────────────────────────────────────────
// 1. Get Email Provider Settings
// ──────────────────────────────────────────────

export async function getEmailProviderSettings() {
  await requireAdmin();

  const provider = (await getSetting("email_provider")) ?? "resend";
  const smtpHost = await getSetting("smtp_host");
  const smtpPort = await getSetting("smtp_port");
  const smtpUser = await getSetting("smtp_user");
  const smtpFrom = await getSetting("smtp_from");

  return {
    provider: provider as "resend" | "smtp",
    smtpHost: smtpHost ?? "",
    smtpPort: smtpPort ?? "",
    smtpUser: smtpUser ?? "",
    // T-07-10: Never return smtp_pass to client
    smtpFrom: smtpFrom ?? "",
  };
}

// ──────────────────────────────────────────────
// 2. Save Email Provider Settings
// ──────────────────────────────────────────────

export async function saveEmailProviderSettings(data: {
  provider: "resend" | "smtp";
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
}) {
  const { userId, role } = await requireAdmin();

  const entries: { key: string; value: string }[] = [
    { key: "email_provider", value: data.provider },
  ];

  if (data.smtpHost !== undefined) {
    entries.push({ key: "smtp_host", value: data.smtpHost });
  }
  if (data.smtpPort !== undefined) {
    entries.push({ key: "smtp_port", value: data.smtpPort });
  }
  if (data.smtpUser !== undefined) {
    entries.push({ key: "smtp_user", value: data.smtpUser });
  }
  if (data.smtpPass !== undefined && data.smtpPass !== "") {
    entries.push({ key: "smtp_pass", value: data.smtpPass });
  }
  if (data.smtpFrom !== undefined) {
    entries.push({ key: "smtp_from", value: data.smtpFrom });
  }

  for (const entry of entries) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, entry.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value: entry.value, updatedAt: new Date() })
        .where(eq(settings.key, entry.key));
    } else {
      await db.insert(settings).values({ key: entry.key, value: entry.value });
    }
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.settings_updated",
    targetType: "settings",
    targetId: "email_provider",
    details: { action: "email_provider_settings_updated", provider: data.provider },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 3. Test Email Connection
// ──────────────────────────────────────────────

export async function testEmailConnection(
  provider: "resend" | "smtp",
  smtpConfig?: { host: string; port: string; user: string; pass: string; from: string }
) {
  await requireAdmin();

  try {
    if (provider === "smtp") {
      if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.user) {
        return { error: "SMTP host, port, and username are required." };
      }

      const transport = nodemailer.createTransport({
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port, 10),
        secure: parseInt(smtpConfig.port, 10) === 465,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass ?? "",
        },
      });

      await transport.verify();
      transport.close();
      return { success: true, message: "SMTP connection verified successfully." };
    } else {
      // Resend test: send test email to admin's own address
      const session = await auth.api.getSession({ headers: await headers() });
      const adminEmail = session?.user?.email;

      if (!adminEmail) {
        return { error: "Could not determine admin email for test." };
      }

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: smtpConfig?.from || process.env.EMAIL_FROM || "noreply@conversionflow.com",
        to: adminEmail,
        subject: "Test Email from ConversionFlow",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
            <h2 style="color: #0047FF;">Test Email Successful</h2>
            <p>If you received this email, your Resend configuration is working correctly.</p>
            <p style="color: #666; font-size: 12px;">Sent from ConversionFlow Admin Settings</p>
          </div>
        `,
      });

      return { success: true, message: "Test email sent successfully. Check the inbox." };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Connection failed: ${message}. Verify your credentials.` };
  }
}
