// ============================================================================
// CLONE & MERGE UTILITIES
// ============================================================================

import { Property, PropertyNode } from '../core';

/**
 * Deep clone a Property, handling cyclic references
 */
function deepCloneProperty(prop: Property, seen: Map<Property, Property> = new Map()): Property {
    // Handle cyclic references
    if (seen.has(prop)) {
        return seen.get(prop)!;
    }

    // Create a new object with the same structure
    const cloned: Property = {
        id: prop.id,
        type: null as unknown as Property // Placeholder, will be set below
    };

    // Register before recursing to handle cycles
    seen.set(prop, cloned);

    // Clone the type (may be cyclic, e.g., TYPE.type === TYPE)
    if (prop.type === prop) {
        cloned.type = cloned; // Self-reference
    } else {
        cloned.type = deepCloneProperty(prop.type, seen);
    }

    // Clone value
    if (prop.value !== undefined) {
        if (typeof prop.value === 'object' && prop.value !== null) {
            // Check if value is a Property
            if ((prop.value as Property).id !== undefined && (prop.value as Property).type !== undefined) {
                cloned.value = deepCloneProperty(prop.value as Property, seen);
            } else if (Array.isArray(prop.value)) {
                cloned.value = prop.value.map(v => 
                    typeof v === 'object' && v !== null && (v as Property).id !== undefined && (v as Property).type !== undefined
                        ? deepCloneProperty(v as Property, seen)
                        : structuredClone ? structuredClone(v) : JSON.parse(JSON.stringify(v))
                );
            } else {
                cloned.value = structuredClone ? structuredClone(prop.value) : JSON.parse(JSON.stringify(prop.value));
            }
        } else {
            cloned.value = prop.value;
        }
    }

    // Clone metadata
    if (prop.metadata) {
        cloned.metadata = {};
        for (const [key, value] of Object.entries(prop.metadata)) {
            cloned.metadata[key] = deepCloneProperty(value, seen);
        }
    }

    // Clone constraints
    if (prop.constraints) {
        cloned.constraints = {};
        for (const [key, value] of Object.entries(prop.constraints)) {
            cloned.constraints[key] = deepCloneProperty(value, seen);
        }
    }

    // Clone children
    if (prop.children) {
        cloned.children = {};
        for (const [key, value] of Object.entries(prop.children)) {
            cloned.children[key] = deepCloneProperty(value, seen);
        }
    }

    return cloned;
}

/**
 * Deep clone a Property or PropertyNode
 */
export function clone(prop: Property | PropertyNode): PropertyNode {
    const plain = prop instanceof PropertyNode ? prop.toProperty() : prop;
    const cloned = deepCloneProperty(plain);
    return new PropertyNode(cloned);
}

/**
 * Merge two Properties
 */
export function merge(base: Property, patch: Partial<Property>): Property {
    const result: Property = { 
        id: patch.id ?? base.id,
        type: patch.type ?? base.type
    };

    if (patch.value !== undefined) {
        result.value = patch.value;
    } else if (base.value !== undefined) {
        result.value = base.value;
    }

    if (patch.metadata !== undefined || base.metadata !== undefined) {
        result.metadata = { ...base.metadata, ...patch.metadata };
    }

    if (patch.constraints !== undefined || base.constraints !== undefined) {
        result.constraints = { ...base.constraints, ...patch.constraints };
    }

    if (patch.children !== undefined || base.children !== undefined) {
        result.children = { ...base.children, ...patch.children };
    }

    return result;
}

