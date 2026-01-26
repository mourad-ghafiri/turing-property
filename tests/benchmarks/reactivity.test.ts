/**
 * Reactivity Benchmarks
 * Tests subscription and notification performance.
 */

import { describe, test, expect } from 'bun:test';
import {
    Property,
    PROPERTY,
    PropertyNode,
    createRegistry,
} from '../../src';

// Helper to measure execution time
const benchmark = async (
    name: string,
    fn: () => void | Promise<void>,
    iterations = 1
): Promise<number> => {
    // Warmup
    for (let i = 0; i < Math.min(10, iterations); i++) {
        await fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`  ${name}: ${totalTime.toFixed(2)}ms total, ${avgTime.toFixed(4)}ms avg (${iterations} iterations)`);
    return avgTime;
};

// Create a form-like property tree
const createForm = (fieldCount: number): Property => {
    const children: Record<string, Property> = {};
    for (let i = 0; i < fieldCount; i++) {
        children[`field${i}`] = {
            id: `field${i}`,
            type: PROPERTY,
            value: '',
            defaultValue: '',
        };
    }
    return {
        id: 'form',
        type: PROPERTY,
        children,
    };
};

describe('Reactivity Benchmarks', () => {
    describe('Subscription Management', () => {
        test('subscribe 100 times', async () => {
            const time = await benchmark('100 subscribe calls', () => {
                const form = createForm(10);
                const node = PropertyNode.create(form, createRegistry());
                for (let i = 0; i < 100; i++) {
                    node.subscribe(() => {});
                }
                expect(node.subscriptionCount).toBe(100);
            });

            expect(time).toBeLessThan(5);
        });

        test('subscribe 1000 times', async () => {
            const time = await benchmark('1000 subscribe calls', () => {
                const form = createForm(10);
                const node = PropertyNode.create(form, createRegistry());
                for (let i = 0; i < 1000; i++) {
                    node.subscribe(() => {});
                }
                expect(node.subscriptionCount).toBe(1000);
            });

            expect(time).toBeLessThan(10);
        });

        test('subscribe and unsubscribe 1000 times', async () => {
            const form = createForm(10);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('1000 sub/unsub cycles', () => {
                for (let i = 0; i < 1000; i++) {
                    const sub = node.subscribe(() => {});
                    sub.unsubscribe();
                }
            });

            expect(node.subscriptionCount).toBe(0);
            expect(time).toBeLessThan(10);
        });

        test('subscribe with path filter', async () => {
            const time = await benchmark('100 filtered subscriptions', () => {
                const form = createForm(100);
                const node = PropertyNode.create(form, createRegistry());
                for (let i = 0; i < 100; i++) {
                    node.subscribe(() => {}, `field${i}`);
                }
            });

            expect(time).toBeLessThan(5);
        });

        test('watch specific paths', async () => {
            const time = await benchmark('100 watch calls', () => {
                const form = createForm(100);
                const node = PropertyNode.create(form, createRegistry());
                for (let i = 0; i < 100; i++) {
                    node.watch(`field${i}`, () => {});
                }
            });

            expect(time).toBeLessThan(5);
        });

        test('unsubscribeAll with 100 subscriptions', async () => {
            const form = createForm(10);
            const node = PropertyNode.create(form, createRegistry());

            // Add 100 subscriptions
            for (let i = 0; i < 100; i++) {
                node.subscribe(() => {});
            }
            expect(node.subscriptionCount).toBe(100);

            const time = await benchmark('unsubscribeAll (100 subs)', () => {
                node.unsubscribeAll();
            });

            expect(node.subscriptionCount).toBe(0);
            expect(time).toBeLessThan(1);
        });
    });

    describe('Notification Performance', () => {
        test('notify 100 subscribers', async () => {
            const form = createForm(10);
            const node = PropertyNode.create(form, createRegistry());

            // Add 100 subscribers
            for (let i = 0; i < 100; i++) {
                node.subscribe(() => {});
            }

            const time = await benchmark('emit to 100 subscribers', () => {
                node.emitChange('field0');
            }, 100);

            expect(time).toBeLessThan(1);
            node.unsubscribeAll();
        });

        test('notify with path filtering (50% match)', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());

            // Add 100 subscribers, half watching even fields
            for (let i = 0; i < 100; i++) {
                const filterPath = i % 2 === 0 ? `field${i}` : `field${i + 1000}`; // Half match
                node.subscribe(() => {}, filterPath);
            }

            const time = await benchmark('emit with 50% filter match', () => {
                node.emitChange('field0'); // Only matches ~1 subscriber
            }, 100);

            expect(time).toBeLessThan(1);
            node.unsubscribeAll();
        });

        test('setValue triggers notification chain', async () => {
            const time = await benchmark('100 setValue calls', () => {
                const form = createForm(10);
                const node = PropertyNode.create(form, createRegistry());
                let notificationCount = 0;
                node.subscribe(() => { notificationCount++; });

                for (let i = 0; i < 100; i++) {
                    node.setValue(`value${i}`, { path: `field${i % 10}` });
                }
                expect(notificationCount).toBe(100);
            });

            expect(time).toBeLessThan(10);
        });
    });

    describe('Batch Operations', () => {
        test('batch 100 changes', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());
            let notificationCount = 0;

            node.subscribe(() => { notificationCount++; });

            const time = await benchmark('batch 100 changes', () => {
                notificationCount = 0;
                node.batch(() => {
                    for (let i = 0; i < 100; i++) {
                        node.setValue(`value${i}`, { path: `field${i}` });
                    }
                });
            });

            expect(notificationCount).toBe(1); // Only one notification per batch
            expect(time).toBeLessThan(5);

            node.unsubscribeAll();
        });

        test('batch 500 changes', async () => {
            const form = createForm(500);
            const node = PropertyNode.create(form, createRegistry());
            let notificationCount = 0;

            node.subscribe(() => { notificationCount++; });

            const time = await benchmark('batch 500 changes', () => {
                notificationCount = 0;
                node.batch(() => {
                    for (let i = 0; i < 500; i++) {
                        node.setValue(`value${i}`, { path: `field${i}` });
                    }
                });
            });

            expect(notificationCount).toBe(1);
            expect(time).toBeLessThan(10);

            node.unsubscribeAll();
        });

        test('nested batch operations', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());
            let notificationCount = 0;

            node.subscribe(() => { notificationCount++; });

            const time = await benchmark('nested batch (100 total)', () => {
                notificationCount = 0;
                node.batch(() => {
                    for (let i = 0; i < 50; i++) {
                        node.setValue(`outer${i}`, { path: `field${i}` });
                    }
                    node.batch(() => {
                        for (let i = 50; i < 100; i++) {
                            node.setValue(`inner${i}`, { path: `field${i}` });
                        }
                    });
                });
            });

            expect(notificationCount).toBe(1); // Still only one notification
            expect(time).toBeLessThan(5);

            node.unsubscribeAll();
        });
    });

    describe('Transaction Operations', () => {
        test('successful transaction', async () => {
            const form = createForm(10);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('100 successful transactions', () => {
                for (let i = 0; i < 100; i++) {
                    node.transaction(() => {
                        node.setValue(`value${i}`, { path: 'field0', silent: true });
                    });
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('rolled back transaction', async () => {
            const time = await benchmark('100 rolled back transactions', () => {
                const form = createForm(10);
                const node = PropertyNode.create(form, createRegistry());
                node.setValue('original', { path: 'field0' });

                let rollbackCount = 0;
                for (let i = 0; i < 100; i++) {
                    try {
                        node.transaction(() => {
                            node.setValue(`changed${i}`, { path: 'field0', silent: true });
                            throw new Error('Rollback');
                        });
                    } catch {
                        rollbackCount++;
                    }
                }
                expect(rollbackCount).toBe(100);
            });

            expect(time).toBeLessThan(50);
        });
    });

    describe('Parent-Child Notification Propagation', () => {
        test('deep notification propagation (depth=5)', async () => {
            // Create a deep tree
            const createDeep = (depth: number): Property => {
                if (depth === 0) {
                    return { id: 'leaf', type: PROPERTY, value: '' };
                }
                return {
                    id: `level${depth}`,
                    type: PROPERTY,
                    children: {
                        child: createDeep(depth - 1),
                    },
                };
            };

            const deep = createDeep(5);
            const root = PropertyNode.create(deep, createRegistry());

            // Get the leaf node
            let leaf: PropertyNode | null = root;
            for (let i = 0; i < 5; i++) {
                leaf = leaf?.child('child') ?? null;
            }

            const time = await benchmark('100 deep propagations (depth=5)', () => {
                for (let i = 0; i < 100; i++) {
                    leaf?.setValue(`value${i}`);
                }
            });

            expect(time).toBeLessThan(10);
            root.unsubscribeAll();
        });

        test('wide notification (100 children)', async () => {
            const form = createForm(100);
            const root = PropertyNode.create(form, createRegistry());

            root.subscribe(() => {});
            const time = await benchmark('100 child changes', () => {
                for (let i = 0; i < 100; i++) {
                    const child = root.child(`field${i}`);
                    child?.setValue(`value${i}`);
                }
            });

            expect(time).toBeLessThan(10);
            root.unsubscribeAll();
        });
    });

    describe('Subscription Filtering Performance', () => {
        test('string filter matching', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());

            // Subscribe with string filter
            node.subscribe(() => {}, 'field50');

            const time = await benchmark('1000 emit with string filter', () => {
                for (let i = 0; i < 1000; i++) {
                    node.emitChange(`field${i % 100}`);
                }
            });

            expect(time).toBeLessThan(10);
            node.unsubscribeAll();
        });

        test('array filter matching', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());

            // Subscribe with array filter
            node.subscribe(() => {}, ['field10', 'field20', 'field30']);

            const time = await benchmark('1000 emit with array filter', () => {
                for (let i = 0; i < 1000; i++) {
                    node.emitChange(`field${i % 100}`);
                }
            });

            expect(time).toBeLessThan(10);
            node.unsubscribeAll();
        });

        test('function filter matching', async () => {
            const form = createForm(100);
            const node = PropertyNode.create(form, createRegistry());

            // Subscribe with function filter
            node.subscribe(() => {}, (path) => {
                const num = parseInt(path.replace('field', ''), 10);
                return !isNaN(num) && num % 10 === 0;
            });

            const time = await benchmark('1000 emit with function filter', () => {
                for (let i = 0; i < 1000; i++) {
                    node.emitChange(`field${i % 100}`);
                }
            });

            expect(time).toBeLessThan(15);
            node.unsubscribeAll();
        });
    });

    describe('Real-World Scenarios', () => {
        test('form typing simulation (30 keystrokes)', async () => {
            const time = await benchmark('30 keystroke simulation', () => {
                const form = createForm(20);
                const node = PropertyNode.create(form, createRegistry());
                let notificationCount = 0;
                node.subscribe(() => { notificationCount++; });

                for (let i = 0; i < 30; i++) {
                    node.setValue('a'.repeat(i + 1), { path: 'field0' });
                }
                expect(notificationCount).toBe(30);
            });

            expect(time).toBeLessThan(5);
        });

        test('shopping cart update (100 quantity changes)', async () => {
            const time = await benchmark('100 cart quantity changes', () => {
                // Create cart with 10 items
                const items: Record<string, Property> = {};
                for (let i = 0; i < 10; i++) {
                    items[`item${i}`] = {
                        id: `item${i}`,
                        type: PROPERTY,
                        children: {
                            quantity: { id: 'quantity', type: PROPERTY, value: 1 },
                            price: { id: 'price', type: PROPERTY, value: 10 * (i + 1) },
                        },
                    };
                }
                const cart: Property = { id: 'cart', type: PROPERTY, children: items };
                const node = PropertyNode.create(cart, createRegistry());
                let updateCount = 0;
                node.subscribe(() => { updateCount++; });

                for (let i = 0; i < 100; i++) {
                    const itemNode = node.child(`item${i % 10}`);
                    const qtyNode = itemNode?.child('quantity');
                    qtyNode?.setValue(Math.floor(Math.random() * 10) + 1);
                }
                expect(updateCount).toBe(100);
            });

            expect(time).toBeLessThan(10);
        });
    });
});
