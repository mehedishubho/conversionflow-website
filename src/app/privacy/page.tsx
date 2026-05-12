import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "WooBooster Privacy Policy -- how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 1, 2025">
      <h2>Information We Collect</h2>
      <p>We collect account details such as name, email address, license key, billing records, support messages, and the site URL connected to a WooBooster license.</p>
      <p>The WooBooster plugin may process WooCommerce order data, courier tracking data, customer phone numbers, delivery addresses, order values, and fraud signals on your own WordPress server.</p>
      <h2>How We Use Your Information</h2>
      <p>We use this information to validate licenses, deliver plugin updates, respond to support requests, improve product reliability, and support fraud detection for order protection.</p>
      <h2>Data Storage and Security</h2>
      <p>License and support data are stored on secure systems with SSL-protected communication. We do not sell customer data or share it for unrelated advertising purposes.</p>
      <p>Courier order data may be shared with courier partners such as Steadfast, Pathao, and RedX only when you enable the relevant integration and submit orders through WooBooster.</p>
      <h2>Cookies and Tracking</h2>
      <p>WooBooster does not set advertising cookies for your shoppers. Meta CAPI and pixel behavior is controlled by the store owner through their own Meta account and website configuration.</p>
      <h2>Third-Party Services</h2>
      <p>WooBooster can connect with courier APIs, Meta Conversions API, Google Analytics, and payment or checkout services selected by the store owner. Each third-party service has its own privacy terms.</p>
      <h2>Data Retention</h2>
      <p>License records are retained while a license remains active and for a reasonable period afterward for audit, support, and fraud-prevention purposes. You may request deletion when no active legal or support need remains.</p>
      <h2>Your Rights</h2>
      <p>You may request access, correction, or deletion of personal data by contacting support@woobooster.com. We may need to verify ownership before making changes to license records.</p>
      <h2>Contact Us</h2>
      <p>WooBooster is operated by Devsroom in Dhaka, Bangladesh. For privacy questions, contact support@woobooster.com.</p>
    </LegalLayout>
  );
}
