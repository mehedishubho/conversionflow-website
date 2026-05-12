import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "WooBooster Refund Policy -- 30-day money-back guarantee.",
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="June 1, 2025">
      <h2>30-Day Money-Back Guarantee</h2>
      <p>WooBooster includes a full 30-day money-back guarantee. If the plugin is not a good fit for your store, you may request a refund within 30 days of purchase.</p>
      <h2>How to Request a Refund</h2>
      <p>Email support@woobooster.com with your license key, order details, and the email used during purchase. We may ask for basic troubleshooting details so we can improve the product.</p>
      <h2>Refund Process</h2>
      <p>Approved refunds are processed within 7 business days to the original payment method whenever possible. Bank or payment-provider timing may vary.</p>
      <h2>Exceptions</h2>
      <p>Refunds are not available after 30 days, for partial license usage, or for accounts terminated because of license abuse or redistribution.</p>
      <h2>License Deactivation</h2>
      <p>After a refund is issued, the related license key is deactivated and WooBooster updates, support, and licensed functionality may stop working.</p>
      <h2>Contact</h2>
      <p>WooBooster is operated by Devsroom in Dhaka, Bangladesh. Refund questions can be sent to support@woobooster.com.</p>
    </LegalLayout>
  );
}
