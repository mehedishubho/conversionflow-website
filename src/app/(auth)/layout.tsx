import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/styles/dashboard.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "Authentication | ConversionFlow",
  description: "Sign in or create your ConversionFlow account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
