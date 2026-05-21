import "dotenv/config";
import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = postgres(connectionString);

async function setupDatabase() {
  try {
    console.log("🔧 Setting up Phase 12 database tables...");

    const sqlFile = join(__dirname, "12-DATABASE-SETUP.sql");
    let sqlContent = readFileSync(sqlFile, "utf-8");

    // Remove comments and empty lines
    sqlContent = sqlContent
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim() !== "")
      .join("\n");

    // Execute the entire SQL file at once (postgres.js can handle this)
    try {
      await sql.unsafe(sqlContent);
    } catch (error: any) {
      // If bulk execution fails, log but continue to verification
      if (!error.message.includes("already exists")) {
        console.warn(`Warning during bulk execution: ${error.message}`);
      }
    }

    console.log("✅ Database setup complete!");

    // Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('redirects', 'blog_posts', 'blog_categories')
      ORDER BY table_name
    `;

    console.log("📊 Tables verified:", tables.map((t) => t.table_name).join(", "));

    // Check for redirects table specifically
    const redirectsExists = tables.some((t) => t.table_name === "redirects");
    if (!redirectsExists) {
      console.log("⚠️  redirects table not found - creating directly...");

      // Create redirects table directly
      await sql`
        DO $$ BEGIN
          CREATE TYPE redirect_type AS ENUM ('301', '302');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `;

      await sql`
        DO $$ BEGIN
          CREATE TYPE redirect_status AS ENUM ('active', 'inactive');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS redirects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          from_url TEXT NOT NULL,
          to_url TEXT NOT NULL,
          type redirect_type NOT NULL DEFAULT '301',
          is_regex BOOLEAN NOT NULL DEFAULT false,
          hit_count INTEGER NOT NULL DEFAULT 0,
          status redirect_status NOT NULL DEFAULT 'active',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;

      await sql`CREATE INDEX IF NOT EXISTS redirects_from_url_idx ON redirects(from_url);`;
      await sql`CREATE INDEX IF NOT EXISTS redirects_status_idx ON redirects(status);`;

      // Create update trigger
      await sql`
        CREATE OR REPLACE FUNCTION update_redirects_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await sql`
        DROP TRIGGER IF EXISTS trigger_update_redirects_updated_at ON redirects;
        CREATE TRIGGER trigger_update_redirects_updated_at
          BEFORE UPDATE ON redirects
          FOR EACH ROW
          EXECUTE FUNCTION update_redirects_updated_at();
      `;

      console.log("✅ redirects table created!");
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    await sql.end();
    process.exit(1);
  }
}

setupDatabase();
