import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "License Agreement",
  description: "WooBooster License Agreement -- terms of use for the WooCommerce automation plugin.",
};

export default function LicensePage() {
  return (
    <LegalLayout title="License Agreement" lastUpdated="June 1, 2025">
      <h2>License Types</h2>
      <p>WooBooster offers Starter, Professional, and Agency licenses. Starter covers one site, Professional covers three sites, and Agency covers unlimited sites. Each tier is sold as a one-time purchase with lifetime updates unless otherwise stated at checkout.</p>
      <h2>License Activation</h2>
      <p>Activate WooBooster by entering your license key in the plugin settings. A license may be associated with site domains according to the purchased tier.</p>
      <h2>Permitted Use</h2>
      <p>You may use WooBooster on the licensed number of WordPress and WooCommerce sites, including your own sites or client sites managed by your agency.</p>
      <h2>Restrictions</h2>
      <p>You may not redistribute the plugin, include it in another commercial product, publish license keys, bypass license validation, or remove copyright and attribution notices from plugin files.</p>
      <h2>Updates and Support</h2>
      <p>Lifetime updates are included for active licenses. Support is available by email and WhatsApp for license holders in good standing.</p>
      <h2>Transfer</h2>
      <p>A license may be transferred to another party only with written notice to Devsroom and confirmation that the original holder will stop using the key.</p>
      <h2>Termination</h2>
      <p>The license terminates automatically after a refund or material violation of this agreement. A new license may be purchased after termination unless abuse or fraud is involved.</p>
      <h2>Warranty Disclaimer</h2>
      <p>WooBooster is provided as-is without warranty of merchantability, fitness for a particular purpose, uninterrupted operation, or compatibility with every WordPress environment.</p>
      <h2>Contact</h2>
      <p>Questions about licensing may be sent to support@woobooster.com.</p>
    </LegalLayout>
  );
}
