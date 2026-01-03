import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Validation Operators', () => {
    describe('isEmail', () => {
        it('should return true for valid emails', async () => {
            expect(await evaluate(op('isEmail', lit('test@example.com')), createCtx())).toBe(true);
            expect(await evaluate(op('isEmail', lit('user.name@domain.co.uk')), createCtx())).toBe(true);
        });

        it('should return false for invalid emails', async () => {
            expect(await evaluate(op('isEmail', lit('notanemail')), createCtx())).toBe(false);
            expect(await evaluate(op('isEmail', lit('missing@domain')), createCtx())).toBe(false);
        });

        it('should return true for empty/null (optional validation)', async () => {
            expect(await evaluate(op('isEmail', lit(null)), createCtx())).toBe(true);
            expect(await evaluate(op('isEmail', lit('')), createCtx())).toBe(true);
        });
    });

    describe('isUrl', () => {
        it('should return true for valid URLs', async () => {
            expect(await evaluate(op('isUrl', lit('https://example.com')), createCtx())).toBe(true);
            expect(await evaluate(op('isUrl', lit('http://test.org/path')), createCtx())).toBe(true);
        });

        it('should return false for invalid URLs', async () => {
            expect(await evaluate(op('isUrl', lit('not a url')), createCtx())).toBe(false);
            expect(await evaluate(op('isUrl', lit('ftp://example.com')), createCtx())).toBe(false);
        });
    });

    describe('isPhone', () => {
        it('should return true for valid phone numbers', async () => {
            expect(await evaluate(op('isPhone', lit('123-456-7890')), createCtx())).toBe(true);
            expect(await evaluate(op('isPhone', lit('+1 (555) 123-4567')), createCtx())).toBe(true);
        });

        it('should return false for invalid phone numbers', async () => {
            expect(await evaluate(op('isPhone', lit('abc')), createCtx())).toBe(false);
            expect(await evaluate(op('isPhone', lit('123')), createCtx())).toBe(false);
        });
    });

    describe('isAlpha', () => {
        it('should return true for alphabetic strings', async () => {
            expect(await evaluate(op('isAlpha', lit('Hello')), createCtx())).toBe(true);
            expect(await evaluate(op('isAlpha', lit('ABC')), createCtx())).toBe(true);
        });

        it('should return false for strings with numbers', async () => {
            expect(await evaluate(op('isAlpha', lit('Hello123')), createCtx())).toBe(false);
        });
    });

    describe('isAlphanumeric', () => {
        it('should return true for alphanumeric strings', async () => {
            expect(await evaluate(op('isAlphanumeric', lit('Hello123')), createCtx())).toBe(true);
            expect(await evaluate(op('isAlphanumeric', lit('ABC')), createCtx())).toBe(true);
        });

        it('should return false for strings with special chars', async () => {
            expect(await evaluate(op('isAlphanumeric', lit('Hello!')), createCtx())).toBe(false);
        });
    });

    describe('isNumeric', () => {
        it('should return true for numeric strings', async () => {
            expect(await evaluate(op('isNumeric', lit('12345')), createCtx())).toBe(true);
        });

        it('should return false for non-numeric strings', async () => {
            expect(await evaluate(op('isNumeric', lit('12.34')), createCtx())).toBe(false);
            expect(await evaluate(op('isNumeric', lit('abc')), createCtx())).toBe(false);
        });
    });

    describe('isUuid', () => {
        it('should return true for valid UUIDs', async () => {
            expect(await evaluate(op('isUuid', lit('550e8400-e29b-41d4-a716-446655440000')), createCtx())).toBe(true);
        });

        it('should return false for invalid UUIDs', async () => {
            expect(await evaluate(op('isUuid', lit('not-a-uuid')), createCtx())).toBe(false);
            expect(await evaluate(op('isUuid', lit('550e8400-e29b-41d4-a716')), createCtx())).toBe(false);
        });
    });

    describe('isSlug', () => {
        it('should return true for valid slugs', async () => {
            expect(await evaluate(op('isSlug', lit('hello-world')), createCtx())).toBe(true);
            expect(await evaluate(op('isSlug', lit('my-blog-post')), createCtx())).toBe(true);
        });

        it('should return false for invalid slugs', async () => {
            expect(await evaluate(op('isSlug', lit('Hello World')), createCtx())).toBe(false);
            expect(await evaluate(op('isSlug', lit('UPPERCASE')), createCtx())).toBe(false);
        });
    });

    describe('isIpv4', () => {
        it('should return true for valid IPv4', async () => {
            expect(await evaluate(op('isIpv4', lit('192.168.1.1')), createCtx())).toBe(true);
            expect(await evaluate(op('isIpv4', lit('0.0.0.0')), createCtx())).toBe(true);
        });

        it('should return false for invalid IPv4', async () => {
            expect(await evaluate(op('isIpv4', lit('256.1.1.1')), createCtx())).toBe(false);
            expect(await evaluate(op('isIpv4', lit('192.168.1')), createCtx())).toBe(false);
        });
    });

    describe('isIpv6', () => {
        it('should return true for valid IPv6', async () => {
            expect(await evaluate(op('isIpv6', lit('2001:0db8:85a3:0000:0000:8a2e:0370:7334')), createCtx())).toBe(true);
        });

        it('should return false for invalid IPv6', async () => {
            expect(await evaluate(op('isIpv6', lit('192.168.1.1')), createCtx())).toBe(false);
        });
    });

    describe('isHex', () => {
        it('should return true for hex strings', async () => {
            expect(await evaluate(op('isHex', lit('ff00ff')), createCtx())).toBe(true);
            expect(await evaluate(op('isHex', lit('#ABC123')), createCtx())).toBe(true);
        });

        it('should return false for non-hex strings', async () => {
            expect(await evaluate(op('isHex', lit('GHIJKL')), createCtx())).toBe(false);
        });
    });

    describe('isCreditCard', () => {
        it('should return true for valid credit card length', async () => {
            expect(await evaluate(op('isCreditCard', lit('4111111111111111')), createCtx())).toBe(true);
            expect(await evaluate(op('isCreditCard', lit('4111-1111-1111-1111')), createCtx())).toBe(true);
        });

        it('should return false for too short numbers', async () => {
            expect(await evaluate(op('isCreditCard', lit('411111')), createCtx())).toBe(false);
        });
    });

    describe('isPostalCode', () => {
        it('should return true for valid US postal codes', async () => {
            expect(await evaluate(op('isPostalCode', lit('12345')), createCtx())).toBe(true);
            expect(await evaluate(op('isPostalCode', lit('12345-6789')), createCtx())).toBe(true);
        });

        it('should return false for invalid postal codes', async () => {
            expect(await evaluate(op('isPostalCode', lit('1234')), createCtx())).toBe(false);
            expect(await evaluate(op('isPostalCode', lit('ABCDE')), createCtx())).toBe(false);
        });
    });

    describe('isSsn', () => {
        it('should return true for valid SSN formats', async () => {
            expect(await evaluate(op('isSsn', lit('123-45-6789')), createCtx())).toBe(true);
            expect(await evaluate(op('isSsn', lit('123456789')), createCtx())).toBe(true);
        });

        it('should return false for invalid SSN', async () => {
            expect(await evaluate(op('isSsn', lit('12-345-6789')), createCtx())).toBe(false);
        });
    });

    describe('isValidDate', () => {
        it('should return true for valid dates', async () => {
            expect(await evaluate(op('isValidDate', lit('2024-01-15')), createCtx())).toBe(true);
            expect(await evaluate(op('isValidDate', lit('Jan 15, 2024')), createCtx())).toBe(true);
        });

        it('should return false for invalid dates', async () => {
            expect(await evaluate(op('isValidDate', lit('not a date')), createCtx())).toBe(false);
        });
    });
});

