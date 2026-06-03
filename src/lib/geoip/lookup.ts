import maxmind, { type Reader } from "maxmind";
import path from "path";

type GeoResult = { country: { iso_code: string } };

let reader: Reader<GeoResult> | null = null;
let initAttempted = false;

async function getReader(): Promise<Reader<GeoResult> | null> {
  if (reader) return reader;
  if (initAttempted) return null; // Don't retry after first failure
  initAttempted = true;

  const dbPath = path.join(process.cwd(), "data", "geoip", "dbip-country-lite.mmdb");
  try {
    reader = await maxmind.open<GeoResult>(dbPath);
    console.log("[GeoIP] MMDB loaded successfully from", dbPath);
    return reader;
  } catch {
    console.warn("[GeoIP] MMDB file not found at", dbPath, ". Geo enrichment skipped.");
    return null;
  }
}

export async function lookupCountry(ip: string): Promise<string | null> {
  const r = await getReader();
  if (!r) return null;
  try {
    const result = r.get(ip);
    return result?.country?.iso_code ?? null;
  } catch {
    return null;
  }
}
