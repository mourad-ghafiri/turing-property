import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { clone, merge } from '../../src/utils/clone';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';
import { Property } from '../../src/core/property';

describe('clone', () => {
    it('should create a deep copy', () => {
        const original = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'hello'
        });

        const copy = clone(original);
        
        expect(copy.id).toBe(original.id);
        expect(copy.value).toBe(original.value);
        expect(copy).not.toBe(original);
    });

    it('should clone children', () => {
        const original = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' }
            }
        });

        const copy = clone(original);
        
        expect(copy.children.name).toBeDefined();
        expect(copy.children.name.value).toBe('John');
        expect(copy.children.name).not.toBe(original.children.name);
    });

    it('should not affect original when modifying clone', () => {
        const original = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'original'
        });

        const copy = clone(original);
        copy.setValue('modified');
        
        expect(original.value).toBe('original');
        expect(copy.value).toBe('modified');
    });

    it('should handle nested structures', () => {
        const original = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                level1: {
                    id: 'level1',
                    type: TYPE,
                    children: {
                        level2: { id: 'level2', type: STRING, value: 'deep' }
                    }
                }
            }
        });

        const copy = clone(original);
        
        expect(copy.children.level1.children.level2.value).toBe('deep');
    });
});

describe('merge', () => {
    it('should merge basic properties', () => {
        const base: Property = {
            id: 'base',
            type: STRING,
            value: 'original'
        };

        const patch: Partial<Property> = {
            value: 'patched'
        };

        const result = merge(base, patch);
        
        expect(result.id).toBe('base');
        expect(result.value).toBe('patched');
    });

    it('should override id when provided', () => {
        const base: Property = {
            id: 'base',
            type: STRING
        };

        const patch: Partial<Property> = {
            id: 'newId'
        };

        const result = merge(base, patch);
        
        expect(result.id).toBe('newId');
    });

    it('should merge metadata', () => {
        const base: Property = {
            id: 'test',
            type: STRING,
            metadata: {
                label: { id: 'label', type: STRING, value: 'Base Label' }
            }
        };

        const patch: Partial<Property> = {
            metadata: {
                placeholder: { id: 'placeholder', type: STRING, value: 'Enter...' }
            }
        };

        const result = merge(base, patch);
        
        expect(result.metadata?.label).toBeDefined();
        expect(result.metadata?.placeholder).toBeDefined();
    });

    it('should merge constraints', () => {
        const CONSTRAINT = { id: 'Constraint', type: TYPE };
        const base: Property = {
            id: 'test',
            type: STRING,
            constraints: {
                required: { id: 'required', type: CONSTRAINT, value: true }
            }
        };

        const patch: Partial<Property> = {
            constraints: {
                email: { id: 'email', type: CONSTRAINT, value: true }
            }
        };

        const result = merge(base, patch);
        
        expect(result.constraints?.required).toBeDefined();
        expect(result.constraints?.email).toBeDefined();
    });

    it('should merge children', () => {
        const base: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: '' }
            }
        };

        const patch: Partial<Property> = {
            children: {
                email: { id: 'email', type: STRING, value: '' }
            }
        };

        const result = merge(base, patch);
        
        expect(result.children?.name).toBeDefined();
        expect(result.children?.email).toBeDefined();
    });

    it('should override with patch type', () => {
        const base: Property = {
            id: 'test',
            type: STRING
        };

        const patch: Partial<Property> = {
            type: NUMBER
        };

        const result = merge(base, patch);
        
        expect(result.type).toBe(NUMBER);
    });
});

