// ============================================================================
// STRING CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** String length >= n */
export const MIN_LENGTH = (n: number): Property => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('gte', op('strlen', op('toString', ref(['self', 'value']))), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at least ${n} characters` }
    }
});

/** String length <= n */
export const MAX_LENGTH = (n: number): Property => ({
    id: 'maxLength',
    type: CONSTRAINT,
    value: op('lte', op('strlen', op('toString', ref(['self', 'value']))), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at most ${n} characters` }
    }
});

/** String length exactly n */
export const EXACT_LENGTH = (n: number): Property => ({
    id: 'exactLength',
    type: CONSTRAINT,
    value: op('eq', op('strlen', op('toString', ref(['self', 'value']))), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be exactly ${n} characters` }
    }
});

/** String length between min and max */
export const LENGTH_BETWEEN = (min: number, max: number): Property => ({
    id: 'lengthBetween',
    type: CONSTRAINT,
    value: op('and',
        op('gte', op('strlen', op('toString', ref(['self', 'value']))), lit(min)),
        op('lte', op('strlen', op('toString', ref(['self', 'value']))), lit(max))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be between ${min} and ${max} characters` }
    }
});

/** Matches regex pattern */
export const PATTERN = (regex: string, msg?: string): Property => ({
    id: 'pattern',
    type: CONSTRAINT,
    value: op('matches', op('toString', ref(['self', 'value'])), lit(regex)),
    metadata: {
        message: { id: 'message', type: STRING, value: msg ?? 'Invalid format' }
    }
});

/** Valid email format */
export const EMAIL: Property = {
    id: 'email',
    type: CONSTRAINT,
    value: op('isEmail', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid email address' }
    }
};

/** Valid URL format */
export const URL: Property = {
    id: 'url',
    type: CONSTRAINT,
    value: op('isUrl', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid URL' }
    }
};

/** Valid phone number */
export const PHONE: Property = {
    id: 'phone',
    type: CONSTRAINT,
    value: op('isPhone', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid phone number' }
    }
};

/** Only letters */
export const ALPHA: Property = {
    id: 'alpha',
    type: CONSTRAINT,
    value: op('isAlpha', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must contain only letters' }
    }
};

/** Only letters and numbers */
export const ALPHANUMERIC: Property = {
    id: 'alphanumeric',
    type: CONSTRAINT,
    value: op('isAlphanumeric', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must contain only letters and numbers' }
    }
};

/** Only numbers */
export const NUMERIC: Property = {
    id: 'numeric',
    type: CONSTRAINT,
    value: op('isNumeric', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must contain only numbers' }
    }
};

/** Valid UUID format */
export const UUID: Property = {
    id: 'uuid',
    type: CONSTRAINT,
    value: op('isUuid', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid UUID' }
    }
};

/** Valid slug format */
export const SLUG: Property = {
    id: 'slug',
    type: CONSTRAINT,
    value: op('isSlug', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid slug' }
    }
};

/** Valid IPv4 address */
export const IPV4: Property = {
    id: 'ipv4',
    type: CONSTRAINT,
    value: op('isIpv4', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid IPv4 address' }
    }
};

/** Valid IPv6 address */
export const IPV6: Property = {
    id: 'ipv6',
    type: CONSTRAINT,
    value: op('isIpv6', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid IPv6 address' }
    }
};

/** Valid hex color */
export const HEX_COLOR: Property = {
    id: 'hexColor',
    type: CONSTRAINT,
    value: op('isHex', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid hex color' }
    }
};

/** Valid credit card number */
export const CREDIT_CARD: Property = {
    id: 'creditCard',
    type: CONSTRAINT,
    value: op('isCreditCard', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid credit card number' }
    }
};

/** Valid postal/zip code */
export const POSTAL_CODE: Property = {
    id: 'postalCode',
    type: CONSTRAINT,
    value: op('isPostalCode', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid postal code' }
    }
};

/** Valid SSN */
export const SSN: Property = {
    id: 'ssn',
    type: CONSTRAINT,
    value: op('isSsn', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a valid SSN' }
    }
};

/** String starts with prefix */
export const STARTS_WITH = (prefix: string): Property => ({
    id: 'startsWith',
    type: CONSTRAINT,
    value: op('startsWith', op('toString', ref(['self', 'value'])), lit(prefix)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must start with "${prefix}"` }
    }
});

/** String ends with suffix */
export const ENDS_WITH = (suffix: string): Property => ({
    id: 'endsWith',
    type: CONSTRAINT,
    value: op('endsWith', op('toString', ref(['self', 'value'])), lit(suffix)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must end with "${suffix}"` }
    }
});

/** String contains substring */
export const CONTAINS = (substring: string): Property => ({
    id: 'contains',
    type: CONSTRAINT,
    value: op('includes', op('toString', ref(['self', 'value'])), lit(substring)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must contain "${substring}"` }
    }
});

/** Lowercase only */
export const LOWERCASE: Property = {
    id: 'lowercase',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), op('lower', ref(['self', 'value']))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be lowercase' }
    }
};

/** Uppercase only */
export const UPPERCASE: Property = {
    id: 'uppercase',
    type: CONSTRAINT,
    value: op('eq', ref(['self', 'value']), op('upper', ref(['self', 'value']))),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be uppercase' }
    }
};

