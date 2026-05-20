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
  return (
    <ScrollReveal>
      <ChangelogClient params={params} />
    </ScrollReveal>
  );
}
