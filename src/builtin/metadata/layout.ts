// ============================================================================
// LAYOUT METADATA
// ============================================================================
// Layout and styling metadata property factories.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { STRING, NUMBER } from '../types';

// ============================================================================
// LAYOUT DIRECTION
// ============================================================================

/** Layout direction (row, column, grid, inline) */
export const layout = (value: unknown): Property => ({
    id: 'layout',
    type: STRING,
    value
});

/** Gap between items */
export const gap = (value: unknown): Property => ({
    id: 'gap',
    type: NUMBER,
    value
});

/** Order/sequence */
export const order = (value: unknown): Property => ({
    id: 'order',
    type: NUMBER,
    value
});

/** Tab index */
export const tabIndex = (value: unknown): Property => ({
    id: 'tabIndex',
    type: NUMBER,
    value
});

// ============================================================================
// SIZING
// ============================================================================

/** Width */
export const width = (value: unknown): Property => ({
    id: 'width',
    type: STRING,
    value
});

/** Height */
export const height = (value: unknown): Property => ({
    id: 'height',
    type: STRING,
    value
});

/** Size variant (sm, md, lg, xl) */
export const size = (value: unknown): Property => ({
    id: 'size',
    type: STRING,
    value
});

// ============================================================================
// ALIGNMENT
// ============================================================================

/** Alignment */
export const align = (value: unknown): Property => ({
    id: 'align',
    type: STRING,
    value
});

/** Justify content */
export const justify = (value: unknown): Property => ({
    id: 'justify',
    type: STRING,
    value
});

// ============================================================================
// STYLING
// ============================================================================

/** Visual variant */
export const variant = (value: unknown): Property => ({
    id: 'variant',
    type: STRING,
    value
});

/** Color value */
export const color = (value: unknown): Property => ({
    id: 'color',
    type: STRING,
    value
});

/** Background color */
export const bgColor = (value: unknown): Property => ({
    id: 'bgColor',
    type: STRING,
    value
});

/** CSS class names */
export const styleClasses = (value: unknown): Property => ({
    id: 'styleClasses',
    type: STRING,
    value
});

/** Inline styles */
export const styles = (value: unknown): Property => ({
    id: 'styles',
    type: STRING,
    value
});

