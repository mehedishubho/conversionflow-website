import { createPageMetadata } from "@/lib/seo";
import FeaturesClient from "@/components/features/FeaturesClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export const generateMetadata = () => createPageMetadata("features", "en");

export default function FeaturesPage() {
  return (
    <ScrollReveal>
      <FeaturesClient />
    </ScrollReveal>
  );
}
