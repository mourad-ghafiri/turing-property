/**
 * Serialization Benchmarks
 * Tests JSON serialization/deserialization and cloning performance.
 */

import { describe, test, expect } from 'bun:test';
import {
    Property,
    PROPERTY,
    LIT,
    op,
    ref,
    PropertyNode,
    createRegistry,
    SerializedProperty,
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

// Create a form with metadata and constraints
const createFullForm = (fieldCount: number): Property => {
    const children: Record<string, Property> = {};
    for (let i = 0; i < fieldCount; i++) {
        children[`field${i}`] = {
            id: `field${i}`,
            type: PROPERTY,
            value: `value${i}`,
            defaultValue: '',
            metadata: {
                label: { id: 'label', type: PROPERTY, value: `Field ${i}` },
                placeholder: { id: 'placeholder', type: PROPERTY, value: `Enter field ${i}` },
                hint: { id: 'hint', type: PROPERTY, value: `This is field ${i}` },
                visible: { id: 'visible', type: LIT, value: true },
            },
            constraints: {
                required: {
                    id: 'required',
                    type: PROPERTY,
                    value: op('not', op('isEmpty', ref('self.value'))),
                    metadata: {
                        message: { id: 'msg', type: PROPERTY, value: 'Required' },
                    },
                },
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
            value: `value at depth ${currentDepth}`,
            children: Object.keys(children).length > 0 ? children : undefined,
        };
    };

    return createLevel(0, 'root');
};

describe('Serialization Benchmarks', () => {
    describe('toJSON Serialization', () => {
        test('serialize 100-field form', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('toJSON (100 fields)', () => {
                void node.toJSON();
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('serialize 500-field form', async () => {
            const form = createFullForm(500);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('toJSON (500 fields)', () => {
                void node.toJSON();
            }, 10);

            expect(time).toBeLessThan(20);
        });

        test('serialize 1000-field form', async () => {
            const form = createFullForm(1000);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('toJSON (1000 fields)', () => {
                void node.toJSON();
            }, 10);

            expect(time).toBeLessThan(50);
        });

        test('serialize deep tree (depth=10, breadth=2)', async () => {
            const tree = createDeepTree(10, 2);
            const node = PropertyNode.create(tree, createRegistry());

            const time = await benchmark('toJSON (2047 nodes, depth=10)', () => {
                void node.toJSON();
            }, 10);

            expect(time).toBeLessThan(20);
        });
    });

    describe('fromJSON Deserialization', () => {
        test('deserialize 100-field form', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());
            const json = node.toJSON();

            const time = await benchmark('fromJSON (100 fields)', () => {
                PropertyNode.fromJSON(json);
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('deserialize 500-field form', async () => {
            const form = createFullForm(500);
            const node = PropertyNode.create(form, createRegistry());
            const json = node.toJSON();

            const time = await benchmark('fromJSON (500 fields)', () => {
                PropertyNode.fromJSON(json);
            }, 10);

            expect(time).toBeLessThan(20);
        });

        test('deserialize 1000-field form', async () => {
            const form = createFullForm(1000);
            const node = PropertyNode.create(form, createRegistry());
            const json = node.toJSON();

            const time = await benchmark('fromJSON (1000 fields)', () => {
                PropertyNode.fromJSON(json);
            }, 10);

            expect(time).toBeLessThan(50);
        });
    });

    describe('Clone Operations', () => {
        test('clone 100-field form', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('clone (100 fields)', () => {
                node.clone();
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('clone 500-field form', async () => {
            const form = createFullForm(500);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('clone (500 fields)', () => {
                node.clone();
            }, 10);

            expect(time).toBeLessThan(20);
        });

        test('clone 1000-field form', async () => {
            const form = createFullForm(1000);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('clone (1000 fields)', () => {
                node.clone();
            }, 10);

            expect(time).toBeLessThan(50);
        });

        test('static cloneProperty (1000 fields)', async () => {
            const form = createFullForm(1000);

            const time = await benchmark('cloneProperty (1000 fields)', () => {
                PropertyNode.cloneProperty(form);
            }, 10);

            expect(time).toBeLessThan(50);
        });
    });

    describe('Equality Comparison', () => {
        test('equals comparison (100 fields)', async () => {
            const form1 = createFullForm(100);
            const form2 = createFullForm(100);
            const node1 = PropertyNode.create(form1, createRegistry());
            const node2 = PropertyNode.create(form2, createRegistry());

            const time = await benchmark('equals (100 fields)', () => {
                node1.equals(node2);
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('equals comparison (500 fields)', async () => {
            const form1 = createFullForm(500);
            const form2 = createFullForm(500);
            const node1 = PropertyNode.create(form1, createRegistry());
            const node2 = PropertyNode.create(form2, createRegistry());

            const time = await benchmark('equals (500 fields)', () => {
                node1.equals(node2);
            }, 10);

            expect(time).toBeLessThan(30);
        });

        test('equals with self-clone (should be equal)', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());
            const clone = node.clone();

            const time = await benchmark('equals with clone', () => {
                const equal = node.equals(clone);
                expect(equal).toBe(true);
            }, 100);

            expect(time).toBeLessThan(5);
        });
    });

    describe('JSON Round-Trip', () => {
        test('full round-trip (100 fields)', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('round-trip (100 fields)', () => {
                const json = node.toJSON();
                PropertyNode.fromJSON(json);
            }, 100);

            expect(time).toBeLessThan(10);
        });

        test('full round-trip (500 fields)', async () => {
            const form = createFullForm(500);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('round-trip (500 fields)', () => {
                const json = node.toJSON();
                PropertyNode.fromJSON(json);
            }, 10);

            expect(time).toBeLessThan(40);
        });

        test('full round-trip (1000 fields)', async () => {
            const form = createFullForm(1000);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('round-trip (1000 fields)', () => {
                const json = node.toJSON();
                PropertyNode.fromJSON(json);
            }, 10);

            expect(time).toBeLessThan(100);
        });
    });

    describe('Native JSON.stringify/parse', () => {
        test('JSON.stringify on toJSON result (100 fields)', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());
            const serialized = node.toJSON();

            const time = await benchmark('JSON.stringify (100 fields)', () => {
                JSON.stringify(serialized);
            }, 100);

            expect(time).toBeLessThan(2);
        });

        test('JSON.stringify on toJSON result (1000 fields)', async () => {
            const form = createFullForm(1000);
            const node = PropertyNode.create(form, createRegistry());
            const serialized = node.toJSON();

            const time = await benchmark('JSON.stringify (1000 fields)', () => {
                JSON.stringify(serialized);
            }, 10);

            expect(time).toBeLessThan(20);
        });

        test('JSON.parse and fromJSON (100 fields)', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());
            const str = JSON.stringify(node.toJSON());

            const time = await benchmark('JSON.parse + fromJSON (100 fields)', () => {
                const parsed = JSON.parse(str) as SerializedProperty;
                PropertyNode.fromJSON(parsed);
            }, 100);

            expect(time).toBeLessThan(5);
        });

        test('full network simulation (serialize, transmit, deserialize)', async () => {
            const form = createFullForm(500);
            const node = PropertyNode.create(form, createRegistry());

            const time = await benchmark('network simulation (500 fields)', () => {
                // Serialize (server-side)
                const json = node.toJSON();
                const payload = JSON.stringify(json);

                // Transmit (simulated - just string copy)
                const received = payload.slice();

                // Deserialize (client-side)
                const parsed = JSON.parse(received) as SerializedProperty;
                PropertyNode.fromJSON(parsed);
            }, 10);

            expect(time).toBeLessThan(50);
        });
    });

    describe('Snapshot Operations', () => {
        test('snapshot and restore (100 fields)', async () => {
            const form = createFullForm(100);
            const node = PropertyNode.create(form, createRegistry());

            // Create snapshot
            let snapshot: SerializedProperty;
            const snapshotTime = await benchmark('snapshot (100 fields)', () => {
                snapshot = node.toJSON();
            }, 100);

            expect(snapshotTime).toBeLessThan(5);

            // Modify values
            for (let i = 0; i < 10; i++) {
                node.setValue('modified', { path: `field${i}` });
            }

            // Restore - using clone approach
            const restoreTime = await benchmark('restore (100 fields)', () => {
                PropertyNode.fromJSON(snapshot!);
            }, 100);

            expect(restoreTime).toBeLessThan(5);
        });
    });
});
