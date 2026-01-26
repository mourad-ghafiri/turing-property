/**
 * ============================================================================
 * EVALUATOR
 * ============================================================================
 * Expression evaluation engine.
 * Evaluates LIT, REF, and OP expressions.
 */
import { Property } from './property';
import { EvaluationContext } from './Registry';
/**
 * Evaluate a Property expression and return its value.
 */
export declare const evaluate: (expr: Property, ctx: EvaluationContext) => Promise<unknown>;
/**
 * Evaluate a single argument.
 */
export declare const evalArg: (arg: Property, ctx: EvaluationContext) => Promise<unknown>;
/**
 * Evaluate multiple arguments sequentially.
 */
export declare const evalArgs: (args: Property[], ctx: EvaluationContext) => Promise<unknown[]>;
/**
 * Evaluate multiple arguments in parallel.
 */
export declare const evalArgsParallel: (args: Property[], ctx: EvaluationContext) => Promise<unknown[]>;
/**
 * Create a new context with additional bindings.
 */
export declare const withBindings: (ctx: EvaluationContext, bindings: Record<string, unknown>) => EvaluationContext;
/**
 * Create a reusable loop context for map/filter/reduce.
 */
export declare const createLoopContext: (ctx: EvaluationContext) => {
    loopCtx: EvaluationContext;
    bindings: Record<string, unknown>;
};
//# sourceMappingURL=Evaluator.d.ts.map