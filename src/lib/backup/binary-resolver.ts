import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ──────────────────────────────────────────────
// Module-level cache: undefined = not resolved, null = not found, string = path
// ──────────────────────────────────────────────
let cachedPgDump: string | null | undefined = undefined;
let cachedPsql: string | null | undefined = undefined;

// ──────────────────────────────────────────────
// Windows auto-detect: scan Program Files for highest PostgreSQL version
// ──────────────────────────────────────────────

function findWindowsBinary(name: string): string | null {
  const pgDir = "C:\\Program Files\\PostgreSQL";
  if (!fs.existsSync(pgDir)) return null;

  try {
    const versions = fs
      .readdirSync(pgDir)
      .filter((v) => /^\d+(\.\d+)?$/.test(v))
      .sort((a, b) => parseFloat(b) - parseFloat(a)); // highest version first

    for (const version of versions) {
      const candidate = path.join(pgDir, version, "bin", `${name}.exe`);
      if (fs.existsSync(candidate)) return candidate;
    }
  } catch {
    // Permission error or similar — skip auto-detect
  }

  return null;
}

// ──────────────────────────────────────────────
// Core resolver: env var → PATH → Windows auto-detect → bare name fallback
// ──────────────────────────────────────────────

function resolveBinary(
  envVar: string,
  binaryName: string
): string | null {
  // Strategy 1: Explicit env var path
  const envPath = process.env[envVar];
  if (envPath) {
    if (fs.existsSync(envPath)) return envPath;
  }

  // Strategy 2: Standard PATH detection (platform-specific)
  const isWindows = process.platform === "win32";
  const command = isWindows
    ? `where ${binaryName}`
    : `which ${binaryName}`;

  try {
    const result = execSync(command, { stdio: "pipe", timeout: 5000 })
      .toString()
      .trim()
      .split(/\r?\n/)[0]; // `where` may return multiple matches — take first

    if (result && fs.existsSync(result)) return result;
  } catch {
    // Not on PATH
  }

  // Strategy 3: Windows auto-detect from Program Files (dev only)
  if (isWindows && process.env.NODE_ENV !== "production") {
    const autoDetected = findWindowsBinary(binaryName);
    if (autoDetected) return autoDetected;
  }

  // Strategy 4: Bare name fallback — let execFileSync try PATH on its own
  return null;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Resolve the full path to pg_dump binary.
 * Returns the resolved path, or the bare name "pg_dump" as fallback.
 */
export function resolvePgDumpPath(): string {
  if (cachedPgDump === undefined) {
    cachedPgDump = resolveBinary("PG_DUMP_PATH", "pg_dump");
  }
  return cachedPgDump ?? "pg_dump";
}

/**
 * Resolve the full path to psql binary.
 * Returns the resolved path, or the bare name "psql" as fallback.
 */
export function resolvePsqlPath(): string {
  if (cachedPsql === undefined) {
    cachedPsql = resolveBinary("PSQL_PATH", "psql");
  }
  return cachedPsql ?? "psql";
}

/**
 * Check if pg_dump and psql are available.
 * Tests availability by running --version on the resolved paths.
 */
export function checkBinaryAvailability(): {
  pg_dump: boolean;
  psql: boolean;
} {
  let pgDumpAvailable = false;
  let psqlAvailable = false;

  try {
    const pgDump = resolvePgDumpPath();
    execSync(pgDump.includes(" ") ? `"${pgDump}" --version` : `${pgDump} --version`, {
      stdio: "pipe",
      timeout: 5000,
    });
    pgDumpAvailable = true;
  } catch {
    // Binary not available
  }

  try {
    const psql = resolvePsqlPath();
    execSync(psql.includes(" ") ? `"${psql}" --version` : `${psql} --version`, {
      stdio: "pipe",
      timeout: 5000,
    });
    psqlAvailable = true;
  } catch {
    // Binary not available
  }

  return { pg_dump: pgDumpAvailable, psql: psqlAvailable };
}
