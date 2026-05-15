import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, url: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
    to: email,
    subject: "Verify your email - ConversionFlow",
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0047FF; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Verify your email</h1>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Welcome to ConversionFlow! Click the button below to verify your email address and get started.
        </p>
        <a href="${url}" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
          Verify Email
        </a>
        <p style="color: #7C87BB; font-size: 13px; margin-top: 24px; line-height: 1.6;">
          If you didn&apos;t create a ConversionFlow account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8ECFA; margin: 24px 0;" />
        <p style="color: #7C87BB; font-size: 12px;">
          ConversionFlow - WooCommerce automation for Bangladeshi eCommerce
        </p>
      </div>
    `,
  });
}
