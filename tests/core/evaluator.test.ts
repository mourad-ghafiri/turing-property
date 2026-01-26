/**
 * Evaluator Tests
 * ================
 * Comprehensive tests for the expression evaluation engine.
 */

import { describe, test, expect } from 'bun:test';
import {
    // Types
    TYPE,
    PROPERTY,
    LIT,
    REF,
    OP,
    // Expressions
    lit,
    ref,
    op,
    // Evaluation
    evaluate,
    evalArg,
    evalArgs,
    evalArgsParallel,
    withBindings,
    createLoopContext,
    createRegistry,
} from '../../src';
import type { Property, EvaluationContext } from '../../src';

// ============================================================================
// TEST HELPERS
// ============================================================================

const createContext = (
    current: Property,
    root?: Property,
    registry = createRegistry()
): EvaluationContext => ({
    current,
    root: root ?? current,
    registry,
});

// ============================================================================
// LITERAL EVALUATION
// ============================================================================

describe('Evaluator: Literals', () => {
    test('evaluates number literal', async () => {
        const ctx = createContext(lit(0));
        expect(await evaluate(lit(42), ctx)).toBe(42);
        expect(await evaluate(lit(0), ctx)).toBe(0);
        expect(await evaluate(lit(-100), ctx)).toBe(-100);
        expect(await evaluate(lit(3.14), ctx)).toBe(3.14);
    });

    test('evaluates string literal', async () => {
        const ctx = createContext(lit(0));
        expect(await evaluate(lit('hello'), ctx)).toBe('hello');
        expect(await evaluate(lit(''), ctx)).toBe('');
        expect(await evaluate(lit('with spaces'), ctx)).toBe('with spaces');
    });

    test('evaluates boolean literal', async () => {
        const ctx = createContext(lit(0));
        expect(await evaluate(lit(true), ctx)).toBe(true);
        expect(await evaluate(lit(false), ctx)).toBe(false);
    });

    test('evaluates null and undefined literals', async () => {
        const ctx = createContext(lit(0));
        expect(await evaluate(lit(null), ctx)).toBe(null);
        expect(await evaluate(lit(undefined), ctx)).toBe(undefined);
    });

    test('evaluates array literal', async () => {
        const ctx = createContext(lit(0));
        const arr = [1, 2, 3];
        expect(await evaluate(lit(arr), ctx)).toBe(arr);
    });

    test('evaluates object literal', async () => {
        const ctx = createContext(lit(0));
        const obj = { a: 1, b: 2 };
        expect(await evaluate(lit(obj), ctx)).toBe(obj);
    });
});

// ============================================================================
// REFERENCE EVALUATION
// ============================================================================

describe('Evaluator: References', () => {
    describe('self references', () => {
        test('resolves self.value', async () => {
            const prop: Property = { id: 'test', type: PROPERTY, value: 42 };
            const ctx = createContext(prop);
            expect(await evaluate(ref('self.value'), ctx)).toBe(42);
        });

        test('resolves self.id', async () => {
            const prop: Property = { id: 'myId', type: PROPERTY };
            const ctx = createContext(prop);
            expect(await evaluate(ref('self.id'), ctx)).toBe('myId');
        });

        test('resolves self.type.id', async () => {
            const prop: Property = { id: 'test', type: PROPERTY };
            const ctx = createContext(prop);
            expect(await evaluate(ref(['self', 'type', 'id']), ctx)).toBe('Property');
        });
    });

    describe('root references', () => {
        test('resolves root.value', async () => {
            const root: Property = { id: 'root', type: PROPERTY, value: 'root-value' };
            const current: Property = { id: 'child', type: PROPERTY };
            const ctx = createContext(current, root);
            expect(await evaluate(ref('root.value'), ctx)).toBe('root-value');
        });

        test('resolves root.children.x.value', async () => {
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    x: { id: 'x', type: PROPERTY, value: 100 },
                },
            };
            const ctx = createContext(root);
            expect(await evaluate(ref('root.children.x.value'), ctx)).toBe(100);
        });

        test('resolves root.x.value (shortcut)', async () => {
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    x: { id: 'x', type: PROPERTY, value: 100 },
                },
            };
            const ctx = createContext(root);
            expect(await evaluate(ref('root.x.value'), ctx)).toBe(100);
        });
    });

    describe('parent references', () => {
        test('resolves parent reference', async () => {
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                value: 'parent-value',
                children: {
                    child: { id: 'child', type: PROPERTY },
                },
            };
            const child = root.children!.child;
            const ctx: EvaluationContext = {
                current: child,
                root,
                registry: createRegistry(),
                findParent: () => root,
            };
            expect(await evaluate(ref('parent.value'), ctx)).toBe('parent-value');
        });

        test('resolves parent.sibling.value', async () => {
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    a: { id: 'a', type: PROPERTY, value: 'A-value' },
                    b: { id: 'b', type: PROPERTY },
                },
            };
            const ctx: EvaluationContext = {
                current: root.children!.b,
                root,
                registry: createRegistry(),
                findParent: () => root,
            };
            expect(await evaluate(ref('parent.a.value'), ctx)).toBe('A-value');
        });
    });

    describe('metadata references', () => {
        test('resolves self.metadata.key.value', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                metadata: {
                    label: { id: 'label', type: LIT, value: 'My Label' },
                },
            };
            const ctx = createContext(prop);
            expect(await evaluate(ref('self.metadata.label.value'), ctx)).toBe('My Label');
        });

        test('resolves shortcut self.key.value for metadata', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                metadata: {
                    hint: { id: 'hint', type: LIT, value: 'A hint' },
                },
            };
            const ctx = createContext(prop);
            // Should check children first, then metadata
            expect(await evaluate(ref('self.hint.value'), ctx)).toBe('A hint');
        });
    });

    describe('constraint references', () => {
        test('resolves self.constraints.key', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                constraints: {
                    required: { id: 'required', type: PROPERTY, value: true },
                },
            };
            const ctx = createContext(prop);
            const result = await evaluate(ref('self.constraints.required.value'), ctx);
            expect(result).toBe(true);
        });
    });

    describe('deep navigation', () => {
        test('resolves deeply nested path', async () => {
            const root: Property = {
                id: 'root',
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
            const ctx = createContext(root);
            expect(await evaluate(ref('root.level1.level2.level3.value'), ctx)).toBe('deep-value');
        });

        test('returns undefined for non-existent path', async () => {
            const prop: Property = { id: 'test', type: PROPERTY };
            const ctx = createContext(prop);
            expect(await evaluate(ref('self.nonexistent.value'), ctx)).toBeUndefined();
        });
    });
});

// ============================================================================
// OPERATOR EVALUATION
// ============================================================================

describe('Evaluator: Operators', () => {
    describe('basic operators', () => {
        test('evaluates operator with literal args', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });

            const ctx = createContext(lit(0), lit(0), registry);
            expect(await evaluate(op('add', lit(1), lit(2)), ctx)).toBe(3);
        });

        test('evaluates operator with reference args', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });

            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    x: { id: 'x', type: PROPERTY, value: 10 },
                    y: { id: 'y', type: PROPERTY, value: 20 },
                },
            };
            const ctx = createContext(root, root, registry);
            expect(await evaluate(op('add', ref('self.x.value'), ref('self.y.value')), ctx)).toBe(30);
        });

        test('evaluates nested operators', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });
            registry.register('mul', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) * (b as number);
            });

            const ctx = createContext(lit(0), lit(0), registry);
            // (1 + 2) * (3 + 4) = 3 * 7 = 21
            const expr = op('mul',
                op('add', lit(1), lit(2)),
                op('add', lit(3), lit(4))
            );
            expect(await evaluate(expr, ctx)).toBe(21);
        });

        test('throws on unknown operator', async () => {
            const registry = createRegistry();
            const ctx = createContext(lit(0), lit(0), registry);
            await expect(evaluate(op('unknown', lit(1)), ctx)).rejects.toThrow('Unknown operator');
        });

        test('throws after operator is unregistered', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });

            const ctx = createContext(lit(0), lit(0), registry);

            // Works before unregister
            expect(await evaluate(op('add', lit(1), lit(2)), ctx)).toBe(3);

            // Unregister
            registry.unregister('add');

            // Throws after unregister
            await expect(evaluate(op('add', lit(1), lit(2)), ctx)).rejects.toThrow('Unknown operator');
        });

        test('other operators still work after unregistering one', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });
            registry.register('mul', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) * (b as number);
            });

            const ctx = createContext(lit(0), lit(0), registry);

            // Unregister add
            registry.unregister('add');

            // mul still works
            expect(await evaluate(op('mul', lit(2), lit(3)), ctx)).toBe(6);

            // add throws
            await expect(evaluate(op('add', lit(1), lit(2)), ctx)).rejects.toThrow('Unknown operator');
        });

        test('clear() makes all operators throw', async () => {
            const registry = createRegistry();
            registry.register('add', async () => 0);
            registry.register('mul', async () => 0);

            const ctx = createContext(lit(0), lit(0), registry);

            registry.clear();

            await expect(evaluate(op('add', lit(1), lit(2)), ctx)).rejects.toThrow('Unknown operator');
            await expect(evaluate(op('mul', lit(1), lit(2)), ctx)).rejects.toThrow('Unknown operator');
        });

        test('can re-register operator after unregister', async () => {
            const registry = createRegistry();
            registry.register('op', async () => 'first');

            const ctx = createContext(lit(0), lit(0), registry);
            expect(await evaluate(op('op'), ctx)).toBe('first');

            registry.unregister('op');
            registry.register('op', async () => 'second');

            expect(await evaluate(op('op'), ctx)).toBe('second');
        });
    });

    describe('operator argument handling', () => {
        test('evalArg evaluates single argument', async () => {
            const registry = createRegistry();
            const ctx = createContext(lit(0), lit(0), registry);
            expect(await evalArg(lit(42), ctx)).toBe(42);
        });

        test('evalArgs evaluates multiple arguments sequentially', async () => {
            const registry = createRegistry();
            const ctx = createContext(lit(0), lit(0), registry);
            const results = await evalArgs([lit(1), lit(2), lit(3)], ctx);
            expect(results).toEqual([1, 2, 3]);
        });

        test('evalArgsParallel evaluates arguments in parallel', async () => {
            const registry = createRegistry();
            const ctx = createContext(lit(0), lit(0), registry);
            const results = await evalArgsParallel([lit(1), lit(2), lit(3)], ctx);
            expect(results).toEqual([1, 2, 3]);
        });

        test('operator receives unevaluated args', async () => {
            const registry = createRegistry();
            let receivedArgs: Property[] = [];
            registry.register('capture', (args) => {
                receivedArgs = args;
                return null;
            });

            const ctx = createContext(lit(0), lit(0), registry);
            await evaluate(op('capture', lit(1), ref('self')), ctx);

            expect(receivedArgs.length).toBe(2);
            expect(receivedArgs[0]?.type).toBe(LIT);
            expect(receivedArgs[1]?.type).toBe(REF);
        });
    });

    describe('conditional operators', () => {
        test('if operator with true condition', async () => {
            const registry = createRegistry();
            registry.register('if', async (args, ctx) => {
                const condition = await evalArg(args[0]!, ctx);
                if (condition) {
                    return evalArg(args[1]!, ctx);
                }
                return args[2] ? evalArg(args[2], ctx) : null;
            });

            const ctx = createContext(lit(0), lit(0), registry);
            expect(await evaluate(op('if', lit(true), lit('yes'), lit('no')), ctx)).toBe('yes');
        });

        test('if operator with false condition', async () => {
            const registry = createRegistry();
            registry.register('if', async (args, ctx) => {
                const condition = await evalArg(args[0]!, ctx);
                if (condition) {
                    return evalArg(args[1]!, ctx);
                }
                return args[2] ? evalArg(args[2], ctx) : null;
            });

            const ctx = createContext(lit(0), lit(0), registry);
            expect(await evaluate(op('if', lit(false), lit('yes'), lit('no')), ctx)).toBe('no');
        });
    });

    describe('lazy evaluation', () => {
        test('operator can choose not to evaluate args', async () => {
            const registry = createRegistry();
            let secondArgEvaluated = false;

            registry.register('lazyOr', async (args, ctx) => {
                const first = await evalArg(args[0]!, ctx);
                if (first) return true;
                secondArgEvaluated = true;
                return evalArg(args[1]!, ctx);
            });

            const ctx = createContext(lit(0), lit(0), registry);
            await evaluate(op('lazyOr', lit(true), lit(false)), ctx);
            expect(secondArgEvaluated).toBe(false);
        });
    });
});

// ============================================================================
// BINDINGS
// ============================================================================

describe('Evaluator: Bindings', () => {
    test('withBindings adds bindings to context', () => {
        const registry = createRegistry();
        const ctx = createContext(lit(0), lit(0), registry);
        const ctxWithBindings = withBindings(ctx, { x: 10, y: 20 });

        expect(ctxWithBindings.bindings?.x).toBe(10);
        expect(ctxWithBindings.bindings?.y).toBe(20);
    });

    test('withBindings merges with existing bindings', () => {
        const registry = createRegistry();
        const ctx: EvaluationContext = {
            current: lit(0),
            root: lit(0),
            registry,
            bindings: { a: 1 },
        };
        const ctxWithBindings = withBindings(ctx, { b: 2 });

        expect(ctxWithBindings.bindings?.a).toBe(1);
        expect(ctxWithBindings.bindings?.b).toBe(2);
    });

    test('ref resolves from bindings', async () => {
        const registry = createRegistry();
        const ctx: EvaluationContext = {
            current: lit(0),
            root: lit(0),
            registry,
            bindings: { item: 42 },
        };

        expect(await evaluate(ref(['item']), ctx)).toBe(42);
    });

    test('ref resolves nested binding path', async () => {
        const registry = createRegistry();
        const ctx: EvaluationContext = {
            current: lit(0),
            root: lit(0),
            registry,
            bindings: { user: { name: 'John', age: 30 } },
        };

        expect(await evaluate(ref(['user', 'name']), ctx)).toBe('John');
        expect(await evaluate(ref(['user', 'age']), ctx)).toBe(30);
    });

    test('createLoopContext creates mutable bindings', () => {
        const registry = createRegistry();
        const ctx = createContext(lit(0), lit(0), registry);
        const { loopCtx, bindings } = createLoopContext(ctx);

        bindings.item = 'test';
        bindings.index = 0;

        expect(loopCtx.bindings?.item).toBe('test');
        expect(loopCtx.bindings?.index).toBe(0);
    });
});

// ============================================================================
// DEPTH PROTECTION
// ============================================================================

describe('Evaluator: Depth Protection', () => {
    test('throws on circular reference (max depth)', async () => {
        const registry = createRegistry();
        registry.register('recurse', async (args, ctx) => {
            return evaluate(op('recurse'), ctx);
        });

        const ctx = createContext(lit(0), lit(0), registry);
        await expect(evaluate(op('recurse'), ctx)).rejects.toThrow('Maximum evaluation depth exceeded');
    });

    test('handles deep but valid nesting', async () => {
        const registry = createRegistry();
        registry.register('identity', async (args, ctx) => {
            return evalArg(args[0]!, ctx);
        });

        const ctx = createContext(lit(0), lit(0), registry);

        // Create 50 levels of nesting (should work)
        let expr: Property = lit(42);
        for (let i = 0; i < 50; i++) {
            expr = op('identity', expr);
        }

        expect(await evaluate(expr, ctx)).toBe(42);
    });
});

// ============================================================================
// ASYNC OPERATORS
// ============================================================================

describe('Evaluator: Async Operators', () => {
    test('handles async operator', async () => {
        const registry = createRegistry();
        registry.register('asyncAdd', async (args, ctx) => {
            await new Promise(resolve => setTimeout(resolve, 1));
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });

        const ctx = createContext(lit(0), lit(0), registry);
        expect(await evaluate(op('asyncAdd', lit(1), lit(2)), ctx)).toBe(3);
    });

    test('handles sync operator', async () => {
        const registry = createRegistry();
        registry.register('syncAdd', (args, ctx) => {
            // Sync version - no await
            return 100;
        });

        const ctx = createContext(lit(0), lit(0), registry);
        expect(await evaluate(op('syncAdd', lit(1), lit(2)), ctx)).toBe(100);
    });
});

// ============================================================================
// COMPLEX SCENARIOS
// ============================================================================

describe('Evaluator: Complex Scenarios', () => {
    test('map operation with bindings', async () => {
        const registry = createRegistry();

        registry.register('map', async (args, ctx) => {
            const array = await evalArg(args[0]!, ctx) as unknown[];
            const expr = args[1]!;
            const results: unknown[] = [];

            const { loopCtx, bindings } = createLoopContext(ctx);
            for (let i = 0; i < array.length; i++) {
                bindings.item = array[i];
                bindings.index = i;
                results.push(await evaluate(expr, loopCtx));
            }
            return results;
        });

        registry.register('mul', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) * (b as number);
        });

        const ctx = createContext(lit(0), lit(0), registry);
        // Map [1, 2, 3] with item * 2
        const result = await evaluate(
            op('map', lit([1, 2, 3]), op('mul', ref(['item']), lit(2))),
            ctx
        );
        expect(result).toEqual([2, 4, 6]);
    });

    test('filter operation with bindings', async () => {
        const registry = createRegistry();

        registry.register('filter', async (args, ctx) => {
            const array = await evalArg(args[0]!, ctx) as unknown[];
            const predicate = args[1]!;
            const results: unknown[] = [];

            const { loopCtx, bindings } = createLoopContext(ctx);
            for (const item of array) {
                bindings.item = item;
                const keep = await evaluate(predicate, loopCtx);
                if (keep) results.push(item);
            }
            return results;
        });

        registry.register('gt', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) > (b as number);
        });

        const ctx = createContext(lit(0), lit(0), registry);
        // Filter [1, 2, 3, 4, 5] where item > 2
        const result = await evaluate(
            op('filter', lit([1, 2, 3, 4, 5]), op('gt', ref(['item']), lit(2))),
            ctx
        );
        expect(result).toEqual([3, 4, 5]);
    });

    test('reduce operation with bindings', async () => {
        const registry = createRegistry();

        registry.register('reduce', async (args, ctx) => {
            const array = await evalArg(args[0]!, ctx) as unknown[];
            const reducer = args[1]!;
            let acc = await evalArg(args[2]!, ctx);

            const { loopCtx, bindings } = createLoopContext(ctx);
            for (const item of array) {
                bindings.acc = acc;
                bindings.item = item;
                acc = await evaluate(reducer, loopCtx);
            }
            return acc;
        });

        registry.register('add', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });

        const ctx = createContext(lit(0), lit(0), registry);
        // Reduce [1, 2, 3, 4] with acc + item, starting at 0
        const result = await evaluate(
            op('reduce', lit([1, 2, 3, 4]), op('add', ref(['acc']), ref(['item'])), lit(0)),
            ctx
        );
        expect(result).toBe(10);
    });

    test('expression evaluates value in property', async () => {
        const registry = createRegistry();
        registry.register('add', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });

        const root: Property = {
            id: 'root',
            type: PROPERTY,
            children: {
                a: { id: 'a', type: PROPERTY, value: 5 },
                b: { id: 'b', type: PROPERTY, value: 3 },
                sum: {
                    id: 'sum',
                    type: PROPERTY,
                    value: op('add', ref('parent.a.value'), ref('parent.b.value')),
                },
            },
        };

        const ctx: EvaluationContext = {
            current: root.children!.sum,
            root,
            registry,
            findParent: () => root,
        };

        const sumValue = root.children!.sum.value as Property;
        const result = await evaluate(sumValue, ctx);
        expect(result).toBe(8);
    });
});

// ============================================================================
// CROSS-REFERENCED COMPUTED METADATA
// ============================================================================

describe('Evaluator: Cross-Referenced Computed Metadata', () => {
    test('ref to computed metadata (OP) auto-evaluates', async () => {
        const registry = createRegistry();
        registry.register('add', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });

        const root: Property = {
            id: 'root',
            type: PROPERTY,
            metadata: {
                // Computed metadata: 10 + 20 = 30
                subtotal: op('add', lit(10), lit(20)),
                // References the computed metadata
                total: op('add', ref('self.metadata.subtotal'), lit(5)),
            },
        };

        const ctx: EvaluationContext = {
            current: root,
            root,
            registry,
        };

        // ref to subtotal should auto-evaluate and return 30
        expect(await evaluate(ref('self.metadata.subtotal'), ctx)).toBe(30);

        // total should evaluate subtotal (30) + 5 = 35
        const totalExpr = root.metadata!.total as Property;
        expect(await evaluate(totalExpr, ctx)).toBe(35);
    });

    test('ref to LIT expression auto-evaluates', async () => {
        const registry = createRegistry();

        const root: Property = {
            id: 'root',
            type: PROPERTY,
            metadata: {
                label: lit('Hello World'),
            },
        };

        const ctx: EvaluationContext = {
            current: root,
            root,
            registry,
        };

        // ref to LIT metadata should return the literal value
        expect(await evaluate(ref('self.metadata.label'), ctx)).toBe('Hello World');
    });

    test('ref to REF expression auto-evaluates (chained refs)', async () => {
        const registry = createRegistry();

        const root: Property = {
            id: 'root',
            type: PROPERTY,
            value: 'original-value',
            metadata: {
                // REF that points to self.value
                valueRef: ref('self.value'),
                // REF that points to the REF above
                chainedRef: ref('self.metadata.valueRef'),
            },
        };

        const ctx: EvaluationContext = {
            current: root,
            root,
            registry,
        };

        // Both should resolve to 'original-value'
        expect(await evaluate(ref('self.metadata.valueRef'), ctx)).toBe('original-value');
        expect(await evaluate(ref('self.metadata.chainedRef'), ctx)).toBe('original-value');
    });

    test('complex cross-metadata calculation chain', async () => {
        const registry = createRegistry();
        registry.register('add', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });
        registry.register('mul', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) * (b as number);
        });
        registry.register('if', async (args, ctx) => {
            const condition = await evalArg(args[0]!, ctx);
            return condition ? evalArg(args[1]!, ctx) : evalArg(args[2]!, ctx);
        });
        registry.register('gte', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) >= (b as number);
        });

        const root: Property = {
            id: 'order',
            type: PROPERTY,
            metadata: {
                // Subtotal: 100
                subtotal: lit(100),
                // Tax rate: 0.08
                taxRate: lit(0.08),
                // Free shipping threshold: 50
                freeShippingThreshold: lit(50),
                // Shipping cost: 10
                baseShipping: lit(10),

                // Computed: tax = subtotal * taxRate
                tax: op('mul', ref('self.metadata.subtotal'), ref('self.metadata.taxRate')),

                // Computed: shipping = subtotal >= threshold ? 0 : baseShipping
                shipping: op('if',
                    op('gte', ref('self.metadata.subtotal'), ref('self.metadata.freeShippingThreshold')),
                    lit(0),
                    ref('self.metadata.baseShipping')
                ),

                // Computed: total = subtotal + tax + shipping
                total: op('add',
                    op('add', ref('self.metadata.subtotal'), ref('self.metadata.tax')),
                    ref('self.metadata.shipping')
                ),
            },
        };

        const ctx: EvaluationContext = {
            current: root,
            root,
            registry,
        };

        // subtotal = 100
        expect(await evaluate(ref('self.metadata.subtotal'), ctx)).toBe(100);

        // tax = 100 * 0.08 = 8
        expect(await evaluate(ref('self.metadata.tax'), ctx)).toBe(8);

        // shipping = 100 >= 50 ? 0 : 10 = 0 (free shipping)
        expect(await evaluate(ref('self.metadata.shipping'), ctx)).toBe(0);

        // total = 100 + 8 + 0 = 108
        expect(await evaluate(ref('self.metadata.total'), ctx)).toBe(108);
    });

    test('cross-metadata refs in children work correctly', async () => {
        const registry = createRegistry();
        registry.register('add', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) + (b as number);
        });

        const root: Property = {
            id: 'form',
            type: PROPERTY,
            children: {
                item1: {
                    id: 'item1',
                    type: PROPERTY,
                    metadata: {
                        price: lit(25),
                        quantity: lit(2),
                        lineTotal: op('mul', ref('self.metadata.price'), ref('self.metadata.quantity')),
                    },
                },
                item2: {
                    id: 'item2',
                    type: PROPERTY,
                    metadata: {
                        price: lit(15),
                        quantity: lit(3),
                        lineTotal: op('mul', ref('self.metadata.price'), ref('self.metadata.quantity')),
                    },
                },
            },
            metadata: {
                // Sum of line totals from children
                grandTotal: op('add',
                    ref('self.children.item1.metadata.lineTotal'),
                    ref('self.children.item2.metadata.lineTotal')
                ),
            },
        };

        registry.register('mul', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) * (b as number);
        });

        const ctx: EvaluationContext = {
            current: root,
            root,
            registry,
        };

        // item1 lineTotal = 25 * 2 = 50
        const item1Ctx = { ...ctx, current: root.children!.item1 };
        expect(await evaluate(ref('self.metadata.lineTotal'), item1Ctx)).toBe(50);

        // item2 lineTotal = 15 * 3 = 45
        const item2Ctx = { ...ctx, current: root.children!.item2 };
        expect(await evaluate(ref('self.metadata.lineTotal'), item2Ctx)).toBe(45);

        // grandTotal = 50 + 45 = 95
        expect(await evaluate(ref('self.metadata.grandTotal'), ctx)).toBe(95);
    });
});
