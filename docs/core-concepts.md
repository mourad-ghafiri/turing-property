# 🧠 Core Concepts

Understanding the foundational principles and building blocks of Turing Property.

---

## 🎯 The Core Insight: One Data Structure

In most systems, you have separate concepts:
- Types (string, number, boolean)
- Values (the actual data)
- Expressions (computed values)
- Validation rules
- Metadata (labels, descriptions)

**Turing Property takes a radical approach: there is only ONE data structure.**

Everything in the system — types, values, expressions, constraints, metadata — is represented as a `Property`.

---

## 📦 The Property Interface

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

### 🔑 Key Observations

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

## 🔄 Homoiconicity

**Homoiconicity** means code and data share the same representation.

### Data as Property

```typescript
// A simple string value
const name: Property = {
    id: 'name',
    type: { id: 'String', type: TYPE },  // type is also a Property
    value: 'John'
};

// A number value
const age: Property = {
    id: 'age',
    type: { id: 'Number', type: TYPE },
    value: 25
};
```

### Code as Property

Expressions are also Properties! Here's a literal expression:

```typescript
// Literal expression: wraps a static value
const literalExpr: Property = {
    id: 'greeting',
    type: { id: 'Lit', type: TYPE },  // LIT type
    value: 'Hello, World!'
};
```

A reference expression points to another property:

```typescript
// Reference expression: points to a path in the tree
const refExpr: Property = {
    id: 'nameRef',
    type: { id: 'Ref', type: TYPE },  // REF type
    value: ['parent', 'children', 'name', 'value']  // Path array
};
```

An operator expression combines other expressions:

```typescript
// Operator expression: calls an operator with arguments
const concatExpr: Property = {
    id: 'fullGreeting',
    type: { id: 'Op', type: TYPE },  // OP type
    value: 'concat',                  // Operator name
    children: {
        arg0: {
            id: 'arg0',
            type: { id: 'Lit', type: TYPE },
            value: 'Hello, '
        },
        arg1: {
            id: 'arg1',
            type: { id: 'Ref', type: TYPE },
            value: ['parent', 'children', 'name', 'value']
        }
    }
};
```

Both data and code are Properties! You can:
- 📦 **Serialize** them to JSON
- 🔍 **Inspect** them at runtime
- 🔀 **Transform** them programmatically
- 💾 **Store** them in databases
- 🌐 **Transfer** them over network

---

## 🏗️ Bootstrap: The Type of Types

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
// Primitive types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
const NULL: Property = { id: 'Null', type: TYPE };
const ANY: Property = { id: 'Any', type: TYPE };

// Expression types
const LIT: Property = { id: 'Lit', type: TYPE };
const REF: Property = { id: 'Ref', type: TYPE };
const OP: Property = { id: 'Op', type: TYPE };

// Constraint type
const CONSTRAINT: Property = { id: 'Constraint', type: TYPE };
```

### 🌳 Type Hierarchy

```
TYPE (type of types)
 ├── STRING
 ├── NUMBER
 ├── BOOLEAN
 ├── NULL
 ├── ANY
 ├── LIT (literal expression)
 ├── REF (reference expression)
 ├── OP (operator expression)
 ├── CONSTRAINT
 └── ... structural types (LIST, OBJECT, UNION, etc.)
```

---

## 🌳 Property Trees

Properties form trees through the `children` field:

```typescript
// A form with nested fields
const contactForm: Property = {
    id: 'contactForm',
    type: { id: 'Object', type: TYPE },
    children: {
        personal: {
            id: 'personal',
            type: { id: 'Object', type: TYPE },
            children: {
                name: {
                    id: 'name',
                    type: STRING,
                    value: ''
                },
                email: {
                    id: 'email',
                    type: STRING,
                    value: ''
                }
            }
        },
        message: {
            id: 'message',
            type: STRING,
            value: ''
        }
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

### 🧭 Tree Navigation

Navigate trees using `PropertyNode`:

```typescript
import { PropertyNode } from 'turing-property';

const form = new PropertyNode(contactForm);

// Access children
const personal = form.child('personal');
const name = personal?.child('name');

// Get path from root
name?.path();  // ['personal', 'name']

// Get parent
name?.parent;  // personal node

// Get root
name?.root;    // contactForm node

// Get siblings
personal?.siblings();  // { message: PropertyNode }
```

---

## 🔗 The Expression System

Expressions are the core mechanism for dynamic behavior. There are three expression types:

### 1️⃣ Literal (`LIT`)

Wraps a static value:

```typescript
const literal: Property = {
    id: 'myLiteral',
    type: LIT,
    value: 42  // Any static value
};

// When evaluated, returns: 42
```

### 2️⃣ Reference (`REF`)

Points to another property using a path:

```typescript
const reference: Property = {
    id: 'myRef',
    type: REF,
    value: ['parent', 'children', 'email', 'value']  // Path array
};

// When evaluated, navigates to the path and returns the value
```

### 🗺️ Path Segments

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

**Shortcut**: You can omit `children` and `metadata` — the system checks children first, then metadata:

```typescript
// Equivalent paths:
['parent', 'children', 'name', 'value']
['parent', 'name', 'value']  // shortcut
```

### 3️⃣ Operator (`OP`)

Calls an operator function with arguments:

```typescript
const operation: Property = {
    id: 'myOp',
    type: OP,
    value: 'add',  // Operator name
    children: {
        arg0: { id: 'arg0', type: LIT, value: 10 },
        arg1: { id: 'arg1', type: LIT, value: 5 }
    }
};

// When evaluated: calls add(10, 5) → returns 15
```

### 🔄 Nested Expressions

Expressions can nest infinitely:

```typescript
// Expression: if(isEmpty(name), 'Guest', uppercase(name))
const greeting: Property = {
    id: 'greeting',
    type: OP,
    value: 'if',
    children: {
        arg0: {
            id: 'condition',
            type: OP,
            value: 'isEmpty',
            children: {
                arg0: { id: 'arg0', type: REF, value: ['root', 'children', 'name', 'value'] }
            }
        },
        arg1: { id: 'then', type: LIT, value: 'Guest' },
        arg2: {
            id: 'else',
            type: OP,
            value: 'upper',
            children: {
                arg0: { id: 'arg0', type: REF, value: ['root', 'children', 'name', 'value'] }
            }
        }
    }
};
```

---

## ⚡ Evaluation

The `evaluate` function processes expressions:

```typescript
import { evaluate } from 'turing-property';

// Evaluation context
const ctx = {
    current: myProperty,     // Property being evaluated
    root: rootProperty,      // Root of the tree
    registry: operatorRegistry  // Map of operator functions
};

const result = await evaluate(expression, ctx);
```

### 🔄 Evaluation Rules

1. **Literal (`LIT`)** → Return `value` directly
2. **Reference (`REF`)** → Navigate path, return found value
3. **Operator (`OP`)** → Evaluate all args, call operator function
4. **Non-expression** → Return as-is (passthrough)

### 📝 Operator Registry

Operators are functions registered by name. The system provides 145+ built-in operators:

```typescript
import { defaultRegistry, createRegistry } from 'turing-property';

// Use the default registry with 145+ operators
tree.setRegistry(defaultRegistry);

// Or create a custom registry
const customRegistry = createRegistry();
customRegistry.register('myOp', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a + b;
});
```

### ⚙️ Built-in Operator Categories

| Category | Examples |
|----------|----------|
| **Arithmetic** | `add`, `sub`, `mul`, `div`, `mod`, `pow`, `sqrt`, `abs`, `min`, `max`, `sum`, `avg` |
| **Comparison** | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `inRange` |
| **Logic** | `and`, `or`, `not`, `if`, `coalesce`, `default` |
| **String** | `concat`, `upper`, `lower`, `trim`, `split`, `join`, `includes`, `matches` |
| **Array** | `len`, `first`, `last`, `map`, `filter`, `reduce`, `find`, `sort`, `unique` |
| **Type Check** | `isNull`, `isEmpty`, `isNumber`, `isString`, `isArray`, `isObject` |
| **Validation** | `isEmail`, `isUrl`, `isPhone`, `isUuid`, `isAlpha`, `isNumeric` |
| **Date** | `now`, `today`, `age`, `dateDiff`, `dateAdd`, `isFuture`, `isPast` |
| **Object** | `get`, `keys`, `values`, `entries`, `has`, `merge` |
| **Conversion** | `toNumber`, `toBoolean`, `toArray`, `toJson`, `fromJson` |

See [Operators Documentation](./operators.md) for the complete reference.

---

## 🏷️ Metadata System

Metadata describes properties — labels, hints, visibility, etc. Metadata values are Properties, enabling dynamic behavior:

```typescript
const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    metadata: {
        // Static label
        label: {
            id: 'label',
            type: STRING,
            value: 'Email Address'
        },
        // Static placeholder
        placeholder: {
            id: 'placeholder',
            type: STRING,
            value: 'user@example.com'
        },
        // DYNAMIC hint based on value
        hint: {
            id: 'hint',
            type: STRING,
            value: {  // value is an expression!
                id: 'hintExpr',
                type: OP,
                value: 'if',
                children: {
                    arg0: {
                        id: 'cond',
                        type: OP,
                        value: 'isEmpty',
                        children: {
                            arg0: { id: 'arg0', type: REF, value: ['self', 'value'] }
                        }
                    },
                    arg1: { id: 'then', type: LIT, value: 'Enter your email' },
                    arg2: { id: 'else', type: LIT, value: '✓ Email entered' }
                }
            }
        }
    }
};
```

When `getMetadata('hint')` is called, the expression evaluates dynamically!

---

## ✅ Constraints System

Constraints are validation rules. Each constraint is a Property whose value evaluates to `true` (valid) or `false` (invalid):

```typescript
const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    constraints: {
        // Required constraint
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: {  // Expression that checks validity
                id: 'check',
                type: OP,
                value: 'isNotBlank',
                children: {
                    arg0: { id: 'arg0', type: REF, value: ['self', 'value'] }
                }
            },
            metadata: {
                message: {
                    id: 'message',
                    type: STRING,
                    value: 'This field is required'
                }
            }
        },
        // Email format constraint
        email: {
            id: 'email',
            type: CONSTRAINT,
            value: {
                id: 'check',
                type: OP,
                value: 'isEmail',
                children: {
                    arg0: { id: 'arg0', type: REF, value: ['self', 'value'] }
                }
            },
            metadata: {
                message: {
                    id: 'message',
                    type: STRING,
                    value: 'Invalid email format'
                }
            }
        }
    }
};
```

---

## 🎭 Everything is Connected

The power of homoiconicity becomes clear when you see how everything connects:

```typescript
// A complete property with all aspects
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
            value: {
                id: 'labelExpr',
                type: OP,
                value: 'if',
                children: {
                    arg0: {
                        id: 'cond',
                        type: OP,
                        value: 'eq',
                        children: {
                            arg0: { id: 'a', type: REF, value: ['parent', 'children', 'accountType', 'value'] },
                            arg1: { id: 'b', type: LIT, value: 'business' }
                        }
                    },
                    arg1: { id: 'then', type: LIT, value: 'Company Name' },
                    arg2: { id: 'else', type: LIT, value: 'Full Name' }
                }
            }
        },
        // Dynamic visibility
        visible: {
            id: 'visible',
            type: BOOLEAN,
            value: {
                id: 'visibleExpr',
                type: OP,
                value: 'neq',
                children: {
                    arg0: { id: 'a', type: REF, value: ['parent', 'children', 'accountType', 'value'] },
                    arg1: { id: 'b', type: LIT, value: 'guest' }
                }
            }
        }
    },
    
    constraints: {
        // Conditional required
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: {
                id: 'check',
                type: OP,
                value: 'or',
                children: {
                    arg0: {
                        id: 'isGuest',
                        type: OP,
                        value: 'eq',
                        children: {
                            arg0: { id: 'a', type: REF, value: ['parent', 'children', 'accountType', 'value'] },
                            arg1: { id: 'b', type: LIT, value: 'guest' }
                        }
                    },
                    arg1: {
                        id: 'hasValue',
                        type: OP,
                        value: 'isNotBlank',
                        children: {
                            arg0: { id: 'a', type: REF, value: ['self', 'value'] }
                        }
                    }
                }
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

## 📦 Serialization

Because everything is plain data, serialization is trivial:

```typescript
// Serialize to JSON
const json = JSON.stringify(myProperty);

// Deserialize from JSON
const property = JSON.parse(json);

// Store in database
await db.properties.insert(myProperty);

// Send over network
await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(myProperty)
});
```

---

## 🎯 Design Principles

1. **One Data Structure** — Everything is a Property
2. **Homoiconic** — Code and data share the same representation
3. **Self-Describing** — Properties carry their own type, constraints, and metadata
4. **Declarative** — Define what, not how
5. **Lazy Evaluation** — Expressions evaluate only when needed
6. **Serializable** — Everything is plain JSON-compatible data
7. **Composable** — Properties nest infinitely

---

## 📚 Next Steps

- 🏷️ [Types](./types.md) — The type system (primitive, structural, meta-types)
- 🔢 [Expressions](./expressions.md) — Expression patterns with `lit`, `ref`, `op`
- ⚙️ [Operators](./operators.md) — Complete operator reference (145+ operators)
- 🎨 [Metadata](./metadata.md) — Dynamic metadata system
- ✅ [Constraints](./constraints.md) — Validation system
- 🧩 [Properties](./properties.md) — Builtin property factories
