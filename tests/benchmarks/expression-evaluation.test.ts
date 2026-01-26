/**
 * Expression Evaluation Benchmarks
 * Tests evaluation performance of expressions at various scales.
 */

import { describe, test, expect } from 'bun:test';
import {
    Property,
    PROPERTY,
    lit,
    op,
    ref,
    PropertyNode,
    createRegistry,
    evaluate,
    evalArg,
    evalArgs,
    EvaluationContext,
    Registry,
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

// Create a registry with common operators for benchmarking
const createBenchmarkRegistry = (): Registry => {
    const registry = createRegistry();

    // Arithmetic
    registry.register('add', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) + (b as number);
    });

    registry.register('sub', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) - (b as number);
    });

    registry.register('mul', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) * (b as number);
    });

    registry.register('div', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) / (b as number);
    });

    registry.register('mod', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) % (b as number);
    });

    // Comparison
    registry.register('eq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a === b;
    });

    registry.register('neq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a !== b;
    });

    registry.register('gt', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) > (b as number);
    });

    registry.register('gte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) >= (b as number);
    });

    registry.register('lt', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) < (b as number);
    });

    registry.register('lte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) <= (b as number);
    });

    // Logic
    registry.register('and', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return Boolean(a) && Boolean(b);
    });

    registry.register('or', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return Boolean(a) || Boolean(b);
    });

    registry.register('not', async (args, ctx) => {
        const a = await evalArg(args[0]!, ctx);
        return !a;
    });

    registry.register('if', async (args, ctx) => {
        const condition = await evalArg(args[0]!, ctx);
        if (condition) {
            return evalArg(args[1]!, ctx);
        } else {
            return args[2] ? evalArg(args[2], ctx) : null;
        }
    });

    // String
    registry.register('concat', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return values.map(String).join('');
    });

    registry.register('upper', async (args, ctx) => {
        const s = await evalArg(args[0]!, ctx);
        return String(s).toUpperCase();
    });

    registry.register('lower', async (args, ctx) => {
        const s = await evalArg(args[0]!, ctx);
        return String(s).toLowerCase();
    });

    registry.register('trim', async (args, ctx) => {
        const s = await evalArg(args[0]!, ctx);
        return String(s).trim();
    });

    registry.register('strlen', async (args, ctx) => {
        const s = await evalArg(args[0]!, ctx);
        return String(s).length;
    });

    registry.register('substr', async (args, ctx) => {
        const [s, start, end] = await evalArgs(args, ctx);
        return String(s).substring(start as number, end as number);
    });

    // Array
    registry.register('len', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        return Array.isArray(arr) ? arr.length : String(arr).length;
    });

    registry.register('isEmpty', async (args, ctx) => {
        const val = await evalArg(args[0]!, ctx);
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') return val.trim() === '';
        if (Array.isArray(val)) return val.length === 0;
        return false;
    });

    registry.register('sum', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        if (!Array.isArray(arr)) return 0;
        return arr.reduce((sum: number, n) => sum + (n as number), 0);
    });

    registry.register('avg', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const sum = arr.reduce((s: number, n) => s + (n as number), 0);
        return sum / arr.length;
    });

    return registry;
};

describe('Expression Evaluation Benchmarks', () => {
    const registry = createBenchmarkRegistry();

    const createContext = (current: Property, root?: Property): EvaluationContext => ({
        current,
        root: root ?? current,
        registry,
    });

    describe('Literal Evaluation', () => {
        test('evaluate 5000 number literals', async () => {
            const literals = Array.from({ length: 5000 }, (_, i) => lit(i));
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('5000 number literals', async () => {
                for (const expr of literals) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(10);
        });

        test('evaluate 5000 string literals', async () => {
            const literals = Array.from({ length: 5000 }, (_, i) => lit(`string${i}`));
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('5000 string literals', async () => {
                for (const expr of literals) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(10);
        });

        test('evaluate 5000 mixed literals', async () => {
            const literals = Array.from({ length: 5000 }, (_, i) => {
                switch (i % 4) {
                    case 0: return lit(i);
                    case 1: return lit(`str${i}`);
                    case 2: return lit(i % 2 === 0);
                    default: return lit([i, i + 1]);
                }
            });
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('5000 mixed literals', async () => {
                for (const expr of literals) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(10);
        });
    });

    describe('Arithmetic Operations', () => {
        test('evaluate 1000 add operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) => op('add', lit(i), lit(i + 1)));
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 add ops', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 1000 mul operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) => op('mul', lit(i), lit(2)));
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 mul ops', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 1000 mixed arithmetic', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) => {
                switch (i % 4) {
                    case 0: return op('add', lit(i), lit(1));
                    case 1: return op('sub', lit(i), lit(1));
                    case 2: return op('mul', lit(i), lit(2));
                    default: return op('div', lit(i + 1), lit(2));
                }
            });
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 mixed arithmetic', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 500 nested arithmetic (3 levels)', async () => {
            const ops = Array.from({ length: 500 }, (_, i) =>
                op('add',
                    op('mul', lit(i), lit(2)),
                    op('sub', lit(100), lit(i))
                )
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('500 nested arithmetic', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(30);
        });
    });

    describe('String Operations', () => {
        test('evaluate 1000 concat operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) =>
                op('concat', lit('Hello '), lit(`World ${i}`))
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 concat ops', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 1000 upper/lower operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) =>
                i % 2 === 0 ? op('upper', lit('hello')) : op('lower', lit('HELLO'))
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 upper/lower ops', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 1000 strlen operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) =>
                op('strlen', lit(`test string ${i}`))
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 strlen ops', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });
    });

    describe('Conditional Logic', () => {
        test('evaluate 1000 if-then-else operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) =>
                op('if', op('gt', lit(i), lit(500)), lit('big'), lit('small'))
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 if-then-else', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(30);
        });

        test('evaluate 500 nested conditionals', async () => {
            const ops = Array.from({ length: 500 }, (_, i) =>
                op('if',
                    op('gt', lit(i), lit(250)),
                    op('if', op('gt', lit(i), lit(375)), lit('large'), lit('medium')),
                    lit('small')
                )
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('500 nested conditionals', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(50);
        });

        test('evaluate 1000 boolean logic operations', async () => {
            const ops = Array.from({ length: 1000 }, (_, i) => {
                switch (i % 3) {
                    case 0: return op('and', lit(true), lit(i % 2 === 0));
                    case 1: return op('or', lit(false), lit(i % 2 === 0));
                    default: return op('not', lit(i % 2 === 0));
                }
            });
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('1000 boolean logic', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });
    });

    describe('Reference Resolution', () => {
        test('evaluate 1000 self.value references', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                value: 42,
            };
            const refs = Array.from({ length: 1000 }, () => ref('self.value'));
            const ctx = createContext(prop);

            const time = await benchmark('1000 self.value refs', async () => {
                for (const expr of refs) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('evaluate 500 nested child references', async () => {
            const prop: Property = {
                id: 'parent',
                type: PROPERTY,
                children: {
                    child: {
                        id: 'child',
                        type: PROPERTY,
                        value: 'nested value',
                    },
                },
            };
            const refs = Array.from({ length: 500 }, () => ref('self.child.value'));
            const ctx = createContext(prop);

            const time = await benchmark('500 nested refs', async () => {
                for (const expr of refs) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(20);
        });
    });

    describe('Complex Expressions', () => {
        test('evaluate 500 complex expressions (5+ operations)', async () => {
            // (a + b) * (c - d) / e
            const ops = Array.from({ length: 500 }, (_, i) =>
                op('div',
                    op('mul',
                        op('add', lit(i), lit(10)),
                        op('sub', lit(100), lit(i))
                    ),
                    lit(i + 1)
                )
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('500 complex (5 ops)', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(50);
        });

        test('evaluate 200 very complex expressions (10+ operations)', async () => {
            // Simulate: if (a > 50 && b < 100) then (a + b) * 2 else (a - b) / 2
            const ops = Array.from({ length: 200 }, (_, i) =>
                op('if',
                    op('and',
                        op('gt', lit(i), lit(50)),
                        op('lt', lit(i + 20), lit(100))
                    ),
                    op('mul', op('add', lit(i), lit(i + 20)), lit(2)),
                    op('div', op('sub', lit(i), lit(i + 20)), lit(2))
                )
            );
            const ctx = createContext({ id: 'root', type: PROPERTY });

            const time = await benchmark('200 very complex (10+ ops)', async () => {
                for (const expr of ops) {
                    await evaluate(expr, ctx);
                }
            });

            expect(time).toBeLessThan(100);
        });
    });

    describe('PropertyNode getValue', () => {
        test('getValue 1000 times on simple property', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                value: 42,
            };
            const node = PropertyNode.create(prop, registry);

            const time = await benchmark('1000 getValue calls', async () => {
                for (let i = 0; i < 1000; i++) {
                    await node.getValue();
                }
            });

            expect(time).toBeLessThan(20);
        });

        test('getValue 500 times on computed property', async () => {
            const prop: Property = {
                id: 'test',
                type: PROPERTY,
                value: op('mul', lit(10), lit(5)),
            };
            const node = PropertyNode.create(prop, registry);

            const time = await benchmark('500 computed getValue', async () => {
                for (let i = 0; i < 500; i++) {
                    await node.getValue();
                }
            });

            expect(time).toBeLessThan(30);
        });

        test('getValue 500 times with path navigation', async () => {
            const prop: Property = {
                id: 'form',
                type: PROPERTY,
                children: {
                    user: {
                        id: 'user',
                        type: PROPERTY,
                        children: {
                            name: { id: 'name', type: PROPERTY, value: 'John' },
                        },
                    },
                },
            };
            const node = PropertyNode.create(prop, registry);

            const time = await benchmark('500 path getValue', async () => {
                for (let i = 0; i < 500; i++) {
                    await node.getValue('user.name');
                }
            });

            expect(time).toBeLessThan(30);
        });
    });
});
