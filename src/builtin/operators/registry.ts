// ============================================================================
// OPERATOR REGISTRY
// ============================================================================

import { Property, createRegistry, EvaluationContext, evalArg, evalArgs, evalArgsParallel, withBindings, createLoopContext, evaluate } from '../../core';

export const defaultRegistry = createRegistry();

// Helper to register an operator (supports sync and async)
export const reg = (id: string, fn: (args: Property[], ctx: EvaluationContext) => unknown | Promise<unknown>) => {
    defaultRegistry.register(id, fn);
};

// Re-export for use by operator modules
export { evalArg, evalArgs, evalArgsParallel, withBindings, createLoopContext, evaluate };
export type { EvaluationContext };

