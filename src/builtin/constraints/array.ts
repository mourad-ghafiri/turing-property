// ============================================================================
// ARRAY CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Array has at least n items */
export const MIN_ITEMS = (n: number): Property => ({
    id: 'minItems',
    type: CONSTRAINT,
    value: op('gte', op('len', ref(['self', 'value'])), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must have at least ${n} items` }
    }
});

/** Array has at most n items */
export const MAX_ITEMS = (n: number): Property => ({
    id: 'maxItems',
    type: CONSTRAINT,
    value: op('lte', op('len', ref(['self', 'value'])), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must have at most ${n} items` }
    }
});

/** All array items are unique */
export const UNIQUE_ITEMS: Property = {
    id: 'uniqueItems',
    type: CONSTRAINT,
    value: op('eq', op('len', ref(['self', 'value'])), op('len', op('unique', ref(['self', 'value'])))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'All items must be unique' }
    }
};

/** Array is not empty */
export const NOT_EMPTY_ARRAY: Property = {
    id: 'notEmptyArray',
    type: CONSTRAINT,
    value: op('gt', op('len', ref(['self', 'value'])), lit(0)),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must have at least one item' }
    }
};

