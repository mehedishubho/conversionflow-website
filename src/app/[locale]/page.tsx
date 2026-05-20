import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { RepositioningSections } from "@/components/sections/RepositioningSections";
import { FeaturesBento } from "@/components/sections/FeaturesBento";
import { VideoSection } from "@/components/sections/VideoSection";
import { BDSection } from "@/components/sections/BDSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata, organizationSchema, productSchema, websiteSchema } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("home", locale);
}

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), productSchema()]} />
      <HeroSection />
      
      <ScrollReveal>
        <TrustBar />
      </ScrollReveal>

      <ScrollReveal>
        <RepositioningSections />
      </ScrollReveal>
      
      <ScrollReveal>
        <FeaturesBento />
      </ScrollReveal>
      
      <ScrollReveal>
        <VideoSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <BDSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      
      <ScrollReveal>
        <CTASection />
      </ScrollReveal>
    </>
  );
}
