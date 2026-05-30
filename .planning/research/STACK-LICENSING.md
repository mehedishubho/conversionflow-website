# Technology Stack: Self-Contained Licensing System

**Project:** ConversionFlow v3.0 - Self-Contained Licensing Architecture
**Researched:** 2026-05-29
**Scope:** NEW dependencies ONLY for licensing capabilities (product management, license generation/validation, activation tracking, subscription handling)
**Existing v2.x stack preserved:** Next.js 16.2.6, PostgreSQL, Drizzle ORM 0.45.2, Redis (ioredis 5.10.1), BullMQ 5.76.8, Better Auth 1.6.11

## Overview

The v3.0 licensing system requires MINIMAL new dependencies. The existing stack (PostgreSQL, Drizzle, Redis, BullMQ) provides 90% of what's needed. This document focuses only on the NEW additions required for self-contained licensing operations.

---

## NEW Stack Additions

### 1. Core Cryptography & License Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Node.js crypto module** | Built-in (Node.js 20+) | License key generation, HMAC signing/validation | Native, zero-dependency, production-ready. No external library needed. Handles HMAC-SHA256 for license key signatures and timing-safe comparison for validation. |
| **nanoid** | 5.1.11 (already installed) | License key component generation | Cryptographically strong, URL-safe random IDs. Already in dependencies from v2.x. |

**NO NEW INSTALLATIONS NEEDED** - All cryptography is built into Node.js.

**License Key Pattern:**
```
Format: XXXX-XXXX-XXXX-XXXX-SIGNATURE
- 4 segments of 8 characters each (nanoid-generated)
- Final segment: 8-character HMAC-SHA256 signature
- Example: A3fK9mP2-B7xL4nQ8-C1vR6sT3-D5wY9zZ4-7F2A8B1C
```

**Implementation Example:**
```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';
import { nanoid } from 'nanoid';

interface LicensePayload {
  userId: string;
  productId: string;
  plan: string;
  timestamp: number;
}

function generateLicenseKey(payload: LicensePayload, secret: string): string {
  const segments = [
    nanoid(8).toUpperCase(),
    nanoid(8).toUpperCase(),
    nanoid(8).toUpperCase(),
    nanoid(8).toUpperCase(),
  ];
  
  const signature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  return [...segments, signature].join('-');
}

function verifyLicenseKey(
  key: string, 
  payload: LicensePayload, 
  secret: string
): boolean {
  const segments = key.split('-');
  if (segments.length !== 5) return false;
  
  const providedSignature = segments[4];
  
  const computedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  return timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(computedSignature)
  );
}
```

**Confidence: HIGH** - Node.js crypto module is official, battle-tested, and requires no dependencies.

---

### 2. Background Jobs (BullMQ Extension)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **BullMQ** | 5.76.8 (already installed) | Queue-based job processing | Already installed. Extending for license-specific jobs. |
| **@bull-board/api** | ^5.x (optional) | Job monitoring dashboard | Optional UI for monitoring queues, retrying failed jobs. |

**NO NEW INSTALLATIONS REQUIRED** - BullMQ is already installed from v2.x.

**NEW Job Types to Add:**
```typescript
// src/jobs/queues.ts - extend existing
export const QUEUE_NAMES = {
  // Existing from v2.x
  EMAIL: "email",
  LICENSE_SYNC: "license-sync",
  NOTIFICATION: "notification",
  
  // NEW for v3.0 licensing
  LICENSE_EXPIRATION: "license-expiration",
  LICENSE_RENEWAL_REMINDER: "license-renewal-reminder",
  ACTIVITY_SYNC: "activity-sync",
  WEBHOOK_DELIVERY: "webhook-delivery",
  SUBSCRIPTION_RENEWAL: "subscription-renewal",
} as const;
```

**New Job Processors:**
```typescript
// src/jobs/workers/license-expiration.worker.ts
import { Worker } from 'bullmq';

export const expirationWorker = new Worker(
  QUEUE_NAMES.LICENSE_EXPIRATION,
  async (job) => {
    // Check licenses expiring in 7 days
    const expiringLicenses = await db.query.licenses.findMany({
      where: and(
        eq(licenses.status, 'active'),
        lte(licenses.expiresAt, sql`NOW() + INTERVAL '7 days'`)
      ),
    });
    
    for (const license of expiringLicenses) {
      await sendExpirationReminder(license);
    }
  },
  { connection: redis }
);
```

**Confidence: HIGH** - BullMQ is already installed and proven in v2.x.

---

### 3. Event-Driven Architecture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Node.js EventEmitter** | Built-in | In-process domain events | Native, zero-dependency event bus for decoupled operations. |
| **Redis Pub/Sub** | Via ioredis 5.10.1 (installed) | Cross-process events | Already have ioredis. Enables events across multiple workers. |

**NO NEW INSTALLATIONS NEEDED** - EventEmitter is built-in, ioredis already installed.

**Implementation Pattern:**
```typescript
// src/lib/events/domain-events.ts
import { EventEmitter } from 'events';

class DomainEventEmitter extends EventEmitter {}

export const domainEvents = new DomainEventEmitter();

// Domain event types
export type DomainEvent =
  | { type: 'license.created'; data: LicenseCreatedEvent }
  | { type: 'license.activated'; data: LicenseActivatedEvent }
  | { type: 'license.deactivated'; data: LicenseDeactivatedEvent }
  | { type: 'license.expired'; data: LicenseExpiredEvent }
  | { type: 'license.revoked'; data: LicenseRevokedEvent }
  | { type: 'license.suspended'; data: LicenseSuspendedEvent }
  | { type: 'subscription.renewed'; data: SubscriptionRenewedEvent }
  | { type: 'product.created'; data: ProductCreatedEvent }
  | { type: 'product.updated'; data: ProductUpdatedEvent };

// Usage in services
await domainEvents.emit('license.created', {
  licenseId: license.id,
  userId: license.userId,
  productId: license.productId,
  plan: license.plan,
  createdAt: new Date(),
});
```

**Redis Pub/Sub for Cross-Process Events:**
```typescript
// src/lib/events/redis-publisher.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function publishDomainEvent(event: DomainEvent) {
  await redis.publish(`domain:${event.type}`, JSON.stringify(event));
}

// src/jobs/workers/event-subscriber.ts
redis.subscribe('domain:license.created');
redis.on('message', (channel, message) => {
  if (channel === 'domain:license.created') {
    const event = JSON.parse(message) as LicenseCreatedEvent;
    // Handle event in worker
  }
});
```

**Confidence: HIGH** - EventEmitter is native, ioredis Pub/Sub is a standard feature.

---

### 4. API Design & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js Route Handlers** | Built-in (Next.js 16) | REST API endpoints | Native Next.js API routes with TypeScript. |
| **Zod** | ^4.4.3 (installed via better-auth) | Request/response validation | Type-safe runtime validation. Already bundled with Better Auth. |

**NO NEW INSTALLATIONS NEEDED** - Route Handlers are built-in, Zod already present.

**License Validation API Pattern:**
```typescript
// app/api/v1/license/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const validateSchema = z.object({
  licenseKey: z.string().regex(/^[A-Z0-9-]{37}$/, 'Invalid license key format'),
  domain: z.string().min(1),
  productId: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { licenseKey, domain, productId } = validateSchema.parse(body);
  
  // Verify signature
  const license = await licenseService.validateLicense(licenseKey, domain, productId);
  
  if (!license.valid) {
    return NextResponse.json(
      { valid: false, error: license.error },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    valid: true,
    plan: license.plan,
    expiresAt: license.expiresAt,
    maxActivations: license.maxActivations,
  });
}
```

**Confidence: HIGH** - Route Handlers are standard Next.js, Zod is already available.

---

### 5. Service Layer & Repository Pattern

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Custom TypeScript Classes** | New | Service/Repository abstraction | No external library needed. Use TypeScript classes with dependency injection. |

**NO NEW INSTALLATIONS NEEDED** - Pure TypeScript implementation.

**Repository Pattern (extends existing Drizzle usage):**
```typescript
// src/lib/repositories/license.repository.ts
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { licenses, licenseActivations } from '@/lib/db/schema';

export class LicenseRepository {
  async findById(id: string) {
    return db.query.licenses.findFirst({
      where: eq(licenses.id, id),
      with: {
        activations: true,
      },
    });
  }
  
  async findByLicenseKey(key: string) {
    return db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, key),
    });
  }
  
  async findByUserId(userId: string) {
    return db.query.licenses.findMany({
      where: eq(licenses.userId, userId),
      with: {
        activations: true,
      },
    });
  }
  
  async findByProductId(productId: string) {
    return db.query.licenses.findMany({
      where: eq(licenses.productId, productId),
    });
  }
  
  async create(data: NewLicense) {
    const result = await db.insert(licenses).values(data).returning();
    return result[0];
  }
  
  async updateStatus(id: string, status: LicenseStatus) {
    const result = await db.update(licenses)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, id))
      .returning();
    return result[0];
  }
  
  async incrementActivations(id: string) {
    const result = await db.update(licenses)
      .set({ 
        currentActivations: sql`${licenses.currentActivations} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, id))
      .returning();
    return result[0];
  }
  
  async decrementActivations(id: string) {
    const result = await db.update(licenses)
      .set({ 
        currentActivations: sql`${licenses.currentActivations} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, id))
      .returning();
    return result[0];
  }
}
```

**Service Layer Pattern:**
```typescript
// src/lib/services/license.service.ts
import { LicenseRepository } from '@/lib/repositories/license.repository';
import { ProductRepository } from '@/lib/repositories/product.repository';
import { ActivationRepository } from '@/lib/repositories/activation.repository';
import { domainEvents } from '@/lib/events/domain-events';
import { generateLicenseKey, verifyLicenseKey } from '@/lib/licenses/crypto';

export class LicenseService {
  constructor(
    private licenseRepo: LicenseRepository,
    private productRepo: ProductRepository,
    private activationRepo: ActivationRepository,
  ) {}
  
  async generateLicense(params: GenerateLicenseParams) {
    // Validate product
    const product = await this.productRepo.findById(params.productId);
    if (!product) throw new Error('Product not found');
    
    // Generate license key
    const payload = {
      userId: params.userId,
      productId: params.productId,
      plan: params.plan,
      timestamp: Date.now(),
    };
    
    const licenseKey = generateLicenseKey(payload, LICENSE_SECRET);
    
    // Calculate expiration
    const expiresAt = params.duration 
      ? new Date(Date.now() + params.duration * 30 * 24 * 60 * 60 * 1000)
      : null; // Lifetime
    
    // Create license
    const license = await this.licenseRepo.create({
      licenseKey,
      userId: params.userId,
      productId: params.productId,
      plan: params.plan,
      maxActivations: product.defaultMaxActivations,
      expiresAt,
      status: 'active',
    });
    
    // Emit domain event
    await domainEvents.emit('license.created', {
      licenseId: license.id,
      userId: params.userId,
      productId: params.productId,
      plan: params.plan,
      expiresAt,
      createdAt: new Date(),
    });
    
    return license;
  }
  
  async activateLicense(licenseKey: string, activation: ActivationParams) {
    // Find license
    const license = await this.licenseRepo.findByLicenseKey(licenseKey);
    if (!license) throw new Error('License not found');
    
    // Check status
    if (license.status !== 'active') {
      throw new Error(`License is ${license.status}`);
    }
    
    // Check expiration
    if (license.expiresAt && license.expiresAt < new Date()) {
      await this.updateLicenseStatus(license.id, 'expired');
      throw new Error('License has expired');
    }
    
    // Check activation limits
    if (license.currentActivations >= license.maxActivations) {
      throw new Error('Activation limit reached');
    }
    
    // Verify domain not already activated
    const existing = await this.activationRepo.findByLicenseAndDomain(
      license.id, 
      activation.domain
    );
    
    if (existing && existing.status === 'active') {
      return { license, existing: true, activation: existing };
    }
    
    // Create or reactivate
    const activationRecord = existing
      ? await this.activationRepo.reactivate(existing.id)
      : await this.activationRepo.create({
          licenseId: license.id,
          domain: activation.domain,
          ipAddress: activation.ipAddress,
          userAgent: activation.userAgent,
        });
    
    // Increment activation count
    await this.licenseRepo.incrementActivations(license.id);
    
    // Emit event
    await domainEvents.emit('license.activated', {
      licenseId: license.id,
      activationId: activationRecord.id,
      domain: activation.domain,
      timestamp: new Date(),
    });
    
    return { license, existing: false, activation: activationRecord };
  }
  
  async deactivateLicense(licenseKey: string, domain: string) {
    const license = await this.licenseRepo.findByLicenseKey(licenseKey);
    if (!license) throw new Error('License not found');
    
    const activation = await this.activationRepo.findByLicenseAndDomain(
      license.id,
      domain
    );
    
    if (!activation) throw new Error('Activation not found');
    
    await this.activationRepo.deactivate(activation.id);
    await this.licenseRepo.decrementActivations(license.id);
    
    await domainEvents.emit('license.deactivated', {
      licenseId: license.id,
      activationId: activation.id,
      domain,
      timestamp: new Date(),
    });
  }
  
  async validateLicense(licenseKey: string, domain: string, productId: string) {
    // Verify signature
    const signature = licenseKey.split('-')[4];
    if (!signature) return { valid: false, error: 'Invalid key format' };
    
    // Find license in database
    const license = await this.licenseRepo.findByLicenseKey(licenseKey);
    if (!license) return { valid: false, error: 'License not found' };
    
    // Check product match
    if (license.productId !== productId) {
      return { valid: false, error: 'License not valid for this product' };
    }
    
    // Check status
    if (license.status !== 'active') {
      return { valid: false, error: `License is ${license.status}` };
    }
    
    // Check expiration
    if (license.expiresAt && license.expiresAt < new Date()) {
      await this.updateLicenseStatus(license.id, 'expired');
      return { valid: false, error: 'License has expired' };
    }
    
    // Check domain activation
    const activation = await this.activationRepo.findByLicenseAndDomain(
      license.id,
      domain
    );
    
    if (!activation || activation.status !== 'active') {
      return { valid: false, error: 'License not activated for this domain' };
    }
    
    return {
      valid: true,
      license: {
        id: license.id,
        plan: license.plan,
        expiresAt: license.expiresAt,
        maxActivations: license.maxActivations,
      },
    };
  }
}
```

**Confidence: MEDIUM** - Standard DDD patterns, but implementation details will be refined during development.

---

### 6. Database Schema Additions

**NEW Tables Required:**

```typescript
// src/lib/db/schema/products.ts
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  active: boolean("active").default(true),
  defaultMaxActivations: integer("max_activations").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const productPlans = pgTable("product_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("BDT"),
  maxActivations: integer("max_activations").default(1),
  durationMonths: integer("duration_months"), // null for lifetime
  features: jsonb("features").$type<string[]>().default([]),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productVersions = pgTable("product_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id),
  version: text("version").notNull(),
  downloadUrl: text("download_url").notNull(),
  changelog: text("changelog"),
  releasedAt: timestamp("released_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const licenseActivations = pgTable("license_activations", {
  id: uuid("id").defaultRandom().primaryKey(),
  licenseId: uuid("license_id").references(() => licenses.id),
  domain: text("domain").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  activatedAt: timestamp("activated_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  status: text("status").default("active"), // active, inactive
});

// Schema Changes to Existing Tables
// - Remove centralOrderId from orders
// - Remove centralLicenseId from licenses  
// - Remove centralUserId from user
```

**Confidence: HIGH** - Standard PostgreSQL schema with Drizzle ORM patterns.

---

## Installation Summary

```bash
# Core cryptography - BUILT-IN to Node.js
# No installation needed

# Background jobs - Already installed from v2.x
# bullmq@5.76.8 already present

# Event system - BUILT-IN to Node.js + ioredis
# No installation needed

# Validation - Already bundled with better-auth
# zod@^4.4.3 already present

# Service/Repository layer - Pure TypeScript
# No installation needed

# Optional: Job monitoring UI
pnpm add @bull-board/api @bull-board/express
```

**NEW installations for v3.0 licensing: 0-2 packages**
- 0 new packages required for core licensing functionality
- Optional: 2 packages for job monitoring UI

---

## What NOT to Add

| Avoid | Reason |
|-------|--------|
| **External licensing services** (Keygen.sh, LemonLDAP, Cryptlex) | Defeats self-contained requirement. External dependency. |
| **node-forge** or **crypto-js** | Node.js crypto module is native and sufficient. |
| **RabbitMQ** or **Kafka** | Overkill. Redis + BullMQ already installed. |
| **TypeORM** or **Prisma** | Already using Drizzle ORM. |
| **Express** or **Fastify** | Next.js Route Handlers are sufficient. |
| **tRPC** | REST API with Zod is simpler for public license validation. |
| **Event sourcing libraries** | Custom EventEmitter + Redis Pub/Sub is sufficient. |
| **jsonwebtoken** | Better Auth handles JWT/session via jose dependency. |
| **bcrypt** / **bcryptjs** | Better Auth handles password hashing internally. |

---

## Integration with Existing Stack

### With PostgreSQL + Drizzle (v2.x)
```typescript
// New repository classes use existing db instance
import { db } from '@/lib/db';
import { licenses, licenseActivations } from '@/lib/db/schema';
```

### With Redis + BullMQ (v2.x)
```typescript
// Extend existing queues.ts
export const licenseExpirationQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.LICENSE_EXPIRATION, connectionOptions)
  : null;
```

### With Better Auth (v2.x)
```typescript
// License service checks user via Better Auth
const session = await auth.api.getSession({ headers });
const license = await licenseService.generateLicense({
  userId: session.user.id,
  // ...
});
```

---

## Migration from v2.x

### Schema Changes Required
1. **Remove external dependencies:**
   - Drop `centralOrderId` from `orders` table
   - Drop `centralLicenseId` from `licenses` table
   - Drop `centralUserId` from `user` table

2. **Add new licensing tables:**
   - `products`
   - `product_plans`
   - `product_versions`
   - `license_activations`

3. **Data migration:**
   - Migrate existing licenses to new activation tracking
   - Create product records from existing product references

---

## Sources

### Cryptography & License Keys
- [Node.js Crypto Module Documentation](https://nodejs.org/api/crypto.html) - Official documentation for HMAC, signing, verification (HIGH confidence)
- [How to Generate and Verify HMAC Signatures](https://www.authgear.com/post/generate-verify-hmac-signatures/) - HMAC implementation guide (MEDIUM confidence)
- [HMAC API Request Signing in Node.js](https://1xapi.com/blog/hmac-request-signing-api-authentication-nodejs-2026) - Production-ready patterns (MEDIUM confidence)
- [Build License Key Activation Server](https://www.sevensquaretech.com/license-key-validation-activation-server-reactjs-nodejs/) - Complete implementation example (MEDIUM confidence)

### Background Jobs
- [BullMQ.io Official Website](https://bullmq.io/) - Primary job queue library (HIGH confidence)
- [Building Scalable Background Jobs in Node.js with BullMQ](https://dev.to/asad_ahmed_5592ac0a7d0258/building-scalable-background-jobs-in-nodejs-with-bullmq-a-complete-guide-509p) - Implementation guide (MEDIUM confidence)
- [Reddit: Next.js background jobs discussion](https://www.reddit.com/r/nextjs/comments/1rv9bbs/nextjs_background_jobs_for_scraping_ai_generation/) - Community consensus on BullMQ + Redis (MEDIUM confidence)

### Event-Driven Architecture
- [node-ts/ddd GitHub](https://github.com/node-ts/ddd) - Domain-driven design framework reference (MEDIUM confidence)
- [Implementing Event-Driven Architecture in TypeScript](https://medium.com/@elijahbanjo/implementing-event-driven-architecture-in-typescript-with-node-js-and-express-eefecadaf95f) - Implementation patterns (MEDIUM confidence)
- [Understanding Event-driven Architecture with Node.js and TypeScript](https://javascript.plainenglish.io/event-driven-architecture-with-nodejs-and-typescript-d14208452321) - Architecture fundamentals (LOW confidence)

### WooCommerce License API Patterns
- [WC Key Manager Documentation](https://wckeymanager.com/docs/licensing-api/validating-a-key/) - License validation API patterns (MEDIUM confidence)
- [QuadLayers WooCommerce License Manager API](https://quadlayers.com/documentation/woocommerce-license-manager/developer/api/) - REST API reference (MEDIUM confidence)
- [WooCommerce API Manager Documentation](https://woocommerce.com/document/woocommerce-api-manager/) - Industry-standard patterns (MEDIUM confidence)

### Existing Stack
- package.json (verified all existing installations) - HIGH confidence
- src/lib/db/schema.ts (existing schema structure) - HIGH confidence
- src/jobs/queues.ts (existing BullMQ setup) - HIGH confidence

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Core Cryptography (Node.js crypto) | HIGH | Built-in module, official documentation, zero dependencies |
| License Key Pattern | MEDIUM | Based on industry standards (WooCommerce APIs) and HMAC best practices |
| Background Jobs (BullMQ extension) | HIGH | Already installed from v2.x, proven patterns |
| Event System (EventEmitter + Redis) | HIGH | EventEmitter is built-in, Redis Pub/Sub is standard feature |
| API Design (Route Handlers + Zod) | HIGH | Route Handlers built-in, Zod already present |
| Repository/Service Pattern | MEDIUM | Standard DDD patterns, implementation details to be refined |
| Database Schema | HIGH | Standard PostgreSQL with Drizzle ORM patterns |
| Migration Strategy | LOW-MEDIUM | Requires careful planning for existing data |

---

## Gaps Requiring Phase-Specific Research

1. **Exact license key format** - Segments length, signature format, character set
2. **Webhook signature scheme** - HMAC format for external webhook verification
3. **Domain activation validation** - How to normalize and validate domain names
4. **License migration strategy** - How to handle existing licenses during v2.x to v3.0 migration
5. **Secret key management** - How to store and rotate license signing secrets
6. **Public API authentication** - API token scheme for external license validation
7. **Rate limiting for public API** - Prevent abuse of license validation endpoints

---

*Research completed: 2026-05-29. Stack additions minimized to 0-2 packages optional.*
