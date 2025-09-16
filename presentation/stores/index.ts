// Presentation Layer Stores - Centralized state management exports
// Follows Clean Architecture bounded context organization

// Board Context - Kanban board functionality
export * from './board';

// User Context - Authentication and user management
export * from './user';

// Shared Context - Cross-cutting UI concerns
export * from './shared';

// Re-export commonly used stores for convenience
export { useBoardStore } from './board/boardStore';

// Type exports for consumers
export type { BoardState, Columns } from './board/boardStore';