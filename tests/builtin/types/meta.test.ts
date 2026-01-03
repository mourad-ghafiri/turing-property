import { describe, it, expect } from 'bun:test';
import { TYPE, EXPR, OPERATOR, CONSTRAINT, PROPERTY } from '../../../src/builtin/types/meta';

describe('Meta Types', () => {
    describe('TYPE', () => {
        it('should be self-referential', () => {
            expect(TYPE.type).toBe(TYPE);
        });

        it('should have id "Type"', () => {
            expect(TYPE.id).toBe('Type');
        });

        it('should have description metadata', () => {
            expect(TYPE.metadata?.description).toBeDefined();
        });
    });

    describe('EXPR', () => {
        it('should have TYPE as its type', () => {
            expect(EXPR.type).toBe(TYPE);
        });

        it('should have id "Expr"', () => {
            expect(EXPR.id).toBe('Expr');
        });
    });

    describe('OPERATOR', () => {
        it('should have TYPE as its type', () => {
            expect(OPERATOR.type).toBe(TYPE);
        });

        it('should have id "Operator"', () => {
            expect(OPERATOR.id).toBe('Operator');
        });
    });

    describe('CONSTRAINT', () => {
        it('should have TYPE as its type', () => {
            expect(CONSTRAINT.type).toBe(TYPE);
        });

        it('should have id "Constraint"', () => {
            expect(CONSTRAINT.id).toBe('Constraint');
        });
    });

    describe('PROPERTY', () => {
        it('should have TYPE as its type', () => {
            expect(PROPERTY.type).toBe(TYPE);
        });

        it('should have id "Property"', () => {
            expect(PROPERTY.id).toBe('Property');
        });
    });
});

