import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import type { OrderWithUser } from "@/components/invoice/InvoiceHTML";

export type { OrderWithUser };

export async function generateInvoicePDF(
  order: OrderWithUser
): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(<InvoicePDF order={order} />);
  return Buffer.from(pdfBuffer);
}
