import postgres from "postgres";
import { hash } from "bcryptjs";

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables. Set them in .env or pass them as environment variables."
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

  // Check if super_admin already exists
  const existingAdmins = await client`
    SELECT id FROM "user" WHERE role = 'super_admin' LIMIT 1
  `;

  if (existingAdmins.length > 0) {
    console.log("Super admin already exists. Skipping seed.");
    await client.end();
    return;
  }

  // Insert super_admin user
  // Better Auth uses its own user table, so we insert directly
  // The user table is created by Better Auth CLI in Plan 02
  // This seed is a fallback and will be run after auth tables exist
  const hashedPassword = await hash(adminPassword, 12);

  await client`
    INSERT INTO "user" (id, name, email, password, role, "emailVerified")
    VALUES (
      gen_random_uuid(),
      'Super Admin',
      ${adminEmail},
      ${hashedPassword},
      'super_admin',
      true
    )
  `;

  console.log(`Super admin created: ${adminEmail}`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
