import { createPageMetadata } from "@/lib/seo";
import DocsClient from "@/components/docs/DocsClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export const generateMetadata = () => createPageMetadata("docs", "en");

export default function DocsPage() {
  return (
    <ScrollReveal>
      <DocsClient />
    </ScrollReveal>
  );
}
