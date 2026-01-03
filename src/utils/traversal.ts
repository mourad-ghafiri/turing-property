// ============================================================================
// TRAVERSAL UTILITIES
// ============================================================================

import { PropertyNode } from '../core';

export type TraversalCallback = (node: PropertyNode, path: string[], depth: number) => void | boolean;

/**
 * Traverse all nodes in a property tree (depth-first)
 */
export function traverse(
    node: PropertyNode,
    callback: TraversalCallback,
    options: { includeMetadata?: boolean; includeConstraints?: boolean } = {}
): void {
    function walk(n: PropertyNode, path: string[], depth: number): boolean {
        const result = callback(n, path, depth);
        if (result === false) return false;

        for (const [key, child] of Object.entries(n.children)) {
            if (!walk(child, [...path, key], depth + 1)) return false;
        }

        return true;
    }

    walk(node, [], 0);
}

/**
 * Find all nodes matching a predicate
 */
export function findAll(
    node: PropertyNode,
    predicate: (node: PropertyNode, path: string[]) => boolean
): { node: PropertyNode; path: string[] }[] {
    const results: { node: PropertyNode; path: string[] }[] = [];

    traverse(node, (n, path) => {
        if (predicate(n, path)) {
            results.push({ node: n, path });
        }
    });

    return results;
}

/**
 * Find first node matching a predicate
 */
export function findFirst(
    node: PropertyNode,
    predicate: (node: PropertyNode, path: string[]) => boolean
): { node: PropertyNode; path: string[] } | null {
    let result: { node: PropertyNode; path: string[] } | null = null;

    traverse(node, (n, path) => {
        if (predicate(n, path)) {
            result = { node: n, path };
            return false;
        }
    });

    return result;
}

/**
 * Count all nodes
 */
export function countNodes(node: PropertyNode): number {
    let count = 0;
    traverse(node, () => { count++; });
    return count;
}

/**
 * Get maximum depth
 */
export function maxDepth(node: PropertyNode): number {
    let max = 0;
    traverse(node, (_, __, depth) => {
        if (depth > max) max = depth;
    });
    return max;
}

/**
 * Collect all IDs
 */
export function collectIds(node: PropertyNode): string[] {
    const ids: string[] = [];
    traverse(node, (n) => { ids.push(n.id); });
    return ids;
}

/**
 * Check for duplicate IDs
 */
export function hasDuplicateIds(node: PropertyNode): boolean {
    const ids = collectIds(node);
    return new Set(ids).size !== ids.length;
}

/**
 * Get duplicate IDs
 */
export function getDuplicateIds(node: PropertyNode): string[] {
    const ids = collectIds(node);
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const id of ids) {
        if (seen.has(id)) {
            duplicates.add(id);
        }
        seen.add(id);
    }

    return Array.from(duplicates);
}

