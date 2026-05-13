import type { Metadata } from "next";
import { Noto_Sans_Bengali, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LangProvider } from "@/lib/lang";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-syne",
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
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "woobooster.com";

const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ??
  "https://plausible.woobooster.com/js/script.js";

export const metadata: Metadata = {
  metadataBase: new URL("https://woobooster.com"),
  title: {
    default: "WooBooster — WooCommerce Automation for Bangladesh",
    template: "%s | WooBooster",
  },
  description:
    "All-in-one WooCommerce automation plugin for Bangladeshi stores. Courier sync, Meta CAPI, fraud protection, analytics, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://woobooster.com",
    siteName: "WooBooster",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${notoSansBengali.variable} ${dmSansMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Script
          src={plausibleScriptSrc}
          data-domain={plausibleDomain}
          strategy="afterInteractive"
          defer
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <LangProvider>
            <CustomCursor />
            <Navbar />
            <PageTransition>
              <main className="flex-1">{children}</main>
            </PageTransition>
            <Footer />
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
