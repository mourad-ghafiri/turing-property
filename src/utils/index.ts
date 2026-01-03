// ============================================================================
// UTILS - Re-exports
// ============================================================================

export {
    traverse,
    findAll,
    findFirst,
    countNodes,
    maxDepth,
    collectIds,
    hasDuplicateIds,
    getDuplicateIds,
    TraversalCallback
} from './traversal';

export {
    toJSON,
    toJSONString,
    fromJSON,
    parseJSON,
    ExportOptions,
    ImportOptions,
    ImportResult
} from './serialization';

export { clone, merge } from './clone';

export { diff, DiffResult } from './diff';

export {
    // Schema definitions
    PropertySchema,
    ExpressionSchema,
    ConstraintSchema,
    TypeSchema,
    TuringPropertySchemas,
    // Validation functions
    validateProperty,
    validatePropertyJSON,
    validateExpression,
    assertValidProperty,
    isValidProperty,
    getPropertySchemaString,
    getAllSchemas,
    // Types
    ValidationError,
    ValidationResult
} from './schema';
