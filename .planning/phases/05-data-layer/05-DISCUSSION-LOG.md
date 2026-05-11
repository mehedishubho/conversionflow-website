# Phase 5: Data Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 05-data-layer
**Areas discussed:** Data structure, Import pattern, Deployment config, Type organization, Export style, Helper philosophy

---

## Data Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Typed interfaces | TypeScript interfaces co-located with data. Simple, no validation overhead. | ✓ |
| Zod schemas + inference | Runtime validation too. More boilerplate but catches bad data. | |
| JSON + types | JSON files with TS declarations. Simplest but less type safety. | |

**User's choice:** Typed interfaces
**Notes:** Chosen for simplicity and i18n readiness — typed arrays/objects are easy to translate.

## Pricing Data Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Dual-currency per tier | Single price array with USD and BDT fields per tier. | ✓ |
| Separate arrays by currency | Two arrays (usd-tiers, bdt-tiers). Toggle swaps whole array. | |
| Base + conversion rate | Base BDT price, convert on-the-fly. Flexible but adds logic. | |

**User's choice:** Dual-currency per tier
**Notes:** Toggle (Phase 6) just reads the appropriate field from the same data.

## Import Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Direct imports | Each component imports from its data file. Tree-shakeable. | ✓ |
| Barrel file (index.ts) | Single re-export file. Convenient but loads all data. | |
| Data hooks/layer | Components use hooks like usePricingData(). Over-engineered for static data. | |

**User's choice:** Direct imports

## Deployment Config

| Option | Description | Selected |
|--------|-------------|----------|
| Docker | Container with standalone output. Reproducible, standard. | ✓ |
| PM2 + bare metal | Process manager, no container. Simpler setup. | |
| Config only, deploy later | Just configure standalone output. | |

**User's choice:** Docker
**Notes:** Dockerfile needed with multi-stage build for minimal image size.

## Type File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located | Types in same file as data. Self-contained, easy to find. | ✓ |
| Separate types file | All types in src/types/ or src/data/types.ts. Central reference. | |

**User's choice:** Co-located

## Export Style

| Option | Description | Selected |
|--------|-------------|----------|
| Single named export | One primary export per file (e.g., pricingTiers). Predictable. | ✓ |
| Multiple named exports | Files can export data, constants, config. More flexible. | |

**User's choice:** Single named export

## Helper Philosophy

| Option | Description | Selected |
|--------|-------------|----------|
| Pure data only | Data files contain only arrays/objects. Transformation in components/utils. | ✓ |
| Data + helpers | Files include helper functions like getPrice(tier, currency). | |

**User's choice:** Pure data only

---

## Claude's Discretion

- Exact TypeScript interface field names and types
- JSDoc comments on interfaces
- Dockerfile base image and layer caching
- .dockerignore file

## Deferred Ideas

None — discussion stayed within phase scope.
