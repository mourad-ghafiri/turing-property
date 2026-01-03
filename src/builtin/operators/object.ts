// ============================================================================
// OBJECT OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('get', async (args, ctx) => {
    const [obj, key] = await evalArgs(args, ctx);
    if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[key as string];
    }
    return undefined;
});

reg('keys', async (args, ctx) => {
    const [obj] = await evalArgs(args, ctx);
    if (obj && typeof obj === 'object') {
        return Object.keys(obj as object);
    }
    return [];
});

reg('values', async (args, ctx) => {
    const [obj] = await evalArgs(args, ctx);
    if (obj && typeof obj === 'object') {
        return Object.values(obj as object);
    }
    return [];
});

reg('entries', async (args, ctx) => {
    const [obj] = await evalArgs(args, ctx);
    if (obj && typeof obj === 'object') {
        return Object.entries(obj as object);
    }
    return [];
});

reg('has', async (args, ctx) => {
    const [obj, key] = await evalArgs(args, ctx);
    if (obj && typeof obj === 'object') {
        return key as string in (obj as object);
    }
    return false;
});

reg('merge', async (args, ctx) => {
    const objs = await evalArgs(args, ctx);
    return Object.assign({}, ...objs.filter(o => o && typeof o === 'object'));
});

