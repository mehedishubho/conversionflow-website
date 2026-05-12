import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for WooBooster WooCommerce automation plugin.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="June 1, 2025">
      <h2>Acceptance of Terms</h2>
      <p>By purchasing, installing, or using WooBooster, you agree to these Terms of Service. If you do not agree, do not use the plugin.</p>
      <h2>License Grant</h2>
      <p>Devsroom grants you a non-exclusive, non-transferable license to use WooBooster on WordPress and WooCommerce sites according to your purchased tier: Starter for one site, Professional for three sites, and Agency for unlimited sites.</p>
      <h2>Usage Restrictions</h2>
      <p>You may not redistribute, resell, sublicense, reverse engineer, share license keys, remove copyright notices, or use WooBooster on more sites than your license permits.</p>
      <h2>Plugin Updates</h2>
      <p>Active license holders receive plugin updates, including compatibility fixes, security improvements, and new features released for their tier.</p>
      <h2>Intellectual Property</h2>
      <p>WooBooster is proprietary software. Devsroom retains all rights, title, and interest in the product, code, brand, design, and documentation.</p>
      <h2>Limitation of Liability</h2>
      <p>WooBooster is provided as-is. Devsroom is not liable for data loss, lost revenue, courier failures, WooCommerce configuration issues, or indirect damages arising from plugin use.</p>
      <h2>Termination</h2>
      <p>We may terminate or deactivate a license if these terms are violated. Termination for violation does not create a refund right.</p>
      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of Bangladesh, without regard to conflict-of-law principles.</p>
      <h2>Changes to Terms</h2>
      <p>We may update these terms and notify customers by email, website notice, or plugin admin notice. Continued use after notice means you accept the updated terms.</p>
      <h2>Contact</h2>
      <p>For questions about these terms, contact Devsroom at support@woobooster.com.</p>
    </LegalLayout>
  );
}
