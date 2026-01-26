# Turing Property

**A homoiconic property system where everything is a Property.**

*Declarative - Reactive - Serializable - Extensible*

---

## The Core Insight

In most systems, you have separate concepts for types, values, expressions, operators, constraints, and metadata.

**Turing Property takes a radical approach: there is only ONE data structure.**

```typescript
interface Property {
    id: string;                            // Unique identifier
    type: Property;                        // Type (also a Property!)
    value?: unknown;                       // Value (static or expression)
    defaultValue?: unknown;                // Default value
    metadata?: Record<string, Property>;   // Metadata (also Properties!)
    constraints?: Record<string, Property>;// Constraints (also Properties!)
    children?: Record<string, Property>;   // Children (also Properties!)
}
```

This is **homoiconicity** - code and data share the same representation.

---

## Demo

**[Live Demo](https://mourad-ghafiri.github.io/turing-property/public/)**

![Screenshot](screenshot.png)

---

## Installation

```bash
npm install turing-property
# or
bun add turing-property
```

---

## What's Included

Turing Property provides a **minimal, primitive core**. You build your domain on top of it.

### Exports

```typescript
import {
    // Property interface
    Property,

    // Meta-types (the 5 foundational types)
    TYPE,        // The type of all types
    EXPR,        // The type of expressions
    OPERATOR,    // The type of operators
    CONSTRAINT,  // The type of constraints
    PROPERTY,    // The type of user properties

    // Expression types
    LIT,         // Literal expression type
    REF,         // Reference expression type
    OP,          // Operator expression type

    // Expression factories
    lit,         // Create literal: lit(42)
    ref,         // Create reference: ref('self.value')
    op,          // Create operator call: op('add', lit(1), lit(2))

    // Registry
    Registry,
    createRegistry,
    EvaluationContext,
    OperatorFn,

    // Evaluator
    evaluate,
    evalArg,
    evalArgs,

    // PropertyNode (tree wrapper)
    PropertyNode,

    // Type guards
    isLit, isRef, isOp, isExpr,
    isType, isConstraint, isOperator,
    isProperty,
} from 'turing-property';
```

### What's NOT Included

- **No built-in operators** - You register your own
- **No built-in types** (STRING, NUMBER, etc.) - You define your own
- **No built-in constraints** (REQUIRED, MIN_LENGTH) - You define your own
- **No property factories** - You build Properties directly

This is intentional. The system is a **foundation**, not a framework.

---

## Quick Start

### 1. Define Your Types

Types are Properties with `type: TYPE`:

```typescript
import { Property, TYPE, PROPERTY } from 'turing-property';

// Define domain-specific types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
const EMAIL: Property = { id: 'Email', type: TYPE };
```

### 2. Register Your Operators

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// Arithmetic
registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) + (b as number);
});

// String operations
registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

registry.register('minLength', async (args, ctx) => {
    const [value, min] = await evalArgs(args, ctx);
    return typeof value === 'string' && value.length >= (min as number);
});

// Logical
registry.register('and', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.every(Boolean);
});

registry.register('or', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.some(Boolean);
});

registry.register('not', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return !value;
});
```

### 3. Build Your Properties

```typescript
import { Property, PROPERTY, CONSTRAINT, op, ref, lit } from 'turing-property';

const STRING: Property = { id: 'String', type: TYPE };

// A form field with validation
const nameField: Property = {
    id: 'name',
    type: STRING,
    value: '',
    defaultValue: '',
    metadata: {
        label: { id: 'label', type: STRING, value: 'Full Name' },
        placeholder: { id: 'placeholder', type: STRING, value: 'Enter your name' },
    },
    constraints: {
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: op('isNotBlank', ref('self.value')),
            metadata: {
                message: { id: 'message', type: STRING, value: 'Name is required' },
            },
        },
        minLength: {
            id: 'minLength',
            type: CONSTRAINT,
            value: op('minLength', ref('self.value'), lit(2)),
            metadata: {
                message: { id: 'message', type: STRING, value: 'At least 2 characters' },
            },
        },
    },
};

// A form with multiple fields
const contactForm: Property = {
    id: 'contactForm',
    type: PROPERTY,
    children: {
        name: nameField,
        email: { /* ... */ },
        message: { /* ... */ },
    },
};
```

### 4. Use PropertyNode

`PropertyNode` wraps a Property and provides tree operations:

```typescript
import { PropertyNode } from 'turing-property';

const node = PropertyNode.create(contactForm, registry);

// Navigation
const nameNode = node.child('name');
nameNode.parent;       // form node
nameNode.root;         // form node
nameNode.pathString(); // 'name'

// Values
nameNode.getRawValue();     // '' (current value)
nameNode.getDefaultValue(); // '' (default value)
nameNode.setValue('John');

// Async evaluation
await nameNode.getValue();  // Evaluates expressions

// Metadata
nameNode.getRawMetadata('label');     // Property { value: 'Full Name', ... }
await nameNode.getMetadata('label');  // 'Full Name' (evaluated)

// Validation
await nameNode.validate();     // { valid: false, errors: { required: '...' } }
await node.validateDeep();     // Validates entire tree

// Reset
nameNode.reset();        // Reset to default
node.resetDeep();        // Reset entire tree

// Serialization
const json = node.toJSON();
const restored = PropertyNode.fromJSON(json);
const clone = node.clone();

// Reactivity
node.subscribe((paths) => console.log('Changed:', paths));
node.watch('name', (paths) => console.log('Name changed'));
node.batch(() => {
    nameNode.setValue('John');
    emailNode.setValue('john@example.com');
}); // Single notification
```

---

## The Type System

Everything is a Property, including types themselves.

### Meta-Types

| Type | Description |
|------|-------------|
| `TYPE` | The type of all types (self-referential: `TYPE.type === TYPE`) |
| `EXPR` | The type of all expressions |
| `OPERATOR` | The type of operators |
| `CONSTRAINT` | The type of constraints |
| `PROPERTY` | The type of user-defined properties |

### Expression Types

| Type | Description | Factory |
|------|-------------|---------|
| `LIT` | Literal value | `lit(42)` |
| `REF` | Reference to another property | `ref('self.value')` |
| `OP` | Operator call | `op('add', lit(1), lit(2))` |

### Creating Domain Types

```typescript
// Base types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };

// Domain-specific types
const EMAIL: Property = { id: 'Email', type: TYPE };
const PHONE: Property = { id: 'Phone', type: TYPE };

// Types can have metadata
const CURRENCY: Property = {
    id: 'Currency',
    type: TYPE,
    metadata: {
        description: { id: 'desc', type: STRING, value: 'Monetary value' },
        precision: { id: 'precision', type: NUMBER, value: 2 },
    },
};
```

---

## Expressions

Three building blocks for dynamic behavior:

### lit() - Literal Values

```typescript
lit(42)           // number
lit('hello')      // string
lit(true)         // boolean
lit([1, 2, 3])    // array
lit({ a: 1 })     // object
```

### ref() - References

Navigate the property tree:

```typescript
ref('self.value')                  // Current property's value
ref('parent.name.value')           // Sibling's value
ref('root.metadata.config.value')  // Root's metadata
ref(['self', 'value'])             // Array syntax also works
```

**Path segments:**
| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of the tree |
| `children` | Children collection |
| `metadata` | Metadata collection |
| `constraints` | Constraints collection |
| `value` | The value field |
| `type` | The type field |
| `id` | The id field |

**Shortcut:** You can omit `children` - the system checks children first, then metadata.

### op() - Operator Calls

```typescript
op('add', lit(1), lit(2))                    // 1 + 2
op('concat', lit('Hello '), ref('name'))     // String concat
op('if', condition, thenExpr, elseExpr)      // Conditional
op('and', op('isNotBlank', ref('a')), op('isNotBlank', ref('b')))
```

---

## The Registry

Operators are functions registered by name:

```typescript
const registry = createRegistry();

// Operator signature: (args: Property[], ctx: EvaluationContext) => unknown | Promise<unknown>
registry.register('operatorName', async (args, ctx) => {
    // args are unevaluated Properties - use evalArg/evalArgs to evaluate
    const [a, b] = await evalArgs(args, ctx);
    return result;
});

// Check if operator exists
registry.has('add');  // true/false
registry.get('add');  // OperatorFn | undefined

// Remove operator
registry.unregister('add');

// Clear all
registry.clear();
```

### Evaluation Helpers

```typescript
import { evalArg, evalArgs, evalArgsParallel, withBindings } from 'turing-property';

// Evaluate single argument
const value = await evalArg(args[0]!, ctx);

// Evaluate all arguments sequentially
const [a, b, c] = await evalArgs(args, ctx);

// Evaluate all arguments in parallel
const results = await evalArgsParallel(args, ctx);

// Add variable bindings for map/filter/reduce
const newCtx = withBindings(ctx, { item: currentItem, index: i });
```

---

## PropertyNode API

### Creation

```typescript
const node = PropertyNode.create(property, registry);
const node = PropertyNode.wrap(property, registry);  // Alias
const node = PropertyNode.fromJSON(serialized);
```

### Navigation

```typescript
node.id                    // Property ID
node.type                  // Property type (Property)
node.parent                // Parent node | null
node.root                  // Root node
node.isRoot                // boolean
node.depth                 // Number (root = 0)

node.child('key')          // Child node | null
node.children()            // All child nodes
node.childKeys()           // Child key names
node.hasChildren()         // boolean
node.childCount            // number

node.get('path.to.node')   // Get by path (dot notation)
node.get(['path', 'to'])   // Get by path (array)
node.path()                // Path from root (array)
node.pathString()          // Path from root (string)

node.ancestors()           // Parent to root
node.descendants()         // All descendants
node.siblings()            // Sibling nodes
node.nextSibling           // Next sibling | null
node.previousSibling       // Previous sibling | null
```

### Values

```typescript
node.getRawValue()                        // Raw value (not evaluated)
node.setValue(value)                      // Set value
node.setValue(value, { silent: true })    // Set without notification
node.setValue(value, { path: 'child' })   // Set child value

await node.getValue()                     // Evaluated value
await node.getValue('child.path')         // Evaluated child value

node.getDefaultValue()                    // Default value
node.hasDefaultValue()                    // boolean
node.hasValue()                           // boolean
node.isEmpty()                            // No value and no children

node.reset()                              // Reset to default
node.resetDeep()                          // Reset tree
```

### Metadata

```typescript
node.metadataKeys()                       // ['label', 'visible', ...]
node.hasMetadata('label')                 // boolean
node.getRawMetadata('label')              // Property | undefined
await node.getMetadata('label')           // Evaluated value
node.setMetadata('key', property)         // Set metadata
node.removeMetadata('key')                // Remove metadata
```

### Constraints

```typescript
node.constraintKeys()                     // ['required', 'minLength', ...]
node.hasConstraints('required')           // boolean
node.getRawConstraint('required')         // Property | undefined
await node.getConstraint('required')      // boolean (is valid?)
node.setConstraint('key', property)       // Set constraint
node.removeConstraint('key')              // Remove constraint
```

### Validation

```typescript
await node.validate()
// { valid: boolean, errors: Record<string, string> }

await node.validateDeep()
// { valid: boolean, errors: Record<string, Record<string, string>> }
```

### Traversal

```typescript
node.traverse((node, path) => { })         // Depth-first pre-order
node.traversePostOrder((node, path) => {}) // Depth-first post-order
node.traverseBreadthFirst((node, path) => {}) // Breadth-first

node.find(predicate)                       // First match | null
node.findAll(predicate)                    // All matches
node.findById('id')                        // Find by ID
node.findByType('TypeId')                  // Find by type ID

node.map((node, path) => result)           // Map to array
node.filter(predicate)                     // Filter nodes
node.reduce((acc, node, path) => acc, initial)
node.some(predicate)                       // Any match?
node.every(predicate)                      // All match?
node.count()                               // Total nodes
```

### Reactivity

```typescript
// Subscribe to changes
const sub = node.subscribe((changedPaths) => {
    console.log('Changed:', changedPaths);
});
sub.unsubscribe();

// Watch specific path
const sub = node.watch('field.path', (paths) => { });

// Path filters
node.subscribe(cb, 'specific.path');
node.subscribe(cb, ['path1', 'path2']);
node.subscribe(cb, (path) => path.startsWith('form.'));

// Batch changes (single notification)
node.batch(() => {
    node.child('a')?.setValue(1);
    node.child('b')?.setValue(2);
});

// Transaction (rollback on error)
node.transaction(() => {
    node.setValue('new value');
    throw new Error('Rollback!');
}); // Value restored

// Management
node.subscriptionCount  // number
node.unsubscribeAll()   // Remove all subscriptions
node.emitChange('path') // Manual emit
```

### Serialization

```typescript
const json = node.toJSON()                    // SerializedProperty
const node = PropertyNode.fromJSON(json)      // Restore
const clone = node.clone()                    // Deep copy
const equals = node.equals(otherNode)         // Compare

// Static utility
const cloned = PropertyNode.cloneProperty(property)
```

### Lifecycle

```typescript
node.isDestroyed  // boolean
node.destroy()    // Cleanup
```

---

## Children vs Metadata

The most important decision when modeling:

### Children = Structural Hierarchy

Use `children` for **what the property IS COMPOSED OF**:

```typescript
// Form: children are fields
const form: Property = {
    id: 'form',
    type: PROPERTY,
    children: {
        name: { /* field */ },
        email: { /* field */ },
    },
};

// Tree: children are nodes
const folder: Property = {
    id: 'src',
    type: FOLDER,
    children: {
        index: { /* file */ },
        utils: { /* folder */ },
    },
};
```

### Metadata = Descriptions / Attributes

Use `metadata` for **everything that DESCRIBES the property**:

```typescript
const field: Property = {
    id: 'email',
    type: EMAIL,
    value: '',
    metadata: {
        label: { id: 'label', type: STRING, value: 'Email' },
        placeholder: { id: 'placeholder', type: STRING, value: 'user@example.com' },
        visible: { id: 'visible', type: BOOLEAN, value: true },
        disabled: { id: 'disabled', type: BOOLEAN, value: false },
    },
};
```

### Decision Framework

| Question | Children | Metadata |
|----------|----------|----------|
| Part of the property? | Yes | |
| Structural composition? | Yes | |
| Describes the property? | | Yes |
| Attribute/characteristic? | | Yes |
| Computed value? | | Yes |
| UI presentation? | | Yes |

---

## Constraints

Constraints are Properties with `type: CONSTRAINT`. Their `value` is an expression that returns `true` (valid) or `false` (invalid).

```typescript
const required: Property = {
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Required' },
    },
};

// Factory pattern
const minLength = (n: number, msg?: string): Property => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('minLength', ref('self.value'), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: msg || `Min ${n} chars` },
    },
});
```

Error messages go in `constraint.metadata.message`.

---

## Performance

Benchmarks on a 1000-field form:

| Operation | Time |
|-----------|------|
| Create PropertyNode | 0.3ms |
| Traverse tree | 0.1ms |
| Clone | 1.1ms |
| Serialize (toJSON) | 0.7ms |
| Deserialize (fromJSON) | 0.4ms |
| Validate 500 fields | 2.1ms |
| 100 setValue calls | 0.04ms |
| Batch 500 changes | 0.1ms |

All operations complete well under 16ms (60fps threshold).

Run benchmarks:

```bash
bun test tests/benchmarks/
```

---

## Design Principles

1. **All is Property** - Everything uses the same structure
2. **Homoiconic** - Code and data share the same representation
3. **Declarative** - Define what you want, not how to compute it
4. **Minimal Core** - No built-in operators, types, or constraints
5. **Extensible** - Build your domain on top
6. **Serializable** - Everything is plain JSON

---

## Project Structure

```
src/
└── core/
    ├── Property.ts      # Property interface
    ├── types.ts         # TYPE, EXPR, OPERATOR, CONSTRAINT, PROPERTY, LIT, REF, OP
    ├── expressions.ts   # lit(), ref(), op()
    ├── Registry.ts      # Operator registry
    ├── Evaluator.ts     # Expression evaluation
    ├── guards.ts        # isLit, isRef, isOp, etc.
    ├── PropertyNode.ts  # Tree wrapper
    └── index.ts         # Exports
```

---

## License

MIT
