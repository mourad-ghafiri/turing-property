// ============================================================================
// NUMBER CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Value >= min */
export const MIN = (n: number): Property => ({
    id: 'min',
    type: CONSTRAINT,
    value: op('gte', op('toNumber', ref(['self', 'value'])), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at least ${n}` }
    }
});

/** Value <= max */
export const MAX = (n: number): Property => ({
    id: 'max',
    type: CONSTRAINT,
    value: op('lte', op('toNumber', ref(['self', 'value'])), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at most ${n}` }
    }
});

/** Value between min and max (inclusive) */
export const BETWEEN = (min: number, max: number): Property => ({
    id: 'between',
    type: CONSTRAINT,
    value: op('between', op('toNumber', ref(['self', 'value'])), lit(min), lit(max)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be between ${min} and ${max}` }
    }
});

/** Value in range [min, max) */
export const IN_RANGE = (min: number, max: number): Property => ({
    id: 'inRange',
    type: CONSTRAINT,
    value: op('inRange', op('toNumber', ref(['self', 'value'])), lit(min), lit(max)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be in range [${min}, ${max})` }
    }
});

/** Value > 0 */
export const POSITIVE: Property = {
    id: 'positive',
    type: CONSTRAINT,
    value: op('isPositive', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a positive number' }
    }
};

/** Value < 0 */
export const NEGATIVE: Property = {
    id: 'negative',
    type: CONSTRAINT,
    value: op('isNegative', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a negative number' }
    }
};

/** Value >= 0 */
export const NON_NEGATIVE: Property = {
    id: 'nonNegative',
    type: CONSTRAINT,
    value: op('gte', op('toNumber', ref(['self', 'value'])), lit(0)),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be zero or positive' }
    }
};

/** Must be an integer */
export const INTEGER: Property = {
    id: 'integer',
    type: CONSTRAINT,
    value: op('isInteger', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a whole number' }
    }
};

/** Even number */
export const EVEN: Property = {
    id: 'even',
    type: CONSTRAINT,
    value: op('isEven', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be an even number' }
    }
};

/** Odd number */
export const ODD: Property = {
    id: 'odd',
    type: CONSTRAINT,
    value: op('isOdd', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be an odd number' }
    }
};

/** Divisible by n */
export const DIVISIBLE_BY = (n: number): Property => ({
    id: 'divisibleBy',
    type: CONSTRAINT,
    value: op('eq', op('mod', op('toNumber', ref(['self', 'value'])), lit(n)), lit(0)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be divisible by ${n}` }
    }
});

