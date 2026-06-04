import { setRequestLocale } from "next-intl/server";
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
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ScrollReveal>
      <FeaturesClient params={params} />
    </ScrollReveal>
  );
}
