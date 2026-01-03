// ============================================================================
// CONDITIONAL CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Required only if condition is true */
export const REQUIRED_IF = (condition: Property): Property => ({
    id: 'requiredIf',
    type: CONSTRAINT,
    value: op('if', condition,
        op('and', op('isNotNull', ref(['self', 'value'])), op('isNotBlank', op('toString', ref(['self', 'value'])))),
        lit(true)
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
});

/** Required if another field has specific value */
export const REQUIRED_IF_FIELD_EQUALS = (fieldPath: string[], value: unknown): Property => ({
    id: 'requiredIfFieldEquals',
    type: CONSTRAINT,
    value: op('if', op('eq', ref([...fieldPath, 'value']), lit(value)),
        op('and', op('isNotNull', ref(['self', 'value'])), op('isNotBlank', op('toString', ref(['self', 'value'])))),
        lit(true)
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
});

