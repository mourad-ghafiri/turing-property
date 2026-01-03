import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { 
    MIN, MAX, BETWEEN, IN_RANGE,
    POSITIVE, NEGATIVE, NON_NEGATIVE, INTEGER, EVEN, ODD, DIVISIBLE_BY
} from '../../../src/builtin/constraints/number';
import { NUMBER } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createProp = (value: unknown, constraints: Record<string, Property>): Property => ({
    id: 'test',
    type: NUMBER,
    value,
    constraints
});

const createCtx = (prop: Property): EvaluationContext => ({
    current: prop,
    root: prop,
    registry: defaultRegistry
});

const check = async (value: unknown, constraint: Property): Promise<boolean> => {
    const prop = createProp(value, { test: constraint });
    const errors = await checkConstraints(prop, createCtx(prop));
    return Object.keys(errors).length === 0;
};

describe('Number Constraints', () => {
    describe('MIN', () => {
        it('should pass when value >= min', async () => {
            expect(await check(10, MIN(5))).toBe(true);
            expect(await check(5, MIN(5))).toBe(true);
        });

        it('should fail when value < min', async () => {
            expect(await check(3, MIN(5))).toBe(false);
        });
    });

    describe('MAX', () => {
        it('should pass when value <= max', async () => {
            expect(await check(5, MAX(10))).toBe(true);
            expect(await check(10, MAX(10))).toBe(true);
        });

        it('should fail when value > max', async () => {
            expect(await check(15, MAX(10))).toBe(false);
        });
    });

    describe('BETWEEN', () => {
        it('should pass when value in range (inclusive)', async () => {
            expect(await check(5, BETWEEN(1, 10))).toBe(true);
            expect(await check(1, BETWEEN(1, 10))).toBe(true);
            expect(await check(10, BETWEEN(1, 10))).toBe(true);
        });

        it('should fail when value outside range', async () => {
            expect(await check(0, BETWEEN(1, 10))).toBe(false);
            expect(await check(11, BETWEEN(1, 10))).toBe(false);
        });
    });

    describe('IN_RANGE', () => {
        it('should pass when value in [min, max)', async () => {
            expect(await check(5, IN_RANGE(1, 10))).toBe(true);
            expect(await check(1, IN_RANGE(1, 10))).toBe(true);
        });

        it('should fail at max (exclusive)', async () => {
            expect(await check(10, IN_RANGE(1, 10))).toBe(false);
        });
    });

    describe('POSITIVE', () => {
        it('should pass for positive numbers', async () => {
            expect(await check(1, POSITIVE)).toBe(true);
            expect(await check(100, POSITIVE)).toBe(true);
        });

        it('should fail for zero and negative', async () => {
            expect(await check(0, POSITIVE)).toBe(false);
            expect(await check(-1, POSITIVE)).toBe(false);
        });
    });

    describe('NEGATIVE', () => {
        it('should pass for negative numbers', async () => {
            expect(await check(-1, NEGATIVE)).toBe(true);
            expect(await check(-100, NEGATIVE)).toBe(true);
        });

        it('should fail for zero and positive', async () => {
            expect(await check(0, NEGATIVE)).toBe(false);
            expect(await check(1, NEGATIVE)).toBe(false);
        });
    });

    describe('NON_NEGATIVE', () => {
        it('should pass for zero and positive', async () => {
            expect(await check(0, NON_NEGATIVE)).toBe(true);
            expect(await check(100, NON_NEGATIVE)).toBe(true);
        });

        it('should fail for negative', async () => {
            expect(await check(-1, NON_NEGATIVE)).toBe(false);
        });
    });

    describe('INTEGER', () => {
        it('should pass for integers', async () => {
            expect(await check(5, INTEGER)).toBe(true);
            expect(await check(-10, INTEGER)).toBe(true);
            expect(await check(0, INTEGER)).toBe(true);
        });

        it('should fail for decimals', async () => {
            expect(await check(5.5, INTEGER)).toBe(false);
        });
    });

    describe('EVEN', () => {
        it('should pass for even numbers', async () => {
            expect(await check(2, EVEN)).toBe(true);
            expect(await check(0, EVEN)).toBe(true);
            expect(await check(-4, EVEN)).toBe(true);
        });

        it('should fail for odd numbers', async () => {
            expect(await check(3, EVEN)).toBe(false);
        });
    });

    describe('ODD', () => {
        it('should pass for odd numbers', async () => {
            expect(await check(1, ODD)).toBe(true);
            expect(await check(3, ODD)).toBe(true);
            expect(await check(-5, ODD)).toBe(true);
        });

        it('should fail for even numbers', async () => {
            expect(await check(2, ODD)).toBe(false);
        });
    });

    describe('DIVISIBLE_BY', () => {
        it('should pass when divisible', async () => {
            expect(await check(10, DIVISIBLE_BY(5))).toBe(true);
            expect(await check(12, DIVISIBLE_BY(3))).toBe(true);
        });

        it('should fail when not divisible', async () => {
            expect(await check(10, DIVISIBLE_BY(3))).toBe(false);
        });
    });
});

