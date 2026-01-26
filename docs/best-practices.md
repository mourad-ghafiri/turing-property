# Best Practices

## The Fundamental Principle: All is Property

**Everything** in Turing Property is represented as a Property. Types, expressions, constraints, metadata - all Properties.

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

> **Important:** Never invent new data structures outside this interface. If you need something, express it as a Property.

---

## Three Building Blocks for Dynamic Behavior

The expression system consists of exactly three primitives:

```typescript
import { lit, ref, op } from 'turing-property';

// 1. Literal - Static values
lit(42)                    // number
lit('hello')               // string
lit(true)                  // boolean
lit(['a', 'b'])            // array

// 2. Reference - Point to other properties
ref('self.value')                         // Current property's value
ref('parent.name.value')                  // Sibling's value
ref(['root', 'metadata', 'config'])       // Root's metadata

// 3. Operator - Combine and transform
op('add', lit(1), lit(2))                 // Calls your registered operator
op('concat', lit('Hello, '), ref('name')) // String concatenation
op('if', condition, thenExpr, elseExpr)   // Conditional
```

---

## Children vs Metadata: The Critical Distinction

This is the most fundamental decision when modeling. Understanding when to use `children` vs `metadata` determines your model's correctness.

### Children = Structural Hierarchy / Composition

Use `children` for **what the property IS COMPOSED OF** - the structural parts that form the whole.

| Domain | Children Represent |
|--------|-------------------|
| Forms | Fields in a form section |
| Trees | Child nodes |
| Workflows | Steps in a stage |
| State Machines | States in a machine |
| Directory | Files/folders inside |

```typescript
// Form: children are the fields
const formSection: Property = {
    id: 'personalInfo',
    type: PROPERTY,
    children: {
        firstName: { id: 'firstName', type: STRING, value: '' },
        lastName: { id: 'lastName', type: STRING, value: '' }
    }
};

// Organization: children are direct reports
const orgNode: Property = {
    id: 'ceo',
    type: ORG_NODE,
    children: {
        cto: { id: 'cto', type: ORG_NODE, /* ... */ },
        cfo: { id: 'cfo', type: ORG_NODE, /* ... */ }
    }
};
```

### Metadata = Descriptions / Attributes / State

Use `metadata` for **everything that DESCRIBES the property** - attributes, computed values, UI hints, state, configuration.

| Purpose | Examples |
|---------|----------|
| UI Presentation | `label`, `placeholder`, `hint`, `icon` |
| Visibility/Behavior | `visible`, `disabled`, `readonly` |
| Computed Values | `isValid`, `total`, `progress` |
| State | `currentStep`, `status`, `lastUpdated` |
| Configuration | `format`, `precision`, `maxItems` |

```typescript
// Form field: metadata describes how to present/validate it
const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    metadata: {
        label: { id: 'label', type: STRING, value: 'Email Address' },
        placeholder: { id: 'placeholder', type: STRING, value: 'user@example.com' },
        visible: {
            id: 'visible',
            type: BOOLEAN,
            value: op('neq', ref('parent.role.value'), lit('guest'))
        }
    }
};
```

### Decision Framework

| Question | Answer = Children | Answer = Metadata |
|----------|------------------|-------------------|
| Does this represent a **part** of the property? | Yes | |
| Is this **structural composition**? | Yes | |
| Would removing this change **what the property IS**? | Yes | |
| Does this **describe** the property? | | Yes |
| Is this an **attribute** or **characteristic**? | | Yes |
| Is this a **computed value** or **state**? | | Yes |
| Is this **UI presentation** information? | | Yes |

> **Common mistake:** Putting computed values in `children`. Values like `isValid`, `total`, or `currentStep` should **always** be in `metadata`.

```typescript
// WRONG: Computed value in children
const wizard: Property = {
    id: 'wizard',
    type: WIZARD,
    children: {
        step1: { /* ... */ },
        isValid: { id: 'isValid', type: BOOLEAN, value: op('and', ...) }  // WRONG!
    }
};

// CORRECT: Computed value in metadata
const wizard: Property = {
    id: 'wizard',
    type: WIZARD,
    metadata: {
        isValid: { id: 'isValid', type: BOOLEAN, value: op('and', ...) }  // RIGHT!
    },
    children: {
        step1: { /* ... */ }
    }
};
```

---

## Types: First-Class Properties

Types are Properties too! This is what makes the system homoiconic.

### Built-in Meta-Types

```typescript
import { TYPE, EXPR, OPERATOR, CONSTRAINT, PROPERTY, LIT, REF, OP } from 'turing-property';

// TYPE is the type of all types (self-referential)
TYPE.type === TYPE  // true

// Expression types
LIT.type === EXPR   // Literal
REF.type === EXPR   // Reference
OP.type === EXPR    // Operator call
```

### Creating Domain-Specific Types

You define your own types as Properties with `type: TYPE`:

```typescript
// Base types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

// Domain-specific types
const EMAIL: Property = { id: 'Email', type: TYPE };
const PHONE: Property = { id: 'Phone', type: TYPE };

// Types can have metadata
const CURRENCY: Property = {
    id: 'Currency',
    type: TYPE,
    metadata: {
        description: { id: 'desc', type: STRING, value: 'Monetary value' },
        precision: { id: 'precision', type: NUMBER, value: 2 }
    }
};

// Graph domain types
const NODE: Property = { id: 'GraphNode', type: TYPE };
const EDGE: Property = { id: 'GraphEdge', type: TYPE };
```

---

## Constraints: Validation as Properties

Constraints are Properties with `type: CONSTRAINT`. Their `value` is an expression that evaluates to `true` (valid) or `false` (invalid).

### Structure

```typescript
import { CONSTRAINT, op, ref, lit } from 'turing-property';

const STRING: Property = { id: 'String', type: TYPE };

// Simple constraint
const REQUIRED: Property = {
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
};

// Factory for parameterized constraints
const MIN_LENGTH = (n: number, message?: string): Property => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('gte', op('strlen', ref('self.value')), lit(n)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum ${n} characters` }
    }
});

const IN_RANGE = (min: number, max: number): Property => ({
    id: 'inRange',
    type: CONSTRAINT,
    value: op('and',
        op('gte', ref('self.value'), lit(min)),
        op('lte', ref('self.value'), lit(max))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be between ${min} and ${max}` }
    }
});
```

### Cross-Field Constraints

```typescript
const passwordsMatch: Property = {
    id: 'passwordsMatch',
    type: CONSTRAINT,
    value: op('eq',
        ref('self.value'),
        ref('parent.password.value')
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Passwords must match' }
    }
};
```

> **Tip:** Error messages belong in `constraint.metadata.message`, not in the field's own metadata!

---

## Operators: Register Your Own

Turing Property has NO built-in operators. You register your own:

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// Operators receive unevaluated Properties as args
// Use evalArg/evalArgs to evaluate them
registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) + (b as number);
});

registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

registry.register('if', async (args, ctx) => {
    const condition = await evalArg(args[0]!, ctx);
    if (condition) {
        return evalArg(args[1]!, ctx);
    }
    return args[2] ? evalArg(args[2], ctx) : null;
});
```

---

## Reference Paths

### In Expressions (ref)

Navigate the property tree using path segments:

| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of the tree |
| `children` | Access children map |
| `metadata` | Access metadata map |
| `constraints` | Access constraints map |
| `value` | The value field |
| `type` | The type field |

```typescript
// From a field, reference sibling's value
ref('parent.otherField.value')

// From anywhere, reference root's state
ref('root.metadata.currentStep.value')

// Explicit children path
ref('parent.children.name.value')
```

> **Shortcut:** You can omit `children` - the system checks children first, then metadata.
> `ref('parent.name.value')` equals `ref('parent.children.name.value')`

### In PropertyNode

```typescript
// Both work identically
node.get('user.profile.name');
node.get(['user', 'profile', 'name']);

// setValue / getValue
await node.getValue('user.name');
node.setValue('John', { path: 'user.name' });
```

---

## Anti-Patterns (Avoid These!)

### Don't put error messages in field metadata

```typescript
// WRONG
metadata: { errorMessage: { id: 'errorMessage', type: STRING, value: 'Invalid' } }

// CORRECT - In constraint
constraints: {
    email: {
        ...,
        metadata: { message: { id: 'message', type: STRING, value: 'Invalid' } }
    }
}
```

### Don't create external registries or collections

```typescript
// WRONG - External collection
const INPUT_TYPES = { text: {...}, email: {...} };

// CORRECT - Define types as Properties
const TEXT: Property = { id: 'Text', type: TYPE };
const EMAIL: Property = { id: 'Email', type: TYPE };
```

### Don't put computed values in children

```typescript
// WRONG
children: {
    total: { id: 'total', type: NUMBER, value: op('sum', ...) }
}

// CORRECT
metadata: {
    total: { id: 'total', type: NUMBER, value: op('sum', ...) }
}
```

---

## Summary

| Principle | Description |
|-----------|-------------|
| **All is Property** | Never create structures outside the Property interface |
| **Children = Structure** | Hierarchy, composition, parts of the whole |
| **Metadata = Description** | Attributes, state, computed values, UI hints |
| **Constraints have messages** | Error messages in `constraint.metadata.message` |
| **Types are Properties** | Create domain-specific types with `type: TYPE` |
| **Use expressions** | `lit()`, `ref()`, `op()` for dynamic values |
| **Register operators** | No built-in operators - you define what you need |
