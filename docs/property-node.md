# 🌳 PropertyNode

`PropertyNode` is the core wrapper class for working with Property trees. It provides navigation, value evaluation, mutations, and serialization capabilities.

---

## 🎯 Overview

While `Property` is the raw data structure, `PropertyNode` is the **live wrapper** that:
- Maintains parent/child relationships
- Provides tree navigation methods
- Evaluates expressions
- Handles mutations
- Supports reset operations
- Enables serialization

---

## 📦 Creating a PropertyNode

### From Raw Property

```typescript
import { PropertyNode } from 'turing-property';

const tree = new PropertyNode({
    id: 'root',
    type: TYPE,
    children: {
        name: { id: 'name', type: STRING, value: '' },
        email: { id: 'email', type: STRING, value: '' }
    }
});
```

### Using Static Factory

```typescript
const node = PropertyNode.from({
    id: 'test',
    type: STRING,
    value: 'hello'
});
```

### Setting Registry for Evaluation

Before calling any evaluation methods, set the operator registry:

```typescript
import { defaultRegistry } from 'turing-property';

tree.setRegistry(defaultRegistry);
```

---

## 🧭 Tree Navigation

### Parent & Root

```typescript
const tree = new PropertyNode({
    id: 'root',
    type: TYPE,
    children: {
        personal: {
            id: 'personal',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: 'John' }
            }
        }
    }
});

const name = tree.children.personal.children.name;

// Get parent
name.parent;  // → personal PropertyNode

// Get root
name.root;    // → root PropertyNode
```

### Child Access

```typescript
// Direct access
tree.children.personal;

// Using child() method
tree.child('personal');  // → PropertyNode | undefined

// Using getByPath()
tree.getByPath(['personal', 'name']);  // → PropertyNode | undefined
```

### Path

```typescript
const name = tree.getByPath(['personal', 'name']);
name.path();  // → ['personal', 'name']
```

### Traversal

```typescript
// Get all descendants (depth-first)
const descendants = tree.descendants();
// → [personal, name, ...]

// Get all ancestors (from node to root)
const ancestors = name.ancestors();
// → [personal, root]

// Get siblings
const siblings = name.siblings();
// → Other children of personal
```

---

## 📊 Value Operations

### Get Value

```typescript
tree.setRegistry(defaultRegistry);

// Get value of current node
const value = await tree.getValue();

// Get value by path
const name = await tree.getValue(['personal', 'name']);
// → 'John'
```

### Set Value

```typescript
// Set value directly
tree.setValue('Jane', ['personal', 'name']);

// Set value on current node
tree.children.personal.children.name.setValue('Jane');
```

### Expression Values

If a property's value is an expression, `getValue()` evaluates it:

```typescript
const greeting = new PropertyNode({
    id: 'greeting',
    type: STRING,
    value: {
        id: 'concat',
        type: OP,
        value: 'concat',
        children: {
            arg0: { id: 'arg0', type: LIT, value: 'Hello, ' },
            arg1: { id: 'arg1', type: REF, value: ['root', 'children', 'name', 'value'] }
        }
    }
});

greeting.setRegistry(defaultRegistry);
const result = await greeting.getValue();
// → 'Hello, John'
```

### Set Expression Value

```typescript
import { lit, op, ref } from 'turing-property';

tree.setValueExpr(
    op('concat', lit('Hello, '), ref(['parent', 'children', 'name', 'value'])),
    ['greeting']
);
```

---

## 📸 Snapshot: Collecting Values

PropertyNode has built-in methods to extract all values as key-value objects:

### Nested Snapshot

Get values as a nested object structure:

```typescript
tree.setRegistry(defaultRegistry);

const values = await tree.snapshot();
// → { personal: { name: 'John', email: 'john@test.com' }, status: 'active' }
```

### Flat Snapshot (Dot Notation Keys)

Get values with dot-notation paths:

```typescript
const values = await tree.snapshotFlat();
// → { 'personal.name': 'John', 'personal.email': 'john@test.com', 'status': 'active' }
```

### Set Values from Snapshot

Restore values from a nested object:

```typescript
tree.setFromSnapshot({
    personal: { name: 'Jane', email: 'jane@test.com' },
    status: 'inactive'
});
```

### Set Values from Flat Snapshot

Restore values using dot-notation paths:

```typescript
tree.setFromSnapshotFlat({
    'personal.name': 'Jane',
    'personal.email': 'jane@test.com',
    'status': 'inactive'
});
```

### Round-Trip Example

Save and restore tree state:

```typescript
// Save current state
const saved = await tree.snapshot();

// Later... restore state
tree.setFromSnapshot(saved);

// Or with flat format
const savedFlat = await tree.snapshotFlat();
tree.setFromSnapshotFlat(savedFlat);
```

---

## 🏷️ Metadata Operations

### Get Metadata

```typescript
// Metadata values are evaluated (expressions are resolved)
const label = await tree.getMetadata('label');
const isVisible = await tree.getMetadata('visible');
const hint = await tree.getMetadata('hint');
```

### Set Metadata

```typescript
tree.setMetadata('label', {
    id: 'label',
    type: STRING,
    value: 'User Details'
});

// With dynamic expression
tree.setMetadata('hint', {
    id: 'hint',
    type: STRING,
    value: {
        id: 'expr',
        type: OP,
        value: 'if',
        children: {
            arg0: { id: 'cond', type: REF, value: ['self', 'value'] },
            arg1: { id: 'then', type: LIT, value: '✓ Filled' },
            arg2: { id: 'else', type: LIT, value: 'Enter value' }
        }
    }
});
```

---

## ✅ Constraint Operations

### Add Constraint

```typescript
tree.addConstraint({
    id: 'required',
    type: CONSTRAINT,
    value: {
        id: 'check',
        type: OP,
        value: 'isNotBlank',
        children: {
            arg0: { id: 'arg0', type: REF, value: ['self', 'value'] }
        }
    },
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
});
```

### Remove Constraint

```typescript
tree.removeConstraint('required');
```

---

## 👶 Child Operations

### Add Child

```typescript
const child = tree.addChild('phone', {
    id: 'phone',
    type: STRING,
    value: ''
});
// Returns the new PropertyNode with parent/root set
```

### Remove Child

```typescript
tree.removeChild('phone');
```

---

## 🔄 Reset Operations

### Basic Reset

```typescript
// Reset single node to its defaultValue
tree.resetNode();

// Reset to specific value
tree.resetToValue('initial');

// Clear value (set to undefined)
tree.clear();
```

### Tree Reset

```typescript
// Reset node AND all descendants
tree.resetDeep();  // or tree.resetFromNode()

// Reset only children (not the node itself)
tree.resetChildren();

// Reset entire tree from root
tree.resetAll();
```

### Targeted Reset

```typescript
// Reset by path
tree.resetByPath(['personal', 'name']);  // shallow
tree.resetByPath(['personal'], true);    // deep (includes descendants)

// Reset matching predicate
tree.resetIf(node => node.type?.id === 'String');

// Reset by type
tree.resetByType('String');
tree.resetByType('Number');

// Reset only modified nodes
tree.resetModified();
```

### Clear All

```typescript
// Clear all values in tree (set to undefined)
tree.clearAll();
```

---

## 📦 Serialization

### To Property

```typescript
// Convert back to plain Property object
const plain: Property = tree.toProperty();
```

### To JSON

```typescript
// Get JSON-serializable object
const obj = tree.toJSON();

// Stringify
const json = JSON.stringify(tree.toJSON(), null, 2);
```

### Using Serialization Utilities

```typescript
import { toJSON, toJSONString, fromJSON, parseJSON } from 'turing-property';

// Export
const json = toJSONString(tree, { pretty: true, indent: 2 });

// Import
const result = fromJSON(json);
if (result.valid) {
    const node = result.node!;
    node.setRegistry(defaultRegistry);
}

// Quick parse
const node = parseJSON(json);
```

---

## 🔍 PropertyNode Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Node identifier |
| `type` | `Property` | Type property |
| `value` | `unknown` | Current value (static or expression) |
| `defaultValue` | `unknown` | Default/reset value |
| `metadata` | `Record<string, Property>` | Metadata map |
| `constraints` | `Record<string, Property>` | Constraints map |
| `children` | `Record<string, PropertyNode>` | Child nodes |
| `parent` | `PropertyNode \| undefined` | Parent node |
| `root` | `PropertyNode` | Root node |

---

## 📋 Method Reference

### Navigation

| Method | Returns | Description |
|--------|---------|-------------|
| `child(key)` | `PropertyNode?` | Get child by key |
| `getByPath(path)` | `PropertyNode?` | Get node by path array |
| `descendants()` | `PropertyNode[]` | All descendant nodes |
| `ancestors()` | `PropertyNode[]` | All ancestor nodes |
| `siblings()` | `PropertyNode[]` | All sibling nodes |
| `path()` | `string[]` | Path from root |

### Values

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue(path?)` | `Promise<unknown>` | Get evaluated value |
| `setValue(value, path?)` | `void` | Set value |
| `setValueExpr(expr, path?)` | `void` | Set expression value |

### Snapshot

| Method | Returns | Description |
|--------|---------|-------------|
| `snapshot()` | `Promise<Record<string, unknown>>` | Get nested key-value object |
| `snapshotFlat(prefix?)` | `Promise<Record<string, unknown>>` | Get flat key-value with dot paths |
| `setFromSnapshot(values)` | `void` | Set values from nested object |
| `setFromSnapshotFlat(values)` | `void` | Set values from flat object |

### Defaults

| Method | Returns | Description |
|--------|---------|-------------|
| `getDefaultValue()` | `unknown` | Get raw default |
| `getDefaultValueEvaluated()` | `Promise<unknown>` | Get evaluated default |
| `hasDefaultValue()` | `boolean` | Check if default exists |
| `setDefaultValue(value)` | `void` | Set default value |
| `setDefaultValueExpr(expr)` | `void` | Set default expression |

### Metadata & Constraints

| Method | Returns | Description |
|--------|---------|-------------|
| `getMetadata(key)` | `Promise<unknown>` | Get evaluated metadata |
| `setMetadata(key, prop)` | `void` | Set metadata |
| `addConstraint(prop)` | `void` | Add constraint |
| `removeConstraint(id)` | `void` | Remove constraint |

### Children

| Method | Returns | Description |
|--------|---------|-------------|
| `addChild(key, prop)` | `PropertyNode` | Add child |
| `removeChild(key)` | `void` | Remove child |

### Reset

| Method | Description |
|--------|-------------|
| `resetNode()` | Reset to defaultValue |
| `resetToValue(value)` | Reset to specific value |
| `resetChildren()` | Reset all children (deep) |
| `resetDeep()` | Reset node and all descendants |
| `resetFromNode()` | Alias for resetDeep |
| `resetAll()` | Reset entire tree from root |
| `resetByPath(path, deep?)` | Reset node at path |
| `resetIf(predicate, deep?)` | Reset matching nodes |
| `resetByType(typeId, deep?)` | Reset nodes of type |
| `resetModified()` | Reset modified nodes |
| `clear()` | Clear value to undefined |
| `clearAll()` | Clear all values in tree |

### Dirty Check & Modification Tracking

| Method | Returns | Description |
|--------|---------|-------------|
| `isDirtyNode()` | `boolean` | Check if this node's value differs from default |
| `isDirty()` | `boolean` | Check if this node or any descendant is modified |
| `getModifiedFields()` | `string[][]` | Get paths of modified fields |
| `getModifiedFieldsFlat()` | `string[]` | Get modified fields as dot-notation strings |

### Tree Statistics

| Method | Returns | Description |
|--------|---------|-------------|
| `countNodes()` | `number` | Count total nodes in subtree |
| `maxDepth()` | `number` | Get maximum depth of subtree |
| `collectIds()` | `string[]` | Collect all node IDs |
| `hasDuplicateIds()` | `boolean` | Check for duplicate IDs |
| `getDuplicateIds()` | `string[]` | Get duplicate IDs |

### Serialization

| Method | Returns | Description |
|--------|---------|-------------|
| `toProperty()` | `Property` | Convert to plain Property |
| `toJSON()` | `object` | Convert to JSON object |
| `PropertyNode.from(prop)` | `PropertyNode` | Create from Property |

---

## 📚 Next Steps

- 🧠 [Core Concepts](./core-concepts.md) — Property model fundamentals
- 🏷️ [Types](./types.md) — The type system
- 🔢 [Expressions](./expressions.md) — `lit`, `ref`, `op` patterns
- 🛠️ [Utilities](./utilities.md) — Traversal, serialization, diff
- 💡 [Examples](./examples/) — Real-world patterns

