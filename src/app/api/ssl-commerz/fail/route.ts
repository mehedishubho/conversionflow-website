import { NextRequest, NextResponse } from "next/server";

/**
 * SSL Commerz fail redirect handler.
 * Redirects the customer to the checkout result page with failed status.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tranId = searchParams.get("tran_id") || "";

  return NextResponse.redirect(
    new URL(
      `/dashboard/checkout/success?order=${encodeURIComponent(tranId)}&status=failed`,
      request.url
    )
  );
}
