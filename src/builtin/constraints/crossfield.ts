// ============================================================================
// CROSS-FIELD CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Value equals another field's value */
export const EQUALS_FIELD = (fieldPath: string[]): Property => ({
    id: 'equalsField',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), ref([...fieldPath, 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must match ${fieldPath.join('.')}` }
    }
});

/** Date is before another field's date */
export const BEFORE_FIELD = (fieldPath: string[]): Property => ({
    id: 'beforeField',
    type: CONSTRAINT,
    value: op('isBefore', ref(['self', 'value']), ref([...fieldPath, 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be before ${fieldPath.join('.')}` }
    }
});

/** Date is after another field's date */
export const AFTER_FIELD = (fieldPath: string[]): Property => ({
    id: 'afterField',
    type: CONSTRAINT,
    value: op('isAfter', ref(['self', 'value']), ref([...fieldPath, 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be after ${fieldPath.join('.')}` }
    }
});

