import { NextRequest, NextResponse } from "next/server";

/**
 * SSL Commerz cancel redirect handler.
 * Redirects the customer back to the checkout page so they can retry.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const valueC = searchParams.get("value_c") || "";
  const [platform, plan] = valueC.includes(":") ? valueC.split(":") : ["woocommerce", valueC];

  const params = new URLSearchParams();
  if (plan) params.set("plan", plan);
  if (platform) params.set("platform", platform);

  return NextResponse.redirect(
    new URL(
      `/dashboard/checkout${params.toString() ? `?${params.toString()}` : ""}`,
      request.url
    )
  );
}
