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
      <p>
        We collect account details such as name, email address, license key,
        billing records, support messages, and the site URL connected to a
        WooBooster license.
      </p>
      <p>
        The WooBooster plugin may process WooCommerce order data, courier
        tracking data, customer phone numbers, delivery addresses, order
        values, and fraud signals on your own WordPress server.
      </p>
      <p>
        Store owners decide which modules to enable. If a module is disabled,
        WooBooster does not intentionally process the related integration data
        for that store.
      </p>

      <h2>How We Use Your Information</h2>
      <p>
        We use this information to validate licenses, deliver plugin updates,
        respond to support requests, improve product reliability, and support
        fraud detection for order protection.
      </p>
      <p>
        We may also use aggregated, non-identifying operational data to
        understand which product areas need better documentation, performance
        improvements, or compatibility fixes.
      </p>

      <h2>Data Storage and Security</h2>
      <p>
        License and support data are stored on secure systems with SSL-protected
        communication. We do not sell customer data or share it for unrelated
        advertising purposes.
      </p>
      <p>
        Courier order data may be shared with courier partners such as Steadfast,
        Pathao, and RedX only when you enable the relevant integration and submit
        orders through WooBooster.
      </p>
      <p>
        No online system can be guaranteed perfectly secure, but we use
        reasonable administrative and technical controls to reduce unauthorized
        access risks.
      </p>

      <h2>Cookies and Tracking</h2>
      <p>
        WooBooster does not set advertising cookies for your shoppers. Meta CAPI
        and pixel behavior is controlled by the store owner through their own
        Meta account and website configuration.
      </p>
      <p>
        If you use analytics, pixels, or advertising integrations on your store,
        you are responsible for providing any notices or consent controls
        required by your market and customer base.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        WooBooster can connect with courier APIs, Meta Conversions API, Google
        Analytics, and payment or checkout services selected by the store owner.
        Each third-party service has its own privacy terms.
      </p>
      <ul>
        <li>Courier partners receive order and delivery data needed for shipment.</li>
        <li>Meta may receive event data if Meta CAPI is enabled by the store owner.</li>
        <li>Analytics providers may receive usage data configured by the store owner.</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        License records are retained while a license remains active and for a
        reasonable period afterward for audit, support, and fraud-prevention
        purposes.
      </p>
      <p>
        You may request deletion when no active legal, tax, security, or support
        need remains.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of personal data by
        contacting support@woobooster.com. We may need to verify ownership before
        making changes to license records.
      </p>
      <p>
        If you operate a WooCommerce store, you are responsible for responding to
        privacy requests from your own shoppers regarding order and customer data
        stored in your WordPress installation.
      </p>

      <h2>Contact Us</h2>
      <p>
        WooBooster is operated by Devsroom in Dhaka, Bangladesh. For privacy
        questions, contact support@woobooster.com.
      </p>
      <p>
        This policy is intended for product transparency and should be reviewed
        by qualified counsel before production launch.
      </p>
    </LegalLayout>
  );
}
