/**
 * Resend email adapter (D-01, D-03)
 *
 * Wraps the existing Resend SDK to implement the EmailSender interface.
 * Uses RESEND_API_KEY from environment variables and EMAIL_FROM for the
 * default sender address.
 */

import { Resend } from "resend";
import type { EmailSender } from "./EmailSender";

export class ResendEmailAdapter implements EmailSender {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ messageId: string; error?: string }> {
    const { data, error } = await this.resend.emails.send({
      from: params.from || process.env.EMAIL_FROM || "noreply@conversionflow.com",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      return { messageId: "", error: error.message };
    }

    return { messageId: data?.id ?? "" };
  }
}
