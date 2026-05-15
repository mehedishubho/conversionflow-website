/**
 * Emergency seed script — NOT the primary admin creation method.
 * The primary method is the /admin/setup page.
 *
 * Usage: pnpm db:seed
 * Requires: ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL in .env.local
 */
import postgres from "postgres";

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "This is an emergency seed script. The primary method is /admin/setup.\n" +
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to use this script."
    );
    process.exit(1);
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
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
