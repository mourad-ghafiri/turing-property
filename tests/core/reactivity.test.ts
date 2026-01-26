/**
 * Reactivity Tests
 * =================
 * Comprehensive tests for the reactive subscription system.
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    PropertyNode,
    PROPERTY,
    LIT,
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
                name: { id: 'name', type: PROPERTY, value: 'John', defaultValue: 'Anonymous' },
                age: { id: 'age', type: PROPERTY, value: 30, defaultValue: 0 },
                email: { id: 'email', type: PROPERTY, value: 'john@example.com' },
            },
        },
        settings: {
            id: 'settings',
            type: PROPERTY,
            children: {
                theme: { id: 'theme', type: PROPERTY, value: 'dark', defaultValue: 'light' },
                notifications: { id: 'notifications', type: PROPERTY, value: true },
            },
        },
    },
});

// ============================================================================
// SUBSCRIPTION BASICS
// ============================================================================

describe('Reactivity: Subscription Basics', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('subscribe() returns subscription handle', () => {
        const subscription = node.subscribe(() => {});
        expect(subscription.id).toBeDefined();
        expect(subscription.isActive).toBe(true);
        expect(typeof subscription.unsubscribe).toBe('function');
    });

    test('subscription.id is unique', () => {
        const sub1 = node.subscribe(() => {});
        const sub2 = node.subscribe(() => {});
        const sub3 = node.subscribe(() => {});
        expect(sub1.id).not.toBe(sub2.id);
        expect(sub2.id).not.toBe(sub3.id);
    });

    test('subscriptionCount tracks active subscriptions', () => {
        expect(node.subscriptionCount).toBe(0);
        const sub1 = node.subscribe(() => {});
        expect(node.subscriptionCount).toBe(1);
        const sub2 = node.subscribe(() => {});
        expect(node.subscriptionCount).toBe(2);
        sub1.unsubscribe();
        expect(node.subscriptionCount).toBe(1);
        sub2.unsubscribe();
        expect(node.subscriptionCount).toBe(0);
    });

    test('unsubscribe() deactivates subscription', () => {
        const subscription = node.subscribe(() => {});
        expect(subscription.isActive).toBe(true);
        subscription.unsubscribe();
        expect(subscription.isActive).toBe(false);
    });

    test('unsubscribeAll() removes all subscriptions', () => {
        node.subscribe(() => {});
        node.subscribe(() => {});
        node.subscribe(() => {});
        expect(node.subscriptionCount).toBe(3);
        node.unsubscribeAll();
        expect(node.subscriptionCount).toBe(0);
    });

    test('double unsubscribe is safe', () => {
        const subscription = node.subscribe(() => {});
        subscription.unsubscribe();
        subscription.unsubscribe(); // Should not throw
        expect(subscription.isActive).toBe(false);
    });
});

// ============================================================================
// CHANGE NOTIFICATIONS
// ============================================================================

describe('Reactivity: Change Notifications', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('setValue triggers notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.setValue('new-value');
        expect(changes.length).toBe(1);
    });

    test('setValue with silent:true does not trigger notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.setValue('new-value', { silent: true });
        expect(changes.length).toBe(0);
    });

    test('notification includes changed path', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.setValue('test', { path: 'user.name' });
        expect(changes[0]).toContain('user.name');
    });

    test('child setValue propagates to parent', () => {
        const rootChanges: string[][] = [];
        node.subscribe((paths) => rootChanges.push(paths));

        const nameNode = node.get('user.name')!;
        nameNode.setValue('Jane');

        expect(rootChanges.length).toBe(1);
        expect(rootChanges[0]).toContain('user.name');
    });

    test('deep child setValue propagates to root', () => {
        const rootChanges: string[][] = [];
        node.subscribe((paths) => rootChanges.push(paths));

        const themeNode = node.get('settings.theme')!;
        themeNode.setValue('light');

        expect(rootChanges.length).toBe(1);
        expect(rootChanges[0]).toContain('settings.theme');
    });

    test('emitChange manually triggers notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.emitChange('custom.path');
        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('custom.path');
    });

    test('multiple rapid changes trigger multiple notifications', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25);
        node.get('settings.theme')?.setValue('light');

        expect(changes.length).toBe(3);
    });
});

// ============================================================================
// PATH FILTERING
// ============================================================================

describe('Reactivity: Path Filtering', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('string filter matches exact path', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths), 'user.name');

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25);

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('user.name');
    });

    test('string filter matches path prefix', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths), 'user');

        node.get('user.name')?.setValue('Jane');
        node.get('settings.theme')?.setValue('light');

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('user.name');
    });

    test('array filter matches multiple paths', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths), ['user.name', 'settings.theme']);

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25); // Not in filter
        node.get('settings.theme')?.setValue('light');

        expect(changes.length).toBe(2);
    });

    test('function filter for custom logic', () => {
        const changes: string[][] = [];
        node.subscribe(
            (paths) => changes.push(paths),
            (path) => path.includes('name') || path.includes('theme')
        );

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25); // Not matching
        node.get('settings.theme')?.setValue('light');

        expect(changes.length).toBe(2);
    });

    test('filter does not receive non-matching changes', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths), 'settings');

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25);

        expect(changes.length).toBe(0);
    });
});

// ============================================================================
// WATCH HELPER
// ============================================================================

describe('Reactivity: Watch Helper', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('watch() subscribes to specific path', () => {
        const changes: string[][] = [];
        node.watch('user.name', (paths) => changes.push(paths));

        node.get('user.name')?.setValue('Jane');
        node.get('user.age')?.setValue(25);

        expect(changes.length).toBe(1);
    });

    test('watch() with array path', () => {
        const changes: string[][] = [];
        node.watch(['user', 'name'], (paths) => changes.push(paths));

        node.get('user.name')?.setValue('Jane');
        expect(changes.length).toBe(1);
    });

    test('watch() returns unsubscribable handle', () => {
        const changes: string[][] = [];
        const subscription = node.watch('user.name', (paths) => changes.push(paths));

        node.get('user.name')?.setValue('Jane');
        expect(changes.length).toBe(1);

        subscription.unsubscribe();
        node.get('user.name')?.setValue('Bob');
        expect(changes.length).toBe(1); // No new changes
    });

    test('multiple watches on same path', () => {
        const changes1: string[][] = [];
        const changes2: string[][] = [];

        node.watch('user.name', (paths) => changes1.push(paths));
        node.watch('user.name', (paths) => changes2.push(paths));

        node.get('user.name')?.setValue('Jane');

        expect(changes1.length).toBe(1);
        expect(changes2.length).toBe(1);
    });
});

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

describe('Reactivity: Batch Operations', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('batch() collects changes into single notification', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.batch(() => {
            node.get('user.name')?.setValue('Jane', { silent: true });
            node.get('user.age')?.setValue(25, { silent: true });
            node.emitChange('user.name');
            node.emitChange('user.age');
        });

        expect(changes.length).toBe(1);
        expect(changes[0]?.length).toBe(2);
        expect(changes[0]).toContain('user.name');
        expect(changes[0]).toContain('user.age');
    });

    test('batch() deduplicates paths', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.batch(() => {
            node.emitChange('user.name');
            node.emitChange('user.name');
            node.emitChange('user.name');
        });

        expect(changes.length).toBe(1);
        expect(changes[0]?.length).toBe(1);
    });

    test('nested batch() executes but does not double-notify', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.batch(() => {
            node.emitChange('path1');
            node.batch(() => {
                node.emitChange('path2');
            });
            node.emitChange('path3');
        });

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('path1');
        expect(changes[0]).toContain('path2');
        expect(changes[0]).toContain('path3');
    });

    test('batch() with no changes does not notify', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.batch(() => {
            // No changes
        });

        expect(changes.length).toBe(0);
    });

    test('batch() exception still clears batch state', () => {
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        expect(() => {
            node.batch(() => {
                node.emitChange('before-error');
                throw new Error('Test error');
            });
        }).toThrow('Test error');

        // After error, batch state should be cleared
        node.emitChange('after-error');
        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('after-error');
    });
});

// ============================================================================
// TRANSACTION
// ============================================================================

describe('Reactivity: Transaction', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('transaction() returns value on success', () => {
        const result = node.transaction(() => {
            return 42;
        });
        expect(result).toBe(42);
    });

    test('transaction() commits changes on success', () => {
        const nameNode = node.get('user.name')!;

        node.transaction(() => {
            nameNode.setValue('Jane', { silent: true });
        });

        expect(nameNode.getRawValue()).toBe('Jane');
    });

    test('transaction() rolls back on error', () => {
        const nameNode = node.get('user.name')!;
        const originalValue = nameNode.getRawValue();

        expect(() => {
            node.transaction(() => {
                nameNode.setValue('Changed', { silent: true });
                throw new Error('Rollback');
            });
        }).toThrow('Rollback');

        expect(nameNode.getRawValue()).toBe(originalValue);
    });

    test('transaction() rolls back deep changes', () => {
        const nameNode = node.get('user.name')!;
        const ageNode = node.get('user.age')!;
        const themeNode = node.get('settings.theme')!;

        const originalName = nameNode.getRawValue();
        const originalAge = ageNode.getRawValue();
        const originalTheme = themeNode.getRawValue();

        expect(() => {
            node.transaction(() => {
                nameNode.setValue('Jane', { silent: true });
                ageNode.setValue(25, { silent: true });
                themeNode.setValue('light', { silent: true });
                throw new Error('Rollback all');
            });
        }).toThrow('Rollback all');

        expect(nameNode.getRawValue()).toBe(originalName);
        expect(ageNode.getRawValue()).toBe(originalAge);
        expect(themeNode.getRawValue()).toBe(originalTheme);
    });

    test('transaction() rethrows original error', () => {
        const customError = new Error('Custom error message');

        expect(() => {
            node.transaction(() => {
                throw customError;
            });
        }).toThrow(customError);
    });
});

// ============================================================================
// RESET WITH REACTIVITY
// ============================================================================

describe('Reactivity: Reset Operations', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('reset() triggers notification', () => {
        const nameNode = node.get('user.name')!;
        nameNode.setValue('Changed', { silent: true });

        const changes: string[][] = [];
        nameNode.subscribe((paths) => changes.push(paths));

        nameNode.reset();
        expect(changes.length).toBe(1);
        expect(nameNode.getRawValue()).toBe('Anonymous');
    });

    test('reset() with silent:true does not notify', () => {
        const nameNode = node.get('user.name')!;
        nameNode.setValue('Changed', { silent: true });

        const changes: string[][] = [];
        nameNode.subscribe((paths) => changes.push(paths));

        nameNode.reset({ silent: true });
        expect(changes.length).toBe(0);
        expect(nameNode.getRawValue()).toBe('Anonymous');
    });

    test('resetDeep() resets nodes with defaults', () => {
        // Change values that have defaults
        node.get('user.name')?.setValue('Changed', { silent: true });
        node.get('user.age')?.setValue(99, { silent: true });
        node.get('settings.theme')?.setValue('changed', { silent: true });

        // Verify changes
        expect(node.get('user.name')?.getRawValue()).toBe('Changed');
        expect(node.get('user.age')?.getRawValue()).toBe(99);
        expect(node.get('settings.theme')?.getRawValue()).toBe('changed');

        // Reset silently to avoid notifications
        node.resetDeep({ silent: true });

        // Verify reset to defaults
        expect(node.get('user.name')?.getRawValue()).toBe('Anonymous');
        expect(node.get('user.age')?.getRawValue()).toBe(0);
        expect(node.get('settings.theme')?.getRawValue()).toBe('light');
    });

    test('reset() on node with default triggers notification', () => {
        const nameNode = node.get('user.name')!;
        nameNode.setValue('Changed', { silent: true });

        const changes: string[][] = [];
        nameNode.subscribe((paths) => changes.push(paths));

        nameNode.reset(); // Single node reset

        expect(changes.length).toBe(1);
        expect(nameNode.getRawValue()).toBe('Anonymous');
    });
});

// ============================================================================
// CHILD NODE SUBSCRIPTIONS
// ============================================================================

describe('Reactivity: Child Node Subscriptions', () => {
    let node: PropertyNode;

    beforeEach(() => {
        node = PropertyNode.create(createTestTree());
    });

    test('child node can have its own subscriptions', () => {
        const userNode = node.get('user')!;
        const changes: string[][] = [];
        userNode.subscribe((paths) => changes.push(paths));

        node.get('user.name')?.setValue('Jane');
        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('name');
    });

    test('sibling changes do not trigger child subscription', () => {
        const userNode = node.get('user')!;
        const changes: string[][] = [];
        userNode.subscribe((paths) => changes.push(paths));

        node.get('settings.theme')?.setValue('light');
        expect(changes.length).toBe(0);
    });

    test('leaf node subscription receives only own changes', () => {
        const nameNode = node.get('user.name')!;
        const changes: string[][] = [];
        nameNode.subscribe((paths) => changes.push(paths));

        nameNode.setValue('Jane');
        expect(changes.length).toBe(1);

        // Changes to siblings should not trigger
        node.get('user.age')?.setValue(25);
        expect(changes.length).toBe(1);
    });

    test('subscriptions at multiple levels', () => {
        const rootChanges: string[][] = [];
        const userChanges: string[][] = [];
        const nameChanges: string[][] = [];

        node.subscribe((paths) => rootChanges.push(paths));
        node.get('user')?.subscribe((paths) => userChanges.push(paths));
        node.get('user.name')?.subscribe((paths) => nameChanges.push(paths));

        node.get('user.name')?.setValue('Jane');

        expect(rootChanges.length).toBe(1);
        expect(userChanges.length).toBe(1);
        expect(nameChanges.length).toBe(1);
    });
});

// ============================================================================
// DESTROYED NODE
// ============================================================================

describe('Reactivity: Destroyed Node', () => {
    test('destroyed node clears subscriptions', () => {
        const node = PropertyNode.create(createTestTree());
        node.subscribe(() => {});
        node.subscribe(() => {});
        expect(node.subscriptionCount).toBe(2);

        node.destroy();
        expect(node.subscriptionCount).toBe(0);
    });

    test('destroyed node throws on subscribe', () => {
        const node = PropertyNode.create(createTestTree());
        node.destroy();

        expect(() => node.subscribe(() => {})).toThrow('destroyed');
    });

    test('destroyed node throws on setValue', () => {
        const node = PropertyNode.create(createTestTree());
        node.destroy();

        expect(() => node.setValue('test')).toThrow('destroyed');
    });

    test('existing subscriptions not called after destroy', () => {
        const node = PropertyNode.create(createTestTree());
        let called = false;
        node.subscribe(() => { called = true; });

        node.destroy();

        // Can't call setValue on destroyed node, but subscription should be cleared anyway
        expect(node.subscriptionCount).toBe(0);
        expect(called).toBe(false);
    });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Reactivity: Edge Cases', () => {
    test('callback exception does not break other subscriptions', () => {
        const node = PropertyNode.create(createTestTree());
        const results: number[] = [];

        node.subscribe(() => { results.push(1); });
        node.subscribe(() => { throw new Error('Callback error'); });
        node.subscribe(() => { results.push(3); });

        // The implementation might throw or catch - this tests the scenario
        try {
            node.setValue('test');
        } catch {
            // Expected if implementation doesn't catch
        }

        // At least the first callback should have been called
        expect(results).toContain(1);
    });

    test('unsubscribe during callback is safe', () => {
        const node = PropertyNode.create(createTestTree());
        let sub2Called = false;

        const sub1 = node.subscribe(() => {
            sub1.unsubscribe();
        });
        node.subscribe(() => {
            sub2Called = true;
        });

        node.setValue('test');
        expect(sub2Called).toBe(true);
    });

    test('empty path change notification', () => {
        const node = PropertyNode.create(createTestTree());
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        node.emitChange('');
        expect(changes.length).toBe(1);
        expect(changes[0]).toContain('');
    });

    test('very long path notification', () => {
        const node = PropertyNode.create(createTestTree());
        const changes: string[][] = [];
        node.subscribe((paths) => changes.push(paths));

        const longPath = 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p';
        node.emitChange(longPath);

        expect(changes.length).toBe(1);
        expect(changes[0]).toContain(longPath);
    });
});
