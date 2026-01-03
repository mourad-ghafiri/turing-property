// ============================================================================
// LOGIC OPERATORS
// ============================================================================

import { reg, evalArg, evalArgs } from './registry';

reg('and', async (args, ctx) => {
    if (args.length === 0) return true;
    for (const arg of args) {
        const val = await evalArg(arg, ctx);
        if (!val) return false;
    }
    return true;
});

reg('or', async (args, ctx) => {
    if (args.length === 0) return false;
    for (const arg of args) {
        const val = await evalArg(arg, ctx);
        if (val) return true;
    }
    return false;
});

reg('not', async (args, ctx) => {
    if (args.length < 1) {
        throw new Error('not operator requires 1 argument');
    }
    const [a] = await evalArgs(args, ctx);
    return !a;
});

reg('if', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('if operator requires at least 2 arguments (condition, then) or 3 (condition, then, else)');
    }
    const condition = await evalArg(args[0]!, ctx);
    if (condition) {
        return await evalArg(args[1]!, ctx);
    } else {
        return args[2] ? await evalArg(args[2], ctx) : null;
    }
});

reg('coalesce', async (args, ctx) => {
    for (const arg of args) {
        const val = await evalArg(arg, ctx);
        if (val != null) return val;
    }
    return null;
});

reg('default', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('default operator requires 2 arguments (value, defaultValue)');
    }
    const [val, def] = await evalArgs(args, ctx);
    return val ?? def;
});

