// ============================================================================
// JSON SCHEMA - Property Validation
// ============================================================================
// JSON Schema definition for the Property interface and validation utilities.

import { Property } from '../core';

// ============================================================================
// JSON SCHEMA DEFINITIONS
// ============================================================================

/**
 * JSON Schema for a Property object
 */
export const PropertySchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://turing-property.dev/schemas/property.json',
    title: 'Property',
    description: 'A Property in the Turing Property system. Everything is a Property.',
    type: 'object',
    required: ['id', 'type'],
    properties: {
        id: {
            type: 'string',
            description: 'Unique identifier for the property'
        },
        type: {
            $ref: '#',
            description: 'The type of this property (also a Property)'
        },
        value: {
            description: 'The value of this property (any type, or a Property expression)'
        },
        defaultValue: {
            description: 'The default value (any type, or a Property expression). Used for reset operations.'
        },
        metadata: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            description: 'Metadata properties'
        },
        constraints: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            description: 'Constraint properties'
        },
        children: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            description: 'Child properties'
        }
    },
    additionalProperties: false
};

/**
 * JSON Schema for Expression (LIT, REF, OP)
 */
export const ExpressionSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://turing-property.dev/schemas/expression.json',
    title: 'Expression',
    description: 'An expression in the Turing Property system',
    oneOf: [
        {
            title: 'Literal',
            type: 'object',
            required: ['id', 'type', 'value'],
            properties: {
                id: { type: 'string', const: 'lit' },
                type: {
                    type: 'object',
                    properties: { id: { type: 'string', const: 'Lit' } }
                },
                value: { description: 'Any literal value' }
            }
        },
        {
            title: 'Reference',
            type: 'object',
            required: ['id', 'type', 'value'],
            properties: {
                id: { type: 'string', const: 'ref' },
                type: {
                    type: 'object',
                    properties: { id: { type: 'string', const: 'Ref' } }
                },
                value: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Path segments'
                }
            }
        },
        {
            title: 'Operator',
            type: 'object',
            required: ['id', 'type'],
            properties: {
                id: { type: 'string', description: 'Operator name' },
                type: {
                    type: 'object',
                    properties: { id: { type: 'string', const: 'Op' } }
                },
                children: {
                    type: 'object',
                    description: 'Operator arguments'
                }
            }
        }
    ]
};

/**
 * JSON Schema for Constraint
 */
export const ConstraintSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://turing-property.dev/schemas/constraint.json',
    title: 'Constraint',
    description: 'A constraint in the Turing Property system',
    type: 'object',
    required: ['id', 'type'],
    properties: {
        id: { type: 'string', description: 'Constraint identifier' },
        type: {
            type: 'object',
            properties: { id: { type: 'string', const: 'Constraint' } }
        },
        value: {
            $ref: 'https://turing-property.dev/schemas/expression.json',
            description: 'Expression that evaluates to boolean'
        },
        metadata: {
            type: 'object',
            properties: {
                message: { $ref: 'https://turing-property.dev/schemas/property.json' }
            }
        }
    }
};

/**
 * JSON Schema for Type
 */
export const TypeSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://turing-property.dev/schemas/type.json',
    title: 'Type',
    description: 'A type in the Turing Property system',
    type: 'object',
    required: ['id', 'type'],
    properties: {
        id: { type: 'string', description: 'Type identifier' },
        type: {
            oneOf: [
                { type: 'object', properties: { id: { type: 'string', const: 'Type' } } },
                { type: 'object', properties: { $ref: { type: 'string' } } }
            ]
        },
        metadata: {
            type: 'object',
            additionalProperties: { $ref: 'https://turing-property.dev/schemas/property.json' }
        },
        children: {
            type: 'object',
            additionalProperties: { $ref: 'https://turing-property.dev/schemas/property.json' }
        }
    }
};

/**
 * Complete schema bundle for all Turing Property schemas
 */
export const TuringPropertySchemas = {
    property: PropertySchema,
    expression: ExpressionSchema,
    constraint: ConstraintSchema,
    type: TypeSchema
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
    path: string[];
    message: string;
    code: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that an object has the required Property fields
 */
function validatePropertyStructure(obj: unknown, path: string[] = [], isType = false): ValidationError[] {
    const errors: ValidationError[] = [];

    if (obj === null || typeof obj !== 'object') {
        errors.push({
            path,
            message: 'Expected an object',
            code: 'INVALID_TYPE'
        });
        return errors;
    }

    const prop = obj as Record<string, unknown>;

    // Check required 'id' field
    if (!('id' in prop)) {
        errors.push({
            path: [...path, 'id'],
            message: 'Missing required field: id',
            code: 'MISSING_REQUIRED'
        });
    } else if (typeof prop.id !== 'string') {
        errors.push({
            path: [...path, 'id'],
            message: 'Field "id" must be a string',
            code: 'INVALID_TYPE'
        });
    }

    // Check required 'type' field (but allow $ref or self-reference for types)
    if (!('type' in prop)) {
        errors.push({
            path: [...path, 'type'],
            message: 'Missing required field: type',
            code: 'MISSING_REQUIRED'
        });
    } else if (prop.type !== null && typeof prop.type === 'object') {
        // Type should be a Property or a reference
        const typeObj = prop.type as Record<string, unknown>;
        if (!('id' in typeObj) && !('$ref' in typeObj)) {
            errors.push({
                path: [...path, 'type'],
                message: 'Type must be a Property (with id) or a reference (with $ref)',
                code: 'INVALID_TYPE'
            });
        }
    }

    // Validate optional fields
    if ('metadata' in prop && prop.metadata !== undefined) {
        if (typeof prop.metadata !== 'object' || prop.metadata === null) {
            errors.push({
                path: [...path, 'metadata'],
                message: 'Metadata must be an object',
                code: 'INVALID_TYPE'
            });
        }
    }

    if ('constraints' in prop && prop.constraints !== undefined) {
        if (typeof prop.constraints !== 'object' || prop.constraints === null) {
            errors.push({
                path: [...path, 'constraints'],
                message: 'Constraints must be an object',
                code: 'INVALID_TYPE'
            });
        }
    }

    if ('children' in prop && prop.children !== undefined) {
        if (typeof prop.children !== 'object' || prop.children === null) {
            errors.push({
                path: [...path, 'children'],
                message: 'Children must be an object',
                code: 'INVALID_TYPE'
            });
        }
    }

    return errors;
}

/**
 * Recursively validate a Property and all its nested Properties
 */
function validatePropertyDeep(
    obj: unknown,
    path: string[] = [],
    seen: WeakSet<object> = new WeakSet(),
    typeDepth: number = 0
): ValidationError[] {
    const errors: ValidationError[] = [];

    if (obj === null || typeof obj !== 'object') {
        // Non-objects at root are invalid
        if (path.length === 0) {
            errors.push({
                path,
                message: 'Expected an object',
                code: 'INVALID_TYPE'
            });
        }
        return errors;
    }

    // Handle cyclic references
    if (seen.has(obj as object)) {
        return errors;
    }
    seen.add(obj as object);

    // Validate this property
    errors.push(...validatePropertyStructure(obj, path));

    const prop = obj as Record<string, unknown>;

    // Validate type (if not a $ref) but limit depth to avoid infinite recursion
    // Type chain should end at TYPE which references itself
    if (prop.type && typeof prop.type === 'object' && typeDepth < 3) {
        const typeObj = prop.type as Record<string, unknown>;
        // Skip validation for $ref or self-reference (TYPE.type === TYPE)
        if (!('$ref' in typeObj) && typeObj !== obj) {
            errors.push(...validatePropertyDeep(prop.type, [...path, 'type'], seen, typeDepth + 1));
        }
    }

    // Validate value if it's a Property (expression)
    if (prop.value && typeof prop.value === 'object' && !Array.isArray(prop.value)) {
        const valueObj = prop.value as Record<string, unknown>;
        if ('id' in valueObj && 'type' in valueObj) {
            errors.push(...validatePropertyDeep(prop.value, [...path, 'value'], seen, 0));
        }
    }

    // Validate defaultValue if it's a Property (expression)
    // If it has 'id', it's expected to be a valid Property (must also have 'type')
    if (prop.defaultValue && typeof prop.defaultValue === 'object' && !Array.isArray(prop.defaultValue)) {
        const defaultValueObj = prop.defaultValue as Record<string, unknown>;
        if ('id' in defaultValueObj) {
            errors.push(...validatePropertyDeep(prop.defaultValue, [...path, 'defaultValue'], seen, 0));
        }
    }

    // Validate metadata
    if (prop.metadata && typeof prop.metadata === 'object') {
        for (const [key, meta] of Object.entries(prop.metadata as Record<string, unknown>)) {
            if (meta && typeof meta === 'object') {
                errors.push(...validatePropertyDeep(meta, [...path, 'metadata', key], seen, 0));
            }
        }
    }

    // Validate constraints
    if (prop.constraints && typeof prop.constraints === 'object') {
        for (const [key, constraint] of Object.entries(prop.constraints as Record<string, unknown>)) {
            if (constraint && typeof constraint === 'object') {
                errors.push(...validatePropertyDeep(constraint, [...path, 'constraints', key], seen, 0));
            }
        }
    }

    // Validate children
    if (prop.children && typeof prop.children === 'object') {
        for (const [key, child] of Object.entries(prop.children as Record<string, unknown>)) {
            if (child && typeof child === 'object') {
                errors.push(...validatePropertyDeep(child, [...path, 'children', key], seen, 0));
            }
        }
    }

    return errors;
}

/**
 * Validate a Property object against the schema
 * Returns a validation result with errors if any
 */
export function validateProperty(obj: unknown): ValidationResult {
    const errors = validatePropertyDeep(obj);
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate a Property and throw if invalid
 */
export function assertValidProperty(obj: unknown): asserts obj is Property {
    const result = validateProperty(obj);
    if (!result.valid) {
        const errorMessages = result.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        throw new Error(`Invalid Property:\n${errorMessages.join('\n')}`);
    }
}

/**
 * Check if an object is a valid Property
 */
export function isValidProperty(obj: unknown): obj is Property {
    return validateProperty(obj).valid;
}

/**
 * Validate JSON string against Property schema
 */
export function validatePropertyJSON(json: string): ValidationResult {
    try {
        const obj = JSON.parse(json);
        return validateProperty(obj);
    } catch (err) {
        return {
            valid: false,
            errors: [{
                path: [],
                message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
                code: 'INVALID_JSON'
            }]
        };
    }
}

/**
 * Validate that an expression is well-formed
 */
export function validateExpression(obj: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (obj === null || typeof obj !== 'object') {
        errors.push({
            path: [],
            message: 'Expression must be an object',
            code: 'INVALID_TYPE'
        });
        return { valid: false, errors };
    }

    const expr = obj as Record<string, unknown>;

    if (!('id' in expr) || typeof expr.id !== 'string') {
        errors.push({
            path: ['id'],
            message: 'Expression must have a string id',
            code: 'MISSING_REQUIRED'
        });
    }

    if (!('type' in expr) || typeof expr.type !== 'object') {
        errors.push({
            path: ['type'],
            message: 'Expression must have a type',
            code: 'MISSING_REQUIRED'
        });
        return { valid: errors.length === 0, errors };
    }

    const type = expr.type as Record<string, unknown>;
    const typeId = type.id;

    // Validate based on expression type
    if (typeId === 'Lit') {
        if (!('value' in expr)) {
            errors.push({
                path: ['value'],
                message: 'Literal expression must have a value',
                code: 'MISSING_REQUIRED'
            });
        }
    } else if (typeId === 'Ref') {
        if (!('value' in expr) || !Array.isArray(expr.value)) {
            errors.push({
                path: ['value'],
                message: 'Reference expression must have an array value (path segments)',
                code: 'INVALID_TYPE'
            });
        } else if (!expr.value.every((v: unknown) => typeof v === 'string')) {
            errors.push({
                path: ['value'],
                message: 'Reference path segments must all be strings',
                code: 'INVALID_TYPE'
            });
        }
    } else if (typeId === 'Op') {
        // Operator expressions have children as arguments
        if (expr.children && typeof expr.children !== 'object') {
            errors.push({
                path: ['children'],
                message: 'Operator children must be an object',
                code: 'INVALID_TYPE'
            });
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Get the JSON Schema for Property as a string
 */
export function getPropertySchemaString(pretty = true): string {
    return JSON.stringify(PropertySchema, null, pretty ? 2 : 0);
}

/**
 * Get all schemas as a bundle
 */
export function getAllSchemas(): typeof TuringPropertySchemas {
    return TuringPropertySchemas;
}
