// Repository pattern interfaces and types for DDD infrastructure
// Follows D-20, D-22, D-23 from Phase 14 CONTEXT.md

import type { SQL } from 'drizzle-orm';

/**
 * QueryBuilder interface for flexible repository queries
 * Provides filtering, sorting, and pagination capabilities (D-20)
 */
export interface QueryBuilder {
  /** WHERE clause conditions - supports Drizzle SQL expressions */
  where?: SQL | SQL[];
  /** ORDER BY clause - column and direction */
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  /** LIMIT clause - restrict result count */
  limit?: number;
  /** OFFSET clause - skip N records for pagination */
  offset?: number;
}

/**
 * Generic repository interface defining CRUD operations
 * All bounded context repositories implement this interface (D-22)
 *
 * @template T - Domain entity type (not DB row type)
 */
export interface IRepository<T> {
  /**
   * Find a single entity by its ID
   * @param id - Entity identifier
   * @returns Entity if found, null otherwise
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities matching optional filters
   * @param filters - Query builder options (where, orderBy, limit, offset)
   * @returns Array of entities (empty if none match)
   */
  findAll(filters?: QueryBuilder): Promise<T[]>;

  /**
   * Create a new entity
   * @param data - Entity data without id (id is generated)
   * @returns Created entity with generated id
   */
  create(data: Omit<T, 'id'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id - Entity identifier
   * @param data - Partial entity data to update
   * @returns Updated entity
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity by ID
   * @param id - Entity identifier
   */
  delete(id: string): Promise<void>;

  /**
   * Check if an entity exists by ID
   * @param id - Entity identifier
   * @returns true if entity exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Mapper interface for domain-to-data conversion (D-23)
 * Repositories use mappers to convert between DB rows and domain entities
 * This keeps the domain layer pure - no Drizzle types leak into domain logic
 *
 * @template Domain - Domain entity type
 * @template Data - Database row type (Drizzle schema type)
 */
export interface IMapper<Domain, Data> {
  /**
   * Convert database row to domain entity
   * @param data - Raw database row
   * @returns Domain entity
   */
  toDomain(data: Data): Domain;

  /**
   * Convert domain entity to database row
   * @param domain - Domain entity
   * @returns Database row data for insert/update
   */
  toData(domain: Domain): Data;
}

/**
 * Transaction callback type for Drizzle native transactions (D-21)
 * @template R - Return type of the transaction callback
 */
export type TransactionCallback<R> = (trx: any) => Promise<R>;
