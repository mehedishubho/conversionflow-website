import { setRequestLocale } from "next-intl/server";
import PricingClient from "@/components/pricing/PricingClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function PricingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ScrollReveal>
      <PricingClient params={params} />
    </ScrollReveal>
  );
}
