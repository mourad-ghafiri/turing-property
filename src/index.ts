// ============================================================================
// TURING PROPERTY - A Universal Property System
// ============================================================================
// Everything is a Property. Types, Expressions, Operators, Constraints,
// and user data are all represented using the same Property structure.

// Core
export {
    // The Property interface
    Property,
    
    // PropertyNode class
    PropertyNode,
    
    // Evaluation
    EvaluationContext,
    OperatorRegistry,
    OperatorFn,
    createRegistry,
    evaluate,
    evalArg,
    evalArgs,
    withBindings,
    
    // Type checking utilities
    isLit,
    isRef,
    isOp,
    isExpr,
    isType,
    isConstraint,
    isOperator,
    getTypeName
} from './core';

// Utils
export {
    traverse,
    findAll,
    findFirst,
    countNodes,
    maxDepth,
    collectIds,
    hasDuplicateIds,
    getDuplicateIds,
    toJSON,
    toJSONString,
    fromJSON,
    parseJSON,
    clone,
    merge,
    diff,
    TraversalCallback,
    ExportOptions,
    ImportOptions,
    ImportResult,
    DiffResult
} from './utils';

// Builtin Types
export {
    // Meta-types
    TYPE, EXPR, OPERATOR, CONSTRAINT, PROPERTY,

    // Expression types
    LIT, REF, OP,

    // Primitive types
    STRING, NUMBER, BOOLEAN, NULL, ANY,

    // Temporal types
    DATE, DATETIME, TIME, DURATION, TIMESTAMP,

    // Structural types
    LIST, OBJECT, RECORD, UNION, INTERSECTION, LITERAL, FUNCTION, ENUM,

    // Type factories - Primitives
    tString, tNumber, tBoolean, tNull, tAny,
    // Type factories - Temporal
    tDate, tDateTime, tTime, tDuration, tTimestamp,
    // Type factories - Structural
    tList, tObject, tRecord, tUnion, tIntersection, tLiteral, tFunction, tEnum
} from './builtin/types';

// Builtin Expressions
export { lit, ref, op } from './builtin/expressions';

// Builtin Operators
export { defaultRegistry } from './builtin/operators';

// Builtin Constraints
export {
    // Constraint checking
    checkConstraints, checkConstraintsDeep,
    
    // Presence constraints
    REQUIRED, OPTIONAL, MUST_BE_NULL, NOT_EMPTY,
    
    // String constraints
    MIN_LENGTH, MAX_LENGTH, EXACT_LENGTH, LENGTH_BETWEEN, PATTERN,
    EMAIL, URL, PHONE, ALPHA, ALPHANUMERIC, NUMERIC,
    UUID, SLUG, IPV4, IPV6, HEX_COLOR, CREDIT_CARD, POSTAL_CODE, SSN,
    STARTS_WITH, ENDS_WITH, CONTAINS, LOWERCASE, UPPERCASE,
    
    // Number constraints
    MIN, MAX, BETWEEN, IN_RANGE, POSITIVE, NEGATIVE, NON_NEGATIVE,
    INTEGER, EVEN, ODD, DIVISIBLE_BY,
    
    // Date constraints
    FUTURE_DATE, PAST_DATE, TODAY, AFTER_DATE, BEFORE_DATE,
    MIN_AGE, MAX_AGE, WEEKDAY, WEEKEND,
    
    // Array constraints
    MIN_ITEMS, MAX_ITEMS, UNIQUE_ITEMS, NOT_EMPTY_ARRAY,
    
    // File constraints
    MAX_FILE_SIZE, IS_IMAGE, IS_PDF,
    
    // Cross-field constraints
    EQUALS_FIELD, BEFORE_FIELD, AFTER_FIELD,
    
    // Value constraints
    ONE_OF, EQUALS, IS_TRUE, ACCEPTED,
    
    // Conditional constraints
    REQUIRED_IF, REQUIRED_IF_FIELD_EQUALS,
    
    // Utility constraints
    ALWAYS_VALID, ALWAYS_INVALID, CUSTOM
} from './builtin/constraints';

