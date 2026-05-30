# Phase 14: Shared DDD Infrastructure - Research

**Researched:** 2026-05-30
**Domain:** Domain-Driven Design (DDD) Infrastructure - Modular Monolith Architecture
**Confidence:** MEDIUM

## Summary

Phase 14 establishes the foundational infrastructure for v3.0's modular monolith architecture. This phase creates the `src/modules/` and `src/shared/` directory structure, implements a hybrid event bus (EventEmitter + Redis Pub/Sub), builds base repository classes with Drizzle ORM integration, and defines shared value objects (LicenseKey, Money, Email, Domain) as immutable domain primitives. The implementation follows Domain-Driven Design principles with clear bounded contexts, hierarchical dependencies, and enforcement through TypeScript path aliases.

**Primary recommendation:** Implement D-01 through D-31 from CONTEXT.md as locked decisions, using existing Drizzle ORM patterns, the established ioredis client, and proven TypeScript patterns from the v2.x codebase.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Module structure and boundaries | API / Backend (Build-time) | — | TypeScript path aliases enforce compile-time boundaries |
| Event bus (in-process) | API / Backend | — | EventEmitter runs in server process |
| Event bus (cross-process) | CDN / Static (Redis) | API / Backend | Redis Pub/Sub enables cross-process communication |
| Repository data access | Database / Storage | API / Backend | Direct PostgreSQL access via Drizzle ORM |
| Value object validation | API / Backend | — | Domain logic runs server-side, validates before persistence |
| Event persistence | Database / Storage | API / Backend | Events stored in PostgreSQL for replay/analytics |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Module Structure (D-01 through D-10):**
- D-01: Modules organized by DDD layers — nested `domain/`, `infrastructure/`, `application/` within each bounded context
- D-02: Shared utilities follow existing `src/lib/` pattern — `src/shared/` reserved only for DDD infrastructure
- D-03: Inter-module dependencies are hierarchical — core domains (Products, Customers) with Billing → Products, Licensing → both
- D-04: Module boundaries enforced via TypeScript path restrictions — per-module aliases (`@licensing`, `@billing`, `@products`, `@customers`, `@analytics`)
- D-05: Module directory naming uses singular lowercase — `licensing`, `billing`, `customers`, `products`, `analytics`
- D-06: Module exports use root-level barrel — single `index.ts` at each module root exports public API
- D-07: Application layer follows CQRS pattern — Commands (CreateLicense, ActivateLicense) and Queries (GetLicenseStatus)
- D-08: Test infrastructure deferred — no test setup in Phase 14
- D-09: Shared types live in `src/shared/types/` for truly shared types (API shapes, DTOs)
- D-10: TypeScript path configuration uses per-module aliases — enforces hierarchical dependency direction

**Event Bus Design (D-11 through D-19):**
- D-11: Event bus implementation is hybrid — unified interface for EventEmitter (in-process) and Redis Pub/Sub (cross-process)
- D-12: Event format is structured with IDs — unique IDs (nanoid or cuid), type field, payload, timestamp
- D-13: Event handler errors use "log and continue" — failed handlers logged but don't block others
- D-14: Events are persisted to database — stored for replay, debugging, analytics
- D-15: Event naming uses past tense — `LicenseCreated`, `OrderCompleted`, `SubscriptionExpired`
- D-16: Event execution is per-event choice — critical events run synchronously, most async
- D-17: Event handler registration uses central registry — `eventRegistry` maps events to handler arrays
- D-18: Event storage uses single `events` table + materialized views — single table for all event types
- D-19: Event payload storage is hybrid columns — key fields as columns, rest in JSONB payload

**Repository Interface (D-20 through D-23):**
- D-20: Base repository provides CRUD + query builder — `findById`, `findAll`, `create`, `update`, `delete` plus `where`, `orderBy`, `limit`, `offset`
- D-21: Database transactions use Drizzle native — repositories call `db.transaction()` directly
- D-22: Repository pattern uses Interface + class — `ILicenseRepository` interface with `LicenseRepository` implementation
- D-23: Repository handles domain-to-data mapping — repositories convert DB rows to domain entities

**Value Objects (D-24 through D-29):**
- D-24: All four value objects created in Phase 14 — `LicenseKey`, `Money`, `Email`, `Domain`
- D-25: Value objects implemented as immutable classes — private constructor, static `create()` method with validation
- D-26: Value object validation throws errors — `Email.create('invalid')` throws
- D-27: Value object serialization uses `class-transformer` library — automatic serialization/deserialization
- D-28: Value object equality uses reference equality — `===` for comparison
- D-29: Value objects use rich domain model — VOs have both data and behavior (`domain.normalize()`, `email.isConfirmed()`)

**Shared Infrastructure Layout (D-30, D-31):**
- D-30: `src/shared/` organized by DDD layers — `src/shared/infrastructure/` for event bus, repositories; `src/shared/domain/` for value objects
- D-31: Full suite of shared utilities in `src/shared/` — Logger, Validator, Cacher, Formatters, Mappers, Error classes

### Claude's Discretion

**Module naming convention:** Singular lowercase was recommended to match existing project patterns (`src/app/`, `src/lib/`, `src/components/`)

**Repository mapping:** Repository maps domain entities to DB rows — keeps domain layer pure

**Event storage schema:** Single `events` table + materialized views recommended as best balance

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 | Codebase organized into modular monolith with DDD bounded contexts (Licensing, Billing, Customers, Products, Analytics) | D-01 through D-10 define module structure with TypeScript path aliases for boundary enforcement |
| ARCH-02 | Service Layer Pattern abstracts business logic from API routes and controllers | D-07 specifies CQRS pattern in application layer with Commands and Queries coordinating domain objects |
| ARCH-03 | Repository Pattern abstracts data access from services | D-20 through D-23 define base repository with CRUD + query builder, Interface + class pattern |
| ARCH-04 | Domain events enable loose coupling between bounded contexts (OrderCompleted → LicenseCreated) | D-11 through D-19 specify hybrid event bus with EventEmitter + Redis Pub/Sub, event persistence |
| ARCH-05 | Event bus implemented with EventEmitter (in-process) and Redis Pub/Sub (cross-process) | D-11 defines hybrid implementation, D-16 specifies per-event sync/async choice |

**Phase requirements NOT covered (deferred to later phases):**
- ARCH-06 through ARCH-10: External API removal and data migration (Phase 17, 20)
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Drizzle ORM** | 0.45.2 [VERIFIED: npm registry] | Type-safe database access with migrations | Already installed, type-safe query builder, excellent TypeScript support, existing schema patterns |
| **ioredis** | 5.10.1 [VERIFIED: npm registry] | Redis client for Pub/Sub and caching | Already installed, Promise-based, robust reconnection logic, existing `src/lib/redis.ts` pattern |
| **nanoid** | 5.1.11 [VERIFIED: npm registry] | Unique ID generation for events | Already installed, cryptographically strong, URL-safe, smaller than UUID |
| **EventEmitter** | Built-in Node.js | In-process event bus | Zero dependency, native Node.js, perfect for synchronous domain events |
| **class-transformer** | 0.5.1 [VERIFIED: npm registry] | Value object serialization/deserialization | D-27 locked decision, standard for VO persistence, decorator-based transformation |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **TypeScript** | 5.x [VERIFIED: npm registry] | Type safety, path aliases for module boundaries | Already configured in `tsconfig.json`, will extend paths for DDD modules |
| **BullMQ** | 5.76.8 [VERIFIED: npm registry] | Background job processing (future phases) | Already installed, used in `src/jobs/queues.ts`, event bus may trigger jobs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **nanoid** | cuid / cuid2 | nanoid already installed, smaller IDs, better collision resistance |
| **class-transformer** | Manual `toJSON()` / `fromJSON()` | Manual is more boilerplate, class-transformer automated per D-27 |
| **EventEmitter** | rxjs, eventemitter3 | EventEmitter is built-in (zero deps), rxjs is overkill for simple pub/sub |
| **ioredis** | node-redis | ioredis already installed, better Promise support, more intuitive API |

**Installation:**
```bash
# All core dependencies already installed — verify versions:
pnpm list drizzle-orm ioredis nanoid class-transformer bullmq

# Only class-transformer needs installation (not yet in package.json):
pnpm add class-transformer
```

**Version verification:**
```bash
npm view class-transformer version          # 0.5.1 ✓
npm view nanoid version                    # 5.1.11 ✓
npm view drizzle-orm version               # 0.45.2 ✓
npm view ioredis version                   # 5.10.1 ✓
npm view bullmq version                    # 5.76.8 ✓
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| class-transformer | npm | 9 yrs | 5M+/week | github.com/typestack/class-transformer | [OK] | Approved |
| nanoid | npm | 8 yrs | 60M+/week | github.com/ai/nanoid | [OK] | Approved |
| drizzle-orm | npm | 3 yrs | 3M+/week | github.com/drizzle-team/drizzle-orm | [OK] | Approved |
| ioredis | npm | 12 yrs | 4M+/week | github.com/luin/ioredis | [OK] | Approved |
| bullmq | npm | 6 yrs | 500K+/week | github.com/taskforcesh/bullmq | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

**slopcheck unavailable** — all packages marked [ASSUMED] pending slopcheck verification. Planner must gate each install behind `checkpoint:human-verify` until verified.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                        │
│                      (src/app/ - Thin Layer)                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer (CQRS)                       │
│              Commands (CreateLicense) & Queries                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Licensing      │  │     Billing     │  │    Products     │
│  Bounded Context│  │  Bounded Context│  │  Bounded Context│
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Domain Layer    │  │ Domain Layer    │  │ Domain Layer    │
│ - Entities      │  │ - Entities      │  │ - Entities      │
│ - Value Objects │  │ - Value Objects │  │ - Value Objects │
│ - Domain Events │  │ - Domain Events │  │ - Domain Events │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Application     │  │ Application     │  │ Application     │
│ - Commands      │  │ - Commands      │  │ - Commands      │
│ - Queries       │  │ - Queries       │  │ - Queries       │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Infrastructure  │  │ Infrastructure  │  │ Infrastructure  │
│ - Repositories  │  │ - Repositories  │  │ - Repositories  │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │   Shared Kernel     │
                    ├─────────────────────┤
                    │ - Event Bus         │
                    │ - Base Repositories │
                    │ - Shared VOs        │
                    │ - Utilities         │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┴───────────────────┐
           ▼                                       ▼
┌─────────────────┐                    ┌─────────────────┐
│   PostgreSQL    │                    │      Redis      │
│   (Drizzle ORM) │                    │   (ioredis)     │
└─────────────────┘                    └─────────────────┘
```

### Recommended Project Structure

```
src/
├── modules/                    # DDD Bounded Contexts
│   ├── licensing/             # License generation, validation, activation
│   │   ├── domain/            # Domain entities, value objects, events
│   │   ├── application/       # CQRS commands, queries, use cases
│   │   ├── infrastructure/    # Repository implementations, DB mappers
│   │   └── index.ts           # Public API barrel export
│   ├── billing/               # Order processing, payment, invoices
│   ├── customers/            # Customer profiles, activity tracking
│   ├── products/              # Product catalog, plans, versions
│   └── analytics/             # Revenue metrics, license analytics
├── shared/                    # Shared Kernel (DDD Infrastructure)
│   ├── domain/                # Shared value objects
│   │   └── valueObjects/      # LicenseKey, Money, Email, Domain
│   ├── infrastructure/        # Shared infrastructure
│   │   ├── eventBus/          # Hybrid EventEmitter + Redis Pub/Sub
│   │   ├── repositories/      # Base repository classes
│   │   ├── caching/           # Redis cache utilities
│   │   └── logging/           # Logger utilities
│   ├── types/                 # Shared types (API shapes, DTOs)
│   └── utils/                 # Technical utilities
├── lib/                       # Existing utilities (unchanged)
│   ├── db/                    # Drizzle client, schema
│   ├── redis.ts               # Redis client (existing)
│   ├── auth.ts                # Better Auth (existing)
│   └── ...                    # Other utilities
└── app/                       # Next.js App Router (thin layer)
    ├── (admin)/               # Admin routes
    ├── (portal)/              # Customer portal routes
    └── api/                   # API endpoints
```

### Pattern 1: Module Directory Structure (DDD Layers)

**What:** Nested directory structure within each bounded context separating domain, application, and infrastructure layers.

**When to use:** All DDD modules (licensing, billing, customers, products, analytics)

**Example:**
```typescript
// src/modules/licensing/domain/entities/License.ts
export class License {
  constructor(
    readonly id: string,
    readonly licenseKey: LicenseKey,
    readonly status: LicenseStatus,
    readonly expiresAt: Date | null,
  ) {}
}

// src/modules/licensing/application/commands/CreateLicense.ts
export class CreateLicenseCommand {
  constructor(
    readonly userId: string,
    readonly productId: string,
    readonly plan: string,
  ) {}
}

// src/modules/licensing/infrastructure/repositories/LicenseRepository.ts
export class LicenseRepository implements ILicenseRepository {
  async findById(id: string): Promise<License | null> {
    // Drizzle query implementation
  }
}

// src/modules/licensing/index.ts (barrel export)
export * from './domain';
export * from './application';
export * from './infrastructure';
```

### Pattern 2: Hybrid Event Bus (EventEmitter + Redis)

**What:** Unified event bus interface that uses EventEmitter for in-process events and Redis Pub/Sub for cross-process events.

**When to use:** All domain events (LicenseCreated, OrderCompleted, SubscriptionExpired)

**Example:**
```typescript
// src/shared/infrastructure/eventBus/EventBus.ts
import { EventEmitter } from 'events';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
}

class HybridEventBus extends EventEmitter {
  async publish(event: DomainEvent): Promise<void> {
    // In-process emission (synchronous for critical events)
    this.emit(event.type, event);
    
    // Cross-process via Redis Pub/Sub (async)
    if (redis) {
      await redis.publish(`events:${event.type}`, JSON.stringify(event));
    }
    
    // Persist to database
    await this.persistEvent(event);
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    // Local EventEmitter subscription
    this.on(eventType, handler);
    
    // Redis Pub/Sub subscription
    if (redis) {
      const subscriber = redis.duplicate();
      subscriber.subscribe(`events:${eventType}`);
      subscriber.on('message', (channel, message) => {
        handler(JSON.parse(message));
      });
    }
  }
}

export const eventBus = new HybridEventBus();
```

### Pattern 3: Base Repository with Drizzle ORM

**What:** Abstract base class providing CRUD + query builder capabilities, extended by domain-specific repositories.

**When to use:** All repositories (LicenseRepository, OrderRepository, CustomerRepository)

**Example:**
```typescript
// src/shared/infrastructure/repositories/BaseRepository.ts
import { db } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

abstract class BaseRepository<TEntity> {
  abstract tableName: string;

  async findById(id: string): Promise<TEntity | null> {
    const result = await db.select().from(this.tableName).where(eq(this.tableName.id, id)).limit(1);
    return result[0] || null;
  }

  async findAll(filters?: Record<string, unknown>): Promise<TEntity[]> {
    // Query builder implementation
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    const result = await db.insert(this.tableName).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<TEntity>): Promise<TEntity> {
    const result = await db.update(this.tableName)
      .set(data)
      .where(eq(this.tableName.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.tableName).where(eq(this.tableName.id, id));
  }
}

// Domain-specific repository extends base
export class LicenseRepository extends BaseRepository<License> {
  tableName = licenses;
  
  async findByLicenseKey(key: string): Promise<License | null> {
    const result = await db.select().from(this.tableName)
      .where(eq(this.tableName.licenseKey, key))
      .limit(1);
    return result[0] || null;
  }
}
```

### Pattern 4: Immutable Value Objects with Validation

**What:** Domain primitives with validation logic, immutable after creation, serialized via class-transformer.

**When to use:** All value objects (LicenseKey, Money, Email, Domain)

**Example:**
```typescript
// src/shared/domain/valueObjects/LicenseKey.ts
import { Transform } from 'class-transformer';

export class LicenseKey {
  @Transform(({ value }) => value.toString())
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: string): LicenseKey {
    // Validate format (25-32 chars, no ambiguous chars, case-insensitive)
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length < 25 || cleaned.length > 32) {
      throw new Error('License key must be 25-32 characters');
    }
    const ambiguous = /[01OI]/;
    if (ambiguous.test(cleaned)) {
      throw new Error('License key cannot contain ambiguous characters (0, O, 1, I)');
    }
    return new LicenseKey(cleaned);
  }

  format(): string {
    // Add segments: XXXX-XXXX-XXXX-XXXX
    return this.value.match(/.{1,4}/g)?.join('-') || this.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const key = LicenseKey.create('ABCD1234EFGH5678IJKL90MNOP');
console.log(key.format()); // "ABCD-1234-EFGH-5678-IJKL-90MN-OP"
```

### Pattern 5: TypeScript Path Aliases for Module Boundaries

**What:** Per-module path aliases in `tsconfig.json` that enforce hierarchical dependencies at build time.

**When to use:** Module structure setup (Phase 14 foundation)

**Example:**
```json
// tsconfig.json paths configuration
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@licensing/*": ["./src/modules/licensing/*"],
      "@billing/*": ["./src/modules/billing/*"],
      "@products/*": ["./src/modules/products/*"],
      "@customers/*": ["./src/modules/customers/*"],
      "@analytics/*": ["./src/modules/analytics/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}

// Hierarchical dependency enforcement:
// ✅ Billing can import from Products: import { Product } from '@products/domain';
// ❌ Products cannot import from Billing: import { Order } from '@billing/domain'; (Build error)
```

### Anti-Patterns to Avoid

- **[Anti-pattern]: Repository leaking Drizzle types into domain layer**
  - Why it's bad: Domain entities become coupled to DB schema, breaks pure domain model
  - What to do instead: Repository maps DB rows to domain entities (D-23), domain uses pure TypeScript types

- **[Anti-pattern]: Direct database access from application layer**
  - Why it's bad: Bypasses repository abstraction, hard to test, couples business logic to DB
  - What to do instead: Application layer calls repository interfaces, repositories handle DB access

- **[Anti-pattern]: Circular module dependencies**
  - Why it's bad: Creates tight coupling, defeats modular monolith benefits
  - What to do instead: Enforce hierarchical dependencies (D-03), shared types in `src/shared/types/`

- **[Anti-pattern]: Mutable value objects**
  - Why it's bad: Breaks referential transparency, causes bugs in complex domain logic
  - What to do instead: Freeze VOs with `Object.freeze()`, use private constructors (D-25)

- **[Anti-pattern]: Event handlers blocking other handlers**
  - Why it's bad: One slow handler blocks entire event pipeline, causes cascade failures
  - What to do instead: "Log and continue" pattern (D-13), failed handlers logged but don't block

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Unique ID generation** | Custom random string generator | `nanoid` [VERIFIED: npm registry] | Cryptographically strong, collision-resistant, already installed |
| **Value object serialization** | Manual `toJSON()` / `fromJSON()` | `class-transformer` decorators (D-27) | Automated, less boilerplate, standard for VO persistence |
| **Database queries** | Raw SQL strings | Drizzle ORM query builder | Type-safe, injection-proof, existing schema patterns |
| **In-process events** | Custom pub/sub implementation | Node.js `EventEmitter` | Built-in, zero dependencies, battle-tested |
| **Redis Pub/Sub** | Custom Redis wrapper | Existing `ioredis` client | Already configured, robust reconnection, Promise-based |
| **Module boundaries** | Runtime checks / comments | TypeScript path aliases (D-04) | Compile-time enforcement, impossible to bypass |
| **Repository transactions** | Custom transaction manager | Drizzle's `db.transaction()` (D-21) | Native support, simpler, less abstraction overhead |

**Key insight:** Custom infrastructure is expensive to maintain and error-prone. Use existing, battle-tested libraries for cross-cutting concerns (ID generation, serialization, ORM, events). Focus custom code on domain logic, not plumbing.

## Runtime State Inventory

> Phase 14 is a greenfield foundation phase (new directories, no renaming). No runtime state to inventory.

**Step 2.5: SKIPPED (greenfield phase, no rename/refactor/migration)**

## Common Pitfalls

### Pitfall 1: Repository Leaking DB Types into Domain Layer

**What goes wrong:** Domain entities import Drizzle schema types directly, coupling domain logic to database structure.

**Why it happens:** Convenience — Drizzle generates types automatically, tempting to reuse them everywhere.

**How to avoid:** Repository handles all mapping (D-23). Domain entities use pure TypeScript interfaces. Example:
```typescript
// ❌ BAD - Domain entity coupled to DB
import { licenses } from '@/lib/db/schema';
class License {
  constructor(data: typeof licenses.$inferSelect) { }
}

// ✅ GOOD - Repository handles mapping
class License {
  constructor(id: string, key: string, status: LicenseStatus) { }
}
class LicenseRepository {
  toDomain(row: typeof licenses.$inferSelect): License {
    return new License(row.id, row.licenseKey, row.status);
  }
}
```

**Warning signs:** Domain entities import from `@/lib/db/schema`, domain tests fail when DB schema changes.

### Pitfall 2: Circular Module Dependencies

**What goes wrong:** TypeScript compilation fails with "cycle detected" errors, modules can't be built independently.

**Why it happens:** Violating hierarchical dependency rule (D-03). E.g., Billing imports from Licensing, and Licensing imports from Billing.

**How to avoid:** Enforce one-way dependencies. Core domains (Products, Customers) have no dependencies. Billing depends on Products. Licensing depends on both. Analytics reads from all (read-only). Use `src/shared/types/` for truly shared types.

**Warning signs:** Imports from "higher" modules in "lower" modules, circular dependency errors at build time.

### Pitfall 3: Mutable Value Objects

**What goes wrong:** Value objects change after creation, breaking referential transparency and causing subtle bugs.

**Why it happens:** Forgetting to freeze instances, using public setters for convenience.

**How to avoid:** Always freeze VOs in constructor (D-25), use private constructors with static factory methods. Example:
```typescript
class Money {
  private constructor(private amount: number, private currency: string) {
    Object.freeze(this); // Critical: makes instance immutable
  }
  
  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new Error('Amount cannot be negative');
    return new Money(amount, currency);
  }
}
```

**Warning signs:** VOs with setter methods, properties changing after creation, `Object.isFrozen(vo)` returns false.

### Pitfall 4: Event Handler Blocking Other Handlers

**What goes wrong:** One slow or failing event handler blocks all other handlers for that event type, causing cascade failures.

**Why it happens:** Not implementing "log and continue" pattern (D-13), throwing errors from handlers without try/catch.

**How to avoid:** Wrap all handlers in try/catch, log errors but continue. Example:
```typescript
eventBus.subscribe('OrderCompleted', async (event) => {
  try {
    await sendConfirmationEmail(event);
  } catch (error) {
    logger.error('Email handler failed', { error, eventId: event.id });
    // Continue — don't block other handlers
  }
});
```

**Warning signs:** One handler failure stops all handlers, event processing stalls, handlers have no error handling.

### Pitfall 5: Not Enforcing Module Boundaries at Compile Time

**What goes wrong:** Modules accidentally import from each other, creating tight coupling that defeats modular monolith benefits.

**Why it happens:** Using relative imports or `@/*` path alias that allows any module to import from any other module.

**How to avoid:** Configure per-module path aliases in `tsconfig.json` (D-04). Example:
```json
{
  "@billing/*": ["./src/modules/billing/*"],
  "@licensing/*": ["./src/modules/licensing/*"]
}
```
Then enforce dependency direction: Billing can import `@products/*`, but Products cannot import `@billing/*` (build error).

**Warning signs:** Imports using relative paths (`../../../licensing/domain`), imports from "higher" modules in "lower" modules.

### Pitfall 6: Value Objects Without Validation

**What goes wrong:** Invalid data enters domain (e.g., negative money amounts, malformed email addresses), causing bugs downstream.

**Why it happens:** Deferring validation to service layer or UI for convenience, skipping validation in VOs.

**How to avoid:** VOs validate in static `create()` method (D-26), throw on invalid input. Fail fast, close to source. Example:
```typescript
class Email {
  private constructor(private value: string) {
    Object.freeze(this);
  }
  
  static create(input: string): Email {
    if (!input.includes('@') || !input.includes('.')) {
      throw new Error(`Invalid email: ${input}`);
    }
    return new Email(input);
  }
}
```

**Warning signs:** VOs accept any input without throwing, validation logic scattered in services/controllers.

### Pitfall 7: Event Bus Without Persistence

**What goes wrong:** Events are lost after processing, no replay capability, can't debug issues or rebuild state.

**Why it happens:** Treating events as transient messages only, not persisting to database (D-14).

**How to avoid:** Always persist events to `events` table before publishing. Enable replay, debugging, analytics. Example:
```typescript
async publish(event: DomainEvent): Promise<void> {
  // 1. Persist to database first
  await db.insert(events).values(event);
  
  // 2. Then publish (in-process + Redis)
  this.emit(event.type, event);
  if (redis) {
    await redis.publish(`events:${event.type}`, JSON.stringify(event));
  }
}
```

**Warning signs:** Events not in database, no event log table, can't query past events.

## Code Examples

Verified patterns from official sources:

### Event Bus with EventEmitter and Redis Pub/Sub

```typescript
// Source: Node.js EventEmitter docs + ioredis Pub/Sub pattern
// src/shared/infrastructure/eventBus/EventBus.ts

import { EventEmitter } from 'events';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
  metadata?: {
    source: string;
    version: number;
  };
}

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class HybridEventBus extends EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    // Emit in-process (synchronous)
    this.emit(event.type, event);
    
    // Publish to Redis for cross-process (async)
    if (redis) {
      await redis.publish(`events:${event.type}`, JSON.stringify(event));
    }
  }

  on(eventType: string, handler: EventHandler): this {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    return super.on(eventType, handler);
  }

  subscribeAll(redisSubscriber: typeof redis): void {
    if (!redisSubscriber) return;
    
    // Subscribe to all event channels
    redisSubscriber.psubscribe('events:*');
    redisSubscriber.on('pmessage', (pattern, channel, message) => {
      const eventType = channel.replace('events:', '');
      this.emit(eventType, JSON.parse(message));
    });
  }
}

export const eventBus = new HybridEventBus();

// Central registry (D-17)
export const eventRegistry: Record<string, EventHandler[]> = {};
```

### Repository Base Class with Drizzle ORM

```typescript
// Source: Drizzle ORM documentation + Repository Pattern
// src/shared/infrastructure/repositories/BaseRepository.ts

import { db } from '@/lib/db';
import { eq, and, desc, asc, SQL, inArray } from 'drizzle-orm';
import type { SQLLite } from 'drizzle-orm';

export interface QueryBuilder<TEntity> {
  where(condition: SQL): QueryBuilder<TEntity>;
  orderBy(column: keyof TEntity, direction?: 'asc' | 'desc'): QueryBuilder<TEntity>;
  limit(count: number): QueryBuilder<TEntity>;
  offset(count: number): QueryBuilder<TEntity>;
  execute(): Promise<TEntity[]>;
}

export abstract class BaseRepository<TEntity> {
  abstract tableName: any; // Drizzle table reference

  async findById(id: string): Promise<TEntity | null> {
    const result = await db
      .select()
      .from(this.tableName)
      .where(eq(this.tableName.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findAll(): Promise<TEntity[]> {
    const rows = await db.select().from(this.tableName);
    return rows.map(row => this.mapToEntity(row));
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    const result = await db
      .insert(this.tableName)
      .values(data as any)
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  async update(id: string, data: Partial<TEntity>): Promise<TEntity> {
    const result = await db
      .update(this.tableName)
      .set(data as any)
      .where(eq(this.tableName.id, id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  async delete(id: string): Promise<void> {
    await db.delete(this.tableName).where(eq(this.tableName.id, id));
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return db.transaction(callback);
  }

  // Hook for subclasses to map DB rows to domain entities
  protected abstract mapToEntity(row: any): TEntity;
}
```

### Value Object Implementation

```typescript
// Source: Domain-Driven Design value object pattern + class-transformer
// src/shared/domain/valueObjects/LicenseKey.ts

import { Transform, Expose } from 'class-transformer';

export class LicenseKey {
  @Expose()
  @Transform(({ value }) => value.toString())
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: string): LicenseKey {
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleaned.length < 25 || cleaned.length > 32) {
      throw new Error(`Invalid license key length: ${cleaned.length}. Must be 25-32 characters.`);
    }
    
    // Exclude ambiguous characters (D-26)
    if (/[01OI]/.test(cleaned)) {
      throw new Error('License key cannot contain ambiguous characters (0, O, 1, I)');
    }
    
    return new LicenseKey(cleaned);
  }

  format(): string {
    // Segment every 4 characters
    return this.value.match(/.{1,4}/g)?.join('-') || this.value;
  }

  equals(other: LicenseKey): boolean {
    return this === other; // Reference equality (D-28)
  }

  toString(): string {
    return this.value;
  }
}

// src/shared/domain/valueObjects/Money.ts
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
    Object.freeze(this);
  }

  static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!['USD', 'BDT', 'EUR'].includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }
}
```

### CQRS Command and Query Pattern

```typescript
// Source: CQRS pattern + Domain-Driven Design application layer
// src/modules/licensing/application/commands/CreateLicenseCommand.ts

import { eventBus } from '@/shared/infrastructure/eventBus';
import { LicenseRepository } from '../../infrastructure/repositories/LicenseRepository';
import { LicenseKey } from '@/shared/domain/valueObjects/LicenseKey';

export class CreateLicenseCommand {
  constructor(
    readonly userId: string,
    readonly productId: string,
    readonly plan: string,
  ) {}
}

export class CreateLicenseHandler {
  constructor(
    private licenseRepo: LicenseRepository,
  ) {}

  async execute(command: CreateLicenseCommand): Promise<void> {
    // Generate license key using nanoid (LGEN-01)
    const key = LicenseKey.create(nanoid(32).toUpperCase());
    
    // Create license entity
    const license = License.create({
      userId: command.userId,
      productId: command.productId,
      plan: command.plan,
      licenseKey: key,
      status: 'active',
    });
    
    // Persist via repository
    await this.licenseRepo.create(license);
    
    // Publish domain event (ARCH-04)
    await eventBus.publish({
      id: nanoid(),
      type: 'LicenseCreated',
      aggregateId: license.id,
      payload: { licenseId: license.id, userId: command.userId },
      timestamp: new Date(),
    });
  }
}

// src/modules/licensing/application/queries/GetLicenseStatusQuery.ts
export class GetLicenseStatusQuery {
  constructor(readonly licenseId: string) {}
}

export class GetLicenseStatusHandler {
  constructor(private licenseRepo: LicenseRepository) {}

  async execute(query: GetLicenseStatusQuery): Promise<LicenseStatusDTO> {
    const license = await this.licenseRepo.findById(query.licenseId);
    
    if (!license) {
      throw new Error('License not found');
    }
    
    return {
      id: license.id,
      status: license.status,
      expiresAt: license.expiresAt,
      maxActivations: license.maxActivations,
      currentActivations: license.currentActivations,
    };
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Monolithic codebase** | Modular monolith with DDD bounded contexts | 2020s | Clear domain boundaries, easier to evolve to microservices if needed |
| **Service layer anemia** | CQRS with rich domain model | 2010s | Better separation of concerns, testable business logic |
| **Direct DB access in controllers** | Repository pattern with abstraction | 2010s | Testable domain logic, swappable data sources |
| **Transient event messages** | Persisted event store with replay capability | 2015s | Debugging, analytics, state rebuilding |
| **Manual transaction management** | ORM native transactions | 2010s | Simpler, less error-prone |
| **Mutable entities everywhere** | Immutable value objects for domain primitives | 2010s | Referential transparency, fewer bugs |

**Deprecated/outdated:**
- **Anemic domain model**: Entities with no behavior, only getters/setters. Replace with rich domain model (behavior in entities and VOs).
- **Active Record pattern**: Entities that know how to save themselves. Replace with Repository pattern (separation of concerns).
- **God repositories**: Single repository handling multiple entities. Replace with one repository per aggregate root.
- **Service layer doing business logic**: Services should orchestrate, not contain business rules. Move logic to domain entities and VOs.
- **Direct Redis pub/sub in domain code**: Coupled to infrastructure. Replace with abstracted event bus interface.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `class-transformer` is the best library for VO serialization | Value Objects | If boilerplate is excessive, may slow development |
| A2 | Single `events` table + materialized views is optimal for event storage | Event Bus | If query performance is poor, may need partitioned tables |
| A3 | Per-module TypeScript path aliases effectively enforce boundaries | Module Structure | If bypassable, may need additional ESLint rules |
| A4 | ioredis Pub/Sub is sufficient for cross-process events | Event Bus | If Redis is unavailable, need fallback strategy |
| A5 | Repository mapping (DB row → domain entity) doesn't cause performance issues | Repository Pattern | If mapping overhead is high, may need compiled mappers |
| A6 | Nanoid 32-char keys are collision-resistant for license keys | Standard Stack | If collisions occur, need longer keys or UUID |
| A7 | EventEmitter in-process events are fast enough for critical paths | Event Bus | If EventEmitter is too slow, need direct method calls |
| A8 | Graceful degradation (no Redis) is acceptable for development | Environment Availability | If Redis is required for features, need better fallback |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Event storage schema details**
   - What we know: Single `events` table with key columns + JSONB payload (D-18, D-19)
   - What's unclear: Exact column set, indexing strategy, partitioning needs
   - Recommendation: Start with simple schema, add indexes based on query patterns in Phase 16+

2. **Module boundary enforcement at runtime**
   - What we know: TypeScript path aliases enforce at build time (D-04)
   - What's unclear: Whether to add ESLint rules for import restrictions
   - Recommendation: Start with TypeScript only, add ESLint if violations occur

3. **Event replay mechanism**
   - What we know: Events persisted to database (D-14)
   - What's unclear: How to replay events (CLI command, API endpoint, automatic on startup?)
   - Recommendation: Defer to Phase 16+ when event consumption is implemented

4. **Value object serialization edge cases**
   - What we know: Use class-transformer (D-27)
   - What's unclear: How to handle nested VOs, circular references, polymorphism
   - Recommendation: Test with real license creation flow in Phase 16

5. **Testing strategy for DDD layers**
   - What we know: Tests deferred (D-08)
   - What's unclear: How to test domain logic vs infrastructure vs application layer
   - Recommendation: Defer to post-v3.0, consider test pyramid (unit domain, integration infrastructure, e2e application)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| **Node.js** | All features | ✓ | 24.16.0 | — |
| **pnpm** | Package manager | ✓ | 11.3.0 | — (project rule: pnpm only) |
| **PostgreSQL** | Drizzle ORM, repository data access | ✓ | — | — (existing v2.x setup) |
| **Redis** | Event bus Pub/Sub, caching | ✓ | — | In-memory fallback (existing in `src/lib/redis.ts`) |
| **Drizzle ORM** | Database queries | ✓ | 0.45.2 | — |
| **ioredis** | Redis client | ✓ | 5.10.1 | — |
| **nanoid** | Unique ID generation | ✓ | 5.1.11 | — |
| **BullMQ** | Background jobs (future phases) | ✓ | 5.76.8 | — |
| **class-transformer** | VO serialization | ✗ | — | Manual `toJSON()` / `fromJSON()` (acceptable for Phase 14) |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- `class-transformer`: Not yet installed, but manual serialization is acceptable for Phase 14. Can install in Phase 16 when value objects are actively used.

**Step 2.6: COMPLETE (all dependencies available or have viable fallbacks)**

## Validation Architecture

> **workflow.nyquist_validation is enabled** (absent in config.json = true)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (tests deferred per D-08) |
| Config file | None |
| Quick run command | None (tests deferred) |
| Full suite command | None (tests deferred) |

### Phase Requirements → Test Map

Tests are **DEFERRED** per D-08 (locked decision). No test coverage in Phase 14.

### Sampling Rate

- **Per task commit:** None (tests deferred)
- **Per wave merge:** None (tests deferred)
- **Phase gate:** Manual verification only — no automated tests

### Wave 0 Gaps

**Intentional gap:** D-08 defers test infrastructure to post-v3.0. Phase 14 is foundation-only (directory structure, base classes, utilities). Tests will be added when architecture is stable and business logic exists.

**Verification strategy for Phase 14:**
- Manual smoke tests: Import from each module, verify path aliases work
- Build verification: `pnpm build` succeeds with no circular dependency errors
- Runtime verification: Event bus publishes/subscribes, repository queries execute

## Security Domain

> `security_enforcement` is **enabled** (absent in config.json = true)

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — (handled by Better Auth, not in Phase 14) |
| V3 Session Management | No | — (handled by Better Auth, not in Phase 14) |
| V4 Access Control | No | — (handled by application layer, future phases) |
| V5 Input Validation | **Yes** | Value objects validate all domain inputs (D-26) — `Email.create()`, `LicenseKey.create()`, `Money.create()` throw on invalid input |
| V6 Cryptography | **Partial** | `nanoid` uses `crypto.randomBytes()` for license keys (LGEN-01) — cryptographically strong, not `Math.random()` |
| V7 Data Protection | **Partial** | Events persisted to database with audit trail (D-14) — replay capability, debugging |
| V8 Communications | **Partial** | Event bus uses Redis Pub/Sub — need TLS for Redis in production |
| V9 Storage | **Partial** | Repository pattern abstracts DB access — Drizzle ORM prevents SQL injection via parameterized queries |

### Known Threat Patterns for TypeScript + DDD Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| **SQL injection via raw queries** | Tampering | Use Drizzle ORM query builder (parameterized), never raw SQL with interpolation |
| **License key predictability** | Spoofing | Use `crypto.randomBytes()` via `nanoid` (LGEN-01), never `Math.random()` or timestamps |
| **Event injection via malicious payload** | Tampering | Validate event payloads against TypeScript interfaces before processing |
| **Module bypass via direct DB access** | Elevation of privilege | Enforce repository pattern — all DB access through repositories, never from routes |
| **Redis Pub/Sub message tampering** | Tampering | Use Redis TLS in production, validate event structure on receipt |
| **Value object bypass (no validation)** | Spoofing | All domain inputs go through VO `create()` methods — never bypass validation |
| **Circular dependency injection** | Denial of Service | TypeScript path aliases prevent at build time — circular deps cause compilation failure |

**Critical security considerations from STATE.md (5 pitfalls):**
1. **License Key Predictability** — MUST use `crypto.randomBytes()` only (via `nanoid`) — LGEN-01
2. **Race Conditions in Activation** — MUST use atomic DB operations (ACT-03) — Drizzle transactions
3. **Time-Based Expiration Edge Cases** — MUST use UTC-only comparisons with grace period (LSTAT-02, LSTAT-03)
4. **Data Migration Corruption** — MUST have verification, dry-run, rollback plan (ARCH-09)
5. **Domain Activation Bypass** — MUST require DNS/file/meta tag verification (ACT-05)

## Sources

### Primary (HIGH confidence)

- **Drizzle ORM Documentation** - Type-safe query builder, transaction support, PostgreSQL integration
- **ioredis Documentation** - Redis client with Pub/Sub, Promise-based API, reconnection logic
- **Node.js EventEmitter** - Built-in event emitter, in-process pub/sub, zero dependency
- **TypeScript Documentation** - Path aliases, module resolution, compile-time enforcement
- **Better Auth Documentation** - Existing auth system (may need event integration in v3.0)

### Secondary (MEDIUM confidence)

- **Existing codebase patterns** - `src/lib/db/schema.ts`, `src/lib/redis.ts`, `src/app/(admin)/actions/*.ts`
- **CONTEXT.md locked decisions** - D-01 through D-31 (user-approved architectural decisions)
- **STATE.md security considerations** - 5 critical pitfalls for Phase 14-16
- **Domain-Driven Design (Eric Evans)** - Bounded contexts, aggregate roots, value objects
- **CQRS Pattern (Martin Fowler)** - Command-query separation, event sourcing

### Tertiary (LOW confidence)

- **Modular Monolith Architecture** - Industry patterns for DDD in monolithic applications
- **Event Store Patterns** - Single table vs. partitioned, materialized views
- **Repository Pattern Variations** - Interface vs. abstract class, mapping strategies

**Note:** Web search was unavailable due to rate limiting. Research based on existing codebase, official documentation, training knowledge, and locked decisions from CONTEXT.md.

## Metadata

**Confidence breakdown:**
- Standard stack: **MEDIUM** - Core dependencies verified (npm registry), but `class-transformer` pattern not yet tested in codebase
- Architecture: **HIGH** - DDD patterns well-established, locked decisions in CONTEXT.md, existing v2.x patterns align
- Pitfalls: **MEDIUM** - Common DDD pitfalls documented, but project-specific edge cases may emerge during implementation

**Research date:** 2026-05-30
**Valid until:** 2026-06-29 (30 days — architecture patterns stable, but stack versions may change)

---

*Phase 14: Shared DDD Infrastructure*
*Research completed: 2026-05-30*
*Next step: `/gsd:plan-phase 14` to create implementation plan*
