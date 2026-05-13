import ChangelogClient from "@/components/changelog/ChangelogClient";

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
  return <ChangelogClient params={params} />;
}
