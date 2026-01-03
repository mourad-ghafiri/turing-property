import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Date Operators', () => {
    describe('now', () => {
        it('should return current ISO timestamp', async () => {
            const result = await evaluate(op('now'), createCtx());
            expect(typeof result).toBe('string');
            expect(new Date(result as string).getTime()).toBeCloseTo(Date.now(), -3);
        });
    });

    describe('today', () => {
        it('should return current date in YYYY-MM-DD format', async () => {
            const result = await evaluate(op('today'), createCtx());
            expect(typeof result).toBe('string');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('parseDate', () => {
        it('should parse date string to ISO format', async () => {
            const result = await evaluate(op('parseDate', lit('2024-01-15')), createCtx());
            expect(typeof result).toBe('string');
            expect((result as string).startsWith('2024-01-15')).toBe(true);
        });
    });

    describe('year', () => {
        it('should extract year from date', async () => {
            expect(await evaluate(op('year', lit('2024-06-15')), createCtx())).toBe(2024);
        });
    });

    describe('month', () => {
        it('should extract month from date (1-indexed)', async () => {
            expect(await evaluate(op('month', lit('2024-06-15')), createCtx())).toBe(6);
        });
    });

    describe('day', () => {
        it('should extract day from date', async () => {
            expect(await evaluate(op('day', lit('2024-06-15')), createCtx())).toBe(15);
        });
    });

    describe('dayOfWeek', () => {
        it('should return day of week (0=Sunday)', async () => {
            // 2024-01-01 is a Monday
            expect(await evaluate(op('dayOfWeek', lit('2024-01-01')), createCtx())).toBe(1);
        });
    });

    describe('age', () => {
        it('should calculate age in years', async () => {
            // Use a date that's definitely in the past
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25);
            const result = await evaluate(op('age', lit(birthDate.toISOString())), createCtx());
            expect(result).toBe(25);
        });
    });

    describe('dateDiff', () => {
        it('should calculate difference in days', async () => {
            expect(await evaluate(op('dateDiff', lit('2024-01-01'), lit('2024-01-10'), lit('days')), createCtx())).toBe(9);
        });

        it('should calculate difference in months', async () => {
            expect(await evaluate(op('dateDiff', lit('2024-01-01'), lit('2024-06-01'), lit('months')), createCtx())).toBe(5);
        });

        it('should calculate difference in years', async () => {
            expect(await evaluate(op('dateDiff', lit('2020-01-01'), lit('2024-01-01'), lit('years')), createCtx())).toBe(4);
        });
    });

    describe('dateAdd', () => {
        it('should add days to date', async () => {
            const result = await evaluate(op('dateAdd', lit('2024-01-01T00:00:00.000Z'), lit(5), lit('days')), createCtx());
            expect((result as string).startsWith('2024-01-06')).toBe(true);
        });

        it('should add months to date', async () => {
            const result = await evaluate(op('dateAdd', lit('2024-01-15T00:00:00.000Z'), lit(2), lit('months')), createCtx());
            expect((result as string).startsWith('2024-03-15')).toBe(true);
        });

        it('should add years to date', async () => {
            const result = await evaluate(op('dateAdd', lit('2024-01-15T00:00:00.000Z'), lit(1), lit('years')), createCtx());
            expect((result as string).startsWith('2025-01-15')).toBe(true);
        });
    });

    describe('dateSub', () => {
        it('should subtract days from date', async () => {
            const result = await evaluate(op('dateSub', lit('2024-01-10T00:00:00.000Z'), lit(5), lit('days')), createCtx());
            expect((result as string).startsWith('2024-01-05')).toBe(true);
        });
    });

    describe('isFuture', () => {
        it('should return true for future date', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            expect(await evaluate(op('isFuture', lit(futureDate.toISOString())), createCtx())).toBe(true);
        });

        it('should return false for past date', async () => {
            expect(await evaluate(op('isFuture', lit('2020-01-01')), createCtx())).toBe(false);
        });

        it('should return true for null/empty', async () => {
            expect(await evaluate(op('isFuture', lit(null)), createCtx())).toBe(true);
            expect(await evaluate(op('isFuture', lit('')), createCtx())).toBe(true);
        });
    });

    describe('isPast', () => {
        it('should return true for past date', async () => {
            expect(await evaluate(op('isPast', lit('2020-01-01')), createCtx())).toBe(true);
        });

        it('should return false for future date', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            expect(await evaluate(op('isPast', lit(futureDate.toISOString())), createCtx())).toBe(false);
        });
    });

    describe('isToday', () => {
        it('should return true for today', async () => {
            expect(await evaluate(op('isToday', lit(new Date().toISOString())), createCtx())).toBe(true);
        });

        it('should return false for other dates', async () => {
            expect(await evaluate(op('isToday', lit('2020-01-01')), createCtx())).toBe(false);
        });
    });

    describe('isWeekday', () => {
        it('should return true for weekdays', async () => {
            // Monday
            expect(await evaluate(op('isWeekday', lit('2024-01-01')), createCtx())).toBe(true);
        });

        it('should return false for weekends', async () => {
            // Saturday
            expect(await evaluate(op('isWeekday', lit('2024-01-06')), createCtx())).toBe(false);
        });
    });

    describe('isWeekend', () => {
        it('should return true for weekends', async () => {
            // Saturday
            expect(await evaluate(op('isWeekend', lit('2024-01-06')), createCtx())).toBe(true);
            // Sunday
            expect(await evaluate(op('isWeekend', lit('2024-01-07')), createCtx())).toBe(true);
        });

        it('should return false for weekdays', async () => {
            expect(await evaluate(op('isWeekend', lit('2024-01-01')), createCtx())).toBe(false);
        });
    });

    describe('isBefore', () => {
        it('should return true when first date is before second', async () => {
            expect(await evaluate(op('isBefore', lit('2024-01-01'), lit('2024-06-01')), createCtx())).toBe(true);
        });

        it('should return false when first date is after second', async () => {
            expect(await evaluate(op('isBefore', lit('2024-06-01'), lit('2024-01-01')), createCtx())).toBe(false);
        });
    });

    describe('isAfter', () => {
        it('should return true when first date is after second', async () => {
            expect(await evaluate(op('isAfter', lit('2024-06-01'), lit('2024-01-01')), createCtx())).toBe(true);
        });

        it('should return false when first date is before second', async () => {
            expect(await evaluate(op('isAfter', lit('2024-01-01'), lit('2024-06-01')), createCtx())).toBe(false);
        });
    });
});

