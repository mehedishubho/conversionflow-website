import SupportClient from "@/components/support/SupportClient";

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
  return <SupportClient params={params} />;
}
