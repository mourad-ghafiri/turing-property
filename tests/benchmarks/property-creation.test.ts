/**
 * Property Creation Benchmarks
 * Tests creation performance of Properties and PropertyNodes at various scales.
 */

import { describe, test, expect } from 'bun:test';
import {
    Property,
    PROPERTY,
    CONSTRAINT,
    LIT,
    lit,
    op,
    ref,
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

// Create a simple field property
const createField = (id: string, value: unknown = ''): Property => ({
    id,
    type: PROPERTY,
    value,
    defaultValue: value,
});

// Create a field with metadata
const createFieldWithMetadata = (id: string, label: string): Property => ({
    id,
    type: PROPERTY,
    value: '',
    defaultValue: '',
    metadata: {
        label: { id: 'label', type: PROPERTY, value: label },
        placeholder: { id: 'placeholder', type: PROPERTY, value: `Enter ${label.toLowerCase()}` },
        hint: { id: 'hint', type: PROPERTY, value: `This is the ${label.toLowerCase()} field` },
    },
});

// Create a field with constraints
const createFieldWithConstraints = (id: string): Property => ({
    id,
    type: PROPERTY,
    value: '',
    constraints: {
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: op('not', op('isEmpty', ref('self.value'))),
            metadata: {
                message: { id: 'msg', type: PROPERTY, value: 'This field is required' },
            },
        },
        minLength: {
            id: 'minLength',
            type: CONSTRAINT,
            value: op('gte', op('len', ref('self.value')), lit(3)),
            metadata: {
                message: { id: 'msg', type: PROPERTY, value: 'Minimum 3 characters' },
            },
        },
    },
});

// Create a full-featured field
const createFullField = (id: string, label: string): Property => ({
    id,
    type: PROPERTY,
    value: '',
    defaultValue: '',
    metadata: {
        label: { id: 'label', type: PROPERTY, value: label },
        placeholder: { id: 'placeholder', type: PROPERTY, value: `Enter ${label.toLowerCase()}` },
        visible: { id: 'visible', type: LIT, value: true },
        disabled: { id: 'disabled', type: LIT, value: false },
    },
    constraints: {
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: op('not', op('isEmpty', ref('self.value'))),
        },
    },
});

describe('Property Creation Benchmarks', () => {
    describe('Simple Property Creation', () => {
        test('create 1000 simple fields', async () => {
            const time = await benchmark('1000 simple fields', () => {
                const fields: Record<string, Property> = {};
                for (let i = 0; i < 1000; i++) {
                    fields[`field${i}`] = createField(`field${i}`, '');
                }
            });

            expect(time).toBeLessThan(1); // Should be sub-millisecond
        });

        test('create 1000 fields with metadata', async () => {
            const time = await benchmark('1000 fields with metadata', () => {
                const fields: Record<string, Property> = {};
                for (let i = 0; i < 1000; i++) {
                    fields[`field${i}`] = createFieldWithMetadata(`field${i}`, `Field ${i}`);
                }
            });

            expect(time).toBeLessThan(2);
        });

        test('create 1000 fields with constraints', async () => {
            const time = await benchmark('1000 fields with constraints', () => {
                const fields: Record<string, Property> = {};
                for (let i = 0; i < 1000; i++) {
                    fields[`field${i}`] = createFieldWithConstraints(`field${i}`);
                }
            });

            expect(time).toBeLessThan(2);
        });

        test('create 1000 full-featured fields', async () => {
            const time = await benchmark('1000 full fields', () => {
                const fields: Record<string, Property> = {};
                for (let i = 0; i < 1000; i++) {
                    fields[`field${i}`] = createFullField(`field${i}`, `Field ${i}`);
                }
            });

            expect(time).toBeLessThan(3);
        });
    });

    describe('Form Creation (with PropertyNode)', () => {
        test('create form with 100 fields and wrap in PropertyNode', async () => {
            const time = await benchmark('100-field form + PropertyNode', () => {
                const children: Record<string, Property> = {};
                for (let i = 0; i < 100; i++) {
                    children[`field${i}`] = createFullField(`field${i}`, `Field ${i}`);
                }

                const form: Property = {
                    id: 'form',
                    type: PROPERTY,
                    children,
                };

                PropertyNode.create(form, createRegistry());
            });

            expect(time).toBeLessThan(1);
        });

        test('create form with 500 fields and wrap in PropertyNode', async () => {
            const time = await benchmark('500-field form + PropertyNode', () => {
                const children: Record<string, Property> = {};
                for (let i = 0; i < 500; i++) {
                    children[`field${i}`] = createFullField(`field${i}`, `Field ${i}`);
                }

                const form: Property = {
                    id: 'form',
                    type: PROPERTY,
                    children,
                };

                PropertyNode.create(form, createRegistry());
            });

            expect(time).toBeLessThan(2);
        });

        test('create form with 1000 fields and wrap in PropertyNode', async () => {
            const time = await benchmark('1000-field form + PropertyNode', () => {
                const children: Record<string, Property> = {};
                for (let i = 0; i < 1000; i++) {
                    children[`field${i}`] = createFullField(`field${i}`, `Field ${i}`);
                }

                const form: Property = {
                    id: 'form',
                    type: PROPERTY,
                    children,
                };

                PropertyNode.create(form, createRegistry());
            });

            expect(time).toBeLessThan(5);
        });
    });

    describe('Deep Tree Creation', () => {
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

        test('create tree with depth=5, breadth=4 (341 nodes)', async () => {
            const time = await benchmark('depth=5, breadth=4 tree', () => {
                const tree = createDeepTree(5, 4);
                PropertyNode.create(tree, createRegistry());
            });

            expect(time).toBeLessThan(1);
        });

        test('create tree with depth=10, breadth=2 (2047 nodes)', async () => {
            const time = await benchmark('depth=10, breadth=2 tree', () => {
                const tree = createDeepTree(10, 2);
                PropertyNode.create(tree, createRegistry());
            });

            expect(time).toBeLessThan(2);
        });

        test('create tree with depth=7, breadth=3 (3280 nodes)', async () => {
            const time = await benchmark('depth=7, breadth=3 tree', () => {
                const tree = createDeepTree(7, 3);
                PropertyNode.create(tree, createRegistry());
            });

            expect(time).toBeLessThan(3);
        });
    });

    describe('Expression Creation', () => {
        test('create 5000 literal expressions', async () => {
            const time = await benchmark('5000 lit() calls', () => {
                const expressions = [];
                for (let i = 0; i < 5000; i++) {
                    expressions.push(lit(i));
                }
            });

            expect(time).toBeLessThan(1);
        });

        test('create 5000 reference expressions', async () => {
            const time = await benchmark('5000 ref() calls', () => {
                const expressions = [];
                for (let i = 0; i < 5000; i++) {
                    expressions.push(ref(`self.field${i}.value`));
                }
            });

            expect(time).toBeLessThan(2);
        });

        test('create 5000 operator expressions', async () => {
            const time = await benchmark('5000 op() calls', () => {
                const expressions = [];
                for (let i = 0; i < 5000; i++) {
                    expressions.push(op('add', lit(i), lit(i + 1)));
                }
            });

            expect(time).toBeLessThan(2);
        });

        test('create 1000 nested expressions (3 levels deep)', async () => {
            const time = await benchmark('1000 nested expressions', () => {
                const expressions = [];
                for (let i = 0; i < 1000; i++) {
                    expressions.push(
                        op('add',
                            op('mul', lit(i), lit(2)),
                            op('div', lit(i), lit(3))
                        )
                    );
                }
            });

            expect(time).toBeLessThan(2);
        });
    });
});
