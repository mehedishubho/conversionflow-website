import { setRequestLocale } from "next-intl/server";
import ChangelogClient from "@/components/changelog/ChangelogClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function ChangelogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ScrollReveal>
      <ChangelogClient params={params} />
    </ScrollReveal>
  );
}
