/**
 * Tree Traversal Benchmarks
 * Tests traversal performance at various tree sizes and depths.
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

// Create a wide tree (many children at each level)
const createWideTree = (width: number): Property => {
    const children: Record<string, Property> = {};
    for (let i = 0; i < width; i++) {
        children[`field${i}`] = {
            id: `field${i}`,
            type: PROPERTY,
            value: i,
            metadata: {
                label: { id: 'label', type: PROPERTY, value: `Field ${i}` },
            },
        };
    }
    return {
        id: 'form',
        type: PROPERTY,
        children,
    };
};

// Create a deep tree
const createDeepTree = (depth: number, breadth: number): Property => {
    const createLevel = (currentDepth: number, prefix: string): Property => {
        const children: Record<string, Property> = {};

        if (currentDepth < depth) {
            for (let i = 0; i < breadth; i++) {
                children[`child${i}`] = createLevel(currentDepth + 1, `${prefix}.child${i}`);
            }
        }

        return {
            id: prefix || 'root',
            type: PROPERTY,
            value: currentDepth,
            children: Object.keys(children).length > 0 ? children : undefined,
        };
    };

    return createLevel(0, 'root');
};

// Count nodes manually for verification
const countNodesManual = (prop: Property): number => {
    let count = 1;
    if (prop.children) {
        for (const child of Object.values(prop.children)) {
            count += countNodesManual(child);
        }
    }
    return count;
};

describe('Tree Traversal Benchmarks', () => {
    describe('Wide Tree Traversal (1000 children)', () => {
        const tree = createWideTree(1000);
        const node = PropertyNode.create(tree, createRegistry());

        test('count nodes in 1000-field form', async () => {
            const time = await benchmark('count 1001 nodes', () => {
                const count = node.count();
                expect(count).toBe(1001); // root + 1000 children
            });

            expect(time).toBeLessThan(5);
        });

        test('traverse all nodes (pre-order)', async () => {
            const time = await benchmark('traverse 1001 nodes', () => {
                let count = 0;
                node.traverse(() => { count++; });
                expect(count).toBe(1001);
            });

            expect(time).toBeLessThan(5);
        });

        test('traverse all nodes (post-order)', async () => {
            const time = await benchmark('traversePostOrder 1001 nodes', () => {
                let count = 0;
                node.traversePostOrder(() => { count++; });
                expect(count).toBe(1001);
            });

            expect(time).toBeLessThan(5);
        });

        test('traverse all nodes (breadth-first)', async () => {
            const time = await benchmark('traverseBreadthFirst 1001 nodes', () => {
                let count = 0;
                node.traverseBreadthFirst(() => { count++; });
                expect(count).toBe(1001);
            });

            expect(time).toBeLessThan(5);
        });

        test('find node by predicate', async () => {
            const time = await benchmark('find in 1001 nodes', () => {
                const found = node.find(n => n.id === 'field500');
                expect(found).not.toBeNull();
            });

            expect(time).toBeLessThan(3);
        });

        test('findAll with 50% match', async () => {
            const time = await benchmark('findAll (50% match)', () => {
                const found = node.findAll(n => {
                    const num = parseInt(n.id.replace('field', ''), 10);
                    return !isNaN(num) && num % 2 === 0;
                });
                expect(found.length).toBe(500);
            });

            expect(time).toBeLessThan(5);
        });

        test('map over all nodes', async () => {
            const time = await benchmark('map 1001 nodes', () => {
                const ids = node.map(n => n.id);
                expect(ids.length).toBe(1001);
            });

            expect(time).toBeLessThan(5);
        });

        test('filter nodes', async () => {
            const time = await benchmark('filter 1001 nodes', () => {
                const filtered = node.filter(n => n.id.startsWith('field'));
                expect(filtered.length).toBe(1000);
            });

            expect(time).toBeLessThan(5);
        });

        test('reduce over all nodes', async () => {
            const time = await benchmark('reduce 1001 nodes', () => {
                const sum = node.reduce((acc, n) => {
                    const val = n.getProperty().value;
                    return acc + (typeof val === 'number' ? val : 0);
                }, 0);
                // Sum of 0 to 999
                expect(sum).toBe(499500);
            });

            expect(time).toBeLessThan(5);
        });

        test('some/every checks', async () => {
            const time = await benchmark('some/every checks', () => {
                expect(node.some(n => n.id === 'field500')).toBe(true);
                expect(node.every(n => n.type.id === 'Property')).toBe(true);
            });

            expect(time).toBeLessThan(5);
        });

        test('descendants() on root', async () => {
            const time = await benchmark('descendants() 1000 nodes', () => {
                const desc = node.descendants();
                expect(desc.length).toBe(1000);
            });

            expect(time).toBeLessThan(5);
        });

        test('findById', async () => {
            const time = await benchmark('findById in 1001 nodes', () => {
                const found = node.findById('field750');
                expect(found?.id).toBe('field750');
            });

            expect(time).toBeLessThan(3);
        });

        test('findByType', async () => {
            const time = await benchmark('findByType in 1001 nodes', () => {
                const found = node.findByType('Property');
                expect(found.length).toBe(1001);
            });

            expect(time).toBeLessThan(5);
        });
    });

    describe('Deep Tree Traversal (depth=10, breadth=2, 2047 nodes)', () => {
        const tree = createDeepTree(10, 2);
        const expectedNodes = countNodesManual(tree);
        const node = PropertyNode.create(tree, createRegistry());

        test('count nodes in deep tree', async () => {
            const time = await benchmark('count 2047 nodes (depth=10)', () => {
                const count = node.count();
                expect(count).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(10);
        });

        test('traverse deep tree (pre-order)', async () => {
            const time = await benchmark('traverse 2047 nodes', () => {
                let count = 0;
                node.traverse(() => { count++; });
                expect(count).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(10);
        });

        test('traverse deep tree (breadth-first)', async () => {
            const time = await benchmark('breadth-first 2047 nodes', () => {
                let count = 0;
                node.traverseBreadthFirst(() => { count++; });
                expect(count).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(10);
        });

        test('find deepest node', async () => {
            const time = await benchmark('find deepest node', () => {
                let maxDepth = 0;
                node.traverse(n => {
                    if (n.depth > maxDepth) {
                        maxDepth = n.depth;
                    }
                });
                expect(maxDepth).toBe(10);
            });

            expect(time).toBeLessThan(10);
        });

        test('path() on deep node', async () => {
            // Navigate to a deep node
            let current: PropertyNode | null = node;
            for (let i = 0; i < 10 && current; i++) {
                current = current.child('child0');
            }

            const time = await benchmark('path() on depth=10 node', () => {
                if (current) {
                    const path = current.path();
                    expect(path.length).toBe(10);
                }
            }, 100);

            expect(time).toBeLessThan(1);
        });

        test('ancestors() on deep node', async () => {
            // Navigate to a deep node
            let current: PropertyNode | null = node;
            for (let i = 0; i < 10 && current; i++) {
                current = current.child('child0');
            }

            const time = await benchmark('ancestors() on depth=10 node', () => {
                if (current) {
                    const ancestors = current.ancestors();
                    expect(ancestors.length).toBe(10);
                }
            }, 100);

            expect(time).toBeLessThan(1);
        });
    });

    describe('Complex Tree Traversal (depth=6, breadth=4, ~5461 nodes)', () => {
        const tree = createDeepTree(6, 4);
        const expectedNodes = countNodesManual(tree);
        const node = PropertyNode.create(tree, createRegistry());

        test('count nodes in complex tree', async () => {
            const time = await benchmark(`count ${expectedNodes} nodes`, () => {
                const count = node.count();
                expect(count).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(20);
        });

        test('traverse complex tree', async () => {
            const time = await benchmark(`traverse ${expectedNodes} nodes`, () => {
                let count = 0;
                node.traverse(() => { count++; });
                expect(count).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(20);
        });

        test('map over complex tree', async () => {
            const time = await benchmark(`map ${expectedNodes} nodes`, () => {
                const depths = node.map((n, path) => path.length);
                expect(depths.length).toBe(expectedNodes);
            });

            expect(time).toBeLessThan(20);
        });

        test('filter by depth', async () => {
            const time = await benchmark('filter by depth', () => {
                const leafNodes = node.filter(n => !n.hasChildren());
                // Leaf nodes = 4^6 = 4096
                expect(leafNodes.length).toBe(Math.pow(4, 6));
            });

            expect(time).toBeLessThan(20);
        });
    });

    describe('Navigation Performance', () => {
        const tree = createWideTree(1000);
        const node = PropertyNode.create(tree, createRegistry());

        test('child() access 1000 times', async () => {
            const time = await benchmark('1000 child() calls', () => {
                for (let i = 0; i < 1000; i++) {
                    node.child(`field${i}`);
                }
            });

            expect(time).toBeLessThan(5);
        });

        test('get() by path 1000 times', async () => {
            const time = await benchmark('1000 get() calls', () => {
                for (let i = 0; i < 1000; i++) {
                    node.get(`field${i}`);
                }
            });

            expect(time).toBeLessThan(5);
        });

        test('children() access', async () => {
            const time = await benchmark('children() (1000 children)', () => {
                const children = node.children();
                expect(children.length).toBe(1000);
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('childKeys() access', async () => {
            const time = await benchmark('childKeys() (1000 keys)', () => {
                const keys = node.childKeys();
                expect(keys.length).toBe(1000);
            }, 100);

            expect(time).toBeLessThan(1);
        });

        test('siblings() access', async () => {
            const child = node.child('field500')!;

            const time = await benchmark('siblings() (999 siblings)', () => {
                const siblings = child.siblings();
                expect(siblings.length).toBe(999);
            }, 10);

            expect(time).toBeLessThan(10);
        });

        test('nextSibling/previousSibling access', async () => {
            const child = node.child('field500')!;

            const time = await benchmark('next/prev sibling', () => {
                void child.nextSibling;
                void child.previousSibling;
            }, 100);

            expect(time).toBeLessThan(1);
        });
    });
});
