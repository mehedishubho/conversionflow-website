import { createPageMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/sections/HeroSection";

export const generateMetadata = () => createPageMetadata("home", "en");
import { TrustBar } from "@/components/sections/TrustBar";
import { FeaturesBento } from "@/components/sections/FeaturesBento";
import { VideoSection } from "@/components/sections/VideoSection";
import { BDSection } from "@/components/sections/BDSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ScrollReveal>
        <TrustBar />
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
