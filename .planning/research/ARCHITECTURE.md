# Architecture Patterns

**Domain:** Self-Contained Licensing System for ConversionFlow v3.0
**Researched:** 2026-05-29
**Overall confidence:** HIGH

## Executive Summary

The v3.0 self-contained licensing system requires a significant architectural refactoring from the current v2.1 architecture that depends on an external licensing API at `license.devsroom.com`. The research reveals that a **Modular Monolith architecture with Domain-Driven Design (DDD) principles** provides the optimal balance between maintainability and scalability for this transition. This architecture organizes code into **bounded contexts** (Licensing, Billing, Customers, Products, Analytics) that communicate through **domain events**, with business logic abstracted into a **Service Layer** and data access through the **Repository Pattern**. The existing PostgreSQL + Drizzle ORM + Redis infrastructure already supports these patterns, making the transition feasible without infrastructure changes.

## Key Findings

**Stack:** Leveraging existing PostgreSQL, Drizzle ORM, Redis (ioredis), BullMQ - no new infrastructure dependencies needed for DDD implementation
**Architecture:** Modular Monolith with DDD bounded contexts - allows future microservice extraction while maintaining single-instance deployment simplicity
**Critical integration points:** The current `central-api.ts` client and webhook handlers need to be replaced with internal domain services and event handlers
**Background jobs:** BullMQ already integrated - needs expansion for license expiration checks and renewal reminders

## Recommended Architecture

### Modular Monolith with DDD Bounded Contexts

**What:** A single deployable application organized into isolated modules (bounded contexts) that communicate through well-defined interfaces and domain events. Each module owns its domain logic, database schema, and API contracts.

**Why:**
- Maintains deployment simplicity (single Next.js application)
- Allows clear separation of concerns (Licensing domain, Billing domain, Customer domain)
- Enables future extraction to microservices if needed
- Reduces coupling between business capabilities
- Aligns with DDD principles for complex business domains

**Bounded Contexts for ConversionFlow v3.0:**

```
src/
├── modules/
│   ├── licensing/              # Licensing Bounded Context
│   │   ├── domain/             # Domain models, value objects, domain events
│   │   │   ├── entities/       # License, Activation, Product, Plan
│   │   │   ├── value-objects/  # LicenseKey, ExpirationDate, ActivationDomain
│   │   │   ├── events/         # LicenseCreated, LicenseActivated, LicenseExpired
│   │   │   └── services/       # LicenseGenerationService, LicenseValidationService
│   │   ├── application/        # Use cases, application services
│   │   │   ├── commands/       # GenerateLicenseCommand, ActivateLicenseCommand
│   │   │   ├── queries/        # GetLicenseQuery, ValidateLicenseQuery
│   │   │   └── handlers/       # Command handlers, query handlers
│   │   ├── infrastructure/     # Repository implementations, external integrations
│   │   │   ├── repositories/   # LicenseRepository, ActivationRepository
│   │   │   └── events/         # Event publishers, subscribers
│   │   └── api/                # Context-specific API routes
│   │       └── routes/         # Public license validation endpoints
│   │
│   ├── billing/                # Billing Bounded Context
│   │   ├── domain/             # Order, Payment, Invoice, Coupon
│   │   ├── application/        # CreateOrderUseCase, ProcessPaymentUseCase
│   │   ├── infrastructure/     # Payment gateway integrations
│   │   └── api/                # Billing API routes
│   │
│   ├── customers/              # Customer Bounded Context
│   │   ├── domain/             # Customer, Profile, Preferences
│   │   ├── application/        # GetCustomerUseCase, UpdateProfileUseCase
│   │   ├── infrastructure/     # CustomerRepository
│   │   └── api/                # Customer API routes
│   │
│   ├── products/               # Product Bounded Context
│   │   ├── domain/             # Product, Version, Plan, Download
│   │   ├── application/        # GetProductUseCase, CreateVersionUseCase
│   │   ├── infrastructure/     # ProductRepository
│   │   └── api/                # Product API routes
│   │
│   └── analytics/              # Analytics Bounded Context
│       ├── domain/             # Metrics, Reports, Aggregates
│       ├── application/        # CalculateRevenueUseCase, GetChurnMetricsUseCase
│       ├── infrastructure/     # Query builders, caching
│       └── api/                # Analytics API routes
│
├── shared/                     # Shared kernel (utilities, types that don't belong to any context)
│   ├── domain/                 # Shared value objects (Money, Email, Uuid)
│   ├── infrastructure/         # Database connection, Redis client, event bus
│   └── api/                    # Shared API utilities
│
└── app/                        # Next.js App Router (thin layer, delegates to modules)
    ├── (portal)/               # Customer portal (uses licensing, billing, customers modules)
    ├── (admin)/                # Admin dashboard (uses all modules)
    └── api/                    # API gateway (routes to module-specific handlers)
```

### Component Boundaries

| Bounded Context | Responsibility | Communicates With |
|----------------|----------------|-------------------|
| **Licensing** | License generation, validation, activation, expiration, revocation | Billing (on order completion), Customers (for user data), Products (for plan rules) |
| **Billing** | Order processing, payment handling, invoice generation, coupon management | Licensing (to generate licenses), Customers (for billing info) |
| **Customers** | Customer profiles, account management, activity tracking | Billing (for billing history), Licensing (for licenses) |
| **Products** | Product catalog, version management, plan configuration, downloads | Licensing (for licensing rules), Billing (for pricing) |
| **Analytics** | Revenue metrics, license analytics, customer growth, performance tracking | All contexts (read-only, aggregates data) |

### Data Flow

**Request Flow (License Generation):**

```
[Customer submits checkout]
    |
    v
[Billing Context] CreateOrderUseCase
    |-- Validates coupon
    |-- Calculates tax
    |-- Creates order (pending)
    |
    v
[Payment Gateway] Customer pays
    |
    v
[Billing Context] ProcessPaymentUseCase
    |-- Updates order (completed)
    |-- Publishes OrderCompleted event
    |
    v
[Event Bus] OrderCompleted event
    |
    v
[Licensing Context] OrderCompleted event handler
    |-- Generates license key (local algorithm)
    |-- Creates license record
    |-- Publishes LicenseCreated event
    |
    v
[Notification Service] LicenseCreated event handler
    |-- Sends confirmation email
    |-- Creates notification
```

**License Validation Flow (Public API):**

```
[WordPress plugin calls license validation API]
    |
    v
[Licensing Context] ValidateLicenseQuery
    |-- LicenseRepository.findByKey(licenseKey)
    |-- Checks status (active, expired, revoked, suspended)
    |-- Checks activation limits
    |-- Checks domain binding
    |-- Returns validation result
    |
    v
[API Response] { valid: boolean, payload: {...} }
```

## Patterns to Follow

### Pattern 1: Repository Pattern for Data Access

**What:** Abstract database access behind repository interfaces. Each bounded context has its own repositories that encapsulate data access logic.

**When:** Use for all database operations. Never query directly from application services.

**Example:**

```typescript
// modules/licensing/infrastructure/repositories/LicenseRepository.ts
import { db } from "@/shared/infrastructure/db";
import { licenses } from "@/shared/infrastructure/db/schema";
import { eq, and } from "drizzle-orm";
import type { License } from "../../domain/entities/License";

export interface ILicenseRepository {
  findById(id: string): Promise<License | null>;
  findByKey(key: string): Promise<License | null>;
  findByUserId(userId: string): Promise<License[]>;
  save(license: License): Promise<License>;
  delete(id: string): Promise<void>;
}

export class LicenseRepository implements ILicenseRepository {
  async findById(id: string): Promise<License | null> {
    const result = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, id))
      .limit(1);
    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByKey(key: string): Promise<License | null> {
    const result = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, key))
      .limit(1);
    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async save(license: License): Promise<License> {
    const [result] = await db
      .insert(licenses)
      .values({
        userId: license.userId,
        licenseKey: license.key.value(),
        productId: license.productId,
        plan: license.plan,
        status: license.status,
        activationDomains: license.domains,
        maxActivations: license.maxActivations,
        currentActivations: license.currentActivations,
        expiresAt: license.expiresAt,
      })
      .returning();
    return this.mapToEntity(result);
  }

  private mapToEntity(row: any): License {
    return License.create({
      id: row.id,
      userId: row.userId,
      key: LicenseKey.create(row.licenseKey),
      productId: row.productId,
      plan: row.plan,
      status: row.status,
      domains: row.activationDomains || [],
      maxActivations: row.maxActivations,
      currentActivations: row.currentActivations,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
```

### Pattern 2: Service Layer for Business Logic

**What:** Application services coordinate use cases by orchestrating domain objects and repositories. They contain business logic that doesn't naturally fit within a single domain entity.

**When:** Use for use cases that involve multiple domain objects or external integrations.

**Example:**

```typescript
// modules/licensing/application/services/LicenseGenerationService.ts
import type { ILicenseRepository } from "../../infrastructure/repositories/LicenseRepository";
import type { IProductRepository } from "../../../products/infrastructure/repositories/ProductRepository";
import { License } from "../../domain/entities/License";
import { LicenseKey } from "../../domain/value-objects/LicenseKey";
import { LicenseCreatedEvent } from "../../domain/events/LicenseCreatedEvent";

export class LicenseGenerationService {
  constructor(
    private licenseRepo: ILicenseRepository,
    private productRepo: IProductRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async generateForOrder(command: GenerateLicenseForOrderCommand): Promise<License> {
    // 1. Get product to determine activation limits
    const product = await this.productRepo.findById(command.productId);
    if (!product) {
      throw new Error(`Product not found: ${command.productId}`);
    }

    const planConfig = product.getPlanConfig(command.plan);
    
    // 2. Generate license key using local algorithm
    const licenseKey = LicenseKey.generate({
      productId: product.id,
      plan: command.plan,
      timestamp: Date.now(),
    });

    // 3. Create license entity
    const license = License.create({
      userId: command.userId,
      orderId: command.orderId,
      productId: product.id,
      plan: command.plan,
      key: licenseKey,
      status: "active",
      maxActivations: planConfig.maxActivations,
      currentActivations: 0,
      domains: [],
      expiresAt: planConfig.lifetime ? null : this.calculateExpiration(planConfig.duration),
    });

    // 4. Save license
    const savedLicense = await this.licenseRepo.save(license);

    // 5. Publish domain event
    await this.eventPublisher.publish(
      new LicenseCreatedEvent({
        licenseId: savedLicense.id,
        userId: command.userId,
        orderId: command.orderId,
        licenseKey: licenseKey.value(),
        productId: product.id,
        plan: command.plan,
      })
    );

    return savedLicense;
  }

  private calculateExpiration(duration: number): Date {
    return new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // days to ms
  }
}
```

### Pattern 3: Domain Events for Decoupling

**What:** Domain events represent something that happened in the domain that other parts of the system may be interested in. Events are published and subscribed to asynchronously.

**When:** Use for cross-context communication (e.g., order completion triggers license generation).

**Example:**

```typescript
// modules/licensing/domain/events/LicenseCreatedEvent.ts
export class LicenseCreatedEvent extends DomainEvent {
  constructor(
    public readonly data: {
      licenseId: string;
      userId: string;
      orderId: string;
      licenseKey: string;
      productId: string;
      plan: string;
    }
  ) {
    super("LicenseCreated", data.licenseId);
  }
}

// shared/infrastructure/events/InMemoryEventBus.ts
import { EventEmitter } from "events";

export class InMemoryEventBus implements IEventPublisher, IEventSubscriber {
  private emitter = new EventEmitter();

  async publish(event: DomainEvent): Promise<void> {
    this.emitter.emit(event.eventType, event);
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.emitter.on(eventType, handler);
  }
}

// modules/billing/application/handlers/LicenseCreatedHandler.ts
export class LicenseCreatedHandler {
  async handle(event: LicenseCreatedEvent): Promise<void> {
    // Update order with license reference
    await this.orderRepo.updateLicenseId(
      event.data.orderId,
      event.data.licenseId
    );

    // Send notification
    await this.notificationService.sendLicenseActivated({
      userId: event.data.userId,
      licenseKey: event.data.licenseKey,
    });
  }
}
```

### Pattern 4: Background Jobs with BullMQ

**What:** Recurring and delayed tasks run in background workers using BullMQ queues backed by Redis.

**When:** Use for license expiration checks, renewal reminders, scheduled analytics reports.

**Example:**

```typescript
// jobs/workers/license-worker.ts
import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Check for expiring licenses (runs daily)
const checkExpiringLicenses = async (job: Job) => {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const expiringLicenses = await db
    .select()
    .from(licenses)
    .where(
      and(
        eq(licenses.status, "active"),
        // Expires within 30 days, has not been notified
        // ...additional conditions
      )
    );

  for (const license of expiringLicenses) {
    // Queue renewal reminder email
    await emailQueue.add("renewal-reminder", {
      userId: license.userId,
      licenseId: license.id,
      licenseKey: license.licenseKey,
      expiresAt: license.expiresAt,
    });
  }

  return { processed: expiringLicenses.length };
};

// Create worker
const licenseWorker = new Worker("license-jobs", async (job) => {
  if (job.name === "check-expiring") {
    return await checkExpiringLicenses(job);
  }
}, { connection: redisConnection });

// Scheduler in queues.ts
export const scheduleLicenseJobs = async () => {
  await licenseQueue.add(
    "check-expiring",
    {},
    {
      repeat: { pattern: "0 9 * * *" }, // Daily at 9 AM
    }
  );
};
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Database Queries from API Routes

**What:** Querying the database directly from Next.js API routes or server actions without repository abstraction.

**Why bad:** Ties API to database schema, makes testing difficult, violates separation of concerns.

**Instead:** API routes delegate to application services, which use repositories for data access.

### Anti-Pattern 2: Domain Logic in Controllers

**What:** Putting business logic (license validation rules, activation limit enforcement) in API route handlers.

**Why bad:** Violates single responsibility, makes logic hard to reuse, difficult to test.

**Instead:** Business logic lives in domain entities and application services. Controllers are thin.

### Anti-Pattern 3: Tight Coupling Between Contexts

**What:** Billing context directly calling Licensing context's internal functions.

**Why bad:** Defeats the purpose of bounded contexts, creates spaghetti dependencies.

**Instead:** Use domain events for cross-context communication. Billing publishes `OrderCompleted`, Licensing subscribes and generates license.

### Anti-Pattern 4: Anemic Domain Models

**What:** Domain entities with only getters/setters, no business logic (data transfer objects).

**Why bad:** Business logic ends up in services or controllers, violating encapsulation.

**Instead:** Rich domain models with behavior. `License.activate(domain)` should enforce activation limits internally.

## Scalability Considerations

| Concern | At 500 licenses | At 10K licenses | At 100K licenses |
|---------|----------------|-----------------|------------------|
| License validation queries | Direct DB queries fine | Add Redis caching for active licenses | Dedicated read replica for validation, cache warming |
| Domain activation checks | In-memory counter | Redis counters per license | Redis cluster, sharded by license prefix |
| Expiration batch jobs | Single worker, daily run | Single worker, daily run | Multiple workers, sharded by expiration date |
| Event handling | In-memory event bus | In-memory event bus fine | Redis Streams or RabbitMQ for reliability |

### Scaling Priorities

1. **First bottleneck:** License validation API calls. Mitigate with Redis caching of active licenses from day one.
2. **Second bottleneck:** Background job processing for expiration checks. Mitigate with BullMQ job batching.
3. **Third bottleneck:** Event bus reliability. Consider Redis Streams for guaranteed delivery.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Payment Gateways (SSL Commerz, bKash, etc.) | Service Layer abstraction | Existing `checkout.ts` actions become Billing Context services |
| Email Service (Resend/Ses) | Domain event handlers | LicenseCreated, OrderCompleted events trigger emails |
| Redis (caching, queues) | Infrastructure layer | Shared across all bounded contexts |

### Internal Boundaries (New for v3.0)

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Billing <-> Licensing | Domain events (OrderCompleted) | Billing publishes, Licensing subscribes |
| Licensing <-> Customers | Repository queries (user lookup) | Licensing queries Customer repository |
| Products <-> All Contexts | Repository queries (read-only) | All contexts read product/plan configuration |
| Analytics <-> All Contexts | Event subscriptions (read-only) | Analytics subscribes to all events for aggregation |

## Build Order (Dependency Chain)

```
Phase 1: Shared Infrastructure
├── Database connection and migration setup
├── Redis client and BullMQ queues
├── Event bus implementation
├── Shared value objects (Money, Email, Uuid)
└── Repository base interfaces

Phase 2: Products Bounded Context
├── Product domain entities
├── Product repository
├── Product application services
├── Product API routes
└── Seed data (existing products)

Phase 3: Customers Bounded Context
├── Customer domain entities
├── Customer repository (wraps existing Better Auth user table)
├── Customer application services
└── Customer API routes

Phase 4: Licensing Bounded Context (Core for v3.0)
├── License domain entities and value objects
├── License generation algorithm (local, replaces central API)
├── License validation service
├── License repository
├── License application services
├── License events and handlers
├── Public license validation API
└── Background jobs (expiration checks)

Phase 5: Billing Bounded Context
├── Refactor existing checkout.ts actions to Billing services
├── Order domain entities
├── Payment processing services
├── Invoice generation
├── Billing repository
├── Integration with Licensing context (via events)
└── Billing API routes

Phase 6: Analytics Bounded Context
├── Analytics domain (metrics, aggregations)
├── Query services for BI dashboard
├── Event subscriptions for data collection
├── Caching layer for expensive queries
└── Analytics API routes

Phase 7: Cleanup
├── Remove central-api.ts client
├── Remove centralOrderId, centralLicenseId, centralUserId fields
├── Remove webhook handlers for central API
└── Update admin dashboard to use new services
```

**Key dependency:** Shared infrastructure (Phase 1) must be complete before any bounded context implementation. Products (Phase 2) and Customers (Phase 3) are foundational. Licensing (Phase 4) is the core of v3.0. Billing (Phase 5) depends on Licensing. Analytics (Phase 6) depends on all other contexts.

## Architecture Decision Records

### ADR-1: Modular Monolith over Microservices

**Decision:** Implement licensing as bounded contexts within a single monolith, not as separate microservices.

**Context:** Need to maintain self-hosted VPS deployment simplicity while preparing for future scaling. Microservices add operational complexity (multiple deployments, inter-service communication).

**Consequence:** Single Next.js application with clear module boundaries. Can extract to microservices later if needed without major refactoring.

### ADR-2: Domain Events over Direct Service Calls

**Decision:** Bounded contexts communicate via domain events, not direct function calls.

**Context:** Need loose coupling between Billing and Licensing. Direct calls create circular dependencies and tight coupling.

**Consequence:** Event-driven architecture with in-memory event bus. Events can be persisted to Redis Streams for reliability if needed.

### ADR-3: Local License Generation over External API

**Decision:** Generate license keys locally using a deterministic algorithm, not by calling an external API.

**Context:** v3.0 requirement is self-contained licensing. External API (license.devsroom.com) is being removed.

**Consequence:** Need to implement a secure license key generation algorithm. License keys remain valid even if the system is reinstalled (same algorithm + same seed = same key for same order).

### ADR-4: Repository Pattern over Direct Drizzle Queries

**Decision:** All database access goes through repository interfaces, not direct Drizzle queries scattered across the codebase.

**Context:** Need testability and clear separation between data access and business logic. Direct queries create tight coupling to schema.

**Consequence:** More boilerplate code but better testability, clearer architecture, easier to swap implementations.

## Sources

- **Modular Monolith with DDD** - Medium article: "Modular Monoliths, DDD and Package Structure" by Kamil Toszek -- HIGH confidence
- **Modular Monolith GitHub Repository** - kgrzybek/modular-monolith-with-ddd (.NET reference, patterns are language-agnostic) -- HIGH confidence  
- **WordPress License Key Algorithms** - Vollstart, Keyforge.dev guides on plugin licensing systems -- MEDIUM confidence
- **Event-Driven Architecture** - SAP documentation on EDA integration models, Azure deep dive on license renewal events -- MEDIUM confidence
- **Next.js Service Layer Pattern** - GitHub: ugurkellecioglu/nextjs-service-layer-pattern, nikolovlazar/nextjs-clean-architecture -- HIGH confidence
- **Repository Pattern with Drizzle** - Community patterns and general architecture principles -- HIGH confidence (based on existing codebase and Drizzle ORM capabilities)
- **BullMQ Background Jobs** - Official BullMQ documentation (referenced via research summary due to rate limit) -- HIGH confidence (library already in use)
- **Existing Codebase Analysis** - src/lib/db/schema.ts, src/lib/central-api.ts, src/app/(admin)/actions/admin-orders.ts, src/app/(portal)/actions/checkout.ts -- HIGH confidence (direct code analysis)

---
*Architecture research for: ConversionFlow v3.0 Self-Contained Licensing System*
*Researched: 2026-05-29*
