// Repository infrastructure barrel exports
// Provides clean public API for bounded contexts to import base repository classes

// Export all repository interfaces and types (IRepository, QueryBuilder, IMapper, TransactionCallback)
export * from './types';

// Export BaseRepository class for domain-specific repositories to extend
export { default as BaseRepository } from './BaseRepository';
