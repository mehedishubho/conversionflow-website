import SupportClient from "@/components/support/SupportClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("support", locale);
}

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
