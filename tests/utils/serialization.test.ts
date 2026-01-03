import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { 
    toJSON, 
    toJSONString, 
    fromJSON, 
    parseJSON 
} from '../../src/utils/serialization';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';

describe('toJSON', () => {
    it('should convert property to plain object', () => {
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'hello'
        });

        const json = toJSON(node);
        
        expect(json).toHaveProperty('id', 'test');
        expect(json).toHaveProperty('value', 'hello');
    });

    it('should include children', () => {
        const node = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' }
            }
        });

        const json = toJSON(node) as any;
        
        expect(json.children).toBeDefined();
        expect(json.children.name).toBeDefined();
        expect(json.children.name.id).toBe('name');
    });

    it('should include metadata', () => {
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: '',
            metadata: {
                label: { id: 'label', type: STRING, value: 'My Label' }
            }
        });

        const json = toJSON(node) as any;
        
        expect(json.metadata).toBeDefined();
        expect(json.metadata.label.value).toBe('My Label');
    });

    it('should include constraints', () => {
        const CONSTRAINT = { id: 'Constraint', type: TYPE };
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: '',
            constraints: {
                required: { id: 'required', type: CONSTRAINT, value: true }
            }
        });

        const json = toJSON(node) as any;
        
        expect(json.constraints).toBeDefined();
        expect(json.constraints.required).toBeDefined();
    });
});

describe('toJSONString', () => {
    it('should convert to JSON string', () => {
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'hello'
        });

        const jsonStr = toJSONString(node);
        
        expect(typeof jsonStr).toBe('string');
        expect(() => JSON.parse(jsonStr)).not.toThrow();
    });

    it('should format with pretty option', () => {
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'hello'
        });

        const compact = toJSONString(node);
        const pretty = toJSONString(node, { pretty: true });
        
        expect(pretty.length).toBeGreaterThan(compact.length);
        expect(pretty).toContain('\n');
    });

    it('should use custom indent', () => {
        const node = new PropertyNode({
            id: 'test',
            type: STRING,
            value: 'hello'
        });

        const pretty = toJSONString(node, { pretty: true, indent: 4 });
        
        expect(pretty).toContain('    '); // 4 spaces
    });
});

describe('fromJSON', () => {
    it('should import from plain object', () => {
        const json = {
            id: 'test',
            type: STRING,
            value: 'hello'
        };

        const result = fromJSON(json);
        
        expect(result.valid).toBe(true);
        expect(result.node).toBeInstanceOf(PropertyNode);
        expect(result.node?.id).toBe('test');
    });

    it('should import from JSON string', () => {
        // Use a simple non-cyclic type for JSON string
        const jsonStr = JSON.stringify({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'hello'
        });

        const result = fromJSON(jsonStr);
        
        expect(result.valid).toBe(true);
        expect(result.node?.id).toBe('test');
    });

    it('should handle invalid JSON string', () => {
        const result = fromJSON('not valid json', { throwOnError: false });
        
        expect(result.valid).toBe(false);
        expect(result.node).toBeNull();
        expect(result.errors).toHaveLength(1);
    });

    it('should throw on invalid JSON when throwOnError is true', () => {
        expect(() => fromJSON('not valid json', { throwOnError: true })).toThrow();
    });

    it('should import with children', () => {
        const json = {
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' }
            }
        };

        const result = fromJSON(json);
        
        expect(result.node?.children.name).toBeDefined();
        expect(result.node?.children.name.id).toBe('name');
    });
});

describe('parseJSON', () => {
    it('should parse valid JSON string', () => {
        // Use a simple non-cyclic type for JSON string
        const jsonStr = JSON.stringify({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'hello'
        });

        const node = parseJSON(jsonStr);
        
        expect(node).toBeInstanceOf(PropertyNode);
        expect(node.id).toBe('test');
    });

    it('should throw on invalid JSON', () => {
        expect(() => parseJSON('not valid')).toThrow();
    });
});

describe('Round-trip', () => {
    it('should preserve data through export/import cycle', () => {
        const original = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' },
                age: { id: 'age', type: NUMBER, value: 30 }
            }
        });

        const jsonStr = toJSONString(original);
        const imported = parseJSON(jsonStr);
        
        expect(imported.id).toBe(original.id);
        expect(imported.children.name.value).toBe('John');
        expect(imported.children.age.value).toBe(30);
    });
});

