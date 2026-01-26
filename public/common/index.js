// ============================================================================
// COMMON MODULE - Application-specific types, operators, and utilities
// ============================================================================
// Exports all common functionality for the Event Planning Wizard application.
// Following "All is Property" principle.

// Types - All are Properties with type: TYPE
export * from './types.js';

// Registry with registered operators
export { registry, setAppRoot, getAppRoot } from './registry.js';

// Reusable constraint factories
export * from './constraints.js';

// Reusable metadata definitions
export * from './metadata.js';
