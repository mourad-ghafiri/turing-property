// ============================================================================
// STRUCTURAL DATA TYPES
// ============================================================================

import { Property } from '../../core';
import { TYPE } from './meta';

/** List/Array type (parameterized) */
export const LIST: Property = {
    id: 'List',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A list/array of elements' }
    }
};

/** Object type (with named properties) */
export const OBJECT: Property = {
    id: 'Object',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An object with named properties' }
    }
};

/** Record type (dictionary with typed values) */
export const RECORD: Property = {
    id: 'Record',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A record/dictionary with typed values' }
    }
};

/** Union type */
export const UNION: Property = {
    id: 'Union',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A union of multiple types' }
    }
};

/** Intersection type */
export const INTERSECTION: Property = {
    id: 'Intersection',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An intersection of multiple types' }
    }
};

/** Literal type (exact value) */
export const LITERAL: Property = {
    id: 'Literal',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An exact literal value type' }
    }
};

/** Function type */
export const FUNCTION: Property = {
    id: 'Function',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A function type' }
    }
};

/** Enum type (set of allowed values) */
export const ENUM: Property = {
    id: 'Enum',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An enumeration of allowed values' }
    }
};

