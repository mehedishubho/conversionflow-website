import PricingClient from "@/components/pricing/PricingClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("pricing", locale);
}

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
  return (
    <ScrollReveal>
      <PricingClient params={params} />
    </ScrollReveal>
  );
}
