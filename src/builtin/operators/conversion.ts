// ============================================================================
// CONVERSION OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('toNumber', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const n = Number(val);
    return isNaN(n) ? 0 : n;
});

reg('toBoolean', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return Boolean(val);
});

reg('toArray', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    if (Array.isArray(val)) return val;
    if (val == null) return [];
    return [val];
});

reg('toJson', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return JSON.stringify(val);
});

reg('fromJson', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    try {
        return JSON.parse(String(val));
    } catch {
        return null;
    }
});

