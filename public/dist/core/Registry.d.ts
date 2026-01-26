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
export type OperatorFn = (args: Property[], ctx: EvaluationContext) => unknown | Promise<unknown>;
/**
 * Operator Registry.
 * Stores and retrieves operator functions by name.
 */
export declare class Registry {
    private readonly operators;
    /**
     * Register an operator.
     *
     * @example
     * registry.register('add', async (args, ctx) => {
     *     const [a, b] = await evalArgs(args, ctx);
     *     return (a as number) + (b as number);
     * });
     */
    register(name: string, fn: OperatorFn): this;
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
    unregister(name: string): boolean;
    /**
     * Get an operator by name.
     */
    get(name: string): OperatorFn | undefined;
    /**
     * Check if an operator exists.
     */
    has(name: string): boolean;
    /**
     * Get all registered operator names.
     */
    keys(): IterableIterator<string>;
    /**
     * Get the number of registered operators.
     */
    get size(): number;
    /**
     * Remove all registered operators.
     */
    clear(): this;
}
/**
 * Create a new empty registry.
 */
export declare const createRegistry: () => Registry;
//# sourceMappingURL=Registry.d.ts.map