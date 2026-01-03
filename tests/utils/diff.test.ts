import { describe, it, expect } from 'bun:test';
import { diff } from '../../src/utils/diff';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';
import { Property } from '../../src/core/property';

describe('diff', () => {
    it('should detect no changes for identical properties', () => {
        const prop: Property = {
            id: 'test',
            type: STRING,
            value: 'hello'
        };

        const diffs = diff(prop, prop);
        
        expect(diffs).toHaveLength(0);
    });

    it('should detect id change', () => {
        const a: Property = { id: 'old', type: STRING };
        const b: Property = { id: 'new', type: STRING };

        const diffs = diff(a, b);
        
        expect(diffs.some(d => d.path.includes('id') && d.type === 'changed')).toBe(true);
    });

    it('should detect value change', () => {
        const a: Property = { id: 'test', type: STRING, value: 'old' };
        const b: Property = { id: 'test', type: STRING, value: 'new' };

        const diffs = diff(a, b);
        
        const valueDiff = diffs.find(d => d.path.includes('value'));
        expect(valueDiff).toBeDefined();
        expect(valueDiff?.type).toBe('changed');
        expect(valueDiff?.oldValue).toBe('old');
        expect(valueDiff?.newValue).toBe('new');
    });

    it('should detect type change', () => {
        const a: Property = { id: 'test', type: STRING };
        const b: Property = { id: 'test', type: NUMBER };

        const diffs = diff(a, b);
        
        expect(diffs.some(d => d.path.includes('type') && d.type === 'changed')).toBe(true);
    });

    it('should detect added child', () => {
        const a: Property = {
            id: 'form',
            type: TYPE,
            children: {}
        };
        const b: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: '' }
            }
        };

        const diffs = diff(a, b);
        
        const addedDiff = diffs.find(d => d.type === 'added');
        expect(addedDiff).toBeDefined();
        expect(addedDiff?.path).toContain('name');
    });

    it('should detect removed child', () => {
        const a: Property = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: '' }
            }
        };
        const b: Property = {
            id: 'form',
            type: TYPE,
            children: {}
        };

        const diffs = diff(a, b);
        
        const removedDiff = diffs.find(d => d.type === 'removed');
        expect(removedDiff).toBeDefined();
        expect(removedDiff?.path).toContain('name');
    });

    it('should detect nested changes', () => {
        const a: Property = {
            id: 'form',
            type: TYPE,
            children: {
                section: {
                    id: 'section',
                    type: TYPE,
                    children: {
                        field: { id: 'field', type: STRING, value: 'old' }
                    }
                }
            }
        };
        const b: Property = {
            id: 'form',
            type: TYPE,
            children: {
                section: {
                    id: 'section',
                    type: TYPE,
                    children: {
                        field: { id: 'field', type: STRING, value: 'new' }
                    }
                }
            }
        };

        const diffs = diff(a, b);
        
        const nestedDiff = diffs.find(d => d.path.includes('field') && d.path.includes('value'));
        expect(nestedDiff).toBeDefined();
        expect(nestedDiff?.type).toBe('changed');
    });

    it('should handle complex object values', () => {
        const a: Property = {
            id: 'test',
            type: STRING,
            value: { key: 'old' }
        };
        const b: Property = {
            id: 'test',
            type: STRING,
            value: { key: 'new' }
        };

        const diffs = diff(a, b);
        
        expect(diffs.some(d => d.type === 'changed')).toBe(true);
    });

    it('should handle array values', () => {
        const a: Property = {
            id: 'test',
            type: STRING,
            value: [1, 2, 3]
        };
        const b: Property = {
            id: 'test',
            type: STRING,
            value: [1, 2, 3, 4]
        };

        const diffs = diff(a, b);
        
        expect(diffs.some(d => d.type === 'changed')).toBe(true);
    });
});

