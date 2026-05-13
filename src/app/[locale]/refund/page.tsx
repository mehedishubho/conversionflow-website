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
      <p>
        WooBooster includes a full 30-Day money-back guarantee. If the plugin is
        not a good fit for your store, you may request a refund within 30 days
        of purchase.
      </p>
      <p>
        The guarantee is designed to let WooCommerce store owners test the
        plugin with their actual courier, tracking, and order workflows.
      </p>

      <h2>How to Request a Refund</h2>
      <p>
        Email support@woobooster.com with your license key, order details, and
        the email used during purchase.
      </p>
      <p>
        We may ask for basic troubleshooting details so we can improve the
        product, but you do not need to complete extended support steps before
        requesting a refund within the guarantee window.
      </p>

      <h2>Refund Process</h2>
      <p>
        Approved refunds are processed within 7 business days to the original
        payment method whenever possible. Bank or payment-provider timing may
        vary.
      </p>
      <p>
        If the original payment channel cannot receive the refund, our support
        team may ask for a reasonable alternative method.
      </p>

      <h2>Exceptions</h2>
      <p>
        Refunds are not available after 30 days, for partial license usage, or
        for accounts terminated because of license abuse or redistribution.
      </p>
      <ul>
        <li>No partial refunds are issued for mid-cycle business changes.</li>
        <li>No refund is available for redistributed or shared license keys.</li>
        <li>No refund is available after a chargeback or payment dispute abuse.</li>
      </ul>

      <h2>License Deactivation</h2>
      <p>
        After a refund is issued, the related license key is deactivated and
        WooBooster updates, support, and licensed functionality may stop working.
      </p>
      <p>
        You should remove the plugin from production sites after a refund unless
        our support team gives written permission for a temporary transition
        period.
      </p>

      <h2>Contact</h2>
      <p>
        WooBooster is operated by Devsroom in Dhaka, Bangladesh. Refund questions
        can be sent to support@woobooster.com.
      </p>
      <p>
        This refund policy is intended to be customer-friendly while protecting
        the product from license abuse.
      </p>
    </LegalLayout>
  );
}
