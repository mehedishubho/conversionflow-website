import DocsClient from "@/components/docs/DocsClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function DocsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ScrollReveal>
      <DocsClient params={params} />
    </ScrollReveal>
  );
}
