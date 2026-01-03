// ============================================================================
// EVALUATION SYSTEM
// ============================================================================
// Evaluation context and expression evaluation logic.

import { Property } from './property';

// ============================================================================
// EVALUATION CONTEXT
// ============================================================================

export type OperatorFn = (args: Property[], ctx: EvaluationContext) => unknown | Promise<unknown>;

export interface OperatorRegistry {
    get(name: string): OperatorFn | undefined;
    register(name: string, fn: OperatorFn): void;
    has(name: string): boolean;
}

/** Cache for evaluated expression results */
export interface EvaluationCache {
    get(expr: Property): unknown | undefined;
    set(expr: Property, value: unknown): void;
    has(expr: Property): boolean;
}

/** Create a new evaluation cache */
export const createCache = (): EvaluationCache => {
    const cache = new WeakMap<Property, unknown>();
    return {
        get: (expr) => cache.get(expr),
        set: (expr, value) => cache.set(expr, value),
        has: (expr) => cache.has(expr)
    };
};

export interface EvaluationContext {
    /** The current property being evaluated */
    current: Property;
    /** The root of the property tree */
    root: Property;
    /** Operator registry */
    registry: OperatorRegistry;
    /** Variable bindings (for map/filter/reduce) */
    bindings?: Record<string, unknown>;
    /** Evaluation depth (for circular reference detection) */
    depth?: number;
    /** Optional cache for evaluated expressions */
    cache?: EvaluationCache;
    /** Parent lookup function (optimized for PropertyNode) */
    findParentFn?: (target: Property) => Property | undefined;
}

// ============================================================================
// REGISTRY FACTORY
// ============================================================================

export const createRegistry = (): OperatorRegistry => {
    const ops = new Map<string, OperatorFn>();
    return {
        get: (name: string) => ops.get(name),
        register: (name: string, fn: OperatorFn) => { ops.set(name, fn); },
        has: (name: string) => ops.has(name)
    };
};

// ============================================================================
// TYPE CHECKING UTILITIES
// ============================================================================

// Cache type IDs for fast comparison
const TYPE_LIT = 'Lit';
const TYPE_REF = 'Ref';
const TYPE_OP = 'Op';
const TYPE_EXPR = 'Expr';
const TYPE_TYPE = 'Type';
const TYPE_CONSTRAINT = 'Constraint';
const TYPE_OPERATOR = 'Operator';

/** Check if a Property is a Literal expression */
export const isLit = (p: Property): boolean =>
    p.type?.id === TYPE_LIT;

/** Check if a Property is a Reference expression */
export const isRef = (p: Property): boolean =>
    p.type?.id === TYPE_REF;

/** Check if a Property is an Operator call expression */
export const isOp = (p: Property): boolean =>
    p.type?.id === TYPE_OP;

/** Check if a Property is an Expression (fast path for common cases) */
export const isExpr = (p: Property): boolean => {
    const typeId = p.type?.id;
    return typeId === TYPE_LIT || typeId === TYPE_REF || typeId === TYPE_OP || typeId === TYPE_EXPR;
};

/** Check if a Property is a Type */
export const isType = (p: Property): boolean =>
    p.type?.id === TYPE_TYPE;

/** Check if a Property is a Constraint */
export const isConstraint = (p: Property): boolean =>
    p.type?.id === TYPE_CONSTRAINT;

/** Check if a Property is an Operator */
export const isOperator = (p: Property): boolean =>
    p.type?.id === TYPE_OPERATOR;

/** Get the type name of a Property */
export const getTypeName = (p: Property): string =>
    p.type?.id ?? 'Unknown';

/** Check if a value looks like a Property (optimized check) */
export const isProperty = (val: unknown): val is Property => {
    if (!val || typeof val !== 'object') return false;
    const obj = val as Record<string, unknown>;
    // Fast path: check 'type' first as it's most distinctive
    const type = obj.type;
    if (!type || typeof type !== 'object') return false;
    return typeof obj.id === 'string' && typeof (type as Record<string, unknown>).id === 'string';
};

// ============================================================================
// EXPRESSION EVALUATION
// ============================================================================

const MAX_DEPTH = 100;

// Cache for sorted argument keys per expression (avoids re-sorting)
const sortedArgsCache = new WeakMap<Property, string[]>();

/** Get sorted argument keys for an operator expression (cached) */
const getSortedArgKeys = (expr: Property): string[] => {
    let keys = sortedArgsCache.get(expr);
    if (!keys && expr.children) {
        keys = Object.keys(expr.children).sort((a, b) => {
            const numA = parseInt(a.replace('arg', ''), 10);
            const numB = parseInt(b.replace('arg', ''), 10);
            return numA - numB;
        });
        sortedArgsCache.set(expr, keys);
    }
    return keys ?? [];
};

/** Evaluate a Property expression and return its value */
export const evaluate = async (expr: Property, ctx: EvaluationContext): Promise<unknown> => {
    const depth = (ctx.depth ?? 0) + 1;
    if (depth > MAX_DEPTH) {
        throw new Error('Maximum evaluation depth exceeded - possible circular reference');
    }

    // Fast path for literals - no context needed
    const typeId = expr.type?.id;
    if (typeId === TYPE_LIT) {
        return expr.value;
    }

    // Check cache for non-literal expressions (skip if bindings present - dynamic context)
    const cache = ctx.cache;
    if (cache && !ctx.bindings && cache.has(expr)) {
        return cache.get(expr);
    }

    // Create evaluation context - reuse object when possible
    const evalCtx: EvaluationContext = ctx.depth === depth - 1 ? ctx : {
        current: ctx.current,
        root: ctx.root,
        registry: ctx.registry,
        bindings: ctx.bindings,
        depth,
        cache,
        findParentFn: ctx.findParentFn
    };
    evalCtx.depth = depth;

    let result: unknown;

    // Reference: resolve the path
    if (typeId === TYPE_REF) {
        const path = expr.value as string[];
        result = await resolveRef(path, evalCtx);
    }
    // Operator call: evaluate arguments and call operator
    else if (typeId === TYPE_OP) {
        const opName = expr.id;
        const opFn = ctx.registry.get(opName);

        if (!opFn) {
            throw new Error(`Unknown operator: ${opName}`);
        }

        // Get arguments in order (cached)
        const args: Property[] = [];
        if (expr.children) {
            const keys = getSortedArgKeys(expr);
            for (const key of keys) {
                const arg = expr.children[key];
                if (arg) args.push(arg);
            }
        }

        // Call operator - handle sync and async
        const opResult = opFn(args, evalCtx);
        result = opResult instanceof Promise ? await opResult : opResult;
    }
    // Not an expression - return the value if present, otherwise null
    else {
        result = expr.value ?? null;
    }

    // Cache result (only for expressions without bindings)
    if (cache && !ctx.bindings) {
        cache.set(expr, result);
    }

    return result;
};

/** Resolve a reference path */
const resolveRef = async (path: string[], ctx: EvaluationContext): Promise<unknown> => {
    if (path.length === 0) return null;

    let current: Property | undefined = undefined;
    let i = 0;

    // Handle starting point
    const start = path[0]!;
    switch (start) {
        case 'self':
            current = ctx.current;
            i = 1;
            break;
        case 'root':
            current = ctx.root;
            i = 1;
            break;
        case 'parent':
            current = ctx.current;
            i = 1;
            break;
        default:
            // Check bindings first (for map/filter/reduce)
            if (ctx.bindings && start in ctx.bindings) {
                if (path.length === 1) {
                    return ctx.bindings[start];
                }
                let val: unknown = ctx.bindings[start];
                for (let j = 1; j < path.length; j++) {
                    if (val && typeof val === 'object') {
                        val = (val as Record<string, unknown>)[path[j]!];
                    } else {
                        return undefined;
                    }
                }
                return val;
            }
            current = ctx.current;
            i = 0;
    }

    // Navigate the path
    while (current && i < path.length) {
        const segment = path[i]!;

        switch (segment) {
            case 'value': {
                if (current.value !== undefined) {
                    const typeId = current.type?.id;
                    if (typeId === TYPE_LIT || typeId === TYPE_REF || typeId === TYPE_OP) {
                        // Reuse context with updated current
                        const newCtx: EvaluationContext = {
                            current,
                            root: ctx.root,
                            registry: ctx.registry,
                            bindings: ctx.bindings,
                            depth: ctx.depth,
                            cache: ctx.cache,
                            findParentFn: ctx.findParentFn
                        };
                        return await evaluate(current, newCtx);
                    } else if (isProperty(current.value)) {
                        const newCtx: EvaluationContext = {
                            current,
                            root: ctx.root,
                            registry: ctx.registry,
                            bindings: ctx.bindings,
                            depth: ctx.depth,
                            cache: ctx.cache,
                            findParentFn: ctx.findParentFn
                        };
                        return await evaluate(current.value as Property, newCtx);
                    }
                    return current.value;
                }
                return null;
            }

            case 'type':
                current = current.type;
                break;

            case 'id':
                return current.id;

            case 'children':
                i++;
                if (i < path.length && current.children) {
                    current = current.children[path[i]!];
                } else {
                    return undefined;
                }
                break;

            case 'metadata':
                i++;
                if (i < path.length && current.metadata) {
                    current = current.metadata[path[i]!];
                } else {
                    return undefined;
                }
                break;

            case 'constraints':
                i++;
                if (i < path.length && current.constraints) {
                    current = current.constraints[path[i]!];
                } else {
                    return undefined;
                }
                break;

            case 'parent':
                // Use optimized parent lookup if available
                if (ctx.findParentFn) {
                    current = ctx.findParentFn(current);
                } else {
                    current = findParent(current, ctx.root);
                }
                break;

            default:
                if (current.children && current.children[segment]) {
                    current = current.children[segment];
                } else if (current.metadata && current.metadata[segment]) {
                    current = current.metadata[segment];
                } else {
                    return undefined;
                }
        }
        i++;
    }

    if (current) {
        if (current.value !== undefined) {
            if (isProperty(current.value)) {
                const newCtx: EvaluationContext = {
                    current,
                    root: ctx.root,
                    registry: ctx.registry,
                    bindings: ctx.bindings,
                    depth: ctx.depth,
                    cache: ctx.cache,
                    findParentFn: ctx.findParentFn
                };
                return await evaluate(current.value as Property, newCtx);
            }
            return current.value;
        }
        return current;
    }

    return undefined;
};

/** Find the parent of a property in the tree */
const findParent = (target: Property, root: Property, parent?: Property): Property | undefined => {
    if (root === target) return parent;
    
    if (root.children) {
        for (const child of Object.values(root.children)) {
            if (child === target) return root;
            const found = findParent(target, child, root);
            if (found) return found;
        }
    }
    
    if (root.metadata) {
        for (const meta of Object.values(root.metadata)) {
            if (meta === target) return root;
            const found = findParent(target, meta, root);
            if (found) return found;
        }
    }
    
    if (root.constraints) {
        for (const constraint of Object.values(root.constraints)) {
            if (constraint === target) return root;
            const found = findParent(target, constraint, root);
            if (found) return found;
        }
    }
    
    return undefined;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Evaluate an expression argument */
export const evalArg = async (arg: Property, ctx: EvaluationContext): Promise<unknown> => {
    return await evaluate(arg, ctx);
};

/** Evaluate multiple arguments sequentially (better for small arg counts) */
export const evalArgs = async (args: Property[], ctx: EvaluationContext): Promise<unknown[]> => {
    // Sequential evaluation is faster for small argument lists (most operators)
    // and avoids Promise.all overhead
    const results: unknown[] = new Array(args.length);
    for (let i = 0; i < args.length; i++) {
        results[i] = await evaluate(args[i]!, ctx);
    }
    return results;
};

/** Evaluate multiple arguments in parallel (for known expensive operations) */
export const evalArgsParallel = async (args: Property[], ctx: EvaluationContext): Promise<unknown[]> => {
    return await Promise.all(args.map(arg => evaluate(arg, ctx)));
};

/** Create a new context with bindings */
export const withBindings = (ctx: EvaluationContext, bindings: Record<string, unknown>): EvaluationContext => ({
    current: ctx.current,
    root: ctx.root,
    registry: ctx.registry,
    depth: ctx.depth,
    cache: ctx.cache,
    findParentFn: ctx.findParentFn,
    bindings: ctx.bindings ? { ...ctx.bindings, ...bindings } : bindings
});

/**
 * Create a reusable loop context for map/filter/reduce operations.
 * Returns a context and a mutable bindings object that can be updated per iteration.
 */
export const createLoopContext = (ctx: EvaluationContext): { loopCtx: EvaluationContext; bindings: Record<string, unknown> } => {
    const bindings: Record<string, unknown> = ctx.bindings ? { ...ctx.bindings } : {};
    const loopCtx: EvaluationContext = {
        current: ctx.current,
        root: ctx.root,
        registry: ctx.registry,
        depth: ctx.depth,
        cache: ctx.cache,
        findParentFn: ctx.findParentFn,
        bindings
    };
    return { loopCtx, bindings };
};

