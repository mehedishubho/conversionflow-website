import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { FeaturesBento } from "@/components/sections/FeaturesBento";
import { VideoSection } from "@/components/sections/VideoSection";
import { BDSection } from "@/components/sections/BDSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "WooBooster — WooCommerce Automation for Bangladesh",
  description:
    "All-in-one WooCommerce automation plugin for Bangladeshi stores. Courier sync, Meta CAPI, fraud protection, analytics, and more.",
  openGraph: {
    title: "WooBooster — WooCommerce Automation for Bangladesh",
    description:
      "All-in-one WooCommerce automation plugin for Bangladeshi stores. Courier sync, Meta CAPI, fraud protection, analytics, and more.",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeaturesBento />
      <VideoSection />
      <BDSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  );
}
