import FeaturesClient from "@/components/features/FeaturesClient";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function FeaturesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  return <FeaturesClient params={params} />;
}
