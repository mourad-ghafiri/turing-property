import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, ref, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Array Operators', () => {
    describe('len', () => {
        it('should return array length', async () => {
            expect(await evaluate(op('len', lit([1, 2, 3])), createCtx())).toBe(3);
        });

        it('should return string length', async () => {
            expect(await evaluate(op('len', lit('hello')), createCtx())).toBe(5);
        });

        it('should return 0 for empty array', async () => {
            expect(await evaluate(op('len', lit([])), createCtx())).toBe(0);
        });
    });

    describe('at', () => {
        it('should get element at index', async () => {
            expect(await evaluate(op('at', lit(['a', 'b', 'c']), lit(1)), createCtx())).toBe('b');
        });

        it('should return undefined for out of bounds', async () => {
            expect(await evaluate(op('at', lit([1, 2]), lit(10)), createCtx())).toBeUndefined();
        });
    });

    describe('first', () => {
        it('should return first element', async () => {
            expect(await evaluate(op('first', lit([1, 2, 3])), createCtx())).toBe(1);
        });

        it('should return undefined for empty array', async () => {
            expect(await evaluate(op('first', lit([])), createCtx())).toBeUndefined();
        });
    });

    describe('last', () => {
        it('should return last element', async () => {
            expect(await evaluate(op('last', lit([1, 2, 3])), createCtx())).toBe(3);
        });
    });

    describe('slice', () => {
        it('should slice array', async () => {
            expect(await evaluate(op('slice', lit([1, 2, 3, 4]), lit(1), lit(3)), createCtx())).toEqual([2, 3]);
        });
    });

    describe('reverse', () => {
        it('should reverse array', async () => {
            expect(await evaluate(op('reverse', lit([1, 2, 3])), createCtx())).toEqual([3, 2, 1]);
        });
    });

    describe('unique', () => {
        it('should return unique values', async () => {
            expect(await evaluate(op('unique', lit([1, 2, 2, 3, 3, 3])), createCtx())).toEqual([1, 2, 3]);
        });
    });

    describe('flatten', () => {
        it('should flatten nested arrays', async () => {
            expect(await evaluate(op('flatten', lit([[1, 2], [3, 4]])), createCtx())).toEqual([1, 2, 3, 4]);
        });
    });

    describe('compact', () => {
        it('should remove null values', async () => {
            expect(await evaluate(op('compact', lit([1, null, 2, undefined, 3])), createCtx())).toEqual([1, 2, 3]);
        });
    });

    describe('contains', () => {
        it('should return true when array contains element', async () => {
            expect(await evaluate(op('contains', lit([1, 2, 3]), lit(2)), createCtx())).toBe(true);
        });

        it('should return false when not containing element', async () => {
            expect(await evaluate(op('contains', lit([1, 2, 3]), lit(5)), createCtx())).toBe(false);
        });
    });

    describe('sort', () => {
        it('should sort array', async () => {
            expect(await evaluate(op('sort', lit([3, 1, 2])), createCtx())).toEqual([1, 2, 3]);
        });
    });

    describe('range', () => {
        it('should generate range', async () => {
            expect(await evaluate(op('range', lit(0), lit(5)), createCtx())).toEqual([0, 1, 2, 3, 4]);
        });

        it('should support step', async () => {
            expect(await evaluate(op('range', lit(0), lit(10), lit(2)), createCtx())).toEqual([0, 2, 4, 6, 8]);
        });
    });

    describe('push', () => {
        it('should add element to array', async () => {
            expect(await evaluate(op('push', lit([1, 2]), lit(3)), createCtx())).toEqual([1, 2, 3]);
        });
    });

    describe('pop', () => {
        it('should remove last element', async () => {
            expect(await evaluate(op('pop', lit([1, 2, 3])), createCtx())).toEqual([1, 2]);
        });
    });

    describe('map', () => {
        it('should map over array', async () => {
            const expr = op('map', lit([1, 2, 3]), op('mul', ref(['item']), lit(2)));
            expect(await evaluate(expr, createCtx())).toEqual([2, 4, 6]);
        });
    });

    describe('filter', () => {
        it('should filter array', async () => {
            const expr = op('filter', lit([1, 2, 3, 4, 5]), op('gt', ref(['item']), lit(2)));
            expect(await evaluate(expr, createCtx())).toEqual([3, 4, 5]);
        });
    });

    describe('reduce', () => {
        it('should reduce array', async () => {
            const expr = op('reduce', lit([1, 2, 3, 4]), op('add', ref(['acc']), ref(['item'])), lit(0));
            expect(await evaluate(expr, createCtx())).toBe(10);
        });
    });

    describe('find', () => {
        it('should find first matching element', async () => {
            const expr = op('find', lit([1, 2, 3, 4]), op('gt', ref(['item']), lit(2)));
            expect(await evaluate(expr, createCtx())).toBe(3);
        });

        it('should return undefined when not found', async () => {
            const expr = op('find', lit([1, 2]), op('gt', ref(['item']), lit(10)));
            expect(await evaluate(expr, createCtx())).toBeUndefined();
        });
    });

    describe('every', () => {
        it('should return true when all match', async () => {
            const expr = op('every', lit([2, 4, 6]), op('isEven', ref(['item'])));
            expect(await evaluate(expr, createCtx())).toBe(true);
        });

        it('should return false when any does not match', async () => {
            const expr = op('every', lit([2, 3, 6]), op('isEven', ref(['item'])));
            expect(await evaluate(expr, createCtx())).toBe(false);
        });
    });

    describe('some', () => {
        it('should return true when any matches', async () => {
            const expr = op('some', lit([1, 3, 4]), op('isEven', ref(['item'])));
            expect(await evaluate(expr, createCtx())).toBe(true);
        });

        it('should return false when none match', async () => {
            const expr = op('some', lit([1, 3, 5]), op('isEven', ref(['item'])));
            expect(await evaluate(expr, createCtx())).toBe(false);
        });
    });
});

