# 🏷️ Types

The type system in Turing Property is fully homoiconic—types themselves are Properties.

---

## 📐 Overview

In Turing Property, types are not external metadata but first-class Properties. Every Property has a `type` field that references another Property, creating a self-describing, self-referential system.

```typescript
import { Property } from 'turing-property';

// Every Property references a type (which is also a Property)
const myProperty: Property = {
    id: 'username',
    type: STRING,  // STRING is a Property!
    value: 'john_doe'
};
```

---

## 🔷 Meta-Types

Meta-types are the foundational types that define the type system itself.

### TYPE (Bootstrap)

`TYPE` is the type of all types. It's self-referential—its own type is itself.

```typescript
import { TYPE } from 'turing-property';

// TYPE's structure:
const TYPE: Property = {
    id: 'Type',
    type: TYPE,  // Self-referential!
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all types' }
    }
};

// All types use TYPE as their type:
const MY_CUSTOM_TYPE: Property = {
    id: 'MyCustomType',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'My custom type' }
    }
};
```

### EXPR

`EXPR` is the type of all expressions (LIT, REF, OP).

```typescript
import { EXPR } from 'turing-property';

// EXPR's structure:
const EXPR: Property = {
    id: 'Expr',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all expressions' }
    }
};
```

### OPERATOR

`OPERATOR` is the type of all operators.

```typescript
import { OPERATOR } from 'turing-property';

// OPERATOR's structure:
const OPERATOR: Property = {
    id: 'Operator',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all operators' }
    }
};

// Define a custom operator:
const MY_OPERATOR: Property = {
    id: 'myOp',
    type: OPERATOR,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'My custom operator' }
    }
};
```

### CONSTRAINT

`CONSTRAINT` is the type of all constraints (validation rules).

```typescript
import { CONSTRAINT } from 'turing-property';

// CONSTRAINT's structure:
const CONSTRAINT: Property = {
    id: 'Constraint',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of all constraints' }
    }
};

// A constraint is a Property with type CONSTRAINT:
const myConstraint: Property = {
    id: 'required',
    type: CONSTRAINT,
    value: { id: 'valid', type: OP, ... }  // Expression that returns boolean
};
```

### PROPERTY

`PROPERTY` is the type of user-defined properties.

```typescript
import { PROPERTY } from 'turing-property';

// PROPERTY's structure:
const PROPERTY: Property = {
    id: 'Property',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'The type of user-defined properties' }
    }
};
```

---

## 📝 Expression Types

Expression types define the kinds of computations that can be expressed.

### LIT (Literal)

`LIT` represents a constant value.

```typescript
import { LIT, lit } from 'turing-property';

// LIT's structure:
const LIT: Property = {
    id: 'Lit',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: EXPR, value: 'A literal/constant value' }
    }
};

// Using LIT directly:
const literalExpr: Property = {
    id: 'greeting',
    type: LIT,
    value: 'Hello, World!'
};

// Using the helper:
const greeting = lit('Hello, World!');
```

### REF (Reference)

`REF` represents a reference to another property's value.

```typescript
import { REF, ref } from 'turing-property';

// REF's structure:
const REF: Property = {
    id: 'Ref',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: EXPR, value: 'A reference to another property' }
    }
};

// Using REF directly:
const referenceExpr: Property = {
    id: 'usernameRef',
    type: REF,
    value: ['root', 'children', 'username', 'value']
};

// Using the helper:
const usernameRef = ref(['root', 'children', 'username', 'value']);
```

### OP (Operator)

`OP` represents an operator invocation with arguments.

```typescript
import { OP, op } from 'turing-property';

// OP's structure:
const OP: Property = {
    id: 'Op',
    type: EXPR,
    metadata: {
        description: { id: 'description', type: EXPR, value: 'An operator invocation with arguments' }
    }
};

// Using OP directly:
const opExpr: Property = {
    id: 'sum',
    type: OP,
    value: 'add',
    children: {
        arg0: { id: 'arg0', type: LIT, value: 5 },
        arg1: { id: 'arg1', type: LIT, value: 3 }
    }
};

// Using the helper:
const sum = op('add', lit(5), lit(3));
```

---

## 🧱 Primitive Types

Primitive types represent basic data values.

### STRING

Represents string/text values.

```typescript
import { STRING, tString } from 'turing-property';

// STRING's structure:
const STRING: Property = {
    id: 'String',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A string value' }
    }
};

// Using STRING directly:
const username: Property = {
    id: 'username',
    type: STRING,
    value: 'john_doe'
};

// Using the factory:
const stringType = tString();
```

### NUMBER

Represents numeric values (integers and floats).

```typescript
import { NUMBER, tNumber } from 'turing-property';

// NUMBER's structure:
const NUMBER: Property = {
    id: 'Number',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A numeric value' }
    }
};

// Using NUMBER directly:
const age: Property = {
    id: 'age',
    type: NUMBER,
    value: 25
};

// Using the factory:
const numberType = tNumber();
```

### BOOLEAN

Represents boolean values (true/false).

```typescript
import { BOOLEAN, tBoolean } from 'turing-property';

// BOOLEAN's structure:
const BOOLEAN: Property = {
    id: 'Boolean',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A boolean value (true/false)' }
    }
};

// Using BOOLEAN directly:
const isActive: Property = {
    id: 'isActive',
    type: BOOLEAN,
    value: true
};

// Using the factory:
const booleanType = tBoolean();
```

### NULL

Represents null/empty values.

```typescript
import { NULL, tNull } from 'turing-property';

// NULL's structure:
const NULL: Property = {
    id: 'Null',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A null value' }
    }
};

// Using NULL directly:
const emptyValue: Property = {
    id: 'empty',
    type: NULL,
    value: null
};

// Using the factory:
const nullType = tNull();
```

### ANY

Represents any value (no type restriction).

```typescript
import { ANY, tAny } from 'turing-property';

// ANY's structure:
const ANY: Property = {
    id: 'Any',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'Any value' }
    }
};

// Using ANY directly:
const flexible: Property = {
    id: 'data',
    type: ANY,
    value: { anything: 'goes' }
};

// Using the factory:
const anyType = tAny();
```

---

## ⏰ Temporal Types

Temporal types represent date, time, and duration values.

### DATE

Represents a date without time component (ISO 8601 format: `YYYY-MM-DD`).

```typescript
import { DATE, tDate } from 'turing-property';

// DATE's structure:
const DATE: Property = {
    id: 'Date',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A date value (YYYY-MM-DD)' },
        format: { id: 'format', type: TYPE, value: 'YYYY-MM-DD' }
    }
};

// Using DATE directly:
const birthDate: Property = {
    id: 'birthDate',
    type: DATE,
    value: '1990-05-15'
};

// Using the factory:
const dateType = tDate();
```

### DATETIME

Represents a date with time component (ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`).

```typescript
import { DATETIME, tDateTime } from 'turing-property';

// DATETIME's structure:
const DATETIME: Property = {
    id: 'DateTime',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A date and time value (ISO 8601)' },
        format: { id: 'format', type: TYPE, value: 'YYYY-MM-DDTHH:mm:ss.sssZ' }
    }
};

// Using DATETIME directly:
const appointment: Property = {
    id: 'appointment',
    type: DATETIME,
    value: '2024-03-15T14:30:00.000Z'
};

// Using the factory:
const dateTimeType = tDateTime();
```

### TIME

Represents a time without date component (format: `HH:mm:ss`).

```typescript
import { TIME, tTime } from 'turing-property';

// TIME's structure:
const TIME: Property = {
    id: 'Time',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A time value (HH:mm:ss)' },
        format: { id: 'format', type: TYPE, value: 'HH:mm:ss' }
    }
};

// Using TIME directly:
const openingTime: Property = {
    id: 'openingTime',
    type: TIME,
    value: '09:00:00'
};

// Using the factory:
const timeType = tTime();
```

### DURATION

Represents a time span/duration (ISO 8601 duration format: `P[n]Y[n]M[n]DT[n]H[n]M[n]S`).

```typescript
import { DURATION, tDuration } from 'turing-property';

// DURATION's structure:
const DURATION: Property = {
    id: 'Duration',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A duration/time span (ISO 8601)' },
        format: { id: 'format', type: TYPE, value: 'P[n]Y[n]M[n]DT[n]H[n]M[n]S' }
    }
};

// Using DURATION directly:
const subscriptionPeriod: Property = {
    id: 'period',
    type: DURATION,
    value: 'P1Y'  // 1 year
};

const meetingLength: Property = {
    id: 'length',
    type: DURATION,
    value: 'PT1H30M'  // 1 hour 30 minutes
};

// Using the factory:
const durationType = tDuration();
```

### TIMESTAMP

Represents a Unix timestamp in milliseconds.

```typescript
import { TIMESTAMP, tTimestamp } from 'turing-property';

// TIMESTAMP's structure:
const TIMESTAMP: Property = {
    id: 'Timestamp',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'Unix timestamp in milliseconds' }
    }
};

// Using TIMESTAMP directly:
const createdAt: Property = {
    id: 'createdAt',
    type: TIMESTAMP,
    value: 1710505800000  // March 15, 2024
};

// Using the factory:
const timestampType = tTimestamp();
```

---

## 🏗️ Structural Types

Structural types represent composite data structures.

### LIST

Represents an array/list of elements.

```typescript
import { LIST, tList, STRING } from 'turing-property';

// LIST's structure:
const LIST: Property = {
    id: 'List',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A list/array of elements' }
    }
};

// Using LIST directly:
const tags: Property = {
    id: 'tags',
    type: LIST,
    children: {
        element: { id: 'element', type: STRING }  // Element type
    },
    value: ['typescript', 'javascript', 'nodejs']
};

// Using the factory:
const stringListType = tList(STRING);  // List<String>
```

### OBJECT

Represents an object with named properties.

```typescript
import { OBJECT, tObject, STRING, NUMBER } from 'turing-property';

// OBJECT's structure:
const OBJECT: Property = {
    id: 'Object',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An object with named properties' }
    }
};

// Using OBJECT directly:
const user: Property = {
    id: 'user',
    type: OBJECT,
    children: {
        name: { id: 'name', type: STRING },
        age: { id: 'age', type: NUMBER }
    }
};

// Using the factory:
const userType = tObject({
    name: { id: 'name', type: STRING },
    age: { id: 'age', type: NUMBER }
});
```

### RECORD

Represents a dictionary with typed values.

```typescript
import { RECORD, tRecord, NUMBER } from 'turing-property';

// RECORD's structure:
const RECORD: Property = {
    id: 'Record',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A record/dictionary with typed values' }
    }
};

// Using RECORD directly:
const scores: Property = {
    id: 'scores',
    type: RECORD,
    children: {
        value: { id: 'value', type: NUMBER }  // Value type
    },
    value: { math: 95, english: 88, science: 92 }
};

// Using the factory:
const scoresType = tRecord(NUMBER);  // Record<string, number>
```

### UNION

Represents a value that can be one of several types.

```typescript
import { UNION, tUnion, STRING, NUMBER, NULL } from 'turing-property';

// UNION's structure:
const UNION: Property = {
    id: 'Union',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A union of multiple types' }
    }
};

// Using UNION directly:
const maybeString: Property = {
    id: 'maybeString',
    type: UNION,
    children: {
        type0: { id: 'type0', type: STRING },
        type1: { id: 'type1', type: NULL }
    }
};

// Using the factory:
const stringOrNumber = tUnion(STRING, NUMBER);        // String | Number
const nullable = tUnion(STRING, NULL);                 // String | Null
const flexibleId = tUnion(STRING, NUMBER, NULL);      // String | Number | Null
```

### INTERSECTION

Represents a value that satisfies multiple types.

```typescript
import { INTERSECTION, tIntersection, tObject, STRING, NUMBER } from 'turing-property';

// INTERSECTION's structure:
const INTERSECTION: Property = {
    id: 'Intersection',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An intersection of multiple types' }
    }
};

// Using the factory:
const personWithAge = tIntersection(
    tObject({ name: { id: 'name', type: STRING } }),
    tObject({ age: { id: 'age', type: NUMBER } })
);  // { name: string } & { age: number }
```

### LITERAL

Represents an exact literal value type.

```typescript
import { LITERAL, tLiteral } from 'turing-property';

// LITERAL's structure:
const LITERAL: Property = {
    id: 'Literal',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An exact literal value type' }
    }
};

// Using LITERAL directly:
const adminRole: Property = {
    id: 'adminRole',
    type: LITERAL,
    value: 'admin'
};

// Using the factory:
const adminType = tLiteral('admin');         // Only 'admin' is valid
const meaningOfLife = tLiteral(42);          // Only 42 is valid
const trueOnly = tLiteral(true);             // Only true is valid
```

### FUNCTION

Represents a function type with parameters and return type.

```typescript
import { FUNCTION, tFunction, STRING, NUMBER, BOOLEAN } from 'turing-property';

// FUNCTION's structure:
const FUNCTION: Property = {
    id: 'Function',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'A function type' }
    }
};

// Using the factory:
const greetFn = tFunction(
    [{ id: 'name', type: STRING }],  // Parameters
    { id: 'return', type: STRING }    // Return type
);  // (name: string) => string

const addFn = tFunction(
    [{ id: 'a', type: NUMBER }, { id: 'b', type: NUMBER }],
    { id: 'return', type: NUMBER }
);  // (a: number, b: number) => number

const predicateFn = tFunction(
    [{ id: 'value', type: STRING }],
    { id: 'return', type: BOOLEAN }
);  // (value: string) => boolean
```

### ENUM

Represents an enumeration of allowed values. ENUM types can hold string values, numeric values, or mixed types.

```typescript
import { ENUM, tEnum, STRING, NUMBER } from 'turing-property';

// ENUM's structure:
const ENUM: Property = {
    id: 'Enum',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An enumeration of allowed values' }
    }
};

// Using tEnum with string array (most common):
const StatusEnum = tEnum('Status', ['pending', 'active', 'completed', 'cancelled']);
// Creates: { id: 'Status', type: ENUM, children: {
//   pending: { id: 'pending', type: STRING, value: 'pending' },
//   active: { id: 'active', type: STRING, value: 'active' },
//   completed: { id: 'completed', type: STRING, value: 'completed' },
//   cancelled: { id: 'cancelled', type: STRING, value: 'cancelled' }
// }}

// Using tEnum with number values:
const PriorityEnum = tEnum('Priority', { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 });
// Creates: { id: 'Priority', type: ENUM, children: {
//   LOW: { id: 'LOW', type: NUMBER, value: 1 },
//   MEDIUM: { id: 'MEDIUM', type: NUMBER, value: 2 },
//   HIGH: { id: 'HIGH', type: NUMBER, value: 3 },
//   CRITICAL: { id: 'CRITICAL', type: NUMBER, value: 4 }
// }}

// Using tEnum with mixed types:
const ConfigEnum = tEnum('Config', {
    DEBUG: true,
    VERSION: '1.0.0',
    MAX_RETRIES: 5
});
// Creates children with BOOLEAN, STRING, and NUMBER types respectively

// Using ENUM in a property:
const orderStatus: Property = {
    id: 'status',
    type: StatusEnum,
    value: 'pending'
};

const ticketPriority: Property = {
    id: 'priority',
    type: PriorityEnum,
    value: 2  // MEDIUM
};
```

---

## 🏭 Type Factories Reference

Quick reference for all type factory functions:

### Primitive Types

| Factory | Description | Example |
|---------|-------------|---------|
| `tString()` | Creates String type | `tString()` |
| `tNumber()` | Creates Number type | `tNumber()` |
| `tBoolean()` | Creates Boolean type | `tBoolean()` |
| `tNull()` | Creates Null type | `tNull()` |
| `tAny()` | Creates Any type | `tAny()` |

### Temporal Types

| Factory | Description | Example |
|---------|-------------|---------|
| `tDate()` | Creates Date type (YYYY-MM-DD) | `tDate()` |
| `tDateTime()` | Creates DateTime type (ISO 8601) | `tDateTime()` |
| `tTime()` | Creates Time type (HH:mm:ss) | `tTime()` |
| `tDuration()` | Creates Duration type (ISO 8601) | `tDuration()` |
| `tTimestamp()` | Creates Timestamp type (Unix ms) | `tTimestamp()` |

### Structural Types

| Factory | Description | Example |
|---------|-------------|---------|
| `tList(element)` | Creates List type | `tList(STRING)` |
| `tObject(shape?)` | Creates Object type | `tObject({ name: STRING })` |
| `tRecord(value)` | Creates Record type | `tRecord(NUMBER)` |
| `tUnion(...types)` | Creates Union type | `tUnion(STRING, NULL)` |
| `tIntersection(...types)` | Creates Intersection type | `tIntersection(A, B)` |
| `tLiteral(value)` | Creates Literal type | `tLiteral('admin')` |
| `tFunction(params, ret)` | Creates Function type | `tFunction([STRING], NUMBER)` |
| `tEnum(name, values)` | Creates Enum type | `tEnum('Status', ['active', 'inactive'])` |

---

## 🎯 Complete Type Hierarchy

```
TYPE (Bootstrap - self-referential)
├── EXPR (Expression types)
│   ├── LIT (Literal)
│   ├── REF (Reference)
│   └── OP (Operator)
├── OPERATOR (Operator definitions)
├── CONSTRAINT (Validation rules)
├── PROPERTY (User-defined properties)
├── Primitives
│   ├── STRING
│   ├── NUMBER
│   ├── BOOLEAN
│   ├── NULL
│   └── ANY
├── Temporal
│   ├── DATE
│   ├── DATETIME
│   ├── TIME
│   ├── DURATION
│   └── TIMESTAMP
└── Structural
    ├── LIST
    ├── OBJECT
    ├── RECORD
    ├── UNION
    ├── INTERSECTION
    ├── LITERAL
    ├── FUNCTION
    └── ENUM
```

---

## 🎨 Custom Types

You can define your own types by creating Properties with `type: TYPE`:

```typescript
import { Property, TYPE, STRING, CONSTRAINT } from 'turing-property';

// Define a custom Email type
const EMAIL: Property = {
    id: 'Email',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: TYPE, value: 'An email address' }
    },
    // Inherit from STRING
    children: {
        base: STRING
    },
    // With default constraints
    constraints: {
        pattern: {
            id: 'pattern',
            type: CONSTRAINT,
            value: {
                id: 'check',
                type: OP,
                value: 'matches',
                children: {
                    arg0: { id: 'arg0', type: REF, value: ['self', 'value'] },
                    arg1: { id: 'arg1', type: LIT, value: '^[^@]+@[^@]+\\.[^@]+$' }
                }
            }
        }
    }
};

// Use your custom type
const userEmail: Property = {
    id: 'email',
    type: EMAIL,
    value: 'user@example.com'
};
```

---

## 📚 Next Steps

- 📘 [Core Concepts](./core-concepts.md) - Understanding the fundamentals
- 🔢 [Expressions](./expressions.md) - Deep dive into expressions
- 🎯 [Operators](./operators.md) - Built-in operators reference
- ✅ [Constraints](./constraints.md) - Validation system

