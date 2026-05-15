import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(email: string, url: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
    to: email,
    subject: "Reset your password - ConversionFlow",
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0047FF; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Reset your password</h1>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <a href="${url}" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
          Reset Password
        </a>
        <p style="color: #7C87BB; font-size: 13px; margin-top: 24px; line-height: 1.6;">
          This link expires in <strong>1 hour</strong>. If you didn&apos;t request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8ECFA; margin: 24px 0;" />
        <p style="color: #7C87BB; font-size: 12px;">
          ConversionFlow - WooCommerce automation for Bangladeshi eCommerce
        </p>
      </div>
    `,
  });
}
