# Expressions

Expressions are Properties that compute values dynamically.

---

## Three Expression Types

| Type | Purpose | Example |
|------|---------|---------|
| `LIT` | Static literal value | `lit(42)`, `lit('hello')` |
| `REF` | Reference to another property | `ref('self.value')` |
| `OP` | Operator call with arguments | `op('add', lit(1), lit(2))` |

---

## Literal Expressions (`lit`)

Wrap static values in a Property:

```typescript
import { lit } from 'turing-property';

// Primitives
lit('hello')      // String
lit(42)           // Number
lit(true)         // Boolean
lit(null)         // Null

// Arrays
lit([1, 2, 3])

// Objects
lit({ name: 'John', age: 30 })
```

### Under the Hood

```typescript
lit('hello')
// Produces:
{
    id: 'lit',
    type: LIT,
    value: 'hello'
}
```

---

## Reference Expressions (`ref`)

Point to values in the property tree:

```typescript
import { ref } from 'turing-property';

// Dot notation (recommended)
ref('self.value')
ref('parent.name.value')
ref('root.form.email.value')

// Array notation (also works)
ref(['self', 'value'])
ref(['parent', 'name', 'value'])
ref(['root', 'form', 'email', 'value'])
```

### Path Navigation

```
root
 └── form
      ├── name (value: 'John')
      └── greeting
           └── value: ref('parent.name.value')
                       ↑ evaluates to 'John'
```

### Path Segments Reference

| Segment | Navigates To |
|---------|--------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of tree |
| `children` | Children map (next segment = key) |
| `metadata` | Metadata map (next segment = key) |
| `constraints` | Constraints map (next segment = key) |
| `value` | Property's value |
| `type` | Property's type |
| `id` | Property's id |

**Shortcut**: You can omit `children` and `metadata` in paths. The system will automatically check children first, then metadata:

```typescript
// These are equivalent:
ref('parent.children.name.value')
ref('parent.name.value')  // shortcut

// These are equivalent:
ref('self.metadata.label.value')
ref('self.label.value')  // shortcut (if no child named 'label')
```

---

## Operator Expressions (`op`)

Call operators with arguments:

```typescript
import { op, lit, ref } from 'turing-property';

// Basic operator call
op('add', lit(5), lit(3))           // 8

// With references
op('add',
    ref('parent.price.value'),
    ref('parent.tax.value')
)

// Nested operators
op('add',
    lit(1),
    op('mul', lit(2), lit(3))
)  // 1 + (2 * 3) = 7
```

---

## Register Your Own Operators

Turing Property has **no built-in operators**. You register your own:

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// Arithmetic
registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) + (b as number);
});

registry.register('mul', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) * (b as number);
});

// String operations
registry.register('concat', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.join('');
});

registry.register('upper', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return String(value).toUpperCase();
});

// Type checking
registry.register('isEmpty', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return value === '' || value === null || value === undefined;
});

registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

// Comparison
registry.register('eq', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a === b;
});

registry.register('gt', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a as number) > (b as number);
});

// Logic
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

## Real-World Examples

### Dynamic Greeting

```typescript
import { Property, TYPE, PROPERTY, op, ref, lit, PropertyNode, createRegistry, evalArg, evalArgs } from 'turing-property';

// Types
const STRING: Property = { id: 'String', type: TYPE };

// Operators
const registry = createRegistry();
registry.register('concat', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.join('');
});
registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});
registry.register('if', async (args, ctx) => {
    const condition = await evalArg(args[0]!, ctx);
    return condition ? evalArg(args[1]!, ctx) : evalArg(args[2]!, ctx);
});

// Form with computed greeting
const form: Property = {
    id: 'form',
    type: PROPERTY,
    children: {
        name: { id: 'name', type: STRING, value: '' },
        greeting: {
            id: 'greeting',
            type: STRING,
            value: op('concat',
                lit('Hello, '),
                op('if',
                    op('isNotBlank', ref('parent.name.value')),
                    ref('parent.name.value'),
                    lit('Guest')
                ),
                lit('!')
            )
        }
    }
};

const node = PropertyNode.create(form, registry);

// Empty name
console.log(await node.child('greeting')?.getValue()); // "Hello, Guest!"

// Set name
node.child('name')?.setValue('John');
console.log(await node.child('greeting')?.getValue()); // "Hello, John!"
```

### Conditional Visibility

```typescript
const form: Property = {
    id: 'order',
    type: PROPERTY,
    children: {
        orderType: {
            id: 'orderType',
            type: STRING,
            value: 'personal'
        },
        companyName: {
            id: 'companyName',
            type: STRING,
            value: '',
            metadata: {
                // Only visible when orderType is 'business'
                visible: {
                    id: 'visible',
                    type: BOOLEAN,
                    value: op('eq', ref('parent.orderType.value'), lit('business'))
                }
            }
        }
    }
};

const node = PropertyNode.create(form, registry);

// Check visibility
console.log(await node.child('companyName')?.getMetadata('visible')); // false

// Change to business
node.child('orderType')?.setValue('business');
console.log(await node.child('companyName')?.getMetadata('visible')); // true
```

### Cross-Field Validation

```typescript
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

const form: Property = {
    id: 'registration',
    type: PROPERTY,
    children: {
        password: {
            id: 'password',
            type: STRING,
            value: ''
        },
        confirmPassword: {
            id: 'confirmPassword',
            type: STRING,
            value: '',
            constraints: {
                match: {
                    id: 'match',
                    type: CONSTRAINT,
                    value: op('eq',
                        ref('self.value'),
                        ref('parent.password.value')
                    ),
                    metadata: {
                        message: { id: 'msg', type: STRING, value: 'Passwords must match' }
                    }
                }
            }
        }
    }
};
```

---

## Next Steps

- [Core Concepts](./core-concepts.md) — Understand the Property model
- [Best Practices](./best-practices.md) — Patterns and guidelines
- [API Reference](./api-reference.md) — Complete API documentation
