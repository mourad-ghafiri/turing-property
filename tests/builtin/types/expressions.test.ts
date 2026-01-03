import { describe, it, expect } from 'bun:test';
import { LIT, REF, OP } from '../../../src/builtin/types/expressions';
import { EXPR, TYPE } from '../../../src/builtin/types/meta';

describe('Expression Types', () => {
    describe('LIT', () => {
        it('should have correct id', () => {
            expect(LIT.id).toBe('Lit');
        });

        it('should have EXPR as type', () => {
            expect(LIT.type).toBe(EXPR);
        });

        it('should have description metadata', () => {
            expect(LIT.metadata?.description?.value).toBe('A literal/constant value');
        });
    });

    describe('REF', () => {
        it('should have correct id', () => {
            expect(REF.id).toBe('Ref');
        });

        it('should have EXPR as type', () => {
            expect(REF.type).toBe(EXPR);
        });

        it('should have description metadata', () => {
            expect(REF.metadata?.description?.value).toBe('A reference to another property');
        });
    });

    describe('OP', () => {
        it('should have correct id', () => {
            expect(OP.id).toBe('Op');
        });

        it('should have EXPR as type', () => {
            expect(OP.type).toBe(EXPR);
        });

        it('should have description metadata', () => {
            expect(OP.metadata?.description?.value).toBe('An operator invocation with arguments');
        });
    });
});

