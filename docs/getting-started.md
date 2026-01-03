# 🚀 Getting Started

Welcome to **Turing Property** — a Turing-complete, homoiconic property system where everything is a Property.

---

## 📦 Installation

```bash
# Using npm
npm install turing-property

# Using yarn
yarn add turing-property

# Using bun
bun add turing-property
```

---

## 🧱 Building Blocks

Before using builtin helpers, let's understand the core building blocks of the system.

### 1️⃣ The Property Interface

Everything in the system is a `Property`:

```typescript
interface Property {
    id: string;                            // Unique identifier
    type: Property;                        // Type (also a Property!)
    value?: unknown;                       // Value (static or expression)
    defaultValue?: unknown;                // Default value for reset
    metadata?: Record<string, Property>;   // Metadata (also Properties!)
    constraints?: Record<string, Property>;// Constraints (also Properties!)
    children?: Record<string, Property>;   // Children (also Properties!)
}
```

This single interface represents **everything**: types, data, expressions, operators, constraints, and metadata.

---

### 2️⃣ Types: Properties That Define Properties

Types are Properties themselves! The system bootstraps from a self-referential `TYPE`:

```typescript
import { TYPE, STRING, NUMBER, BOOLEAN } from 'turing-property';

// TYPE is its own type (self-reference)
// TYPE.type === TYPE

// Primitive types are Properties with type: TYPE
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
```

**Creating a property with a type:**

```typescript
// A simple string property
const name: Property = {
    id: 'name',
    type: STRING,   // type is a Property!
    value: 'John'
};

// A number property
const age: Property = {
    id: 'age',
    type: NUMBER,
    value: 25
};
```

---

### 3️⃣ Expressions: Code as Data

Expressions are Properties that compute values. There are three expression types:

#### Literal (`LIT`) — Static values

```typescript
import { LIT } from 'turing-property';

// Wraps a static value
const greeting: Property = {
    id: 'greeting',
    type: LIT,
    value: 'Hello, World!'
};
// When evaluated → 'Hello, World!'
```

#### Reference (`REF`) — Pointers to other properties

```typescript
import { REF } from 'turing-property';

// Points to a path in the property tree
const nameRef: Property = {
    id: 'nameRef',
    type: REF,
    value: ['parent', 'children', 'name', 'value']  // Path array
};
// When evaluated → navigates to path, returns value found
```

**Path segments:**

| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of the tree |
| `children` | Access children map |
| `metadata` | Access metadata map |
| `value` | Get the value |

#### Operator (`OP`) — Function calls

```typescript
import { OP, LIT } from 'turing-property';

// Calls an operator with arguments
const sum: Property = {
    id: 'add',          // Operator name
    type: OP,
    children: {
        arg0: { id: 'a', type: LIT, value: 10 },
        arg1: { id: 'b', type: LIT, value: 5 }
    }
};
// When evaluated → calls add(10, 5) → 15
```

**Nested expressions:**

```typescript
// Expression: if(age > 18, 'Adult', 'Minor')
const status: Property = {
    id: 'if',
    type: OP,
    children: {
        arg0: {  // condition: age > 18
            id: 'gt',
            type: OP,
            children: {
                arg0: { id: 'age', type: REF, value: ['root', 'children', 'age', 'value'] },
                arg1: { id: 'threshold', type: LIT, value: 18 }
            }
        },
        arg1: { id: 'then', type: LIT, value: 'Adult' },
        arg2: { id: 'else', type: LIT, value: 'Minor' }
    }
};
```

---

### 4️⃣ Operators: The Computation Engine

Operators are functions registered in a registry. The system includes 145+ built-in operators:

| Category | Examples |
|----------|----------|
| **Arithmetic** | `add`, `sub`, `mul`, `div`, `sum`, `avg`, `min`, `max` |
| **Comparison** | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between` |
| **Logic** | `and`, `or`, `not`, `if`, `coalesce` |
| **String** | `concat`, `upper`, `lower`, `trim`, `split`, `join` |
| **Array** | `len`, `map`, `filter`, `reduce`, `find`, `sort` |
| **Date** | `now`, `today`, `age`, `dateDiff`, `isFuture` |
| **Validation** | `isEmail`, `isUrl`, `isPhone`, `isUuid` |

```typescript
import { defaultRegistry, createRegistry } from 'turing-property';

// Use the default registry
tree.setRegistry(defaultRegistry);

// Or create custom operators
const registry = createRegistry();
registry.register('double', async (args, ctx) => {
    const [val] = await evalArgs(args, ctx);
    return (val as number) * 2;
});
```

---

### 5️⃣ Metadata: Properties That Describe Properties

Metadata values are Properties, enabling dynamic behavior:

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
        // DYNAMIC hint (expression!)
        hint: {
            id: 'hint',
            type: STRING,
            value: {  // value is an expression Property
                id: 'if',
                type: OP,
                children: {
                    arg0: {
                        id: 'isEmpty',
                        type: OP,
                        children: {
                            arg0: { id: 'val', type: REF, value: ['self', 'value'] }
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

When you call `getMetadata('hint')`, the expression evaluates dynamically!

---

### 6️⃣ Constraints: Validation as Properties

Constraints are Properties whose value evaluates to `true` (valid) or `false` (invalid):

```typescript
import { CONSTRAINT, OP, REF, LIT, STRING } from 'turing-property';

const emailField: Property = {
    id: 'email',
    type: STRING,
    value: '',
    constraints: {
        // Required constraint
        required: {
            id: 'required',
            type: CONSTRAINT,
            value: {  // Expression: isNotBlank(self.value)
                id: 'isNotBlank',
                type: OP,
                children: {
                    arg0: { id: 'val', type: REF, value: ['self', 'value'] }
                }
            },
            metadata: {
                message: { id: 'message', type: STRING, value: 'Required field' }
            }
        },
        // Email format constraint
        format: {
            id: 'format',
            type: CONSTRAINT,
            value: {
                id: 'isEmail',
                type: OP,
                children: {
                    arg0: { id: 'val', type: REF, value: ['self', 'value'] }
                }
            },
            metadata: {
                message: { id: 'message', type: STRING, value: 'Invalid email' }
            }
        }
    }
};
```

---

### 7️⃣ Property Trees: Nesting Properties

Properties can have children, creating tree structures:

```typescript
const userProfile: Property = {
    id: 'profile',
    type: TYPE,
    children: {
        personal: {
            id: 'personal',
            type: TYPE,
            children: {
                name: { id: 'name', type: STRING, value: '' },
                email: { id: 'email', type: STRING, value: '' }
            }
        },
        preferences: {
            id: 'preferences',
            type: TYPE,
            children: {
                theme: { id: 'theme', type: STRING, value: 'light' },
                notifications: { id: 'notifications', type: BOOLEAN, value: true }
            }
        }
    }
};
```

Tree structure:

```
profile
├── personal
│   ├── name
│   └── email
└── preferences
    ├── theme
    └── notifications
```

---

### 8️⃣ PropertyNode: Working with Trees

`PropertyNode` wraps a Property for navigation, evaluation, and mutations:

```typescript
import { PropertyNode, defaultRegistry } from 'turing-property';

// Create the node
const tree = new PropertyNode(userProfile);
tree.setRegistry(defaultRegistry);

// Navigate
const personal = tree.child('personal');
const name = tree.getByPath(['personal', 'name']);
name.path();    // → ['personal', 'name']
name.parent;    // → personal node
name.root;      // → profile node

// Get/set values
tree.setValue('John', ['personal', 'name']);
const value = await tree.getValue(['personal', 'name']);  // 'John'

// Get evaluated metadata
const hint = await name.getMetadata('hint');

// Snapshot: extract all values
const values = await tree.snapshot();
// { personal: { name: 'John', email: '' }, preferences: { theme: 'light', ... } }

// Reset
tree.resetAll();
```

---

## ⚡ Using Builtin Helpers

Now that you understand the building blocks, use builtin helpers for productivity:

### Expression Helpers

```typescript
import { lit, ref, op } from 'turing-property';

// Instead of raw LIT/REF/OP structures:
const expr = op('if',
    op('gt', ref(['age', 'value']), lit(18)),
    lit('Adult'),
    lit('Minor')
);
```

### Type Helpers

```typescript
import { tString, tNumber, tBoolean, tList, tObject } from 'turing-property';

// Instead of raw type references:
const type = tString();  // → { id: 'String', type: STRING }
const listType = tList(tNumber());  // List of numbers
```

### Metadata Helpers

```typescript
import { label, hint, placeholder, visible, disabled } from 'turing-property';

// Instead of raw metadata Properties:
const meta = {
    label: label('Username'),
    placeholder: placeholder('Enter username'),
    hint: hint(op('if', condition, lit('A'), lit('B')))
};
```

### Constraint Helpers

```typescript
import { REQUIRED, EMAIL, MIN_LENGTH, MAX_LENGTH, BETWEEN, PATTERN } from 'turing-property';

// Instead of raw constraint Properties:
const constraints = {
    required: REQUIRED,
    email: EMAIL,
    length: MIN_LENGTH(3),
    range: BETWEEN(0, 100)
};
```

---

## 🔄 Complete Example

Putting it all together:

```typescript
import {
    PropertyNode, defaultRegistry,
    STRING, NUMBER, TYPE, CONSTRAINT, OP, REF, LIT,
    REQUIRED, EMAIL, BETWEEN,
    label, hint, visible,
    op, ref, lit
} from 'turing-property';

// Define structure using raw Properties
const registration: Property = {
    id: 'registration',
    type: TYPE,
    children: {
        accountType: {
            id: 'accountType',
            type: STRING,
            value: 'personal'
        },
        name: {
            id: 'name',
            type: STRING,
            value: '',
            metadata: {
                // Dynamic label based on account type
                label: label(op('if',
                    op('eq', ref(['parent', 'parent', 'children', 'accountType', 'value']), lit('business')),
                    lit('Company Name'),
                    lit('Full Name')
                ))
            },
            constraints: { required: REQUIRED }
        },
        email: {
            id: 'email',
            type: STRING,
            value: '',
            constraints: { required: REQUIRED, email: EMAIL }
        },
        taxId: {
            id: 'taxId',
            type: STRING,
            value: '',
            metadata: {
                visible: visible(
                    op('eq', ref(['parent', 'parent', 'children', 'accountType', 'value']), lit('business'))
                )
            }
        }
    }
};

// Create tree and operate
const tree = new PropertyNode(registration);
tree.setRegistry(defaultRegistry);

// Set values
tree.setValue('business', ['accountType']);
tree.setValue('Acme Inc', ['name']);
tree.setValue('contact@acme.com', ['email']);
tree.setValue('12-3456789', ['taxId']);

// Get dynamic metadata
const nameLabel = await tree.child('name')?.getMetadata('label');  // 'Company Name'
const taxIdVisible = await tree.child('taxId')?.getMetadata('visible');  // true

// Get all values
const values = await tree.snapshot();
// { accountType: 'business', name: 'Acme Inc', email: 'contact@acme.com', taxId: '12-3456789' }

// Reset to defaults
tree.resetAll();
```

---

## 📚 Next Steps

| Topic | Description |
|-------|-------------|
| 📖 [Core Concepts](./core-concepts.md) | Deep dive into the Property model |
| 🏷️ [Types](./types.md) | The type system |
| 🌳 [PropertyNode](./property-node.md) | Tree navigation and operations |
| 🔢 [Expressions](./expressions.md) | `lit`, `ref`, `op` in detail |
| ⚙️ [Operators](./operators.md) | 145+ built-in operators reference |
| 🎨 [Metadata](./metadata.md) | Dynamic metadata system |
| ✅ [Constraints](./constraints.md) | Validation rules |
| 🛠️ [Utilities](./utilities.md) | Traversal, serialization, diff |
| 💡 [Examples](./examples/) | Real-world use cases |

---

## 🌟 Why Turing Property?

| Feature | Benefit |
|---------|---------|
| **One Data Structure** | Everything is a Property — types, values, expressions, constraints |
| **Homoiconic** | Code and data share the same representation |
| **Serializable** | Everything is plain JSON — trivially persist and transfer |
| **Dynamic** | Metadata can be expressions that evaluate at runtime |
| **Composable** | Properties nest infinitely — build complex structures |
| **Turing-complete** | Express any computation with operators |
| **Type-safe** | Full TypeScript support with inference |

---

## 🆘 Need Help?

- 📚 Read the [full documentation](./core-concepts.md)
- 🐛 Report issues on GitHub
- 💬 Join our community discussions

