# ⚙️ Operators

Operators are the computational building blocks of the expression system. They are **functions** that take arguments (as Properties) and return computed values. This is how Turing Property achieves Turing-completeness.

---

## 🎯 What is an Operator?

In the Turing Property system, an **Operator** is:
- A registered function that performs a computation
- Called via the `op()` expression helper (or raw `OP` type)
- Takes zero or more arguments (each is a Property expression)
- Returns a computed value

### How Operators Work (Raw Structure)

An operator call is just a Property with `type: OP`:

```typescript
import { OP, LIT } from 'turing-property';

// Raw operator call: add(2, 3)
const addition: Property = {
    id: 'add',           // Operator name
    type: OP,            // This is an operator call
    children: {
        arg0: { id: 'a', type: LIT, value: 2 },
        arg1: { id: 'b', type: LIT, value: 3 }
    }
};

// When evaluated, this returns 5
```

### Using the `op()` Helper

The `op()` helper creates the same structure more concisely:

```typescript
import { op, lit, ref } from 'turing-property';

// Same as above
const addition = op('add', lit(2), lit(3));

// Nested operators
const expression = op('mul',
    op('add', lit(2), lit(3)),   // (2 + 3)
    lit(4)                        // × 4
);
// Result: 20
```

---

## 🔧 Operator Registry

Operators are stored in a **registry**. The `defaultRegistry` comes with 145+ built-in operators:

```typescript
import { defaultRegistry, createRegistry, PropertyNode } from 'turing-property';

// Use the default registry
tree.setRegistry(defaultRegistry);

// Or create a custom registry
const customRegistry = createRegistry();
customRegistry.register('myOp', async (args, ctx) => {
    // Custom logic
    return 'result';
});
```

### Registering Custom Operators

```typescript
import { defaultRegistry, evalArg, evalArgs } from 'turing-property';

// Simple operator with evaluated arguments
defaultRegistry.register('double', async (args, ctx) => {
    const [value] = await evalArgs(args, ctx);
    return (value as number) * 2;
});

// Use it
const expr = op('double', lit(21));
// Result: 42
```

---

## 📋 Built-in Operators Reference

### 🔢 Arithmetic Operators

| Operator | Arguments | Description | Example |
|----------|-----------|-------------|---------|
| `add` | `(a, b)` | Addition | `op('add', lit(2), lit(3))` → 5 |
| `sub` | `(a, b)` | Subtraction | `op('sub', lit(5), lit(3))` → 2 |
| `mul` | `(a, b)` | Multiplication | `op('mul', lit(4), lit(3))` → 12 |
| `div` | `(a, b)` | Division | `op('div', lit(10), lit(2))` → 5 |
| `mod` | `(a, b)` | Modulo | `op('mod', lit(7), lit(3))` → 1 |
| `pow` | `(base, exp)` | Power | `op('pow', lit(2), lit(3))` → 8 |
| `sqrt` | `(n)` | Square root | `op('sqrt', lit(16))` → 4 |
| `abs` | `(n)` | Absolute value | `op('abs', lit(-5))` → 5 |
| `ceil` | `(n)` | Ceiling | `op('ceil', lit(4.2))` → 5 |
| `floor` | `(n)` | Floor | `op('floor', lit(4.8))` → 4 |
| `round` | `(n)` | Round | `op('round', lit(4.5))` → 5 |
| `min` | `(...nums)` | Minimum | `op('min', lit(3), lit(1), lit(5))` → 1 |
| `max` | `(...nums)` | Maximum | `op('max', lit(3), lit(1), lit(5))` → 5 |
| `sum` | `(array)` | Sum of array | `op('sum', lit([1,2,3]))` → 6 |
| `avg` | `(array)` | Average of array | `op('avg', lit([2,4,6]))` → 4 |
| `clamp` | `(val, min, max)` | Clamp to range | `op('clamp', lit(15), lit(0), lit(10))` → 10 |
| `neg` | `(n)` | Negate | `op('neg', lit(5))` → -5 |

---

### ⚖️ Comparison Operators

| Operator | Arguments | Description | Example |
|----------|-----------|-------------|---------|
| `eq` | `(a, b)` | Equal (===) | `op('eq', lit(5), lit(5))` → true |
| `neq` | `(a, b)` | Not equal (!==) | `op('neq', lit(5), lit(3))` → true |
| `gt` | `(a, b)` | Greater than | `op('gt', lit(5), lit(3))` → true |
| `gte` | `(a, b)` | Greater than or equal | `op('gte', lit(5), lit(5))` → true |
| `lt` | `(a, b)` | Less than | `op('lt', lit(3), lit(5))` → true |
| `lte` | `(a, b)` | Less than or equal | `op('lte', lit(5), lit(5))` → true |
| `between` | `(val, min, max)` | In range (inclusive) | `op('between', lit(5), lit(1), lit(10))` → true |
| `inRange` | `(val, min, max)` | In range [min, max) | `op('inRange', lit(5), lit(1), lit(10))` → true |

---

### 🧠 Logic Operators

| Operator | Arguments | Description | Example |
|----------|-----------|-------------|---------|
| `and` | `(...conds)` | Logical AND | `op('and', lit(true), lit(true))` → true |
| `or` | `(...conds)` | Logical OR | `op('or', lit(false), lit(true))` → true |
| `not` | `(cond)` | Logical NOT | `op('not', lit(false))` → true |
| `if` | `(cond, then, else)` | Conditional | `op('if', lit(true), lit('yes'), lit('no'))` → 'yes' |
| `coalesce` | `(...vals)` | First non-null | `op('coalesce', lit(null), lit('fallback'))` → 'fallback' |
| `default` | `(val, def)` | Default if null | `op('default', ref(['value']), lit('N/A'))` |

**Conditional Example:**

```typescript
// Dynamic hint based on condition
const dynamicHint = op('if',
    op('gt', ref(['self', 'value']), lit(100)),
    lit('Value is high!'),
    lit('Enter a value')
);
```

---

### 📝 String Operators

| Operator | Arguments | Description | Example |
|----------|-----------|-------------|---------|
| `concat` | `(...strings)` | Concatenate | `op('concat', lit('Hello'), lit(' '), lit('World'))` |
| `upper` | `(s)` | Uppercase | `op('upper', lit('hello'))` → 'HELLO' |
| `lower` | `(s)` | Lowercase | `op('lower', lit('HELLO'))` → 'hello' |
| `trim` | `(s)` | Trim whitespace | `op('trim', lit('  hi  '))` → 'hi' |
| `strlen` | `(s)` | String length | `op('strlen', lit('hello'))` → 5 |
| `substr` | `(s, start, len)` | Substring | `op('substr', lit('hello'), lit(0), lit(2))` → 'he' |
| `replace` | `(s, search, repl)` | Replace first | `op('replace', lit('foo bar'), lit('foo'), lit('baz'))` |
| `replaceAll` | `(s, search, repl)` | Replace all | `op('replaceAll', lit('foo foo'), lit('foo'), lit('bar'))` |
| `split` | `(s, sep)` | Split to array | `op('split', lit('a,b,c'), lit(','))` → ['a','b','c'] |
| `join` | `(arr, sep)` | Join array | `op('join', lit(['a','b']), lit('-'))` → 'a-b' |
| `startsWith` | `(s, prefix)` | Starts with | `op('startsWith', lit('hello'), lit('he'))` → true |
| `endsWith` | `(s, suffix)` | Ends with | `op('endsWith', lit('hello'), lit('lo'))` → true |
| `includes` | `(s, substr)` | Contains | `op('includes', lit('hello'), lit('ell'))` → true |
| `matches` | `(s, pattern)` | Regex match | `op('matches', lit('test@email.com'), lit('^[\\w]+@'))` |
| `padStart` | `(s, len, char)` | Pad start | `op('padStart', lit('5'), lit(3), lit('0'))` → '005' |
| `padEnd` | `(s, len, char)` | Pad end | `op('padEnd', lit('5'), lit(3), lit('0'))` → '500' |
| `charAt` | `(s, idx)` | Char at index | `op('charAt', lit('hello'), lit(0))` → 'h' |
| `indexOf` | `(s, search)` | Index of | `op('indexOf', lit('hello'), lit('l'))` → 2 |
| `capitalize` | `(s)` | Capitalize | `op('capitalize', lit('hello'))` → 'Hello' |
| `toString` | `(val)` | To string | `op('toString', lit(123))` → '123' |

---

### 📦 Array Operators

| Operator | Arguments | Description | Example |
|----------|-----------|-------------|---------|
| `len` | `(arr)` | Length | `op('len', lit([1,2,3]))` → 3 |
| `at` | `(arr, idx)` | Get at index | `op('at', lit(['a','b','c']), lit(1))` → 'b' |
| `first` | `(arr)` | First element | `op('first', lit([1,2,3]))` → 1 |
| `last` | `(arr)` | Last element | `op('last', lit([1,2,3]))` → 3 |
| `slice` | `(arr, start, end)` | Slice | `op('slice', lit([1,2,3,4]), lit(1), lit(3))` → [2,3] |
| `reverse` | `(arr)` | Reverse | `op('reverse', lit([1,2,3]))` → [3,2,1] |
| `unique` | `(arr)` | Unique values | `op('unique', lit([1,1,2,2]))` → [1,2] |
| `flatten` | `(arr)` | Flatten | `op('flatten', lit([[1,2],[3,4]]))` → [1,2,3,4] |
| `compact` | `(arr)` | Remove nulls | `op('compact', lit([1,null,2]))` → [1,2] |
| `contains` | `(arr, val)` | Contains | `op('contains', lit([1,2,3]), lit(2))` → true |
| `containsAll` | `(arr, vals)` | Contains all | `op('containsAll', lit([1,2,3]), lit([1,2]))` → true |
| `containsAny` | `(arr, vals)` | Contains any | `op('containsAny', lit([1,2]), lit([2,3]))` → true |
| `sort` | `(arr)` | Sort | `op('sort', lit([3,1,2]))` → [1,2,3] |
| `sortBy` | `(arr, key)` | Sort by key | `op('sortBy', ref(['items']), lit('name'))` |
| `groupBy` | `(arr, key)` | Group by key | `op('groupBy', ref(['items']), lit('category'))` |
| `range` | `(start, end, step?)` | Generate range | `op('range', lit(0), lit(5))` → [0,1,2,3,4] |
| `push` | `(arr, ...items)` | Add to end | `op('push', lit([1,2]), lit(3))` → [1,2,3] |
| `pop` | `(arr)` | Remove last | `op('pop', lit([1,2,3]))` → [1,2] |

### 🔄 Higher-Order Array Operators

These operators take an expression as the second argument, with `item` and `index` bindings:

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `map` | `(arr, expr)` | Transform each | 
| `filter` | `(arr, expr)` | Filter by condition |
| `reduce` | `(arr, expr, init)` | Reduce to value |
| `find` | `(arr, expr)` | Find first match |
| `every` | `(arr, expr)` | All match? |
| `some` | `(arr, expr)` | Any match? |

**Examples:**

```typescript
// Map: Double each value
op('map',
    lit([1, 2, 3]),
    op('mul', ref(['item']), lit(2))
)
// Result: [2, 4, 6]

// Filter: Keep values > 2
op('filter',
    lit([1, 2, 3, 4]),
    op('gt', ref(['item']), lit(2))
)
// Result: [3, 4]

// Reduce: Sum all values
op('reduce',
    lit([1, 2, 3]),
    op('add', ref(['acc']), ref(['item'])),
    lit(0)  // Initial value
)
// Result: 6

// Find: First value > 2
op('find',
    lit([1, 2, 3, 4]),
    op('gt', ref(['item']), lit(2))
)
// Result: 3
```

---

### 🔍 Type Check Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `isNull` | `(val)` | Is null/undefined |
| `isNotNull` | `(val)` | Is not null |
| `isEmpty` | `(val)` | Is empty (null, '', [], {}) |
| `isNotEmpty` | `(val)` | Is not empty |
| `isNotBlank` | `(val)` | Has non-whitespace content |
| `isNumber` | `(val)` | Is number |
| `isString` | `(val)` | Is string |
| `isBoolean` | `(val)` | Is boolean |
| `isArray` | `(val)` | Is array |
| `isObject` | `(val)` | Is object |
| `isInteger` | `(val)` | Is integer |
| `isFloat` | `(val)` | Is float |
| `isPositive` | `(val)` | Is positive number |
| `isNegative` | `(val)` | Is negative number |
| `isEven` | `(val)` | Is even number |
| `isOdd` | `(val)` | Is odd number |

---

### ✅ Validation Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `isEmail` | `(val)` | Valid email format |
| `isUrl` | `(val)` | Valid URL format |
| `isPhone` | `(val)` | Valid phone format |
| `isAlpha` | `(val)` | Letters only |
| `isAlphanumeric` | `(val)` | Letters and numbers only |
| `isNumeric` | `(val)` | Digits only |
| `isUuid` | `(val)` | Valid UUID format |
| `isSlug` | `(val)` | Valid slug format |
| `isIpv4` | `(val)` | Valid IPv4 address |
| `isIpv6` | `(val)` | Valid IPv6 address |
| `isHex` | `(val)` | Valid hex string |
| `isCreditCard` | `(val)` | Valid credit card number |
| `isPostalCode` | `(val)` | Valid US postal code |
| `isSsn` | `(val)` | Valid SSN format |
| `isValidDate` | `(val)` | Valid date string |

---

### 📅 Date Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `now` | `()` | Current ISO timestamp |
| `today` | `()` | Today's date (YYYY-MM-DD) |
| `parseDate` | `(str)` | Parse to ISO |
| `year` | `(date)` | Get year |
| `month` | `(date)` | Get month (1-12) |
| `day` | `(date)` | Get day of month |
| `dayOfWeek` | `(date)` | Get day of week (0-6) |
| `age` | `(birthdate)` | Calculate age in years |
| `dateDiff` | `(d1, d2, unit)` | Difference in units |
| `dateAdd` | `(date, amount, unit)` | Add to date |
| `dateSub` | `(date, amount, unit)` | Subtract from date |
| `isFuture` | `(date)` | Is in the future |
| `isPast` | `(date)` | Is in the past |
| `isToday` | `(date)` | Is today |
| `isWeekday` | `(date)` | Is Monday-Friday |
| `isWeekend` | `(date)` | Is Saturday-Sunday |
| `isBefore` | `(d1, d2)` | d1 is before d2 |
| `isAfter` | `(d1, d2)` | d1 is after d2 |

**Units:** `'days'`, `'months'`, `'years'`, `'hours'`, `'minutes'`, `'seconds'`

**Examples:**

```typescript
// Age validation
op('gte', op('age', ref(['birthdate', 'value'])), lit(18))

// Date difference
op('dateDiff', ref(['startDate']), op('now'), lit('days'))

// Add 30 days
op('dateAdd', op('today'), lit(30), lit('days'))
```

---

### 🗂️ Object Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `get` | `(obj, key)` | Get property |
| `keys` | `(obj)` | Get keys |
| `values` | `(obj)` | Get values |
| `entries` | `(obj)` | Get [key, value] pairs |
| `has` | `(obj, key)` | Has property |
| `merge` | `(...objs)` | Merge objects |

---

### 🔄 Conversion Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `toNumber` | `(val)` | Convert to number |
| `toBoolean` | `(val)` | Convert to boolean |
| `toArray` | `(val)` | Convert to array |
| `toJson` | `(val)` | Convert to JSON string |
| `fromJson` | `(str)` | Parse JSON string |

---

### 📁 File Operators

| Operator | Arguments | Description |
|----------|-----------|-------------|
| `fileSize` | `(file)` | Get file size |
| `fileName` | `(file)` | Get file name |
| `fileExt` | `(file)` | Get file extension |
| `fileType` | `(file)` | Get MIME type |
| `isImage` | `(file)` | Is image file |
| `isPdf` | `(file)` | Is PDF file |
| `isVideo` | `(file)` | Is video file |
| `isAudio` | `(file)` | Is audio file |
| `isDocument` | `(file)` | Is document file |
| `isFileType` | `(file, types)` | Matches any type |

---

## 🏗️ Creating Custom Operators

### Simple Operator

```typescript
import { defaultRegistry, evalArgs } from 'turing-property';

// Percentage calculation
defaultRegistry.register('percent', async (args, ctx) => {
    const [value, total] = await evalArgs(args, ctx);
    return ((value as number) / (total as number)) * 100;
});

// Usage
const expr = op('percent', lit(25), lit(100));
// Result: 25
```

### Operator with Context

```typescript
import { defaultRegistry, evalArg } from 'turing-property';

// Get sibling value
defaultRegistry.register('getSibling', async (args, ctx) => {
    const [siblingId] = await evalArgs(args, ctx);
    const parent = ctx.current.parent;
    if (parent?.children) {
        const sibling = parent.children[siblingId as string];
        return sibling?.value;
    }
    return null;
});
```

### Operator with Variable Bindings

```typescript
import { defaultRegistry, evalArg, withBindings, evaluate } from 'turing-property';

// Custom loop operator
defaultRegistry.register('times', async (args, ctx) => {
    const count = await evalArg(args[0]!, ctx) as number;
    const expr = args[1]!;
    const results: unknown[] = [];
    
    for (let i = 0; i < count; i++) {
        const loopCtx = withBindings(ctx, { i });
        results.push(await evaluate(expr, loopCtx));
    }
    
    return results;
});

// Usage: Generate [0, 1, 2, 3, 4]
op('times', lit(5), ref(['i']))
```

---

## 🔗 Operator Composition

Operators compose naturally through nesting:

```typescript
// Complex expression: (price * quantity) - (price * quantity * discountRate)
const total = op('sub',
    op('mul', ref(['price']), ref(['quantity'])),
    op('mul',
        op('mul', ref(['price']), ref(['quantity'])),
        ref(['discountRate'])
    )
);

// Conditional with nested operators
const status = op('if',
    op('eq', ref(['items', 'value']), lit(0)),
    lit('Empty'),
    op('if',
        op('lt', ref(['items', 'value']), lit(5)),
        lit('Few items'),
        lit('Many items')
    )
);
```

---

## 📚 Next Steps

- 🧠 [Core Concepts](./core-concepts.md) — Property model fundamentals
- 🏷️ [Types](./types.md) — The type system
- 🔢 [Expressions](./expressions.md) — `lit`, `ref`, `op` patterns
- 🎨 [Metadata](./metadata.md) — Dynamic metadata
- ✅ [Constraints](./constraints.md) — Validation rules


