import { describe, it, expect } from 'bun:test';
import { lit, ref, op } from '../../../src/builtin/expressions';
import { LIT, REF, OP } from '../../../src/builtin/types/expressions';

describe('Expression Factories', () => {
    describe('lit', () => {
        it('should create a literal with number value', () => {
            const expr = lit(42);
            expect(expr.id).toBe('lit');
            expect(expr.type).toBe(LIT);
            expect(expr.value).toBe(42);
        });

        it('should create a literal with string value', () => {
            const expr = lit('hello');
            expect(expr.value).toBe('hello');
        });

        it('should create a literal with boolean value', () => {
            const expr = lit(true);
            expect(expr.value).toBe(true);
        });

        it('should create a literal with null value', () => {
            const expr = lit(null);
            expect(expr.value).toBe(null);
        });

        it('should create a literal with array value', () => {
            const expr = lit([1, 2, 3]);
            expect(expr.value).toEqual([1, 2, 3]);
        });

        it('should create a literal with object value', () => {
            const expr = lit({ name: 'John' });
            expect(expr.value).toEqual({ name: 'John' });
        });
    });

    describe('ref', () => {
        it('should create a reference with path', () => {
            const expr = ref(['self', 'value']);
            expect(expr.id).toBe('ref');
            expect(expr.type).toBe(REF);
            expect(expr.value).toEqual(['self', 'value']);
        });

        it('should handle complex paths', () => {
            const path = ['root', 'children', 'form', 'children', 'email', 'value'];
            const expr = ref(path);
            expect(expr.value).toEqual(path);
        });

        it('should handle single-segment path', () => {
            const expr = ref(['self']);
            expect(expr.value).toEqual(['self']);
        });
    });

    describe('op', () => {
        it('should create an operator with name', () => {
            const expr = op('add', lit(1), lit(2));
            expect(expr.id).toBe('add');
            expect(expr.type).toBe(OP);
        });

        it('should store arguments in children', () => {
            const expr = op('add', lit(5), lit(3));
            expect(expr.children?.arg0).toBeDefined();
            expect(expr.children?.arg1).toBeDefined();
            expect(expr.children?.arg0.value).toBe(5);
            expect(expr.children?.arg1.value).toBe(3);
        });

        it('should handle single argument', () => {
            const expr = op('not', lit(true));
            expect(expr.children?.arg0).toBeDefined();
            expect(expr.children?.arg1).toBeUndefined();
        });

        it('should handle no arguments', () => {
            const expr = op('now');
            expect(expr.children).toEqual({});
        });

        it('should handle many arguments', () => {
            const expr = op('concat', lit('a'), lit('b'), lit('c'), lit('d'));
            expect(expr.children?.arg0.value).toBe('a');
            expect(expr.children?.arg1.value).toBe('b');
            expect(expr.children?.arg2.value).toBe('c');
            expect(expr.children?.arg3.value).toBe('d');
        });

        it('should allow nested operators', () => {
            const expr = op('mul', op('add', lit(1), lit(2)), lit(3));
            expect(expr.id).toBe('mul');
            expect(expr.children?.arg0.id).toBe('add');
            expect(expr.children?.arg0.children?.arg0.value).toBe(1);
        });

        it('should allow mixing refs and lits', () => {
            const expr = op('add', ref(['self', 'value']), lit(10));
            expect(expr.children?.arg0.type).toBe(REF);
            expect(expr.children?.arg1.type).toBe(LIT);
        });
    });
});

