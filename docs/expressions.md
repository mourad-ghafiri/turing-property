# 🔢 Expressions

Expressions are Properties that compute values dynamically.

---

## 🎯 Three Expression Types

| Type | Purpose | Example |
|------|---------|---------|
| `LIT` | Static literal value | `lit(42)`, `lit('hello')` |
| `REF` | Reference to another property | `ref(['self', 'value'])` |
| `OP` | Operator call with arguments | `op('add', lit(1), lit(2))` |

---

## 📦 Literal Expressions (`lit`)

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

### 🔍 Under the Hood

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

## 🔗 Reference Expressions (`ref`)

Point to values in the property tree:

```typescript
import { ref } from 'turing-property';

// Reference current property's value
ref(['self', 'value'])

// Reference sibling
ref(['parent', 'children', 'email', 'value'])

// Reference from root
ref(['root', 'children', 'form', 'children', 'name', 'value'])

// Reference metadata
ref(['self', 'metadata', 'label', 'value'])
```

### 🗺️ Path Navigation

```
root
 └── form
      ├── name (value: 'John')
      └── greeting
           └── value: ref(['parent', 'children', 'name', 'value'])
                       ↑ evaluates to 'John'
```

### 📍 Path Segments Reference

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
ref(['parent', 'children', 'name', 'value'])
ref(['parent', 'name', 'value'])  // shortcut

// These are equivalent:
ref(['self', 'metadata', 'label', 'value'])
ref(['self', 'label', 'value'])  // shortcut
```

---

## ⚙️ Operator Expressions (`op`)

Call operators with arguments:

```typescript
import { op, lit, ref } from 'turing-property';

// Arithmetic
op('add', lit(5), lit(3))           // 8
op('mul', lit(4), lit(2))           // 8
op('sub', lit(10), lit(3))          // 7
op('div', lit(20), lit(4))          // 5

// With references
op('add',
    ref(['parent', 'children', 'price', 'value']),
    ref(['parent', 'children', 'tax', 'value'])
)

// Nested operators
op('add',
    lit(1),
    op('mul', lit(2), lit(3))
)  // 1 + (2 * 3) = 7
```

---

## 🧮 Builtin Operators

### ➕ Arithmetic

```typescript
op('add', a, b)      // a + b
op('sub', a, b)      // a - b
op('mul', a, b)      // a * b
op('div', a, b)      // a / b
op('mod', a, b)      // a % b
op('pow', a, b)      // a ** b
op('sqrt', a)        // √a
op('abs', a)         // |a|
op('neg', a)         // -a
op('ceil', a)        // ⌈a⌉
op('floor', a)       // ⌊a⌋
op('round', a)       // Round to nearest
op('min', a, b)      // Minimum
op('max', a, b)      // Maximum
op('sum', arr)       // Sum of array
op('avg', arr)       // Average of array
op('clamp', val, min, max)  // Clamp value
```

### ⚖️ Comparison

```typescript
op('eq', a, b)       // a === b
op('neq', a, b)      // a !== b
op('gt', a, b)       // a > b
op('gte', a, b)      // a >= b
op('lt', a, b)       // a < b
op('lte', a, b)      // a <= b
op('between', val, min, max)  // min <= val <= max
```

### 🔀 Logic

```typescript
op('and', a, b)      // a && b
op('or', a, b)       // a || b
op('not', a)         // !a
op('if', cond, then, else)  // cond ? then : else
op('coalesce', a, b) // a ?? b
op('default', val, def)     // val || def
```

### 📝 String

```typescript
op('concat', a, b)   // a + b
op('upper', s)       // s.toUpperCase()
op('lower', s)       // s.toLowerCase()
op('trim', s)        // s.trim()
op('strlen', s)      // s.length
op('substr', s, start, len)  // s.substring(start, len)
op('replace', s, find, rep)  // s.replace(find, rep)
op('split', s, sep)  // s.split(sep)
op('join', arr, sep) // arr.join(sep)
op('startsWith', s, prefix)
op('endsWith', s, suffix)
op('includes', s, sub)
op('matches', s, regex)
op('capitalize', s)
op('toString', val)
```

### 🔍 Type Checking

```typescript
op('isNull', val)
op('isNotNull', val)
op('isEmpty', val)
op('isNotEmpty', val)
op('isNotBlank', val)
op('isNumber', val)
op('isString', val)
op('isBoolean', val)
op('isArray', val)
op('isObject', val)
op('isInteger', val)
op('isPositive', val)
op('isNegative', val)
op('isEven', val)
op('isOdd', val)
```

### ✅ Validation

```typescript
op('isEmail', val)
op('isUrl', val)
op('isPhone', val)
op('isAlpha', val)
op('isAlphanumeric', val)
op('isNumeric', val)
op('isUuid', val)
op('isCreditCard', val)
op('isPostalCode', val)
```

### 📚 Array

```typescript
op('len', arr)       // arr.length
op('at', arr, idx)   // arr[idx]
op('first', arr)     // arr[0]
op('last', arr)      // arr[arr.length - 1]
op('slice', arr, start, end)
op('reverse', arr)
op('unique', arr)
op('flatten', arr)
op('compact', arr)   // Remove nulls
op('contains', arr, val)
op('sort', arr)
op('sortBy', arr, key)
op('groupBy', arr, key)
op('range', start, end)
op('push', arr, val)
op('pop', arr)
```

### 🔄 Higher-Order Array

```typescript
// Map: transform each item
op('map', arr, expr)
// Example: double all numbers
op('map', lit([1, 2, 3]), op('mul', ref(['item']), lit(2)))
// Result: [2, 4, 6]

// Filter: keep matching items
op('filter', arr, predicate)
// Example: keep numbers > 2
op('filter', lit([1, 2, 3, 4]), op('gt', ref(['item']), lit(2)))
// Result: [3, 4]

// Reduce: accumulate result
op('reduce', arr, expr, initial)

// Find: first matching item
op('find', arr, predicate)

// Every: all items match
op('every', arr, predicate)

// Some: any item matches
op('some', arr, predicate)
```

### 📅 Date

```typescript
op('now')            // Current datetime
op('today')          // Current date
op('year', date)
op('month', date)
op('day', date)
op('age', birthDate) // Years since date
op('dateDiff', a, b, unit)  // Difference in unit
op('dateAdd', date, amount, unit)
op('isFuture', date)
op('isPast', date)
op('isToday', date)
op('isBefore', a, b)
op('isAfter', a, b)
```

### 🗃️ Object

```typescript
op('get', obj, key)  // obj[key]
op('keys', obj)      // Object.keys(obj)
op('values', obj)    // Object.values(obj)
op('entries', obj)   // Object.entries(obj)
op('has', obj, key)  // key in obj
op('merge', a, b)    // { ...a, ...b }
```

### 🔄 Conversion

```typescript
op('toNumber', val)
op('toBoolean', val)
op('toArray', val)
op('toJson', val)
op('fromJson', str)
```

---

## 💡 Real-World Examples

### 🧮 Shopping Cart Total

```typescript
const cart = pGroup('cart', {
    items: pRepeater('items', pGroup('item', {
        name: pText('name'),
        price: pCurrency('price'),
        quantity: pQuantity('quantity')
    })),
    subtotal: pComputed('subtotal',
        op('sum',
            op('map',
                ref(['parent', 'children', 'items', 'value']),
                op('mul',
                    ref(['item', 'price']),
                    ref(['item', 'quantity'])
                )
            )
        )
    ),
    tax: pComputed('tax',
        op('mul',
            ref(['parent', 'children', 'subtotal', 'value']),
            lit(0.08)
        )
    ),
    total: pComputed('total',
        op('add',
            ref(['parent', 'children', 'subtotal', 'value']),
            ref(['parent', 'children', 'tax', 'value'])
        )
    )
});
```

### 👋 Dynamic Greeting

```typescript
const greeting = pComputed('greeting',
    op('concat',
        lit('Hello, '),
        op('if',
            op('isNotBlank', ref(['parent', 'children', 'name', 'value'])),
            ref(['parent', 'children', 'name', 'value']),
            lit('Guest')
        ),
        lit('!')
    )
);
// If name = 'John' → "Hello, John!"
// If name = '' → "Hello, Guest!"
```

### 📊 Progress Calculation

```typescript
const wizard = pWizard('onboarding', [
    pStep('step1', { /* ... */ }),
    pStep('step2', { /* ... */ }),
    pStep('step3', { /* ... */ })
], {
    metadata: {
        progress: pComputed('progress',
            op('mul',
                op('div',
                    op('add', ref(['self', 'value']), lit(1)),
                    lit(3)
                ),
                lit(100)
            )
        )
    }
});
// step 0 → 33%, step 1 → 66%, step 2 → 100%
```

### 🎭 Conditional Visibility

```typescript
const form = pForm('order', {
    orderType: pSelect('orderType', [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' }
    ]),
    // Only visible when orderType is 'business'
    companyName: pText('companyName', {
        metadata: {
            visible: visible(
                op('eq',
                    ref(['parent', 'children', 'orderType', 'value']),
                    lit('business')
                )
            )
        }
    }),
    taxId: pText('taxId', {
        metadata: {
            visible: visible(
                op('eq',
                    ref(['parent', 'children', 'orderType', 'value']),
                    lit('business')
                )
            )
        }
    })
});
```

---

## 📚 Next Steps

- 🏷️ [Types](./types.md) — The complete type system
- ⚙️ [Operators](./operators.md) — All 145+ operators
- 🎨 [Metadata](./metadata.md) — Use expressions in metadata
- ✅ [Constraints](./constraints.md) — Expression-based validation
- 💡 [Examples](./examples/) — More real-world patterns

