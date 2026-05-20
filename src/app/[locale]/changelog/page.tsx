import ChangelogClient from "@/components/changelog/ChangelogClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("changelog", locale);
}

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
  return (
    <ScrollReveal>
      <ChangelogClient params={params} />
    </ScrollReveal>
  );
}
