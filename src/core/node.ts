// ============================================================================
// PROPERTY NODE - THE UNIVERSAL WRAPPER
// ============================================================================
// PropertyNode wraps a Property and provides methods for tree navigation,
// value evaluation, and mutations.

import { Property } from './property';
import { EvaluationContext, EvaluationCache, OperatorRegistry, evaluate, createCache } from './evaluate';

// ============================================================================
// PROPERTY NODE CLASS
// ============================================================================

export class PropertyNode implements Property {
    id: string;
    type: Property;
    value?: unknown;
    defaultValue?: unknown;
    metadata?: Record<string, Property>;
    constraints?: Record<string, Property>;
    children: Record<string, PropertyNode>;

    private _parent?: PropertyNode;
    private _root?: PropertyNode;
    private _registry?: OperatorRegistry;
    private _key?: string;  // Cached key for this node in parent's children
    private _rawChildren?: Record<string, Property>;  // For lazy instantiation
    private _cache?: EvaluationCache;  // Evaluation cache

    constructor(init: Property, parent?: PropertyNode, root?: PropertyNode, key?: string) {
        this.id = init.id;
        this.type = init.type;
        this.value = init.value;
        this.defaultValue = init.defaultValue;
        this.metadata = init.metadata;
        this.constraints = init.constraints;
        this._parent = parent;
        this._root = root ?? this;
        this._key = key;

        // Store raw children for lazy instantiation
        if (init.children) {
            this._rawChildren = init.children;
        }

        // Create a proxy for children that lazy-loads on access
        const node = this;
        const childrenStore: Record<string, PropertyNode> = {};
        this.children = new Proxy(childrenStore, {
            get(target, prop) {
                if (typeof prop === 'symbol') {
                    return undefined;
                }
                const key = prop as string;
                // Lazy load child if not yet instantiated
                if (!target[key] && node._rawChildren && node._rawChildren[key]) {
                    const childNode = new PropertyNode(node._rawChildren[key]!, node, node._root, key);
                    if (node._registry) {
                        childNode.setRegistry(node._registry);
                    }
                    target[key] = childNode;
                }
                return target[key];
            },
            set(target, prop, value: PropertyNode) {
                if (typeof prop === 'symbol') return false;
                target[prop as string] = value;
                return true;
            },
            deleteProperty(target, prop) {
                if (typeof prop === 'symbol') return false;
                delete target[prop as string];
                return true;
            },
            has(target, prop) {
                if (typeof prop === 'symbol') return false;
                const key = prop as string;
                return key in target || (node._rawChildren != null && key in node._rawChildren);
            },
            ownKeys() {
                const instantiated = Object.keys(childrenStore);
                const raw = node._rawChildren ? Object.keys(node._rawChildren) : [];
                return [...new Set([...instantiated, ...raw])];
            },
            getOwnPropertyDescriptor(target, prop) {
                if (typeof prop === 'symbol') return undefined;
                const key = prop as string;
                if (key in target || (node._rawChildren && key in node._rawChildren)) {
                    return { enumerable: true, configurable: true, writable: true, value: target[key] };
                }
                return undefined;
            }
        });
    }

    /** Set the operator registry for evaluation */
    setRegistry(registry: OperatorRegistry): void {
        this._registry = registry;
        // Propagate to already-instantiated children
        for (const child of Object.values(this.children)) {
            child.setRegistry(registry);
        }
    }

    /** Get or create the evaluation cache */
    private getOrCreateCache(): EvaluationCache {
        if (!this._cache) {
            this._cache = createCache();
        }
        return this._cache;
    }

    /** Clear the evaluation cache */
    clearCache(): void {
        this._cache = undefined;
    }

    /** Get the cached key for this node */
    get key(): string | undefined {
        return this._key;
    }

    /** Ensure a child node is instantiated (lazy loading via Proxy) */
    private ensureChild(key: string): PropertyNode | undefined {
        // The Proxy automatically handles lazy loading
        return this.children[key];
    }

    /** Get all child keys (including not-yet-instantiated) */
    get childKeys(): string[] {
        // Proxy's ownKeys handles this
        return Object.keys(this.children);
    }

    // ========================================================================
    // TREE NAVIGATION
    // ========================================================================

    get parent(): PropertyNode | undefined {
        return this._parent;
    }

    get root(): PropertyNode {
        return this._root ?? this;
    }

    child(key: string): PropertyNode | undefined {
        return this.ensureChild(key);
    }

    getByPath(path: string[]): PropertyNode | undefined {
        let current: PropertyNode | undefined = this;
        for (const segment of path) {
            current = current?.child(segment);
            if (!current) return undefined;
        }
        return current;
    }

    descendants(): PropertyNode[] {
        const result: PropertyNode[] = [];
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) {
                result.push(child);
                result.push(...child.descendants());
            }
        }
        return result;
    }

    ancestors(): PropertyNode[] {
        const result: PropertyNode[] = [];
        let current = this._parent;
        while (current) {
            result.push(current);
            current = current._parent;
        }
        return result;
    }

    siblings(): PropertyNode[] {
        if (!this._parent) return [];
        const result: PropertyNode[] = [];
        for (const key of this._parent.childKeys) {
            const sibling = this._parent.ensureChild(key);
            if (sibling && sibling !== this) {
                result.push(sibling);
            }
        }
        return result;
    }

    path(): string[] {
        // Use cached keys for O(d) path construction instead of O(d * c)
        const result: string[] = [];
        let current: PropertyNode | undefined = this;
        while (current && current._parent) {
            if (current._key) {
                // Fast path: use cached key
                result.unshift(current._key);
            } else {
                // Fallback: search (shouldn't happen with proper construction)
                for (const [key, child] of Object.entries(current._parent.children)) {
                    if (child === current) {
                        result.unshift(key);
                        current._key = key;  // Cache for future
                        break;
                    }
                }
            }
            current = current._parent;
        }
        return result;
    }

    // ========================================================================
    // VALUE OPERATIONS
    // ========================================================================

    /** Create optimized findParent function for this tree */
    private createFindParentFn(): (target: Property) => Property | undefined {
        // Build a WeakMap of property -> parent for O(1) lookups
        const parentMap = new WeakMap<Property, Property>();

        const buildMap = (node: PropertyNode, parent?: PropertyNode) => {
            if (parent) {
                parentMap.set(node, parent);
            }
            for (const key of node.childKeys) {
                const child = node.ensureChild(key);
                if (child) {
                    buildMap(child, node);
                }
            }
        };

        buildMap(this.root);

        return (target: Property) => parentMap.get(target);
    }

    async getValue(path: string[] = []): Promise<unknown> {
        const target = path.length > 0 ? this.getByPath(path) : this;
        if (!target) return undefined;

        if (!this._registry) {
            throw new Error('Registry not set. Call setRegistry() before getValue()');
        }

        const ctx: EvaluationContext = {
            current: target,
            root: this.root,
            registry: this._registry,
            cache: this.root.getOrCreateCache(),
            findParentFn: (t: Property) => {
                // O(1) parent lookup using PropertyNode's _parent
                if (t === target) return target._parent;
                // For other properties, check if they're PropertyNodes
                if (t && typeof t === 'object' && '_parent' in t) {
                    return (t as unknown as PropertyNode)._parent;
                }
                return undefined;
            }
        };

        if (target.value !== undefined) {
            if (typeof target.value === 'object' && target.value !== null && 'type' in target.value) {
                return await evaluate(target.value as Property, ctx);
            }
            return target.value;
        }

        return undefined;
    }

    setValue(value: unknown, path: string[] = []): void {
        const target = path.length > 0 ? this.getByPath(path) : this;
        if (!target) return;
        target.value = value;
    }

    setValueExpr(expr: Property, path: string[] = []): void {
        const target = path.length > 0 ? this.getByPath(path) : this;
        if (!target) return;
        target.value = expr;
    }

    // ========================================================================
    // DEFAULT VALUE OPERATIONS
    // ========================================================================

    /**
     * Get the raw default value for this node.
     * Returns undefined if no default is defined.
     */
    getDefaultValue(): unknown {
        return this.defaultValue;
    }

    /**
     * Get the evaluated default value (evaluates expressions).
     * Requires registry to be set.
     */
    async getDefaultValueEvaluated(): Promise<unknown> {
        if (this.defaultValue === undefined) return undefined;

        if (!this._registry) {
            throw new Error('Registry not set. Call setRegistry() before getDefaultValueEvaluated()');
        }

        const ctx: EvaluationContext = {
            current: this,
            root: this.root,
            registry: this._registry,
            cache: this.root.getOrCreateCache(),
            findParentFn: (t: Property) => {
                if (t && typeof t === 'object' && '_parent' in t) {
                    return (t as unknown as PropertyNode)._parent;
                }
                return undefined;
            }
        };

        if (typeof this.defaultValue === 'object' && this.defaultValue !== null && 'type' in this.defaultValue) {
            return await evaluate(this.defaultValue as Property, ctx);
        }
        return this.defaultValue;
    }

    /**
     * Check if this node has a default value defined
     */
    hasDefaultValue(): boolean {
        return this.defaultValue !== undefined;
    }

    /**
     * Set the default value for this node
     */
    setDefaultValue(value: unknown): void {
        this.defaultValue = value;
    }

    /**
     * Set the default value as an expression
     */
    setDefaultValueExpr(expr: Property): void {
        this.defaultValue = expr;
    }

    // ========================================================================
    // METADATA OPERATIONS
    // ========================================================================

    async getMetadata(key: string): Promise<unknown> {
        const meta = this.metadata?.[key];
        if (!meta) return undefined;

        if (!this._registry) {
            throw new Error('Registry not set. Call setRegistry() before getMetadata()');
        }

        const ctx: EvaluationContext = {
            current: this,
            root: this.root,
            registry: this._registry,
            cache: this.root.getOrCreateCache(),
            findParentFn: (t: Property) => {
                if (t && typeof t === 'object' && '_parent' in t) {
                    return (t as unknown as PropertyNode)._parent;
                }
                return undefined;
            }
        };

        if (meta.value !== undefined) {
            if (typeof meta.value === 'object' && meta.value !== null && 'type' in meta.value) {
                return await evaluate(meta.value as Property, ctx);
            }
            return meta.value;
        }

        return undefined;
    }

    setMetadata(key: string, value: Property): void {
        if (!this.metadata) this.metadata = {};
        this.metadata[key] = value;
    }

    // ========================================================================
    // CONSTRAINT OPERATIONS
    // ========================================================================

    addConstraint(constraint: Property): void {
        if (!this.constraints) this.constraints = {};
        this.constraints[constraint.id] = constraint;
    }

    removeConstraint(id: string): void {
        if (this.constraints) {
            delete this.constraints[id];
        }
    }

    // ========================================================================
    // CHILD OPERATIONS
    // ========================================================================

    addChild(key: string, child: Property): PropertyNode {
        const node = new PropertyNode(child, this, this.root, key);
        if (this._registry) {
            node.setRegistry(this._registry);
        }
        this.children[key] = node;
        // Also add to raw children for consistency
        if (!this._rawChildren) this._rawChildren = {};
        this._rawChildren[key] = child;
        // Clear cache since tree structure changed
        this.root.clearCache();
        return node;
    }

    removeChild(key: string): void {
        delete this.children[key];
        if (this._rawChildren) {
            delete this._rawChildren[key];
        }
        // Clear cache since tree structure changed
        this.root.clearCache();
    }

    // ========================================================================
    // RESET OPERATIONS
    // ========================================================================

    /**
     * Reset this node's value to its default value.
     * If no default is defined, sets value to undefined.
     * Does NOT reset children.
     */
    resetNode(): void {
        this.value = this.defaultValue;
    }

    /**
     * Reset this node's value to its evaluated default value.
     * If no default is defined, sets value to undefined.
     * Does NOT reset children.
     * Requires registry for expression evaluation.
     */
    async resetNodeEvaluated(): Promise<void> {
        this.value = await this.getDefaultValueEvaluated();
    }

    /**
     * Reset this node's value to a specific value.
     * Does NOT reset children.
     */
    resetToValue(value: unknown): void {
        this.value = value;
    }

    /**
     * Reset only the children of this node (not this node itself).
     * Each child is reset recursively (deep reset).
     */
    resetChildren(): void {
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) child.resetDeep();
        }
    }

    /**
     * Reset this node AND all its descendants to their default values.
     * Alias: resetFromNode()
     */
    resetDeep(): void {
        this.resetNode();
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) child.resetDeep();
        }
    }

    /**
     * Reset this node and all descendants (alias for resetDeep).
     */
    resetFromNode(): void {
        this.resetDeep();
    }

    /**
     * Reset the entire tree from root.
     * All nodes will be reset to their default values.
     */
    resetAll(): void {
        this.root.resetDeep();
    }

    /**
     * Reset a node at a specific path (relative to this node).
     * Returns true if the node was found and reset, false otherwise.
     */
    resetByPath(path: string[], deep: boolean = false): boolean {
        const target = this.getByPath(path);
        if (!target) return false;
        
        if (deep) {
            target.resetDeep();
        } else {
            target.resetNode();
        }
        return true;
    }

    /**
     * Reset all nodes that match a predicate.
     * @param predicate - Function that returns true for nodes to reset
     * @param deep - If true, reset matching nodes and all their descendants
     */
    resetIf(predicate: (node: PropertyNode) => boolean, deep: boolean = false): void {
        if (predicate(this)) {
            if (deep) {
                this.resetDeep();
            } else {
                this.resetNode();
            }
        } else {
            // Only recurse into children if we didn't do a deep reset
            for (const key of this.childKeys) {
                const child = this.ensureChild(key);
                if (child) child.resetIf(predicate, deep);
            }
        }
    }

    /**
     * Reset all nodes of a specific type (by type.id).
     * @param typeId - The type id to match
     * @param deep - If true, reset matching nodes and all their descendants
     */
    resetByType(typeId: string, deep: boolean = false): void {
        this.resetIf(node => node.type?.id === typeId, deep);
    }

    /**
     * Reset all nodes that have been modified (value !== defaultValue).
     * Only resets nodes that have a default value defined.
     */
    resetModified(): void {
        if (this.hasDefaultValue() && this.value !== this.defaultValue) {
            this.resetNode();
        }
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) child.resetModified();
        }
    }

    /**
     * Reset all nodes to undefined (clear all values).
     * Useful for clearing all data in the tree.
     */
    clearAll(): void {
        this.value = undefined;
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) child.clearAll();
        }
    }

    /**
     * Reset this node to undefined (clear value).
     */
    clear(): void {
        this.value = undefined;
    }

    // ========================================================================
    // DIRTY CHECK OPERATIONS
    // ========================================================================

    /**
     * Check if this node's value differs from its default value.
     * Returns false if no default is defined.
     */
    isDirtyNode(): boolean {
        if (!this.hasDefaultValue()) return false;
        return this.value !== this.defaultValue;
    }

    /**
     * Check if this node or any descendant has been modified (value !== defaultValue).
     * Returns true if any node in the subtree is dirty.
     */
    isDirty(): boolean {
        if (this.isDirtyNode()) return true;

        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child && child.isDirty()) return true;
        }

        return false;
    }

    /**
     * Get paths of all modified fields (where value !== defaultValue).
     * Only includes nodes that have a default value defined.
     * 
     * @returns Array of paths (each path is an array of strings)
     * 
     * @example
     * const modified = tree.getModifiedFields();
     * // [['user', 'name'], ['status']]
     */
    getModifiedFields(): string[][] {
        const modified: string[][] = [];
        this.collectModifiedFields([], modified);
        return modified;
    }

    /**
     * Get paths of all modified fields as dot-notation strings.
     * 
     * @example
     * const modified = tree.getModifiedFieldsFlat();
     * // ['user.name', 'status']
     */
    getModifiedFieldsFlat(): string[] {
        return this.getModifiedFields().map(path => path.join('.'));
    }

    private collectModifiedFields(currentPath: string[], result: string[][]): void {
        if (this.hasDefaultValue() && this.value !== this.defaultValue) {
            result.push([...currentPath]);
        }

        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) {
                child.collectModifiedFields([...currentPath, key], result);
            }
        }
    }

    // ========================================================================
    // ID OPERATIONS
    // ========================================================================

    /**
     * Collect all node IDs in the subtree (including this node).
     */
    collectIds(): string[] {
        const ids: string[] = [this.id];
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) ids.push(...child.collectIds());
        }
        return ids;
    }

    /**
     * Check if there are duplicate IDs in the subtree.
     */
    hasDuplicateIds(): boolean {
        const ids = this.collectIds();
        return new Set(ids).size !== ids.length;
    }

    /**
     * Get all duplicate IDs in the subtree.
     */
    getDuplicateIds(): string[] {
        const ids = this.collectIds();
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        
        for (const id of ids) {
            if (seen.has(id)) {
                duplicates.add(id);
            }
            seen.add(id);
        }
        
        return [...duplicates];
    }

    // ========================================================================
    // TREE STATISTICS
    // ========================================================================

    /**
     * Count total nodes in subtree (including this node).
     */
    countNodes(): number {
        let count = 1;
        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (child) count += child.countNodes();
        }
        return count;
    }

    /**
     * Get maximum depth of the subtree.
     * A leaf node has depth 0.
     */
    maxDepth(): number {
        const keys = this.childKeys;
        if (keys.length === 0) return 0;

        let max = 0;
        for (const key of keys) {
            const child = this.ensureChild(key);
            if (child) {
                max = Math.max(max, child.maxDepth() + 1);
            }
        }
        return max;
    }

    // ========================================================================
    // SNAPSHOT OPERATIONS
    // ========================================================================

    /**
     * Get the effective registry (own or inherited from root)
     */
    private getRegistry(): OperatorRegistry | undefined {
        return this._registry ?? this.root._registry;
    }

    /**
     * Get a snapshot of all values as a nested key-value object.
     * Evaluates expressions and returns raw values.
     * Requires registry to be set on root or this node.
     *
     * @example
     * const values = await node.snapshot();
     * // { user: { name: 'John', email: 'john@test.com' }, status: 'active' }
     */
    async snapshot(): Promise<Record<string, unknown>> {
        const registry = this.getRegistry();
        if (!registry) {
            throw new Error('Registry not set. Call setRegistry() before snapshot()');
        }

        const result: Record<string, unknown> = {};

        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (!child) continue;

            if (child.childKeys.length > 0) {
                // Has children - recurse
                result[key] = await child.snapshot();
            } else {
                // Leaf node - get evaluated value
                result[key] = await this.getChildValue(child, registry);
            }
        }

        return result;
    }

    /**
     * Get a snapshot of all values as a flat key-value object with dot notation keys.
     * Evaluates expressions and returns raw values.
     * Requires registry to be set on root or this node.
     *
     * @example
     * const values = await node.snapshotFlat();
     * // { 'user.name': 'John', 'user.email': 'john@test.com', 'status': 'active' }
     */
    async snapshotFlat(prefix: string = ''): Promise<Record<string, unknown>> {
        const registry = this.getRegistry();
        if (!registry) {
            throw new Error('Registry not set. Call setRegistry() before snapshotFlat()');
        }

        const result: Record<string, unknown> = {};

        for (const key of this.childKeys) {
            const child = this.ensureChild(key);
            if (!child) continue;

            const path = prefix ? `${prefix}.${key}` : key;

            if (child.childKeys.length > 0) {
                // Has children - recurse and merge
                const nested = await child.snapshotFlat(path);
                Object.assign(result, nested);
            } else {
                // Leaf node - get evaluated value
                result[path] = await this.getChildValue(child, registry);
            }
        }

        return result;
    }

    /**
     * Helper to get a child's evaluated value using a specific registry
     */
    private async getChildValue(child: PropertyNode, registry: OperatorRegistry): Promise<unknown> {
        if (child.value === undefined) return undefined;

        const ctx: EvaluationContext = {
            current: child,
            root: this.root,
            registry: registry,
            cache: this.root.getOrCreateCache(),
            findParentFn: (t: Property) => {
                if (t && typeof t === 'object' && '_parent' in t) {
                    return (t as unknown as PropertyNode)._parent;
                }
                return undefined;
            }
        };

        if (typeof child.value === 'object' && child.value !== null && 'type' in child.value) {
            return await evaluate(child.value as Property, ctx);
        }
        return child.value;
    }

    /**
     * Set values from a nested key-value object.
     * 
     * @example
     * node.setFromSnapshot({ user: { name: 'Jane' }, status: 'inactive' });
     */
    setFromSnapshot(values: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(values)) {
            const child = this.children[key];
            if (!child) continue;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Recurse into nested objects
                child.setFromSnapshot(value as Record<string, unknown>);
            } else {
                // Set leaf value
                child.setValue(value);
            }
        }
    }

    /**
     * Set values from a flat key-value object with dot notation keys.
     * 
     * @example
     * node.setFromSnapshotFlat({ 'user.name': 'Jane', 'status': 'inactive' });
     */
    setFromSnapshotFlat(values: Record<string, unknown>): void {
        for (const [path, value] of Object.entries(values)) {
            const segments = path.split('.');
            const target = this.getByPath(segments);
            if (target) {
                target.setValue(value);
            }
        }
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================

    toProperty(): Property {
        const result: Property = {
            id: this.id,
            type: this.type,
        };

        if (this.value !== undefined) result.value = this.value;
        if (this.defaultValue !== undefined) result.defaultValue = this.defaultValue;
        if (this.metadata) result.metadata = this.metadata;
        if (this.constraints) result.constraints = this.constraints;

        const keys = this.childKeys;
        if (keys.length > 0) {
            result.children = {};
            for (const key of keys) {
                const child = this.ensureChild(key);
                if (child) {
                    result.children[key] = child.toProperty();
                }
            }
        }

        return result;
    }

    toJSON(): object {
        return this.toProperty();
    }

    static from(prop: Property): PropertyNode {
        return new PropertyNode(prop);
    }
}
