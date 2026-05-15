import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") || "/dashboard";

  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (Number(adminCount[0].count) === 0) {
    return NextResponse.redirect(new URL("/admin/setup", request.url));
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", next);
  return NextResponse.redirect(loginUrl);
}
