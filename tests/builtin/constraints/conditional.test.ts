import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { REQUIRED_IF, REQUIRED_IF_FIELD_EQUALS } from '../../../src/builtin/constraints/conditional';
import { STRING } from '../../../src/builtin/types';
import { lit } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (prop: Property, root: Property): EvaluationContext => ({
    current: prop,
    root,
    registry: defaultRegistry
});

describe('Conditional Constraints', () => {
    describe('REQUIRED_IF', () => {
        it('should require value when condition is true', async () => {
            const prop: Property = {
                id: 'test',
                type: STRING,
                value: '',
                constraints: { required: REQUIRED_IF(lit(true)) }
            };
            const errors = await checkConstraints(prop, createCtx(prop, prop));
            expect(Object.keys(errors).length).toBeGreaterThan(0);
        });

        it('should not require value when condition is false', async () => {
            const prop: Property = {
                id: 'test',
                type: STRING,
                value: '',
                constraints: { required: REQUIRED_IF(lit(false)) }
            };
            const errors = await checkConstraints(prop, createCtx(prop, prop));
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should pass when condition is true and value is provided', async () => {
            const prop: Property = {
                id: 'test',
                type: STRING,
                value: 'hello',
                constraints: { required: REQUIRED_IF(lit(true)) }
            };
            const errors = await checkConstraints(prop, createCtx(prop, prop));
            expect(Object.keys(errors).length).toBe(0);
        });
    });

    describe('REQUIRED_IF_FIELD_EQUALS', () => {
        it('should require value when referenced field equals value', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    type: {
                        id: 'type',
                        type: STRING,
                        value: 'business'
                    },
                    companyName: {
                        id: 'companyName',
                        type: STRING,
                        value: '',
                        constraints: {
                            required: REQUIRED_IF_FIELD_EQUALS(['root', 'children', 'type'], 'business')
                        }
                    }
                }
            };
            const companyName = root.children!.companyName;
            const errors = await checkConstraints(companyName, createCtx(companyName, root));
            expect(Object.keys(errors).length).toBeGreaterThan(0);
        });

        it('should not require value when referenced field has different value', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    type: {
                        id: 'type',
                        type: STRING,
                        value: 'personal'
                    },
                    companyName: {
                        id: 'companyName',
                        type: STRING,
                        value: '',
                        constraints: {
                            required: REQUIRED_IF_FIELD_EQUALS(['root', 'children', 'type'], 'business')
                        }
                    }
                }
            };
            const companyName = root.children!.companyName;
            const errors = await checkConstraints(companyName, createCtx(companyName, root));
            expect(Object.keys(errors).length).toBe(0);
        });
    });
});

