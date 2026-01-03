// ============================================================================
// VALUE CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Value is one of allowed values */
export const ONE_OF = (values: unknown[]): Property => ({
    id: 'oneOf',
    type: CONSTRAINT,
    value: op('contains', lit(values), ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be one of: ${values.join(', ')}` }
    }
});

/** Value equals specific value */
export const EQUALS = (value: unknown): Property => ({
    id: 'equals',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), lit(value)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must equal ${value}` }
    }
});

/** Value is true */
export const IS_TRUE: Property = {
    id: 'isTrue',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), lit(true)),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be checked' }
    }
};

/** Terms must be accepted */
export const ACCEPTED: Property = {
    id: 'accepted',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), lit(true)),
    metadata: {
        message: { id: 'message', type: STRING, value: 'You must accept the terms' }
    }
};

