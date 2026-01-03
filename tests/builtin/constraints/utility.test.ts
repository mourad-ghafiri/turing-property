import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { ALWAYS_VALID, ALWAYS_INVALID, CUSTOM } from '../../../src/builtin/constraints/utility';
import { STRING } from '../../../src/builtin/types';
import { lit, op, ref } from '../../../src/builtin/expressions';
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

describe('Utility Constraints', () => {
    describe('ALWAYS_VALID', () => {
        it('should always pass', async () => {
            expect(await check('anything', ALWAYS_VALID)).toBe(true);
            expect(await check(null, ALWAYS_VALID)).toBe(true);
            expect(await check('', ALWAYS_VALID)).toBe(true);
            expect(await check(123, ALWAYS_VALID)).toBe(true);
        });
    });

    describe('ALWAYS_INVALID', () => {
        it('should always fail', async () => {
            expect(await check('anything', ALWAYS_INVALID)).toBe(false);
            expect(await check(null, ALWAYS_INVALID)).toBe(false);
            expect(await check('valid value', ALWAYS_INVALID)).toBe(false);
        });
    });

    describe('CUSTOM', () => {
        it('should apply custom expression', async () => {
            // Custom constraint: value must be at least 5 characters
            const minLength5 = CUSTOM('minLength5', 
                op('gte', op('strlen', ref(['self', 'value'])), lit(5)),
                'Must be at least 5 characters'
            );
            
            expect(await check('hello', minLength5)).toBe(true);
            expect(await check('hi', minLength5)).toBe(false);
        });

        it('should work with complex expressions', async () => {
            // Custom constraint: value must start with "test"
            const startsWithTest = CUSTOM('startsWithTest',
                op('startsWith', ref(['self', 'value']), lit('test'))
            );

            expect(await check('testing', startsWithTest)).toBe(true);
            expect(await check('hello', startsWithTest)).toBe(false);
        });
    });
});

