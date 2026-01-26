/**
 * ============================================================================
 * TYPE GUARDS
 * ============================================================================
 * Utility functions for type checking Properties.
 * Uses type IDs for fast comparison.
 */
import { Property } from './property';
/**
 * Check if a Property is a Literal expression.
 */
export declare const isLit: (p: Property) => boolean;
/**
 * Check if a Property is a Reference expression.
 */
export declare const isRef: (p: Property) => boolean;
/**
 * Check if a Property is an Operator expression.
 */
export declare const isOp: (p: Property) => boolean;
/**
 * Check if a Property is any Expression type (LIT, REF, OP, or EXPR).
 */
export declare const isExpr: (p: Property) => boolean;
/**
 * Check if a Property is a Type.
 */
export declare const isType: (p: Property) => boolean;
/**
 * Check if a Property is a Constraint.
 */
export declare const isConstraint: (p: Property) => boolean;
/**
 * Check if a Property is an Operator.
 */
export declare const isOperator: (p: Property) => boolean;
/**
 * Get the type name of a Property.
 */
export declare const getTypeName: (p: Property) => string;
/**
 * Check if a value is a Property.
 * Uses duck typing for performance.
 */
export declare const isProperty: (val: unknown) => val is Property;
//# sourceMappingURL=guards.d.ts.map