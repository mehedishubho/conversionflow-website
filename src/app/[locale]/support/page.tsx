import SupportClient from "@/components/support/SupportClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function SupportPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ScrollReveal>
      <SupportClient params={params} />
    </ScrollReveal>
  );
}
