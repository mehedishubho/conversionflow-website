import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { OrderWithUser } from "./InvoiceHTML";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0047FF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 30,
    marginBottom: 20,
  },
  metadataItem: {
    flexDirection: "column",
  },
  label: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    flex: 1,
    maxWidth: "48%",
  },
  infoName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  infoDetail: {
    fontSize: 9,
    color: "#666",
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCellLeft: {
    flex: 1,
    fontSize: 10,
  },
  tableCellRight: {
    width: 120,
    fontSize: 10,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
  },
  totalValue: {
    width: 120,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
    color: "#0047FF",
  },
  discountText: {
    color: "#12b76a",
  },
  paymentSection: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 30,
    marginTop: 6,
  },
  paymentItem: {
    flexDirection: "column",
  },
  paymentLabel: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

const paymentMethodMap: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
};

function formatBDT(amount: number): string {
  return `${amount.toLocaleString("en-BD")} BDT`;
}

interface InvoicePDFProps {
  order: OrderWithUser;
  vatRate?: number;
}

export function InvoicePDF({ order, vatRate = 15 }: InvoicePDFProps) {
  const invoiceNumber = `CF-${order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = format(new Date(order.createdAt), "MMMM d, yyyy");

  const baseAmount = order.amount;
  const taxAmount = order.taxAmount ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const total = baseAmount + taxAmount - discountAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>INVOICE</Text>
        <Text style={styles.subtitle}>ConversionFlow by Devsroom</Text>

        {/* Invoice metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Text style={styles.label}>Invoice #</Text>
            <Text style={styles.value}>{invoiceNumber}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{invoiceDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To + Company */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.infoName}>{order.userName}</Text>
            <Text style={styles.infoDetail}>{order.userEmail}</Text>
            {order.userPhone && (
              <Text style={styles.infoDetail}>{order.userPhone}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Company</Text>
            <Text style={styles.infoName}>Devsroom</Text>
            <Text style={styles.infoDetail}>Dhaka, Bangladesh</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line items table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, { width: 120, textAlign: "right" }]}>
              Amount
            </Text>
          </View>

          {/* Plan row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>{order.plan} Plan</Text>
            <Text style={styles.tableCellRight}>{formatBDT(baseAmount)}</Text>
          </View>

          {/* VAT row */}
          {taxAmount > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>VAT ({vatRate}%)</Text>
              <Text style={styles.tableCellRight}>{formatBDT(taxAmount)}</Text>
            </View>
          )}

          {/* Discount row */}
          {discountAmount > 0 && order.couponCode && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellLeft, styles.discountText]}>
                Discount ({order.couponCode})
              </Text>
              <Text style={[styles.tableCellRight, styles.discountText]}>
                -{formatBDT(discountAmount)}
              </Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatBDT(total)}</Text>
          </View>
        </View>

        {/* Payment details */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Method</Text>
              <Text style={styles.paymentValue}>
                {paymentMethodMap[order.paymentMethod ?? ""] ??
                  order.paymentMethod ??
                  "N/A"}
              </Text>
            </View>
            {order.paymentRef && (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>Transaction ID</Text>
                <Text style={styles.paymentValue}>{order.paymentRef}</Text>
              </View>
            )}
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Status</Text>
              <Text style={styles.paymentValue}>{order.status}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
