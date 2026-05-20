import FeaturesClient from "@/components/features/FeaturesClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("features", locale);
}

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function FeaturesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ScrollReveal>
      <FeaturesClient params={params} />
    </ScrollReveal>
  );
}
