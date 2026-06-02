# Phase 15: Products Bounded Context - Research

**Researched:** 2026-06-02
**Domain:** DDD Bounded Context / Database Schema / Admin CRUD UI / CQRS
**Confidence:** HIGH

## Summary

Phase 15 builds the Products bounded context inside `src/modules/products/`, creating the database tables (`products`, `product_versions`, `product_plans`), domain entities, CQRS application layer, Drizzle repository implementations, and admin UI pages for managing products, versions, and plans. This is the foundational bounded context that Phase 16 (Licensing) and Phase 17 (Billing) depend on.

The existing codebase has a well-established DDD module structure (Phase 14 stubs in `src/modules/products/{domain,application,infrastructure}/`), a working `BaseRepository` with `IMapper` pattern, a `Money` value object for dual currency, `pgEnum` and `jsonb` patterns already in `schema.ts`, and a full admin UI component library (Table, Badge, Button, Modal, Select, InputField, TextArea, Form). The admin page pattern uses server components with `requireAdmin()` guards, `PageBreadcrumb` + `ComponentCard` wrappers, and client-side table components with `useTransition` for server action calls.

**Primary recommendation:** Extend `BaseRepository` with three concrete repositories (ProductRepository, ProductVersionRepository, ProductPlanRepository), add three tables to `schema.ts` using existing `pgEnum`/`pgTable`/`jsonb` patterns, build CQRS commands/queries in the application layer, and create admin pages following the nested Settings routing pattern (`/admin/products`, `/admin/products/[id]` with tabs).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Multi-product schema from day one — products table supports multiple products even though ConversionFlow is the only product currently. Schema is designed for extensibility without future migrations.
- **D-02:** Standard SaaS hierarchy: Product -> Plans + Versions. Each product has multiple plans (pricing tiers) and multiple versions (releases). Plans and versions belong to a product via foreign key.
- **D-03:** Dual currency pricing — each plan stores both BDT and USD prices. Customer sees BDT by default (BD market) with USD toggle. Money value object from Phase 14 handles currency validation.
- **D-04:** Plans support both license types: `lifetime` (no expiration, null `billingCycle`) and `subscription` (recurring with `billingCycle`: monthly, yearly, custom duration). Admin selects per plan. Current tiers: Starter=1yr subscription, Professional=2yr subscription, Agency=lifetime.
- **D-05:** Per-plan activation limits — each plan has a `maxActivations` integer field. 0 or NULL means unlimited. Current values: Starter=1, Professional=3, Agency=0 (unlimited).
- **D-06:** Full version tracking — each version record has: semver string (`version`), download URL (`downloadUrl`), changelog text (`changelog`), release date (`releasedAt`), and status enum (`stable`, `beta`, `draft`). Admin can manage full version lifecycle.
- **D-07:** Named feature flags via JSONB — each plan has a `features` JSONB field containing named boolean flags (e.g., `{"priority_support": true, "white_label": false, "auto_updates": true}`). Admin toggles flags per plan. Extensible without schema changes.

### Claude's Discretion
- Exact database column types and constraints (researcher decides based on Drizzle patterns)
- Domain entity class structure within the DDD layers
- Admin UI component choices (table vs card layout, form design)
- How to seed the initial ConversionFlow product with its 3 plans
- Event types to emit from this bounded context

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-01 | Admin can create products with name, slug, description, and current version | `products` table schema, ProductRepository, CreateProduct command, `/admin/products/new` page |
| PROD-02 | Admin can manage product versions with download URLs and changelogs | `product_versions` table schema, ProductVersionRepository, version CRUD commands, version management UI tab |
| PROD-03 | Admin can create plans for each product with pricing, activation limits, and feature flags | `product_plans` table schema, ProductPlanRepository, plan CRUD commands, plan management UI tab |
| PROD-04 | Plans support lifetime licenses (no expiration) and subscription licenses (duration-based) | `licenseType` enum (`lifetime`/`subscription`), `billingCycle` nullable field, plan form UI toggle |
| PROD-05 | Plans define maximum activation limits (1, 3, 5, unlimited) | `maxActivations` integer column, 0/NULL = unlimited, plan form input |
| PROD-06 | Plan pricing supports multiple currencies (BDT, USD) | `priceBDT` and `priceUSD` integer columns, Money value object integration |
| PROD-07 | Product and plan data is accessible via admin dashboard UI | Admin CRUD pages, server actions, admin sidebar navigation entry |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package Manager**: pnpm only (never npm, yarn, or bun)
- **Framework**: Next.js 16 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts`
- **Components**: Server components by default; client components only when needed (useState, useEffect, browser APIs)
- **Styling**: TailwindCSS v4 CSS-first config, no tailwind.config.js
- **Imports**: Use `@/` alias for internal modules, never relative paths across directories
- **Naming**: PascalCase `.tsx` components, camelCase utilities, named exports for reusable, default exports for pages
- **Animations**: framer-motion when needed
- **GSD Workflow**: No direct edits outside GSD workflow
- **DDD Architecture**: Bounded contexts in `src/modules/`, shared infrastructure in `src/shared/`
- **ORM**: Drizzle ORM with PostgreSQL, schema in `src/lib/db/schema.ts`
- **Database**: PostgreSQL with `db` from `@/lib/db`, migrations via `drizzle-kit`

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Database ORM | Already installed, all tables use pgTable/pgEnum/jsonb [VERIFIED: package.json] |
| drizzle-kit | 0.31.10 | Migration generation | Already installed, existing migration in `drizzle/` [VERIFIED: package.json] |
| nanoid | 5.1.11 | Unique ID generation | Already installed, used for event IDs [VERIFIED: package.json] |
| next | 16.2.6 | Framework | App Router with server components [VERIFIED: package.json] |
| react | 19.2.4 | UI | Already installed [VERIFIED: package.json] |
| lucide-react | 1.14.0 | Icons | Already installed, used throughout admin UI [VERIFIED: package.json] |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional classNames | Via `cn()` utility for className merging |
| tailwind-merge | 3.6.0 | Tailwind class dedup | Via `cn()` utility |
| date-fns | 4.1.0 | Date formatting | Admin UI date display |
| class-transformer | 0.5.1 | Value object serialization | Money value object serialization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two integer price columns (priceBDT, priceUSD) | JSONB prices column | JSONB is more flexible but loses type safety; two columns match Money VO pattern and are easier to query/sort |
| Separate features table with key-value rows | JSONB features column | JSONB is D-07 decision — avoids JOIN complexity for simple boolean flags |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/db/
│   └── schema.ts                  # ADD: products, product_versions, product_plans tables + enums + relations
├── modules/products/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Product.ts         # Product entity with validation
│   │   │   ├── ProductVersion.ts  # ProductVersion entity
│   │   │   └── ProductPlan.ts     # ProductPlan entity with pricing/limits
│   │   ├── events/
│   │   │   └── ProductEvents.ts   # ProductCreated, VersionReleased, PlanCreated events
│   │   └── index.ts               # Barrel export
│   ├── application/
│   │   ├── commands/
│   │   │   ├── CreateProduct.ts   # CreateProduct command + handler
│   │   │   ├── UpdateProduct.ts   # UpdateProduct command + handler
│   │   │   ├── DeleteProduct.ts   # DeleteProduct command + handler
│   │   │   ├── CreateVersion.ts   # CreateVersion command + handler
│   │   │   ├── UpdateVersion.ts   # UpdateVersion command + handler
│   │   │   ├── CreatePlan.ts      # CreatePlan command + handler
│   │   │   └── UpdatePlan.ts      # UpdatePlan command + handler
│   │   ├── queries/
│   │   │   ├── GetProduct.ts      # GetProduct query + handler
│   │   │   ├── ListProducts.ts    # ListProducts query + handler
│   │   │   ├── GetVersions.ts     # GetVersions by product query
│   │   │   └── GetPlans.ts        # GetPlans by product query
│   │   └── index.ts               # Barrel export
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── ProductRepository.ts    # Extends BaseRepository
│   │   │   ├── ProductVersionRepository.ts
│   │   │   ├── ProductPlanRepository.ts
│   │   │   └── mappers/
│   │   │       ├── ProductMapper.ts    # IMapper<Product, ProductRow>
│   │   │       ├── ProductVersionMapper.ts
│   │   │       └── ProductPlanMapper.ts
│   │   └── index.ts               # Barrel export
│   └── index.ts                   # Module barrel export
├── app/(admin)/
│   ├── admin/products/
│   │   ├── page.tsx               # Product list page (server component)
│   │   ├── new/page.tsx           # Create product page (server component)
│   │   └── [id]/
│   │       ├── page.tsx           # Product detail (server component, tabs layout)
│   │       ├── layout.tsx         # Auth guard + product data loader
│   │       ├── edit/page.tsx      # Edit product form
│   │       ├── versions/
│   │       │   ├── page.tsx       # Version list tab
│   │       │   └── new/page.tsx   # Create version form
│   │       └── plans/
│   │           ├── page.tsx       # Plan list tab
│   │           └── new/page.tsx   # Create plan form
│   └── actions/
│       └── admin-products.ts      # Server actions: CRUD for products, versions, plans
├── components/admin/
│   ├── ProductsTable.tsx          # Client component: product list with actions
│   ├── ProductForm.tsx            # Client component: create/edit product form
│   ├── ProductVersionsTable.tsx   # Client component: version list with status badges
│   ├── ProductPlansTable.tsx      # Client component: plan list with pricing
│   ├── ProductDetailShell.tsx     # Client component: tab navigation shell (like SettingsShell)
│   └── PlanForm.tsx               # Client component: plan create/edit form
└── data/
    └── dashboard-nav.ts           # UPDATE: add Products nav item to adminNavItems
```

### Pattern 1: Database Schema Extension
**What:** Add three new tables to the existing `schema.ts` following established patterns
**When to use:** Creating the products, versions, and plans tables
**Example:**
```typescript
// Source: Existing schema.ts patterns [VERIFIED: codebase]
// New enums following existing pgEnum pattern
export const versionStatusEnum = pgEnum("version_status", [
  "stable",
  "beta",
  "draft",
]);

export const licenseTypeEnum = pgEnum("license_type", [
  "lifetime",
  "subscription",
]);

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "yearly",
  "custom",
]);

// Products table — multi-product support (D-01)
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  currentVersion: text("current_version"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Product versions (D-02, D-06)
export const productVersions = pgTable(
  "product_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    version: text("version").notNull(), // semver string e.g. "1.2.0"
    downloadUrl: text("download_url"),
    changelog: text("changelog"),
    status: versionStatusEnum("status").notNull().default("draft"),
    releasedAt: timestamp("released_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("product_versions_product_id_version_unique").on(
      table.productId,
      table.version
    ),
  ]
);

// Product plans (D-02, D-03, D-04, D-05, D-07)
export const productPlans = pgTable(
  "product_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "Starter", "Professional", "Agency"
    slug: text("slug").notNull(), // e.g. "starter", "professional", "agency"
    description: text("description"),
    priceBDT: integer("price_bdt").notNull().default(0), // BDT amount in taka
    priceUSD: integer("price_usd").notNull().default(0), // USD amount in cents or dollars
    licenseType: licenseTypeEnum("license_type").notNull().default("subscription"),
    billingCycle: billingCycleEnum("billing_cycle"), // null for lifetime
    billingDurationMonths: integer("billing_duration_months"), // e.g. 12, 24, null for lifetime
    maxActivations: integer("max_activations").default(1), // 0/NULL = unlimited
    features: jsonb("features").$type<Record<string, boolean>>().default({}),
    sortOrder: integer("sort_order").default(0),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("product_plans_product_id_slug_unique").on(
      table.productId,
      table.slug
    ),
  ]
);
```

### Pattern 2: Repository Extending BaseRepository
**What:** Each bounded context entity gets a repository extending `BaseRepository<T, Data>` with an `IMapper`
**When to use:** Creating ProductRepository, ProductVersionRepository, ProductPlanRepository
**Example:**
```typescript
// Source: BaseRepository pattern [VERIFIED: src/shared/infrastructure/repositories/BaseRepository.ts]
import { BaseRepository } from "@/shared/infrastructure/repositories";
import type { IMapper } from "@/shared/infrastructure/repositories";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

// Domain entity (simplified)
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly currentVersion: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

// Mapper implements IMapper<Domain, Data>
export class ProductMapper implements IMapper<Product, typeof products.$inferSelect> {
  toDomain(row: typeof products.$inferSelect): Product {
    return new Product(
      row.id,
      row.name,
      row.slug,
      row.description,
      row.currentVersion,
      row.createdAt,
      row.updatedAt,
    );
  }
  toData(domain: Product): typeof products.$inferInsert {
    return {
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      description: domain.description,
      currentVersion: domain.currentVersion,
    };
  }
}

// Repository extends BaseRepository
export class ProductRepository extends BaseRepository<Product, typeof products.$inferSelect> {
  constructor() {
    super(products, new ProductMapper());
  }

  // Custom query: find by slug
  async findBySlug(slug: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1);
    return result.length > 0 ? this.mapper.toDomain(result[0]) : null;
  }

  // Custom query: find versions by product
  async findVersionsByProduct(productId: string) {
    // Uses productVersions table directly
  }
}
```

### Pattern 3: Admin Server Actions
**What:** Server actions following the `admin-orders.ts` pattern with `requireAdmin()` guard
**When to use:** All product/plan/version CRUD operations
**Example:**
```typescript
// Source: admin-orders.ts pattern [VERIFIED: src/app/(admin)/actions/admin-orders.ts]
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVersions, productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/admin/dashboard");
  return { session, userId: session.user.id, role };
}

export async function createProduct(formData: FormData) {
  const { userId, role } = await requireAdmin();
  const name = formData.get("name") as string;
  const slug = slugify(name); // auto-generate from name
  const description = formData.get("description") as string;

  const [product] = await db.insert(products).values({
    name,
    slug,
    description,
  }).returning();

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "product.created",
    targetType: "product",
    targetId: product.id,
    details: { name, slug },
  });

  return { success: true, productId: product.id };
}
```

### Pattern 4: Admin Page (Server Component)
**What:** Server component with auth check, data fetch, render with ComponentCard + client table
**When to use:** All admin product pages
**Example:**
```typescript
// Source: admin/orders/page.tsx pattern [VERIFIED: codebase]
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const productRows = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Products" basePath="/admin/dashboard" />
      <ComponentCard
        title="Product Management"
        desc="Manage products, versions, and pricing plans."
        action={
          <Link href="/admin/products/new" className="btn btn-primary text-sm">
            Add Product
          </Link>
        }
      >
        <ProductsTable products={productRows} onDelete={deleteProduct} />
      </ComponentCard>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Direct DB queries in UI components:** Always go through server actions or repository layer. Client components receive data as props and call server actions for mutations.
- **Business logic in server actions:** Server actions should be thin — validate input, call application layer command/query, return result. Domain validation belongs in entities/value objects.
- **Coupling to existing `productId` text field:** The `orders.productId` and `licenses.productId` are currently text fields. Do NOT add foreign key constraints to them in this phase (explicitly deferred to Phase 20).
- **Hardcoding plan data:** Do not duplicate the `pricing.ts` data structure. The database is now the source of truth for admin use cases. Marketing site (`pricing.ts`) can stay static for SEO until Phase 17.
- **Using `Math.random()` for slugs or IDs:** Always use `nanoid()` for IDs and deterministic slug generation from product name.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CRUD operations | Custom SQL queries per entity | BaseRepository + IMapper | Already built in Phase 14, handles findById, findAll, create, update, delete, exists, transaction |
| Dual currency validation | Custom price validation | Money value object | Already built in Phase 14, validates BDT/USD, handles formatting |
| Domain events | Custom event publishing | EventBus + BaseEvent | Already built in Phase 14, supports EventEmitter + Redis Pub/Sub |
| Admin auth guard | Re-implement session check | `requireAdmin()` pattern | Established pattern in all admin action files |
| Slug generation | Custom string manipulation | Simple `name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')` | No library needed — deterministic slug from name is ~10 lines |
| Audit logging | Custom logging | `createAuditLog()` from `@/lib/audit` | Already established across all admin actions |
| Admin table/filter UI | Custom table markup | Table, Badge, Button, Modal, Select UI components | Full component library already in `src/components/ui/` and `src/components/admin/` |

**Key insight:** Phase 14 built all the foundational infrastructure. Phase 15 is primarily about composing these pieces into a working bounded context — not building new infrastructure.

## Common Pitfalls

### Pitfall 1: Missing Unique Constraint on Product Slug
**What goes wrong:** Two products with the same slug are created, causing routing conflicts in `/admin/products/[id]` and downstream URL generation.
**Why it happens:** Forgetting to add `.unique()` on the slug column.
**How to avoid:** Add `text("slug").notNull().unique()` on products table, and compound unique `(product_id, slug)` on plans table, `(product_id, version)` on versions table.
**Warning signs:** Duplicate slug insert succeeds without error.

### Pitfall 2: Cascade Delete Deleting Plans/Versions Unintentionally
**What goes wrong:** Deleting a product cascades to delete all plans and versions, losing pricing data that might be referenced by existing orders/licenses.
**Why it happens:** Using `onDelete: "cascade"` on foreign keys without soft-delete protection.
**How to avoid:** Add `active` boolean field on products (soft-delete pattern). Consider using `onDelete: "restrict"` instead of `"cascade"` if plans are referenced by orders. For this phase, `cascade` is acceptable since orders/licenses still use text `productId` — but document this for Phase 20 migration.
**Warning signs:** Plans disappear when product is deleted; existing orders show missing plan names.

### Pitfall 3: JSONB Features Field Not Validated
**What goes wrong:** Admin enters invalid feature flag data (nested objects, arrays, non-boolean values) causing parsing errors in downstream consumers.
**Why it happens:** JSONB columns accept any JSON; no application-level validation.
**How to avoid:** Validate in the domain entity that features is `Record<string, boolean>` — flat object with boolean values only. Add validation in the PlanForm client component and in the CreatePlan/UpdatePlan command handlers.
**Warning signs:** `features` column contains nested objects, arrays, or string values.

### Pitfall 4: Version Status Lifecycle Not Enforced
**What goes wrong:** A version is marked as `stable` without a `releasedAt` date, or downgraded from `stable` to `beta` after being referenced by downloads.
**Why it happens:** No domain validation on state transitions.
**How to avoid:** In the ProductVersion entity, enforce: when status changes to `stable`, set `releasedAt` to `new Date()`. Validate transitions in the command handler.
**Warning signs:** Stable version with null `releasedAt`; downloads pointing to `beta` versions.

### Pitfall 5: BillingCycle Nullability Confusion
**What goes wrong:** A plan is marked as `subscription` but `billingCycle` is null, or marked as `lifetime` but `billingCycle` is set.
**Why it happens:** `billingCycle` and `billingDurationMonths` are nullable but not correlated with `licenseType`.
**How to avoid:** Validate in domain entity: if `licenseType === "lifetime"`, then `billingCycle` must be null and `billingDurationMonths` must be null. If `licenseType === "subscription"`, then `billingCycle` must be non-null.
**Warning signs:** Subscription plan with null billing cycle; lifetime plan with yearly billing.

### Pitfall 6: Drizzle Migration Conflicts
**What goes wrong:** Running `drizzle-kit generate` after adding tables creates a migration that conflicts with the existing single migration file.
**Why it happens:** The existing `drizzle/0000_overrated_prima.sql` contains the initial schema. Adding new tables generates a new migration file.
**How to avoid:** This is expected behavior — just run `pnpm db:generate` to create `0001_*.sql` and `pnpm db:migrate` to apply it. Ensure the dev database is up to date before generating.
**Warning signs:** Migration fails with "relation already exists" errors.

## Code Examples

### Domain Entity: ProductPlan with Validation
```typescript
// Source: Pattern from Money.ts value object [VERIFIED: src/shared/domain/valueObjects/Money.ts]
// src/modules/products/domain/entities/ProductPlan.ts

import { Money } from "@/shared/domain/valueObjects";

export class ProductPlan {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    private readonly _priceBDT: number,
    private readonly _priceUSD: number,
    public readonly licenseType: "lifetime" | "subscription",
    public readonly billingCycle: "monthly" | "yearly" | "custom" | null,
    public readonly billingDurationMonths: number | null,
    public readonly maxActivations: number,
    public readonly features: Record<string, boolean>,
    public readonly sortOrder: number,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateInvariants();
  }

  private validateInvariants(): void {
    // D-04: Lifetime plans must not have billing cycle
    if (this.licenseType === "lifetime") {
      if (this.billingCycle !== null) {
        throw new Error("Lifetime plans must not have a billing cycle");
      }
      if (this.billingDurationMonths !== null) {
        throw new Error("Lifetime plans must not have billing duration");
      }
    }

    // Subscription plans must have billing cycle
    if (this.licenseType === "subscription") {
      if (this.billingCycle === null) {
        throw new Error("Subscription plans must have a billing cycle");
      }
    }

    // D-05: maxActivations must be non-negative
    if (this.maxActivations < 0) {
      throw new Error("Max activations cannot be negative");
    }

    // D-07: Features must be flat boolean map
    for (const [key, value] of Object.entries(this.features)) {
      if (typeof value !== "boolean") {
        throw new Error(`Feature flag "${key}" must be a boolean value`);
      }
    }
  }

  get priceBDT(): Money {
    return Money.create(this._priceBDT, "BDT");
  }

  get priceUSD(): Money {
    return Money.create(this._priceUSD, "USD");
  }

  get isUnlimitedActivations(): boolean {
    return this.maxActivations === 0;
  }
}
```

### Seeding Initial ConversionFlow Product
```typescript
// src/lib/db/seed-products.ts
// Run via: pnpm db:seed-products (add to package.json scripts)
import { db } from "@/lib/db";
import { products, productPlans } from "@/lib/db/schema";

export async function seedProducts() {
  // Check if ConversionFlow product already exists
  const existing = await db.select().from(products).where(
    eq(products.slug, "conversionflow")
  ).limit(1);

  if (existing.length > 0) {
    console.log("Products already seeded. Skipping.");
    return;
  }

  // Create product
  const [product] = await db.insert(products).values({
    name: "ConversionFlow",
    slug: "conversionflow",
    description: "All-in-one WooCommerce automation plugin for Bangladeshi eCommerce stores.",
    currentVersion: "1.0.0",
  }).returning();

  // Create plans matching pricing.ts data
  await db.insert(productPlans).values([
    {
      productId: product.id,
      name: "Starter",
      slug: "starter",
      description: "For a single WooCommerce store — 1 year updates",
      priceBDT: 2150,
      priceUSD: 18,
      licenseType: "subscription",
      billingCycle: "yearly",
      billingDurationMonths: 12,
      maxActivations: 1,
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        one_year_updates: true,
        email_support: true,
        priority_support: false,
      },
      sortOrder: 1,
      active: true,
    },
    {
      productId: product.id,
      name: "Professional",
      slug: "professional",
      description: "For agencies managing 3 stores — 2 year updates",
      priceBDT: 3000,
      priceUSD: 28,
      licenseType: "subscription",
      billingCycle: "yearly",
      billingDurationMonths: 24,
      maxActivations: 3,
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        lifetime_updates: true,
        priority_email_support: true,
        whatsapp_support: true,
      },
      sortOrder: 2,
      active: true,
    },
    {
      productId: product.id,
      name: "Agency",
      slug: "agency",
      description: "Unlimited sites for agencies — lifetime updates",
      priceBDT: 8000,
      priceUSD: 75,
      licenseType: "lifetime",
      billingCycle: null,
      billingDurationMonths: null,
      maxActivations: 0, // unlimited
      features: {
        all_modules: true,
        courier_sync: true,
        meta_capi: true,
        fraud_shield: true,
        lifetime_updates: true,
        priority_whatsapp_support: true,
        white_label: true,
      },
      sortOrder: 3,
      active: true,
    },
  ]);

  console.log("ConversionFlow product with 3 plans seeded successfully.");
}
```

### Event Types for Products Context
```typescript
// src/modules/products/domain/events/ProductEvents.ts
// Claude's discretion: event types to emit

import type { BaseEvent } from "@/shared/infrastructure/eventBus";
import { nanoid } from "nanoid";

export const PRODUCT_EVENTS = {
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
  VERSION_CREATED: "product.version.created",
  VERSION_RELEASED: "product.version.released",
  PLAN_CREATED: "product.plan.created",
  PLAN_UPDATED: "product.plan.updated",
  PLAN_DELETED: "product.plan.deleted",
} as const;

export function createProductEvent(
  type: string,
  aggregateId: string,
  payload: unknown
): BaseEvent {
  return {
    id: nanoid(),
    type,
    aggregateId,
    payload,
    timestamp: new Date(),
    metadata: { source: "products-context", version: 1 },
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded pricing in `pricing.ts` | Database-driven products + plans tables | Phase 15 | Admin can change pricing without code deployment |
| Text `productId` in orders/licenses | Will be FK to products table | Planned Phase 20 | Referential integrity, cascading queries |
| No version tracking | Full version lifecycle management | Phase 15 | Admin can manage releases, downloads tied to versions |
| No plan feature flags | JSONB feature flags per plan | Phase 15 | Extensible feature gating without schema changes |

**Deprecated/outdated:**
- `src/data/pricing.ts`: Still used by marketing site. Do NOT delete in this phase. Phase 17 may refactor it to fetch from DB.
- `planPrices` map in `checkout/page.tsx`: Still authoritative for checkout. Do NOT refactor in this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `priceUSD` stored as integer dollars (not cents) — matching existing `amount` integer pattern in orders table | Database Schema | If USD should be cents, price display will be wrong |
| A2 | `billingDurationMonths` is sufficient for custom durations — no need for separate `billingDuration` + `billingDurationUnit` fields | Database Schema | If custom means "90 days" not "3 months", this field is insufficient |
| A3 | Marketing site `pricing.ts` does NOT need to be refactored to fetch from DB in this phase — it stays as static data | Scope | If stakeholders want real-time pricing on marketing site, additional work needed |
| A4 | Products module barrel exports follow the same pattern as eventBus barrel export (types first, then implementations) | Module Structure | Minor — just code organization consistency |
| A5 | The `ProductDetailShell` should follow the `SettingsShell` pattern with client-side tab navigation, not Next.js parallel routes | Admin UI | If parallel routes are preferred, more layout files needed |

## Open Questions (RESOLVED)

1. **USD price storage format** — RESOLVED: Store as integer dollars (18, 28, 75).
   - What we know: BDT prices in existing `orders.amount` are stored as integers (2150, 3000, 8000). `pricing.ts` shows USD as "$18", "$28", "$75".
   - Resolution: `priceUSD` stored as integer dollars matching existing pattern. Money value object handles formatting. Plan 01 Task 1 implements this.

2. **Custom billing duration granularity** — RESOLVED: `billingDurationMonths` integer field covers all SaaS periods.
   - What we know: D-04 says "custom duration" is a billing cycle option. Current tiers use yearly (12mo, 24mo).
   - Resolution: `billingDurationMonths` (integer) covers all realistic SaaS subscription periods. If days are needed, add a separate field in a future phase. Plan 01 Task 1 implements this.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | Product data persistence | Assumed | 15+ | - |
| Drizzle Kit | Migration generation | Available | 0.31.10 | - |
| Node.js | Runtime | Available | 20+ | - |
| pnpm | Package manager | Available | 9+ | - |

**Missing dependencies with no fallback:**
- PostgreSQL must be running and `DATABASE_URL` set for migration and testing.

**Missing dependencies with fallback:**
- None identified — all required tools are available.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — no test framework detected |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROD-01 | Create product with name, slug, description, version | manual | N/A | N/A |
| PROD-02 | Manage product versions CRUD | manual | N/A | N/A |
| PROD-03 | Create plans with pricing, activation limits, features | manual | N/A | N/A |
| PROD-04 | Plans support lifetime and subscription types | manual | N/A | N/A |
| PROD-05 | Plans define max activation limits | manual | N/A | N/A |
| PROD-06 | Dual currency pricing (BDT, USD) | manual | N/A | N/A |
| PROD-07 | Admin UI CRUD for products and plans | manual | N/A | N/A |

### Sampling Rate
- **Per task commit:** Manual browser verification
- **Per wave merge:** `pnpm build` to verify no type errors
- **Phase gate:** Full admin UI walkthrough + `pnpm build` + `pnpm db:migrate`

### Wave 0 Gaps
- [ ] No test framework — all testing is manual via admin UI
- [ ] No test files exist for any module

*(No test infrastructure exists. All validation is manual through `pnpm build` type-checking and admin UI verification. This matches the project's current approach — no test framework has been installed across any phase.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session via `requireAdmin()` guard |
| V3 Session Management | yes | Better Auth session management |
| V4 Access Control | yes | `requireAdmin()` role check on all server actions |
| V5 Input Validation | yes | Domain entity validation + FormData parsing |
| V6 Cryptography | no | No crypto operations in this phase |

### Known Threat Patterns for Admin CRUD

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized product creation | Spoofing | `requireAdmin()` on all server actions |
| SQL injection via form fields | Tampering | Drizzle parameterized queries (automatic) |
| Mass assignment | Tampering | Explicit field extraction from FormData |
| CSRF on admin actions | Tampering | Next.js server actions CSRF protection (automatic) |
| Price manipulation | Repudiation | Audit logging via `createAuditLog()` for all mutations |

## Sources

### Primary (HIGH confidence)
- `src/lib/db/schema.ts` — Verified Drizzle table patterns, pgEnum usage, JSONB usage, relations patterns
- `src/shared/infrastructure/repositories/BaseRepository.ts` — Verified repository base class API
- `src/shared/infrastructure/repositories/types.ts` — Verified IRepository, IMapper, QueryBuilder interfaces
- `src/shared/domain/valueObjects/Money.ts` — Verified Money value object API
- `src/shared/infrastructure/eventBus/types.ts` — Verified BaseEvent, EventBus interfaces
- `src/data/pricing.ts` — Verified current pricing tiers and feature flags
- `src/data/dashboard-nav.ts` — Verified admin navigation structure
- `src/app/(admin)/admin/orders/page.tsx` — Verified admin page pattern
- `src/app/(admin)/actions/admin-orders.ts` — Verified server action pattern with requireAdmin()
- `src/components/admin/SettingsShell.tsx` — Verified nested routing with tab navigation
- `src/components/admin/OrdersTable.tsx` — Verified admin table component pattern
- `package.json` — Verified all installed dependency versions

### Secondary (MEDIUM confidence)
- `src/app/(portal)/dashboard/checkout/page.tsx` — Verified hardcoded planPrices map to understand current pricing source
- `src/lib/db/seed.ts` — Verified seed script pattern
- `drizzle.config.ts` — Verified migration configuration

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and verified in codebase
- Architecture: HIGH — DDD module structure established in Phase 14, admin patterns established in v2.0
- Pitfalls: HIGH — based on verified codebase patterns and established Drizzle/PostgreSQL knowledge
- Database schema: HIGH — follows existing pgTable/pgEnum/jsonb patterns exactly
- Admin UI: HIGH — follows existing OrdersTable, SettingsShell, ComponentCard patterns

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable — all patterns are established in codebase)
