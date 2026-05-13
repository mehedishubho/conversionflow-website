import PricingClient from "@/components/pricing/PricingClient";

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
  return <PricingClient params={params} />;
}
