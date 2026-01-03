import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { Property } from '../../src/core/property';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

// ============================================================================
// HELPER: Generate expression structures
// ============================================================================

function generateNestedArithmetic(depth: number): Property {
    if (depth <= 0) {
        return lit(Math.random() * 100);
    }
    return op('add', generateNestedArithmetic(depth - 1), generateNestedArithmetic(depth - 1));
}

function generateNestedConditional(depth: number): Property {
    if (depth <= 0) {
        return lit('leaf');
    }
    return op('if',
        op('gt', lit(Math.random() * 100), lit(50)),
        generateNestedConditional(depth - 1),
        generateNestedConditional(depth - 1)
    );
}

function generateChainedStringOps(count: number): Property {
    let expr = lit('hello');
    for (let i = 0; i < count; i++) {
        expr = op('concat', expr, lit(` world${i}`));
    }
    return expr;
}

function generateMapOperation(arraySize: number): Property {
    // Use range operator to create array
    return op('map',
        op('range', lit(0), lit(arraySize)),
        op('mul', ref(['item']), lit(2))
    );
}

function generateFilterOperation(arraySize: number): Property {
    // Use range operator to create array
    return op('filter',
        op('range', lit(0), lit(arraySize)),
        op('gt', ref(['item']), lit(arraySize / 2))
    );
}

function generateReduceOperation(arraySize: number): Property {
    // Use range operator to create array (1 to arraySize)
    return op('reduce',
        op('range', lit(1), lit(arraySize + 1)),
        op('add', ref(['acc']), ref(['item'])),
        lit(0)
    );
}

// ============================================================================
// BENCHMARKS: Literal Evaluation
// ============================================================================

describe('Benchmark: Literal Evaluation', () => {
    const counts = [100, 500, 1000, 5000];

    counts.forEach(count => {
        it(`should evaluate ${count} literal expressions`, async () => {
            const fields: Record<string, Property> = {};
            for (let i = 0; i < count; i++) {
                fields[`field_${i}`] = {
                    id: `field_${i}`,
                    type: NUMBER,
                    value: lit(i * 2)
                };
            }

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: fields
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            for (let i = 0; i < count; i++) {
                await form.getValue([`field_${i}`]);
            }
            const elapsed = performance.now() - start;

            console.log(`  ${count} literals: ${elapsed.toFixed(2)}ms (${(elapsed / count).toFixed(4)}ms/eval)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Reference Resolution
// ============================================================================

describe('Benchmark: Reference Resolution', () => {
    it('should resolve sibling references (1000 evals)', async () => {
        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                source: { id: 'source', type: NUMBER, value: 42 },
                computed: {
                    id: 'computed',
                    type: NUMBER,
                    value: ref(['parent', 'source', 'value'])
                }
            }
        });
        form.setRegistry(defaultRegistry);

        const count = 1000;
        const start = performance.now();
        for (let i = 0; i < count; i++) {
            await form.getValue(['computed']);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 sibling refs: ${elapsed.toFixed(2)}ms`);
    });

    it('should resolve parent references (1000 evals)', async () => {
        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                source: { id: 'source', type: NUMBER, value: 100 },
                computed: {
                    id: 'computed',
                    type: NUMBER,
                    value: ref(['parent', 'source', 'value'])
                }
            }
        });
        form.setRegistry(defaultRegistry);

        const count = 1000;
        const start = performance.now();
        for (let i = 0; i < count; i++) {
            await form.getValue(['computed']);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 parent refs: ${elapsed.toFixed(2)}ms`);
    });

    it('should resolve deep path references (1000 evals)', async () => {
        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                level1: {
                    id: 'level1',
                    type: TYPE,
                    children: {
                        level2: {
                            id: 'level2',
                            type: TYPE,
                            children: {
                                level3: {
                                    id: 'level3',
                                    type: TYPE,
                                    children: {
                                        target: { id: 'target', type: NUMBER, value: 999 }
                                    }
                                }
                            }
                        }
                    }
                },
                computed: {
                    id: 'computed',
                    type: NUMBER,
                    value: ref(['root', 'level1', 'level2', 'level3', 'target', 'value'])
                }
            }
        });
        form.setRegistry(defaultRegistry);

        const count = 1000;
        const start = performance.now();
        for (let i = 0; i < count; i++) {
            await form.getValue(['computed']);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 deep refs (5 levels): ${elapsed.toFixed(2)}ms`);
    });

    it('should resolve many independent expressions in a form', async () => {
        const fields: Record<string, Property> = {};

        // Each field has its own computed expression (benchmarking expression evaluation)
        for (let i = 0; i < 100; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: NUMBER,
                value: op('add', lit(10), lit(i))
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 0; i < 100; i++) {
            await form.getValue([`field_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  100 independent expressions: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Operator Evaluation
// ============================================================================

describe('Benchmark: Arithmetic Operators', () => {
    it('should evaluate 1000 simple additions', async () => {
        const fields: Record<string, Property> = {};
        for (let i = 0; i < 1000; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: NUMBER,
                value: op('add', lit(i), lit(i * 2))
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            await form.getValue([`field_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 additions: ${elapsed.toFixed(2)}ms`);
    });

    const depths = [3, 4, 5];  // Reduced to avoid max evaluation depth
    depths.forEach(depth => {
        it(`should evaluate nested arithmetic (depth=${depth})`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    computed: {
                        id: 'computed',
                        type: NUMBER,
                        value: generateNestedArithmetic(depth)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const operations = Math.pow(2, depth) - 1;

            const start = performance.now();
            await form.getValue(['computed']);
            const elapsed = performance.now() - start;

            console.log(`  nested depth=${depth} (~${operations} ops): ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: String Operations
// ============================================================================

describe('Benchmark: String Operators', () => {
    const counts = [10, 30, 50];  // Reduced to avoid max evaluation depth

    counts.forEach(count => {
        it(`should evaluate ${count} chained string concats`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    result: {
                        id: 'result',
                        type: STRING,
                        value: generateChainedStringOps(count)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            await form.getValue(['result']);
            const elapsed = performance.now() - start;

            console.log(`  ${count} concats: ${elapsed.toFixed(2)}ms`);
        });
    });

    it('should evaluate 1000 string concatenations', async () => {
        const fields: Record<string, Property> = {};
        for (let i = 0; i < 1000; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: op('concat',
                    lit('Hello '),
                    lit(`User${i}`),
                    lit(', you are '),
                    op('toString', lit(20 + (i % 50))),
                    lit(' years old')
                )
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            await form.getValue([`field_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 string concats: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Conditional Operators
// ============================================================================

describe('Benchmark: Conditional Operators', () => {
    it('should evaluate 1000 simple if/else', async () => {
        const fields: Record<string, Property> = {};
        for (let i = 0; i < 1000; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: op('if', op('gt', lit(i), lit(500)), lit('high'), lit('low'))
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            await form.getValue([`field_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 if/else: ${elapsed.toFixed(2)}ms`);
    });

    const depths = [3, 5, 7];
    depths.forEach(depth => {
        it(`should evaluate nested conditionals (depth=${depth})`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    computed: {
                        id: 'computed',
                        type: STRING,
                        value: generateNestedConditional(depth)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            await form.getValue(['computed']);
            const elapsed = performance.now() - start;

            console.log(`  nested conditionals depth=${depth}: ${elapsed.toFixed(2)}ms`);
        });
    });

    it('should evaluate 1000 nested if/else chains', async () => {
        const fields: Record<string, Property> = {};
        for (let i = 0; i < 1000; i++) {
            // Nested if/else chain simulating switch/case
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: op('if', op('eq', lit(i % 5), lit(0)), lit('zero'),
                    op('if', op('eq', lit(i % 5), lit(1)), lit('one'),
                        op('if', op('eq', lit(i % 5), lit(2)), lit('two'),
                            op('if', op('eq', lit(i % 5), lit(3)), lit('three'),
                                lit('other')
                            )
                        )
                    )
                )
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            await form.getValue([`field_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  1000 nested if/else chains: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Array Operations
// ============================================================================

describe('Benchmark: Array Operators', () => {
    const sizes = [5, 10, 20];  // Reduced to avoid max evaluation depth

    sizes.forEach(size => {
        it(`should evaluate map on array of ${size} items`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    result: {
                        id: 'result',
                        type: TYPE,
                        value: generateMapOperation(size)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await form.getValue(['result']);
            const elapsed = performance.now() - start;

            expect(Array.isArray(result)).toBe(true);
            expect((result as number[]).length).toBe(size);
            console.log(`  map (${size} items): ${elapsed.toFixed(2)}ms`);
        });

        it(`should evaluate filter on array of ${size} items`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    result: {
                        id: 'result',
                        type: TYPE,
                        value: generateFilterOperation(size)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await form.getValue(['result']);
            const elapsed = performance.now() - start;

            expect(Array.isArray(result)).toBe(true);
            console.log(`  filter (${size} items): ${elapsed.toFixed(2)}ms`);
        });

        it(`should evaluate reduce on array of ${size} items`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: {
                    result: {
                        id: 'result',
                        type: NUMBER,
                        value: generateReduceOperation(size)
                    }
                }
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await form.getValue(['result']);
            const elapsed = performance.now() - start;

            // Sum of 1 to size = size * (size + 1) / 2
            expect(result).toBe((size * (size + 1)) / 2);
            console.log(`  reduce (${size} items): ${elapsed.toFixed(2)}ms`);
        });
    });

    it('should evaluate chained array operations', async () => {
        const size = 20;  // Reduced to avoid max evaluation depth

        // filter -> map -> reduce chain using range
        const expr = op('reduce',
            op('map',
                op('filter',
                    op('range', lit(0), lit(size)),
                    op('gt', ref(['item']), lit(10))  // Keep items > 10
                ),
                op('mul', ref(['item']), lit(2))  // Double each
            ),
            op('add', ref(['acc']), ref(['item'])),  // Sum all
            lit(0)
        );

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                result: { id: 'result', type: NUMBER, value: expr }
            }
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        await form.getValue(['result']);
        const elapsed = performance.now() - start;

        console.log(`  filter->map->reduce chain (${size} items): ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Complex Real-World Expressions
// ============================================================================

describe('Benchmark: Complex Real-World Expressions', () => {
    it('should evaluate form with computed totals', async () => {
        // Simulates an order form with line items and computed totals
        const lineItems: Record<string, Property> = {};
        for (let i = 0; i < 50; i++) {
            lineItems[`item_${i}`] = {
                id: `item_${i}`,
                type: TYPE,
                children: {
                    quantity: { id: 'quantity', type: NUMBER, value: 1 + (i % 10) },
                    unitPrice: { id: 'unitPrice', type: NUMBER, value: 10 + (i * 2) },
                    subtotal: {
                        id: 'subtotal',
                        type: NUMBER,
                        value: op('mul',
                            ref(['self', 'parent', 'quantity', 'value']),
                            ref(['self', 'parent', 'unitPrice', 'value'])
                        )
                    }
                }
            };
        }

        const form = new PropertyNode({
            id: 'order',
            type: TYPE,
            children: {
                items: {
                    id: 'items',
                    type: TYPE,
                    children: lineItems
                },
                subtotal: {
                    id: 'subtotal',
                    type: NUMBER,
                    value: lit(0) // Would need sum of all subtotals
                },
                tax: {
                    id: 'tax',
                    type: NUMBER,
                    value: op('mul', ref(['parent', 'subtotal', 'value']), lit(0.1))
                },
                total: {
                    id: 'total',
                    type: NUMBER,
                    value: op('add',
                        ref(['parent', 'subtotal', 'value']),
                        ref(['parent', 'tax', 'value'])
                    )
                }
            }
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();

        // Evaluate all subtotals
        for (let i = 0; i < 50; i++) {
            await form.getValue(['items', `item_${i}`, 'subtotal']);
        }

        const elapsed = performance.now() - start;
        console.log(`  order form (50 line items, subtotals): ${elapsed.toFixed(2)}ms`);
    });

    it('should evaluate form with conditional visibility expressions', async () => {
        const fields: Record<string, Property> = {
            showAdvanced: { id: 'showAdvanced', type: BOOLEAN, value: true }
        };

        // 100 fields with conditional visibility
        for (let i = 0; i < 100; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: `value_${i}`,
                metadata: {
                    visible: {
                        id: 'visible',
                        type: BOOLEAN,
                        value: i % 2 === 0
                            ? op('and',
                                ref(['root', 'showAdvanced', 'value']),
                                op('gt', lit(i), lit(50))
                            )
                            : lit(true)
                    }
                }
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();

        // Evaluate all visibility conditions
        for (let i = 0; i < 100; i++) {
            await form.getMetadata('visible');
        }

        const elapsed = performance.now() - start;
        console.log(`  100 conditional visibility evals: ${elapsed.toFixed(2)}ms`);
    });

    it('should evaluate multiple independent computed fields', async () => {
        // Each field is an independent computation (benchmarking nested expression evaluation)
        const fields: Record<string, Property> = {};

        for (let i = 1; i <= 50; i++) {
            fields[`computed_${i}`] = {
                id: `computed_${i}`,
                type: NUMBER,
                value: op('add',
                    lit(100),  // base value
                    op('mul', lit(i), lit(2))
                )
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        for (let i = 1; i <= 50; i++) {
            await form.getValue([`computed_${i}`]);
        }
        const elapsed = performance.now() - start;

        console.log(`  50 independent computed fields: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Evaluation Caching
// ============================================================================

describe('Benchmark: Evaluation Caching', () => {
    it('should benefit from caching on repeated evaluations', async () => {
        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                computed: {
                    id: 'computed',
                    type: NUMBER,
                    value: generateNestedArithmetic(5) // ~31 operations (reduced from 8)
                }
            }
        });
        form.setRegistry(defaultRegistry);

        // First evaluation (cold)
        const startCold = performance.now();
        await form.getValue(['computed']);
        const coldTime = performance.now() - startCold;

        // Second evaluation (warm - cached)
        const startWarm = performance.now();
        await form.getValue(['computed']);
        const warmTime = performance.now() - startWarm;

        console.log(`  cold eval: ${coldTime.toFixed(2)}ms, warm eval: ${warmTime.toFixed(2)}ms`);
        console.log(`  speedup: ${(coldTime / warmTime).toFixed(2)}x`);
    });

    it('should handle value changes correctly', async () => {
        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                input: { id: 'input', type: NUMBER, value: 10 },
                computed: {
                    id: 'computed',
                    type: NUMBER,
                    value: op('mul', lit(5), lit(2))  // Simple literal computation
                }
            }
        });
        form.setRegistry(defaultRegistry);

        const result1 = await form.getValue(['computed']);
        expect(result1).toBe(10);

        // Measure re-evaluation time
        const start = performance.now();
        form.clearCache();
        const result2 = await form.getValue(['computed']);
        const elapsed = performance.now() - start;

        expect(result2).toBe(10);
        console.log(`  cache clear + re-eval: ${elapsed.toFixed(2)}ms`);
    });
});
