/**
 * ============================================================================
 * TYPE GUARDS
 * ============================================================================
 * Utility functions for type checking Properties.
 * Uses type IDs for fast comparison.
 */

import { Property } from './property';

// Type ID constants for fast comparison
const TYPE_LIT = 'Lit';
const TYPE_REF = 'Ref';
const TYPE_OP = 'Op';
const TYPE_EXPR = 'Expr';
const TYPE_TYPE = 'Type';
const TYPE_CONSTRAINT = 'Constraint';
const TYPE_OPERATOR = 'Operator';

/**
 * Check if a Property is a Literal expression.
 */
export const isLit = (p: Property): boolean =>
    p.type?.id === TYPE_LIT;

/**
 * Check if a Property is a Reference expression.
 */
export const isRef = (p: Property): boolean =>
    p.type?.id === TYPE_REF;

/**
 * Check if a Property is an Operator expression.
 */
export const isOp = (p: Property): boolean =>
    p.type?.id === TYPE_OP;

/**
 * Check if a Property is any Expression type (LIT, REF, OP, or EXPR).
 */
export const isExpr = (p: Property): boolean => {
    const typeId = p.type?.id;
    return typeId === TYPE_LIT ||
           typeId === TYPE_REF ||
           typeId === TYPE_OP ||
           typeId === TYPE_EXPR;
};

/**
 * Check if a Property is a Type.
 */
export const isType = (p: Property): boolean =>
    p.type?.id === TYPE_TYPE;

/**
 * Check if a Property is a Constraint.
 */
export const isConstraint = (p: Property): boolean =>
    p.type?.id === TYPE_CONSTRAINT;

/**
 * Check if a Property is an Operator.
 */
export const isOperator = (p: Property): boolean =>
    p.type?.id === TYPE_OPERATOR;

/**
 * Get the type name of a Property.
 */
export const getTypeName = (p: Property): string =>
    p.type?.id ?? 'Unknown';

/**
 * Check if a value is a Property.
 * Uses duck typing for performance.
 */
export const isProperty = (val: unknown): val is Property => {
    if (!val || typeof val !== 'object') return false;
    const obj = val as Record<string, unknown>;
    const type = obj.type;
    if (!type || typeof type !== 'object') return false;
    return typeof obj.id === 'string' &&
           typeof (type as Record<string, unknown>).id === 'string';
};
