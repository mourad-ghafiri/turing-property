// ============================================================================
// CONSTRAINTS - Validation as Properties (All is Property)
// ============================================================================
// Constraints are Properties with type: CONSTRAINT. Their value is an expression
// that evaluates to true (valid) or false (invalid).
// Error messages belong in constraint.metadata.message (NOT in field metadata!)

import { CONSTRAINT, op, ref, lit } from '.././dist/index.js';
import { STRING } from './types.js';

// ============================================================================
// PRESENCE CONSTRAINTS
// ============================================================================

export const REQUIRED = {
    id: 'required',
    type: CONSTRAINT,
    value: op('and',
        op('isNotNull', ref('self.value')),
        op('isNotBlank', op('toString', ref('self.value')))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
};

// ============================================================================
// STRING CONSTRAINTS
// ============================================================================

export const minLength = (n, message) => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('gte', op('strlen', ref('self.value')), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum ${n} characters required` }
    }
});

export const maxLength = (n, message) => ({
    id: 'maxLength',
    type: CONSTRAINT,
    value: op('lte', op('strlen', ref('self.value')), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Maximum ${n} characters allowed` }
    }
});

export const EMAIL = {
    id: 'email',
    type: CONSTRAINT,
    value: op('isEmail', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Please enter a valid email address' }
    }
};

export const PHONE = {
    id: 'phone',
    type: CONSTRAINT,
    value: op('isPhone', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Please enter a valid phone number' }
    }
};

// ============================================================================
// NUMBER CONSTRAINTS
// ============================================================================

export const min = (n, message) => ({
    id: 'min',
    type: CONSTRAINT,
    value: op('gte', ref('self.value'), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum value is ${n}` }
    }
});

export const max = (n, message) => ({
    id: 'max',
    type: CONSTRAINT,
    value: op('lte', ref('self.value'), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Maximum value is ${n}` }
    }
});

export const inRange = (minVal, maxVal, message) => ({
    id: 'inRange',
    type: CONSTRAINT,
    value: op('and',
        op('gte', ref('self.value'), lit(minVal)),
        op('lte', ref('self.value'), lit(maxVal))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Must be between ${minVal} and ${maxVal}` }
    }
});

// ============================================================================
// BOOLEAN CONSTRAINTS
// ============================================================================

export const MUST_BE_TRUE = {
    id: 'mustBeTrue',
    type: CONSTRAINT,
    value: op('eq', ref('self.value'), lit(true)),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This must be accepted' }
    }
};
