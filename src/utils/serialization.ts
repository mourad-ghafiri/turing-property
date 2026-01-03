// ============================================================================
// SERIALIZATION UTILITIES
// ============================================================================

import { Property, PropertyNode } from '../core';

export interface ExportOptions {
    pretty?: boolean;
    indent?: number;
}

/**
 * Convert a Property to a plain JSON-serializable object, handling cycles
 */
function propertyToPlain(prop: Property, seen: Map<Property, object> = new Map()): object {
    // Handle cyclic references - return a reference object
    if (seen.has(prop)) {
        const existing = seen.get(prop) as Record<string, unknown>;
        return { $ref: existing.id };
    }

    const result: Record<string, unknown> = {
        id: prop.id
    };

    // Register before recursing
    seen.set(prop, result);

    if (prop.type) {
        // Handle self-referential types (TYPE.type === TYPE)
        if (prop.type === prop) {
            result.type = { $ref: prop.id };
        } else {
            result.type = propertyToPlain(prop.type, seen);
        }
    }

    if (prop.value !== undefined) {
        if (typeof prop.value === 'object' && prop.value !== null && 'id' in prop.value && 'type' in prop.value) {
            result.value = propertyToPlain(prop.value as Property, seen);
        } else {
            result.value = prop.value;
        }
    }

    if (prop.metadata && Object.keys(prop.metadata).length > 0) {
        result.metadata = {};
        for (const [key, meta] of Object.entries(prop.metadata)) {
            (result.metadata as Record<string, unknown>)[key] = propertyToPlain(meta, seen);
        }
    }

    if (prop.constraints && Object.keys(prop.constraints).length > 0) {
        result.constraints = {};
        for (const [key, constraint] of Object.entries(prop.constraints)) {
            (result.constraints as Record<string, unknown>)[key] = propertyToPlain(constraint, seen);
        }
    }

    if (prop.children && Object.keys(prop.children).length > 0) {
        result.children = {};
        for (const [key, child] of Object.entries(prop.children)) {
            (result.children as Record<string, unknown>)[key] = propertyToPlain(child, seen);
        }
    }

    return result;
}

/**
 * Export a Property or PropertyNode to a plain object
 */
export function toJSON(node: Property | PropertyNode, options: ExportOptions = {}): object {
    const prop = node instanceof PropertyNode ? node.toProperty() : node;
    return propertyToPlain(prop);
}

/**
 * Export a Property to a JSON string
 */
export function toJSONString(node: Property | PropertyNode, options: ExportOptions = {}): string {
    const obj = toJSON(node, options);
    if (options.pretty) {
        return JSON.stringify(obj, null, options.indent ?? 2);
    }
    return JSON.stringify(obj);
}

export interface ImportOptions {
    validate?: boolean;
    throwOnError?: boolean;
}

export interface ImportResult {
    node: PropertyNode | null;
    valid: boolean;
    errors: { path: string; message: string }[];
}

/**
 * Validate that an object has the minimal Property structure
 */
function validatePropertyStructure(obj: unknown, path: string = 'root'): { path: string; message: string }[] {
    const errors: { path: string; message: string }[] = [];

    if (!obj || typeof obj !== 'object') {
        errors.push({ path, message: 'Property must be an object' });
        return errors;
    }

    const prop = obj as Record<string, unknown>;

    if (typeof prop.id !== 'string') {
        errors.push({ path, message: 'Property must have a string "id" field' });
    }

    if (!prop.type || typeof prop.type !== 'object') {
        errors.push({ path, message: 'Property must have an object "type" field' });
    }

    // Recursively validate children
    if (prop.children && typeof prop.children === 'object') {
        for (const [key, child] of Object.entries(prop.children as Record<string, unknown>)) {
            errors.push(...validatePropertyStructure(child, `${path}.children.${key}`));
        }
    }

    // Recursively validate metadata
    if (prop.metadata && typeof prop.metadata === 'object') {
        for (const [key, meta] of Object.entries(prop.metadata as Record<string, unknown>)) {
            errors.push(...validatePropertyStructure(meta, `${path}.metadata.${key}`));
        }
    }

    // Recursively validate constraints
    if (prop.constraints && typeof prop.constraints === 'object') {
        for (const [key, constraint] of Object.entries(prop.constraints as Record<string, unknown>)) {
            errors.push(...validatePropertyStructure(constraint, `${path}.constraints.${key}`));
        }
    }

    return errors;
}

/**
 * Import from JSON
 */
export function fromJSON(input: Property | string, options: ImportOptions = {}): ImportResult {
    const throwOnError = options.throwOnError ?? true;
    const validate = options.validate ?? true;

    let property: Property;
    if (typeof input === 'string') {
        try {
            property = JSON.parse(input);
        } catch (err) {
            const error = {
                path: 'root',
                message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`
            };
            if (throwOnError) {
                throw new Error(error.message);
            }
            return { node: null, valid: false, errors: [error] };
        }
    } else {
        property = input;
    }

    // Validate property structure
    if (validate) {
        const validationErrors = validatePropertyStructure(property);
        if (validationErrors.length > 0) {
            if (throwOnError) {
                throw new Error(`Invalid Property structure: ${validationErrors[0]!.message} at ${validationErrors[0]!.path}`);
            }
            return { node: null, valid: false, errors: validationErrors };
        }
    }

    const node = new PropertyNode(property);
    return { node, valid: true, errors: [] };
}

/**
 * Parse JSON string to PropertyNode
 */
export function parseJSON(json: string): PropertyNode {
    const result = fromJSON(json, { throwOnError: true });
    return result.node!;
}

