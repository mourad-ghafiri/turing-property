import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Object Operators', () => {
    describe('get', () => {
        it('should get value by key', async () => {
            expect(await evaluate(op('get', lit({ a: 1, b: 2 }), lit('a')), createCtx())).toBe(1);
        });

        it('should return undefined for missing key', async () => {
            expect(await evaluate(op('get', lit({ a: 1 }), lit('b')), createCtx())).toBe(undefined);
        });

        it('should return undefined for non-object', async () => {
            expect(await evaluate(op('get', lit('not an object'), lit('key')), createCtx())).toBe(undefined);
        });
    });

    describe('keys', () => {
        it('should return object keys', async () => {
            const result = await evaluate(op('keys', lit({ a: 1, b: 2, c: 3 })), createCtx());
            expect(result).toEqual(['a', 'b', 'c']);
        });

        it('should return empty array for empty object', async () => {
            expect(await evaluate(op('keys', lit({})), createCtx())).toEqual([]);
        });

        it('should return empty array for non-object', async () => {
            expect(await evaluate(op('keys', lit('not an object')), createCtx())).toEqual([]);
        });
    });

    describe('values', () => {
        it('should return object values', async () => {
            const result = await evaluate(op('values', lit({ a: 1, b: 2, c: 3 })), createCtx());
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return empty array for empty object', async () => {
            expect(await evaluate(op('values', lit({})), createCtx())).toEqual([]);
        });

        it('should return empty array for non-object', async () => {
            expect(await evaluate(op('values', lit(null)), createCtx())).toEqual([]);
        });
    });

    describe('entries', () => {
        it('should return object entries as arrays', async () => {
            const result = await evaluate(op('entries', lit({ a: 1, b: 2 })), createCtx());
            expect(result).toEqual([['a', 1], ['b', 2]]);
        });

        it('should return empty array for empty object', async () => {
            expect(await evaluate(op('entries', lit({})), createCtx())).toEqual([]);
        });
    });

    describe('has', () => {
        it('should return true when key exists', async () => {
            expect(await evaluate(op('has', lit({ a: 1, b: 2 }), lit('a')), createCtx())).toBe(true);
        });

        it('should return false when key does not exist', async () => {
            expect(await evaluate(op('has', lit({ a: 1 }), lit('b')), createCtx())).toBe(false);
        });

        it('should return false for non-object', async () => {
            expect(await evaluate(op('has', lit('string'), lit('length')), createCtx())).toBe(false);
        });
    });

    describe('merge', () => {
        it('should merge objects', async () => {
            const result = await evaluate(op('merge', lit({ a: 1 }), lit({ b: 2 })), createCtx());
            expect(result).toEqual({ a: 1, b: 2 });
        });

        it('should override with later values', async () => {
            const result = await evaluate(op('merge', lit({ a: 1 }), lit({ a: 2 })), createCtx());
            expect(result).toEqual({ a: 2 });
        });

        it('should handle multiple objects', async () => {
            const result = await evaluate(op('merge', lit({ a: 1 }), lit({ b: 2 }), lit({ c: 3 })), createCtx());
            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });

        it('should skip non-objects', async () => {
            const result = await evaluate(op('merge', lit({ a: 1 }), lit(null), lit({ b: 2 })), createCtx());
            expect(result).toEqual({ a: 1, b: 2 });
        });
    });
});

