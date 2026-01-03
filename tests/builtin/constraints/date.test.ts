import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { 
    FUTURE_DATE, PAST_DATE, TODAY, 
    AFTER_DATE, BEFORE_DATE, 
    MIN_AGE, MAX_AGE,
    WEEKDAY, WEEKEND
} from '../../../src/builtin/constraints/date';
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

describe('Date Constraints', () => {
    describe('FUTURE_DATE', () => {
        it('should pass for future dates', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            expect(await check(futureDate.toISOString(), FUTURE_DATE)).toBe(true);
        });

        it('should fail for past dates', async () => {
            expect(await check('2020-01-01', FUTURE_DATE)).toBe(false);
        });

        it('should pass for null/empty (optional)', async () => {
            expect(await check(null, FUTURE_DATE)).toBe(true);
            expect(await check('', FUTURE_DATE)).toBe(true);
        });
    });

    describe('PAST_DATE', () => {
        it('should pass for past dates', async () => {
            expect(await check('2020-01-01', PAST_DATE)).toBe(true);
        });

        it('should fail for future dates', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            expect(await check(futureDate.toISOString(), PAST_DATE)).toBe(false);
        });
    });

    describe('TODAY', () => {
        it('should pass for today', async () => {
            expect(await check(new Date().toISOString(), TODAY)).toBe(true);
        });

        it('should fail for other dates', async () => {
            expect(await check('2020-01-01', TODAY)).toBe(false);
        });
    });

    describe('AFTER_DATE', () => {
        it('should pass when date is after specified date', async () => {
            expect(await check('2024-06-01', AFTER_DATE('2024-01-01'))).toBe(true);
        });

        it('should fail when date is before specified date', async () => {
            expect(await check('2024-01-01', AFTER_DATE('2024-06-01'))).toBe(false);
        });
    });

    describe('BEFORE_DATE', () => {
        it('should pass when date is before specified date', async () => {
            expect(await check('2024-01-01', BEFORE_DATE('2024-06-01'))).toBe(true);
        });

        it('should fail when date is after specified date', async () => {
            expect(await check('2024-06-01', BEFORE_DATE('2024-01-01'))).toBe(false);
        });
    });

    describe('MIN_AGE', () => {
        it('should pass when age >= min years', async () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25);
            expect(await check(birthDate.toISOString(), MIN_AGE(18))).toBe(true);
        });

        it('should fail when age < min years', async () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 15);
            expect(await check(birthDate.toISOString(), MIN_AGE(18))).toBe(false);
        });
    });

    describe('MAX_AGE', () => {
        it('should pass when age <= max years', async () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25);
            expect(await check(birthDate.toISOString(), MAX_AGE(65))).toBe(true);
        });

        it('should fail when age > max years', async () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 70);
            expect(await check(birthDate.toISOString(), MAX_AGE(65))).toBe(false);
        });
    });

    describe('WEEKDAY', () => {
        it('should pass for weekdays', async () => {
            // Monday 2024-01-01
            expect(await check('2024-01-01', WEEKDAY)).toBe(true);
        });

        it('should fail for weekends', async () => {
            // Saturday 2024-01-06
            expect(await check('2024-01-06', WEEKDAY)).toBe(false);
        });
    });

    describe('WEEKEND', () => {
        it('should pass for weekends', async () => {
            // Saturday 2024-01-06
            expect(await check('2024-01-06', WEEKEND)).toBe(true);
            // Sunday 2024-01-07
            expect(await check('2024-01-07', WEEKEND)).toBe(true);
        });

        it('should fail for weekdays', async () => {
            // Monday 2024-01-01
            expect(await check('2024-01-01', WEEKEND)).toBe(false);
        });
    });
});

