-- Coupon scope: add enum, columns, and junction table
CREATE TYPE "public"."coupon_scope" AS ENUM('all', 'product', 'plan');
ALTER TABLE "coupons" ADD COLUMN "scope" "coupon_scope" NOT NULL DEFAULT 'all';
ALTER TABLE "coupons" ADD COLUMN "applicable_product_id" uuid REFERENCES "products"("id") ON DELETE SET NULL;
CREATE TABLE "coupon_applicable_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "plan_id" uuid NOT NULL REFERENCES "product_plans"("id") ON DELETE CASCADE,
  CONSTRAINT "coupon_applicable_plans_coupon_plan_unique" UNIQUE("coupon_id","plan_id")
);
CREATE INDEX "coupon_applicable_plans_coupon_id_idx" ON "coupon_applicable_plans" USING btree ("coupon_id");
