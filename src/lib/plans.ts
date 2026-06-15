import { db } from "@/lib/db";
import { productPlans, products } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

// ── Types ──

export type BillingCycle = "monthly" | "yearly" | "custom";
export type LicenseType = "subscription" | "lifetime";

export interface PeriodInput {
  licenseType: LicenseType;
  billingCycle: BillingCycle | null;
  billingDurationMonths: number | null;
}

export interface PublicPlan {
  slug: string;
  name: string;
  description: string | null;
  priceBDT: number;
  priceUSD: number;
  licenseType: LicenseType;
  billingCycle: BillingCycle | null;
  billingDurationMonths: number | null;
  maxActivations: number;
  productSlug: string;
  sortOrder: number;
}

export interface ResolvedPlan extends PublicPlan {
  id: string; // product_plans uuid (downstream may need it for coupon-scope checks)
  productId: string; // resolved product slug (matches orders.productId contract)
}

// Raw DB row shape — matches Drizzle's inferred select type, where columns
// without .notNull() are nullable (maxActivations, sortOrder,
// billingDurationMonths, billingCycle). The mapper coerces these to the
// non-nullable PublicPlan contract below.
type PlanRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceBDT: number;
  priceUSD: number;
  licenseType: LicenseType;
  billingCycle: BillingCycle | null;
  billingDurationMonths: number | null;
  maxActivations: number | null;
  sortOrder: number | null;
  productSlug: string;
};

// ── Period derivation (pure, reused by pricing + checkout) ──

/**
 * Derive a human-readable period suffix per CONTEXT specifics.
 * - lifetime → "/lifetime"
 * - subscription + monthly → "/month"
 * - subscription + yearly + 12mo → "/year"
 * - subscription + yearly + 24mo → "/2 years"
 * - subscription + custom + Nmo → "/N months"
 */
export function derivePeriod(input: PeriodInput): string {
  if (input.licenseType === "lifetime") return "/lifetime";
  if (!input.billingCycle) return "";
  if (input.billingCycle === "monthly") return "/month";
  if (input.billingCycle === "yearly") {
    if (input.billingDurationMonths === 12) return "/year";
    if (input.billingDurationMonths === 24) return "/2 years";
  }
  if (input.billingCycle === "custom" && input.billingDurationMonths) {
    return `/${input.billingDurationMonths} months`;
  }
  return "";
}

// ── Plan resolver (server-only — read query against product_plans) ──

/** The displayed product slug. Single source of truth for "which product". */
export const DISPLAY_PRODUCT_SLUG = "conversionflow-wp";

let cachedPublicPlans: PublicPlan[] | null = null;
let cachedSlugIndex: Map<string, ResolvedPlan> | null = null;

/**
 * Select shape reused for both primary and fallback queries.
 * A single query populates BOTH caches (public list + slug index) to avoid
 * a second round-trip in getPlanBySlug().
 */
function selectPlanColumns() {
  return {
    id: productPlans.id,
    name: productPlans.name,
    slug: productPlans.slug,
    description: productPlans.description,
    priceBDT: productPlans.priceBDT,
    priceUSD: productPlans.priceUSD,
    licenseType: productPlans.licenseType,
    billingCycle: productPlans.billingCycle,
    billingDurationMonths: productPlans.billingDurationMonths,
    maxActivations: productPlans.maxActivations,
    sortOrder: productPlans.sortOrder,
    productSlug: products.slug,
  };
}

/** Convert a raw DB row into a PublicPlan (no internal id). */
function toPublicPlan(row: PlanRow): PublicPlan {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceBDT: row.priceBDT,
    priceUSD: row.priceUSD,
    licenseType: row.licenseType,
    billingCycle: row.billingCycle,
    billingDurationMonths: row.billingDurationMonths,
    // Schema columns are nullable (.default(...) without .notNull()); coerce
    // to the documented non-nullable PublicPlan contract using the same
    // defaults declared in the schema.
    maxActivations: row.maxActivations ?? 1,
    productSlug: row.productSlug,
    sortOrder: row.sortOrder ?? 0,
  };
}

/** Convert a raw DB row into a ResolvedPlan (includes id + product slug). */
function toResolvedPlan(row: PlanRow): ResolvedPlan {
  return {
    ...toPublicPlan(row),
    id: row.id,
    productId: row.productSlug,
  };
}

/**
 * Populate both caches from a single set of rows.
 * `cachedSlugIndex` is keyed by lowercased slug for case-insensitive lookup.
 */
function populateCaches(rows: PlanRow[]): PublicPlan[] {
  cachedPublicPlans = rows.map(toPublicPlan);
  cachedSlugIndex = new Map<string, ResolvedPlan>();
  for (const row of rows) {
    cachedSlugIndex.set(row.slug.toLowerCase(), toResolvedPlan(row));
  }
  return cachedPublicPlans;
}

/**
 * Get all active plans for the displayed product, ordered by sortOrder asc.
 * Falls back to the first active product's plans if DISPLAY_PRODUCT_SLUG is missing.
 * Cached for the process lifetime; invalidated via clearPublicPlansCache().
 */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  if (cachedPublicPlans && cachedSlugIndex) return cachedPublicPlans;

  try {
    const rows = await db
      .select(selectPlanColumns())
      .from(productPlans)
      .innerJoin(products, eq(productPlans.productId, products.id))
      .where(and(eq(productPlans.active, true), eq(products.slug, DISPLAY_PRODUCT_SLUG)))
      .orderBy(asc(productPlans.sortOrder));

    if (rows.length > 0) {
      return populateCaches(rows as PlanRow[]);
    }

    // Fallback: first active product's plans (defensive — keeps site working
    // if the displayed product slug is ever renamed in DB).
    const fallback = await db
      .select(selectPlanColumns())
      .from(productPlans)
      .innerJoin(products, eq(productPlans.productId, products.id))
      .where(eq(productPlans.active, true))
      .orderBy(asc(productPlans.sortOrder));

    return populateCaches(fallback as PlanRow[]);
  } catch (error) {
    console.error("[plans] getPublicPlans failed:", error);
    return [];
  }
}

/**
 * Resolve a single plan by slug (and displayed product).
 * Returns null if not found or inactive — caller decides how to render the
 * invalid-plan UI. Case-insensitive slug match.
 */
export async function getPlanBySlug(slug: string): Promise<ResolvedPlan | null> {
  if (!slug) return null;
  if (!cachedSlugIndex) {
    // Triggers a single DB query and populates both caches.
    await getPublicPlans();
  }
  return cachedSlugIndex?.get(slug.toLowerCase()) ?? null;
}

/** Invalidate cached public plans. Called from admin mutations. */
export function clearPublicPlansCache(): void {
  cachedPublicPlans = null;
  cachedSlugIndex = null;
}
