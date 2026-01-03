import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints, checkConstraintsDeep } from '../../../src/builtin/constraints/check';
import { REQUIRED, OPTIONAL } from '../../../src/builtin/constraints/presence';
import { MIN, MAX } from '../../../src/builtin/constraints/number';
import { EMAIL } from '../../../src/builtin/constraints/string';
import { TYPE, STRING, NUMBER } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (prop: Property): EvaluationContext => ({
    current: prop,
    root: prop,
    registry: defaultRegistry
});

describe('checkConstraints', () => {
    it('should return empty object when no constraints', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: 'hello'
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate REQUIRED constraint - pass', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: 'hello',
            constraints: { required: REQUIRED }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate REQUIRED constraint - fail on empty', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: '',
            constraints: { required: REQUIRED }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(errors.required).toBeDefined();
    });

    it('should validate REQUIRED constraint - fail on null', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: null,
            constraints: { required: REQUIRED }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(errors.required).toBeDefined();
    });

    it('should validate OPTIONAL constraint - always passes', async () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: null,
            constraints: { optional: OPTIONAL }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate MIN constraint - pass', async () => {
        const prop: Property = {
            id: 'test',
            type: NUMBER,
            value: 10,
            constraints: { min: MIN(5) }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate MIN constraint - fail', async () => {
        const prop: Property = {
            id: 'test',
            type: NUMBER,
            value: 3,
            constraints: { min: MIN(5) }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(errors.min).toBeDefined();
    });

    it('should validate MAX constraint', async () => {
        const prop: Property = {
            id: 'test',
            type: NUMBER,
            value: 100,
            constraints: { max: MAX(50) }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(errors.max).toBeDefined();
    });

    it('should validate multiple constraints', async () => {
        const prop: Property = {
            id: 'test',
            type: NUMBER,
            value: 3,
            constraints: {
                required: REQUIRED,
                min: MIN(5),
                max: MAX(10)
            }
        };

        const errors = await checkConstraints(prop, createCtx(prop));
        expect(Object.keys(errors)).toHaveLength(1);
        expect(errors.min).toBeDefined();
    });
});

describe('checkConstraintsDeep', () => {
    it('should check all children', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: {
                    id: 'name',
                    type: STRING,
                    value: '',
                    constraints: { required: REQUIRED }
                },
                email: {
                    id: 'email',
                    type: STRING,
                    value: 'invalid',
                    constraints: { email: EMAIL }
                }
            }
        };

        const result = await checkConstraintsDeep(form, createCtx(form));
        
        expect(result.valid).toBe(false);
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should return valid when all pass', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: {
                    id: 'name',
                    type: STRING,
                    value: 'John',
                    constraints: { required: REQUIRED }
                }
            }
        };

        const result = await checkConstraintsDeep(form, createCtx(form));
        expect(result.valid).toBe(true);
    });

    it('should check nested children', async () => {
        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                section: {
                    id: 'section',
                    type: TYPE,
                    children: {
                        field: {
                            id: 'field',
                            type: STRING,
                            value: '',
                            constraints: { required: REQUIRED }
                        }
                    }
                }
            }
        };

        const result = await checkConstraintsDeep(form, createCtx(form));
        expect(result.valid).toBe(false);
    });
});

