// ============================================================================
// COMMON METADATA
// ============================================================================
// Universal metadata property factories used across all domains.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { STRING, BOOLEAN } from '../types';

// ============================================================================
// DISPLAY / PRESENTATION
// ============================================================================

/** Human-readable label */
export const label = (value: unknown): Property => ({
    id: 'label',
    type: STRING,
    value
});

/** Short hint or guidance */
export const hint = (value: unknown): Property => ({
    id: 'hint',
    type: STRING,
    value
});

/** Longer description */
export const description = (value: unknown): Property => ({
    id: 'description',
    type: STRING,
    value
});

/** Placeholder text */
export const placeholder = (value: unknown): Property => ({
    id: 'placeholder',
    type: STRING,
    value
});

/** Tooltip on hover */
export const tooltip = (value: unknown): Property => ({
    id: 'tooltip',
    type: STRING,
    value
});

/** Help text for accessibility */
export const helpText = (value: unknown): Property => ({
    id: 'helpText',
    type: STRING,
    value
});

/** Icon identifier */
export const icon = (value: unknown): Property => ({
    id: 'icon',
    type: STRING,
    value
});

/** Prefix display (e.g., "$", "http://") */
export const prefix = (value: unknown): Property => ({
    id: 'prefix',
    type: STRING,
    value
});

/** Suffix display (e.g., "kg", "%") */
export const suffix = (value: unknown): Property => ({
    id: 'suffix',
    type: STRING,
    value
});

// ============================================================================
// STATE / BEHAVIOR
// ============================================================================

/** Whether visible */
export const visible = (value: unknown = true): Property => ({
    id: 'visible',
    type: BOOLEAN,
    value
});

/** Whether hidden */
export const hidden = (value: unknown = true): Property => ({
    id: 'hidden',
    type: BOOLEAN,
    value
});

/** Whether disabled */
export const disabled = (value: unknown = true): Property => ({
    id: 'disabled',
    type: BOOLEAN,
    value
});

/** Whether readonly */
export const readonly = (value: unknown = true): Property => ({
    id: 'readonly',
    type: BOOLEAN,
    value
});

/** Whether required (UI indicator) */
export const required = (value: unknown = true): Property => ({
    id: 'required',
    type: BOOLEAN,
    value
});

/** Whether loading */
export const loading = (value: unknown = true): Property => ({
    id: 'loading',
    type: BOOLEAN,
    value
});

/** Whether optional */
export const optional = (value: unknown = true): Property => ({
    id: 'optional',
    type: BOOLEAN,
    value
});

