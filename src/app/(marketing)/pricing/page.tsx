import { createPageMetadata } from "@/lib/seo";
import PricingClient from "@/components/pricing/PricingClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export const generateMetadata = () => createPageMetadata("pricing", "en");

export default function PricingPage() {
  return (
    <ScrollReveal>
      <PricingClient />
    </ScrollReveal>
  );
}
