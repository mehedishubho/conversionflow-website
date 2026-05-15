import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bkash",
  "nagad",
  "rocket",
  "bank_transfer",
  "ssl_commerz",
]);

export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "expired",
  "revoked",
  "suspended",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "flat",
]);

// ──────────────────────────────────────────────
// Tables
// ──────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  centralOrderId: text("central_order_id"),
  productId: text("product_id").notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("BDT"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentRef: text("payment_ref"),
  status: orderStatusEnum("status").notNull().default("pending"),
  couponCode: text("coupon_code"),
  discountAmount: integer("discount_amount").default(0),
  taxAmount: integer("tax_amount").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    centralLicenseId: text("central_license_id"),
    orderId: uuid("order_id").references(() => orders.id),
    productId: text("product_id").notNull(),
    plan: text("plan").notNull(),
    licenseKey: text("license_key").notNull().unique(),
    status: licenseStatusEnum("status").notNull().default("active"),
    activationDomains: jsonb("activation_domains").default([]),
    maxActivations: integer("max_activations").default(1),
    currentActivations: integer("current_activations").default(0),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique("licenses_license_key_unique").on(t.licenseKey)],
);

export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  downloadToken: text("download_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  assignedTo: text("assigned_to"),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id"),
  actorRole: text("actor_role"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: integer("value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ──────────────────────────────────────────────
// Relations
// ──────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ many }) => ({
  licenses: many(licenses),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  order: one(orders, {
    fields: [licenses.orderId],
    references: [orders.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ many }) => ({
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));
