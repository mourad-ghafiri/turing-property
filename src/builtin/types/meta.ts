// ============================================================================
// META-TYPES
// ============================================================================
// These are the foundational types that define the type system itself.

import { Property } from '../../core';

// ============================================================================
// BOOTSTRAP: THE META-TYPE
// ============================================================================

/** TYPE is the type of all types. It's self-referential (its type is itself). */
export const TYPE: Property = {
    id: 'Type',
    type: null as unknown as Property,
    metadata: {
        description: { id: 'description', type: null as unknown as Property, value: 'The type of all types' }
    }
};
TYPE.type = TYPE;
TYPE.metadata!.description!.type = TYPE;

// ============================================================================
// EXPRESSION META-TYPE
// ============================================================================

/** EXPR is the type of all expressions (Lit, Ref, Op) */
export const EXPR: Property = {
    id: 'Expr',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all expressions' }
    }
};

// ============================================================================
// OPERATOR META-TYPE
// ============================================================================

/** OPERATOR is the type of all operators */
export const OPERATOR: Property = {
    id: 'Operator',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all operators' }
    }
};

// ============================================================================
// CONSTRAINT META-TYPE
// ============================================================================

/** CONSTRAINT is the type of all constraints */
export const CONSTRAINT: Property = {
    id: 'Constraint',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all constraints' }
    }
};

// ============================================================================
// PROPERTY META-TYPE
// ============================================================================

/** PROPERTY is the type of user-defined properties */
export const PROPERTY: Property = {
    id: 'Property',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of user-defined properties' }
    }
};

