# 🛠️ Utilities

Turing Property provides a rich set of utility functions for working with property trees.

---

## 📋 Quick Reference

| Module | Functions/Methods |
|--------|-------------------|
| **Traversal** | `traverse`, `findAll`, `findFirst` |
| **PropertyNode** | `countNodes()`, `maxDepth()`, `collectIds()`, `isDirty()`, `getModifiedFields()` |
| **Serialization** | `toJSON`, `toJSONString`, `fromJSON`, `parseJSON` |
| **Clone** | `clone`, `merge` |
| **Diff** | `diff` |
| **Schema** | `validateProperty`, `isValidProperty`, `assertValidProperty` |

---

## 🔍 Traversal

### traverse

Walk through all nodes in a property tree:

```typescript
import { traverse, PropertyNode } from 'turing-property';

const tree = new PropertyNode(myProperty);

traverse(tree, (node, path, depth) => {
    console.log(`${' '.repeat(depth * 2)}${node.id} at [${path.join('.')}]`);
});

// Output:
// root at []
//   section at [section]
//     name at [section.name]
//     email at [section.email]
//   status at [status]
```

Stop traversal early by returning `false`:

```typescript
traverse(tree, (node, path) => {
    if (node.id === 'target') {
        console.log('Found!');
        return false;  // Stop traversal
    }
});
```

### findAll

Find all nodes matching a predicate:

```typescript
import { findAll } from 'turing-property';

// Find all string-type nodes
const stringNodes = findAll(tree, (node) => node.type?.id === 'String');

// Find all nodes with constraints
const constrainedNodes = findAll(tree, (node) => 
    node.constraints && Object.keys(node.constraints).length > 0
);

// Result: [{ node: PropertyNode, path: string[] }, ...]
for (const { node, path } of stringNodes) {
    console.log(`Found ${node.id} at ${path.join('.')}`);
}
```

### findFirst

Find the first matching node:

```typescript
import { findFirst } from 'turing-property';

const targetNode = findFirst(tree, (node) => node.id === 'email');

if (targetNode) {
    console.log(`Node at path: ${targetNode.path.join('.')}`);
}
```

### countNodes (PropertyNode method)

Count total nodes in tree:

```typescript
const total = tree.countNodes();
console.log(`Tree has ${total} nodes`);
```

### maxDepth (PropertyNode method)

Get maximum tree depth:

```typescript
const depth = tree.maxDepth();
console.log(`Maximum depth: ${depth}`);
```

### collectIds (PropertyNode method)

Collect all node IDs:

```typescript
const ids = tree.collectIds();
// → ['root', 'section', 'name', 'email', 'status']
```

### Check for Duplicates

```typescript
// Using PropertyNode methods (built-in)
if (tree.hasDuplicateIds()) {
    const duplicates = tree.getDuplicateIds();
    console.log('Duplicate IDs:', duplicates);
}

// Collect all IDs
const allIds = tree.collectIds();
// → ['root', 'section', 'name', 'email', 'status']
```

---

## 📦 Serialization

### toJSON

Convert to plain JSON-serializable object:

```typescript
import { toJSON } from 'turing-property';

const plain = toJSON(tree);
// Handles cyclic references with $ref pointers
```

### toJSONString

Convert to JSON string:

```typescript
import { toJSONString } from 'turing-property';

// Compact
const compact = toJSONString(tree);

// Pretty printed
const pretty = toJSONString(tree, { pretty: true, indent: 2 });
```

### fromJSON

Import from JSON:

```typescript
import { fromJSON } from 'turing-property';

const result = fromJSON(jsonString);

if (result.valid) {
    const node = result.node!;
    node.setRegistry(defaultRegistry);
} else {
    console.log('Errors:', result.errors);
}
```

Options:

```typescript
const result = fromJSON(input, {
    validate: true,      // Validate structure
    throwOnError: false  // Return errors instead of throwing
});
```

### parseJSON

Quick parse with exception on error:

```typescript
import { parseJSON } from 'turing-property';

try {
    const node = parseJSON(jsonString);
    node.setRegistry(defaultRegistry);
} catch (err) {
    console.error('Parse error:', err.message);
}
```

---

## 📋 Clone & Merge

### clone

Deep clone a property:

```typescript
import { clone } from 'turing-property';

const copy = clone(original);
// Completely independent copy
```

### merge

Deep merge properties:

```typescript
import { merge } from 'turing-property';

const base = {
    id: 'root',
    type: TYPE,
    children: {
        name: { id: 'name', type: STRING, value: 'Default' }
    }
};

const overrides = {
    id: 'root',
    type: TYPE,
    children: {
        name: { id: 'name', type: STRING, value: 'Override' },
        email: { id: 'email', type: STRING, value: '' }
    }
};

const merged = merge(base, overrides);
// name.value = 'Override', email added
```

---

## 🔄 Diff

Compare two properties:

```typescript
import { diff } from 'turing-property';

const before = { id: 'root', type: TYPE, value: 'old' };
const after = { id: 'root', type: TYPE, value: 'new' };

const diffs = diff(before, after);
// [{ path: 'root.value', type: 'changed', oldValue: 'old', newValue: 'new' }]
```

Diff types:

| Type | Description |
|------|-------------|
| `added` | New property added |
| `removed` | Property removed |
| `changed` | Value changed |

```typescript
for (const d of diffs) {
    switch (d.type) {
        case 'added':
            console.log(`+ ${d.path}: ${d.newValue}`);
            break;
        case 'removed':
            console.log(`- ${d.path}: ${d.oldValue}`);
            break;
        case 'changed':
            console.log(`~ ${d.path}: ${d.oldValue} → ${d.newValue}`);
            break;
    }
}
```

---

## ✅ Schema Validation

### validateProperty

Validate a property structure:

```typescript
import { validateProperty } from 'turing-property';

const result = validateProperty(myProperty);

if (result.valid) {
    console.log('✓ Valid');
} else {
    for (const error of result.errors) {
        console.log(`✗ ${error.path}: ${error.message}`);
    }
}
```

### validatePropertyJSON

Validate from JSON string:

```typescript
import { validatePropertyJSON } from 'turing-property';

const result = validatePropertyJSON(jsonString);
```

### isValidProperty

Quick boolean check:

```typescript
import { isValidProperty } from 'turing-property';

if (isValidProperty(myProperty)) {
    // Safe to use
}
```

### assertValidProperty

Throw on invalid:

```typescript
import { assertValidProperty } from 'turing-property';

try {
    assertValidProperty(myProperty);
} catch (err) {
    // ValidationError with details
}
```

### Get Schema

```typescript
import { getPropertySchemaString, getAllSchemas } from 'turing-property';

// Get JSON Schema as string
const schemaJson = getPropertySchemaString(true);

// Get all schema definitions
const schemas = getAllSchemas();
```

---

## 📸 Snapshot (Built-in)

PropertyNode has built-in snapshot methods for extracting and setting values:

### Get Values (Nested)

```typescript
tree.setRegistry(defaultRegistry);

const values = await tree.snapshot();
// { personal: { name: 'John', email: 'john@test.com' }, status: 'active' }
```

### Get Values (Flat)

```typescript
const values = await tree.snapshotFlat();
// { 'personal.name': 'John', 'personal.email': 'john@test.com', 'status': 'active' }
```

### Set Values (Nested)

```typescript
tree.setFromSnapshot({
    personal: { name: 'Jane', email: 'jane@test.com' },
    status: 'inactive'
});
```

### Set Values (Flat)

```typescript
tree.setFromSnapshotFlat({
    'personal.name': 'Jane',
    'personal.email': 'jane@test.com',
    'status': 'inactive'
});
```

### Save & Restore Pattern

```typescript
// Save state
const savedState = await tree.snapshot();

// Make changes
tree.setValue('modified', ['status']);

// Restore previous state
tree.setFromSnapshot(savedState);
```

---

## 🎯 Common Patterns

### Collect Leaf Values

```typescript
async function collectLeafValues(tree: PropertyNode): Promise<Map<string, unknown>> {
    const values = new Map<string, unknown>();
    
    traverse(tree, async (node, path) => {
        if (Object.keys(node.children).length === 0 && node.value !== undefined) {
            const name = path.join('.');
            const value = await node.getValue();
            if (value !== null && value !== undefined) {
                values.set(name, value);
            }
        }
    });
    
    return values;
}
```

### Dirty Check (Built-in)

```typescript
// Check if any node is modified
if (tree.isDirty()) {
    console.log('Tree has unsaved changes');
}

// Check if a specific node is modified
if (tree.child('email').isDirtyNode()) {
    console.log('Email has been changed');
}
```

### Get Modified Fields (Built-in)

```typescript
// Get paths as arrays
const modifiedPaths = tree.getModifiedFields();
// → [['user', 'name'], ['status']]

// Get paths as dot-notation strings
const modifiedFlat = tree.getModifiedFieldsFlat();
// → ['user.name', 'status']
```

### Tree Statistics (Built-in)

```typescript
// Count total nodes
const total = tree.countNodes();
console.log(`Tree has ${total} nodes`);

// Get maximum depth
const depth = tree.maxDepth();
console.log(`Maximum depth: ${depth}`);
```

---

## 📚 Next Steps

- 🌳 [PropertyNode](./property-node.md) — Tree navigation and operations
- 🏷️ [Types](./types.md) — The type system
- 🧠 [Core Concepts](./core-concepts.md) — Property model fundamentals
- ✅ [Constraints](./constraints.md) — Validation system

