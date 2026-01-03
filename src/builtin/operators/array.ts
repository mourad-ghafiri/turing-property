// ============================================================================
// ARRAY OPERATORS
// ============================================================================

import { reg, evalArg, evalArgs, createLoopContext, evaluate } from './registry';

reg('len', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.length;
    if (typeof arr === 'string') return arr.length;
    return 0;
});

reg('at', async (args, ctx) => {
    const [arr, idx] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr[idx as number];
    return undefined;
});

reg('first', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr[0];
    return undefined;
});

reg('last', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr[arr.length - 1];
    return undefined;
});

reg('slice', async (args, ctx) => {
    const [arr, start, end] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.slice(start as number, end as number);
    return [];
});

reg('reverse', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return [...arr].reverse();
    return [];
});

reg('unique', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return [...new Set(arr)];
    return [];
});

reg('flatten', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.flat();
    return [];
});

reg('compact', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.filter(v => v != null);
    return [];
});

reg('contains', async (args, ctx) => {
    const [arr, val] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.includes(val);
    return false;
});

reg('containsAll', async (args, ctx) => {
    const [arr, vals] = await evalArgs(args, ctx);
    if (!Array.isArray(arr) || !Array.isArray(vals)) return false;
    return vals.every(v => arr.includes(v));
});

reg('containsAny', async (args, ctx) => {
    const [arr, vals] = await evalArgs(args, ctx);
    if (!Array.isArray(arr) || !Array.isArray(vals)) return false;
    return vals.some(v => arr.includes(v));
});

reg('sort', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return [...arr].sort();
    return [];
});

reg('sortBy', async (args, ctx) => {
    const [arr, key] = await evalArgs(args, ctx);
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
        const va = (a as Record<string, unknown>)[key as string];
        const vb = (b as Record<string, unknown>)[key as string];
        if (String(va) < String(vb)) return -1;
        if (String(va) > String(vb)) return 1;
        return 0;
    });
});

reg('groupBy', async (args, ctx) => {
    const [arr, key] = await evalArgs(args, ctx);
    if (!Array.isArray(arr)) return {};
    const result: Record<string, unknown[]> = {};
    for (const item of arr) {
        const k = String((item as Record<string, unknown>)[key as string] ?? '');
        if (!result[k]) result[k] = [];
        result[k].push(item);
    }
    return result;
});

reg('range', async (args, ctx) => {
    const [start, end, step = 1] = await evalArgs(args, ctx);
    const result: number[] = [];
    for (let i = start as number; i < (end as number); i += step as number) {
        result.push(i);
    }
    return result;
});

reg('push', async (args, ctx) => {
    const [arr, ...items] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return [...arr, ...items];
    return items;
});

reg('pop', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (Array.isArray(arr)) return arr.slice(0, -1);
    return [];
});

// Higher-order array operators

reg('map', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('map operator requires 2 arguments (array, expression)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return [];

    const mapExpr = args[1]!;
    const result: unknown[] = new Array(arr.length);

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.item = arr[i];
        bindings.index = i;
        result[i] = await evaluate(mapExpr, loopCtx);
    }

    return result;
});

reg('filter', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('filter operator requires 2 arguments (array, predicate)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return [];

    const filterExpr = args[1]!;
    const result: unknown[] = [];

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.item = arr[i];
        bindings.index = i;
        if (await evaluate(filterExpr, loopCtx)) {
            result.push(arr[i]);
        }
    }

    return result;
});

reg('reduce', async (args, ctx) => {
    if (args.length < 3) {
        throw new Error('reduce operator requires 3 arguments (array, expression, initialValue)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return await evalArg(args[2]!, ctx);

    const reduceExpr = args[1]!;
    let acc = await evalArg(args[2]!, ctx);

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.acc = acc;
        bindings.item = arr[i];
        bindings.index = i;
        acc = await evaluate(reduceExpr, loopCtx);
    }

    return acc;
});

reg('find', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('find operator requires 2 arguments (array, predicate)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return undefined;

    const findExpr = args[1]!;

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.item = arr[i];
        bindings.index = i;
        if (await evaluate(findExpr, loopCtx)) {
            return arr[i];
        }
    }

    return undefined;
});

reg('every', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('every operator requires 2 arguments (array, predicate)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return true;

    const everyExpr = args[1]!;

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.item = arr[i];
        bindings.index = i;
        if (!await evaluate(everyExpr, loopCtx)) {
            return false;
        }
    }

    return true;
});

reg('some', async (args, ctx) => {
    if (args.length < 2) {
        throw new Error('some operator requires 2 arguments (array, predicate)');
    }
    const arr = await evalArg(args[0]!, ctx);
    if (!Array.isArray(arr)) return false;

    const someExpr = args[1]!;

    // Create reusable loop context
    const { loopCtx, bindings } = createLoopContext(ctx);

    for (let i = 0; i < arr.length; i++) {
        bindings.item = arr[i];
        bindings.index = i;
        if (await evaluate(someExpr, loopCtx)) {
            return true;
        }
    }

    return false;
});

