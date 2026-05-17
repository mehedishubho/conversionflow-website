import { NextRequest, NextResponse } from "next/server";

/**
 * SSL Commerz success redirect handler.
 *
 * IMPORTANT: This route only redirects the customer to the success page.
 * It does NOT mark the order as completed -- that is the IPN handler's job.
 * Per Pitfall 3: never trust redirect data, only IPN + server-to-server validation.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tranId = searchParams.get("tran_id") || "";

  // Redirect customer to portal success page
  // IPN handler will update the order status server-side
  return NextResponse.redirect(
    new URL(
      `/dashboard/checkout/success?order=${encodeURIComponent(tranId)}&status=completed`,
      request.url
    )
  );
}
