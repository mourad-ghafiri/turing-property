# Core Concepts

Understanding the foundational principles and building blocks of Turing Property.

---

## The Core Insight: One Data Structure

In most systems, you have separate concepts:
- Types (string, number, boolean)
- Values (the actual data)
- Expressions (computed values)
- Validation rules
- Metadata (labels, descriptions)

**Turing Property takes a radical approach: there is only ONE data structure.**

Everything in the system — types, values, expressions, constraints, metadata — is represented as a `Property`.

---

## The Property Interface

Every entity in the system is a `Property`:

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

### Key Observations

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for navigation and reference |
| `type` | **Also a Property!** Types are first-class citizens |
| `value` | Can be static data OR a Property (expression) |
| `defaultValue` | Reset value, also supports expressions |
| `metadata` | Labels, hints, visibility — all Properties |
| `constraints` | Validation rules — all Properties |
| `children` | Nested Properties for complex structures |

---

## Homoiconicity

**Homoiconicity** means code and data share the same representation.

### Data as Property

```typescript
import { TYPE } from 'turing-property';

// Define your types (they're Properties too!)
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };

// A simple string value
const name: Property = {
    id: 'name',
    type: STRING,
    value: 'John'
};

// A number value
const age: Property = {
    id: 'age',
    type: NUMBER,
    value: 25
};
```

### Code as Property

Expressions are also Properties! Here's a literal expression:

```typescript
import { LIT } from 'turing-property';

// Literal expression: wraps a static value
const literalExpr: Property = {
    id: 'greeting',
    type: LIT,
    value: 'Hello, World!'
};
```

A reference expression points to another property:

```typescript
import { REF } from 'turing-property';

// Reference expression: points to a path in the tree
const refExpr: Property = {
    id: 'nameRef',
    type: REF,
    value: ['parent', 'name', 'value']  // Path array
};
```

An operator expression combines other expressions:

```typescript
import { OP, LIT, REF } from 'turing-property';

// Operator expression: calls a registered operator
const concatExpr: Property = {
    id: 'concat',
    type: OP,
    children: {
        arg0: { id: 'arg0', type: LIT, value: 'Hello, ' },
        arg1: { id: 'arg1', type: REF, value: ['parent', 'name', 'value'] }
    }
};
```

Both data and code are Properties! You can:
- **Serialize** them to JSON
- **Inspect** them at runtime
- **Transform** them programmatically
- **Store** them in databases
- **Transfer** them over network

---

## Bootstrap: The Type of Types

How do we create the first type if every Property needs a type?

We **bootstrap** with a self-referential type:

```typescript
// The primordial type - type of all types
const TYPE: Property = {
    id: 'Type',
    type: null as any  // Temporary placeholder
};
TYPE.type = TYPE;  // Self-reference: TYPE is its own type
```

From `TYPE`, we build all other types:

```typescript
// Meta types (provided by the library)
const EXPR: Property = { id: 'Expr', type: TYPE };
const OPERATOR: Property = { id: 'Operator', type: TYPE };
const CONSTRAINT: Property = { id: 'Constraint', type: TYPE };
const PROPERTY: Property = { id: 'Property', type: TYPE };

// Expression types (provided by the library)
const LIT: Property = { id: 'Lit', type: EXPR };
const REF: Property = { id: 'Ref', type: EXPR };
const OP: Property = { id: 'Op', type: EXPR };

// Your domain types (you define these)
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
```

### Type Hierarchy

```
TYPE (type of types)
 ├── EXPR (expression base)
 │    ├── LIT (literal)
 │    ├── REF (reference)
 │    └── OP (operator call)
 ├── OPERATOR
 ├── CONSTRAINT
 ├── PROPERTY
 └── ... your domain types
```

---

## Property Trees

Properties form trees through the `children` field:

```typescript
// A form with nested fields
const contactForm: Property = {
    id: 'contactForm',
    type: PROPERTY,
    children: {
        personal: {
            id: 'personal',
            type: PROPERTY,
            children: {
                name: { id: 'name', type: STRING, value: '' },
                email: { id: 'email', type: STRING, value: '' }
            }
        },
        message: { id: 'message', type: STRING, value: '' }
    }
};
```

This creates a tree structure:

```
contactForm
 ├── personal
 │    ├── name
 │    └── email
 └── message
```

### Tree Navigation

Navigate trees using `PropertyNode`:

```typescript
import { PropertyNode } from 'turing-property';

const form = PropertyNode.create(contactForm, registry);

// Access children
const personal = form.child('personal');
const name = personal?.child('name');

// Get path from root
name?.pathString();  // 'personal.name'

// Get parent
name?.parent;  // personal node

// Get root
name?.root;    // contactForm node

// Get siblings
personal?.siblings();  // [message node]
```

---

## The Expression System

Expressions are the core mechanism for dynamic behavior. There are three expression types:

### 1. Literal (`LIT`)

Wraps a static value:

```typescript
import { lit } from 'turing-property';

lit(42);           // number
lit('hello');      // string
lit(true);         // boolean
lit([1, 2, 3]);    // array
```

### 2. Reference (`REF`)

Points to another property using a path:

```typescript
import { ref } from 'turing-property';

ref('self.value');           // Current property's value
ref('parent.name.value');    // Sibling's value
ref('root.config.value');    // Root's config value
```

### Path Segments

| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of the tree |
| `children` | Access children map |
| `metadata` | Access metadata map |
| `constraints` | Access constraints map |
| `value` | Get the value |
| `type` | Get the type |
| `id` | Get the id |

**Shortcut**: You can omit `children` — the system checks children first, then metadata:

```typescript
// Equivalent paths:
ref('parent.children.name.value')
ref('parent.name.value')  // shortcut
```

### 3. Operator (`OP`)

Calls a registered operator function:

```typescript
import { op, lit, ref } from 'turing-property';

op('add', lit(10), lit(5));                    // 10 + 5
op('concat', lit('Hello '), ref('name'));      // String concat
op('if', condition, thenExpr, elseExpr);       // Conditional
```

### Nested Expressions

Expressions can nest infinitely:

```typescript
// Expression: if(isEmpty(name), 'Guest', uppercase(name))
op('if',
    op('isEmpty', ref('root.name.value')),
    lit('Guest'),
    op('upper', ref('root.name.value'))
);
```

---

## The Registry

Operators are functions you register by name. **Turing Property has no built-in operators** — you define what you need:

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// Register operators
registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) + (b as number);
});

registry.register('isEmpty', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return value === '' || value === null || value === undefined;
});

registry.register('upper', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return String(value).toUpperCase();
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

## Metadata System

The `metadata` attribute is an extension point for attaching additional descriptive information. Metadata values are themselves Properties:

```typescript
const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    metadata: {
        // Static label
        label: { id: 'label', type: STRING, value: 'Email Address' },

        // Static placeholder
        placeholder: { id: 'placeholder', type: STRING, value: 'user@example.com' },

        // Dynamic hint based on value
        hint: {
            id: 'hint',
            type: STRING,
            value: op('if',
                op('isEmpty', ref('self.value')),
                lit('Enter your email'),
                lit('Email entered')
            )
        }
    }
};
```

When `getMetadata('hint')` is called, the expression evaluates dynamically!

---

## Constraints System

Constraints are validation rules. Each constraint is a Property with `type: CONSTRAINT`. Its value evaluates to `true` (valid) or `false` (invalid):

```typescript
const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    constraints: {
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: op('isNotBlank', ref('self.value')),
            metadata: {
                message: { id: 'message', type: STRING, value: 'Required' }
            }
        },
        format: {
            id: 'format',
            type: CONSTRAINT,
            value: op('isEmail', ref('self.value')),
            metadata: {
                message: { id: 'message', type: STRING, value: 'Invalid email' }
            }
        }
    }
};
```

Error messages go in `constraint.metadata.message`.

---

## Everything is Connected

The power of homoiconicity becomes clear when you see how everything connects:

```typescript
const nameField: Property = {
    id: 'companyName',
    type: STRING,
    value: '',
    defaultValue: '',

    metadata: {
        // Dynamic label based on account type
        label: {
            id: 'label',
            type: STRING,
            value: op('if',
                op('eq', ref('parent.accountType.value'), lit('business')),
                lit('Company Name'),
                lit('Full Name')
            )
        },
        // Dynamic visibility
        visible: {
            id: 'visible',
            type: BOOLEAN,
            value: op('neq', ref('parent.accountType.value'), lit('guest'))
        }
    },

    constraints: {
        // Conditional required
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: op('or',
                op('eq', ref('parent.accountType.value'), lit('guest')),
                op('isNotBlank', ref('self.value'))
            ),
            metadata: {
                message: { id: 'msg', type: STRING, value: 'Name is required' }
            }
        }
    }
};
```

This single Property:
- Has a **dynamic label** that changes based on account type
- Has **conditional visibility** (hidden for guests)
- Has a **conditional required** constraint (only required for non-guests)

All expressed as plain data structures!

---

## Serialization

Because everything is plain data, serialization is trivial:

```typescript
// Serialize full schema to JSON
const json = JSON.stringify(node.toJSON());

// Deserialize from JSON
const restored = PropertyNode.fromJSON(JSON.parse(json));

// Store in database
await db.properties.insert(node.toJSON());

// Send over network
await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(node.toJSON())
});
```

### Snapshots: Evaluated Values Only

When you need just the data values (without types, metadata, or constraints), use `snapshot()`:

```typescript
// Get evaluated values as key-value pairs
const data = await node.snapshot();
// { name: 'John', email: 'john@example.com', step: 1 }

// Perfect for form submission
await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(await form.snapshot())
});
```

**Key difference:**
- `toJSON()` — Full schema (types, metadata, constraints) for persistence and restoration
- `snapshot()` — Evaluated values only, ideal for data extraction and API submission

---

## Design Principles

1. **One Data Structure** — Everything is a Property
2. **Homoiconic** — Code and data share the same representation
3. **Self-Describing** — Properties carry their own type, constraints, and metadata
4. **Declarative** — Define what, not how
5. **Minimal Core** — No built-in operators, types, or constraints
6. **Extensible** — Build your domain on top
7. **Serializable** — Everything is plain JSON-compatible data

---

## Next Steps

- [Best Practices](./best-practices.md) — Patterns and guidelines
- [API Reference](./api-reference.md) — Complete API documentation
- [Getting Started](./getting-started.md) — Build your first application
