import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Type Check Operators', () => {
    describe('isNull', () => {
        it('should return true for null', async () => {
            expect(await evaluate(op('isNull', lit(null)), createCtx())).toBe(true);
        });

        it('should return true for undefined', async () => {
            expect(await evaluate(op('isNull', lit(undefined)), createCtx())).toBe(true);
        });

        it('should return false for values', async () => {
            expect(await evaluate(op('isNull', lit(0)), createCtx())).toBe(false);
            expect(await evaluate(op('isNull', lit('')), createCtx())).toBe(false);
            expect(await evaluate(op('isNull', lit(false)), createCtx())).toBe(false);
        });
    });

    describe('isNotNull', () => {
        it('should return false for null', async () => {
            expect(await evaluate(op('isNotNull', lit(null)), createCtx())).toBe(false);
        });

        it('should return true for values', async () => {
            expect(await evaluate(op('isNotNull', lit(0)), createCtx())).toBe(true);
            expect(await evaluate(op('isNotNull', lit('')), createCtx())).toBe(true);
        });
    });

    describe('isEmpty', () => {
        it('should return true for null', async () => {
            expect(await evaluate(op('isEmpty', lit(null)), createCtx())).toBe(true);
        });

        it('should return true for empty string', async () => {
            expect(await evaluate(op('isEmpty', lit('')), createCtx())).toBe(true);
        });

        it('should return true for empty array', async () => {
            expect(await evaluate(op('isEmpty', lit([])), createCtx())).toBe(true);
        });

        it('should return true for empty object', async () => {
            expect(await evaluate(op('isEmpty', lit({})), createCtx())).toBe(true);
        });

        it('should return false for non-empty values', async () => {
            expect(await evaluate(op('isEmpty', lit('hello')), createCtx())).toBe(false);
            expect(await evaluate(op('isEmpty', lit([1, 2])), createCtx())).toBe(false);
            expect(await evaluate(op('isEmpty', lit({ a: 1 })), createCtx())).toBe(false);
        });
    });

    describe('isNotEmpty', () => {
        it('should return false for null', async () => {
            expect(await evaluate(op('isNotEmpty', lit(null)), createCtx())).toBe(false);
        });

        it('should return true for non-empty values', async () => {
            expect(await evaluate(op('isNotEmpty', lit('hello')), createCtx())).toBe(true);
            expect(await evaluate(op('isNotEmpty', lit([1])), createCtx())).toBe(true);
            expect(await evaluate(op('isNotEmpty', lit({ a: 1 })), createCtx())).toBe(true);
        });
    });

    describe('isNotBlank', () => {
        it('should return false for null', async () => {
            expect(await evaluate(op('isNotBlank', lit(null)), createCtx())).toBe(false);
        });

        it('should return false for whitespace-only strings', async () => {
            expect(await evaluate(op('isNotBlank', lit('   ')), createCtx())).toBe(false);
        });

        it('should return true for strings with content', async () => {
            expect(await evaluate(op('isNotBlank', lit('  hello  ')), createCtx())).toBe(true);
        });
    });

    describe('isNumber', () => {
        it('should return true for numbers', async () => {
            expect(await evaluate(op('isNumber', lit(42)), createCtx())).toBe(true);
            expect(await evaluate(op('isNumber', lit(3.14)), createCtx())).toBe(true);
        });

        it('should return false for NaN', async () => {
            expect(await evaluate(op('isNumber', lit(NaN)), createCtx())).toBe(false);
        });

        it('should return false for non-numbers', async () => {
            expect(await evaluate(op('isNumber', lit('42')), createCtx())).toBe(false);
        });
    });

    describe('isString', () => {
        it('should return true for strings', async () => {
            expect(await evaluate(op('isString', lit('hello')), createCtx())).toBe(true);
            expect(await evaluate(op('isString', lit('')), createCtx())).toBe(true);
        });

        it('should return false for non-strings', async () => {
            expect(await evaluate(op('isString', lit(42)), createCtx())).toBe(false);
        });
    });

    describe('isBoolean', () => {
        it('should return true for booleans', async () => {
            expect(await evaluate(op('isBoolean', lit(true)), createCtx())).toBe(true);
            expect(await evaluate(op('isBoolean', lit(false)), createCtx())).toBe(true);
        });

        it('should return false for non-booleans', async () => {
            expect(await evaluate(op('isBoolean', lit(1)), createCtx())).toBe(false);
        });
    });

    describe('isArray', () => {
        it('should return true for arrays', async () => {
            expect(await evaluate(op('isArray', lit([1, 2, 3])), createCtx())).toBe(true);
            expect(await evaluate(op('isArray', lit([])), createCtx())).toBe(true);
        });

        it('should return false for non-arrays', async () => {
            expect(await evaluate(op('isArray', lit({ length: 0 })), createCtx())).toBe(false);
        });
    });

    describe('isObject', () => {
        it('should return true for plain objects', async () => {
            expect(await evaluate(op('isObject', lit({ a: 1 })), createCtx())).toBe(true);
            expect(await evaluate(op('isObject', lit({})), createCtx())).toBe(true);
        });

        it('should return false for arrays', async () => {
            expect(await evaluate(op('isObject', lit([1, 2])), createCtx())).toBe(false);
        });

        it('should return false for null', async () => {
            expect(await evaluate(op('isObject', lit(null)), createCtx())).toBe(false);
        });
    });

    describe('isInteger', () => {
        it('should return true for integers', async () => {
            expect(await evaluate(op('isInteger', lit(42)), createCtx())).toBe(true);
            expect(await evaluate(op('isInteger', lit(-10)), createCtx())).toBe(true);
        });

        it('should return false for floats', async () => {
            expect(await evaluate(op('isInteger', lit(3.14)), createCtx())).toBe(false);
        });
    });

    describe('isFloat', () => {
        it('should return true for floats', async () => {
            expect(await evaluate(op('isFloat', lit(3.14)), createCtx())).toBe(true);
        });

        it('should return false for integers', async () => {
            expect(await evaluate(op('isFloat', lit(42)), createCtx())).toBe(false);
        });
    });

    describe('isPositive', () => {
        it('should return true for positive numbers', async () => {
            expect(await evaluate(op('isPositive', lit(1)), createCtx())).toBe(true);
        });

        it('should return false for zero and negative', async () => {
            expect(await evaluate(op('isPositive', lit(0)), createCtx())).toBe(false);
            expect(await evaluate(op('isPositive', lit(-1)), createCtx())).toBe(false);
        });
    });

    describe('isNegative', () => {
        it('should return true for negative numbers', async () => {
            expect(await evaluate(op('isNegative', lit(-1)), createCtx())).toBe(true);
        });

        it('should return false for zero and positive', async () => {
            expect(await evaluate(op('isNegative', lit(0)), createCtx())).toBe(false);
            expect(await evaluate(op('isNegative', lit(1)), createCtx())).toBe(false);
        });
    });

    describe('isEven', () => {
        it('should return true for even numbers', async () => {
            expect(await evaluate(op('isEven', lit(0)), createCtx())).toBe(true);
            expect(await evaluate(op('isEven', lit(2)), createCtx())).toBe(true);
            expect(await evaluate(op('isEven', lit(-4)), createCtx())).toBe(true);
        });

        it('should return false for odd numbers', async () => {
            expect(await evaluate(op('isEven', lit(1)), createCtx())).toBe(false);
            expect(await evaluate(op('isEven', lit(-3)), createCtx())).toBe(false);
        });
    });

    describe('isOdd', () => {
        it('should return true for odd numbers', async () => {
            expect(await evaluate(op('isOdd', lit(1)), createCtx())).toBe(true);
            expect(await evaluate(op('isOdd', lit(-3)), createCtx())).toBe(true);
        });

        it('should return false for even numbers', async () => {
            expect(await evaluate(op('isOdd', lit(0)), createCtx())).toBe(false);
            expect(await evaluate(op('isOdd', lit(2)), createCtx())).toBe(false);
        });
    });
});

