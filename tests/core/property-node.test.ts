/**
 * PropertyNode Tests
 * Tests for navigation, traversal, serialization, reactivity, and utilities.
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    PropertyNode,
    PROPERTY,
    LIT,
    lit,
    createRegistry,
} from '../../src';
import type { Property } from '../../src';

// ============================================================================
// TEST HELPERS
// ============================================================================

const createTestTree = (): Property => ({
    id: 'root',
    type: PROPERTY,
    value: 'root-value',
    children: {
        user: {
            id: 'user',
            type: PROPERTY,
            children: {
                name: {
                    id: 'name',
                    type: PROPERTY,
                    value: 'John',
                    defaultValue: 'Anonymous',
                },
                age: {
                    id: 'age',
                    type: PROPERTY,
                    value: 30,
                    defaultValue: 0,
                },
                email: {
                    id: 'email',
                    type: PROPERTY,
                    value: 'john@example.com',
                },
            },
        },
        settings: {
            id: 'settings',
            type: PROPERTY,
            children: {
                theme: {
                    id: 'theme',
                    type: PROPERTY,
                    value: 'dark',
                    defaultValue: 'light',
                },
                notifications: {
                    id: 'notifications',
                    type: PROPERTY,
                    value: true,
                },
            },
        },
    },
    metadata: {
        version: {
            id: 'version',
            type: LIT,
            value: '1.0.0',
        },
    },
});

// ============================================================================
// STATIC FACTORY TESTS
// ============================================================================

describe('PropertyNode Static Factories', () => {
    test('create() creates node from property', () => {
        const prop = createTestTree();
        const node = PropertyNode.create(prop);
        expect(node.id).toBe('root');
        expect(node.getProperty()).toBe(prop);
    });

    test('create() with registry', () => {
        const prop = createTestTree();
        const registry = createRegistry();
        const node = PropertyNode.create(prop, registry);
        expect(node.getRegistry()).toBe(registry);
    });

    test('wrap() is alias for create()', () => {
        const prop = createTestTree();
        const node = PropertyNode.wrap(prop);
        expect(node.id).toBe('root');
    });

    test('cloneProperty() deep clones a property', () => {
        const prop = createTestTree();
        const cloned = PropertyNode.cloneProperty(prop);
        expect(cloned.id).toBe(prop.id);
        expect(cloned).not.toBe(prop);
        expect(cloned.children?.user).not.toBe(prop.children?.user);
    });
});

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

describe('PropertyNode Navigation', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('isRoot identifies root node', () => {
        expect(node.isRoot).toBe(true);
        expect(node.child('user')?.isRoot).toBe(false);
    });

    test('depth returns correct depth', () => {
        expect(node.depth).toBe(0);
        expect(node.child('user')?.depth).toBe(1);
        expect(node.get('user.name')?.depth).toBe(2);
    });

    test('childKeys() returns child keys', () => {
        expect(node.childKeys()).toEqual(['user', 'settings']);
    });

    test('hasChildren() checks for children', () => {
        expect(node.hasChildren()).toBe(true);
        expect(node.get('user.name')?.hasChildren()).toBe(false);
    });

    test('childCount returns number of children', () => {
        expect(node.childCount).toBe(2);
        expect(node.child('user')?.childCount).toBe(3);
    });

    test('get() with empty path returns self', () => {
        expect(node.get('')).toBe(node);
        expect(node.get([])).toBe(node);
    });

    test('ancestors() returns parent chain', () => {
        const nameNode = node.get('user.name')!;
        const ancestors = nameNode.ancestors();
        expect(ancestors.length).toBe(2);
        expect(ancestors[0]?.id).toBe('user');
        expect(ancestors[1]?.id).toBe('root');
    });

    test('descendants() returns all children', () => {
        const descendants = node.descendants();
        expect(descendants.length).toBe(7); // user, name, age, email, settings, theme, notifications
    });

    test('siblings() returns sibling nodes', () => {
        const userNode = node.child('user')!;
        const siblings = userNode.siblings();
        expect(siblings.length).toBe(1);
        expect(siblings[0]?.id).toBe('settings');
    });

    test('nextSibling returns next sibling', () => {
        const userNode = node.child('user')!;
        expect(userNode.nextSibling?.id).toBe('settings');
    });

    test('previousSibling returns previous sibling', () => {
        const settingsNode = node.child('settings')!;
        expect(settingsNode.previousSibling?.id).toBe('user');
    });

    test('root node has no siblings', () => {
        expect(node.siblings()).toEqual([]);
        expect(node.nextSibling).toBeNull();
        expect(node.previousSibling).toBeNull();
    });
});

// ============================================================================
// VALUE TESTS
// ============================================================================

describe('PropertyNode Values', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('hasValue() checks for value', () => {
        expect(node.hasValue()).toBe(true);
        expect(node.get('user')?.hasValue()).toBe(false);
    });

    test('isEmpty() checks for empty node', () => {
        expect(node.isEmpty()).toBe(false);
        expect(node.get('user')?.isEmpty()).toBe(false); // has children
    });

    test('setValue() with options.path', () => {
        node.setValue('Jane', { path: 'user.name', silent: true });
        expect(node.get('user.name')?.getRawValue()).toBe('Jane');
    });

    test('setValue() with silent option', () => {
        let called = false;
        node.subscribe(() => { called = true; });
        node.setValue('new-value', { silent: true });
        expect(called).toBe(false);
    });

    test('reset() with silent option', () => {
        const nameNode = node.get('user.name')!;
        nameNode.setValue('Jane');
        let called = false;
        nameNode.subscribe(() => { called = true; });
        nameNode.reset({ silent: true });
        expect(nameNode.getRawValue()).toBe('Anonymous');
        expect(called).toBe(false);
    });
});

// ============================================================================
// METADATA TESTS
// ============================================================================

describe('PropertyNode Metadata', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('metadataKeys() returns metadata keys', () => {
        expect(node.metadataKeys()).toEqual(['version']);
    });

    test('hasMetadata() with key', () => {
        expect(node.hasMetadata('version')).toBe(true);
        expect(node.hasMetadata('nonexistent')).toBe(false);
    });

    test('hasMetadata() without key', () => {
        expect(node.hasMetadata()).toBe(true);
        expect(node.child('user')?.hasMetadata()).toBe(false);
    });

    test('getRawMetadata() returns property', () => {
        const meta = node.getRawMetadata('version');
        expect(meta?.value).toBe('1.0.0');
    });

    test('removeMetadata() removes metadata', () => {
        expect(node.removeMetadata('version')).toBe(true);
        expect(node.hasMetadata('version')).toBe(false);
        expect(node.removeMetadata('nonexistent')).toBe(false);
    });

    test('setMetadata() emits change notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });

        node.setMetadata('newKey', { id: 'newKey', type: PROPERTY, value: 'test' });

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('metadata.newKey');
    });

    test('setMetadata() with silent option does not emit', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });

        node.setMetadata('newKey', { id: 'newKey', type: PROPERTY, value: 'test' }, { silent: true });

        expect(changes.length).toBe(0);
    });

    test('removeMetadata() emits change notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });

        node.removeMetadata('version');

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('metadata.version');
    });

    test('removeMetadata() with silent option does not emit', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });

        node.removeMetadata('version', { silent: true });

        expect(changes.length).toBe(0);
    });
});

// ============================================================================
// CONSTRAINT TESTS
// ============================================================================

describe('PropertyNode Constraints', () => {
    let node: PropertyNode;

    beforeEach(() => {
        const prop = createTestTree();
        // Add a constraint
        prop.children!.user.children!.age.constraints = {
            positive: {
                id: 'positive',
                type: PROPERTY,
                value: lit(true), // Always valid for test
            },
        };
        node = PropertyNode.create(prop);
    });

    test('constraintKeys() returns constraint keys', () => {
        const ageNode = node.get('user.age')!;
        expect(ageNode.constraintKeys()).toEqual(['positive']);
    });

    test('hasConstraints() with key', () => {
        const ageNode = node.get('user.age')!;
        expect(ageNode.hasConstraints('positive')).toBe(true);
        expect(ageNode.hasConstraints('nonexistent')).toBe(false);
    });

    test('getRawConstraint() returns property', () => {
        const ageNode = node.get('user.age')!;
        const constraint = ageNode.getRawConstraint('positive');
        expect(constraint?.id).toBe('positive');
    });

    test('setConstraint() adds constraint', () => {
        const nameNode = node.get('user.name')!;
        nameNode.setConstraint('required', { id: 'required', type: PROPERTY });
        expect(nameNode.hasConstraints('required')).toBe(true);
    });

    test('removeConstraint() removes constraint', () => {
        const ageNode = node.get('user.age')!;
        expect(ageNode.removeConstraint('positive')).toBe(true);
        expect(ageNode.hasConstraints('positive')).toBe(false);
    });

    test('setConstraint() emits change notification', () => {
        const nameNode = node.get('user.name')!;
        const changes: string[][] = [];
        nameNode.subscribe((paths) => { changes.push(paths); });

        nameNode.setConstraint('required', { id: 'required', type: PROPERTY });

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('constraints.required');
    });

    test('setConstraint() with silent option does not emit', () => {
        const nameNode = node.get('user.name')!;
        const changes: string[][] = [];
        nameNode.subscribe((paths) => { changes.push(paths); });

        nameNode.setConstraint('required', { id: 'required', type: PROPERTY }, { silent: true });

        expect(changes.length).toBe(0);
    });

    test('removeConstraint() emits change notification', () => {
        const ageNode = node.get('user.age')!;
        const changes: string[][] = [];
        ageNode.subscribe((paths) => { changes.push(paths); });

        ageNode.removeConstraint('positive');

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('constraints.positive');
    });

    test('removeConstraint() with silent option does not emit', () => {
        const ageNode = node.get('user.age')!;
        const changes: string[][] = [];
        ageNode.subscribe((paths) => { changes.push(paths); });

        ageNode.removeConstraint('positive', { silent: true });

        expect(changes.length).toBe(0);
    });

    test('getConstraint() returns true for missing constraint', async () => {
        const nameNode = node.get('user.name')!;
        expect(await nameNode.getConstraint('nonexistent')).toBe(true);
    });

    test('getConstraint() handles boolean literal value', async () => {
        const nameNode = node.get('user.name')!;

        // Constraint with boolean true
        nameNode.setConstraint('alwaysValid', {
            id: 'alwaysValid',
            type: PROPERTY,
            value: true,
        }, { silent: true });
        expect(await nameNode.getConstraint('alwaysValid')).toBe(true);

        // Constraint with boolean false
        nameNode.setConstraint('alwaysFails', {
            id: 'alwaysFails',
            type: PROPERTY,
            value: false,
        }, { silent: true });
        expect(await nameNode.getConstraint('alwaysFails')).toBe(false);
    });

    test('getConstraint() returns true for undefined value', async () => {
        const nameNode = node.get('user.name')!;

        nameNode.setConstraint('noValue', {
            id: 'noValue',
            type: PROPERTY,
            // No value field
        }, { silent: true });
        expect(await nameNode.getConstraint('noValue')).toBe(true);
    });

    test('getConstraint() treats non-expression truthy values as valid', async () => {
        const nameNode = node.get('user.name')!;

        // String value (truthy)
        nameNode.setConstraint('stringValue', {
            id: 'stringValue',
            type: PROPERTY,
            value: 'truthy string',
        }, { silent: true });
        expect(await nameNode.getConstraint('stringValue')).toBe(true);

        // Number value (truthy)
        nameNode.setConstraint('numberValue', {
            id: 'numberValue',
            type: PROPERTY,
            value: 42,
        }, { silent: true });
        expect(await nameNode.getConstraint('numberValue')).toBe(true);

        // Empty string (falsy)
        nameNode.setConstraint('emptyString', {
            id: 'emptyString',
            type: PROPERTY,
            value: '',
        }, { silent: true });
        expect(await nameNode.getConstraint('emptyString')).toBe(false);

        // Zero (falsy)
        nameNode.setConstraint('zero', {
            id: 'zero',
            type: PROPERTY,
            value: 0,
        }, { silent: true });
        expect(await nameNode.getConstraint('zero')).toBe(false);
    });
});

// ============================================================================
// CHILDREN MANIPULATION TESTS
// ============================================================================

describe('PropertyNode Children Manipulation', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('addChild() adds a new child', () => {
        const newChild: Property = { id: 'newChild', type: PROPERTY, value: 'test' };
        const childNode = node.addChild('newChild', newChild);
        expect(childNode.id).toBe('newChild');
        expect(node.child('newChild')).toBe(childNode);
    });

    test('removeChild() removes a child', () => {
        expect(node.removeChild('settings')).toBe(true);
        expect(node.child('settings')).toBeNull();
        expect(node.removeChild('nonexistent')).toBe(false);
    });

    test('removeChild() destroys cached node', () => {
        const settingsNode = node.child('settings')!;
        node.removeChild('settings');
        expect(settingsNode.isDestroyed).toBe(true);
    });
});

// ============================================================================
// TRAVERSAL TESTS
// ============================================================================

describe('PropertyNode Traversal', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('traverse() visits all nodes depth-first', () => {
        const visited: string[] = [];
        node.traverse((n) => { visited.push(n.id); });
        expect(visited[0]).toBe('root');
        expect(visited).toContain('user');
        expect(visited).toContain('name');
    });

    test('traverse() stops when returning false', () => {
        const visited: string[] = [];
        node.traverse((n) => {
            visited.push(n.id);
            if (n.id === 'user') return false;
        });
        expect(visited).toContain('root');
        expect(visited).toContain('user');
        expect(visited).not.toContain('name'); // Children not visited
    });

    test('traversePostOrder() visits children first', () => {
        const visited: string[] = [];
        node.traversePostOrder((n) => { visited.push(n.id); });
        expect(visited[visited.length - 1]).toBe('root');
    });

    test('traverseBreadthFirst() visits level by level', () => {
        const visited: string[] = [];
        node.traverseBreadthFirst((n) => { visited.push(n.id); });
        expect(visited[0]).toBe('root');
        expect(visited[1]).toBe('user');
        expect(visited[2]).toBe('settings');
    });

    test('find() returns first matching node', () => {
        const found = node.find(n => n.id === 'age');
        expect(found?.id).toBe('age');
    });

    test('find() returns null when not found', () => {
        const found = node.find(n => n.id === 'nonexistent');
        expect(found).toBeNull();
    });

    test('findAll() returns all matching nodes', () => {
        const found = node.findAll(n => n.hasValue());
        expect(found.length).toBeGreaterThan(1);
    });

    test('findById() finds by ID', () => {
        const found = node.findById('theme');
        expect(found?.getRawValue()).toBe('dark');
    });

    test('findByType() finds by type ID', () => {
        const found = node.findByType('Property');
        expect(found.length).toBe(8); // All properties
    });

    test('map() transforms all nodes', () => {
        const ids = node.map(n => n.id);
        expect(ids).toContain('root');
        expect(ids).toContain('user');
    });

    test('filter() is alias for findAll()', () => {
        const filtered = node.filter(n => n.depth === 2);
        expect(filtered.every(n => n.depth === 2)).toBe(true);
    });

    test('reduce() accumulates over nodes', () => {
        const count = node.reduce((acc) => acc + 1, 0);
        expect(count).toBe(8);
    });

    test('some() checks if any matches', () => {
        expect(node.some(n => n.id === 'theme')).toBe(true);
        expect(node.some(n => n.id === 'nonexistent')).toBe(false);
    });

    test('every() checks if all match', () => {
        expect(node.every(n => n.type.id === 'Property' || n.type.id === 'Lit')).toBe(true);
        expect(node.every(n => n.hasValue())).toBe(false);
    });

    test('count() returns total nodes', () => {
        expect(node.count()).toBe(8);
    });
});

// ============================================================================
// REACTIVITY TESTS
// ============================================================================

describe('PropertyNode Reactivity', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('subscribe() receives change notifications', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });
        node.setValue('new-value');
        expect(changes.length).toBe(1);
    });

    test('watch() filters by path', () => {
        const changes: string[][] = [];
        node.watch('user.name', (paths) => { changes.push(paths); });

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25);

        // Only user.name change should be received
        expect(changes.length).toBe(1);
    });

    test('batch() collects changes', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => { changes.push(paths); });

        node.batch(() => {
            node.setValue('v1', { path: 'user.name', silent: true });
            node.setValue('v2', { path: 'user.age', silent: true });
            node.emitChange('user.name');
            node.emitChange('user.age');
        });

        expect(changes.length).toBe(1);
        expect(changes[0]?.length).toBe(2);
    });

    test('transaction() rolls back on error', () => {
        const nameNode = node.get('user.name')!;
        const originalValue = nameNode.getRawValue();

        expect(() => {
            node.transaction(() => {
                nameNode.setValue('Changed', { silent: true });
                throw new Error('Test error');
            });
        }).toThrow('Test error');

        expect(nameNode.getRawValue()).toBe(originalValue);
    });

    test('unsubscribeAll() removes all subscriptions', () => {
        node.subscribe(() => {});
        node.subscribe(() => {});
        expect(node.subscriptionCount).toBe(2);
        node.unsubscribeAll();
        expect(node.subscriptionCount).toBe(0);
    });
});

// ============================================================================
// SERIALIZATION TESTS
// ============================================================================

describe('PropertyNode Serialization', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('toJSON() serializes to JSON-safe object', () => {
        const json = node.toJSON();
        expect(json.id).toBe('root');
        expect(json.type.id).toBe('Property');
        expect(json.children?.user?.children?.name?.value).toBe('John');
    });

    test('fromJSON() deserializes from JSON', () => {
        const json = node.toJSON();
        const restored = PropertyNode.fromJSON(json);
        expect(restored.id).toBe('root');
        expect(restored.get('user.name')?.getRawValue()).toBe('John');
    });

    test('clone() creates independent copy', () => {
        const cloned = node.clone();
        cloned.get('user.name')?.setValue('Jane', { silent: true });

        expect(cloned.get('user.name')?.getRawValue()).toBe('Jane');
        expect(node.get('user.name')?.getRawValue()).toBe('John');
    });

    test('clone() preserves registry', () => {
        const registry = createRegistry();
        node.setRegistry(registry);
        const cloned = node.clone();
        expect(cloned.getRegistry()).toBe(registry);
    });
});

// ============================================================================
// COMPARISON TESTS
// ============================================================================

describe('PropertyNode Comparison', () => {
    test('equals() returns true for identical structures', () => {
        const node1 = PropertyNode.create(createTestTree());
        const node2 = PropertyNode.create(createTestTree());
        expect(node1.equals(node2)).toBe(true);
    });

    test('equals() returns false for different values', () => {
        const node1 = PropertyNode.create(createTestTree());
        const node2 = PropertyNode.create(createTestTree());
        node2.get('user.name')?.setValue('Different', { silent: true });
        expect(node1.equals(node2)).toBe(false);
    });

    test('equals() returns false for different structure', () => {
        const node1 = PropertyNode.create(createTestTree());
        const node2 = PropertyNode.create(createTestTree());
        node2.removeChild('settings');
        expect(node1.equals(node2)).toBe(false);
    });
});

// ============================================================================
// LIFECYCLE TESTS
// ============================================================================

describe('PropertyNode Lifecycle', () => {
    test('destroy() marks node as destroyed', () => {
        const node = PropertyNode.create(createTestTree());
        node.destroy();
        expect(node.isDestroyed).toBe(true);
    });

    test('destroy() clears subscriptions', () => {
        const node = PropertyNode.create(createTestTree());
        node.subscribe(() => {});
        node.destroy();
        expect(node.subscriptionCount).toBe(0);
    });

    test('destroy() destroys children', () => {
        const node = PropertyNode.create(createTestTree());
        const userNode = node.child('user')!;
        node.destroy();
        expect(userNode.isDestroyed).toBe(true);
    });

    test('destroyed node throws on operations', () => {
        const node = PropertyNode.create(createTestTree());
        node.destroy();
        expect(() => node.setValue('test')).toThrow('destroyed');
    });
});

// ============================================================================
// DEBUG TESTS
// ============================================================================

describe('PropertyNode Debug', () => {
    test('toString() returns debug string', () => {
        const node = PropertyNode.create(createTestTree());
        const str = node.toString();
        expect(str).toContain('root');
        expect(str).toContain('Property');
    });

    test('printTree() returns tree structure', () => {
        const node = PropertyNode.create(createTestTree());
        const tree = node.printTree();
        expect(tree).toContain('root');
        expect(tree).toContain('[user]:');
    });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('PropertyNode Snapshot', () => {
    test('snapshot() returns evaluated values as key-value pairs', async () => {
        const registry = createRegistry();
        const node = PropertyNode.create(createTestTree(), registry);

        const snapshot = await node.snapshot();

        // Should have user and settings as top-level keys
        expect(snapshot).toHaveProperty('user');
        expect(snapshot).toHaveProperty('settings');

        // User should have name, age, email
        const user = snapshot.user as Record<string, unknown>;
        expect(user.name).toBe('John');
        expect(user.age).toBe(30);
        expect(user.email).toBe('john@example.com');

        // Settings should have theme and notifications
        const settings = snapshot.settings as Record<string, unknown>;
        expect(settings.theme).toBe('dark');
        expect(settings.notifications).toBe(true);
    });

    test('snapshot() returns simple value for leaf nodes', async () => {
        const registry = createRegistry();
        const node = PropertyNode.create(createTestTree(), registry);

        // Get snapshot of a leaf node
        const nameNode = node.get('user.name')!;
        const snapshot = await nameNode.snapshot();

        // Leaf node should return the value directly
        expect(snapshot).toBe('John');
    });

    test('snapshot() includes _value key when node has both value and children', async () => {
        const registry = createRegistry();
        const prop: Property = {
            id: 'root',
            type: PROPERTY,
            value: 'root-has-value',
            children: {
                child: {
                    id: 'child',
                    type: PROPERTY,
                    value: 'child-value',
                },
            },
        };
        const node = PropertyNode.create(prop, registry);

        const snapshot = await node.snapshot();

        // Should have _value for the node's own value plus children
        expect(snapshot._value).toBe('root-has-value');
        expect(snapshot.child).toBe('child-value');
    });

    test('snapshot() works with nested structures', async () => {
        const registry = createRegistry();
        const prop: Property = {
            id: 'app',
            type: PROPERTY,
            children: {
                level1: {
                    id: 'level1',
                    type: PROPERTY,
                    children: {
                        level2: {
                            id: 'level2',
                            type: PROPERTY,
                            children: {
                                level3: {
                                    id: 'level3',
                                    type: PROPERTY,
                                    value: 'deep-value',
                                },
                            },
                        },
                    },
                },
            },
        };
        const node = PropertyNode.create(prop, registry);

        const snapshot = await node.snapshot();

        // Should handle deep nesting
        const level1 = snapshot.level1 as Record<string, unknown>;
        const level2 = level1.level2 as Record<string, unknown>;
        expect(level2.level3).toBe('deep-value');
    });

    test('snapshot() evaluates lit() expressions', async () => {
        const registry = createRegistry();

        // Test with lit() expressions (simplest expression type)
        const prop: Property = {
            id: 'root',
            type: PROPERTY,
            children: {
                staticValue: {
                    id: 'staticValue',
                    type: PROPERTY,
                    value: 100,
                },
                literalExpr: {
                    id: 'literalExpr',
                    type: PROPERTY,
                    value: lit('evaluated-literal'),
                },
            },
        };
        const node = PropertyNode.create(prop, registry);

        const snapshot = await node.snapshot();

        expect(snapshot.staticValue).toBe(100);
        expect(snapshot.literalExpr).toBe('evaluated-literal');
    });

    test('snapshot() handles empty children', async () => {
        const registry = createRegistry();
        const prop: Property = {
            id: 'root',
            type: PROPERTY,
            children: {},
        };
        const node = PropertyNode.create(prop, registry);

        const snapshot = await node.snapshot();

        expect(snapshot).toEqual({});
    });

    test('snapshot() handles undefined values', async () => {
        const registry = createRegistry();
        const prop: Property = {
            id: 'root',
            type: PROPERTY,
            children: {
                noValue: {
                    id: 'noValue',
                    type: PROPERTY,
                    // No value set
                },
                hasValue: {
                    id: 'hasValue',
                    type: PROPERTY,
                    value: 'exists',
                },
            },
        };
        const node = PropertyNode.create(prop, registry);

        const snapshot = await node.snapshot();

        expect(snapshot.noValue).toBeUndefined();
        expect(snapshot.hasValue).toBe('exists');
    });

    test('snapshot() throws on destroyed node', async () => {
        const registry = createRegistry();
        const node = PropertyNode.create(createTestTree(), registry);
        node.destroy();

        await expect(node.snapshot()).rejects.toThrow('destroyed');
    });

    test('snapshot() returns different format than toJSON()', async () => {
        const registry = createRegistry();
        const node = PropertyNode.create(createTestTree(), registry);

        const snapshot = await node.snapshot();
        const json = node.toJSON();

        // toJSON includes id, type, metadata, etc.
        expect(json).toHaveProperty('id');
        expect(json).toHaveProperty('type');
        expect(json).toHaveProperty('metadata');

        // snapshot only includes evaluated values
        expect(snapshot).not.toHaveProperty('id');
        expect(snapshot).not.toHaveProperty('type');
        expect(snapshot).not.toHaveProperty('metadata');
    });
});
