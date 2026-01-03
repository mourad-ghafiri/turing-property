// ============================================================================
// STRING OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

reg('concat', async (args, ctx) => {
    const vals = await evalArgs(args, ctx);
    return vals.map(v => String(v ?? '')).join('');
});

reg('upper', async (args, ctx) => {
    const [s] = await evalArgs(args, ctx);
    return String(s ?? '').toUpperCase();
});

reg('lower', async (args, ctx) => {
    const [s] = await evalArgs(args, ctx);
    return String(s ?? '').toLowerCase();
});

reg('trim', async (args, ctx) => {
    const [s] = await evalArgs(args, ctx);
    return String(s ?? '').trim();
});

reg('strlen', async (args, ctx) => {
    const [s] = await evalArgs(args, ctx);
    return String(s ?? '').length;
});

reg('substr', async (args, ctx) => {
    const [s, start, len] = await evalArgs(args, ctx);
    const str = String(s ?? '');
    const startIdx = start as number;
    const length = len as number;
    return str.slice(startIdx, startIdx + length);
});

reg('replace', async (args, ctx) => {
    const [s, search, replace] = await evalArgs(args, ctx);
    return String(s ?? '').replace(String(search), String(replace));
});

reg('replaceAll', async (args, ctx) => {
    const [s, search, replace] = await evalArgs(args, ctx);
    return String(s ?? '').split(String(search)).join(String(replace));
});

reg('split', async (args, ctx) => {
    const [s, sep] = await evalArgs(args, ctx);
    return String(s ?? '').split(String(sep));
});

reg('join', async (args, ctx) => {
    const [arr, sep] = await evalArgs(args, ctx);
    if (!Array.isArray(arr)) return '';
    return arr.join(String(sep ?? ','));
});

reg('startsWith', async (args, ctx) => {
    const [s, prefix] = await evalArgs(args, ctx);
    return String(s ?? '').startsWith(String(prefix));
});

reg('endsWith', async (args, ctx) => {
    const [s, suffix] = await evalArgs(args, ctx);
    return String(s ?? '').endsWith(String(suffix));
});

reg('includes', async (args, ctx) => {
    const [s, search] = await evalArgs(args, ctx);
    return String(s ?? '').includes(String(search));
});

reg('matches', async (args, ctx) => {
    const [s, pattern] = await evalArgs(args, ctx);
    try {
        const regex = new RegExp(String(pattern));
        return regex.test(String(s ?? ''));
    } catch (e) {
        throw new Error(`matches: invalid regex pattern "${pattern}": ${e instanceof Error ? e.message : String(e)}`);
    }
});

reg('padStart', async (args, ctx) => {
    const [s, len, char] = await evalArgs(args, ctx);
    return String(s ?? '').padStart(len as number, String(char ?? ' '));
});

reg('padEnd', async (args, ctx) => {
    const [s, len, char] = await evalArgs(args, ctx);
    return String(s ?? '').padEnd(len as number, String(char ?? ' '));
});

reg('charAt', async (args, ctx) => {
    const [s, idx] = await evalArgs(args, ctx);
    return String(s ?? '').charAt(idx as number);
});

reg('indexOf', async (args, ctx) => {
    const [s, search] = await evalArgs(args, ctx);
    return String(s ?? '').indexOf(String(search));
});

reg('capitalize', async (args, ctx) => {
    const [s] = await evalArgs(args, ctx);
    const str = String(s ?? '');
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
});

reg('toString', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return String(val ?? '');
});

