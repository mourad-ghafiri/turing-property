/**
 * ============================================================================
 * CORE MODULE
 * ============================================================================
 * Exports all core functionality.
 */

// Property interface
export type { Property } from './property';

// Primitive types
export {
    TYPE,
    EXPR,
    OPERATOR,
    CONSTRAINT,
    PROPERTY,
    LIT,
    REF,
    OP,
} from './types';

// Expression factories
export { lit, ref, op } from './expressions';

// Registry
export { Registry, createRegistry } from './Registry';
export type { EvaluationContext, OperatorFn } from './Registry';

// Evaluator
export {
    evaluate,
    evalArg,
    evalArgs,
    evalArgsParallel,
    withBindings,
    createLoopContext,
} from './Evaluator';

// Guards
export {
    isLit,
    isRef,
    isOp,
    isExpr,
    isType,
    isConstraint,
    isOperator,
    isProperty,
    getTypeName,
} from './guards';

// PropertyNode
export { PropertyNode } from './PropertyNode';
export type {
    ChangeCallback,
    PathFilter,
    Subscription,
    TraversalVisitor,
    NodePredicate,
    SerializedProperty,
} from './PropertyNode';
