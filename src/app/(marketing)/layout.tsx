import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { PageTransition } from "@/components/layout/PageTransition";
import { TrackingScriptsLoader } from "@/components/layout/TrackingScriptsLoader";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "../globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
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

export const metadata: Metadata = {
  metadataBase: new URL("https://conversionflow.com"),
  title: {
    default: "ConversionFlow — WooCommerce Automation for Bangladesh",
    template: "%s | ConversionFlow",
  },
  description:
    "All-in-one WooCommerce automation plugin for Bangladeshi stores. Courier sync, Meta CAPI, fraud protection, analytics, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://conversionflow.com",
    siteName: "ConversionFlow",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmSansMono.variable} antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-dm-sans">
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={plausibleScriptSrc}
              data-domain={plausibleDomain}
              strategy="afterInteractive"
              defer
            />
          </>
        )}
        {process.env.NODE_ENV === "production" && (
          <TrackingScriptsLoader />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <LanguageProvider>
            <CustomCursor />
            <Navbar />
            <PageTransition>
              <main className="flex-1">{children}</main>
            </PageTransition>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
