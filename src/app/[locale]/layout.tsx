import type { Metadata } from "next";
import { Noto_Sans_Bengali, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { PageTransition } from "@/components/layout/PageTransition";
import { TrackingScripts } from "@/components/layout/TrackingScripts";
import { getTrackingSettings } from "@/lib/tracking";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bengali",
  display: "swap",
});

const dmSansMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

const plausibleDomain =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "conversionflow.com";

const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ??
  "https://plausible.conversionflow.com/js/script.js";

// Force dynamic rendering for all locale pages.
// React 19 + next-intl + Turbopack static generation causes "Expected a suspended thenable"
// during prerendering. Rendering at request time avoids this issue entirely.
export const dynamic = "force-dynamic";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});

  return {
    metadataBase: new URL("https://conversionflow.com"),
    title: {
      default: t('title'),
      template: "%s | ConversionFlow",
    },
    description: t('description'),
    openGraph: {
      type: "website",
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      url: "https://conversionflow.com",
      siteName: "ConversionFlow",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: "/favicon.svg",
    },
    alternates: {
      languages: {
        en: '/en',
        bn: '/bn',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "bn")) {
    notFound();
  }

  // Enable static rendering & avoid headers() fallback that causes
  // "Expected a suspended thenable" in React 19 / Next.js 16
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  // Pass locale explicitly to avoid implicit headers() call during static generation
  const messages = await getMessages({ locale });

  // Read tracking settings server-side for script injection.
  // Wrapped in try/catch so static generation during `next build` doesn't
  // crash when the DB is unavailable or overwhelmed by concurrent workers.
  let trackingSettings: Record<string, string> = {};
  try {
    trackingSettings = await getTrackingSettings();
  } catch {
    // Graceful fallback — tracking scripts simply won't render during build
  }

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${notoSansBengali.variable} ${dmSansMono.variable} antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className={`min-h-screen flex flex-col bg-background text-foreground ${locale === 'bn' ? 'font-bengali' : ''}`}>
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={plausibleScriptSrc}
              data-domain={plausibleDomain}
              strategy="afterInteractive"
              defer
            />
            <Script id="analytics-locale" strategy="afterInteractive">
              {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
                window.plausible('register_props', { locale: '${locale}' });`}
            </Script>
          </>
        )}
        {process.env.NODE_ENV === "production" && (
          <TrackingScripts
            ga4Id={trackingSettings.google_analytics_id}
            gtmId={trackingSettings.google_tag_manager_id}
            facebookPixelId={trackingSettings.meta_pixel_id}
            tiktokPixelId={trackingSettings.tiktok_pixel_id}
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <NextIntlClientProvider messages={messages}>
            <CustomCursor />
            <Navbar />
            <PageTransition>
              <main className="flex-1">{children}</main>
            </PageTransition>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
