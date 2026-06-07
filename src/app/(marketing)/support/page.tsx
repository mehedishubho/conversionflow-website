import { createPageMetadata } from "@/lib/seo";
import SupportClient from "@/components/support/SupportClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export const generateMetadata = () => createPageMetadata("support", "en");

export default function SupportPage() {
  return (
    <ScrollReveal>
      <SupportClient />
    </ScrollReveal>
  );
}
