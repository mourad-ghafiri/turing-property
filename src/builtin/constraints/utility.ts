// ============================================================================
// UTILITY CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit } from '../expressions';

/** Always passes */
export const ALWAYS_VALID: Property = {
    id: 'alwaysValid',
    type: CONSTRAINT,
    value: lit(true)
};

/** Always fails (for testing) */
export const ALWAYS_INVALID: Property = {
    id: 'alwaysInvalid',
    type: CONSTRAINT,
    value: lit(false),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This always fails' }
    }
};

/** Custom expression constraint */
export const CUSTOM = (id: string, expr: Property, message?: string): Property => ({
    id,
    type: CONSTRAINT,
    value: expr,
    metadata: message ? {
        message: { id: 'message', type: STRING, value: message }
    } : undefined
});

