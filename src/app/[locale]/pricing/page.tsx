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
  return (
    <ScrollReveal>
      <PricingClient params={params} />
    </ScrollReveal>
  );
}
