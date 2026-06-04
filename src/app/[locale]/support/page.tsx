import { setRequestLocale } from "next-intl/server";
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
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ScrollReveal>
      <SupportClient params={params} />
    </ScrollReveal>
  );
}
