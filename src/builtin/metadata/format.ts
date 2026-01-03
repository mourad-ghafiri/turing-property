// ============================================================================
// FORMAT METADATA
// ============================================================================
// Format, type, and measurement metadata property factories.
// Values can be static OR Property expressions (lit, ref, op) for dynamic behavior.

import { Property } from '../../core';
import { STRING, NUMBER } from '../types';

// ============================================================================
// DATA FORMAT
// ============================================================================

/** Data format (e.g., "date-time", "uri", "email", "uuid") */
export const format = (value: unknown): Property => ({
    id: 'format',
    type: STRING,
    value
});

/** Pattern/regex for display/parsing */
export const pattern = (value: unknown): Property => ({
    id: 'pattern',
    type: STRING,
    value
});

/** MIME type */
export const mimeType = (value: unknown): Property => ({
    id: 'mimeType',
    type: STRING,
    value
});

/** Content encoding (e.g., "base64", "utf-8") */
export const encoding = (value: unknown): Property => ({
    id: 'encoding',
    type: STRING,
    value
});

/** Locale/language code (e.g., "en-US") */
export const locale = (value: unknown): Property => ({
    id: 'locale',
    type: STRING,
    value
});

/** Timezone identifier (e.g., "UTC", "America/New_York") */
export const timezone = (value: unknown): Property => ({
    id: 'timezone',
    type: STRING,
    value
});

// ============================================================================
// UNITS / MEASUREMENT
// ============================================================================

/** Unit of measurement (e.g., "kg", "m", "seconds") */
export const unit = (value: unknown): Property => ({
    id: 'unit',
    type: STRING,
    value
});

/** Currency code (e.g., "USD", "EUR") */
export const currency = (value: unknown): Property => ({
    id: 'currency',
    type: STRING,
    value
});

/** Decimal precision for display */
export const precision = (value: unknown): Property => ({
    id: 'precision',
    type: NUMBER,
    value
});

/** Decimal scale (digits after decimal point) */
export const scale = (value: unknown): Property => ({
    id: 'scale',
    type: NUMBER,
    value
});

// ============================================================================
// EXAMPLES
// ============================================================================

/** Example values */
export const examples = (value: unknown): Property => ({
    id: 'examples',
    type: STRING,
    value
});

/** Fallback value if undefined/null */
export const fallback = (value: unknown): Property => ({
    id: 'fallback',
    type: STRING,
    value
});

