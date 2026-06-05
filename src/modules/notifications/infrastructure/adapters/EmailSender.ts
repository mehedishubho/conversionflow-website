/**
 * Unified EmailSender interface and factory (D-01, D-03)
 *
 * Provides a single interface for sending emails regardless of provider.
 * The active adapter is selected based on the `email_provider` setting
 * in the `settings` table (managed via /admin/settings/smtp).
 *
 * Adapters:
 * - ResendEmailAdapter — wraps the existing Resend SDK
 * - NodemailerEmailAdapter — wraps nodemailer for generic SMTP
 */

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ResendEmailAdapter } from "./ResendEmailAdapter";
import { NodemailerEmailAdapter } from "./NodemailerEmailAdapter";

export interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ messageId: string; error?: string }>;
}

/**
 * Returns the appropriate email sender based on admin settings.
 * Reads `email_provider` from the settings table:
 * - "smtp" → NodemailerEmailAdapter
 * - "resend" (or any other value) → ResendEmailAdapter
 */
export async function getEmailSender(): Promise<EmailSender> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "email_provider"))
    .limit(1);

  const provider = rows[0]?.value ?? "resend";

  if (provider === "smtp") {
    return new NodemailerEmailAdapter();
  }

  return new ResendEmailAdapter();
}
