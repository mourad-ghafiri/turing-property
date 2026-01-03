import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('Logic Operators', () => {
    describe('and', () => {
        it('should return true when all are true', async () => {
            expect(await evaluate(op('and', lit(true), lit(true)), createCtx())).toBe(true);
        });

        it('should return false when any is false', async () => {
            expect(await evaluate(op('and', lit(true), lit(false)), createCtx())).toBe(false);
            expect(await evaluate(op('and', lit(false), lit(true)), createCtx())).toBe(false);
        });

        it('should handle multiple arguments', async () => {
            expect(await evaluate(op('and', lit(true), lit(true), lit(true)), createCtx())).toBe(true);
            expect(await evaluate(op('and', lit(true), lit(false), lit(true)), createCtx())).toBe(false);
        });

        it('should short-circuit on first false', async () => {
            // This test verifies short-circuit behavior
            const expr = op('and', lit(false), op('div', lit(1), lit(0)));
            expect(await evaluate(expr, createCtx())).toBe(false);
        });
    });

    describe('or', () => {
        it('should return true when any is true', async () => {
            expect(await evaluate(op('or', lit(true), lit(false)), createCtx())).toBe(true);
            expect(await evaluate(op('or', lit(false), lit(true)), createCtx())).toBe(true);
        });

        it('should return false when all are false', async () => {
            expect(await evaluate(op('or', lit(false), lit(false)), createCtx())).toBe(false);
        });

        it('should handle multiple arguments', async () => {
            expect(await evaluate(op('or', lit(false), lit(false), lit(true)), createCtx())).toBe(true);
        });

        it('should short-circuit on first true', async () => {
            const expr = op('or', lit(true), op('div', lit(1), lit(0)));
            expect(await evaluate(expr, createCtx())).toBe(true);
        });
    });

    describe('not', () => {
        it('should negate true', async () => {
            expect(await evaluate(op('not', lit(true)), createCtx())).toBe(false);
        });

        it('should negate false', async () => {
            expect(await evaluate(op('not', lit(false)), createCtx())).toBe(true);
        });

        it('should handle truthy/falsy values', async () => {
            expect(await evaluate(op('not', lit(1)), createCtx())).toBe(false);
            expect(await evaluate(op('not', lit(0)), createCtx())).toBe(true);
            expect(await evaluate(op('not', lit('')), createCtx())).toBe(true);
            expect(await evaluate(op('not', lit('hello')), createCtx())).toBe(false);
        });
    });

    describe('if', () => {
        it('should return then branch when condition is true', async () => {
            const expr = op('if', lit(true), lit('yes'), lit('no'));
            expect(await evaluate(expr, createCtx())).toBe('yes');
        });

        it('should return else branch when condition is false', async () => {
            const expr = op('if', lit(false), lit('yes'), lit('no'));
            expect(await evaluate(expr, createCtx())).toBe('no');
        });

        it('should handle truthy conditions', async () => {
            const expr = op('if', lit(1), lit('truthy'), lit('falsy'));
            expect(await evaluate(expr, createCtx())).toBe('truthy');
        });

        it('should handle falsy conditions', async () => {
            const expr = op('if', lit(0), lit('truthy'), lit('falsy'));
            expect(await evaluate(expr, createCtx())).toBe('falsy');
        });

        it('should return null if no else and condition is false', async () => {
            const expr = op('if', lit(false), lit('yes'));
            expect(await evaluate(expr, createCtx())).toBe(null);
        });

        it('should be lazy - not evaluate unused branch', async () => {
            // The else branch would cause an error if evaluated
            const expr = op('if', lit(true), lit('yes'), op('div', lit(1), lit(0)));
            expect(await evaluate(expr, createCtx())).toBe('yes');
        });
    });

    describe('coalesce', () => {
        it('should return first non-null value', async () => {
            expect(await evaluate(op('coalesce', lit(null), lit(5)), createCtx())).toBe(5);
            expect(await evaluate(op('coalesce', lit(null), lit(null), lit('hello')), createCtx())).toBe('hello');
        });

        it('should return first value if not null', async () => {
            expect(await evaluate(op('coalesce', lit(10), lit(5)), createCtx())).toBe(10);
        });

        it('should return null if all are null', async () => {
            expect(await evaluate(op('coalesce', lit(null), lit(null)), createCtx())).toBe(null);
        });
    });

    describe('default', () => {
        it('should return default when value is null', async () => {
            expect(await evaluate(op('default', lit(null), lit(42)), createCtx())).toBe(42);
        });

        it('should return value when not null', async () => {
            expect(await evaluate(op('default', lit(10), lit(42)), createCtx())).toBe(10);
        });

        it('should return value when undefined', async () => {
            expect(await evaluate(op('default', lit(undefined), lit(42)), createCtx())).toBe(42);
        });
    });
});

