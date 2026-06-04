import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { landingPages } from "@/data/landing-pages";
import Link from "next/link";
import { breadcrumbSchema, productSchema } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return landingPages.map((page) => ({ landing: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}): Promise<Metadata> {
  const { landing } = await params;
  const page = landingPages.find((item) => item.slug === landing);

  if (!page) return { title: "Page Not Found" };

  return {
    title: `${page.title} | ConversionFlow`,
    description: page.description,
    keywords: [page.primaryKeyword, "ConversionFlow", "Bangladesh eCommerce operations"],
    alternates: {
      canonical: "https://conversionflow.com/" + page.slug,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const { landing } = await params;
  const page = landingPages.find((item) => item.slug === landing);

  if (!page) notFound();

  return (
    <>
      <JsonLd data={[productSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: page.title, path: `/${page.slug}` }])]} />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">{page.primaryKeyword}</div>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}>{page.title}</h1>
          <p className="sec-sub" style={{ maxWidth: "720px", margin: "0 auto" }}>{page.description}</p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
            <div className="bg-surface border border-[--border] rounded-[14px] p-6">
              <div className="eyebrow">Audience</div>
              <h2 className="font-dm-sans text-xl font-black text-foreground mb-3">Who this is for</h2>
              <p className="text-sm text-text2 leading-[1.8]">{page.audience}</p>
            </div>
            <div className="bg-surface border border-[--border] rounded-[14px] p-6">
              <div className="eyebrow">Pain</div>
              <h2 className="font-dm-sans text-xl font-black text-foreground mb-3">What breaks today</h2>
              <p className="text-sm text-text2 leading-[1.8]">{page.pain}</p>
            </div>
            <div className="bg-surface border border-[--border] rounded-[14px] p-6">
              <div className="eyebrow">Solution</div>
              <h2 className="font-dm-sans text-xl font-black text-foreground mb-3">How ConversionFlow helps</h2>
              <p className="text-sm text-text2 leading-[1.8]">{page.solution}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="eyebrow">Proof Points</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(24px,3vw,36px)" }}>Built for commercial operations, not vanity tracking.</h2>
              <ul className="checks">
                {page.proofPoints.map((point) => (
                  <li key={point}><div className="ck">✓</div>{point}</li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-[--border] rounded-[14px] p-6">
              <div className="eyebrow">Next Step</div>
              <h2 className="font-dm-sans text-2xl font-black text-foreground tracking-[-0.5px] mb-3">Turn this keyword intent into a platform decision.</h2>
              <p className="text-sm text-text2 leading-[1.8] mb-5">Compare features, platform editions, and pricing before choosing the right ConversionFlow implementation path.</p>
              <div className="flex flex-wrap gap-2">
                {page.relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href as never} className="btn btn-outline">{link.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
