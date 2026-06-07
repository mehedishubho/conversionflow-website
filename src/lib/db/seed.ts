/**
 * Emergency seed script — NOT the primary admin creation method.
 * The primary method is the /admin/setup page.
 *
 * Usage: pnpm db:seed
 * Requires: ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL in .env.local
 *
 * SAFETY: This script will refuse to run in production unless
 * FORCE_SEED=true is set in the environment.
 */
import postgres from "postgres";
import * as readline from "readline";

function promptConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function seed() {
  // ── Safety: Block production by default ──
  const nodeEnv = process.env.NODE_ENV;
  const forceSeed = process.env.FORCE_SEED === "true";

  if (nodeEnv === "production" && !forceSeed) {
    console.error(
      "⛔ BLOCKED: This seed script cannot run in production.\n" +
        "  The primary admin creation method is the /admin/setup web page.\n" +
        "  If you absolutely need this, set FORCE_SEED=true in your environment."
    );
    process.exit(1);
  }

  if (forceSeed) {
    console.warn("⚠️  WARNING: FORCE_SEED is enabled. Running seed in non-standard environment.");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "This is an emergency seed script. The primary method is /admin/setup.\n" +
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to use this script."
    );
    process.exit(1);
  }

  // ── Confirmation prompt (skip in CI/non-TTY) ──
  if (process.stdin.isTTY && !forceSeed) {
    const confirmed = await promptConfirmation(
      `This will create a super admin (${adminEmail}). Continue? [y/N] `
    );
    if (!confirmed) {
      console.log("Seed cancelled.");
      process.exit(0);
    }
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Missing DATABASE_URL environment variable.");
    process.exit(1);
  }

  const client = postgres(connectionString);
  console.log("Seeding database...");

  const existingAdmins = await client`
    SELECT id FROM "user" WHERE role = 'super_admin' LIMIT 1
  `;

  if (existingAdmins.length > 0) {
    console.log("Super admin already exists. Skipping seed.");
    await client.end();
    return;
  }

  await client.end();

  // Use Better Auth API so password hashing is correct
  const { auth } = await import("../auth");
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { eq } = await import("drizzle-orm");

  const result = await auth.api.signUpEmail({
    body: {
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
      phone: "+880000000000",
    },
  });

  if (!result?.user?.id) {
    console.error("Failed to create admin user:", result);
    process.exit(1);
  }

  await db.update(user).set({ role: "super_admin" }).where(eq(user.id, result.user.id));

  console.log(`Super admin created: ${adminEmail}`);
  console.log("Note: Use /admin/setup for the primary admin creation flow.");

  // ── Seed: Settings (VAT) ──
  const { settings, paymentAccounts, coupons } = await import("./schema");

  await db.insert(settings).values([
    { key: "vat_rate", value: "15" },
    { key: "vat_mode", value: "exclusive" },
  ]).onConflictDoNothing();

  console.log("Settings seeded: vat_rate, vat_mode");

  // ── Seed: Payment accounts (placeholders, inactive by default) ──
  const paymentMethodSeeds = [
    { method: "bkash" as const, accountName: "Configure in Admin Settings", accountNumber: "0000000000" },
    { method: "nagad" as const, accountName: "Configure in Admin Settings", accountNumber: "0000000000" },
    { method: "rocket" as const, accountName: "Configure in Admin Settings", accountNumber: "0000000000" },
    { method: "bank_transfer" as const, accountName: "Configure in Admin Settings", accountNumber: "0000000000" },
    { method: "ssl_commerz" as const, accountName: "Configure in Admin Settings", accountNumber: "0000000000" },
  ];

  for (const pa of paymentMethodSeeds) {
    await db.insert(paymentAccounts).values({
      ...pa,
      active: false,
    }).onConflictDoNothing();
  }

  console.log("Payment accounts seeded: 5 placeholder entries (inactive)");

  // ── Seed: Sample coupon ──
  await db.insert(coupons).values({
    code: "LAUNCH20",
    type: "percentage",
    value: 20,
    maxUses: 100,
    active: true,
  }).onConflictDoNothing();

  console.log("Sample coupon seeded: LAUNCH20 (20% off, 100 uses)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
