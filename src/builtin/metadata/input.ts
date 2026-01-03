// ============================================================================
// INPUT METADATA
// ============================================================================
// Input-specific metadata property factories.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { STRING, NUMBER, BOOLEAN } from '../types';

// ============================================================================
// INPUT TYPE / MODE
// ============================================================================

/** Input type for UI (text, email, number, password, etc.) */
export const inputType = (value: unknown): Property => ({
    id: 'inputType',
    type: STRING,
    value
});

/** Browser autocomplete hint */
export const autocomplete = (value: unknown): Property => ({
    id: 'autocomplete',
    type: STRING,
    value
});

/** Input mode (e.g., "numeric", "tel", "email") */
export const inputMode = (value: unknown): Property => ({
    id: 'inputMode',
    type: STRING,
    value
});

/** Enter key hint (e.g., "search", "send", "next") */
export const enterKeyHint = (value: unknown): Property => ({
    id: 'enterKeyHint',
    type: STRING,
    value
});

// ============================================================================
// INPUT BEHAVIOR
// ============================================================================

/** Spell check */
export const spellCheck = (value: unknown = true): Property => ({
    id: 'spellCheck',
    type: BOOLEAN,
    value
});

/** Auto capitalize */
export const autoCapitalize = (value: unknown): Property => ({
    id: 'autoCapitalize',
    type: STRING,
    value
});

/** Auto correct */
export const autoCorrect = (value: unknown = true): Property => ({
    id: 'autoCorrect',
    type: BOOLEAN,
    value
});

/** Auto focus */
export const autoFocus = (value: unknown = true): Property => ({
    id: 'autoFocus',
    type: BOOLEAN,
    value
});

// ============================================================================
// NUMERIC HINTS
// ============================================================================

/** Step increment */
export const step = (value: unknown): Property => ({
    id: 'step',
    type: NUMBER,
    value
});

/** Minimum display value */
export const min = (value: unknown): Property => ({
    id: 'min',
    type: NUMBER,
    value
});

/** Maximum display value */
export const max = (value: unknown): Property => ({
    id: 'max',
    type: NUMBER,
    value
});

/** Number of rows (for textarea) */
export const rows = (value: unknown): Property => ({
    id: 'rows',
    type: NUMBER,
    value
});

/** Number of columns */
export const cols = (value: unknown): Property => ({
    id: 'cols',
    type: NUMBER,
    value
});

// ============================================================================
// FILE INPUT
// ============================================================================

/** File accept attribute */
export const accept = (value: unknown): Property => ({
    id: 'accept',
    type: STRING,
    value
});

/** Whether multiple files allowed */
export const multiple = (value: unknown = true): Property => ({
    id: 'multiple',
    type: BOOLEAN,
    value
});

