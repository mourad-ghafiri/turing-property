/**
 * ============================================================================
 * OPERATOR REGISTRY
 * ============================================================================
 * Registry for operator functions.
 * Operators are registered by name and invoked during evaluation.
 */

import { Property } from './property';

/**
 * Evaluation context passed to operators.
 */
export interface EvaluationContext {
    /** The current property being evaluated */
    readonly current: Property;

    /** The root of the property tree */
    readonly root: Property;

    /** The operator registry */
    readonly registry: Registry;

    /** Variable bindings (for map/filter/reduce) */
    readonly bindings?: Record<string, unknown>;

    /** Evaluation depth (for circular reference detection) */
    readonly depth?: number;

    /** Parent lookup function */
    readonly findParent?: (target: Property) => Property | undefined;
}

/**
 * Operator function signature.
 * Receives arguments (unevaluated Properties) and context.
 * Returns evaluated value (can be async).
 */
export type OperatorFn = (
    args: Property[],
    ctx: EvaluationContext
) => unknown | Promise<unknown>;

/**
 * Operator Registry.
 * Stores and retrieves operator functions by name.
 */
export class Registry {
    private readonly operators = new Map<string, OperatorFn>();

    /**
     * Register an operator.
     *
     * @example
     * registry.register('add', async (args, ctx) => {
     *     const [a, b] = await evalArgs(args, ctx);
     *     return (a as number) + (b as number);
     * });
     */
    register(name: string, fn: OperatorFn): this {
        this.operators.set(name, fn);
        return this;
    }

    /**
     * Unregister an operator.
     * Returns true if the operator existed and was removed.
     *
     * @example
     * registry.unregister('add'); // Returns true if 'add' was registered
     *
     * Note: After unregistering, any op() expressions using this operator
     * will throw "Unknown operator" when evaluated.
     */
    unregister(name: string): boolean {
        return this.operators.delete(name);
    }

    /**
     * Get an operator by name.
     */
    get(name: string): OperatorFn | undefined {
        return this.operators.get(name);
    }

    /**
     * Check if an operator exists.
     */
    has(name: string): boolean {
        return this.operators.has(name);
    }

    /**
     * Get all registered operator names.
     */
    keys(): IterableIterator<string> {
        return this.operators.keys();
    }

    /**
     * Get the number of registered operators.
     */
    get size(): number {
        return this.operators.size;
    }

    /**
     * Remove all registered operators.
     */
    clear(): this {
        this.operators.clear();
        return this;
    }
}

/**
 * Create a new empty registry.
 */
export const createRegistry = (): Registry => new Registry();
