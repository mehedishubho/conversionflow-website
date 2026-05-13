import DocsClient from "@/components/docs/DocsClient";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function DocsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  return <DocsClient params={params} />;
}
