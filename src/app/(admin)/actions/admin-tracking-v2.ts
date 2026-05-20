"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { TRACKING_KEYS, type TrackingSettingsData } from "@/lib/tracking-keys";

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

function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getTrackingSettings(
  keys?: string[]
): Promise<TrackingSettingsData> {
  await requireAdmin();

  const queryKeys = keys
    ? keys.filter((k) => (TRACKING_KEYS as readonly string[]).includes(k))
    : [...TRACKING_KEYS];

  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, queryKeys));

  const map: TrackingSettingsData = {};
  for (const key of queryKeys) {
    const row = rows.find((r) => r.key === key);
    map[key] = row?.value ?? "";
  }
  return map;
}

export async function saveTrackingSettings(
  data: TrackingSettingsData
): Promise<{ success: boolean }> {
  const { userId, role } = await requireAdmin();

  const updatedKeys: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (!(TRACKING_KEYS as readonly string[]).includes(key)) continue;

    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }

    updatedKeys.push(key);
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.tracking_settings_updated",
    targetType: "settings",
    targetId: "tracking",
    details: {
      action: "tracking_settings_updated",
      keys: updatedKeys,
    },
  });

  return { success: true };
}

export async function sendMetaTestEvent(
  pixelId: string,
  accessToken: string,
  testEventCode?: string
): Promise<{ success: boolean; response?: string }> {
  await requireAdmin();

  if (!pixelId || !accessToken) {
    return { success: false, response: "Pixel ID and Access Token are required." };
  }

  try {
    const eventPayload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: "https://conversionflow.com",
          user_data: {
            client_ip_address: "127.0.0.1",
            client_user_agent:
              "Mozilla/5.0 (Test Agent) ConversionFlow Admin",
          },
          custom_data: {
            currency: "BDT",
            value: "100.00",
          },
        },
      ],
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    };

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventPayload,
          access_token: accessToken,
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const responseText = await res.text();

    if (res.ok) {
      return { success: true, response: responseText };
    } else {
      return { success: false, response: responseText };
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, response: message };
  }
}

interface Ga4SummaryData {
  activeUsers: string;
  pageviews: string;
  sessions: string;
  topPages: { path: string; views: number }[];
}

let ga4Cache: { data: Ga4SummaryData; timestamp: number } | null = null;
const GA4_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getGa4Summary(): Promise<Ga4SummaryData> {
  await requireAdmin();

  // Return cached data if still fresh
  if (ga4Cache && Date.now() - ga4Cache.timestamp < GA4_CACHE_TTL) {
    return ga4Cache.data;
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!propertyId || !serviceAccountEmail || !privateKey) {
    const fallback: Ga4SummaryData = {
      activeUsers: "--",
      pageviews: "--",
      sessions: "--",
      topPages: [],
    };
    return fallback;
  }

  try {
    // Generate JWT for service account authentication
    const jwt = await generateServiceAccountJwt(
      serviceAccountEmail,
      privateKey
    );

    // Exchange JWT for access token
    const tokenRes = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!tokenRes.ok) {
      throw new Error("Failed to obtain access token");
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    // Calculate date range (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    // Run report for active users, pageviews, sessions
    const reportRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" },
            { name: "sessions" },
          ],
          dimensions: [{ name: "pagePath" }],
          orderBys: [
            { metric: { metricName: "screenPageViews" }, desc: true },
          ],
          limit: 10,
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!reportRes.ok) {
      throw new Error("GA4 report request failed");
    }

    const report = (await reportRes.json()) as {
      totals?: { metricValues?: { value: string }[] }[];
      rows?: {
        dimensionValues: { value: string }[];
        metricValues: { value: string }[];
      }[];
    };

    const totals = report.totals?.[0]?.metricValues;
    const activeUsers = totals?.[0]?.value ?? "0";
    const pageviews = totals?.[1]?.value ?? "0";
    const sessions = totals?.[2]?.value ?? "0";

    const topPages = (report.rows ?? []).map((row) => ({
      path: row.dimensionValues[0]?.value ?? "/",
      views: parseInt(row.metricValues[0]?.value ?? "0", 10),
    }));

    const data: Ga4SummaryData = {
      activeUsers,
      pageviews,
      sessions,
      topPages,
    };

    // Update cache
    ga4Cache = { data, timestamp: Date.now() };

    return data;
  } catch {
    const fallback: Ga4SummaryData = {
      activeUsers: "--",
      pageviews: "--",
      sessions: "--",
      topPages: [],
    };
    return fallback;
  }
}

/**
 * Generates a JWT for Google service account authentication.
 * Uses Web Crypto API available in Node.js 18+ and edge runtimes.
 */
async function generateServiceAccountJwt(
  email: string,
  privateKeyPem: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const base64url = (data: string) =>
    btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the private key
  const keyContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const keyBuffer = Uint8Array.from(atob(keyContents), (c) =>
    c.charCodeAt(0)
  );

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${unsignedToken}.${encodedSignature}`;
}
