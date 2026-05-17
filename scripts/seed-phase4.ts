import { db } from "../src/lib/db/index.js";
import { settings, paymentAccounts, coupons } from "../src/lib/db/schema.js";

async function seed() {
  console.log("Seeding Phase 4 data...");

  // Settings
  await db.insert(settings).values([
    { key: "vat_rate", value: "15" },
    { key: "vat_mode", value: "exclusive" },
  ]).onConflictDoNothing();
  console.log("Settings seeded: vat_rate, vat_mode");

  // Payment accounts (placeholders, inactive by default)
  await db.insert(paymentAccounts).values([
    { method: "bkash", accountName: "bKash Payment", accountNumber: "01XXXXXXXXX", instructions: "Send money to the above bKash number and enter the Transaction ID below.", active: false },
    { method: "nagad", accountName: "Nagad Payment", accountNumber: "01XXXXXXXXX", instructions: "Send money to the above Nagad number and enter the Transaction ID below.", active: false },
    { method: "rocket", accountName: "Rocket Payment", accountNumber: "01XXXXXXXXX", instructions: "Send money to the above Rocket number and enter the Transaction ID below.", active: false },
    { method: "bank_transfer", accountName: "Bank Transfer", accountNumber: "XXXX-XXXX-XXXX", instructions: "Transfer the amount to the bank account above and enter the reference number below.", active: false },
    { method: "ssl_commerz", accountName: "SSL Commerz", accountNumber: "N/A", instructions: "You will be redirected to SSL Commerz payment gateway.", active: false },
  ]).onConflictDoNothing();
  console.log("Payment accounts seeded: 5 methods");

  // Sample coupon
  await db.insert(coupons).values({
    code: "LAUNCH20",
    type: "percentage",
    value: 20,
    minOrderAmount: null,
    maxUses: 100,
    currentUses: 0,
    expiresAt: null,
    active: true,
  }).onConflictDoNothing();
  console.log("Coupon seeded: LAUNCH20 (20% off, max 100 uses)");

  console.log("Phase 4 seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
