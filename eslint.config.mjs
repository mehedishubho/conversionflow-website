import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Module boundary enforcement for DDD bounded contexts.
 *
 * Dependency hierarchy (allowed direction: down only):
 *   Products (core) <- Customers <- Billing <- Licensing <- Analytics
 *
 * Rules prevent modules from importing higher-level modules:
 *   - Products: cannot import from customers, billing, licensing, analytics
 *   - Customers: cannot import from billing, licensing, analytics
 *   - Billing: cannot import from licensing, analytics
 *   - Licensing: cannot import from analytics
 *   - Analytics: can import from all (read-only cross-cutting)
 *
 * The @shared/* and @/shared/* paths are always allowed (shared infrastructure).
 */
const moduleBoundaryRules = {
  files: ["src/modules/**/*.ts", "src/modules/**/*.tsx"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          // Products — cannot import any other module
          {
            group: [
              "@/modules/customers/**",
              "@/modules/billing/**",
              "@/modules/licensing/**",
              "@/modules/analytics/**",
              "@customers/**",
              "@billing/**",
              "@licensing/**",
              "@analytics/**",
            ],
            message:
              "Products is a core domain — it must not depend on other bounded contexts. Use domain events for cross-context communication.",
            allowTypeImports: false,
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Module boundary enforcement
  moduleBoundaryRules,
]);

export default eslintConfig;
