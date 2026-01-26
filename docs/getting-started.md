# Getting Started

This guide walks you through building your first application with Turing Property.

## Installation

```bash
npm install turing-property
# or
bun add turing-property
```

## Core Concept

Everything in Turing Property is a **Property**. There's only one data structure:

```typescript
interface Property {
    id: string;                            // Unique identifier
    type: Property;                        // Type (also a Property!)
    value?: unknown;                       // Value (static or expression)
    defaultValue?: unknown;                // Default value
    metadata?: Record<string, Property>;   // Descriptive attributes
    constraints?: Record<string, Property>;// Validation rules
    children?: Record<string, Property>;   // Structural composition
}
```

## Step 1: Define Your Types

Types are Properties with `type: TYPE`. You define your own:

```typescript
import { Property, TYPE } from 'turing-property';

// Define types for your domain
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
```

## Step 2: Register Your Operators

Turing Property has **no built-in operators**. Register your own:

```typescript
import { createRegistry, evalArg, evalArgs } from 'turing-property';

const registry = createRegistry();

// String validation
registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

registry.register('minLength', async (args, ctx) => {
    const [value, min] = await evalArgs(args, ctx);
    return typeof value === 'string' && value.length >= (min as number);
});

// Logical operators
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

## Step 3: Build Properties

Use `lit()`, `ref()`, and `op()` for dynamic values:

```typescript
import { Property, PROPERTY, CONSTRAINT, op, ref, lit } from 'turing-property';

// A simple form field
const nameField: Property = {
    id: 'name',
    type: STRING,
    value: '',
    defaultValue: '',
    metadata: {
        label: { id: 'label', type: STRING, value: 'Your Name' },
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
    },
};

// A form with multiple fields
const form: Property = {
    id: 'contactForm',
    type: PROPERTY,
    children: {
        name: nameField,
        email: {
            id: 'email',
            type: STRING,
            value: '',
            metadata: {
                label: { id: 'label', type: STRING, value: 'Email' },
            },
        },
    },
};
```

## Step 4: Use PropertyNode

Wrap your Property with `PropertyNode` for operations:

```typescript
import { PropertyNode } from 'turing-property';

const node = PropertyNode.create(form, registry);

// Navigate
const nameNode = node.child('name');
console.log(nameNode?.id);           // 'name'
console.log(nameNode?.pathString()); // 'name'

// Get/set values
nameNode?.setValue('John Doe');
console.log(nameNode?.getRawValue()); // 'John Doe'

// Evaluate (for expressions)
const value = await nameNode?.getValue();

// Get metadata
const label = await nameNode?.getMetadata('label'); // 'Your Name'

// Validate
const result = await nameNode?.validate();
// { valid: true, errors: {} }

// Validate entire form
const formResult = await node.validateDeep();
// { valid: boolean, errors: { fieldPath: { constraintId: 'message' } } }
```

## Step 5: Add Reactivity

Subscribe to changes:

```typescript
// Subscribe to all changes
node.subscribe((changedPaths) => {
    console.log('Changed:', changedPaths);
});

// Watch specific path
node.watch('name', (paths) => {
    console.log('Name changed');
});

// Batch multiple changes (single notification)
node.batch(() => {
    node.child('name')?.setValue('John');
    node.child('email')?.setValue('john@example.com');
});
```

## Step 6: Serialize

Save and restore state:

```typescript
// Serialize
const json = node.toJSON();
const jsonString = JSON.stringify(json);

// Restore
const parsed = JSON.parse(jsonString);
const restored = PropertyNode.fromJSON(parsed);
restored.setRegistry(registry);

// Clone
const clone = node.clone();
```

## Complete Example

```typescript
import {
    Property,
    TYPE,
    PROPERTY,
    CONSTRAINT,
    PropertyNode,
    createRegistry,
    evalArg,
    evalArgs,
    op,
    ref,
    lit,
} from 'turing-property';

// 1. Define types
const STRING: Property = { id: 'String', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

// 2. Create registry with operators
const registry = createRegistry();

registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0]!, ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

registry.register('minLength', async (args, ctx) => {
    const [value, min] = await evalArgs(args, ctx);
    return typeof value === 'string' && value.length >= (min as number);
});

// 3. Build form
const form: Property = {
    id: 'signupForm',
    type: PROPERTY,
    children: {
        username: {
            id: 'username',
            type: STRING,
            value: '',
            defaultValue: '',
            metadata: {
                label: { id: 'label', type: STRING, value: 'Username' },
            },
            constraints: {
                required: {
                    id: 'required',
                    type: CONSTRAINT,
                    value: op('isNotBlank', ref('self.value')),
                    metadata: {
                        message: { id: 'msg', type: STRING, value: 'Username is required' },
                    },
                },
                minLength: {
                    id: 'minLength',
                    type: CONSTRAINT,
                    value: op('minLength', ref('self.value'), lit(3)),
                    metadata: {
                        message: { id: 'msg', type: STRING, value: 'At least 3 characters' },
                    },
                },
            },
        },
    },
};

// 4. Use PropertyNode
const node = PropertyNode.create(form, registry);

// Subscribe to changes
node.subscribe((paths) => console.log('Changed:', paths));

// Set value
node.child('username')?.setValue('jo');

// Validate
const result = await node.validateDeep();
console.log(result);
// { valid: false, errors: { username: { minLength: 'At least 3 characters' } } }

// Fix and revalidate
node.child('username')?.setValue('john');
const result2 = await node.validateDeep();
console.log(result2);
// { valid: true, errors: {} }
```

## Next Steps

- Read [Core Concepts](./core-concepts.md) to understand the type system
- See [Best Practices](./best-practices.md) for modeling patterns
- Check [API Reference](./api-reference.md) for complete API
