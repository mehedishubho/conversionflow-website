import { NextRequest, NextResponse } from "next/server";

/**
 * SSL Commerz cancel redirect handler.
 * Redirects the customer back to the checkout page so they can retry.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("value_c") || "";

  return NextResponse.redirect(
    new URL(
      `/dashboard/checkout${plan ? `?plan=${encodeURIComponent(plan)}` : ""}`,
      request.url
    )
  );
}
