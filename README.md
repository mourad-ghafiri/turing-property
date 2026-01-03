# 🔮 Turing Property

<div align="center">

**A homoiconic property system where everything is a Property.**

*Declarative • Reactive • Safe • Serializable*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[📚 Documentation](./docs/getting-started.md) · [💡 Examples](./docs/examples/) · [🧩 API Reference](./docs/api-reference.md)

</div>

---

## ✨ The Core Insight

In most systems, you have separate concepts:
- **Types** (string, number, boolean...etc)
- **Values** (the actual data)
- **Expressions** (computed values)
- **Operators** (functions for computation)
- **Constraints** (validation rules)
- **Metadata** (labels, descriptions)

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

This is **homoiconicity** — code and data share the same representation.

---

## 🚀 Quick Start

### Installation

```bash
npm install turing-property
# or
yarn add turing-property
# or
bun add turing-property
```

### Your First Property (Raw Structure)

Everything is a Property — including types! Here's a property built from scratch:

```typescript
import { Property, PropertyNode, defaultRegistry, TYPE, STRING } from 'turing-property';

// Build a property using the raw structure
const userProfile: Property = {
    id: 'profile',
    type: TYPE,  // The Type type (itself a Property!)
    children: {
        name: {
            id: 'name',
            type: STRING,  // String type (a Property!)
            value: '',
            defaultValue: '',
            metadata: {
                label: { id: 'label', type: STRING, value: 'Name' }
            }
        },
        email: {
            id: 'email',
            type: STRING,
            value: '',
            metadata: {
                label: { id: 'label', type: STRING, value: 'Email' }
            }
        }
    }
};

// Wrap with PropertyNode for operations
const tree = new PropertyNode(userProfile);
tree.setRegistry(defaultRegistry);

// Get/set values
tree.setValue('John', ['name']);
const name = await tree.getValue(['name']);

// Navigate the tree
const emailNode = tree.child('email');
emailNode.path();  // ['email']

// Get evaluated metadata
const label = await emailNode.getMetadata('label');

// Reset to defaults
tree.resetAll();
```

### Using Builtin Helpers

For productivity, use builtin property factories that create the same structures:

```typescript
import { pGroup, pText, pEmail, REQUIRED, PropertyNode, defaultRegistry } from 'turing-property';

// Same structure, but much more concise!
const userProfile = pGroup('profile', {
    name: pText('name', { constraints: { required: REQUIRED } }),
    email: pEmail('email', { constraints: { required: REQUIRED } })
});

const tree = new PropertyNode(userProfile);
tree.setRegistry(defaultRegistry);
```

---

## 🏷️ Types

Types are Properties too! The type system is fully homoiconic.

### Meta-Types

| Type | Description |
|------|-------------|
| `TYPE` | The type of all types (self-referential bootstrap) |
| `EXPR` | The type of all expressions |
| `OPERATOR` | The type of all operators |
| `CONSTRAINT` | The type of all constraints |
| `PROPERTY` | The type of user-defined properties |

### Primitive Types

| Type | Description |
|------|-------------|
| `STRING` | Text values |
| `NUMBER` | Numeric values |
| `BOOLEAN` | True/false values |
| `NULL` | Null value |
| `ANY` | Any value |

### Temporal Types

| Type | Description | Format |
|------|-------------|--------|
| `DATE` | Date only | `YYYY-MM-DD` |
| `DATETIME` | Date and time | ISO 8601 |
| `TIME` | Time only | `HH:mm:ss` |
| `DURATION` | Time span | ISO 8601 duration |
| `TIMESTAMP` | Unix timestamp | Milliseconds |

### Structural Types

| Type | Description | Factory |
|------|-------------|---------|
| `LIST` | Array of elements | `tList(STRING)` |
| `OBJECT` | Named properties | `tObject({ name: STRING })` |
| `RECORD` | Dictionary | `tRecord(NUMBER)` |
| `UNION` | One of multiple types | `tUnion(STRING, NULL)` |
| `INTERSECTION` | All of multiple types | `tIntersection(A, B)` |
| `LITERAL` | Exact value | `tLiteral('admin')` |
| `FUNCTION` | Function signature | `tFunction([STRING], NUMBER)` |
| `ENUM` | Enumeration | `tEnum('Status', ['active', 'inactive'])` |

```typescript
import { TYPE, STRING, NUMBER, DATE, DATETIME, tList, tUnion, tEnum } from 'turing-property';

// Types are Properties!
const myType: Property = {
    id: 'Email',
    type: TYPE,  // Its type is TYPE itself
    metadata: {
        description: { id: 'desc', type: STRING, value: 'An email address' }
    }
};

// Type factories
const stringList = tList(STRING);           // List<String>
const nullable = tUnion(STRING, NULL);      // String | Null

// Enum types (with strings or numbers)
const status = tEnum('Status', ['pending', 'active', 'completed']);
const priority = tEnum('Priority', { LOW: 1, MEDIUM: 2, HIGH: 3 });
```

---

## 🔢 Expressions

Expressions are Properties that compute values. Three types:

### LIT (Literal)

Constant values:

```typescript
import { lit, LIT } from 'turing-property';

// Using helper
lit('Hello');      // → 'Hello'
lit(42);           // → 42
lit(true);         // → true

// Raw structure
const literal: Property = {
    id: 'greeting',
    type: LIT,
    value: 'Hello, World!'
};
```

### REF (Reference)

References to other properties:

```typescript
import { ref, REF } from 'turing-property';

// Using helper
ref(['self', 'value']);                    // Current property's value
ref(['parent', 'children', 'name', 'value']); // Sibling's value
ref(['root', 'children', 'config', 'value']); // From root

// Raw structure
const reference: Property = {
    id: 'nameRef',
    type: REF,
    value: ['parent', 'children', 'name', 'value']
};
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

**Shortcut**: You can omit `children` and `metadata` — e.g., `['parent', 'name', 'value']` equals `['parent', 'children', 'name', 'value']`.

### OP (Operator)

Operator invocations:

```typescript
import { op, lit, ref, OP } from 'turing-property';

// Using helper
op('add', lit(2), lit(3));                           // → 5
op('concat', lit('Hello, '), ref(['name']));         // → 'Hello, John'
op('if', op('gt', ref(['age']), lit(18)), lit('Adult'), lit('Minor'));

// Raw structure
const operation: Property = {
    id: 'sum',
    type: OP,
    value: 'add',  // Operator name
    children: {
        arg0: { id: 'arg0', type: LIT, value: 2 },
        arg1: { id: 'arg1', type: LIT, value: 3 }
    }
};
```

---

## ⚙️ Operators

145+ built-in operators power the expression system:

### Arithmetic

```typescript
op('add', lit(2), lit(3));     // → 5
op('sub', lit(10), lit(4));    // → 6
op('mul', lit(3), lit(4));     // → 12
op('div', lit(20), lit(4));    // → 5
op('mod', lit(10), lit(3));    // → 1
op('pow', lit(2), lit(8));     // → 256
op('abs', lit(-5));            // → 5
op('round', lit(3.7));         // → 4
op('floor', lit(3.9));         // → 3
op('ceil', lit(3.1));          // → 4
```

### Comparison

```typescript
op('eq', lit(5), lit(5));      // → true
op('neq', lit(5), lit(3));     // → true
op('gt', lit(10), lit(5));     // → true
op('gte', lit(5), lit(5));     // → true
op('lt', lit(3), lit(5));      // → true
op('lte', lit(5), lit(5));     // → true
```

### Logic

```typescript
op('and', lit(true), lit(false));  // → false
op('or', lit(true), lit(false));   // → true
op('not', lit(false));             // → true
op('if', lit(true), lit('yes'), lit('no'));  // → 'yes'
```

### String

```typescript
op('concat', lit('Hello, '), lit('World'));  // → 'Hello, World'
op('upper', lit('hello'));                   // → 'HELLO'
op('lower', lit('HELLO'));                   // → 'hello'
op('trim', lit('  hello  '));                // → 'hello'
op('strlen', lit('hello'));                  // → 5
op('substr', lit('hello'), lit(0), lit(2));  // → 'he'
op('startsWith', lit('hello'), lit('he'));   // → true
op('endsWith', lit('hello'), lit('lo'));     // → true
op('contains', lit('hello'), lit('ell'));    // → true
op('matches', lit('test@email.com'), lit('^[^@]+@[^@]+$'));  // → true
```

### Array

```typescript
op('len', lit([1, 2, 3]));                   // → 3
op('at', lit(['a', 'b', 'c']), lit(1));      // → 'b'
op('first', lit([1, 2, 3]));                 // → 1
op('last', lit([1, 2, 3]));                  // → 3
op('sum', lit([1, 2, 3, 4]));                // → 10
op('avg', lit([1, 2, 3, 4]));                // → 2.5
op('min', lit([5, 2, 8, 1]));                // → 1
op('max', lit([5, 2, 8, 1]));                // → 8
op('includes', lit([1, 2, 3]), lit(2));      // → true
op('join', lit(['a', 'b', 'c']), lit('-'));  // → 'a-b-c'
```

### Date

```typescript
op('now');                                   // → current timestamp
op('today');                                 // → today's date
op('year', lit('2024-01-15'));               // → 2024
op('month', lit('2024-01-15'));              // → 1
op('day', lit('2024-01-15'));                // → 15
op('dateDiff', lit(date1), lit(date2), lit('days'));
op('dateAdd', lit(date), lit(7), lit('days'));
```

### Validation

```typescript
op('isNotBlank', ref(['self', 'value']));
op('isEmail', ref(['self', 'value']));
op('isUrl', ref(['self', 'value']));
op('isNumber', ref(['self', 'value']));
op('isInteger', ref(['self', 'value']));
```

---

## ✅ Constraints

Constraints are Properties that validate values:

```typescript
import { REQUIRED, MIN_LENGTH, MAX_LENGTH, PATTERN, MIN, MAX } from 'turing-property';

// Using builtin constraints
const email = pEmail('email', {
    constraints: {
        required: REQUIRED,
        maxLength: MAX_LENGTH(255)
    }
});

const password = pPassword('password', 8, {
    constraints: {
        required: REQUIRED,
        minLength: MIN_LENGTH(8),
        pattern: PATTERN('^(?=.*[A-Z])(?=.*[0-9])', 'Must have uppercase and number')
    }
});

const age = pNumber('age', {
    constraints: {
        min: MIN(0),
        max: MAX(150)
    }
});
```

### Builtin Constraints

| Constraint | Description |
|------------|-------------|
| `REQUIRED` | Value must not be empty |
| `MIN_LENGTH(n)` | Minimum string length |
| `MAX_LENGTH(n)` | Maximum string length |
| `MIN(n)` | Minimum numeric value |
| `MAX(n)` | Maximum numeric value |
| `PATTERN(regex, msg)` | Must match regex |
| `EMAIL` | Valid email format |
| `URL` | Valid URL format |
| `MIN_ITEMS(n)` | Minimum array length |
| `MAX_ITEMS(n)` | Maximum array length |
| `EQUALS_FIELD(path)` | Must equal another field |
| `ACCEPTED` | Must be true (checkboxes) |

### Custom Constraints

```typescript
// Raw constraint structure
const customConstraint: Property = {
    id: 'evenNumber',
    type: CONSTRAINT,
    value: {
        id: 'check',
        type: OP,
        value: 'eq',
        children: {
            arg0: { id: 'a', type: OP, value: 'mod', children: {
                arg0: { id: 'v', type: REF, value: ['self', 'value'] },
                arg1: { id: 'n', type: LIT, value: 2 }
            }},
            arg1: { id: 'b', type: LIT, value: 0 }
        }
    },
    metadata: {
        message: { id: 'msg', type: STRING, value: 'Must be an even number' }
    }
};
```

---

## 🎨 Metadata

Metadata are Properties that describe other Properties:

```typescript
import { label, hint, placeholder, visible, disabled } from 'turing-property';

const field = pText('name', {
    metadata: {
        label: label('Full Name'),
        hint: hint('Enter your legal name'),
        placeholder: placeholder('John Doe'),
        visible: visible(true),
        disabled: disabled(false)
    }
});
```

### Dynamic Metadata

Metadata can be expressions that evaluate at runtime:

```typescript
const nameField = pText('name', {
    metadata: {
        // Label changes based on account type
        label: label(
            op('if',
                op('eq', ref(['parent', 'children', 'accountType', 'value']), lit('business')),
                lit('Company Name'),
                lit('Full Name')
            )
        ),
        
        // Visibility based on condition
        visible: visible(
            op('eq', ref(['parent', 'children', 'showDetails', 'value']), lit(true))
        ),
        
        // Disabled based on another field
        disabled: disabled(
            op('not', ref(['parent', 'children', 'isEditable', 'value']))
        )
    }
});
```

### Metadata Categories

| Category | Helpers |
|----------|---------|
| **Common** | `label`, `hint`, `description`, `placeholder`, `tooltip`, `visible`, `hidden`, `disabled`, `readonly`, `required` |
| **Input** | `inputType`, `autocomplete`, `inputMode`, `step`, `min`, `max`, `rows`, `cols` |
| **Layout** | `layout`, `gap`, `order`, `width`, `height`, `align`, `justify`, `variant`, `styleClasses` |
| **Collection** | `options`, `searchable`, `clearable`, `sortable`, `minItems`, `maxItems` |
| **Container** | `isGroup`, `isForm`, `isStep`, `isWizard`, `collapsible`, `collapsed` |
| **Action** | `submitLabel`, `resetLabel`, `nextLabel`, `prevLabel`, `showProgress` |

---

## 🌳 PropertyNode

`PropertyNode` wraps a `Property` and provides tree navigation, value operations, and more:

### Navigation

```typescript
const tree = new PropertyNode(myProperty);
tree.setRegistry(defaultRegistry);

// Navigate
tree.child('name');              // Get child by key
tree.getByPath(['user', 'name']); // Get by path
tree.parent;                     // Parent node
tree.root;                       // Root node
tree.descendants();              // All descendants
tree.ancestors();                // All ancestors
tree.siblings();                 // All siblings
tree.path();                     // Path from root
```

### Values

```typescript
// Get/set values
await tree.getValue(['name']);    // Evaluate and get
tree.setValue('John', ['name']);  // Set value

// Defaults
tree.getDefaultValue();           // Raw default
await tree.getDefaultValueEvaluated();  // Evaluated default
tree.hasDefaultValue();           // Check if exists
```

### Snapshot

Extract all values as key-value objects:

```typescript
// Nested object
const values = await tree.snapshot();
// { user: { name: 'John', email: 'john@test.com' }, status: 'active' }

// Flat with dot notation
const flat = await tree.snapshotFlat();
// { 'user.name': 'John', 'user.email': 'john@test.com', 'status': 'active' }

// Set from object
tree.setFromSnapshot({ user: { name: 'Jane' } });
tree.setFromSnapshotFlat({ 'user.name': 'Jane' });
```

### Reset Operations

```typescript
tree.resetNode();                // Reset this node
tree.resetDeep();                // Reset node and all descendants
tree.resetAll();                 // Reset entire tree
tree.resetChildren();            // Reset only children
tree.resetByPath(['user', 'name']); // Reset specific path
tree.resetModified();            // Reset only modified nodes
tree.clear();                    // Set value to undefined
tree.clearAll();                 // Clear all values
```

### Dirty Checking

```typescript
tree.isDirty();                  // Any node modified?
tree.isDirtyNode();              // This node modified?
tree.getModifiedFields();        // [['user', 'name'], ['status']]
tree.getModifiedFieldsFlat();    // ['user.name', 'status']
```

### Tree Statistics

```typescript
tree.countNodes();               // Total nodes
tree.maxDepth();                 // Maximum depth
tree.collectIds();               // All IDs
tree.hasDuplicateIds();          // Check for duplicates
tree.getDuplicateIds();          // Get duplicate IDs
```

---

## 🧩 Builtin Properties

Pre-configured property factories for common use cases:

### Input Properties

```typescript
pText('name');                   // Text input
pEmail('email');                 // Email with validation
pPassword('password', 8);        // Password with min length
pNumber('age');                  // Numeric input
pTextarea('bio');                // Multi-line text
pCheckbox('agree');              // Boolean checkbox
pPhone('phone');                 // Phone number
pUrl('website');                 // URL with validation
```

### Select Properties

```typescript
pSelect('country', options);     // Dropdown
pRadio('gender', options);       // Radio buttons
pMultiSelect('skills', options); // Multiple selection
pButtonGroup('priority', options); // Button group
```

### Date Properties

```typescript
pDate('birthDate');              // Date picker
pDateTime('appointment');        // Date + time
pTime('startTime');              // Time only
pDateRange('vacation');          // Date range
```

### Container Properties

```typescript
pGroup('personal', { name, email });  // Group fields
pForm('contact', { name, message });  // Form container
pWizard('onboarding', [step1, step2]); // Multi-step wizard
pStep('account', { email, password }); // Wizard step
pRepeater('items', itemTemplate);      // Repeatable items
pConditional('extra', condition, children); // Conditional
pComputed('total', expression);        // Computed value
```

### Composite Properties

```typescript
pFullName('name');               // First + Last name
pAddress('address');             // Street, City, State, Zip
pCreditCardInfo('payment');      // Card, CVV, Expiry
pLoginCredentials('login');      // Email + Password
pRegistration('register');       // Full registration form
```

---

## 📖 Examples

### 🛒 Order with Computed Values

```typescript
const order = pGroup('order', {
    items: pRepeater('items', pGroup('item', {
        name: pText('name'),
        price: pCurrency('price'),
        quantity: pQuantity('quantity')
    })),
    
    // Computed total
    total: pComputed('total',
        op('sum',
            op('map',
                ref(['parent', 'children', 'items', 'value']),
                op('mul', ref(['item', 'price']), ref(['item', 'quantity']))
            )
        )
    ),
    
    // Conditional discount
    discount: pComputed('discount',
        op('if',
            op('gte', ref(['parent', 'total', 'value']), lit(100)),
            lit(10),  // 10% off for orders over $100
            lit(0)
        )
    )
});
```

### 🎭 Conditional Properties

```typescript
const config = pGroup('config', {
    mode: pSelect('mode', [
        { value: 'simple', label: 'Simple' },
        { value: 'advanced', label: 'Advanced' }
    ]),
    
    // Only visible in advanced mode
    advancedOptions: pGroup('advancedOptions', {
        threads: pNumber('threads'),
        timeout: pNumber('timeout')
    }, {
        metadata: {
            visible: visible(
                op('eq', ref(['parent', 'children', 'mode', 'value']), lit('advanced'))
            )
        }
    })
});
```

### 🔄 Multi-Step Wizard

```typescript
const registration = pWizard('registration', [
    pStep('account', {
        email: pEmail('email', { constraints: { required: REQUIRED } }),
        password: pPassword('password', 8, { constraints: { required: REQUIRED } }),
        confirmPassword: pPassword('confirmPassword', 8, {
            constraints: {
                required: REQUIRED,
                match: EQUALS_FIELD(['parent', 'children', 'password'])
            }
        })
    }),
    pStep('profile', {
        name: pFullName('name'),
        avatar: pAvatar('avatar')
    }),
    pStep('preferences', {
        theme: pSelect('theme', themes),
        notifications: pCheckbox('notifications')
    })
]);
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [🚀 Getting Started](./docs/getting-started.md) | Quick start guide |
| [🧠 Core Concepts](./docs/core-concepts.md) | Understand the Property model |
| [📖 API Reference](./docs/api-reference.md) | Complete API documentation |
| [🏷️ Types](./docs/types.md) | The type system |
| [🌳 PropertyNode](./docs/property-node.md) | Working with property trees |
| [🔢 Expressions](./docs/expressions.md) | `lit`, `ref`, `op` deep dive |
| [⚙️ Operators](./docs/operators.md) | 145+ built-in operators |
| [🎨 Metadata](./docs/metadata.md) | Dynamic metadata system |
| [✅ Constraints](./docs/constraints.md) | Validation rules |
| [🧩 Properties](./docs/properties.md) | All builtin properties |
| [🛠️ Utilities](./docs/utilities.md) | Traversal, serialization, diff |
| [💡 Examples](./docs/examples/) | Real-world patterns |

---

## 🏗️ Project Structure

```
src/
├── core/               # Core system
│   ├── property.ts     # Property interface
│   ├── evaluate.ts     # Expression evaluation
│   └── node.ts         # PropertyNode wrapper
├── builtin/
│   ├── types/          # Type Properties (TYPE, STRING, NUMBER, etc.)
│   ├── expressions/    # Expression factories (lit, ref, op)
│   ├── operators/      # 145+ operators (add, eq, concat, etc.)
│   ├── constraints/    # Validation rules (REQUIRED, MIN, etc.)
│   ├── metadata/       # Metadata helpers (label, hint, visible, etc.)
│   └── properties/     # Property factories (pText, pEmail, etc.)
└── utils/              # Utilities
    ├── traversal.ts    # Tree navigation
    ├── serialization.ts# JSON conversion
    └── clone.ts        # Deep cloning
```

---

## 🎯 Use Cases

Turing Property is designed for **declarative data modeling with computed relationships**. It excels in domains where you need to define structures with dynamic, reactive values.

### ✅ Ideal Use Cases

| Domain | Use Case | Why It's Great |
|--------|----------|----------------|
| **Dynamic Forms** | Multi-step wizards, conditional fields, computed totals | Expressions auto-compute values, metadata controls visibility |
| **Workflow Editors** | BPMN processes, state machines, approval flows | State transitions and conditions are naturally expressed |
| **AI Agent Builders** | Agent configuration, tool chains, RAG pipelines | Model agent state, costs, and routing decisions declaratively |
| **Rule Engines** | Business rules, pricing logic, eligibility criteria | Conditions and outcomes expressed as properties |
| **Configuration UIs** | Feature flags, settings panels, admin dashboards | Reactive configuration with validation |
| **Data Pipelines** | ETL schemas, validation rules, transformation logic | Input/output schemas with constraints |
| **Content Management** | Structured content, templates, SEO scoring | Content types with computed metadata |
| **Financial Calculators** | Loan amortization, compound interest, tax calculators | Complex formulas as expression trees |
| **Game State** | Character stats, inventory, combat calculations | Derived attributes and state management |
| **IoT Dashboards** | Sensor monitoring, alert thresholds, health scoring | Real-time computed metrics |
| **Graph/Network Editors** | Org charts, social networks, dependency graphs | Nodes with computed relationships |
| **Schema Builders** | API schemas, database models, GraphQL types | Type definitions with validation |

### 🚀 System Strengths

| Strength | Description |
|----------|-------------|
| **Unified Data Model** | Everything is a Property — types, values, expressions, constraints, metadata. One structure to learn. |
| **Declarative Expressions** | Define *what* to compute, not *how*. `op('mul', ref(['quantity']), ref(['price']))` |
| **Reactive Computation** | Change an input, and all dependent computed values update automatically |
| **Self-Describing** | Every property carries its type, validation rules, and UI hints |
| **Serializable** | Entire property trees are plain JSON — save, transmit, version control |
| **145+ Operators** | Rich built-in operators for math, strings, arrays, dates, logic |
| **Extensible** | Add custom operators, types, and constraints |
| **Type-Safe** | Full TypeScript support with inference |
| **Cacheable** | Expression results are cached for 25-32x speedup on repeated evaluations |
| **Safe Execution** | All computations are guaranteed to terminate (no infinite loops) |

### ⚠️ When NOT to Use

| Scenario | Why | Alternative |
|----------|-----|-------------|
| **General-Purpose Programming** | Not a replacement for JavaScript/TypeScript | Use a real programming language |
| **Unbounded Loops** | No while loops or unbounded recursion | Use `map`/`filter`/`reduce` on finite arrays |
| **Real-Time Streaming** | Designed for reactive state, not continuous streams | Use RxJS, Kafka, etc. |
| **Sub-Millisecond Latency** | Async evaluation has overhead | Use raw JavaScript for hot paths |
| **Direct Hardware Access** | Abstraction layer for data modeling | Use native APIs |
| **Complex Algorithms** | Expression trees get verbose for complex logic | Write custom operators |
| **Recursive Data Structures** | Infinite recursion not supported | Flatten or limit depth |

---

## 📊 Technical Characteristics

### Computation Model

Turing Property implements a **total functional language** — all computations are guaranteed to terminate.

| Property | Value | Implication |
|----------|-------|-------------|
| **Turing Complete** | ❌ No | Cannot express all computable functions |
| **Termination Guaranteed** | ✅ Yes | All expressions always complete |
| **Infinite Loops** | ❌ Not possible | Safe to run user-defined expressions |
| **Recursion** | ⚠️ Limited | Max evaluation depth prevents stack overflow |
| **Iteration** | ✅ Via operators | `map`, `filter`, `reduce` on finite arrays |

This is **intentional** — for UI editors and configuration systems, you want:
- Predictable evaluation time
- No risk of hanging the UI
- Safe execution of user-defined logic

### Expression System

| Feature | Supported | Notes |
|---------|-----------|-------|
| **Literals** | ✅ | Any JSON value |
| **References** | ✅ | Navigate to any property in the tree |
| **Operators** | ✅ | 145+ built-in, extensible |
| **Conditionals** | ✅ | `op('if', condition, then, else)` |
| **Array Operations** | ✅ | `map`, `filter`, `reduce`, `sum`, `avg` |
| **String Operations** | ✅ | `concat`, `upper`, `substr`, `matches` |
| **Date Operations** | ✅ | `dateDiff`, `dateAdd`, `now`, `today` |
| **Custom Operators** | ✅ | Register via `registry.register()` |

### Performance Characteristics

| Aspect | Characteristic |
|--------|----------------|
| **Evaluation** | Asynchronous (returns Promises) |
| **Caching** | Results cached until inputs change |
| **Complexity** | O(n) where n = expression tree size |
| **Memory** | Proportional to property tree size |
| **Serialization** | O(n) JSON serialization |

### Evaluation Depth

To prevent runaway expressions, there's a maximum evaluation depth:

```typescript
// This is fine
op('add', op('mul', lit(2), lit(3)), lit(4))  // depth = 2

// Very deep nesting may hit limits
op('add', op('add', op('add', ... )))  // depth = 50+
```

For most UI/form use cases (10-20 levels of nesting), this limit is never reached.

---

## 🔧 Design Principles

1. **One Data Structure** — Everything is a Property. No exceptions.
2. **Homoiconic** — Code and data share the same representation.
3. **Declarative** — Define what you want, not how to compute it.
4. **Lazy Evaluation** — Expressions evaluate only when needed.
5. **Self-Describing** — Every Property carries its type, constraints, and metadata.
6. **Serializable** — Everything is plain data that can be JSON-serialized.

---

## ⚡ Performance

Turing Property is optimized for production use. Benchmarks run on real-world scenarios:

### Form Operations

| Operation | Scale | Time | Notes |
|-----------|-------|------|-------|
| Form creation | 1000 fields | 0.28ms | Sub-millisecond |
| Form + constraints + metadata | 1000 fields | ~0.5ms | Full-featured forms |
| Deep tree creation | 2047 nodes (depth=10) | 0.21ms | Handles deep nesting |
| Tree traversal | 1000 fields | 0.6-0.8ms | countNodes, maxDepth, collectIds |
| Snapshot/restore | 1000 fields | 0.7ms / 0.1ms | Fast state management |

### Expression Evaluation

| Operation | Scale | Time | Notes |
|-----------|-------|------|-------|
| Literal evaluation | 5000 evals | 2.8ms | 0.0006ms per eval |
| Arithmetic operations | 1000 evals | 2.2ms | add, mul, etc. |
| String operations | 1000 evals | 3.6ms | concat, upper, etc. |
| Conditional logic | 1000 evals | 3.3ms | if/else chains |
| Caching speedup | - | 25-32x | Repeated evaluations |

### Validation

| Operation | Scale | Time | Notes |
|-----------|-------|------|-------|
| REQUIRED constraint | 1000 fields | ~4.7ms | Simple validation |
| Multiple constraints | 500 fields | ~4.3ms | Combined rules |
| Pattern matching | 500 fields | ~4.0ms | Regex validation |
| Deep nested validation | 728 nodes (depth=6) | ~6ms | Complex trees |

### Key Takeaways

- **Sub-millisecond form creation** — Even 1000-field forms with constraints and metadata create in under 0.5ms
- **Efficient caching** — 25-32x speedup on repeated expression evaluations
- **Linear scaling** — Operations scale linearly with form size
- **Production-ready** — All operations complete well under 16ms (60fps threshold)

For typical form sizes (50-200 fields), everything runs in **under 1ms**.

Run benchmarks yourself:

```bash
bun test tests/benchmarks/
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

MIT © Turing Property

---

<div align="center">

**Built with ❤️ for developers who love elegant abstractions**

[⬆ Back to Top](#-turing-property)

</div>
