// ============================================================================
// ARITHMETIC OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

/** Convert value to number with validation */
const toNumber = (val: unknown, operatorName: string): number => {
    if (typeof val === 'number') return val;
    const n = Number(val);
    if (isNaN(n)) {
        throw new Error(`${operatorName}: expected number, got ${typeof val} (${val})`);
    }
    return n;
};

reg('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return toNumber(a, 'add') + toNumber(b, 'add');
});

reg('sub', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return toNumber(a, 'sub') - toNumber(b, 'sub');
});

reg('mul', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return toNumber(a, 'mul') * toNumber(b, 'mul');
});

reg('div', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    const divisor = toNumber(b, 'div');
    if (divisor === 0) return Infinity;
    return toNumber(a, 'div') / divisor;
});

reg('mod', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return toNumber(a, 'mod') % toNumber(b, 'mod');
});

reg('pow', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return Math.pow(toNumber(a, 'pow'), toNumber(b, 'pow'));
});

reg('sqrt', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return Math.sqrt(toNumber(a, 'sqrt'));
});

reg('abs', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return Math.abs(toNumber(a, 'abs'));
});

reg('ceil', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return Math.ceil(toNumber(a, 'ceil'));
});

reg('floor', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return Math.floor(toNumber(a, 'floor'));
});

reg('round', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return Math.round(toNumber(a, 'round'));
});

reg('min', async (args, ctx) => {
    const vals = await evalArgs(args, ctx);
    if (vals.length === 0) return Infinity;
    return Math.min(...vals.map(v => toNumber(v, 'min')));
});

reg('max', async (args, ctx) => {
    const vals = await evalArgs(args, ctx);
    if (vals.length === 0) return -Infinity;
    return Math.max(...vals.map(v => toNumber(v, 'max')));
});

reg('sum', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum: number, v: unknown) => sum + toNumber(v, 'sum'), 0);
});

reg('avg', async (args, ctx) => {
    const [arr] = await evalArgs(args, ctx);
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const sum = arr.reduce((s: number, v: unknown) => s + toNumber(v, 'avg'), 0);
    return sum / arr.length;
});

reg('clamp', async (args, ctx) => {
    const [val, min, max] = await evalArgs(args, ctx);
    return Math.min(Math.max(toNumber(val, 'clamp'), toNumber(min, 'clamp')), toNumber(max, 'clamp'));
});

reg('neg', async (args, ctx) => {
    const [a] = await evalArgs(args, ctx);
    return -toNumber(a, 'neg');
});

