/**
 * ============================================================================
 * PRIMITIVE TYPES
 * ============================================================================
 * The foundational types that define the type system.
 * All are Properties - this is what makes the system homoiconic.
 */

import { Property } from './property';

// ============================================================================
// META-TYPES
// ============================================================================

/**
 * TYPE - The type of all types.
 * Self-referential bootstrap: TYPE.type === TYPE
 */
export const TYPE: Property = {
    id: 'Type',
    type: null as unknown as Property,
};
(TYPE as { type: Property }).type = TYPE;

/**
 * EXPR - The type of all expressions (LIT, REF, OP).
 */
export const EXPR: Property = {
    id: 'Expr',
    type: TYPE,
};

/**
 * OPERATOR - The type of all operators.
 */
export const OPERATOR: Property = {
    id: 'Operator',
    type: TYPE,
};

/**
 * CONSTRAINT - The type of all constraints.
 */
export const CONSTRAINT: Property = {
    id: 'Constraint',
    type: TYPE,
};

/**
 * PROPERTY - The type of user-defined properties.
 */
export const PROPERTY: Property = {
    id: 'Property',
    type: TYPE,
};

// ============================================================================
// EXPRESSION TYPES
// ============================================================================

/**
 * LIT - Literal expression type.
 * Represents static values: lit(42), lit('hello'), lit(true)
 */
export const LIT: Property = {
    id: 'Lit',
    type: EXPR,
};

/**
 * REF - Reference expression type.
 * Points to other properties: ref(['self', 'value']), ref(['parent', 'name'])
 */
export const REF: Property = {
    id: 'Ref',
    type: EXPR,
};

/**
 * OP - Operator expression type.
 * Combines and transforms: op('add', lit(1), lit(2))
 */
export const OP: Property = {
    id: 'Op',
    type: EXPR,
};
