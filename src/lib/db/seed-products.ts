/**
 * Product seed script — seeds the ConversionFlow product with 3 pricing plans.
 *
 * Usage: pnpm db:seed-products
 * Requires: DATABASE_URL in .env.local
 *
 * Plans match src/data/pricing.ts exactly:
 * - Starter: BDT 2,150 / USD 18, yearly (12 months), 1 activation
 * - Professional: BDT 3,000 / USD 28, yearly (24 months), 3 activations
 * - Agency: BDT 8,000 / USD 75, lifetime, unlimited activations
 */
import { db } from "@/lib/db";
import { products, productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedProducts() {
  console.log("Seeding products...");

  // Check if ConversionFlow product already exists
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.slug, "conversionflow"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Products already seeded. Skipping.");
    return;
  }

  // Insert ConversionFlow product
  const [product] = await db
    .insert(products)
    .values({
      name: "ConversionFlow",
      slug: "conversionflow",
      description:
        "All-in-one WooCommerce automation plugin for Bangladeshi eCommerce stores.",
      currentVersion: "1.0.0",
    })
    .returning();

  console.log(`Created product: ${product.name} (${product.id})`);

  // Insert 3 plans matching pricing.ts exactly
  const plans = [
    {
      productId: product.id,
      name: "Starter",
      slug: "starter",
      description: "For a single WooCommerce store - 1 year updates",
      priceBDT: 2150,
      priceUSD: 18,
      licenseType: "subscription" as const,
      billingCycle: "yearly" as const,
      billingDurationMonths: 12,
      maxActivations: 1,
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        one_year_updates: true,
        email_support: true,
        priority_support: false,
      },
      sortOrder: 1,
      active: true,
    },
    {
      productId: product.id,
      name: "Professional",
      slug: "professional",
      description: "For agencies managing 3 stores - 2 year updates",
      priceBDT: 3000,
      priceUSD: 28,
      licenseType: "subscription" as const,
      billingCycle: "yearly" as const,
      billingDurationMonths: 24,
      maxActivations: 3,
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        lifetime_updates: true,
        priority_email_support: true,
        whatsapp_support: true,
      },
      sortOrder: 2,
      active: true,
    },
    {
      productId: product.id,
      name: "Agency",
      slug: "agency",
      description: "Unlimited sites for agencies - lifetime updates",
      priceBDT: 8000,
      priceUSD: 75,
      licenseType: "lifetime" as const,
      billingCycle: null,
      billingDurationMonths: null,
      maxActivations: 0,
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        lifetime_updates: true,
        priority_whatsapp_support: true,
        white_label: true,
      },
      sortOrder: 3,
      active: true,
    },
  ];

  for (const plan of plans) {
    await db.insert(productPlans).values(plan);
  }

  console.log(
    "ConversionFlow product with 3 plans seeded successfully."
  );
  console.log("  - Starter: BDT 2,150 / USD 18 (yearly, 1 activation)");
  console.log("  - Professional: BDT 3,000 / USD 28 (yearly 24mo, 3 activations)");
  console.log("  - Agency: BDT 8,000 / USD 75 (lifetime, unlimited)");
}

seedProducts().catch((err) => {
  console.error("Product seed failed:", err);
  process.exit(1);
});
