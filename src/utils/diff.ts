// ============================================================================
// DIFF UTILITIES
// ============================================================================

import { Property } from '../core';

export interface DiffResult {
    path: string;
    type: 'added' | 'removed' | 'changed';
    oldValue?: unknown;
    newValue?: unknown;
}

/**
 * Safe stringify that handles cyclic structures
 */
function safeStringify(obj: unknown, seen = new WeakSet()): string {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    
    if (seen.has(obj as object)) {
        return '"[Circular]"';
    }
    seen.add(obj as object);
    
    if (Array.isArray(obj)) {
        return '[' + obj.map(v => safeStringify(v, seen)).join(',') + ']';
    }
    
    const keys = Object.keys(obj).sort();
    const pairs = keys.map(k => `"${k}":${safeStringify((obj as Record<string, unknown>)[k], seen)}`);
    return '{' + pairs.join(',') + '}';
}

/**
 * Compare two Properties
 */
export function diff(a: Property, b: Property, path: string = ''): DiffResult[] {
    const diffs: DiffResult[] = [];
    const currentPath = path || a.id;

    if (a.id !== b.id) {
        diffs.push({ path: `${currentPath}.id`, type: 'changed', oldValue: a.id, newValue: b.id });
    }

    const aValue = safeStringify(a.value);
    const bValue = safeStringify(b.value);
    if (aValue !== bValue) {
        diffs.push({ path: `${currentPath}.value`, type: 'changed', oldValue: a.value, newValue: b.value });
    }

    // Compare types by id to avoid cyclic reference issues
    const aTypeId = a.type?.id;
    const bTypeId = b.type?.id;
    if (aTypeId !== bTypeId) {
        diffs.push({ path: `${currentPath}.type`, type: 'changed', oldValue: a.type, newValue: b.type });
    }

    const aChildren = a.children || {};
    const bChildren = b.children || {};
    const allChildKeys = new Set([...Object.keys(aChildren), ...Object.keys(bChildren)]);

    for (const key of allChildKeys) {
        const aChild = aChildren[key];
        const bChild = bChildren[key];

        if (!aChild && bChild) {
            diffs.push({ path: `${currentPath}.children.${key}`, type: 'added', newValue: bChild });
        } else if (aChild && !bChild) {
            diffs.push({ path: `${currentPath}.children.${key}`, type: 'removed', oldValue: aChild });
        } else if (aChild && bChild) {
            diffs.push(...diff(aChild, bChild, `${currentPath}.children.${key}`));
        }
    }

    return diffs;
}

