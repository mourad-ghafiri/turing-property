/**
 * ============================================================================
 * PROPERTY NODE
 * ============================================================================
 * Tree wrapper for Property. Provides navigation, value operations,
 * traversal, serialization, and reactive updates.
 */

import { Property } from './property';
import { Registry, EvaluationContext } from './Registry';
import { evaluate } from './Evaluator';
import { isExpr, isProperty } from './guards';

// ============================================================================
// TYPES
// ============================================================================

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
    type: { id: string };
    value?: unknown;
    defaultValue?: unknown;
    metadata?: Record<string, SerializedProperty>;
    constraints?: Record<string, SerializedProperty>;
    children?: Record<string, SerializedProperty>;
}

// ============================================================================
// PROPERTY NODE CLASS
// ============================================================================

/**
 * PropertyNode - Tree wrapper for Property.
 * Provides navigation, values, traversal, serialization, and reactivity.
 */
export class PropertyNode {
    private readonly property: Property;
    private registry: Registry | null = null;
    private parentNode: PropertyNode | null = null;
    private readonly childNodes = new Map<string, PropertyNode>();
    private subscriptionId = 0;
    private readonly subscriptions = new Map<string, {
        callback: ChangeCallback;
        filter?: PathFilter;
    }>();
    private destroyed = false;
    private batchedChanges: string[] | null = null;

    constructor(property: Property) {
        this.property = property;
    }

    // ========================================================================
    // STATIC FACTORY METHODS
    // ========================================================================

    /**
     * Create a PropertyNode from a Property.
     */
    static create(property: Property, registry?: Registry): PropertyNode {
        const node = new PropertyNode(property);
        if (registry) {
            node.setRegistry(registry);
        }
        return node;
    }

    /**
     * Alias for create - wraps a Property in a PropertyNode.
     */
    static wrap(property: Property, registry?: Registry): PropertyNode {
        return PropertyNode.create(property, registry);
    }

    /**
     * Create a PropertyNode from serialized JSON.
     */
    static fromJSON(json: SerializedProperty, typeResolver?: (typeId: string) => Property): PropertyNode {
        const property = PropertyNode.deserializeProperty(json, typeResolver);
        return new PropertyNode(property);
    }

    /**
     * Deep clone a Property (static utility).
     */
    static cloneProperty(property: Property): Property {
        return PropertyNode.deepCloneProperty(property);
    }

    // ========================================================================
    // REGISTRY
    // ========================================================================

    /**
     * Set the operator registry.
     */
    setRegistry(registry: Registry): this {
        this.registry = registry;
        return this;
    }

    /**
     * Get the operator registry.
     */
    getRegistry(): Registry | null {
        return this.registry ?? this.parentNode?.getRegistry() ?? null;
    }

    // ========================================================================
    // PROPERTY ACCESS
    // ========================================================================

    /**
     * Get the underlying Property.
     */
    getProperty(): Property {
        return this.property;
    }

    /**
     * Get the property ID.
     */
    get id(): string {
        return this.property.id;
    }

    /**
     * Get the property type.
     */
    get type(): Property {
        return this.property.type;
    }

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    /**
     * Get the parent node.
     */
    get parent(): PropertyNode | null {
        return this.parentNode;
    }

    /**
     * Get the root node.
     */
    get root(): PropertyNode {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node: PropertyNode = this;
        while (node.parentNode) {
            node = node.parentNode;
        }
        return node;
    }

    /**
     * Check if this is the root node.
     */
    get isRoot(): boolean {
        return this.parentNode === null;
    }

    /**
     * Get the depth in the tree (root = 0).
     */
    get depth(): number {
        let d = 0;
        let node = this.parentNode;
        while (node) {
            d++;
            node = node.parentNode;
        }
        return d;
    }

    /**
     * Get a child node by key.
     */
    child(key: string): PropertyNode | null {
        if (!this.property.children?.[key]) return null;

        let node = this.childNodes.get(key);
        if (!node) {
            node = new PropertyNode(this.property.children[key]!);
            node.parentNode = this;
            node.registry = this.registry;
            this.childNodes.set(key, node);
        }
        return node;
    }

    /**
     * Get all child nodes.
     */
    children(): PropertyNode[] {
        if (!this.property.children) return [];
        return Object.keys(this.property.children).map(key => this.child(key)!);
    }

    /**
     * Get child keys.
     */
    childKeys(): string[] {
        return this.property.children ? Object.keys(this.property.children) : [];
    }

    /**
     * Check if has children.
     */
    hasChildren(): boolean {
        return this.property.children !== undefined &&
               Object.keys(this.property.children).length > 0;
    }

    /**
     * Get child count.
     */
    get childCount(): number {
        return this.property.children ? Object.keys(this.property.children).length : 0;
    }

    /**
     * Get node by path.
     */
    get(path: string | string[]): PropertyNode | null {
        const parts = typeof path === 'string' ? path.split('.') : path;
        if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
            return this;
        }

        let node: PropertyNode | null = this;
        for (const part of parts) {
            if (!node) return null;
            node = node.child(part);
        }
        return node;
    }

    /**
     * Get the path from root.
     */
    path(): string[] {
        const parts: string[] = [];
        let node: PropertyNode | null = this;

        while (node?.parentNode) {
            const parentProp = node.parentNode.property;
            if (parentProp.children) {
                for (const [key, child] of Object.entries(parentProp.children)) {
                    if (child === node.property) {
                        parts.unshift(key);
                        break;
                    }
                }
            }
            node = node.parentNode;
        }

        return parts;
    }

    /**
     * Get the path as a string.
     */
    pathString(): string {
        return this.path().join('.');
    }

    /**
     * Get all ancestor nodes (parent to root).
     */
    ancestors(): PropertyNode[] {
        const result: PropertyNode[] = [];
        let node = this.parentNode;
        while (node) {
            result.push(node);
            node = node.parentNode;
        }
        return result;
    }

    /**
     * Get all descendant nodes.
     */
    descendants(): PropertyNode[] {
        const result: PropertyNode[] = [];
        this.traverse((node) => {
            if (node !== this) {
                result.push(node);
            }
        });
        return result;
    }

    /**
     * Get sibling nodes.
     */
    siblings(): PropertyNode[] {
        if (!this.parentNode) return [];
        return this.parentNode.children().filter(n => n !== this);
    }

    /**
     * Get next sibling.
     */
    get nextSibling(): PropertyNode | null {
        if (!this.parentNode) return null;
        const keys = this.parentNode.childKeys();
        const myPath = this.path();
        const myKey = myPath[myPath.length - 1];
        const idx = keys.indexOf(myKey!);
        if (idx >= 0 && idx < keys.length - 1) {
            return this.parentNode.child(keys[idx + 1]!);
        }
        return null;
    }

    /**
     * Get previous sibling.
     */
    get previousSibling(): PropertyNode | null {
        if (!this.parentNode) return null;
        const keys = this.parentNode.childKeys();
        const myPath = this.path();
        const myKey = myPath[myPath.length - 1];
        const idx = keys.indexOf(myKey!);
        if (idx > 0) {
            return this.parentNode.child(keys[idx - 1]!);
        }
        return null;
    }

    // ========================================================================
    // VALUES
    // ========================================================================

    /**
     * Get the raw value (not evaluated).
     */
    getRawValue(): unknown {
        return this.property.value;
    }

    /**
     * Set the value and optionally notify subscribers.
     */
    setValue(value: unknown, options?: { path?: string | string[]; silent?: boolean }): void {
        this.checkDestroyed();

        const path = options?.path;
        const silent = options?.silent ?? false;

        if (path) {
            const node = this.get(path);
            if (node) {
                (node.property as { value: unknown }).value = value;
                if (!silent) {
                    const targetPath = typeof path === 'string' ? path : path.join('.');
                    this.emitChange(targetPath);
                }
            }
        } else {
            (this.property as { value: unknown }).value = value;
            if (!silent) {
                // Emit empty path - we're changing this node's value
                // Parent propagation will build the full path
                this.emitChange('');
            }
        }
    }

    /**
     * Get the evaluated value.
     */
    async getValue(path?: string | string[]): Promise<unknown> {
        this.checkDestroyed();

        const node = path ? this.get(path) : this;
        if (!node) return undefined;

        const registry = this.getRegistry();
        if (!registry) {
            throw new Error('No registry set. Call setRegistry() first.');
        }

        const prop = node.property;
        const ctx = this.createContext(node);

        // If the property itself is an expression, evaluate it
        if (isExpr(prop)) {
            return evaluate(prop, ctx);
        }

        // If the value is a Property expression, evaluate it
        if (prop.value !== undefined && isProperty(prop.value) && isExpr(prop.value)) {
            return evaluate(prop.value, ctx);
        }

        return prop.value;
    }

    /**
     * Get the default value.
     */
    getDefaultValue(): unknown {
        return this.property.defaultValue;
    }

    /**
     * Check if has default value.
     */
    hasDefaultValue(): boolean {
        return this.property.defaultValue !== undefined;
    }

    /**
     * Check if has a value set.
     */
    hasValue(): boolean {
        return this.property.value !== undefined;
    }

    /**
     * Check if node is empty (no value and no children).
     */
    isEmpty(): boolean {
        return !this.hasValue() && !this.hasChildren();
    }

    /**
     * Reset to default value.
     */
    reset(options?: { silent?: boolean }): void {
        this.checkDestroyed();
        if (this.hasDefaultValue()) {
            this.setValue(this.property.defaultValue, { silent: options?.silent });
        }
    }

    /**
     * Reset this node and all descendants.
     */
    resetDeep(options?: { silent?: boolean }): void {
        const silent = options?.silent ?? false;

        if (silent) {
            this.reset({ silent: true });
            for (const child of this.children()) {
                child.resetDeep({ silent: true });
            }
        } else {
            this.batch(() => {
                this.reset({ silent: true });
                for (const child of this.children()) {
                    child.resetDeep({ silent: true });
                }
            });
        }
    }

    // ========================================================================
    // METADATA
    // ========================================================================

    /**
     * Get metadata keys.
     */
    metadataKeys(): string[] {
        return this.property.metadata ? Object.keys(this.property.metadata) : [];
    }

    /**
     * Check if has metadata.
     */
    hasMetadata(key?: string): boolean {
        if (key) {
            return this.property.metadata?.[key] !== undefined;
        }
        return this.property.metadata !== undefined &&
               Object.keys(this.property.metadata).length > 0;
    }

    /**
     * Get raw metadata property.
     */
    getRawMetadata(key: string): Property | undefined {
        return this.property.metadata?.[key];
    }

    /**
     * Get evaluated metadata value.
     */
    async getMetadata(key: string): Promise<unknown> {
        this.checkDestroyed();

        const meta = this.property.metadata?.[key];
        if (!meta) return undefined;

        const registry = this.getRegistry();
        if (!registry) {
            throw new Error('No registry set. Call setRegistry() first.');
        }

        if (isExpr(meta)) {
            const ctx = this.createContext(this);
            return evaluate(meta, ctx);
        }

        return meta.value;
    }

    /**
     * Set metadata.
     */
    setMetadata(key: string, value: Property, options?: { silent?: boolean }): void {
        this.checkDestroyed();

        if (!this.property.metadata) {
            (this.property as { metadata: Record<string, Property> }).metadata = {};
        }
        this.property.metadata![key] = value;

        if (!options?.silent) {
            this.emitChange(`metadata.${key}`);
        }
    }

    /**
     * Remove metadata.
     */
    removeMetadata(key: string, options?: { silent?: boolean }): boolean {
        this.checkDestroyed();
        if (this.property.metadata?.[key]) {
            delete this.property.metadata[key];
            if (!options?.silent) {
                this.emitChange(`metadata.${key}`);
            }
            return true;
        }
        return false;
    }

    // ========================================================================
    // CONSTRAINTS
    // ========================================================================

    /**
     * Get constraint keys.
     */
    constraintKeys(): string[] {
        return this.property.constraints ? Object.keys(this.property.constraints) : [];
    }

    /**
     * Check if has constraints.
     */
    hasConstraints(key?: string): boolean {
        if (key) {
            return this.property.constraints?.[key] !== undefined;
        }
        return this.property.constraints !== undefined &&
               Object.keys(this.property.constraints).length > 0;
    }

    /**
     * Get raw constraint property.
     */
    getRawConstraint(key: string): Property | undefined {
        return this.property.constraints?.[key];
    }

    /**
     * Evaluate a constraint.
     * Returns true if constraint passes, false if it fails.
     *
     * Handles:
     * - Expression in value field: evaluates and returns boolean result
     * - Boolean literal in value field: returns the boolean directly
     * - No value: returns true (no constraint = passes)
     */
    async getConstraint(key: string): Promise<boolean> {
        this.checkDestroyed();

        const constraint = this.property.constraints?.[key];
        if (!constraint) return true;

        // No value defined - constraint passes
        if (constraint.value === undefined) {
            return true;
        }

        // Boolean literal value - use directly
        if (typeof constraint.value === 'boolean') {
            return constraint.value;
        }

        // Expression in value field - evaluate it (requires registry)
        if (isExpr(constraint.value as Property)) {
            const registry = this.getRegistry();
            if (!registry) {
                throw new Error('No registry set. Call setRegistry() first.');
            }
            const ctx = this.createContext(this);
            const result = await evaluate(constraint.value as Property, ctx);
            return Boolean(result);
        }

        // Non-expression, non-boolean value - treat as truthy check
        return Boolean(constraint.value);
    }

    /**
     * Set constraint.
     */
    setConstraint(key: string, value: Property, options?: { silent?: boolean }): void {
        this.checkDestroyed();

        if (!this.property.constraints) {
            (this.property as { constraints: Record<string, Property> }).constraints = {};
        }
        this.property.constraints![key] = value;

        if (!options?.silent) {
            this.emitChange(`constraints.${key}`);
        }
    }

    /**
     * Remove constraint.
     */
    removeConstraint(key: string, options?: { silent?: boolean }): boolean {
        this.checkDestroyed();
        if (this.property.constraints?.[key]) {
            delete this.property.constraints[key];
            if (!options?.silent) {
                this.emitChange(`constraints.${key}`);
            }
            return true;
        }
        return false;
    }

    /**
     * Validate all constraints.
     */
    async validate(): Promise<{ valid: boolean; errors: Record<string, string> }> {
        this.checkDestroyed();

        const errors: Record<string, string> = {};

        if (this.property.constraints) {
            for (const [key, constraint] of Object.entries(this.property.constraints)) {
                const isValid = await this.getConstraint(key);
                if (!isValid) {
                    const message = constraint.metadata?.message;
                    errors[key] = message?.value as string ?? `Constraint ${key} failed`;
                }
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate this node and all descendants.
     */
    async validateDeep(): Promise<{
        valid: boolean;
        errors: Record<string, Record<string, string>>
    }> {
        this.checkDestroyed();

        const allErrors: Record<string, Record<string, string>> = {};
        const nodesToValidate: Array<{ node: PropertyNode; path: string[] }> = [];

        // Collect all nodes first (sync)
        this.traverse((node, nodePath) => {
            nodesToValidate.push({ node, path: [...nodePath] });
        });

        // Validate all nodes (async)
        for (const { node, path } of nodesToValidate) {
            const result = await node.validate();
            if (!result.valid) {
                allErrors[path.join('.') || 'root'] = result.errors;
            }
        }

        return {
            valid: Object.keys(allErrors).length === 0,
            errors: allErrors,
        };
    }

    // ========================================================================
    // CHILDREN MANIPULATION
    // ========================================================================

    /**
     * Add a child property.
     */
    addChild(key: string, property: Property): PropertyNode {
        this.checkDestroyed();

        if (!this.property.children) {
            (this.property as { children: Record<string, Property> }).children = {};
        }
        this.property.children![key] = property;

        // Clear cached node if exists
        this.childNodes.delete(key);

        return this.child(key)!;
    }

    /**
     * Remove a child.
     */
    removeChild(key: string): boolean {
        this.checkDestroyed();

        if (this.property.children?.[key]) {
            // Destroy the cached node if exists
            const cachedNode = this.childNodes.get(key);
            if (cachedNode) {
                cachedNode.destroy();
            }
            this.childNodes.delete(key);
            delete this.property.children[key];
            return true;
        }
        return false;
    }

    // ========================================================================
    // TRAVERSAL
    // ========================================================================

    /**
     * Traverse the tree depth-first (pre-order).
     * Return false from visitor to stop traversal.
     */
    traverse(visitor: TraversalVisitor): void {
        this.traverseInternal(visitor, []);
    }

    private traverseInternal(visitor: TraversalVisitor, currentPath: string[]): boolean {
        const result = visitor(this, currentPath);
        if (result === false) return false;

        for (const key of this.childKeys()) {
            const child = this.child(key);
            if (child) {
                const shouldContinue = child.traverseInternal(visitor, [...currentPath, key]);
                if (!shouldContinue) return false;
            }
        }
        return true;
    }

    /**
     * Traverse the tree depth-first (post-order).
     */
    traversePostOrder(visitor: TraversalVisitor): void {
        this.traversePostOrderInternal(visitor, []);
    }

    private traversePostOrderInternal(visitor: TraversalVisitor, currentPath: string[]): boolean {
        for (const key of this.childKeys()) {
            const child = this.child(key);
            if (child) {
                const shouldContinue = child.traversePostOrderInternal(visitor, [...currentPath, key]);
                if (!shouldContinue) return false;
            }
        }

        const result = visitor(this, currentPath);
        return result !== false;
    }

    /**
     * Traverse the tree breadth-first.
     */
    traverseBreadthFirst(visitor: TraversalVisitor): void {
        const queue: Array<{ node: PropertyNode; path: string[] }> = [{ node: this, path: [] }];

        while (queue.length > 0) {
            const { node, path } = queue.shift()!;
            const result = visitor(node, path);
            if (result === false) return;

            for (const key of node.childKeys()) {
                const child = node.child(key);
                if (child) {
                    queue.push({ node: child, path: [...path, key] });
                }
            }
        }
    }

    /**
     * Find first node matching predicate.
     */
    find(predicate: NodePredicate): PropertyNode | null {
        let found: PropertyNode | null = null;
        this.traverse((node) => {
            if (predicate(node)) {
                found = node;
                return false; // Stop traversal
            }
        });
        return found;
    }

    /**
     * Find all nodes matching predicate.
     */
    findAll(predicate: NodePredicate): PropertyNode[] {
        const result: PropertyNode[] = [];
        this.traverse((node) => {
            if (predicate(node)) {
                result.push(node);
            }
        });
        return result;
    }

    /**
     * Find node by ID.
     */
    findById(id: string): PropertyNode | null {
        return this.find(node => node.id === id);
    }

    /**
     * Find all nodes by type ID.
     */
    findByType(typeId: string): PropertyNode[] {
        return this.findAll(node => node.type.id === typeId);
    }

    /**
     * Map over all nodes and collect results.
     */
    map<T>(fn: (node: PropertyNode, path: string[]) => T): T[] {
        const results: T[] = [];
        this.traverse((node, path) => {
            results.push(fn(node, path));
        });
        return results;
    }

    /**
     * Filter nodes and return matching ones.
     */
    filter(predicate: NodePredicate): PropertyNode[] {
        return this.findAll(predicate);
    }

    /**
     * Reduce over all nodes.
     */
    reduce<T>(fn: (acc: T, node: PropertyNode, path: string[]) => T, initial: T): T {
        let result = initial;
        this.traverse((node, path) => {
            result = fn(result, node, path);
        });
        return result;
    }

    /**
     * Check if any node matches predicate.
     */
    some(predicate: NodePredicate): boolean {
        return this.find(predicate) !== null;
    }

    /**
     * Check if all nodes match predicate.
     */
    every(predicate: NodePredicate): boolean {
        let allMatch = true;
        this.traverse((node) => {
            if (!predicate(node)) {
                allMatch = false;
                return false;
            }
        });
        return allMatch;
    }

    /**
     * Count total nodes in subtree (including this).
     */
    count(): number {
        let n = 0;
        this.traverse(() => { n++; });
        return n;
    }

    // ========================================================================
    // SUBSCRIPTIONS & REACTIVITY
    // ========================================================================

    /**
     * Subscribe to changes.
     */
    subscribe(callback: ChangeCallback, filter?: PathFilter): Subscription {
        this.checkDestroyed();

        const id = `sub_${++this.subscriptionId}`;
        const subscriptions = this.subscriptions;
        subscriptions.set(id, { callback, filter });

        return {
            id,
            get isActive(): boolean {
                return subscriptions.has(id);
            },
            unsubscribe(): void {
                subscriptions.delete(id);
            },
        };
    }

    /**
     * Watch a specific path for changes.
     */
    watch(path: string | string[], callback: ChangeCallback): Subscription {
        const pathStr = typeof path === 'string' ? path : path.join('.');
        return this.subscribe(callback, pathStr);
    }

    /**
     * Emit a change notification.
     */
    emitChange(path: string | string[]): void {
        const pathStr = typeof path === 'string' ? path : path.join('.');

        if (this.batchedChanges !== null) {
            this.batchedChanges.push(pathStr);
        } else {
            this.notify([pathStr]);
            // Propagate to parent with this node's key prepended
            if (this.parentNode) {
                const myKey = this.getKeyInParent();
                if (myKey !== null) {
                    const parentPath = pathStr ? `${myKey}.${pathStr}` : myKey;
                    this.parentNode.emitChange(parentPath);
                }
            }
        }
    }

    /**
     * Get this node's key in its parent.
     */
    private getKeyInParent(): string | null {
        if (!this.parentNode) return null;
        const parentChildren = this.parentNode.property.children;
        if (!parentChildren) return null;
        for (const [key, child] of Object.entries(parentChildren)) {
            if (child === this.property) {
                return key;
            }
        }
        return null;
    }

    /**
     * Batch multiple changes and emit once.
     */
    batch(fn: () => void): void {
        if (this.batchedChanges !== null) {
            // Already in a batch, just execute
            fn();
            return;
        }

        this.batchedChanges = [];
        try {
            fn();
            if (this.batchedChanges.length > 0) {
                const uniquePaths = [...new Set(this.batchedChanges)];
                this.notify(uniquePaths);
            }
        } finally {
            this.batchedChanges = null;
        }
    }

    /**
     * Execute a transaction that can be rolled back.
     */
    transaction<T>(fn: () => T): T {
        const snapshot = this.toJSON();
        try {
            return fn();
        } catch (error) {
            // Rollback
            this.restoreFromSnapshot(snapshot);
            throw error;
        }
    }

    /**
     * Notify subscribers of changes.
     */
    protected notify(paths: string[]): void {
        for (const { callback, filter } of this.subscriptions.values()) {
            const filtered = filter ? this.filterPaths(paths, filter) : paths;
            if (filtered.length > 0) {
                callback(filtered);
            }
        }
    }

    /**
     * Filter paths based on PathFilter.
     */
    private filterPaths(paths: string[], filter: PathFilter): string[] {
        if (typeof filter === 'string') {
            return paths.filter(p => p === filter || p.startsWith(filter + '.'));
        }
        if (Array.isArray(filter)) {
            return paths.filter(p =>
                filter.some(f => p === f || p.startsWith(f + '.'))
            );
        }
        return paths.filter(filter);
    }

    /**
     * Unsubscribe all.
     */
    unsubscribeAll(): void {
        this.subscriptions.clear();
    }

    /**
     * Get subscription count.
     */
    get subscriptionCount(): number {
        return this.subscriptions.size;
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================

    /**
     * Serialize to JSON-safe object.
     */
    toJSON(): SerializedProperty {
        return PropertyNode.serializeProperty(this.property);
    }

    /**
     * Get a snapshot of evaluated values as key-value pairs.
     * Unlike toJSON() which returns the full schema structure,
     * snapshot() returns only the evaluated data values.
     *
     * @returns A promise resolving to an object with evaluated values
     */
    async snapshot(): Promise<Record<string, unknown>> {
        this.checkDestroyed();
        return this.buildSnapshot();
    }

    /**
     * Build snapshot recursively.
     */
    private async buildSnapshot(): Promise<Record<string, unknown>> {
        const result: Record<string, unknown> = {};

        // If this node has a value, evaluate it
        if (this.hasValue()) {
            const value = await this.getValue();
            // For leaf nodes with values, return the value directly
            if (!this.hasChildren()) {
                return value as Record<string, unknown>;
            }
            // If it has both value and children, store value under special key
            result._value = value;
        }

        // Process children
        for (const key of this.childKeys()) {
            const child = this.child(key);
            if (child) {
                if (child.hasChildren()) {
                    // Recursively build snapshot for children with their own children
                    result[key] = await child.buildSnapshot();
                } else {
                    // Leaf node - get evaluated value
                    result[key] = await child.getValue();
                }
            }
        }

        return result;
    }

    /**
     * Clone this node (deep copy).
     */
    clone(): PropertyNode {
        const clonedProperty = PropertyNode.deepCloneProperty(this.property);
        const clonedNode = new PropertyNode(clonedProperty);
        if (this.registry) {
            clonedNode.setRegistry(this.registry);
        }
        return clonedNode;
    }

    /**
     * Restore state from a snapshot.
     */
    private restoreFromSnapshot(snapshot: SerializedProperty): void {
        // Restore value
        if (snapshot.value !== undefined) {
            (this.property as { value: unknown }).value = snapshot.value;
        }

        // Restore children values recursively
        if (snapshot.children && this.property.children) {
            for (const [key, childSnapshot] of Object.entries(snapshot.children)) {
                const child = this.child(key);
                if (child) {
                    child.restoreFromSnapshot(childSnapshot);
                }
            }
        }
    }

    /**
     * Serialize a Property to JSON-safe format.
     */
    private static serializeProperty(property: Property): SerializedProperty {
        const result: SerializedProperty = {
            id: property.id,
            type: { id: property.type.id },
        };

        if (property.value !== undefined) {
            result.value = PropertyNode.serializeValue(property.value);
        }

        if (property.defaultValue !== undefined) {
            result.defaultValue = PropertyNode.serializeValue(property.defaultValue);
        }

        if (property.metadata) {
            result.metadata = {};
            for (const [key, meta] of Object.entries(property.metadata)) {
                result.metadata[key] = PropertyNode.serializeProperty(meta);
            }
        }

        if (property.constraints) {
            result.constraints = {};
            for (const [key, constraint] of Object.entries(property.constraints)) {
                result.constraints[key] = PropertyNode.serializeProperty(constraint);
            }
        }

        if (property.children) {
            result.children = {};
            for (const [key, child] of Object.entries(property.children)) {
                result.children[key] = PropertyNode.serializeProperty(child);
            }
        }

        return result;
    }

    /**
     * Serialize a value (handles nested Properties).
     */
    private static serializeValue(value: unknown): unknown {
        if (isProperty(value)) {
            return PropertyNode.serializeProperty(value);
        }
        if (Array.isArray(value)) {
            return value.map(v => PropertyNode.serializeValue(v));
        }
        if (value && typeof value === 'object') {
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(value)) {
                result[k] = PropertyNode.serializeValue(v);
            }
            return result;
        }
        return value;
    }

    /**
     * Deserialize JSON to Property.
     */
    private static deserializeProperty(
        json: SerializedProperty,
        typeResolver?: (typeId: string) => Property
    ): Property {
        const type = typeResolver
            ? typeResolver(json.type.id)
            : { id: json.type.id, type: null as unknown as Property };

        const property: Property = {
            id: json.id,
            type,
        };

        if (json.value !== undefined) {
            (property as { value: unknown }).value = json.value;
        }

        if (json.defaultValue !== undefined) {
            (property as { defaultValue: unknown }).defaultValue = json.defaultValue;
        }

        if (json.metadata) {
            (property as { metadata: Record<string, Property> }).metadata = {};
            for (const [key, meta] of Object.entries(json.metadata)) {
                property.metadata![key] = PropertyNode.deserializeProperty(meta, typeResolver);
            }
        }

        if (json.constraints) {
            (property as { constraints: Record<string, Property> }).constraints = {};
            for (const [key, constraint] of Object.entries(json.constraints)) {
                property.constraints![key] = PropertyNode.deserializeProperty(constraint, typeResolver);
            }
        }

        if (json.children) {
            (property as { children: Record<string, Property> }).children = {};
            for (const [key, child] of Object.entries(json.children)) {
                property.children![key] = PropertyNode.deserializeProperty(child, typeResolver);
            }
        }

        return property;
    }

    /**
     * Deep clone a Property.
     */
    private static deepCloneProperty(property: Property): Property {
        const cloned: Property = {
            id: property.id,
            type: property.type, // Types are shared, not cloned
        };

        if (property.value !== undefined) {
            (cloned as { value: unknown }).value = PropertyNode.deepCloneValue(property.value);
        }

        if (property.defaultValue !== undefined) {
            (cloned as { defaultValue: unknown }).defaultValue =
                PropertyNode.deepCloneValue(property.defaultValue);
        }

        if (property.metadata) {
            (cloned as { metadata: Record<string, Property> }).metadata = {};
            for (const [key, meta] of Object.entries(property.metadata)) {
                cloned.metadata![key] = PropertyNode.deepCloneProperty(meta);
            }
        }

        if (property.constraints) {
            (cloned as { constraints: Record<string, Property> }).constraints = {};
            for (const [key, constraint] of Object.entries(property.constraints)) {
                cloned.constraints![key] = PropertyNode.deepCloneProperty(constraint);
            }
        }

        if (property.children) {
            (cloned as { children: Record<string, Property> }).children = {};
            for (const [key, child] of Object.entries(property.children)) {
                cloned.children![key] = PropertyNode.deepCloneProperty(child);
            }
        }

        return cloned;
    }

    /**
     * Deep clone a value.
     */
    private static deepCloneValue(value: unknown): unknown {
        if (value === null || value === undefined) {
            return value;
        }
        if (isProperty(value)) {
            return PropertyNode.deepCloneProperty(value);
        }
        if (Array.isArray(value)) {
            return value.map(v => PropertyNode.deepCloneValue(v));
        }
        if (typeof value === 'object') {
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(value)) {
                result[k] = PropertyNode.deepCloneValue(v);
            }
            return result;
        }
        return value;
    }

    // ========================================================================
    // COMPARISON
    // ========================================================================

    /**
     * Check if this node equals another (by value).
     */
    equals(other: PropertyNode): boolean {
        return PropertyNode.propertyEquals(this.property, other.property);
    }

    /**
     * Check if two properties are equal.
     */
    private static propertyEquals(a: Property, b: Property): boolean {
        if (a.id !== b.id) return false;
        if (a.type.id !== b.type.id) return false;
        if (!PropertyNode.valueEquals(a.value, b.value)) return false;
        if (!PropertyNode.valueEquals(a.defaultValue, b.defaultValue)) return false;

        // Compare children
        const aChildKeys = a.children ? Object.keys(a.children) : [];
        const bChildKeys = b.children ? Object.keys(b.children) : [];
        if (aChildKeys.length !== bChildKeys.length) return false;
        for (const key of aChildKeys) {
            if (!b.children?.[key]) return false;
            if (!PropertyNode.propertyEquals(a.children![key]!, b.children[key]!)) return false;
        }

        // Compare metadata
        const aMetaKeys = a.metadata ? Object.keys(a.metadata) : [];
        const bMetaKeys = b.metadata ? Object.keys(b.metadata) : [];
        if (aMetaKeys.length !== bMetaKeys.length) return false;
        for (const key of aMetaKeys) {
            if (!b.metadata?.[key]) return false;
            if (!PropertyNode.propertyEquals(a.metadata![key]!, b.metadata[key]!)) return false;
        }

        // Compare constraints
        const aConstKeys = a.constraints ? Object.keys(a.constraints) : [];
        const bConstKeys = b.constraints ? Object.keys(b.constraints) : [];
        if (aConstKeys.length !== bConstKeys.length) return false;
        for (const key of aConstKeys) {
            if (!b.constraints?.[key]) return false;
            if (!PropertyNode.propertyEquals(a.constraints![key]!, b.constraints[key]!)) return false;
        }

        return true;
    }

    /**
     * Check if two values are equal.
     */
    private static valueEquals(a: unknown, b: unknown): boolean {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a === undefined || b === undefined) return false;

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((v, i) => PropertyNode.valueEquals(v, b[i]));
        }

        if (typeof a === 'object' && typeof b === 'object') {
            if (isProperty(a) && isProperty(b)) {
                return PropertyNode.propertyEquals(a, b);
            }
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            return aKeys.every(key =>
                PropertyNode.valueEquals(
                    (a as Record<string, unknown>)[key],
                    (b as Record<string, unknown>)[key]
                )
            );
        }

        return false;
    }

    // ========================================================================
    // LIFECYCLE
    // ========================================================================

    /**
     * Check if destroyed.
     */
    get isDestroyed(): boolean {
        return this.destroyed;
    }

    /**
     * Destroy the node and all children.
     */
    destroy(): void {
        // Destroy children first
        for (const child of this.childNodes.values()) {
            child.destroy();
        }

        this.destroyed = true;
        this.subscriptions.clear();
        this.childNodes.clear();
        this.parentNode = null;
    }

    /**
     * Check if destroyed and throw.
     */
    private checkDestroyed(): void {
        if (this.destroyed) {
            throw new Error('PropertyNode has been destroyed');
        }
    }

    // ========================================================================
    // CONTEXT
    // ========================================================================

    /**
     * Create evaluation context.
     */
    private createContext(node: PropertyNode): EvaluationContext {
        const registry = this.getRegistry();
        if (!registry) {
            throw new Error('No registry set');
        }

        return {
            current: node.property,
            root: this.root.property,
            registry,
            findParent: (target: Property) => this.findParentProperty(target),
        };
    }

    /**
     * Find parent of a property.
     */
    private findParentProperty(target: Property): Property | undefined {
        const search = (node: PropertyNode): Property | undefined => {
            if (node.property === target) {
                return node.parentNode?.property;
            }
            for (const child of node.children()) {
                const found = search(child);
                if (found) return found;
            }
            return undefined;
        };
        return search(this.root);
    }

    // ========================================================================
    // DEBUG
    // ========================================================================

    /**
     * Get a debug string representation.
     */
    toString(): string {
        return `PropertyNode(${this.id}, type=${this.type.id}, path=${this.pathString() || 'root'})`;
    }

    /**
     * Print tree structure for debugging.
     */
    printTree(indent = 0): string {
        const lines: string[] = [];
        const prefix = '  '.repeat(indent);
        const value = this.property.value !== undefined ? ` = ${JSON.stringify(this.property.value)}` : '';
        lines.push(`${prefix}${this.id} (${this.type.id})${value}`);

        for (const key of this.childKeys()) {
            const childNode = this.child(key);
            if (childNode) {
                lines.push(`${prefix}  [${key}]:`);
                lines.push(childNode.printTree(indent + 2));
            }
        }

        return lines.join('\n');
    }
}
