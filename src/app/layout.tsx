import { initializeModules } from "@/lib/module-init";

// Initialize all bounded context modules once per server process.
// Registers event bus handlers (cache invalidation, etc.) before any requests.
initializeModules();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
