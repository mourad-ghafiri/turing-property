import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Arithmetic Operators', () => {
    describe('add', () => {
        it('should add two numbers', async () => {
            const expr = op('add', lit(5), lit(3));
            expect(await evaluate(expr, createCtx())).toBe(8);
        });

        it('should handle negative numbers', async () => {
            const expr = op('add', lit(-5), lit(3));
            expect(await evaluate(expr, createCtx())).toBe(-2);
        });

        it('should handle decimals', async () => {
            const expr = op('add', lit(0.1), lit(0.2));
            expect(await evaluate(expr, createCtx())).toBeCloseTo(0.3);
        });
    });

    describe('sub', () => {
        it('should subtract two numbers', async () => {
            const expr = op('sub', lit(10), lit(4));
            expect(await evaluate(expr, createCtx())).toBe(6);
        });
    });

    describe('mul', () => {
        it('should multiply two numbers', async () => {
            const expr = op('mul', lit(3), lit(4));
            expect(await evaluate(expr, createCtx())).toBe(12);
        });

        it('should handle zero', async () => {
            const expr = op('mul', lit(100), lit(0));
            expect(await evaluate(expr, createCtx())).toBe(0);
        });
    });

    describe('div', () => {
        it('should divide two numbers', async () => {
            const expr = op('div', lit(10), lit(2));
            expect(await evaluate(expr, createCtx())).toBe(5);
        });

        it('should handle division by zero', async () => {
            const expr = op('div', lit(10), lit(0));
            expect(await evaluate(expr, createCtx())).toBe(Infinity);
        });
    });

    describe('mod', () => {
        it('should return modulo', async () => {
            const expr = op('mod', lit(10), lit(3));
            expect(await evaluate(expr, createCtx())).toBe(1);
        });
    });

    describe('pow', () => {
        it('should calculate power', async () => {
            const expr = op('pow', lit(2), lit(3));
            expect(await evaluate(expr, createCtx())).toBe(8);
        });
    });

    describe('sqrt', () => {
        it('should calculate square root', async () => {
            const expr = op('sqrt', lit(16));
            expect(await evaluate(expr, createCtx())).toBe(4);
        });
    });

    describe('abs', () => {
        it('should return absolute value', async () => {
            const expr = op('abs', lit(-5));
            expect(await evaluate(expr, createCtx())).toBe(5);
        });

        it('should not change positive numbers', async () => {
            const expr = op('abs', lit(5));
            expect(await evaluate(expr, createCtx())).toBe(5);
        });
    });

    describe('ceil', () => {
        it('should round up', async () => {
            const expr = op('ceil', lit(4.2));
            expect(await evaluate(expr, createCtx())).toBe(5);
        });
    });

    describe('floor', () => {
        it('should round down', async () => {
            const expr = op('floor', lit(4.8));
            expect(await evaluate(expr, createCtx())).toBe(4);
        });
    });

    describe('round', () => {
        it('should round to nearest integer', async () => {
            expect(await evaluate(op('round', lit(4.4)), createCtx())).toBe(4);
            expect(await evaluate(op('round', lit(4.5)), createCtx())).toBe(5);
        });
    });

    describe('min', () => {
        it('should return minimum value', async () => {
            const expr = op('min', lit(3), lit(1), lit(5));
            expect(await evaluate(expr, createCtx())).toBe(1);
        });
    });

    describe('max', () => {
        it('should return maximum value', async () => {
            const expr = op('max', lit(3), lit(1), lit(5));
            expect(await evaluate(expr, createCtx())).toBe(5);
        });
    });

    describe('sum', () => {
        it('should sum array elements', async () => {
            const expr = op('sum', lit([1, 2, 3, 4]));
            expect(await evaluate(expr, createCtx())).toBe(10);
        });

        it('should return 0 for empty array', async () => {
            const expr = op('sum', lit([]));
            expect(await evaluate(expr, createCtx())).toBe(0);
        });
    });

    describe('avg', () => {
        it('should calculate average', async () => {
            const expr = op('avg', lit([2, 4, 6]));
            expect(await evaluate(expr, createCtx())).toBe(4);
        });

        it('should return 0 for empty array', async () => {
            const expr = op('avg', lit([]));
            expect(await evaluate(expr, createCtx())).toBe(0);
        });
    });

    describe('clamp', () => {
        it('should clamp value to range', async () => {
            expect(await evaluate(op('clamp', lit(15), lit(0), lit(10)), createCtx())).toBe(10);
            expect(await evaluate(op('clamp', lit(-5), lit(0), lit(10)), createCtx())).toBe(0);
            expect(await evaluate(op('clamp', lit(5), lit(0), lit(10)), createCtx())).toBe(5);
        });
    });

    describe('neg', () => {
        it('should negate a number', async () => {
            expect(await evaluate(op('neg', lit(5)), createCtx())).toBe(-5);
            expect(await evaluate(op('neg', lit(-5)), createCtx())).toBe(5);
        });
    });
});

