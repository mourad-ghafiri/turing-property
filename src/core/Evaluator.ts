/**
 * ============================================================================
 * EVALUATOR
 * ============================================================================
 * Expression evaluation engine.
 * Evaluates LIT, REF, and OP expressions.
 */

import { Property } from './property';
import { Registry, EvaluationContext } from './Registry';
import { isLit, isRef, isOp, isProperty } from './guards';

const MAX_DEPTH = 1000;

// Cache for sorted argument keys
const sortedArgsCache = new WeakMap<Property, string[]>();

/**
 * Get sorted argument keys for an operator expression.
 */
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

/**
 * Find the parent of a property in the tree.
 */
const findParent = (
    target: Property,
    root: Property,
    parent?: Property
): Property | undefined => {
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

/**
 * Evaluate a Property expression and return its value.
 */
export const evaluate = async (
    expr: Property,
    ctx: EvaluationContext
): Promise<unknown> => {
    const depth = (ctx.depth ?? 0) + 1;

    if (depth > MAX_DEPTH) {
        throw new Error('Maximum evaluation depth exceeded - possible circular reference');
    }

    // Fast path for literals
    if (isLit(expr)) {
        return expr.value;
    }

    // Create new context with incremented depth
    const evalCtx: EvaluationContext = {
        ...ctx,
        depth,
    };

    // Reference: resolve the path
    if (isRef(expr)) {
        return resolveRef(expr.value as string[], evalCtx);
    }

    // Operator: evaluate arguments and call operator
    if (isOp(expr)) {
        const opName = expr.id;
        const opFn = ctx.registry.get(opName);

        if (!opFn) {
            throw new Error(`Unknown operator: ${opName}`);
        }

        // Get arguments in order
        const args: Property[] = [];
        if (expr.children) {
            for (const key of getSortedArgKeys(expr)) {
                const arg = expr.children[key];
                if (arg) args.push(arg);
            }
        }

        // Call operator
        const result = opFn(args, evalCtx);
        return result instanceof Promise ? await result : result;
    }

    // Not an expression - return value or null
    return expr.value ?? null;
};

/**
 * Resolve a reference path.
 *
 * Tracks 'owner' separately from 'current' during navigation:
 * - 'owner' is the property that OWNS the current location (for self references in expressions)
 * - 'current' is the actual property/value we're navigating through
 *
 * When we enter metadata/constraints, the owner becomes the property containing them.
 * When we enter children, the owner becomes the child property itself.
 * This ensures expressions in metadata have correct 'self' context.
 */
const resolveRef = async (
    path: string[],
    ctx: EvaluationContext
): Promise<unknown> => {
    if (path.length === 0) return null;

    let current: Property | undefined;
    let owner: Property | undefined;  // The property that owns the current location
    let i = 0;

    // Handle starting point
    const start = path[0]!;
    switch (start) {
        case 'self':
            current = ctx.current;
            owner = ctx.current;
            i = 1;
            break;

        case 'root':
            current = ctx.root;
            owner = ctx.root;
            i = 1;
            break;

        case 'parent':
            current = ctx.findParent
                ? ctx.findParent(ctx.current)
                : findParent(ctx.current, ctx.root);
            owner = current;
            i = 1;
            break;

        default:
            // Check bindings first
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
            owner = ctx.current;
            i = 0;
    }

    // Navigate the path
    while (current && i < path.length) {
        const segment = path[i]!;

        switch (segment) {
            case 'value':
                if (current.value !== undefined) {
                    // If current property is an expression, evaluate it with owner context
                    if (isLit(current) || isRef(current) || isOp(current)) {
                        return evaluate(current, { ...ctx, current: owner! });
                    }
                    if (isProperty(current.value)) {
                        return evaluate(current.value as Property, { ...ctx, current: owner! });
                    }
                    return current.value;
                }
                return null;

            case 'type':
                current = current.type;
                owner = current;
                break;

            case 'id':
                return current.id;

            case 'children':
                i++;
                if (i < path.length && current.children) {
                    current = current.children[path[i]!];
                    owner = current;  // Child becomes the new owner
                } else {
                    return undefined;
                }
                break;

            case 'metadata':
                i++;
                if (i < path.length && current.metadata) {
                    // Owner stays as current (the property containing metadata)
                    owner = current;
                    current = current.metadata[path[i]!];
                } else {
                    return undefined;
                }
                break;

            case 'constraints':
                i++;
                if (i < path.length && current.constraints) {
                    // Owner stays as current (the property containing constraints)
                    owner = current;
                    current = current.constraints[path[i]!];
                } else {
                    return undefined;
                }
                break;

            case 'parent':
                current = ctx.findParent
                    ? ctx.findParent(current)
                    : findParent(current, ctx.root);
                owner = current;
                break;

            default:
                // Try children first, then metadata
                if (current.children?.[segment]) {
                    current = current.children[segment];
                    owner = current;  // Child becomes the new owner
                } else if (current.metadata?.[segment]) {
                    // Owner stays as current (the property containing metadata)
                    owner = current;
                    current = current.metadata[segment];
                } else {
                    return undefined;
                }
        }
        i++;
    }

    if (current) {
        // If the resolved property IS an expression, evaluate it with owner context
        // This enables cross-referencing computed metadata with correct 'self' binding
        if (isLit(current) || isRef(current) || isOp(current)) {
            return evaluate(current, { ...ctx, current: owner! });
        }

        if (current.value !== undefined) {
            if (isProperty(current.value)) {
                return evaluate(current.value as Property, { ...ctx, current: owner! });
            }
            return current.value;
        }
        return current;
    }

    return undefined;
};

/**
 * Evaluate a single argument.
 */
export const evalArg = async (
    arg: Property,
    ctx: EvaluationContext
): Promise<unknown> => {
    return evaluate(arg, ctx);
};

/**
 * Evaluate multiple arguments sequentially.
 */
export const evalArgs = async (
    args: Property[],
    ctx: EvaluationContext
): Promise<unknown[]> => {
    const results: unknown[] = new Array(args.length);
    for (let i = 0; i < args.length; i++) {
        results[i] = await evaluate(args[i]!, ctx);
    }
    return results;
};

/**
 * Evaluate multiple arguments in parallel.
 */
export const evalArgsParallel = async (
    args: Property[],
    ctx: EvaluationContext
): Promise<unknown[]> => {
    return Promise.all(args.map(arg => evaluate(arg, ctx)));
};

/**
 * Create a new context with additional bindings.
 */
export const withBindings = (
    ctx: EvaluationContext,
    bindings: Record<string, unknown>
): EvaluationContext => ({
    ...ctx,
    bindings: ctx.bindings ? { ...ctx.bindings, ...bindings } : bindings,
});

/**
 * Create a reusable loop context for map/filter/reduce.
 */
export const createLoopContext = (
    ctx: EvaluationContext
): { loopCtx: EvaluationContext; bindings: Record<string, unknown> } => {
    const bindings: Record<string, unknown> = ctx.bindings ? { ...ctx.bindings } : {};
    const loopCtx: EvaluationContext = { ...ctx, bindings };
    return { loopCtx, bindings };
};
