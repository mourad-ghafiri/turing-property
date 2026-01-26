/**
 * ============================================================================
 * CORE MODULE
 * ============================================================================
 * Exports all core functionality.
 */
export type { Property } from './property';
export { TYPE, EXPR, OPERATOR, CONSTRAINT, PROPERTY, LIT, REF, OP, } from './types';
export { lit, ref, op } from './expressions';
export { Registry, createRegistry } from './Registry';
export type { EvaluationContext, OperatorFn } from './Registry';
export { evaluate, evalArg, evalArgs, evalArgsParallel, withBindings, createLoopContext, } from './Evaluator';
export { isLit, isRef, isOp, isExpr, isType, isConstraint, isOperator, isProperty, getTypeName, } from './guards';
export { PropertyNode } from './PropertyNode';
export type { ChangeCallback, PathFilter, Subscription, TraversalVisitor, NodePredicate, SerializedProperty, } from './PropertyNode';
//# sourceMappingURL=index.d.ts.map