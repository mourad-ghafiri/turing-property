// ============================================================================
// DATE OPERATORS
// ============================================================================

import { reg, evalArgs } from './registry';

/** Parse a value to a valid Date, throws if invalid */
const toDate = (val: unknown): Date => {
    const d = new Date(val as string);
    if (isNaN(d.getTime())) {
        throw new Error(`Invalid date value: ${val}`);
    }
    return d;
};

/** Parse a value to Date, returns null if invalid (for validation operators) */
const tryParseDate = (val: unknown): Date | null => {
    if (val == null || String(val).trim() === '') return null;
    const d = new Date(val as string);
    return isNaN(d.getTime()) ? null : d;
};

reg('now', async () => new Date().toISOString());

reg('today', async () => new Date().toISOString().split('T')[0]);

reg('parseDate', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return toDate(val).toISOString();
});

reg('year', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return toDate(val).getFullYear();
});

reg('month', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return toDate(val).getMonth() + 1;
});

reg('day', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return toDate(val).getDate();
});

reg('dayOfWeek', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return toDate(val).getDay();
});

reg('age', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const birth = toDate(val);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

reg('dateDiff', async (args, ctx) => {
    const [date1, date2, unit] = await evalArgs(args, ctx);
    const d1 = toDate(date1);
    const d2 = toDate(date2);
    const diffMs = d2.getTime() - d1.getTime();

    switch (unit) {
        case 'days': return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'hours': return Math.floor(diffMs / (1000 * 60 * 60));
        case 'minutes': return Math.floor(diffMs / (1000 * 60));
        case 'seconds': return Math.floor(diffMs / 1000);
        case 'milliseconds': return diffMs;
        case 'years': return d2.getFullYear() - d1.getFullYear();
        case 'months': return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        default: throw new Error(`Unknown date unit: ${unit}`);
    }
});

reg('dateAdd', async (args, ctx) => {
    const [date, amount, unit] = await evalArgs(args, ctx);
    const d = toDate(date);
    const n = amount as number;

    switch (unit) {
        case 'days': d.setDate(d.getDate() + n); break;
        case 'months': d.setMonth(d.getMonth() + n); break;
        case 'years': d.setFullYear(d.getFullYear() + n); break;
        case 'hours': d.setHours(d.getHours() + n); break;
        case 'minutes': d.setMinutes(d.getMinutes() + n); break;
        case 'seconds': d.setSeconds(d.getSeconds() + n); break;
        case 'milliseconds': d.setMilliseconds(d.getMilliseconds() + n); break;
        default: throw new Error(`Unknown date unit: ${unit}`);
    }

    return d.toISOString();
});

reg('dateSub', async (args, ctx) => {
    const [date, amount, unit] = await evalArgs(args, ctx);
    const d = toDate(date);
    const n = amount as number;

    switch (unit) {
        case 'days': d.setDate(d.getDate() - n); break;
        case 'months': d.setMonth(d.getMonth() - n); break;
        case 'years': d.setFullYear(d.getFullYear() - n); break;
        case 'hours': d.setHours(d.getHours() - n); break;
        case 'minutes': d.setMinutes(d.getMinutes() - n); break;
        case 'seconds': d.setSeconds(d.getSeconds() - n); break;
        case 'milliseconds': d.setMilliseconds(d.getMilliseconds() - n); break;
        default: throw new Error(`Unknown date unit: ${unit}`);
    }

    return d.toISOString();
});

reg('isFuture', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const d = tryParseDate(val);
    if (!d) return true;
    return d > new Date();
});

reg('isPast', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const d = tryParseDate(val);
    if (!d) return true;
    return d < new Date();
});

reg('isToday', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const d = tryParseDate(val);
    if (!d) return true;
    const today = new Date();
    return d.toDateString() === today.toDateString();
});

reg('isWeekday', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const d = tryParseDate(val);
    if (!d) return true;
    const day = d.getDay();
    return day >= 1 && day <= 5;
});

reg('isWeekend', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    const d = tryParseDate(val);
    if (!d) return true;
    const day = d.getDay();
    return day === 0 || day === 6;
});

reg('isBefore', async (args, ctx) => {
    const [date1, date2] = await evalArgs(args, ctx);
    return toDate(date1) < toDate(date2);
});

reg('isAfter', async (args, ctx) => {
    const [date1, date2] = await evalArgs(args, ctx);
    return toDate(date1) > toDate(date2);
});

