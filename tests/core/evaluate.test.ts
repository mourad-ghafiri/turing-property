import { describe, it, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { 
    evaluate, 
    createRegistry, 
    isLit, 
    isRef, 
    isOp,
    EvaluationContext 
} from '../../src/core/evaluate';
import { TYPE, LIT, REF, OP, STRING, NUMBER } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

describe('Type Checking Functions', () => {
    it('should identify LIT expressions', () => {
        const expr = lit(42);
        expect(isLit(expr)).toBe(true);
        expect(isRef(expr)).toBe(false);
        expect(isOp(expr)).toBe(false);
    });

    it('should identify REF expressions', () => {
        const expr = ref(['self', 'value']);
        expect(isLit(expr)).toBe(false);
        expect(isRef(expr)).toBe(true);
        expect(isOp(expr)).toBe(false);
    });

    it('should identify OP expressions', () => {
        const expr = op('add', lit(1), lit(2));
        expect(isLit(expr)).toBe(false);
        expect(isRef(expr)).toBe(false);
        expect(isOp(expr)).toBe(true);
    });
});

describe('Literal Evaluation', () => {
    it('should evaluate number literal', async () => {
        const expr = lit(42);
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toBe(42);
    });

    it('should evaluate string literal', async () => {
        const expr = lit('hello');
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toBe('hello');
    });

    it('should evaluate boolean literal', async () => {
        const trueExpr = lit(true);
        const falseExpr = lit(false);
        const ctx: EvaluationContext = {
            current: trueExpr,
            root: trueExpr,
            registry: defaultRegistry
        };
        
        expect(await evaluate(trueExpr, ctx)).toBe(true);
        expect(await evaluate(falseExpr, ctx)).toBe(false);
    });

    it('should evaluate null literal', async () => {
        const expr = lit(null);
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toBe(null);
    });

    it('should evaluate array literal', async () => {
        const expr = lit([1, 2, 3]);
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toEqual([1, 2, 3]);
    });

    it('should evaluate object literal', async () => {
        const expr = lit({ name: 'John', age: 30 });
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toEqual({ name: 'John', age: 30 });
    });
});

describe('Reference Evaluation', () => {
    it('should resolve self.value', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: 'hello world'
        };

        const refExpr = ref(['self', 'value']);
        const ctx: EvaluationContext = {
            current: prop,
            root: prop,
            registry: defaultRegistry
        };

        const result = await evaluate(refExpr, ctx);
        expect(result).toBe('hello world');
    });

    it('should resolve self.id', async () => {
        const prop: Property = {
            id: 'myProperty',
            type: STRING,
            value: 'test'
        };

        const refExpr = ref(['self', 'id']);
        const ctx: EvaluationContext = {
            current: prop,
            root: prop,
            registry: defaultRegistry
        };

        const result = await evaluate(refExpr, ctx);
        expect(result).toBe('myProperty');
    });

    it('should resolve children values', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' },
                age: { id: 'age', type: NUMBER, value: 25 }
            }
        };

        const ctx: EvaluationContext = {
            current: form,
            root: form,
            registry: defaultRegistry
        };

        const nameRef = ref(['self', 'children', 'name', 'value']);
        const ageRef = ref(['self', 'children', 'age', 'value']);

        expect(await evaluate(nameRef, ctx)).toBe('John');
        expect(await evaluate(ageRef, ctx)).toBe(25);
    });

    it('should resolve from root', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                settings: {
                    id: 'settings',
                    type: TYPE,
                    children: {
                        theme: { id: 'theme', type: STRING, value: 'dark' }
                    }
                }
            }
        };

        const themeRef = ref(['root', 'children', 'settings', 'children', 'theme', 'value']);
        const ctx: EvaluationContext = {
            current: form.children!.settings!,
            root: form,
            registry: defaultRegistry
        };

        const result = await evaluate(themeRef, ctx);
        expect(result).toBe('dark');
    });
});

describe('Operator Evaluation', () => {
    it('should evaluate add operator', async () => {
        const expr = op('add', lit(5), lit(3));
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toBe(8);
    });

    it('should evaluate nested operators', async () => {
        // (2 + 3) * 4 = 20
        const expr = op('mul', op('add', lit(2), lit(3)), lit(4));
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry: defaultRegistry
        };
        const result = await evaluate(expr, ctx);
        expect(result).toBe(20);
    });

    it('should evaluate conditional operator', async () => {
        const trueCase = op('if', lit(true), lit('yes'), lit('no'));
        const falseCase = op('if', lit(false), lit('yes'), lit('no'));
        
        const ctx: EvaluationContext = {
            current: trueCase,
            root: trueCase,
            registry: defaultRegistry
        };

        expect(await evaluate(trueCase, ctx)).toBe('yes');
        expect(await evaluate(falseCase, ctx)).toBe('no');
    });

    it('should evaluate with references', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                quantity: { id: 'quantity', type: NUMBER, value: 5 },
                price: { id: 'price', type: NUMBER, value: 10 }
            }
        };

        const totalExpr = op('mul',
            ref(['root', 'children', 'quantity', 'value']),
            ref(['root', 'children', 'price', 'value'])
        );

        const ctx: EvaluationContext = {
            current: form,
            root: form,
            registry: defaultRegistry
        };

        const result = await evaluate(totalExpr, ctx);
        expect(result).toBe(50);
    });
});

describe('Registry', () => {
    it('should create a new registry', () => {
        const registry = createRegistry();
        expect(registry.has('add')).toBe(false);
    });

    it('should register and retrieve operators', () => {
        const registry = createRegistry();
        registry.register('custom', async () => 42);
        
        expect(registry.has('custom')).toBe(true);
        expect(registry.get('custom')).toBeDefined();
    });

    it('should throw for unknown operator', async () => {
        const registry = createRegistry();
        const expr = op('unknownOp', lit(1));
        
        const ctx: EvaluationContext = {
            current: expr,
            root: expr,
            registry
        };

        await expect(evaluate(expr, ctx)).rejects.toThrow('Unknown operator');
    });
});

