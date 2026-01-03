import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { REQUIRED, OPTIONAL, MUST_BE_NULL, NOT_EMPTY } from '../../../src/builtin/constraints/presence';
import { STRING } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createProp = (value: unknown, constraints: Record<string, Property>): Property => ({
    id: 'test',
    type: STRING,
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

describe('Presence Constraints', () => {
    describe('REQUIRED', () => {
        it('should pass for non-empty values', async () => {
            expect(await check('hello', REQUIRED)).toBe(true);
            expect(await check(123, REQUIRED)).toBe(true);
            expect(await check(true, REQUIRED)).toBe(true);
        });

        it('should fail for null, undefined, empty string', async () => {
            expect(await check(null, REQUIRED)).toBe(false);
            expect(await check(undefined, REQUIRED)).toBe(false);
            expect(await check('', REQUIRED)).toBe(false);
            expect(await check('   ', REQUIRED)).toBe(false);
        });
    });

    describe('OPTIONAL', () => {
        it('should always pass', async () => {
            expect(await check('hello', OPTIONAL)).toBe(true);
            expect(await check(null, OPTIONAL)).toBe(true);
            expect(await check('', OPTIONAL)).toBe(true);
        });
    });

    describe('MUST_BE_NULL', () => {
        it('should pass for null/undefined', async () => {
            expect(await check(null, MUST_BE_NULL)).toBe(true);
            expect(await check(undefined, MUST_BE_NULL)).toBe(true);
        });

        it('should fail for any value', async () => {
            expect(await check('hello', MUST_BE_NULL)).toBe(false);
            expect(await check(0, MUST_BE_NULL)).toBe(false);
            expect(await check('', MUST_BE_NULL)).toBe(false);
        });
    });

    describe('NOT_EMPTY', () => {
        it('should pass for non-empty values', async () => {
            expect(await check('hello', NOT_EMPTY)).toBe(true);
            expect(await check([1, 2, 3], NOT_EMPTY)).toBe(true);
            expect(await check({ a: 1 }, NOT_EMPTY)).toBe(true);
        });

        it('should fail for empty values', async () => {
            expect(await check('', NOT_EMPTY)).toBe(false);
            expect(await check([], NOT_EMPTY)).toBe(false);
            expect(await check({}, NOT_EMPTY)).toBe(false);
            expect(await check(null, NOT_EMPTY)).toBe(false);
        });
    });
});

