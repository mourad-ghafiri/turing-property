// ============================================================================
// PRESENCE CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Value is not null, undefined, or empty string */
export const REQUIRED: Property = {
    id: 'required',
    type: CONSTRAINT,
    value: op('and', op('isNotNull', ref(['self', 'value'])), op('isNotBlank', op('toString', ref(['self', 'value'])))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
};

/** Value can be empty (always passes) */
export const OPTIONAL: Property = {
    id: 'optional',
    type: CONSTRAINT,
    value: lit(true)
};

/** Value must be null or undefined */
export const MUST_BE_NULL: Property = {
    id: 'mustBeNull',
    type: CONSTRAINT,
    value: op('isNull', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field must be empty' }
    }
};

/** Value must not be empty */
export const NOT_EMPTY: Property = {
    id: 'notEmpty',
    type: CONSTRAINT,
    value: op('isNotEmpty', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field cannot be empty' }
    }
};

