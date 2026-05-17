import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateInvoicePDF } from "@/lib/invoices";
import type { OrderWithUser } from "@/lib/invoices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Auth check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin";

    // Query order with user data
    const [orderRow] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        centralOrderId: orders.centralOrderId,
        productId: orders.productId,
        plan: orders.plan,
        amount: orders.amount,
        currency: orders.currency,
        paymentMethod: orders.paymentMethod,
        paymentRef: orders.paymentRef,
        status: orders.status,
        couponCode: orders.couponCode,
        discountAmount: orders.discountAmount,
        taxAmount: orders.taxAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
      })
      .from(orders)
      .leftJoin(user, eq(orders.userId, user.id))
      .where(eq(orders.id, orderId));

    if (!orderRow) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Authorization: user can only access their own invoices, admin can access any
    if (!isAdmin && orderRow.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate PDF
    const order: OrderWithUser = {
      id: orderRow.id,
      userId: orderRow.userId,
      centralOrderId: orderRow.centralOrderId,
      productId: orderRow.productId,
      plan: orderRow.plan,
      amount: orderRow.amount,
      currency: orderRow.currency,
      paymentMethod: orderRow.paymentMethod,
      paymentRef: orderRow.paymentRef,
      status: orderRow.status,
      couponCode: orderRow.couponCode,
      discountAmount: orderRow.discountAmount,
      taxAmount: orderRow.taxAmount,
      createdAt: orderRow.createdAt,
      updatedAt: orderRow.updatedAt,
      userName: orderRow.userName ?? "Unknown",
      userEmail: orderRow.userEmail ?? "",
      userPhone: orderRow.userPhone ?? "",
    };

    const pdfBuffer = await generateInvoicePDF(order);

    const filename = `invoice-${order.id.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Invoice PDF Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
