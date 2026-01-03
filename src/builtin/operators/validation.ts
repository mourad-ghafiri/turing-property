// ============================================================================
// VALIDATION OPERATORS
// ============================================================================

import { Property } from '../../core';
import { reg, evalArgs, EvaluationContext } from './registry';

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/[^\s]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
const hexRegex = /^#?[0-9a-fA-F]+$/;
const alphaRegex = /^[a-zA-Z]+$/;
const alphanumericRegex = /^[a-zA-Z0-9]+$/;
const numericRegex = /^\d+$/;
const postalCodeRegex = /^\d{5}(-\d{4})?$/;
const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Check if value is empty (null, undefined, or empty string after trim) */
const isEmpty = (val: unknown): boolean =>
    val == null || String(val).trim() === '';

/** Create a regex validation operator */
const regexValidator = (regex: RegExp) =>
    async (args: Property[], ctx: EvaluationContext) => {
        const [val] = await evalArgs(args, ctx);
        if (isEmpty(val)) return true;
        return regex.test(String(val));
    };

/** Create a custom validation operator with empty check */
const customValidator = (fn: (val: unknown) => boolean) =>
    async (args: Property[], ctx: EvaluationContext) => {
        const [val] = await evalArgs(args, ctx);
        if (isEmpty(val)) return true;
        return fn(val);
    };

// ============================================================================
// VALIDATION OPERATORS
// ============================================================================

reg('isEmail', regexValidator(emailRegex));
reg('isUrl', regexValidator(urlRegex));
reg('isPhone', regexValidator(phoneRegex));
reg('isAlpha', regexValidator(alphaRegex));
reg('isAlphanumeric', regexValidator(alphanumericRegex));
reg('isNumeric', regexValidator(numericRegex));
reg('isUuid', regexValidator(uuidRegex));
reg('isSlug', regexValidator(slugRegex));
reg('isIpv4', regexValidator(ipv4Regex));
reg('isIpv6', regexValidator(ipv6Regex));
reg('isHex', regexValidator(hexRegex));
reg('isPostalCode', regexValidator(postalCodeRegex));
reg('isSsn', regexValidator(ssnRegex));

reg('isCreditCard', customValidator((val) => {
    const digits = String(val).replace(/\D/g, '');
    return digits.length >= 13 && digits.length <= 19;
}));

reg('isValidDate', customValidator((val) => {
    const date = new Date(val as string);
    return !isNaN(date.getTime());
}));

