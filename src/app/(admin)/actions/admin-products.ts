"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVersions, productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ──────────────────────────────────────────────
// Product Actions
// ──────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const { userId, role } = await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Product name is required." };
  }

  const slug = generateSlug(name.trim());

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.created",
      targetType: "product",
      targetId: product.id,
      details: { name: name.trim(), slug },
    });

    return { success: true, productId: product.id };
  } catch (error) {
    console.error("[Admin] Failed to create product:", error);
    return { error: "Failed to create product. Slug may already exist." };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  if (!productId) {
    return { error: "Product ID is required." };
  }

  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const currentVersion = formData.get("currentVersion") as string | null;

  const updateData: Record<string, unknown> = {};
  if (name !== null && name.trim().length > 0) {
    updateData.name = name.trim();
    updateData.slug = generateSlug(name.trim());
  }
  if (description !== null) {
    updateData.description = description.trim() || null;
  }
  if (currentVersion !== null) {
    updateData.currentVersion = currentVersion.trim();
  }

  try {
    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.updated",
      targetType: "product",
      targetId: productId,
      details: { updatedFields: Object.keys(updateData) },
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to update product:", error);
    return { error: "Failed to update product." };
  }
}

export async function deleteProduct(productId: string) {
  const { userId, role } = await requireAdmin();

  if (!productId) {
    return { error: "Product ID is required." };
  }

  try {
    await db.delete(products).where(eq(products.id, productId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.deleted",
      targetType: "product",
      targetId: productId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to delete product:", error);
    return { error: "Failed to delete product." };
  }
}

// ──────────────────────────────────────────────
// Version Actions
// ──────────────────────────────────────────────

export async function createVersion(productId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  if (!productId) {
    return { error: "Product ID is required." };
  }

  const version = formData.get("version") as string;
  const downloadUrl = formData.get("downloadUrl") as string | null;
  const changelog = formData.get("changelog") as string | null;

  if (!version || version.trim().length === 0) {
    return { error: "Version string is required." };
  }

  try {
    const [versionRecord] = await db
      .insert(productVersions)
      .values({
        productId,
        version: version.trim(),
        downloadUrl: downloadUrl?.trim() || null,
        changelog: changelog?.trim() || null,
        status: "draft",
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.version.created",
      targetType: "product_version",
      targetId: versionRecord.id,
      details: { productId, version: version.trim(), status: "draft" },
    });

    return { success: true, versionId: versionRecord.id };
  } catch (error) {
    console.error("[Admin] Failed to create version:", error);
    return { error: "Failed to create version. Version may already exist for this product." };
  }
}

export async function updateVersion(versionId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  if (!versionId) {
    return { error: "Version ID is required." };
  }

  const version = formData.get("version") as string | null;
  const downloadUrl = formData.get("downloadUrl") as string | null;
  const changelog = formData.get("changelog") as string | null;
  const status = formData.get("status") as string | null;

  const updateData: Record<string, unknown> = {};
  if (version !== null) updateData.version = version.trim();
  if (downloadUrl !== null) updateData.downloadUrl = downloadUrl.trim() || null;
  if (changelog !== null) updateData.changelog = changelog.trim() || null;
  if (status !== null) {
    updateData.status = status;
    // When status changes to "stable", set releasedAt
    if (status === "stable") {
      updateData.releasedAt = new Date();
    }
  }

  try {
    await db
      .update(productVersions)
      .set(updateData)
      .where(eq(productVersions.id, versionId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.version.updated",
      targetType: "product_version",
      targetId: versionId,
      details: { updatedFields: Object.keys(updateData) },
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to update version:", error);
    return { error: "Failed to update version." };
  }
}

export async function releaseVersion(versionId: string) {
  const { userId, role } = await requireAdmin();

  if (!versionId) {
    return { error: "Version ID is required." };
  }

  try {
    await db
      .update(productVersions)
      .set({ status: "stable", releasedAt: new Date() })
      .where(eq(productVersions.id, versionId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.version.released",
      targetType: "product_version",
      targetId: versionId,
      details: { status: "stable" },
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to release version:", error);
    return { error: "Failed to release version." };
  }
}

// ──────────────────────────────────────────────
// Plan Actions
// ──────────────────────────────────────────────

export async function createPlan(productId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  if (!productId) {
    return { error: "Product ID is required." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const priceBDTStr = formData.get("priceBDT") as string;
  const priceUSDStr = formData.get("priceUSD") as string;
  const licenseType = formData.get("licenseType") as string;
  const billingCycle = formData.get("billingCycle") as string | null;
  const billingDurationMonthsStr = formData.get("billingDurationMonths") as string | null;
  const maxActivationsStr = formData.get("maxActivations") as string;
  const featuresStr = formData.get("features") as string | null;
  const sortOrderStr = formData.get("sortOrder") as string | null;

  // Required field validation
  if (!name || name.trim().length === 0) {
    return { error: "Plan name is required." };
  }
  if (!priceBDTStr) {
    return { error: "BDT price is required." };
  }
  if (!priceUSDStr) {
    return { error: "USD price is required." };
  }
  if (!licenseType || (licenseType !== "lifetime" && licenseType !== "subscription")) {
    return { error: "License type must be 'lifetime' or 'subscription'." };
  }
  if (!maxActivationsStr) {
    return { error: "Max activations is required." };
  }

  const priceBDT = parseInt(priceBDTStr, 10);
  const priceUSD = parseInt(priceUSDStr, 10);
  const maxActivations = parseInt(maxActivationsStr, 10);
  const billingDurationMonths = billingDurationMonthsStr
    ? parseInt(billingDurationMonthsStr, 10)
    : null;
  const sortOrder = sortOrderStr ? parseInt(sortOrderStr, 10) : 0;

  if (isNaN(priceBDT) || isNaN(priceUSD) || isNaN(maxActivations)) {
    return { error: "Price and max activations must be valid numbers." };
  }

  // Invariant: Lifetime plans must not have billing cycle/duration
  if (licenseType === "lifetime") {
    if (billingCycle) {
      return { error: "Lifetime plans must not have a billing cycle." };
    }
    if (billingDurationMonths !== null) {
      return { error: "Lifetime plans must not have billing duration." };
    }
  }

  // Invariant: Subscription plans must have billing cycle
  if (licenseType === "subscription") {
    if (!billingCycle) {
      return { error: "Subscription plans must have a billing cycle." };
    }
  }

  // Parse and validate features JSON
  let features: Record<string, boolean> = {};
  if (featuresStr) {
    try {
      const parsed = JSON.parse(featuresStr);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        return { error: "Features must be a JSON object." };
      }
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "boolean") {
          return { error: `Feature flag "${key}" must be a boolean value.` };
        }
      }
      features = parsed as Record<string, boolean>;
    } catch {
      return { error: "Features must be a valid JSON string." };
    }
  }

  const slug = generateSlug(name.trim());

  try {
    const [plan] = await db
      .insert(productPlans)
      .values({
        productId,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        priceBDT,
        priceUSD,
        licenseType: licenseType as "lifetime" | "subscription",
        billingCycle: billingCycle ? (billingCycle as "monthly" | "yearly" | "custom") : null,
        billingDurationMonths,
        maxActivations,
        features,
        sortOrder,
        active: true,
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.plan.created",
      targetType: "product_plan",
      targetId: plan.id,
      details: { productId, name: name.trim(), licenseType, priceBDT, priceUSD },
    });

    return { success: true, planId: plan.id };
  } catch (error) {
    console.error("[Admin] Failed to create plan:", error);
    return { error: "Failed to create plan. Slug may already exist for this product." };
  }
}

export async function updatePlan(planId: string, formData: FormData) {
  const { userId, role } = await requireAdmin();

  if (!planId) {
    return { error: "Plan ID is required." };
  }

  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const priceBDTStr = formData.get("priceBDT") as string | null;
  const priceUSDStr = formData.get("priceUSD") as string | null;
  const licenseType = formData.get("licenseType") as string | null;
  const billingCycle = formData.get("billingCycle") as string | null;
  const billingDurationMonthsStr = formData.get("billingDurationMonths") as string | null;
  const maxActivationsStr = formData.get("maxActivations") as string | null;
  const featuresStr = formData.get("features") as string | null;
  const sortOrderStr = formData.get("sortOrder") as string | null;
  const activeStr = formData.get("active") as string | null;

  const updateData: Record<string, unknown> = {};

  if (name !== null && name.trim().length > 0) {
    updateData.name = name.trim();
    updateData.slug = generateSlug(name.trim());
  }
  if (description !== null) {
    updateData.description = description.trim() || null;
  }
  if (priceBDTStr !== null) {
    const val = parseInt(priceBDTStr, 10);
    if (isNaN(val)) return { error: "BDT price must be a valid number." };
    updateData.priceBDT = val;
  }
  if (priceUSDStr !== null) {
    const val = parseInt(priceUSDStr, 10);
    if (isNaN(val)) return { error: "USD price must be a valid number." };
    updateData.priceUSD = val;
  }
  if (maxActivationsStr !== null) {
    const val = parseInt(maxActivationsStr, 10);
    if (isNaN(val)) return { error: "Max activations must be a valid number." };
    updateData.maxActivations = val;
  }
  if (sortOrderStr !== null) {
    updateData.sortOrder = parseInt(sortOrderStr, 10) || 0;
  }
  if (activeStr !== null) {
    updateData.active = activeStr === "true";
  }

  // Handle licenseType and billing validation
  const effectiveLicenseType = licenseType || undefined;
  if (licenseType) {
    if (licenseType !== "lifetime" && licenseType !== "subscription") {
      return { error: "License type must be 'lifetime' or 'subscription'." };
    }
    updateData.licenseType = licenseType;

    if (licenseType === "lifetime") {
      updateData.billingCycle = null;
      updateData.billingDurationMonths = null;
    }
  }

  if (billingCycle !== null) {
    if (billingCycle) {
      updateData.billingCycle = billingCycle;
    } else {
      updateData.billingCycle = null;
    }
  }
  if (billingDurationMonthsStr !== null) {
    updateData.billingDurationMonths = billingDurationMonthsStr
      ? parseInt(billingDurationMonthsStr, 10) || null
      : null;
  }

  // Parse and validate features JSON
  if (featuresStr !== null) {
    try {
      const parsed = JSON.parse(featuresStr);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        return { error: "Features must be a JSON object." };
      }
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "boolean") {
          return { error: `Feature flag "${key}" must be a boolean value.` };
        }
      }
      updateData.features = parsed as Record<string, boolean>;
    } catch {
      return { error: "Features must be a valid JSON string." };
    }
  }

  // Invariant validation for the effective state
  const finalLicenseType = (updateData.licenseType as string) || effectiveLicenseType;
  if (finalLicenseType === "lifetime") {
    if (updateData.billingCycle !== undefined && updateData.billingCycle !== null) {
      return { error: "Lifetime plans must not have a billing cycle." };
    }
  }

  try {
    await db
      .update(productPlans)
      .set(updateData)
      .where(eq(productPlans.id, planId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.plan.updated",
      targetType: "product_plan",
      targetId: planId,
      details: { updatedFields: Object.keys(updateData) },
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to update plan:", error);
    return { error: "Failed to update plan." };
  }
}

export async function deletePlan(planId: string) {
  const { userId, role } = await requireAdmin();

  if (!planId) {
    return { error: "Plan ID is required." };
  }

  try {
    await db.delete(productPlans).where(eq(productPlans.id, planId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "product.plan.deleted",
      targetType: "product_plan",
      targetId: planId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin] Failed to delete plan:", error);
    return { error: "Failed to delete plan." };
  }
}
