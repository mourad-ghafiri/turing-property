import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { 
    traverse, 
    findAll, 
    findFirst, 
    countNodes, 
    maxDepth,
    collectIds,
    hasDuplicateIds,
    getDuplicateIds
} from '../../src/utils/traversal';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';

describe('traverse', () => {
    it('should visit all nodes', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { id: 'b', type: STRING, value: '' }
            }
        });

        const visited: string[] = [];
        traverse(root, (node) => {
            visited.push(node.id);
        });

        expect(visited).toContain('root');
        expect(visited).toContain('a');
        expect(visited).toContain('b');
        expect(visited).toHaveLength(3);
    });

    it('should provide correct path', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                section: {
                    id: 'section',
                    type: TYPE,
                    children: {
                        field: { id: 'field', type: STRING, value: '' }
                    }
                }
            }
        });

        const paths: { id: string; path: string[] }[] = [];
        traverse(root, (node, path) => {
            paths.push({ id: node.id, path });
        });

        expect(paths.find(p => p.id === 'root')?.path).toEqual([]);
        expect(paths.find(p => p.id === 'section')?.path).toEqual(['section']);
        expect(paths.find(p => p.id === 'field')?.path).toEqual(['section', 'field']);
    });

    it('should provide correct depth', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                level1: {
                    id: 'level1',
                    type: TYPE,
                    children: {
                        level2: { id: 'level2', type: STRING, value: '' }
                    }
                }
            }
        });

        const depths: { id: string; depth: number }[] = [];
        traverse(root, (node, _, depth) => {
            depths.push({ id: node.id, depth });
        });

        expect(depths.find(d => d.id === 'root')?.depth).toBe(0);
        expect(depths.find(d => d.id === 'level1')?.depth).toBe(1);
        expect(depths.find(d => d.id === 'level2')?.depth).toBe(2);
    });

    it('should stop traversal when callback returns false', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { id: 'b', type: STRING, value: '' },
                c: { id: 'c', type: STRING, value: '' }
            }
        });

        const visited: string[] = [];
        traverse(root, (node) => {
            visited.push(node.id);
            if (node.id === 'a') return false;
        });

        expect(visited).toContain('root');
        expect(visited).toContain('a');
        expect(visited).not.toContain('b');
        expect(visited).not.toContain('c');
    });
});

describe('findAll', () => {
    it('should find all nodes matching predicate', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: '' },
                age: { id: 'age', type: NUMBER, value: 0 },
                email: { id: 'email', type: STRING, value: '' }
            }
        });

        const stringNodes = findAll(root, (node) => node.type === STRING);
        
        expect(stringNodes).toHaveLength(2);
        expect(stringNodes.map(r => r.node.id)).toContain('name');
        expect(stringNodes.map(r => r.node.id)).toContain('email');
    });

    it('should include path in results', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                section: {
                    id: 'section',
                    type: TYPE,
                    children: {
                        target: { id: 'target', type: STRING, value: '' }
                    }
                }
            }
        });

        const results = findAll(root, (node) => node.id === 'target');
        
        expect(results).toHaveLength(1);
        expect(results[0].path).toEqual(['section', 'target']);
    });

    it('should return empty array when no matches', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {}
        });

        const results = findAll(root, () => false);
        expect(results).toHaveLength(0);
    });
});

describe('findFirst', () => {
    it('should find first matching node', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { id: 'b', type: STRING, value: '' }
            }
        });

        const result = findFirst(root, (node) => node.type === STRING);
        
        expect(result).not.toBeNull();
        expect(result?.node.type).toBe(STRING);
    });

    it('should return null when no match', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {}
        });

        const result = findFirst(root, () => false);
        expect(result).toBeNull();
    });
});

describe('countNodes', () => {
    it('should count all nodes', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { 
                    id: 'b', 
                    type: TYPE,
                    children: {
                        c: { id: 'c', type: STRING, value: '' }
                    }
                }
            }
        });

        expect(countNodes(root)).toBe(4);
    });

    it('should return 1 for single node', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE
        });

        expect(countNodes(root)).toBe(1);
    });
});

describe('maxDepth', () => {
    it('should return 0 for single node', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE
        });

        expect(maxDepth(root)).toBe(0);
    });

    it('should return correct max depth', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                level1: {
                    id: 'level1',
                    type: TYPE,
                    children: {
                        level2: {
                            id: 'level2',
                            type: TYPE,
                            children: {
                                level3: { id: 'level3', type: STRING, value: '' }
                            }
                        }
                    }
                }
            }
        });

        expect(maxDepth(root)).toBe(3);
    });
});

describe('collectIds', () => {
    it('should collect all ids', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { id: 'b', type: STRING, value: '' }
            }
        });

        const ids = collectIds(root);
        
        expect(ids).toContain('root');
        expect(ids).toContain('a');
        expect(ids).toContain('b');
        expect(ids).toHaveLength(3);
    });
});

describe('hasDuplicateIds', () => {
    it('should return false when no duplicates', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' },
                b: { id: 'b', type: STRING, value: '' }
            }
        });

        expect(hasDuplicateIds(root)).toBe(false);
    });

    it('should return true when duplicates exist', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'dup', type: STRING, value: '' },
                b: { id: 'dup', type: STRING, value: '' }
            }
        });

        expect(hasDuplicateIds(root)).toBe(true);
    });
});

describe('getDuplicateIds', () => {
    it('should return empty array when no duplicates', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'a', type: STRING, value: '' }
            }
        });

        expect(getDuplicateIds(root)).toHaveLength(0);
    });

    it('should return duplicate ids', () => {
        const root = new PropertyNode({
            id: 'root',
            type: TYPE,
            children: {
                a: { id: 'dup', type: STRING, value: '' },
                b: { id: 'dup', type: STRING, value: '' },
                c: { id: 'unique', type: STRING, value: '' }
            }
        });

        const dups = getDuplicateIds(root);
        expect(dups).toContain('dup');
        expect(dups).not.toContain('unique');
    });
});

