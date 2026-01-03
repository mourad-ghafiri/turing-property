// ============================================================================
// TYPE CHECK OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('isNull', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return val == null;
});

reg('isNotNull', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return val != null;
});

reg('isEmpty', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    if (val == null) return true;
    if (typeof val === 'string') return val.length === 0;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
});

reg('isNotEmpty', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    if (val == null) return false;
    if (typeof val === 'string') return val.length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
});

reg('isNotBlank', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    if (val == null) return false;
    return String(val).trim().length > 0;
});

reg('isNumber', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && !isNaN(val);
});

reg('isString', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'string';
});

reg('isBoolean', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'boolean';
});

reg('isArray', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return Array.isArray(val);
});

reg('isObject', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return val != null && typeof val === 'object' && !Array.isArray(val);
});

reg('isInteger', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return Number.isInteger(val);
});

reg('isFloat', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && !Number.isInteger(val);
});

reg('isPositive', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && val > 0;
});

reg('isNegative', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && val < 0;
});

reg('isEven', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && val % 2 === 0;
});

reg('isOdd', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return typeof val === 'number' && val % 2 !== 0;
});

