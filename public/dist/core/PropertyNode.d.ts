/**
 * ============================================================================
 * PROPERTY NODE
 * ============================================================================
 * Tree wrapper for Property. Provides navigation, value operations,
 * traversal, serialization, and reactive updates.
 */
import { Property } from './property';
import { Registry } from './Registry';
/**
 * Subscription callback type.
 */
export type ChangeCallback = (changedPaths: string[]) => void;
/**
 * Path filter for subscriptions.
 */
export type PathFilter = string | string[] | ((path: string) => boolean);
/**
 * Subscription handle.
 */
export interface Subscription {
    readonly id: string;
    readonly isActive: boolean;
    unsubscribe(): void;
}
/**
 * Traversal visitor function.
 * Return false to stop traversal.
 */
export type TraversalVisitor = (node: PropertyNode, path: string[]) => boolean | void;
/**
 * Predicate function for finding nodes.
 */
export type NodePredicate = (node: PropertyNode) => boolean;
/**
 * Serialized property format.
 */
export interface SerializedProperty {
    id: string;
    type: {
        id: string;
    };
    value?: unknown;
    defaultValue?: unknown;
    metadata?: Record<string, SerializedProperty>;
    constraints?: Record<string, SerializedProperty>;
    children?: Record<string, SerializedProperty>;
}
/**
 * PropertyNode - Tree wrapper for Property.
 * Provides navigation, values, traversal, serialization, and reactivity.
 */
export declare class PropertyNode {
    private readonly property;
    private registry;
    private parentNode;
    private readonly childNodes;
    private subscriptionId;
    private readonly subscriptions;
    private destroyed;
    private batchedChanges;
    constructor(property: Property);
    /**
     * Create a PropertyNode from a Property.
     */
    static create(property: Property, registry?: Registry): PropertyNode;
    /**
     * Alias for create - wraps a Property in a PropertyNode.
     */
    static wrap(property: Property, registry?: Registry): PropertyNode;
    /**
     * Create a PropertyNode from serialized JSON.
     */
    static fromJSON(json: SerializedProperty, typeResolver?: (typeId: string) => Property): PropertyNode;
    /**
     * Deep clone a Property (static utility).
     */
    static cloneProperty(property: Property): Property;
    /**
     * Set the operator registry.
     */
    setRegistry(registry: Registry): this;
    /**
     * Get the operator registry.
     */
    getRegistry(): Registry | null;
    /**
     * Get the underlying Property.
     */
    getProperty(): Property;
    /**
     * Get the property ID.
     */
    get id(): string;
    /**
     * Get the property type.
     */
    get type(): Property;
    /**
     * Get the parent node.
     */
    get parent(): PropertyNode | null;
    /**
     * Get the root node.
     */
    get root(): PropertyNode;
    /**
     * Check if this is the root node.
     */
    get isRoot(): boolean;
    /**
     * Get the depth in the tree (root = 0).
     */
    get depth(): number;
    /**
     * Get a child node by key.
     */
    child(key: string): PropertyNode | null;
    /**
     * Get all child nodes.
     */
    children(): PropertyNode[];
    /**
     * Get child keys.
     */
    childKeys(): string[];
    /**
     * Check if has children.
     */
    hasChildren(): boolean;
    /**
     * Get child count.
     */
    get childCount(): number;
    /**
     * Get node by path.
     */
    get(path: string | string[]): PropertyNode | null;
    /**
     * Get the path from root.
     */
    path(): string[];
    /**
     * Get the path as a string.
     */
    pathString(): string;
    /**
     * Get all ancestor nodes (parent to root).
     */
    ancestors(): PropertyNode[];
    /**
     * Get all descendant nodes.
     */
    descendants(): PropertyNode[];
    /**
     * Get sibling nodes.
     */
    siblings(): PropertyNode[];
    /**
     * Get next sibling.
     */
    get nextSibling(): PropertyNode | null;
    /**
     * Get previous sibling.
     */
    get previousSibling(): PropertyNode | null;
    /**
     * Get the raw value (not evaluated).
     */
    getRawValue(): unknown;
    /**
     * Set the value and optionally notify subscribers.
     */
    setValue(value: unknown, options?: {
        path?: string | string[];
        silent?: boolean;
    }): void;
    /**
     * Get the evaluated value.
     */
    getValue(path?: string | string[]): Promise<unknown>;
    /**
     * Get the default value.
     */
    getDefaultValue(): unknown;
    /**
     * Check if has default value.
     */
    hasDefaultValue(): boolean;
    /**
     * Check if has a value set.
     */
    hasValue(): boolean;
    /**
     * Check if node is empty (no value and no children).
     */
    isEmpty(): boolean;
    /**
     * Reset to default value.
     */
    reset(options?: {
        silent?: boolean;
    }): void;
    /**
     * Reset this node and all descendants.
     */
    resetDeep(options?: {
        silent?: boolean;
    }): void;
    /**
     * Get metadata keys.
     */
    metadataKeys(): string[];
    /**
     * Check if has metadata.
     */
    hasMetadata(key?: string): boolean;
    /**
     * Get raw metadata property.
     */
    getRawMetadata(key: string): Property | undefined;
    /**
     * Get evaluated metadata value.
     */
    getMetadata(key: string): Promise<unknown>;
    /**
     * Set metadata.
     */
    setMetadata(key: string, value: Property, options?: {
        silent?: boolean;
    }): void;
    /**
     * Remove metadata.
     */
    removeMetadata(key: string, options?: {
        silent?: boolean;
    }): boolean;
    /**
     * Get constraint keys.
     */
    constraintKeys(): string[];
    /**
     * Check if has constraints.
     */
    hasConstraints(key?: string): boolean;
    /**
     * Get raw constraint property.
     */
    getRawConstraint(key: string): Property | undefined;
    /**
     * Evaluate a constraint.
     * Returns true if constraint passes, false if it fails.
     *
     * Handles:
     * - Expression in value field: evaluates and returns boolean result
     * - Boolean literal in value field: returns the boolean directly
     * - No value: returns true (no constraint = passes)
     */
    getConstraint(key: string): Promise<boolean>;
    /**
     * Set constraint.
     */
    setConstraint(key: string, value: Property, options?: {
        silent?: boolean;
    }): void;
    /**
     * Remove constraint.
     */
    removeConstraint(key: string, options?: {
        silent?: boolean;
    }): boolean;
    /**
     * Validate all constraints.
     */
    validate(): Promise<{
        valid: boolean;
        errors: Record<string, string>;
    }>;
    /**
     * Validate this node and all descendants.
     */
    validateDeep(): Promise<{
        valid: boolean;
        errors: Record<string, Record<string, string>>;
    }>;
    /**
     * Add a child property.
     */
    addChild(key: string, property: Property): PropertyNode;
    /**
     * Remove a child.
     */
    removeChild(key: string): boolean;
    /**
     * Traverse the tree depth-first (pre-order).
     * Return false from visitor to stop traversal.
     */
    traverse(visitor: TraversalVisitor): void;
    private traverseInternal;
    /**
     * Traverse the tree depth-first (post-order).
     */
    traversePostOrder(visitor: TraversalVisitor): void;
    private traversePostOrderInternal;
    /**
     * Traverse the tree breadth-first.
     */
    traverseBreadthFirst(visitor: TraversalVisitor): void;
    /**
     * Find first node matching predicate.
     */
    find(predicate: NodePredicate): PropertyNode | null;
    /**
     * Find all nodes matching predicate.
     */
    findAll(predicate: NodePredicate): PropertyNode[];
    /**
     * Find node by ID.
     */
    findById(id: string): PropertyNode | null;
    /**
     * Find all nodes by type ID.
     */
    findByType(typeId: string): PropertyNode[];
    /**
     * Map over all nodes and collect results.
     */
    map<T>(fn: (node: PropertyNode, path: string[]) => T): T[];
    /**
     * Filter nodes and return matching ones.
     */
    filter(predicate: NodePredicate): PropertyNode[];
    /**
     * Reduce over all nodes.
     */
    reduce<T>(fn: (acc: T, node: PropertyNode, path: string[]) => T, initial: T): T;
    /**
     * Check if any node matches predicate.
     */
    some(predicate: NodePredicate): boolean;
    /**
     * Check if all nodes match predicate.
     */
    every(predicate: NodePredicate): boolean;
    /**
     * Count total nodes in subtree (including this).
     */
    count(): number;
    /**
     * Subscribe to changes.
     */
    subscribe(callback: ChangeCallback, filter?: PathFilter): Subscription;
    /**
     * Watch a specific path for changes.
     */
    watch(path: string | string[], callback: ChangeCallback): Subscription;
    /**
     * Emit a change notification.
     */
    emitChange(path: string | string[]): void;
    /**
     * Get this node's key in its parent.
     */
    private getKeyInParent;
    /**
     * Batch multiple changes and emit once.
     */
    batch(fn: () => void): void;
    /**
     * Execute a transaction that can be rolled back.
     */
    transaction<T>(fn: () => T): T;
    /**
     * Notify subscribers of changes.
     */
    protected notify(paths: string[]): void;
    /**
     * Filter paths based on PathFilter.
     */
    private filterPaths;
    /**
     * Unsubscribe all.
     */
    unsubscribeAll(): void;
    /**
     * Get subscription count.
     */
    get subscriptionCount(): number;
    /**
     * Serialize to JSON-safe object.
     */
    toJSON(): SerializedProperty;
    /**
     * Get a snapshot of evaluated values as key-value pairs.
     * Unlike toJSON() which returns the full schema structure,
     * snapshot() returns only the evaluated data values.
     *
     * @returns A promise resolving to an object with evaluated values
     */
    snapshot(): Promise<Record<string, unknown>>;
    /**
     * Build snapshot recursively.
     */
    private buildSnapshot;
    /**
     * Clone this node (deep copy).
     */
    clone(): PropertyNode;
    /**
     * Restore state from a snapshot.
     */
    private restoreFromSnapshot;
    /**
     * Serialize a Property to JSON-safe format.
     */
    private static serializeProperty;
    /**
     * Serialize a value (handles nested Properties).
     */
    private static serializeValue;
    /**
     * Deserialize JSON to Property.
     */
    private static deserializeProperty;
    /**
     * Deep clone a Property.
     */
    private static deepCloneProperty;
    /**
     * Deep clone a value.
     */
    private static deepCloneValue;
    /**
     * Check if this node equals another (by value).
     */
    equals(other: PropertyNode): boolean;
    /**
     * Check if two properties are equal.
     */
    private static propertyEquals;
    /**
     * Check if two values are equal.
     */
    private static valueEquals;
    /**
     * Check if destroyed.
     */
    get isDestroyed(): boolean;
    /**
     * Destroy the node and all children.
     */
    destroy(): void;
    /**
     * Check if destroyed and throw.
     */
    private checkDestroyed;
    /**
     * Create evaluation context.
     */
    private createContext;
    /**
     * Find parent of a property.
     */
    private findParentProperty;
    /**
     * Get a debug string representation.
     */
    toString(): string;
    /**
     * Print tree structure for debugging.
     */
    printTree(indent?: number): string;
}
//# sourceMappingURL=PropertyNode.d.ts.map