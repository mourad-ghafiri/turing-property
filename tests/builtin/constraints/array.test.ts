import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { MIN_ITEMS, MAX_ITEMS, UNIQUE_ITEMS, NOT_EMPTY_ARRAY } from '../../../src/builtin/constraints/array';
import { LIST } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createProp = (value: unknown, constraints: Record<string, Property>): Property => ({
    id: 'test',
    type: LIST,
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

describe('Array Constraints', () => {
    describe('MIN_ITEMS', () => {
        it('should pass when array has >= n items', async () => {
            expect(await check([1, 2, 3], MIN_ITEMS(2))).toBe(true);
            expect(await check([1, 2], MIN_ITEMS(2))).toBe(true);
        });

        it('should fail when array has < n items', async () => {
            expect(await check([1], MIN_ITEMS(2))).toBe(false);
            expect(await check([], MIN_ITEMS(1))).toBe(false);
        });
    });

    describe('MAX_ITEMS', () => {
        it('should pass when array has <= n items', async () => {
            expect(await check([1, 2], MAX_ITEMS(3))).toBe(true);
            expect(await check([1, 2, 3], MAX_ITEMS(3))).toBe(true);
        });

        it('should fail when array has > n items', async () => {
            expect(await check([1, 2, 3, 4], MAX_ITEMS(3))).toBe(false);
        });
    });

    describe('UNIQUE_ITEMS', () => {
        it('should pass when all items are unique', async () => {
            expect(await check([1, 2, 3], UNIQUE_ITEMS)).toBe(true);
            expect(await check(['a', 'b', 'c'], UNIQUE_ITEMS)).toBe(true);
        });

        it('should fail when items have duplicates', async () => {
            expect(await check([1, 2, 2, 3], UNIQUE_ITEMS)).toBe(false);
            expect(await check(['a', 'a'], UNIQUE_ITEMS)).toBe(false);
        });
    });

    describe('NOT_EMPTY_ARRAY', () => {
        it('should pass when array is not empty', async () => {
            expect(await check([1], NOT_EMPTY_ARRAY)).toBe(true);
            expect(await check(['a', 'b'], NOT_EMPTY_ARRAY)).toBe(true);
        });

        it('should fail when array is empty', async () => {
            expect(await check([], NOT_EMPTY_ARRAY)).toBe(false);
        });
    });
});

