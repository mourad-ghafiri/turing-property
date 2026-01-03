import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { Property } from '../../src/core/property';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';
import { REQUIRED, MIN_LENGTH, MAX_LENGTH, MIN, MAX, EMAIL, PATTERN } from '../../src/builtin/constraints';
import { checkConstraintsDeep } from '../../src/builtin/constraints';
import { label, hint, visible } from '../../src/builtin/metadata';

// ============================================================================
// HELPER: Generate large form structures
// ============================================================================

function generateFields(count: number, withConstraints = false, withMetadata = false): Record<string, Property> {
    const fields: Record<string, Property> = {};

    for (let i = 0; i < count; i++) {
        const field: Property = {
            id: `field_${i}`,
            type: i % 3 === 0 ? NUMBER : STRING,
            value: i % 3 === 0 ? i : `value_${i}`,
            defaultValue: i % 3 === 0 ? 0 : ''
        };

        if (withConstraints) {
            field.constraints = {
                required: REQUIRED
            };
            if (i % 3 === 0) {
                field.constraints.min = MIN(0);
                field.constraints.max = MAX(1000);
            } else {
                field.constraints.minLength = MIN_LENGTH(1);
                field.constraints.maxLength = MAX_LENGTH(100);
            }
        }

        if (withMetadata) {
            field.metadata = {
                label: label(`Field ${i}`),
                hint: hint(`Enter value for field ${i}`)
            };
        }

        fields[`field_${i}`] = field;
    }

    return fields;
}

function generateSections(sectionCount: number, fieldsPerSection: number): Record<string, Property> {
    const sections: Record<string, Property> = {};

    for (let s = 0; s < sectionCount; s++) {
        sections[`section_${s}`] = {
            id: `section_${s}`,
            type: TYPE,
            children: generateFields(fieldsPerSection)
        };
    }

    return sections;
}

function generateDeepNesting(depth: number, breadth: number): Property {
    if (depth === 0) {
        return {
            id: `leaf_${Math.random().toString(36).substring(7)}`,
            type: STRING,
            value: 'leaf'
        };
    }

    const children: Record<string, Property> = {};
    for (let i = 0; i < breadth; i++) {
        children[`child_${i}`] = generateDeepNesting(depth - 1, breadth);
    }

    return {
        id: `node_${depth}`,
        type: TYPE,
        children
    };
}

// ============================================================================
// BENCHMARKS: Large Form Creation
// ============================================================================

describe('Benchmark: Large Form Creation', () => {
    const sizes = [100, 500, 1000];

    sizes.forEach(size => {
        it(`should create form with ${size} flat fields`, () => {
            const start = performance.now();

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const elapsed = performance.now() - start;

            expect(form.childKeys.length).toBe(size);
            console.log(`  ${size} flat fields: ${elapsed.toFixed(2)}ms`);
        });

        it(`should create form with ${size} fields + constraints`, () => {
            const start = performance.now();

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size, true)
            });

            const elapsed = performance.now() - start;

            expect(form.childKeys.length).toBe(size);
            console.log(`  ${size} fields + constraints: ${elapsed.toFixed(2)}ms`);
        });

        it(`should create form with ${size} fields + constraints + metadata`, () => {
            const start = performance.now();

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size, true, true)
            });

            const elapsed = performance.now() - start;

            expect(form.childKeys.length).toBe(size);
            console.log(`  ${size} fields + constraints + metadata: ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Sectioned Forms
// ============================================================================

describe('Benchmark: Sectioned Forms', () => {
    const configurations = [
        { sections: 10, fields: 10 },   // 100 total
        { sections: 10, fields: 50 },   // 500 total
        { sections: 20, fields: 50 },   // 1000 total
        { sections: 50, fields: 20 },   // 1000 total (more sections, fewer fields each)
    ];

    configurations.forEach(({ sections, fields }) => {
        const total = sections * fields;

        it(`should create ${sections} sections x ${fields} fields = ${total} total`, () => {
            const start = performance.now();

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateSections(sections, fields)
            });

            const elapsed = performance.now() - start;

            expect(form.childKeys.length).toBe(sections);
            console.log(`  ${sections} sections x ${fields} fields: ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Deep Nesting
// ============================================================================

describe('Benchmark: Deep Nesting', () => {
    const configurations = [
        { depth: 5, breadth: 3 },   // 3^5 = 243 nodes
        { depth: 6, breadth: 3 },   // 3^6 = 729 nodes
        { depth: 4, breadth: 5 },   // 5^4 = 625 nodes
        { depth: 8, breadth: 2 },   // 2^8 = 256 nodes (deep but narrow)
        { depth: 10, breadth: 2 },  // 2^10 = 1024 nodes (very deep)
    ];

    configurations.forEach(({ depth, breadth }) => {
        const approxNodes = Math.pow(breadth, depth);

        it(`should create tree depth=${depth}, breadth=${breadth} (~${approxNodes} nodes)`, () => {
            const start = performance.now();

            const tree = new PropertyNode(generateDeepNesting(depth, breadth));

            const elapsed = performance.now() - start;
            const actualNodes = tree.countNodes();

            console.log(`  depth=${depth}, breadth=${breadth}: ${elapsed.toFixed(2)}ms (${actualNodes} nodes)`);
            expect(actualNodes).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// BENCHMARKS: Tree Traversal on Large Forms
// ============================================================================

describe('Benchmark: Tree Traversal', () => {
    const sizes = [100, 500, 1000];

    sizes.forEach(size => {
        it(`should traverse ${size} fields and count nodes`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            const count = form.countNodes();
            const elapsed = performance.now() - start;

            expect(count).toBe(size + 1); // fields + root
            console.log(`  countNodes (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should get max depth for ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            const depth = form.maxDepth();
            const elapsed = performance.now() - start;

            expect(depth).toBe(1);
            console.log(`  maxDepth (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should collect all IDs from ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            const ids = form.collectIds();
            const elapsed = performance.now() - start;

            expect(ids.length).toBe(size + 1);
            console.log(`  collectIds (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should get descendants from ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            const descendants = form.descendants();
            const elapsed = performance.now() - start;

            expect(descendants.length).toBe(size);
            console.log(`  descendants (${size} fields): ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Snapshot Operations
// ============================================================================

describe('Benchmark: Snapshot Operations', () => {
    const sizes = [100, 500, 1000];

    sizes.forEach(size => {
        it(`should snapshot ${size} fields (nested)`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const snapshot = await form.snapshot();
            const elapsed = performance.now() - start;

            expect(Object.keys(snapshot).length).toBe(size);
            console.log(`  snapshot nested (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should snapshot ${size} fields (flat)`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const snapshot = await form.snapshotFlat();
            const elapsed = performance.now() - start;

            expect(Object.keys(snapshot).length).toBe(size);
            console.log(`  snapshot flat (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should setFromSnapshot for ${size} fields`, async () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });
            form.setRegistry(defaultRegistry);

            const snapshot = await form.snapshot();

            const start = performance.now();
            form.setFromSnapshot(snapshot);
            const elapsed = performance.now() - start;

            console.log(`  setFromSnapshot (${size} fields): ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Reset Operations
// ============================================================================

describe('Benchmark: Reset Operations', () => {
    const sizes = [100, 500, 1000];

    sizes.forEach(size => {
        it(`should resetDeep for ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            form.resetDeep();
            const elapsed = performance.now() - start;

            console.log(`  resetDeep (${size} fields): ${elapsed.toFixed(2)}ms`);
        });

        it(`should resetModified for ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            // Modify half the fields
            for (let i = 0; i < size / 2; i++) {
                form.setValue(`modified_${i}`, [`field_${i}`]);
            }

            const start = performance.now();
            form.resetModified();
            const elapsed = performance.now() - start;

            console.log(`  resetModified (${size} fields, ${size / 2} modified): ${elapsed.toFixed(2)}ms`);
        });

        it(`should clearAll for ${size} fields`, () => {
            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: generateFields(size)
            });

            const start = performance.now();
            form.clearAll();
            const elapsed = performance.now() - start;

            console.log(`  clearAll (${size} fields): ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Dirty Check Operations
// ============================================================================

describe('Benchmark: Dirty Check', () => {
    const sizes = [100, 500, 1000];

    sizes.forEach(size => {
        it(`should check isDirty for ${size} fields (no modifications)`, () => {
            // Create fields where value equals defaultValue (clean state)
            const fields: Record<string, Property> = {};
            for (let i = 0; i < size; i++) {
                fields[`field_${i}`] = {
                    id: `field_${i}`,
                    type: STRING,
                    value: '',
                    defaultValue: ''
                };
            }

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: fields
            });

            const start = performance.now();
            const isDirty = form.isDirty();
            const elapsed = performance.now() - start;

            expect(isDirty).toBe(false);
            console.log(`  isDirty (${size} fields, clean): ${elapsed.toFixed(2)}ms`);
        });

        it(`should check isDirty for ${size} fields (with modifications)`, () => {
            const fields = generateFields(size);
            // Add default values to all fields
            for (const key in fields) {
                fields[key].defaultValue = fields[key].value;
            }
            // Modify half the fields
            let count = 0;
            for (const key in fields) {
                if (count >= size / 2) break;
                fields[key].value = 'modified';
                count++;
            }

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: fields
            });

            const start = performance.now();
            const isDirty = form.isDirty();
            const elapsed = performance.now() - start;

            expect(isDirty).toBe(true);
            console.log(`  isDirty (${size} fields, ${size / 2} modified): ${elapsed.toFixed(2)}ms`);
        });

        it(`should getModifiedFields for ${size} fields`, () => {
            const fields = generateFields(size);
            for (const key in fields) {
                fields[key].defaultValue = fields[key].value;
            }
            let count = 0;
            for (const key in fields) {
                if (count >= size / 2) break;
                fields[key].value = 'modified';
                count++;
            }

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: fields
            });

            const start = performance.now();
            const modified = form.getModifiedFields();
            const elapsed = performance.now() - start;

            expect(modified.length).toBe(size / 2);
            console.log(`  getModifiedFields (${size} fields): ${elapsed.toFixed(2)}ms`);
        });
    });
});
