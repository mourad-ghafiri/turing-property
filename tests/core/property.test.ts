import { describe, it, expect } from 'bun:test';
import { Property } from '../../src/core/property';

describe('Property Interface', () => {
    it('should create a basic property with id and type', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        expect(TYPE.id).toBe('Type');
        expect(TYPE.type).toBe(TYPE);
    });

    it('should create a property with value', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        const STRING: Property = {
            id: 'String',
            type: TYPE,
            value: 'hello'
        };

        expect(STRING.id).toBe('String');
        expect(STRING.type).toBe(TYPE);
        expect(STRING.value).toBe('hello');
    });

    it('should create a property with metadata', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        const prop: Property = {
            id: 'myProp',
            type: TYPE,
            metadata: {
                label: { id: 'label', type: TYPE, value: 'My Label' },
                description: { id: 'description', type: TYPE, value: 'A description' }
            }
        };

        expect(prop.metadata).toBeDefined();
        expect(prop.metadata?.label?.value).toBe('My Label');
        expect(prop.metadata?.description?.value).toBe('A description');
    });

    it('should create a property with constraints', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        const CONSTRAINT: Property = { id: 'Constraint', type: TYPE };

        const prop: Property = {
            id: 'email',
            type: TYPE,
            constraints: {
                required: { id: 'required', type: CONSTRAINT, value: true }
            }
        };

        expect(prop.constraints).toBeDefined();
        expect(prop.constraints?.required?.id).toBe('required');
    });

    it('should create a property with children', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: TYPE, value: '' },
                email: { id: 'email', type: TYPE, value: '' }
            }
        };

        expect(form.children).toBeDefined();
        expect(Object.keys(form.children!)).toHaveLength(2);
        expect(form.children?.name?.id).toBe('name');
        expect(form.children?.email?.id).toBe('email');
    });

    it('should support nested children', () => {
        const TYPE: Property = { id: 'Type', type: null as unknown as Property };
        TYPE.type = TYPE;

        const form: Property = {
            id: 'form',
            type: TYPE,
            children: {
                address: {
                    id: 'address',
                    type: TYPE,
                    children: {
                        street: { id: 'street', type: TYPE, value: '' },
                        city: { id: 'city', type: TYPE, value: '' }
                    }
                }
            }
        };

        expect(form.children?.address?.children?.street?.id).toBe('street');
        expect(form.children?.address?.children?.city?.id).toBe('city');
    });
});

