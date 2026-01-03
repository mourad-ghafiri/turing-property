// ============================================================================
// EXPRESSION TYPES
// ============================================================================
// Types for expressions: Lit, Ref, Op

import { Property } from '../../core';
import { EXPR, TYPE } from './meta';

/** Literal expression type */
export const LIT: Property = {
    id: 'Lit',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A literal/constant value' }
    }
};

/** Reference expression type */
export const REF: Property = {
    id: 'Ref',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A reference to another property' }
    }
};

/** Operator call expression type */
export const OP: Property = {
    id: 'Op',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An operator invocation with arguments' }
    }
};

