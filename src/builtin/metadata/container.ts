// ============================================================================
// CONTAINER METADATA
// ============================================================================
// Container type flags and behavior metadata.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { BOOLEAN } from '../types';

// ============================================================================
// CONTAINER TYPE FLAGS
// ============================================================================

/** Mark as group */
export const isGroup = (value: unknown = true): Property => ({
    id: 'isGroup',
    type: BOOLEAN,
    value
});

/** Mark as form */
export const isForm = (value: unknown = true): Property => ({
    id: 'isForm',
    type: BOOLEAN,
    value
});

/** Mark as step (in wizard) */
export const isStep = (value: unknown = true): Property => ({
    id: 'isStep',
    type: BOOLEAN,
    value
});

/** Mark as wizard */
export const isWizard = (value: unknown = true): Property => ({
    id: 'isWizard',
    type: BOOLEAN,
    value
});

/** Mark as computed/derived */
export const isComputed = (value: unknown = true): Property => ({
    id: 'isComputed',
    type: BOOLEAN,
    value
});

/** Mark as repeater (array of items) */
export const isRepeater = (value: unknown = true): Property => ({
    id: 'isRepeater',
    type: BOOLEAN,
    value
});

/** Mark as tabs */
export const isTabs = (value: unknown = true): Property => ({
    id: 'isTabs',
    type: BOOLEAN,
    value
});

/** Mark as conditional (show/hide based on condition) */
export const isConditional = (value: unknown = true): Property => ({
    id: 'isConditional',
    type: BOOLEAN,
    value
});

// ============================================================================
// CONTAINER BEHAVIOR
// ============================================================================

/** Whether collapsible */
export const collapsible = (value: unknown = true): Property => ({
    id: 'collapsible',
    type: BOOLEAN,
    value
});

/** Whether collapsed */
export const collapsed = (value: unknown = true): Property => ({
    id: 'collapsed',
    type: BOOLEAN,
    value
});

/** Whether resizable */
export const resizable = (value: unknown = true): Property => ({
    id: 'resizable',
    type: BOOLEAN,
    value
});

