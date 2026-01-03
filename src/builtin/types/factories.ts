// ============================================================================
// TYPE FACTORY FUNCTIONS
// ============================================================================
// These create type Properties with specific configurations.

import { Property } from '../../core';
import { STRING, NUMBER, BOOLEAN, NULL, ANY, DATE, DATETIME, TIME, DURATION, TIMESTAMP } from './primitives';
import { LIST, OBJECT, RECORD, UNION, INTERSECTION, LITERAL, FUNCTION, ENUM } from './structural';

// ============================================================================
// PRIMITIVE TYPE FACTORIES
// ============================================================================

export const tString = (): Property => ({ id: 'String', type: STRING });
export const tNumber = (): Property => ({ id: 'Number', type: NUMBER });
export const tBoolean = (): Property => ({ id: 'Boolean', type: BOOLEAN });
export const tNull = (): Property => ({ id: 'Null', type: NULL });
export const tAny = (): Property => ({ id: 'Any', type: ANY });

// ============================================================================
// TEMPORAL TYPE FACTORIES
// ============================================================================

/** Create a Date type (date only, no time) */
export const tDate = (): Property => ({ id: 'Date', type: DATE });

/** Create a DateTime type (date and time) */
export const tDateTime = (): Property => ({ id: 'DateTime', type: DATETIME });

/** Create a Time type (time only, no date) */
export const tTime = (): Property => ({ id: 'Time', type: TIME });

/** Create a Duration type (time span) */
export const tDuration = (): Property => ({ id: 'Duration', type: DURATION });

/** Create a Timestamp type (Unix timestamp in ms) */
export const tTimestamp = (): Property => ({ id: 'Timestamp', type: TIMESTAMP });

// ============================================================================
// STRUCTURAL TYPE FACTORIES
// ============================================================================

/** Create a List type with element type */
export const tList = (elementType: Property): Property => ({
    id: 'List',
    type: LIST,
    children: {
        element: elementType
    }
});

/** Create an Object type with shape */
export const tObject = (shape?: Record<string, Property>): Property => ({
    id: 'Object',
    type: OBJECT,
    children: shape
});

/** Create a Record type with value type */
export const tRecord = (valueType: Property): Property => ({
    id: 'Record',
    type: RECORD,
    children: {
        value: valueType
    }
});

/** Create a Union type */
export const tUnion = (...types: Property[]): Property => ({
    id: 'Union',
    type: UNION,
    children: types.reduce((acc, t, i) => ({ ...acc, [`type${i}`]: t }), {})
});

/** Create an Intersection type */
export const tIntersection = (...types: Property[]): Property => ({
    id: 'Intersection',
    type: INTERSECTION,
    children: types.reduce((acc, t, i) => ({ ...acc, [`type${i}`]: t }), {})
});

/** Create a Literal type (exact value) */
export const tLiteral = (value: unknown): Property => ({
    id: 'Literal',
    type: LITERAL,
    value
});

/** Create a Function type */
export const tFunction = (params: Property[], returnType: Property): Property => ({
    id: 'Function',
    type: FUNCTION,
    children: {
        ...params.reduce((acc, p, i) => ({ ...acc, [`param${i}`]: p }), {}),
        return: returnType
    }
});

/**
 * Create an Enum type with named values
 * @param name - The enum type name
 * @param values - Array of allowed string values OR object mapping names to values
 * @example
 * // Simple enum with string values
 * const Status = tEnum('Status', ['pending', 'active', 'completed']);
 *
 * // Enum with named values (name -> value mapping)
 * const Priority = tEnum('Priority', { LOW: 1, MEDIUM: 2, HIGH: 3 });
 */
export const tEnum = (name: string, values: string[] | Record<string, unknown>): Property => {
    const children: Record<string, Property> = {};

    if (Array.isArray(values)) {
        // String array: each value is both the name and the value
        values.forEach(v => {
            children[v] = { id: v, type: STRING, value: v };
        });
    } else {
        // Object: keys are names, values are the actual values
        Object.entries(values).forEach(([key, val]) => {
            const valueType = typeof val === 'number' ? NUMBER :
                             typeof val === 'boolean' ? BOOLEAN : STRING;
            children[key] = { id: key, type: valueType, value: val };
        });
    }

    return {
        id: name,
        type: ENUM,
        children
    };
};

