// ============================================================================
// PRIMITIVE DATA TYPES
// ============================================================================

import { Property } from '../../core';
import { TYPE } from './meta';

/** String type */
export const STRING: Property = {
    id: 'String',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A string value' }
    }
};

/** Number type */
export const NUMBER: Property = {
    id: 'Number',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A numeric value' }
    }
};

/** Boolean type */
export const BOOLEAN: Property = {
    id: 'Boolean',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A boolean value (true/false)' }
    }
};

/** Null type */
export const NULL: Property = {
    id: 'Null',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A null value' }
    }
};

/** Any type (accepts any value) */
export const ANY: Property = {
    id: 'Any',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'Any value' }
    }
};

// ============================================================================
// TEMPORAL TYPES
// ============================================================================

/** Date type (date only, no time component) - ISO 8601 format: YYYY-MM-DD */
export const DATE: Property = {
    id: 'Date',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A date value (YYYY-MM-DD)' },
        format: { id: 'format', type: TYPE, value: 'YYYY-MM-DD' }
    }
};

/** DateTime type (date and time) - ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ */
export const DATETIME: Property = {
    id: 'DateTime',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A date and time value (ISO 8601)' },
        format: { id: 'format', type: TYPE, value: 'YYYY-MM-DDTHH:mm:ss.sssZ' }
    }
};

/** Time type (time only, no date component) - Format: HH:mm:ss or HH:mm */
export const TIME: Property = {
    id: 'Time',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A time value (HH:mm:ss)' },
        format: { id: 'format', type: TYPE, value: 'HH:mm:ss' }
    }
};

/** Duration type (time span) - ISO 8601 duration format: P[n]Y[n]M[n]DT[n]H[n]M[n]S */
export const DURATION: Property = {
    id: 'Duration',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A duration/time span (ISO 8601)' },
        format: { id: 'format', type: TYPE, value: 'P[n]Y[n]M[n]DT[n]H[n]M[n]S' }
    }
};

/** Timestamp type (Unix timestamp in milliseconds) */
export const TIMESTAMP: Property = {
    id: 'Timestamp',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'Unix timestamp in milliseconds' }
    }
};

