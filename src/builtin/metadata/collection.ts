// ============================================================================
// COLLECTION METADATA
// ============================================================================
// Collection/list/select metadata property factories.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { LIST, NUMBER, BOOLEAN, PROPERTY } from '../types';

// ============================================================================
// OPTIONS
// ============================================================================

/** Options for select/radio/checkbox groups */
export const options = (value: unknown): Property => ({
    id: 'options',
    type: LIST,
    value
});

// ============================================================================
// LIMITS
// ============================================================================

/** Maximum selections allowed */
export const maxSelections = (value: unknown): Property => ({
    id: 'maxSelections',
    type: NUMBER,
    value
});

/** Minimum items required */
export const minItems = (value: unknown): Property => ({
    id: 'minItems',
    type: NUMBER,
    value
});

/** Maximum items allowed */
export const maxItems = (value: unknown): Property => ({
    id: 'maxItems',
    type: NUMBER,
    value
});

// ============================================================================
// COLLECTION BEHAVIOR
// ============================================================================

/** Whether searchable */
export const searchable = (value: unknown = true): Property => ({
    id: 'searchable',
    type: BOOLEAN,
    value
});

/** Whether clearable */
export const clearable = (value: unknown = true): Property => ({
    id: 'clearable',
    type: BOOLEAN,
    value
});

/** Whether sortable */
export const sortable = (value: unknown = true): Property => ({
    id: 'sortable',
    type: BOOLEAN,
    value
});

/** Whether editable */
export const editable = (value: unknown = true): Property => ({
    id: 'editable',
    type: BOOLEAN,
    value
});

/** Whether deletable */
export const deletable = (value: unknown = true): Property => ({
    id: 'deletable',
    type: BOOLEAN,
    value
});

/** Whether draggable */
export const draggable = (value: unknown = true): Property => ({
    id: 'draggable',
    type: BOOLEAN,
    value
});

// ============================================================================
// TEMPLATE
// ============================================================================

/** Item template for repeatable collections */
export const itemTemplate = (value: Property): Property => ({
    id: 'itemTemplate',
    type: PROPERTY,
    value
});

