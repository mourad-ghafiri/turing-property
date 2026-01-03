// ============================================================================
// ACTION METADATA
// ============================================================================
// Form/wizard action labels and navigation metadata.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { STRING, NUMBER, BOOLEAN } from '../types';

// ============================================================================
// FORM ACTION LABELS
// ============================================================================

/** Submit button label */
export const submitLabel = (value: unknown): Property => ({
    id: 'submitLabel',
    type: STRING,
    value
});

/** Reset button label */
export const resetLabel = (value: unknown): Property => ({
    id: 'resetLabel',
    type: STRING,
    value
});

/** Cancel button label */
export const cancelLabel = (value: unknown): Property => ({
    id: 'cancelLabel',
    type: STRING,
    value
});

/** Show reset button */
export const showReset = (value: unknown = true): Property => ({
    id: 'showReset',
    type: BOOLEAN,
    value
});

// ============================================================================
// WIZARD NAVIGATION LABELS
// ============================================================================

/** Next step label */
export const nextLabel = (value: unknown): Property => ({
    id: 'nextLabel',
    type: STRING,
    value
});

/** Previous step label */
export const prevLabel = (value: unknown): Property => ({
    id: 'prevLabel',
    type: STRING,
    value
});

/** Finish/complete label */
export const finishLabel = (value: unknown): Property => ({
    id: 'finishLabel',
    type: STRING,
    value
});

/** Show progress indicator */
export const showProgress = (value: unknown = true): Property => ({
    id: 'showProgress',
    type: BOOLEAN,
    value
});

/** Allow skipping steps */
export const allowSkip = (value: unknown = true): Property => ({
    id: 'allowSkip',
    type: BOOLEAN,
    value
});

// ============================================================================
// WIZARD STATE
// ============================================================================

/** Current step index */
export const currentStep = (value: unknown): Property => ({
    id: 'currentStep',
    type: NUMBER,
    value
});

/** Total number of steps */
export const totalSteps = (value: unknown): Property => ({
    id: 'totalSteps',
    type: NUMBER,
    value
});

/** Active tab index */
export const activeTab = (value: unknown): Property => ({
    id: 'activeTab',
    type: NUMBER,
    value
});

// ============================================================================
// REPEATER ACTION LABELS
// ============================================================================

/** Add item label */
export const addLabel = (value: unknown): Property => ({
    id: 'addLabel',
    type: STRING,
    value
});

/** Remove item label */
export const removeLabel = (value: unknown): Property => ({
    id: 'removeLabel',
    type: STRING,
    value
});

