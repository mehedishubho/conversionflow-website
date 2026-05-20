import FeaturesClient from "@/components/features/FeaturesClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

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
