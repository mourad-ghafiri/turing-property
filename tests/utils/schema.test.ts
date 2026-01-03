import { describe, it, expect } from 'bun:test';
import {
    PropertySchema,
    ExpressionSchema,
    ConstraintSchema,
    TypeSchema,
    TuringPropertySchemas,
    validateProperty,
    validatePropertyJSON,
    validateExpression,
    assertValidProperty,
    isValidProperty,
    getPropertySchemaString,
    getAllSchemas
} from '../../src/utils/schema';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { REQUIRED } from '../../src/builtin/constraints';

describe('JSON Schemas', () => {
    describe('PropertySchema', () => {
        it('should have correct $schema', () => {
            expect(PropertySchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
        });

        it('should have required fields defined', () => {
            expect(PropertySchema.required).toContain('id');
            expect(PropertySchema.required).toContain('type');
        });

        it('should define all property fields', () => {
            const props = PropertySchema.properties;
            expect(props.id).toBeDefined();
            expect(props.type).toBeDefined();
            expect(props.value).toBeDefined();
            expect(props.defaultValue).toBeDefined();
            expect(props.metadata).toBeDefined();
            expect(props.constraints).toBeDefined();
            expect(props.children).toBeDefined();
        });

        it('should have defaultValue field in schema', () => {
            const defaultValueSchema = PropertySchema.properties.defaultValue;
            expect(defaultValueSchema).toBeDefined();
            expect(defaultValueSchema.description).toContain('default value');
        });
    });

    describe('ExpressionSchema', () => {
        it('should have oneOf for LIT, REF, OP', () => {
            expect(ExpressionSchema.oneOf).toHaveLength(3);
        });
    });

    describe('ConstraintSchema', () => {
        it('should define constraint structure', () => {
            expect(ConstraintSchema.required).toContain('id');
            expect(ConstraintSchema.required).toContain('type');
        });
    });

    describe('TypeSchema', () => {
        it('should define type structure', () => {
            expect(TypeSchema.required).toContain('id');
            expect(TypeSchema.required).toContain('type');
        });
    });

    describe('TuringPropertySchemas', () => {
        it('should bundle all schemas', () => {
            expect(TuringPropertySchemas.property).toBe(PropertySchema);
            expect(TuringPropertySchemas.expression).toBe(ExpressionSchema);
            expect(TuringPropertySchemas.constraint).toBe(ConstraintSchema);
            expect(TuringPropertySchemas.type).toBe(TypeSchema);
        });
    });
});

describe('validateProperty', () => {
    it('should validate a minimal property', () => {
        // TYPE is self-referential, so use $ref in serialized form
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } }
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail without id', () => {
        const result = validateProperty({
            type: { id: 'String' }
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_REQUIRED' && e.path.includes('id'))).toBe(true);
    });

    it('should fail without type', () => {
        const result = validateProperty({
            id: 'test'
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_REQUIRED' && e.path.includes('type'))).toBe(true);
    });

    it('should fail if not an object', () => {
        const result = validateProperty('not an object');
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_TYPE')).toBe(true);
    });

    it('should fail if id is not a string', () => {
        const result = validateProperty({
            id: 123,
            type: { id: 'String' }
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.message.includes('id'))).toBe(true);
    });

    it('should validate with value', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'hello'
        });
        expect(result.valid).toBe(true);
    });

    it('should validate with defaultValue (primitive)', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'current',
            defaultValue: 'default'
        });
        expect(result.valid).toBe(true);
    });

    it('should validate with defaultValue (expression)', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'current',
            defaultValue: lit('default')
        });
        expect(result.valid).toBe(true);
    });

    it('should validate with metadata', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            metadata: {
                label: { id: 'label', type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } }, value: 'Test' }
            }
        });
        expect(result.valid).toBe(true);
    });

    it('should validate with constraints', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            constraints: {
                required: { id: 'required', type: { id: 'Constraint', type: { id: 'Type', type: { $ref: 'Type' } } } }
            }
        });
        expect(result.valid).toBe(true);
    });

    it('should validate with children', () => {
        const result = validateProperty({
            id: 'form',
            type: { id: 'Object', type: { id: 'Type', type: { $ref: 'Type' } } },
            children: {
                name: { id: 'name', type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } } }
            }
        });
        expect(result.valid).toBe(true);
    });

    it('should validate children with defaultValue', () => {
        const result = validateProperty({
            id: 'form',
            type: { id: 'Object', type: { id: 'Type', type: { $ref: 'Type' } } },
            children: {
                name: { 
                    id: 'name', 
                    type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
                    value: 'John',
                    defaultValue: ''
                }
            }
        });
        expect(result.valid).toBe(true);
    });

    it('should validate nested properties recursively', () => {
        const result = validateProperty({
            id: 'form',
            type: { id: 'Object', type: { id: 'Type' } },
            children: {
                // Invalid child - missing type
                name: { id: 'name' }
            }
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.path.includes('children'))).toBe(true);
    });

    it('should validate defaultValue expression recursively', () => {
        // A complex expression as defaultValue
        const result = validateProperty({
            id: 'test',
            type: { id: 'Number', type: { id: 'Type', type: { $ref: 'Type' } } },
            defaultValue: op('add', lit(1), lit(2))
        });
        expect(result.valid).toBe(true);
    });

    it('should fail for invalid defaultValue expression', () => {
        const result = validateProperty({
            id: 'test',
            type: { id: 'Number', type: { id: 'Type', type: { $ref: 'Type' } } },
            defaultValue: { id: 'bad-expr' } // Missing type
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.path.includes('defaultValue'))).toBe(true);
    });

    it('should validate built-in types', () => {
        const result = validateProperty(STRING);
        expect(result.valid).toBe(true);
    });

    it('should validate built-in expressions', () => {
        const result = validateProperty(lit(42));
        expect(result.valid).toBe(true);
    });

    it('should validate properties with defaultValue', () => {
        const prop = {
            id: 'name',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: '',
            defaultValue: ''
        };
        expect(prop.defaultValue).toBe('');
        const result = validateProperty(prop);
        expect(result.valid).toBe(true);
    });
});

describe('validatePropertyJSON', () => {
    it('should validate valid JSON', () => {
        const json = JSON.stringify({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } }
        });
        const result = validatePropertyJSON(json);
        expect(result.valid).toBe(true);
    });

    it('should validate JSON with defaultValue', () => {
        const json = JSON.stringify({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'current',
            defaultValue: 'default'
        });
        const result = validatePropertyJSON(json);
        expect(result.valid).toBe(true);
    });

    it('should fail for invalid JSON syntax', () => {
        const result = validatePropertyJSON('not valid json');
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_JSON')).toBe(true);
    });

    it('should fail for valid JSON with invalid structure', () => {
        const json = JSON.stringify({ invalid: true });
        const result = validatePropertyJSON(json);
        expect(result.valid).toBe(false);
    });
});

describe('validateExpression', () => {
    it('should validate literal expression', () => {
        const result = validateExpression(lit(42));
        expect(result.valid).toBe(true);
    });

    it('should validate reference expression', () => {
        const result = validateExpression(ref(['self', 'value']));
        expect(result.valid).toBe(true);
    });

    it('should validate operator expression', () => {
        const result = validateExpression(op('add', lit(1), lit(2)));
        expect(result.valid).toBe(true);
    });

    it('should fail for non-object', () => {
        const result = validateExpression('not an expression');
        expect(result.valid).toBe(false);
    });

    it('should fail for reference with non-array value', () => {
        const result = validateExpression({
            id: 'ref',
            type: { id: 'Ref' },
            value: 'not an array'
        });
        expect(result.valid).toBe(false);
    });

    it('should fail for reference with non-string path segments', () => {
        const result = validateExpression({
            id: 'ref',
            type: { id: 'Ref' },
            value: ['valid', 123]
        });
        expect(result.valid).toBe(false);
    });
});

describe('assertValidProperty', () => {
    it('should not throw for valid property', () => {
        expect(() => assertValidProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } }
        })).not.toThrow();
    });

    it('should not throw for property with defaultValue', () => {
        expect(() => assertValidProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            defaultValue: 'default'
        })).not.toThrow();
    });

    it('should throw for invalid property', () => {
        expect(() => assertValidProperty({ invalid: true })).toThrow('Invalid Property');
    });
});

describe('isValidProperty', () => {
    it('should return true for valid property', () => {
        expect(isValidProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } }
        })).toBe(true);
    });

    it('should return true for property with defaultValue', () => {
        expect(isValidProperty({
            id: 'test',
            type: { id: 'String', type: { id: 'Type', type: { $ref: 'Type' } } },
            value: 'current',
            defaultValue: 'default'
        })).toBe(true);
    });

    it('should return false for invalid property', () => {
        expect(isValidProperty({ invalid: true })).toBe(false);
    });
});

describe('getPropertySchemaString', () => {
    it('should return JSON string', () => {
        const schema = getPropertySchemaString();
        expect(typeof schema).toBe('string');
        expect(() => JSON.parse(schema)).not.toThrow();
    });

    it('should include defaultValue in schema', () => {
        const schema = getPropertySchemaString();
        expect(schema).toContain('defaultValue');
    });

    it('should return pretty-printed by default', () => {
        const schema = getPropertySchemaString();
        expect(schema).toContain('\n');
    });

    it('should return compact when pretty is false', () => {
        const schema = getPropertySchemaString(false);
        expect(schema).not.toContain('\n');
    });
});

describe('getAllSchemas', () => {
    it('should return all schemas', () => {
        const schemas = getAllSchemas();
        expect(schemas.property).toBeDefined();
        expect(schemas.expression).toBeDefined();
        expect(schemas.constraint).toBeDefined();
        expect(schemas.type).toBeDefined();
    });
});
