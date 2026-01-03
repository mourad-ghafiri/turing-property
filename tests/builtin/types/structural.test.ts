import { describe, it, expect } from 'bun:test';
import { LIST, OBJECT, RECORD, UNION, INTERSECTION, LITERAL, FUNCTION, ENUM } from '../../../src/builtin/types/structural';
import { TYPE } from '../../../src/builtin/types/meta';

describe('Structural Types', () => {
    describe('LIST', () => {
        it('should have correct id', () => {
            expect(LIST.id).toBe('List');
        });

        it('should have TYPE as type', () => {
            expect(LIST.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(LIST.metadata?.description?.value).toBe('A list/array of elements');
        });
    });

    describe('OBJECT', () => {
        it('should have correct id', () => {
            expect(OBJECT.id).toBe('Object');
        });

        it('should have TYPE as type', () => {
            expect(OBJECT.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(OBJECT.metadata?.description?.value).toBe('An object with named properties');
        });
    });

    describe('RECORD', () => {
        it('should have correct id', () => {
            expect(RECORD.id).toBe('Record');
        });

        it('should have TYPE as type', () => {
            expect(RECORD.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(RECORD.metadata?.description?.value).toBe('A record/dictionary with typed values');
        });
    });

    describe('UNION', () => {
        it('should have correct id', () => {
            expect(UNION.id).toBe('Union');
        });

        it('should have TYPE as type', () => {
            expect(UNION.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(UNION.metadata?.description?.value).toBe('A union of multiple types');
        });
    });

    describe('INTERSECTION', () => {
        it('should have correct id', () => {
            expect(INTERSECTION.id).toBe('Intersection');
        });

        it('should have TYPE as type', () => {
            expect(INTERSECTION.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(INTERSECTION.metadata?.description?.value).toBe('An intersection of multiple types');
        });
    });

    describe('LITERAL', () => {
        it('should have correct id', () => {
            expect(LITERAL.id).toBe('Literal');
        });

        it('should have TYPE as type', () => {
            expect(LITERAL.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(LITERAL.metadata?.description?.value).toBe('An exact literal value type');
        });
    });

    describe('FUNCTION', () => {
        it('should have correct id', () => {
            expect(FUNCTION.id).toBe('Function');
        });

        it('should have TYPE as type', () => {
            expect(FUNCTION.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(FUNCTION.metadata?.description?.value).toBe('A function type');
        });
    });

    describe('ENUM', () => {
        it('should have correct id', () => {
            expect(ENUM.id).toBe('Enum');
        });

        it('should have TYPE as type', () => {
            expect(ENUM.type).toBe(TYPE);
        });

        it('should have description metadata', () => {
            expect(ENUM.metadata?.description?.value).toBe('An enumeration of allowed values');
        });
    });
});

