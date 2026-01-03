import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

describe('String Operators', () => {
    describe('concat', () => {
        it('should concatenate strings', async () => {
            expect(await evaluate(op('concat', lit('hello'), lit(' '), lit('world')), createCtx())).toBe('hello world');
        });

        it('should handle single string', async () => {
            expect(await evaluate(op('concat', lit('hello')), createCtx())).toBe('hello');
        });

        it('should handle non-string values', async () => {
            expect(await evaluate(op('concat', lit('value: '), lit(42)), createCtx())).toBe('value: 42');
        });
    });

    describe('upper', () => {
        it('should convert to uppercase', async () => {
            expect(await evaluate(op('upper', lit('hello')), createCtx())).toBe('HELLO');
        });
    });

    describe('lower', () => {
        it('should convert to lowercase', async () => {
            expect(await evaluate(op('lower', lit('HELLO')), createCtx())).toBe('hello');
        });
    });

    describe('trim', () => {
        it('should trim whitespace', async () => {
            expect(await evaluate(op('trim', lit('  hello  ')), createCtx())).toBe('hello');
        });
    });

    describe('strlen', () => {
        it('should return string length', async () => {
            expect(await evaluate(op('strlen', lit('hello')), createCtx())).toBe(5);
        });

        it('should return 0 for empty string', async () => {
            expect(await evaluate(op('strlen', lit('')), createCtx())).toBe(0);
        });
    });

    describe('substr', () => {
        it('should extract substring', async () => {
            expect(await evaluate(op('substr', lit('hello'), lit(0), lit(3)), createCtx())).toBe('hel');
        });
    });

    describe('replace', () => {
        it('should replace first occurrence', async () => {
            expect(await evaluate(op('replace', lit('hello world'), lit('world'), lit('there')), createCtx())).toBe('hello there');
        });
    });

    describe('replaceAll', () => {
        it('should replace all occurrences', async () => {
            expect(await evaluate(op('replaceAll', lit('a-b-c'), lit('-'), lit('_')), createCtx())).toBe('a_b_c');
        });
    });

    describe('split', () => {
        it('should split string by separator', async () => {
            expect(await evaluate(op('split', lit('a,b,c'), lit(',')), createCtx())).toEqual(['a', 'b', 'c']);
        });
    });

    describe('join', () => {
        it('should join array with separator', async () => {
            expect(await evaluate(op('join', lit(['a', 'b', 'c']), lit('-')), createCtx())).toBe('a-b-c');
        });
    });

    describe('startsWith', () => {
        it('should return true when string starts with prefix', async () => {
            expect(await evaluate(op('startsWith', lit('hello'), lit('he')), createCtx())).toBe(true);
        });

        it('should return false when not starting with prefix', async () => {
            expect(await evaluate(op('startsWith', lit('hello'), lit('lo')), createCtx())).toBe(false);
        });
    });

    describe('endsWith', () => {
        it('should return true when string ends with suffix', async () => {
            expect(await evaluate(op('endsWith', lit('hello'), lit('lo')), createCtx())).toBe(true);
        });

        it('should return false when not ending with suffix', async () => {
            expect(await evaluate(op('endsWith', lit('hello'), lit('he')), createCtx())).toBe(false);
        });
    });

    describe('includes', () => {
        it('should return true when string contains substring', async () => {
            expect(await evaluate(op('includes', lit('hello'), lit('ell')), createCtx())).toBe(true);
        });

        it('should return false when not containing substring', async () => {
            expect(await evaluate(op('includes', lit('hello'), lit('xyz')), createCtx())).toBe(false);
        });
    });

    describe('matches', () => {
        it('should return true when matching regex', async () => {
            expect(await evaluate(op('matches', lit('test@email.com'), lit('@')), createCtx())).toBe(true);
        });

        it('should return false when not matching', async () => {
            expect(await evaluate(op('matches', lit('hello'), lit('\\d+')), createCtx())).toBe(false);
        });
    });

    describe('padStart', () => {
        it('should pad start with character', async () => {
            expect(await evaluate(op('padStart', lit('5'), lit(3), lit('0')), createCtx())).toBe('005');
        });
    });

    describe('padEnd', () => {
        it('should pad end with character', async () => {
            expect(await evaluate(op('padEnd', lit('5'), lit(3), lit('0')), createCtx())).toBe('500');
        });
    });

    describe('capitalize', () => {
        it('should capitalize first letter', async () => {
            expect(await evaluate(op('capitalize', lit('hello')), createCtx())).toBe('Hello');
        });
    });

    describe('toString', () => {
        it('should convert to string', async () => {
            expect(await evaluate(op('toString', lit(42)), createCtx())).toBe('42');
            expect(await evaluate(op('toString', lit(true)), createCtx())).toBe('true');
        });
    });
});

