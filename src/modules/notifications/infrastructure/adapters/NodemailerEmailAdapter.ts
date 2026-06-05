/**
 * Nodemailer SMTP adapter (D-01, D-03)
 *
 * Implements the EmailSender interface using nodemailer for generic SMTP.
 * Reads SMTP credentials from the `settings` table (smtp_host, smtp_port,
 * smtp_user, smtp_pass, smtp_from) — the same keys managed by the admin
 * SMTP settings page.
 *
 * The SMTP transport is cached at the class level for reuse across sends
 * (preventing connection pool exhaustion). Call close() to shut down the
 * transport when the worker process exits.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { EmailSender } from "./EmailSender";

interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class NodemailerEmailAdapter implements EmailSender {
  private transport: Transporter | null = null;

  private async getSettings(): Promise<SmtpSettings> {
    const keys = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"] as const;

    const results = await Promise.all(
      keys.map((key) =>
        db
          .select({ value: settings.value })
          .from(settings)
          .where(eq(settings.key, key))
          .limit(1)
      )
    );

    const [hostRow, portRow, userRow, passRow, fromRow] = results;

    const port = parseInt(portRow[0]?.value ?? "587", 10);

    return {
      host: hostRow[0]?.value ?? "",
      port,
      user: userRow[0]?.value ?? "",
      pass: passRow[0]?.value ?? "",
      from: fromRow[0]?.value ?? "noreply@conversionflow.com",
    };
  }

  private async getTransport(): Promise<Transporter> {
    if (this.transport) {
      return this.transport;
    }

    const smtpSettings = await this.getSettings();

    this.transport = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
    });

    return this.transport;
  }

  async send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ messageId: string; error?: string }> {
    try {
      const transport = await this.getTransport();
      const smtpSettings = await this.getSettings();

      const result = await transport.sendMail({
        from: params.from || smtpSettings.from || "noreply@conversionflow.com",
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return { messageId: result.messageId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown SMTP error";
      return { messageId: "", error: message };
    }
  }

  close(): void {
    if (this.transport) {
      this.transport.close();
      this.transport = null;
    }
  }
}
