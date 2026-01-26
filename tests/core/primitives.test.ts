/**
 * Core Primitives Tests
 * Tests for types, expressions, guards, and basic evaluation.
 */

import { describe, test, expect } from 'bun:test';
import {
    // Types
    TYPE,
    EXPR,
    OPERATOR,
    CONSTRAINT,
    PROPERTY,
    LIT,
    REF,
    OP,
    // Expressions
    lit,
    ref,
    op,
    // Guards
    isLit,
    isRef,
    isOp,
    isExpr,
    isType,
    isConstraint,
    isOperator,
    isProperty,
    getTypeName,
    // Registry & Evaluation
    Registry,
    createRegistry,
    evaluate,
    evalArg,
    evalArgs,
} from '../../src';

// ============================================================================
// TYPE SYSTEM TESTS
// ============================================================================

describe('Primitive Types', () => {
    test('TYPE is self-referential', () => {
        expect(TYPE.type).toBe(TYPE);
        expect(TYPE.id).toBe('Type');
    });

    test('Meta-types have TYPE as their type', () => {
        expect(EXPR.type).toBe(TYPE);
        expect(OPERATOR.type).toBe(TYPE);
        expect(CONSTRAINT.type).toBe(TYPE);
        expect(PROPERTY.type).toBe(TYPE);
    });

    test('Expression types have EXPR as their type', () => {
        expect(LIT.type).toBe(EXPR);
        expect(REF.type).toBe(EXPR);
        expect(OP.type).toBe(EXPR);
    });

    test('All types have correct IDs', () => {
        expect(TYPE.id).toBe('Type');
        expect(EXPR.id).toBe('Expr');
        expect(OPERATOR.id).toBe('Operator');
        expect(CONSTRAINT.id).toBe('Constraint');
        expect(PROPERTY.id).toBe('Property');
        expect(LIT.id).toBe('Lit');
        expect(REF.id).toBe('Ref');
        expect(OP.id).toBe('Op');
    });
});

// ============================================================================
// EXPRESSION FACTORY TESTS
// ============================================================================

describe('Expression Factories', () => {
    describe('lit()', () => {
        test('creates literal with number', () => {
            const expr = lit(42);
            expect(expr.id).toBe('lit');
            expect(expr.type).toBe(LIT);
            expect(expr.value).toBe(42);
        });

        test('creates literal with string', () => {
            const expr = lit('hello');
            expect(expr.value).toBe('hello');
        });

        test('creates literal with boolean', () => {
            const expr = lit(true);
            expect(expr.value).toBe(true);
        });

        test('creates literal with array', () => {
            const arr = [1, 2, 3];
            const expr = lit(arr);
            expect(expr.value).toBe(arr);
        });

        test('creates literal with object', () => {
            const obj = { a: 1, b: 2 };
            const expr = lit(obj);
            expect(expr.value).toBe(obj);
        });

        test('creates literal with null', () => {
            const expr = lit(null);
            expect(expr.value).toBe(null);
        });
    });

    describe('ref()', () => {
        test('creates reference with array path', () => {
            const expr = ref(['self', 'value']);
            expect(expr.id).toBe('ref');
            expect(expr.type).toBe(REF);
            expect(expr.value).toEqual(['self', 'value']);
        });

        test('creates reference with dot notation', () => {
            const expr = ref('self.value');
            expect(expr.id).toBe('ref');
            expect(expr.type).toBe(REF);
            expect(expr.value).toEqual(['self', 'value']);
        });

        test('dot notation splits correctly', () => {
            const expr = ref('parent.children.name.value');
            expect(expr.value).toEqual(['parent', 'children', 'name', 'value']);
        });

        test('array notation preserves segments', () => {
            const expr = ref(['root', 'metadata', 'config']);
            expect(expr.value).toEqual(['root', 'metadata', 'config']);
        });
    });

    describe('op()', () => {
        test('creates operator with no args', () => {
            const expr = op('noop');
            expect(expr.id).toBe('noop');
            expect(expr.type).toBe(OP);
            expect(expr.children).toEqual({});
        });

        test('creates operator with one arg', () => {
            const expr = op('not', lit(true));
            expect(expr.id).toBe('not');
            expect(expr.children?.arg0).toBeDefined();
            expect(expr.children?.arg0?.value).toBe(true);
        });

        test('creates operator with multiple args', () => {
            const expr = op('add', lit(1), lit(2));
            expect(expr.id).toBe('add');
            expect(expr.children?.arg0?.value).toBe(1);
            expect(expr.children?.arg1?.value).toBe(2);
        });

        test('creates nested operators', () => {
            const expr = op('add', lit(1), op('mul', lit(2), lit(3)));
            expect(expr.children?.arg0?.value).toBe(1);
            expect(expr.children?.arg1?.id).toBe('mul');
        });
    });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('Type Guards', () => {
    test('isLit() identifies literals', () => {
        expect(isLit(lit(42))).toBe(true);
        expect(isLit(ref('self'))).toBe(false);
        expect(isLit(op('add'))).toBe(false);
    });

    test('isRef() identifies references', () => {
        expect(isRef(ref('self'))).toBe(true);
        expect(isRef(lit(42))).toBe(false);
        expect(isRef(op('add'))).toBe(false);
    });

    test('isOp() identifies operators', () => {
        expect(isOp(op('add'))).toBe(true);
        expect(isOp(lit(42))).toBe(false);
        expect(isOp(ref('self'))).toBe(false);
    });

    test('isExpr() identifies any expression', () => {
        expect(isExpr(lit(42))).toBe(true);
        expect(isExpr(ref('self'))).toBe(true);
        expect(isExpr(op('add'))).toBe(true);
        expect(isExpr(TYPE)).toBe(false);
    });

    test('isType() identifies types', () => {
        expect(isType(TYPE)).toBe(true);
        expect(isType(EXPR)).toBe(true);
        expect(isType(lit(42))).toBe(false);
    });

    test('isConstraint() identifies constraints', () => {
        const constraint = { id: 'required', type: CONSTRAINT };
        expect(isConstraint(constraint)).toBe(true);
        expect(isConstraint(lit(42))).toBe(false);
    });

    test('isOperator() identifies operators', () => {
        const operator = { id: 'add', type: OPERATOR };
        expect(isOperator(operator)).toBe(true);
        expect(isOperator(lit(42))).toBe(false);
    });

    test('isProperty() uses duck typing', () => {
        expect(isProperty(lit(42))).toBe(true);
        expect(isProperty(TYPE)).toBe(true);
        expect(isProperty(null)).toBe(false);
        expect(isProperty({})).toBe(false);
        expect(isProperty({ id: 'test' })).toBe(false);
    });

    test('getTypeName() returns type ID', () => {
        expect(getTypeName(lit(42))).toBe('Lit');
        expect(getTypeName(ref('self'))).toBe('Ref');
        expect(getTypeName(op('add'))).toBe('Op');
        expect(getTypeName(TYPE)).toBe('Type');
    });
});

// ============================================================================
// REGISTRY TESTS
// ============================================================================

describe('Registry', () => {
    test('createRegistry() creates empty registry', () => {
        const registry = createRegistry();
        expect(registry.size).toBe(0);
    });

    test('register() adds operator', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        expect(registry.has('add')).toBe(true);
        expect(registry.size).toBe(1);
    });

    test('get() retrieves operator', () => {
        const registry = createRegistry();
        const addFn = () => 42;
        registry.register('add', addFn);
        expect(registry.get('add')).toBe(addFn);
    });

    test('get() returns undefined for missing operator', () => {
        const registry = createRegistry();
        expect(registry.get('missing')).toBeUndefined();
    });

    test('has() checks operator existence', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        expect(registry.has('add')).toBe(true);
        expect(registry.has('sub')).toBe(false);
    });

    test('keys() returns iterator of names', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        registry.register('sub', () => 0);
        const keys = [...registry.keys()];
        expect(keys).toContain('add');
        expect(keys).toContain('sub');
    });

    test('register() is chainable', () => {
        const registry = createRegistry()
            .register('add', () => 0)
            .register('sub', () => 0);
        expect(registry.size).toBe(2);
    });

    test('unregister() removes operator', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        expect(registry.has('add')).toBe(true);

        const result = registry.unregister('add');
        expect(result).toBe(true);
        expect(registry.has('add')).toBe(false);
        expect(registry.size).toBe(0);
    });

    test('unregister() returns false for non-existent operator', () => {
        const registry = createRegistry();
        const result = registry.unregister('nonexistent');
        expect(result).toBe(false);
    });

    test('unregister() only removes specified operator', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        registry.register('sub', () => 0);
        registry.register('mul', () => 0);

        registry.unregister('sub');

        expect(registry.has('add')).toBe(true);
        expect(registry.has('sub')).toBe(false);
        expect(registry.has('mul')).toBe(true);
        expect(registry.size).toBe(2);
    });

    test('clear() removes all operators', () => {
        const registry = createRegistry();
        registry.register('add', () => 0);
        registry.register('sub', () => 0);
        registry.register('mul', () => 0);
        expect(registry.size).toBe(3);

        registry.clear();

        expect(registry.size).toBe(0);
        expect(registry.has('add')).toBe(false);
        expect(registry.has('sub')).toBe(false);
        expect(registry.has('mul')).toBe(false);
    });

    test('clear() is chainable', () => {
        const registry = createRegistry()
            .register('add', () => 0)
            .clear()
            .register('sub', () => 0);

        expect(registry.size).toBe(1);
        expect(registry.has('sub')).toBe(true);
    });

    test('clear() on empty registry is safe', () => {
        const registry = createRegistry();
        registry.clear();
        expect(registry.size).toBe(0);
    });
});

// ============================================================================
// EVALUATION TESTS
// ============================================================================

describe('Evaluation', () => {
    const createContext = (registry: Registry, current = lit(0), root = current) => ({
        current,
        root,
        registry,
    });

    describe('Literal evaluation', () => {
        test('evaluates number literal', async () => {
            const registry = createRegistry();
            const result = await evaluate(lit(42), createContext(registry));
            expect(result).toBe(42);
        });

        test('evaluates string literal', async () => {
            const registry = createRegistry();
            const result = await evaluate(lit('hello'), createContext(registry));
            expect(result).toBe('hello');
        });

        test('evaluates boolean literal', async () => {
            const registry = createRegistry();
            const result = await evaluate(lit(true), createContext(registry));
            expect(result).toBe(true);
        });

        test('evaluates null literal', async () => {
            const registry = createRegistry();
            const result = await evaluate(lit(null), createContext(registry));
            expect(result).toBe(null);
        });

        test('evaluates array literal', async () => {
            const registry = createRegistry();
            const arr = [1, 2, 3];
            const result = await evaluate(lit(arr), createContext(registry));
            expect(result).toBe(arr);
        });
    });

    describe('Operator evaluation', () => {
        test('evaluates simple operator', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const a = await evalArg(args[0]!, ctx);
                const b = await evalArg(args[1]!, ctx);
                return (a as number) + (b as number);
            });

            const expr = op('add', lit(1), lit(2));
            const result = await evaluate(expr, createContext(registry));
            expect(result).toBe(3);
        });

        test('evaluates nested operators', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const a = await evalArg(args[0]!, ctx);
                const b = await evalArg(args[1]!, ctx);
                return (a as number) + (b as number);
            });
            registry.register('mul', async (args, ctx) => {
                const a = await evalArg(args[0]!, ctx);
                const b = await evalArg(args[1]!, ctx);
                return (a as number) * (b as number);
            });

            // (1 + 2) * 3 = 9
            const expr = op('mul', op('add', lit(1), lit(2)), lit(3));
            const result = await evaluate(expr, createContext(registry));
            expect(result).toBe(9);
        });

        test('throws on unknown operator', async () => {
            const registry = createRegistry();
            const expr = op('unknown', lit(1));
            await expect(evaluate(expr, createContext(registry))).rejects.toThrow('Unknown operator');
        });
    });

    describe('Reference evaluation', () => {
        test('evaluates self reference', async () => {
            const registry = createRegistry();
            const prop = {
                id: 'test',
                type: PROPERTY,
                value: 42,
            };
            const result = await evaluate(ref('self.value'), createContext(registry, prop, prop));
            expect(result).toBe(42);
        });

        test('evaluates root reference', async () => {
            const registry = createRegistry();
            const root = {
                id: 'root',
                type: PROPERTY,
                value: 'root-value',
            };
            const current = {
                id: 'child',
                type: PROPERTY,
                value: 'child-value',
            };
            const result = await evaluate(ref('root.value'), createContext(registry, current, root));
            expect(result).toBe('root-value');
        });

        test('evaluates child reference', async () => {
            const registry = createRegistry();
            const prop = {
                id: 'parent',
                type: PROPERTY,
                children: {
                    name: {
                        id: 'name',
                        type: PROPERTY,
                        value: 'John',
                    },
                },
            };
            const result = await evaluate(ref('self.name.value'), createContext(registry, prop, prop));
            expect(result).toBe('John');
        });
    });

    describe('evalArgs helper', () => {
        test('evaluates multiple arguments', async () => {
            const registry = createRegistry();
            const args = [lit(1), lit(2), lit(3)];
            const results = await evalArgs(args, createContext(registry));
            expect(results).toEqual([1, 2, 3]);
        });
    });
});
