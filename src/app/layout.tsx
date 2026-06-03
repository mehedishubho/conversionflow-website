import { initializeModules } from "@/lib/module-init";

// Initialize all bounded context modules once per server process.
// Registers event bus handlers (cache invalidation, etc.) before any requests.
initializeModules();

// Phase 20: Deprecation warning for removed Central API env vars
if (process.env.CENTRAL_API_URL || process.env.CENTRAL_API_KEY) {
  console.warn(
    "[DEPRECATED] Central API env vars (CENTRAL_API_URL, CENTRAL_API_KEY) are deprecated and can be removed from your .env configuration."
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
