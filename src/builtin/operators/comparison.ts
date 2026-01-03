// ============================================================================
// COMPARISON OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('eq', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a === b;
});

reg('neq', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a !== b;
});

reg('gt', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) > (b as number);
});

reg('gte', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) >= (b as number);
});

reg('lt', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) < (b as number);
});

reg('lte', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) <= (b as number);
});

reg('between', async (args, ctx) => {
    const [val, min, max] = await evalArgs(args, ctx);
    return (val as number) >= (min as number) && (val as number) <= (max as number);
});

reg('inRange', async (args, ctx) => {
    const [val, min, max] = await evalArgs(args, ctx);
    return (val as number) >= (min as number) && (val as number) < (max as number);
});

