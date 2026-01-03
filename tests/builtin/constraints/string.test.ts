import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { 
    MIN_LENGTH, MAX_LENGTH, EXACT_LENGTH, PATTERN,
    EMAIL, URL, PHONE, ALPHA, ALPHANUMERIC, NUMERIC, UUID
} from '../../../src/builtin/constraints/string';
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

describe('String Constraints', () => {
    describe('MIN_LENGTH', () => {
        it('should pass when length >= min', async () => {
            expect(await check('hello', MIN_LENGTH(5))).toBe(true);
            expect(await check('hello!', MIN_LENGTH(5))).toBe(true);
        });

        it('should fail when length < min', async () => {
            expect(await check('hi', MIN_LENGTH(5))).toBe(false);
        });
    });

    describe('MAX_LENGTH', () => {
        it('should pass when length <= max', async () => {
            expect(await check('hi', MAX_LENGTH(5))).toBe(true);
            expect(await check('hello', MAX_LENGTH(5))).toBe(true);
        });

        it('should fail when length > max', async () => {
            expect(await check('hello world', MAX_LENGTH(5))).toBe(false);
        });
    });

    describe('EXACT_LENGTH', () => {
        it('should pass when length equals n', async () => {
            expect(await check('hello', EXACT_LENGTH(5))).toBe(true);
        });

        it('should fail when length differs', async () => {
            expect(await check('hi', EXACT_LENGTH(5))).toBe(false);
            expect(await check('hello!', EXACT_LENGTH(5))).toBe(false);
        });
    });

    describe('PATTERN', () => {
        it('should pass when matching pattern', async () => {
            expect(await check('ABC123', PATTERN('^[A-Z]+\\d+$'))).toBe(true);
        });

        it('should fail when not matching', async () => {
            expect(await check('abc123', PATTERN('^[A-Z]+\\d+$'))).toBe(false);
        });
    });

    describe('EMAIL', () => {
        it('should pass for valid email', async () => {
            expect(await check('test@example.com', EMAIL)).toBe(true);
            expect(await check('user.name@domain.org', EMAIL)).toBe(true);
        });

        it('should fail for invalid email', async () => {
            expect(await check('notanemail', EMAIL)).toBe(false);
            expect(await check('missing@domain', EMAIL)).toBe(false);
        });

        it('should pass for empty (use REQUIRED for required)', async () => {
            expect(await check('', EMAIL)).toBe(true);
        });
    });

    describe('URL', () => {
        it('should pass for valid URL', async () => {
            expect(await check('https://example.com', URL)).toBe(true);
            expect(await check('http://test.org/path', URL)).toBe(true);
        });

        it('should fail for invalid URL', async () => {
            expect(await check('not a url', URL)).toBe(false);
        });
    });

    describe('PHONE', () => {
        it('should pass for valid phone', async () => {
            expect(await check('123-456-7890', PHONE)).toBe(true);
            expect(await check('+1 (555) 123-4567', PHONE)).toBe(true);
        });

        it('should fail for invalid phone', async () => {
            expect(await check('abc', PHONE)).toBe(false);
        });
    });

    describe('ALPHA', () => {
        it('should pass for letters only', async () => {
            expect(await check('Hello', ALPHA)).toBe(true);
        });

        it('should fail for non-letters', async () => {
            expect(await check('Hello123', ALPHA)).toBe(false);
        });
    });

    describe('ALPHANUMERIC', () => {
        it('should pass for letters and numbers', async () => {
            expect(await check('Hello123', ALPHANUMERIC)).toBe(true);
        });

        it('should fail for special characters', async () => {
            expect(await check('Hello@123', ALPHANUMERIC)).toBe(false);
        });
    });

    describe('NUMERIC', () => {
        it('should pass for digits only', async () => {
            expect(await check('123456', NUMERIC)).toBe(true);
        });

        it('should fail for non-digits', async () => {
            expect(await check('123abc', NUMERIC)).toBe(false);
        });
    });

    describe('UUID', () => {
        it('should pass for valid UUID', async () => {
            expect(await check('550e8400-e29b-41d4-a716-446655440000', UUID)).toBe(true);
        });

        it('should fail for invalid UUID', async () => {
            expect(await check('not-a-uuid', UUID)).toBe(false);
        });
    });
});

