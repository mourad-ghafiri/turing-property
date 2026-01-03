// ============================================================================
// CORE - Re-exports
// ============================================================================

export type { Property } from './property';

export type {
    EvaluationContext,
    EvaluationCache,
    OperatorRegistry,
    OperatorFn
} from './evaluate';

export {
    createRegistry,
    createCache,
    createLoopContext,
    evaluate,
    evalArg,
    evalArgs,
    evalArgsParallel,
    withBindings,
    isLit,
    isRef,
    isOp,
    isExpr,
    isType,
    isConstraint,
    isOperator,
    getTypeName,
    isProperty
} from './evaluate';

export { PropertyNode } from './node';

