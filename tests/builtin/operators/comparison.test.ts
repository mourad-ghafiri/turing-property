import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Comparison Operators', () => {
    describe('eq', () => {
        it('should return true for equal numbers', async () => {
            expect(await evaluate(op('eq', lit(5), lit(5)), createCtx())).toBe(true);
        });

        it('should return false for different numbers', async () => {
            expect(await evaluate(op('eq', lit(5), lit(3)), createCtx())).toBe(false);
        });

        it('should compare strings', async () => {
            expect(await evaluate(op('eq', lit('hello'), lit('hello')), createCtx())).toBe(true);
            expect(await evaluate(op('eq', lit('hello'), lit('world')), createCtx())).toBe(false);
        });

        it('should compare booleans', async () => {
            expect(await evaluate(op('eq', lit(true), lit(true)), createCtx())).toBe(true);
            expect(await evaluate(op('eq', lit(true), lit(false)), createCtx())).toBe(false);
        });
    });

    describe('neq', () => {
        it('should return true for different values', async () => {
            expect(await evaluate(op('neq', lit(5), lit(3)), createCtx())).toBe(true);
        });

        it('should return false for equal values', async () => {
            expect(await evaluate(op('neq', lit(5), lit(5)), createCtx())).toBe(false);
        });
    });

    describe('gt', () => {
        it('should return true when first is greater', async () => {
            expect(await evaluate(op('gt', lit(5), lit(3)), createCtx())).toBe(true);
        });

        it('should return false when equal', async () => {
            expect(await evaluate(op('gt', lit(5), lit(5)), createCtx())).toBe(false);
        });

        it('should return false when first is less', async () => {
            expect(await evaluate(op('gt', lit(3), lit(5)), createCtx())).toBe(false);
        });
    });

    describe('gte', () => {
        it('should return true when greater', async () => {
            expect(await evaluate(op('gte', lit(5), lit(3)), createCtx())).toBe(true);
        });

        it('should return true when equal', async () => {
            expect(await evaluate(op('gte', lit(5), lit(5)), createCtx())).toBe(true);
        });

        it('should return false when less', async () => {
            expect(await evaluate(op('gte', lit(3), lit(5)), createCtx())).toBe(false);
        });
    });

    describe('lt', () => {
        it('should return true when first is less', async () => {
            expect(await evaluate(op('lt', lit(3), lit(5)), createCtx())).toBe(true);
        });

        it('should return false when equal', async () => {
            expect(await evaluate(op('lt', lit(5), lit(5)), createCtx())).toBe(false);
        });
    });

    describe('lte', () => {
        it('should return true when less', async () => {
            expect(await evaluate(op('lte', lit(3), lit(5)), createCtx())).toBe(true);
        });

        it('should return true when equal', async () => {
            expect(await evaluate(op('lte', lit(5), lit(5)), createCtx())).toBe(true);
        });
    });

    describe('between', () => {
        it('should return true when value is in range', async () => {
            expect(await evaluate(op('between', lit(5), lit(1), lit(10)), createCtx())).toBe(true);
        });

        it('should return true at boundaries', async () => {
            expect(await evaluate(op('between', lit(1), lit(1), lit(10)), createCtx())).toBe(true);
            expect(await evaluate(op('between', lit(10), lit(1), lit(10)), createCtx())).toBe(true);
        });

        it('should return false when outside range', async () => {
            expect(await evaluate(op('between', lit(0), lit(1), lit(10)), createCtx())).toBe(false);
            expect(await evaluate(op('between', lit(11), lit(1), lit(10)), createCtx())).toBe(false);
        });
    });

    describe('inRange', () => {
        it('should return true when in [min, max)', async () => {
            expect(await evaluate(op('inRange', lit(5), lit(1), lit(10)), createCtx())).toBe(true);
            expect(await evaluate(op('inRange', lit(1), lit(1), lit(10)), createCtx())).toBe(true);
        });

        it('should return false at max (exclusive)', async () => {
            expect(await evaluate(op('inRange', lit(10), lit(1), lit(10)), createCtx())).toBe(false);
        });
    });
});

