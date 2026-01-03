import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Conversion Operators', () => {
    describe('toNumber', () => {
        it('should convert string to number', async () => {
            expect(await evaluate(op('toNumber', lit('42')), createCtx())).toBe(42);
        });

        it('should convert float string to number', async () => {
            expect(await evaluate(op('toNumber', lit('3.14')), createCtx())).toBe(3.14);
        });

        it('should return 0 for non-numeric string', async () => {
            expect(await evaluate(op('toNumber', lit('abc')), createCtx())).toBe(0);
        });

        it('should return 0 for null', async () => {
            expect(await evaluate(op('toNumber', lit(null)), createCtx())).toBe(0);
        });

        it('should pass through numbers', async () => {
            expect(await evaluate(op('toNumber', lit(123)), createCtx())).toBe(123);
        });
    });

    describe('toBoolean', () => {
        it('should convert truthy values to true', async () => {
            expect(await evaluate(op('toBoolean', lit(1)), createCtx())).toBe(true);
            expect(await evaluate(op('toBoolean', lit('hello')), createCtx())).toBe(true);
            expect(await evaluate(op('toBoolean', lit([])), createCtx())).toBe(true);
        });

        it('should convert falsy values to false', async () => {
            expect(await evaluate(op('toBoolean', lit(0)), createCtx())).toBe(false);
            expect(await evaluate(op('toBoolean', lit('')), createCtx())).toBe(false);
            expect(await evaluate(op('toBoolean', lit(null)), createCtx())).toBe(false);
        });
    });

    describe('toArray', () => {
        it('should pass through arrays', async () => {
            expect(await evaluate(op('toArray', lit([1, 2, 3])), createCtx())).toEqual([1, 2, 3]);
        });

        it('should wrap single value in array', async () => {
            expect(await evaluate(op('toArray', lit(42)), createCtx())).toEqual([42]);
        });

        it('should return empty array for null', async () => {
            expect(await evaluate(op('toArray', lit(null)), createCtx())).toEqual([]);
        });
    });

    describe('toJson', () => {
        it('should convert object to JSON string', async () => {
            expect(await evaluate(op('toJson', lit({ a: 1, b: 2 })), createCtx())).toBe('{"a":1,"b":2}');
        });

        it('should convert array to JSON string', async () => {
            expect(await evaluate(op('toJson', lit([1, 2, 3])), createCtx())).toBe('[1,2,3]');
        });

        it('should convert primitives to JSON string', async () => {
            expect(await evaluate(op('toJson', lit('hello')), createCtx())).toBe('"hello"');
            expect(await evaluate(op('toJson', lit(42)), createCtx())).toBe('42');
        });
    });

    describe('fromJson', () => {
        it('should parse JSON object', async () => {
            expect(await evaluate(op('fromJson', lit('{"a":1,"b":2}')), createCtx())).toEqual({ a: 1, b: 2 });
        });

        it('should parse JSON array', async () => {
            expect(await evaluate(op('fromJson', lit('[1,2,3]')), createCtx())).toEqual([1, 2, 3]);
        });

        it('should return null for invalid JSON', async () => {
            expect(await evaluate(op('fromJson', lit('not json')), createCtx())).toBe(null);
        });
    });
});

