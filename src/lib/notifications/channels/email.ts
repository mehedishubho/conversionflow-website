/**
 * Email channel adapter with dual provider support.
 *
 * Supports Resend (primary) and SMTP (fallback) based on admin settings.
 * Admin can switch providers via the `email_provider` setting in the DB.
 * SMTP transporter is cached to prevent memory leaks (Pitfall 4 from RESEARCH).
 */

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { settings, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getEmailTemplate } from "@/lib/notifications/templates";
import type { NotificationEvent } from "@/lib/notifications/types";

// ──────────────────────────────────────────────
// Cached SMTP transporter
// ──────────────────────────────────────────────

let smtpTransporter: nodemailer.Transporter | null = null;
let lastSmtpConfig = "";

// ──────────────────────────────────────────────
// Resend instance (lazy)
// ──────────────────────────────────────────────

let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
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
// Main send function
// ──────────────────────────────────────────────

/**
 * Send a notification email to a user.
 *
 * Looks up user email, resolves the email template, and sends via
 * Resend (default) or SMTP based on the `email_provider` setting.
 *
 * @throws Error if user not found or email not verified (caught by per-channel try/catch in sendNotification)
 */
export async function sendEmail(
  userId: string,
  event: NotificationEvent,
  data: Record<string, unknown>
): Promise<void> {
  // 1. Look up user email
  const userRows = await db
    .select({
      email: user.email,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userRows.length === 0 || !userRows[0].email) {
    throw new Error("User email not available");
  }

  const userEmail = userRows[0].email;

  // 2. Resolve template
  const template = getEmailTemplate(event, data);

  // 3. Determine provider
  const provider = (await getSetting("email_provider")) ?? "resend";

  if (provider === "smtp") {
    await sendViaSmtp(userEmail, template.subject, template.html);
  } else {
    await sendViaResend(userEmail, template.subject, template.html);
  }
}

// ──────────────────────────────────────────────
// Resend provider
// ──────────────────────────────────────────────

async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const resend = getResendInstance();
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
    to,
    subject,
    html,
  });
}

// ──────────────────────────────────────────────
// SMTP provider
// ──────────────────────────────────────────────

async function sendViaSmtp(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const host = await getSetting("smtp_host");
  const portStr = await getSetting("smtp_port");
  const userStr = await getSetting("smtp_user");
  const pass = await getSetting("smtp_pass");
  const fromEmail =
    (await getSetting("smtp_from")) ||
    process.env.EMAIL_FROM ||
    "noreply@conversionflow.com";

  if (!host || !portStr || !userStr) {
    throw new Error(
      "SMTP not configured: missing smtp_host, smtp_port, or smtp_user in settings"
    );
  }

  const port = parseInt(portStr, 10);

  // Cache transporter to prevent memory leak (RESEARCH Pitfall 4)
  const configFingerprint = JSON.stringify({ host, port, user: userStr });

  if (
    smtpTransporter === null ||
    configFingerprint !== lastSmtpConfig
  ) {
    // Close old transporter if config changed
    if (smtpTransporter) {
      smtpTransporter.close();
    }

    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: userStr,
        pass: pass ?? "",
      },
      // Do not enable debug logging in production (T-07-06)
      logger: false,
      debug: false,
    });

    lastSmtpConfig = configFingerprint;
  }

  await smtpTransporter.sendMail({
    from: fromEmail,
    to,
    subject,
    html,
  });
}
