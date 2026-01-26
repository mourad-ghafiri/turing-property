# API Reference

Complete API reference for Turing Property.

---

## Table of Contents

- [Core](#core)
  - [Property Interface](#property-interface)
  - [Types](#types)
  - [Expression Factories](#expression-factories)
  - [Registry](#registry)
  - [Evaluator](#evaluator)
  - [Type Guards](#type-guards)
- [PropertyNode](#propertynode)
  - [Creation](#creation)
  - [Navigation](#navigation)
  - [Values](#values)
  - [Metadata](#metadata)
  - [Constraints](#constraints)
  - [Validation](#validation)
  - [Traversal](#traversal)
  - [Reactivity](#reactivity)
  - [Serialization](#serialization)

---

## Core

### Property Interface

The fundamental data structure. Everything in the system is a Property.

```typescript
interface Property {
    id: string;                            // Unique identifier
    type: Property;                        // Type (also a Property)
    value?: unknown;                       // Value (static or expression)
    defaultValue?: unknown;                // Default value
    metadata?: Record<string, Property>;   // Metadata properties
    constraints?: Record<string, Property>;// Constraint properties
    children?: Record<string, Property>;   // Child properties
}
```

---

### Types

The library provides these foundational types:

#### Meta-Types

| Type | Description |
|------|-------------|
| `TYPE` | The type of all types (self-referential: `TYPE.type === TYPE`) |
| `EXPR` | The type of all expressions |
| `OPERATOR` | The type of operators |
| `CONSTRAINT` | The type of constraints |
| `PROPERTY` | The type of user-defined properties |

#### Expression Types

| Type | Description |
|------|-------------|
| `LIT` | Literal expression type |
| `REF` | Reference expression type |
| `OP` | Operator call expression type |

#### Creating Domain Types

You define your own types as Properties:

```typescript
import { TYPE, Property } from 'turing-property';

const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
const EMAIL: Property = { id: 'Email', type: TYPE };
```

---

### Expression Factories

| Factory | Signature | Description |
|---------|-----------|-------------|
| `lit(value)` | `(unknown) => Property` | Create literal expression |
| `ref(path)` | `(string \| string[]) => Property` | Create reference expression |
| `op(name, ...args)` | `(string, ...Property[]) => Property` | Create operator call |

#### Examples

```typescript
import { lit, ref, op } from 'turing-property';

// Literal values
lit(42)              // number
lit('hello')         // string
lit(true)            // boolean
lit([1, 2, 3])       // array

// References (both syntaxes work)
ref('self.value')              // dot notation
ref(['self', 'value'])         // array notation
ref('parent.name.value')       // sibling's value
ref('root.config.value')       // from root

// Operator calls
op('add', lit(1), lit(2))
op('concat', lit('Hello '), ref('name'))
op('if', condition, thenExpr, elseExpr)
```

#### Reference Path Segments

| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of tree |
| `children` | Children collection (can be omitted) |
| `metadata` | Metadata collection (can be omitted) |
| `constraints` | Constraints collection |
| `value` | The value field |
| `type` | The type field |
| `id` | The id field |

---

### Registry

Operators are functions registered by name.

```typescript
import { Registry, createRegistry } from 'turing-property';
```

#### createRegistry

```typescript
function createRegistry(): Registry
```

Creates a new empty operator registry.

#### Registry Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `register` | `(name: string, fn: OperatorFn) => void` | Register an operator |
| `get` | `(name: string) => OperatorFn \| undefined` | Get operator by name |
| `has` | `(name: string) => boolean` | Check if operator exists |
| `unregister` | `(name: string) => void` | Remove an operator |
| `clear` | `() => void` | Remove all operators |

#### OperatorFn Type

```typescript
type OperatorFn = (
    args: Property[],
    ctx: EvaluationContext
) => unknown | Promise<unknown>;
```

#### EvaluationContext Type

```typescript
interface EvaluationContext {
    current: Property;                    // Property being evaluated
    root: Property;                       // Root of the tree
    registry: Registry;                   // Operator registry
    bindings?: Record<string, unknown>;   // Variable bindings
    depth?: number;                       // Evaluation depth
    findParent?: (p: Property) => Property | undefined;
}
```

---

### Evaluator

Functions for evaluating expressions.

```typescript
import { evaluate, evalArg, evalArgs, evalArgsParallel, withBindings } from 'turing-property';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `evaluate` | `(expr: Property, ctx: EvaluationContext) => Promise<unknown>` | Evaluate an expression |
| `evalArg` | `(arg: Property, ctx: EvaluationContext) => Promise<unknown>` | Evaluate single argument |
| `evalArgs` | `(args: Property[], ctx: EvaluationContext) => Promise<unknown[]>` | Evaluate arguments sequentially |
| `evalArgsParallel` | `(args: Property[], ctx: EvaluationContext) => Promise<unknown[]>` | Evaluate arguments in parallel |
| `withBindings` | `(ctx: EvaluationContext, bindings: Record<string, unknown>) => EvaluationContext` | Add variable bindings |

#### Example: Registering Operators

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// Simple operator
registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) + (b as number);
});

// Operator with single arg
registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

// Conditional (short-circuit evaluation)
registry.register('if', async (args, ctx) => {
    const condition = await evalArg(args[0]!, ctx);
    if (condition) {
        return evalArg(args[1]!, ctx);
    }
    return args[2] ? evalArg(args[2], ctx) : null;
});
```

---

### Type Guards

Functions for checking Property types.

```typescript
import {
    isLit, isRef, isOp, isExpr,
    isType, isConstraint, isOperator,
    isProperty, getTypeName
} from 'turing-property';
```

| Function | Description |
|----------|-------------|
| `isLit(p)` | Check if Property is a Literal |
| `isRef(p)` | Check if Property is a Reference |
| `isOp(p)` | Check if Property is an Operator call |
| `isExpr(p)` | Check if Property is any expression (LIT, REF, OP) |
| `isType(p)` | Check if Property is a Type |
| `isConstraint(p)` | Check if Property is a Constraint |
| `isOperator(p)` | Check if Property is an Operator |
| `isProperty(val)` | Check if value is a Property (duck typing) |
| `getTypeName(p)` | Get the type name of a Property |

---

## PropertyNode

`PropertyNode` wraps a `Property` and provides tree navigation, evaluation, and mutation methods.

### Creation

```typescript
import { PropertyNode } from 'turing-property';

// Create with property and registry
const node = PropertyNode.create(property, registry);

// Alias
const node = PropertyNode.wrap(property, registry);

// From serialized JSON
const node = PropertyNode.fromJSON(serialized);
node.setRegistry(registry);  // Set registry after
```

---

### Navigation

| Property/Method | Return Type | Description |
|-----------------|-------------|-------------|
| `id` | `string` | Property ID |
| `type` | `Property` | Property type |
| `property` | `Property` | The wrapped Property |
| `parent` | `PropertyNode \| null` | Parent node |
| `root` | `PropertyNode` | Root node |
| `isRoot` | `boolean` | Is this the root? |
| `depth` | `number` | Depth from root (root = 0) |
| `child(key)` | `PropertyNode \| null` | Get child by key |
| `children()` | `PropertyNode[]` | Get all children |
| `childKeys()` | `string[]` | Get child key names |
| `childCount` | `number` | Number of children |
| `hasChildren()` | `boolean` | Has any children? |
| `get(path)` | `PropertyNode \| null` | Get by path (dot notation or array) |
| `path()` | `string[]` | Path from root (array) |
| `pathString()` | `string` | Path from root (dot notation) |
| `ancestors()` | `PropertyNode[]` | All ancestors (parent to root) |
| `descendants()` | `PropertyNode[]` | All descendants |
| `siblings()` | `PropertyNode[]` | All siblings |
| `nextSibling` | `PropertyNode \| null` | Next sibling |
| `previousSibling` | `PropertyNode \| null` | Previous sibling |

---

### Values

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getRawValue()` | `unknown` | Get raw value (not evaluated) |
| `setValue(value, options?)` | `void` | Set value |
| `getValue(path?)` | `Promise<unknown>` | Get evaluated value |
| `getDefaultValue()` | `unknown` | Get default value |
| `hasDefaultValue()` | `boolean` | Has default value? |
| `hasValue()` | `boolean` | Has value? |
| `isEmpty()` | `boolean` | No value and no children? |
| `reset()` | `void` | Reset to default value |
| `resetDeep()` | `void` | Reset this and all descendants |

#### setValue Options

```typescript
node.setValue(value);                        // Set value, emit change
node.setValue(value, { silent: true });      // Set without notification
node.setValue(value, { path: 'child' });     // Set child's value
```

---

### Metadata

| Method | Return Type | Description |
|--------|-------------|-------------|
| `metadataKeys()` | `string[]` | Get metadata key names |
| `hasMetadata(key?)` | `boolean` | Has metadata? Optional key to check specific |
| `getRawMetadata(key)` | `Property \| undefined` | Get raw metadata Property |
| `getMetadata(key)` | `Promise<unknown>` | Get evaluated metadata value |
| `setMetadata(key, property, options?)` | `void` | Set metadata Property |
| `removeMetadata(key, options?)` | `boolean` | Remove metadata, returns true if existed |

---

### Constraints

| Method | Return Type | Description |
|--------|-------------|-------------|
| `constraintKeys()` | `string[]` | Get constraint key names |
| `hasConstraints(key?)` | `boolean` | Has constraint(s)? Optional key to check specific |
| `getRawConstraint(key)` | `Property \| undefined` | Get raw constraint Property |
| `getConstraint(key)` | `Promise<boolean>` | Evaluate constraint (true = valid) |
| `setConstraint(key, property, options?)` | `void` | Set constraint Property |
| `removeConstraint(key, options?)` | `boolean` | Remove constraint, returns true if existed |

---

### Validation

| Method | Return Type | Description |
|--------|-------------|-------------|
| `validate()` | `Promise<{valid, errors}>` | Validate this node |
| `validateDeep()` | `Promise<{valid, errors}>` | Validate entire tree |

#### Validation Result Types

```typescript
// validate() returns:
{
    valid: boolean;
    errors: Record<string, string>;  // constraintId -> message
}

// validateDeep() returns:
{
    valid: boolean;
    errors: Record<string, Record<string, string>>;  // path -> { constraintId -> message }
}
```

---

### Traversal

| Method | Return Type | Description |
|--------|-------------|-------------|
| `traverse(visitor)` | `void` | Depth-first pre-order traversal |
| `traversePostOrder(visitor)` | `void` | Depth-first post-order traversal |
| `traverseBreadthFirst(visitor)` | `void` | Breadth-first traversal |
| `find(predicate)` | `PropertyNode \| null` | Find first match |
| `findAll(predicate)` | `PropertyNode[]` | Find all matches |
| `findById(id)` | `PropertyNode \| null` | Find by ID |
| `findByType(typeId)` | `PropertyNode[]` | Find by type ID |
| `map(fn)` | `T[]` | Map over nodes |
| `filter(predicate)` | `PropertyNode[]` | Filter nodes |
| `reduce(fn, initial)` | `T` | Reduce nodes |
| `some(predicate)` | `boolean` | Any node matches? |
| `every(predicate)` | `boolean` | All nodes match? |
| `count()` | `number` | Total node count |

#### Visitor Type

```typescript
type TraversalVisitor = (node: PropertyNode, path: string[]) => boolean | void;
// Return true to stop traversal
```

---

### Reactivity

| Method | Return Type | Description |
|--------|-------------|-------------|
| `subscribe(callback, filter?)` | `Subscription` | Subscribe to changes |
| `watch(path, callback)` | `Subscription` | Watch specific path |
| `subscriptionCount` | `number` | Number of active subscriptions |
| `unsubscribeAll()` | `void` | Remove all subscriptions |
| `batch(fn)` | `void` | Batch changes (single notification) |
| `transaction(fn)` | `void` | Transaction (rollback on error) |
| `emitChange(path)` | `void` | Manually emit change |

#### Subscription Type

```typescript
interface Subscription {
    id: string;
    isActive: boolean;
    unsubscribe(): void;
}
```

#### ChangeCallback Type

```typescript
type ChangeCallback = (changedPaths: string[]) => void;
```

#### PathFilter Type

```typescript
type PathFilter = string | string[] | ((path: string) => boolean);
```

#### Examples

```typescript
// Subscribe to all changes
const sub = node.subscribe((paths) => console.log('Changed:', paths));

// Watch specific path
const sub = node.watch('user.name', (paths) => console.log('Name changed'));

// Filter by multiple paths
node.subscribe(cb, ['user.name', 'user.email']);

// Custom filter function
node.subscribe(cb, (path) => path.startsWith('form.'));

// Batch changes
node.batch(() => {
    node.child('a')?.setValue(1);
    node.child('b')?.setValue(2);
}); // Single notification

// Transaction with rollback
try {
    node.transaction(() => {
        node.setValue('new value');
        throw new Error('Rollback!');
    });
} catch {
    // Value is restored
}

// Cleanup
sub.unsubscribe();
node.unsubscribeAll();
```

---

### Serialization

| Method | Return Type | Description |
|--------|-------------|-------------|
| `toJSON()` | `SerializedProperty` | Serialize to JSON-safe object (full schema) |
| `snapshot()` | `Promise<Record<string, unknown>>` | Get evaluated values as key-value pairs |
| `clone()` | `PropertyNode` | Deep clone |
| `equals(other)` | `boolean` | Compare with another node |

#### Static Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `PropertyNode.fromJSON` | `(json: SerializedProperty) => PropertyNode` | Create from JSON |
| `PropertyNode.cloneProperty` | `(property: Property) => Property` | Clone raw Property |

#### Example

```typescript
// Serialize (full schema with types, metadata, constraints)
const json = node.toJSON();
const jsonString = JSON.stringify(json);

// Deserialize
const parsed = JSON.parse(jsonString);
const restored = PropertyNode.fromJSON(parsed);
restored.setRegistry(registry);

// Clone
const clone = node.clone();

// Compare
const isEqual = node.equals(clone);  // true
```

#### toJSON() vs snapshot()

`toJSON()` returns the full Property schema including types, metadata, and constraints.
`snapshot()` returns only the evaluated values as a simple key-value object.

```typescript
// Given a wizard form with fields:
const wizard = PropertyNode.create({
    id: 'wizard',
    type: PROPERTY,
    children: {
        step1: {
            id: 'step1',
            type: PROPERTY,
            children: {
                name: { id: 'name', type: STRING, value: 'John' },
                email: { id: 'email', type: STRING, value: 'john@example.com' }
            }
        },
        currentStep: { id: 'currentStep', type: NUMBER, value: 1 }
    }
}, registry);

// toJSON() returns full schema:
wizard.toJSON();
// {
//   id: 'wizard',
//   type: { id: 'Property' },
//   children: {
//     step1: {
//       id: 'step1',
//       type: { id: 'Property' },
//       children: {
//         name: { id: 'name', type: { id: 'String' }, value: 'John' },
//         email: { id: 'email', type: { id: 'String' }, value: 'john@example.com' }
//       }
//     },
//     currentStep: { id: 'currentStep', type: { id: 'Number' }, value: 1 }
//   }
// }

// snapshot() returns evaluated values only:
await wizard.snapshot();
// {
//   step1: {
//     name: 'John',
//     email: 'john@example.com'
//   },
//   currentStep: 1
// }
```

**Use cases:**
- `toJSON()`: Persist and restore entire Property trees (schema + data)
- `snapshot()`: Extract form data for submission, API calls, or display

---

## Import Example

```typescript
import {
    // Property interface
    Property,

    // Meta-types
    TYPE,
    EXPR,
    OPERATOR,
    CONSTRAINT,
    PROPERTY,

    // Expression types
    LIT,
    REF,
    OP,

    // Expression factories
    lit,
    ref,
    op,

    // Registry
    Registry,
    createRegistry,
    EvaluationContext,
    OperatorFn,

    // Evaluator
    evaluate,
    evalArg,
    evalArgs,
    evalArgsParallel,
    withBindings,

    // Type guards
    isLit,
    isRef,
    isOp,
    isExpr,
    isType,
    isConstraint,
    isOperator,
    isProperty,
    getTypeName,

    // PropertyNode
    PropertyNode,
    ChangeCallback,
    PathFilter,
    Subscription,
    TraversalVisitor,
    NodePredicate,
    SerializedProperty,
} from 'turing-property';
```
