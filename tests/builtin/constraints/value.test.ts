import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { ONE_OF, EQUALS, IS_TRUE, ACCEPTED } from '../../../src/builtin/constraints/value';
import { STRING, BOOLEAN } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createProp = (value: unknown, constraints: Record<string, Property>, type: Property = STRING): Property => ({
    id: 'test',
    type,
    value,
    constraints
});

const createCtx = (prop: Property): EvaluationContext => ({
    current: prop,
    root: prop,
    registry: defaultRegistry
});

const check = async (value: unknown, constraint: Property, type: Property = STRING): Promise<boolean> => {
    const prop = createProp(value, { test: constraint }, type);
    const errors = await checkConstraints(prop, createCtx(prop));
    return Object.keys(errors).length === 0;
};

describe('Value Constraints', () => {
    describe('ONE_OF', () => {
        it('should pass when value is in allowed list', async () => {
            expect(await check('red', ONE_OF(['red', 'green', 'blue']))).toBe(true);
            expect(await check('green', ONE_OF(['red', 'green', 'blue']))).toBe(true);
        });

        it('should fail when value is not in allowed list', async () => {
            expect(await check('yellow', ONE_OF(['red', 'green', 'blue']))).toBe(false);
        });

        it('should work with numbers', async () => {
            expect(await check(1, ONE_OF([1, 2, 3]))).toBe(true);
            expect(await check(5, ONE_OF([1, 2, 3]))).toBe(false);
        });
    });

    describe('EQUALS', () => {
        it('should pass when value equals expected', async () => {
            expect(await check('expected', EQUALS('expected'))).toBe(true);
            expect(await check(42, EQUALS(42))).toBe(true);
        });

        it('should fail when value differs', async () => {
            expect(await check('other', EQUALS('expected'))).toBe(false);
            expect(await check(41, EQUALS(42))).toBe(false);
        });
    });

    describe('IS_TRUE', () => {
        it('should pass when value is true', async () => {
            expect(await check(true, IS_TRUE, BOOLEAN)).toBe(true);
        });

        it('should fail when value is false', async () => {
            expect(await check(false, IS_TRUE, BOOLEAN)).toBe(false);
        });

        it('should fail for non-boolean values', async () => {
            expect(await check('true', IS_TRUE)).toBe(false);
            expect(await check(1, IS_TRUE)).toBe(false);
        });
    });

    describe('ACCEPTED', () => {
        it('should pass when value is true', async () => {
            expect(await check(true, ACCEPTED, BOOLEAN)).toBe(true);
        });

        it('should fail when value is false', async () => {
            expect(await check(false, ACCEPTED, BOOLEAN)).toBe(false);
        });
    });
});

