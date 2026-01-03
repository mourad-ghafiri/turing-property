# API Reference

Complete API reference for Turing Property.

---

## Table of Contents

- [Core](#core)
  - [Property Interface](#property-interface)
  - [PropertyNode Class](#propertynode-class)
  - [Evaluation](#evaluation)
- [Types](#types)
  - [Meta Types](#meta-types)
  - [Expression Types](#expression-types)
  - [Primitive Types](#primitive-types)
  - [Temporal Types](#temporal-types)
  - [Structural Types](#structural-types)
  - [Type Factories](#type-factories)
- [Expressions](#expressions)
- [Operators](#operators)
- [Constraints](#constraints)
- [Metadata](#metadata)
- [Properties](#properties)
- [Utilities](#utilities)

---

## Core

### Property Interface

The fundamental data structure. Everything in the system is a Property.

```typescript
interface Property {
    id: string;                            // Unique identifier
    type: Property;                        // Type (also a Property)
    value?: unknown;                       // Value (static or expression)
    defaultValue?: unknown;                // Default value
    metadata?: Record<string, Property>;   // Metadata properties
    constraints?: Record<string, Property>;// Constraint properties
    children?: Record<string, Property>;   // Child properties
}
```

---

### PropertyNode Class

Wraps a `Property` and provides tree navigation, evaluation, and mutation methods.

#### Constructor

```typescript
new PropertyNode(property: Property)
```

#### Setup

| Method | Description |
|--------|-------------|
| `setRegistry(registry: OperatorRegistry): void` | Set the operator registry for expression evaluation. **Required before getValue/getMetadata/snapshot.** |
| `clearCache(): void` | Clear the evaluation cache |

#### Tree Navigation

| Property/Method | Return Type | Description |
|-----------------|-------------|-------------|
| `parent` | `PropertyNode \| undefined` | Parent node |
| `root` | `PropertyNode` | Root of the tree |
| `key` | `string \| undefined` | This node's key in parent's children |
| `childKeys` | `string[]` | All child keys |
| `child(key)` | `PropertyNode \| undefined` | Get child by key |
| `getByPath(path)` | `PropertyNode \| undefined` | Get descendant by path array |
| `path()` | `string[]` | Path from root to this node |
| `descendants()` | `PropertyNode[]` | All descendant nodes |
| `ancestors()` | `PropertyNode[]` | All ancestor nodes |
| `siblings()` | `PropertyNode[]` | All sibling nodes |

#### Value Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getValue(path?)` | `Promise<unknown>` | Get evaluated value (evaluates expressions) |
| `setValue(value, path?)` | `void` | Set static value |
| `setValueExpr(expr, path?)` | `void` | Set value as expression |

#### Default Value Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getDefaultValue()` | `unknown` | Get raw default value |
| `getDefaultValueEvaluated()` | `Promise<unknown>` | Get evaluated default value |
| `hasDefaultValue()` | `boolean` | Check if default is defined |
| `setDefaultValue(value)` | `void` | Set default value |
| `setDefaultValueExpr(expr)` | `void` | Set default as expression |

#### Metadata Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getMetadata(key)` | `Promise<unknown>` | Get evaluated metadata value |
| `setMetadata(key, property)` | `void` | Set metadata property |

#### Constraint Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `addConstraint(constraint)` | `void` | Add constraint property |
| `removeConstraint(id)` | `void` | Remove constraint by id |

#### Child Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `addChild(key, property)` | `PropertyNode` | Add child property |
| `removeChild(key)` | `void` | Remove child by key |

#### Reset Operations

| Method | Description |
|--------|-------------|
| `resetNode()` | Reset this node to default value |
| `resetNodeEvaluated()` | Reset to evaluated default (async) |
| `resetToValue(value)` | Reset to specific value |
| `resetChildren()` | Reset all children (deep) |
| `resetDeep()` | Reset this node and all descendants |
| `resetAll()` | Reset entire tree from root |
| `resetByPath(path, deep?)` | Reset node at path |
| `resetIf(predicate, deep?)` | Reset nodes matching predicate |
| `resetByType(typeId, deep?)` | Reset nodes of specific type |
| `resetModified()` | Reset only modified nodes |
| `clear()` | Set this node's value to undefined |
| `clearAll()` | Clear all values in subtree |

#### Dirty Check Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `isDirtyNode()` | `boolean` | Check if this node is modified |
| `isDirty()` | `boolean` | Check if any node in subtree is modified |
| `getModifiedFields()` | `string[][]` | Get paths of all modified fields |
| `getModifiedFieldsFlat()` | `string[]` | Get modified fields as dot-notation strings |

#### ID Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `collectIds()` | `string[]` | Collect all IDs in subtree |
| `hasDuplicateIds()` | `boolean` | Check for duplicate IDs |
| `getDuplicateIds()` | `string[]` | Get all duplicate IDs |

#### Tree Statistics

| Method | Return Type | Description |
|--------|-------------|-------------|
| `countNodes()` | `number` | Count total nodes in subtree |
| `maxDepth()` | `number` | Get maximum depth of subtree |

#### Snapshot Operations

| Method | Return Type | Description |
|--------|-------------|-------------|
| `snapshot()` | `Promise<Record<string, unknown>>` | Get nested key-value object of all values |
| `snapshotFlat()` | `Promise<Record<string, unknown>>` | Get flat object with dot-notation keys |
| `setFromSnapshot(values)` | `void` | Set values from nested object |
| `setFromSnapshotFlat(values)` | `void` | Set values from flat object |

---

### Evaluation

#### Types

```typescript
type OperatorFn = (args: Property[], ctx: EvaluationContext) => unknown | Promise<unknown>;

interface OperatorRegistry {
    get(name: string): OperatorFn | undefined;
    register(name: string, fn: OperatorFn): void;
    has(name: string): boolean;
}

interface EvaluationContext {
    current: Property;                    // Current property being evaluated
    root: Property;                       // Root of the property tree
    registry: OperatorRegistry;           // Operator registry
    bindings?: Record<string, unknown>;   // Variable bindings (map/filter/reduce)
    depth?: number;                       // Evaluation depth
    cache?: EvaluationCache;              // Evaluation cache
    findParentFn?: (target: Property) => Property | undefined;
}
```

#### Functions

| Function | Description |
|----------|-------------|
| `createRegistry()` | Create a new empty operator registry |
| `evaluate(expr, ctx)` | Evaluate a Property expression |
| `evalArg(arg, ctx)` | Evaluate a single argument |
| `evalArgs(args, ctx)` | Evaluate multiple arguments |
| `withBindings(ctx, bindings)` | Create context with variable bindings |

#### Type Checking

| Function | Description |
|----------|-------------|
| `isLit(p)` | Check if Property is a Literal expression |
| `isRef(p)` | Check if Property is a Reference expression |
| `isOp(p)` | Check if Property is an Operator call |
| `isExpr(p)` | Check if Property is any expression type |
| `isType(p)` | Check if Property is a Type |
| `isConstraint(p)` | Check if Property is a Constraint |
| `isOperator(p)` | Check if Property is an Operator |
| `getTypeName(p)` | Get the type name of a Property |

---

## Types

### Meta Types

| Type | Description |
|------|-------------|
| `TYPE` | The type of all types (self-referential) |
| `EXPR` | The type of all expressions |
| `OPERATOR` | The type of all operators |
| `CONSTRAINT` | The type of all constraints |
| `PROPERTY` | The type of user-defined properties |

### Expression Types

| Type | Description |
|------|-------------|
| `LIT` | Literal expression type |
| `REF` | Reference expression type |
| `OP` | Operator call expression type |

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
| `DATE` | Date only (no time) | `YYYY-MM-DD` |
| `DATETIME` | Date and time | `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601) |
| `TIME` | Time only (no date) | `HH:mm:ss` |
| `DURATION` | Time span/duration | ISO 8601 duration: `P[n]Y[n]M[n]DT[n]H[n]M[n]S` |
| `TIMESTAMP` | Unix timestamp | Milliseconds since epoch |

### Structural Types

| Type | Description |
|------|-------------|
| `LIST` | Array type |
| `OBJECT` | Object with named properties |
| `RECORD` | Dictionary type |
| `UNION` | Union of types |
| `INTERSECTION` | Intersection of types |
| `LITERAL` | Exact value type |
| `FUNCTION` | Function signature |
| `ENUM` | Enumeration of allowed values |

### Type Factories

#### Primitive Type Factories

| Factory | Signature | Description |
|---------|-----------|-------------|
| `tString()` | `() => Property` | Create STRING type |
| `tNumber()` | `() => Property` | Create NUMBER type |
| `tBoolean()` | `() => Property` | Create BOOLEAN type |
| `tNull()` | `() => Property` | Create NULL type |
| `tAny()` | `() => Property` | Create ANY type |

#### Temporal Type Factories

| Factory | Signature | Description |
|---------|-----------|-------------|
| `tDate()` | `() => Property` | Create DATE type |
| `tDateTime()` | `() => Property` | Create DATETIME type |
| `tTime()` | `() => Property` | Create TIME type |
| `tDuration()` | `() => Property` | Create DURATION type |
| `tTimestamp()` | `() => Property` | Create TIMESTAMP type |

#### Structural Type Factories

| Factory | Signature | Description |
|---------|-----------|-------------|
| `tList(elementType)` | `(Property) => Property` | Create LIST type |
| `tObject(properties)` | `(Record<string, Property>) => Property` | Create OBJECT type |
| `tRecord(valueType)` | `(Property) => Property` | Create RECORD type |
| `tUnion(...types)` | `(...Property[]) => Property` | Create UNION type |
| `tIntersection(...types)` | `(...Property[]) => Property` | Create INTERSECTION type |
| `tLiteral(value)` | `(unknown) => Property` | Create LITERAL type |
| `tFunction(params, returns)` | `(Property[], Property) => Property` | Create FUNCTION type |
| `tEnum(name, values)` | `(string, string[] \| Record<string, unknown>) => Property` | Create ENUM type |

#### ENUM Type Examples

```typescript
// Simple enum with string values
const Status = tEnum('Status', ['pending', 'active', 'completed']);
// Creates: { id: 'Status', type: ENUM, children: { pending: {...}, active: {...}, completed: {...} } }

// Enum with named values (name -> value mapping)
const Priority = tEnum('Priority', { LOW: 1, MEDIUM: 2, HIGH: 3 });
// Creates: { id: 'Priority', type: ENUM, children: { LOW: {..., value: 1}, MEDIUM: {..., value: 2}, HIGH: {..., value: 3} } }

// Mixed types in values
const Config = tEnum('Config', { DEBUG: true, VERSION: '1.0', MAX_RETRIES: 5 });
```

---

## Expressions

Expression factories for creating computable values.

| Factory | Signature | Description |
|---------|-----------|-------------|
| `lit(value)` | `(unknown) => Property` | Create literal expression |
| `ref(path)` | `(string[]) => Property` | Create reference expression |
| `op(name, ...args)` | `(string, ...Property[]) => Property` | Create operator call expression |

### Reference Path Segments

| Segment | Description |
|---------|-------------|
| `self` | Current property |
| `parent` | Parent property |
| `root` | Root of tree |
| `children` | Children collection (can be omitted) |
| `metadata` | Metadata collection (can be omitted) |
| `constraints` | Constraints collection |
| `value` | The value field |
| `type` | The type field |
| `id` | The id field |

**Example:**
```typescript
ref(['parent', 'name', 'value'])  // Sibling's value (shortcut)
ref(['parent', 'children', 'name', 'value'])  // Same as above (explicit)
ref(['root', 'config', 'debug', 'value'])  // From root
```

---

## Operators

145+ built-in operators available via `defaultRegistry`.

### Arithmetic

| Operator | Args | Description |
|----------|------|-------------|
| `add` | 2 | Addition |
| `sub` | 2 | Subtraction |
| `mul` | 2 | Multiplication |
| `div` | 2 | Division |
| `mod` | 2 | Modulo |
| `pow` | 2 | Power |
| `abs` | 1 | Absolute value |
| `neg` | 1 | Negation |
| `round` | 1 | Round to nearest |
| `floor` | 1 | Round down |
| `ceil` | 1 | Round up |
| `sqrt` | 1 | Square root |
| `min` | n | Minimum value |
| `max` | n | Maximum value |

### Comparison

| Operator | Args | Description |
|----------|------|-------------|
| `eq` | 2 | Equal |
| `neq` | 2 | Not equal |
| `gt` | 2 | Greater than |
| `gte` | 2 | Greater than or equal |
| `lt` | 2 | Less than |
| `lte` | 2 | Less than or equal |

### Logic

| Operator | Args | Description |
|----------|------|-------------|
| `and` | 2 | Logical AND |
| `or` | 2 | Logical OR |
| `not` | 1 | Logical NOT |
| `if` | 3 | Conditional (if/then/else) |
| `coalesce` | n | First non-null value |

### String

| Operator | Args | Description |
|----------|------|-------------|
| `concat` | n | Concatenate strings |
| `upper` | 1 | Uppercase |
| `lower` | 1 | Lowercase |
| `trim` | 1 | Trim whitespace |
| `trimStart` | 1 | Trim leading whitespace |
| `trimEnd` | 1 | Trim trailing whitespace |
| `strlen` | 1 | String length |
| `substr` | 2-3 | Substring |
| `replace` | 3 | Replace first occurrence |
| `replaceAll` | 3 | Replace all occurrences |
| `split` | 2 | Split string |
| `startsWith` | 2 | Starts with |
| `endsWith` | 2 | Ends with |
| `contains` | 2 | Contains substring |
| `indexOf` | 2 | Index of substring |
| `matches` | 2 | Regex match |
| `padStart` | 2-3 | Pad start |
| `padEnd` | 2-3 | Pad end |
| `repeat` | 2 | Repeat string |
| `reverse` | 1 | Reverse string |
| `charAt` | 2 | Character at index |

### Array

| Operator | Args | Description |
|----------|------|-------------|
| `len` | 1 | Array length |
| `at` | 2 | Element at index |
| `first` | 1 | First element |
| `last` | 1 | Last element |
| `slice` | 2-3 | Slice array |
| `includes` | 2 | Array includes |
| `indexOf` | 2 | Index of element |
| `join` | 2 | Join with separator |
| `reverse` | 1 | Reverse array |
| `sort` | 1-2 | Sort array |
| `unique` | 1 | Unique elements |
| `flatten` | 1 | Flatten nested arrays |
| `sum` | 1 | Sum of numbers |
| `avg` | 1 | Average of numbers |
| `min` | 1 | Minimum in array |
| `max` | 1 | Maximum in array |
| `count` | 1 | Count elements |
| `isEmpty` | 1 | Check if empty |
| `map` | 2 | Map over array |
| `filter` | 2 | Filter array |
| `reduce` | 3 | Reduce array |
| `find` | 2 | Find element |
| `every` | 2 | All match predicate |
| `some` | 2 | Any match predicate |
| `range` | 2-3 | Generate number range |
| `append` | 2 | Append element |
| `prepend` | 2 | Prepend element |
| `concat` | 2 | Concatenate arrays |

### Date

| Operator | Args | Description |
|----------|------|-------------|
| `now` | 0 | Current timestamp |
| `today` | 0 | Today's date |
| `year` | 1 | Extract year |
| `month` | 1 | Extract month |
| `day` | 1 | Extract day |
| `hour` | 1 | Extract hour |
| `minute` | 1 | Extract minute |
| `second` | 1 | Extract second |
| `dayOfWeek` | 1 | Day of week (0-6) |
| `dayOfYear` | 1 | Day of year |
| `weekOfYear` | 1 | Week of year |
| `daysInMonth` | 1 | Days in month |
| `isLeapYear` | 1 | Is leap year |
| `dateDiff` | 3 | Difference between dates |
| `dateAdd` | 3 | Add to date |
| `formatDate` | 2 | Format date |
| `parseDate` | 1-2 | Parse date string |
| `startOfDay` | 1 | Start of day |
| `endOfDay` | 1 | End of day |
| `startOfMonth` | 1 | Start of month |
| `endOfMonth` | 1 | End of month |
| `startOfYear` | 1 | Start of year |
| `endOfYear` | 1 | End of year |

### Object

| Operator | Args | Description |
|----------|------|-------------|
| `get` | 2 | Get property |
| `set` | 3 | Set property |
| `has` | 2 | Has property |
| `keys` | 1 | Get keys |
| `values` | 1 | Get values |
| `entries` | 1 | Get entries |
| `merge` | n | Merge objects |
| `pick` | 2 | Pick properties |
| `omit` | 2 | Omit properties |

### Validation

| Operator | Args | Description |
|----------|------|-------------|
| `isNotBlank` | 1 | Not blank string |
| `isEmail` | 1 | Valid email |
| `isUrl` | 1 | Valid URL |
| `isNumber` | 1 | Is number |
| `isInteger` | 1 | Is integer |
| `isPositive` | 1 | Is positive |
| `isNegative` | 1 | Is negative |
| `isAlpha` | 1 | Only letters |
| `isAlphanumeric` | 1 | Letters and numbers |
| `isNumeric` | 1 | Only digits |
| `isUuid` | 1 | Valid UUID |
| `isCreditCard` | 1 | Valid credit card |
| `isPhone` | 1 | Valid phone |
| `isPostalCode` | 1 | Valid postal code |
| `isIpv4` | 1 | Valid IPv4 |
| `isIpv6` | 1 | Valid IPv6 |
| `isHexColor` | 1 | Valid hex color |
| `isSlug` | 1 | Valid slug |

### Type Checking

| Operator | Args | Description |
|----------|------|-------------|
| `isNull` | 1 | Is null |
| `isUndefined` | 1 | Is undefined |
| `isNullOrUndefined` | 1 | Is null or undefined |
| `isDefined` | 1 | Is defined |
| `isString` | 1 | Is string |
| `isNumber` | 1 | Is number |
| `isBoolean` | 1 | Is boolean |
| `isArray` | 1 | Is array |
| `isObject` | 1 | Is object |
| `typeof` | 1 | Get type name |

### Conversion

| Operator | Args | Description |
|----------|------|-------------|
| `toString` | 1 | Convert to string |
| `toNumber` | 1 | Convert to number |
| `toBoolean` | 1 | Convert to boolean |
| `toArray` | 1 | Convert to array |
| `toJson` | 1 | Convert to JSON string |
| `fromJson` | 1 | Parse JSON string |

---

## Constraints

Validation rules that are also Properties.

### Constraint Checking

| Function | Signature | Description |
|----------|-----------|-------------|
| `checkConstraints(node, ctx)` | `(PropertyNode, EvaluationContext) => Promise<{valid, errors}>` | Check constraints on a single node |
| `checkConstraintsDeep(node, ctx)` | `(PropertyNode, EvaluationContext) => Promise<{valid, errors}>` | Check constraints on node and all descendants |

### Presence Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `REQUIRED` | - | Value must not be empty |
| `OPTIONAL` | - | Value is optional |
| `MUST_BE_NULL` | - | Value must be null |
| `NOT_EMPTY` | - | Value must not be empty |

### String Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `MIN_LENGTH` | `(n)` | Minimum string length |
| `MAX_LENGTH` | `(n)` | Maximum string length |
| `EXACT_LENGTH` | `(n)` | Exact string length |
| `LENGTH_BETWEEN` | `(min, max)` | Length in range |
| `PATTERN` | `(regex, msg?)` | Must match regex |
| `EMAIL` | - | Valid email format |
| `URL` | - | Valid URL format |
| `PHONE` | - | Valid phone format |
| `ALPHA` | - | Only letters |
| `ALPHANUMERIC` | - | Letters and numbers |
| `NUMERIC` | - | Only digits |
| `UUID` | - | Valid UUID |
| `SLUG` | - | Valid URL slug |
| `IPV4` | - | Valid IPv4 address |
| `IPV6` | - | Valid IPv6 address |
| `HEX_COLOR` | - | Valid hex color |
| `CREDIT_CARD` | - | Valid credit card |
| `POSTAL_CODE` | - | Valid postal code |
| `SSN` | - | Valid SSN |
| `STARTS_WITH` | `(prefix)` | Starts with string |
| `ENDS_WITH` | `(suffix)` | Ends with string |
| `CONTAINS` | `(substring)` | Contains substring |
| `LOWERCASE` | - | Must be lowercase |
| `UPPERCASE` | - | Must be uppercase |

### Number Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `MIN` | `(n)` | Minimum value |
| `MAX` | `(n)` | Maximum value |
| `BETWEEN` | `(min, max)` | Value in range |
| `IN_RANGE` | `(min, max)` | Value in range (alias) |
| `POSITIVE` | - | Must be positive |
| `NEGATIVE` | - | Must be negative |
| `NON_NEGATIVE` | - | Must be >= 0 |
| `INTEGER` | - | Must be integer |
| `EVEN` | - | Must be even |
| `ODD` | - | Must be odd |
| `DIVISIBLE_BY` | `(n)` | Must be divisible by n |

### Date Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `FUTURE_DATE` | - | Must be in future |
| `PAST_DATE` | - | Must be in past |
| `TODAY` | - | Must be today |
| `AFTER_DATE` | `(date)` | Must be after date |
| `BEFORE_DATE` | `(date)` | Must be before date |
| `MIN_AGE` | `(years)` | Minimum age |
| `MAX_AGE` | `(years)` | Maximum age |
| `WEEKDAY` | - | Must be weekday |
| `WEEKEND` | - | Must be weekend |

### Array Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `MIN_ITEMS` | `(n)` | Minimum array length |
| `MAX_ITEMS` | `(n)` | Maximum array length |
| `UNIQUE_ITEMS` | - | All items must be unique |
| `NOT_EMPTY_ARRAY` | - | Array must not be empty |

### File Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `MAX_FILE_SIZE` | `(bytes)` | Maximum file size |
| `IS_IMAGE` | - | Must be image file |
| `IS_PDF` | - | Must be PDF file |

### Cross-Field Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `EQUALS_FIELD` | `(path)` | Must equal another field |
| `BEFORE_FIELD` | `(path)` | Date must be before field |
| `AFTER_FIELD` | `(path)` | Date must be after field |

### Value Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `ONE_OF` | `(values)` | Must be one of values |
| `EQUALS` | `(value)` | Must equal value |
| `IS_TRUE` | - | Must be true |
| `ACCEPTED` | - | Must be true (for checkboxes) |

### Conditional Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `REQUIRED_IF` | `(condition)` | Required if condition true |
| `REQUIRED_IF_FIELD_EQUALS` | `(path, value)` | Required if field equals value |

### Utility Constraints

| Constraint | Factory | Description |
|------------|---------|-------------|
| `ALWAYS_VALID` | - | Always passes |
| `ALWAYS_INVALID` | `(msg)` | Always fails |
| `CUSTOM` | `(expr, msg)` | Custom expression constraint |

---

## Metadata

Metadata helpers for describing Properties. All accept static values or expressions.

### Display

| Helper | Description |
|--------|-------------|
| `label(value)` | Human-readable label |
| `hint(value)` | Short guidance text |
| `description(value)` | Longer description |
| `placeholder(value)` | Input placeholder |
| `tooltip(value)` | Tooltip on hover |
| `helpText(value)` | Help text |
| `icon(value)` | Icon identifier |
| `prefix(value)` | Prefix display (e.g., "$") |
| `suffix(value)` | Suffix display (e.g., "kg") |

### State

| Helper | Description |
|--------|-------------|
| `visible(value?)` | Whether visible |
| `hidden(value?)` | Whether hidden |
| `disabled(value?)` | Whether disabled |
| `readonly(value?)` | Whether readonly |
| `required(value?)` | Whether required (UI) |
| `loading(value?)` | Whether loading |
| `optional(value?)` | Whether optional |

### Input

| Helper | Description |
|--------|-------------|
| `inputType(value)` | HTML input type |
| `autocomplete(value)` | Autocomplete attribute |
| `inputMode(value)` | Input mode |
| `step(value)` | Step value |
| `min(value)` | Minimum value |
| `max(value)` | Maximum value |
| `rows(value)` | Textarea rows |
| `cols(value)` | Textarea columns |
| `maxLength(value)` | Max input length |
| `minLength(value)` | Min input length |
| `accept(value)` | File accept types |
| `multiple(value)` | Allow multiple |

### Layout

| Helper | Description |
|--------|-------------|
| `layout(value)` | Layout type |
| `gap(value)` | Gap between items |
| `order(value)` | Display order |
| `width(value)` | Width |
| `height(value)` | Height |
| `align(value)` | Alignment |
| `justify(value)` | Justification |
| `variant(value)` | Style variant |
| `styleClasses(value)` | CSS classes |

### Collection

| Helper | Description |
|--------|-------------|
| `options(value)` | Select options |
| `searchable(value)` | Allow search |
| `clearable(value)` | Allow clear |
| `sortable(value)` | Allow sorting |
| `minItems(value)` | Minimum items |
| `maxItems(value)` | Maximum items |

### Container

| Helper | Description |
|--------|-------------|
| `isGroup(value)` | Is group container |
| `isForm(value)` | Is form container |
| `isStep(value)` | Is wizard step |
| `isWizard(value)` | Is wizard |
| `collapsible(value)` | Can collapse |
| `collapsed(value)` | Initially collapsed |

### Action

| Helper | Description |
|--------|-------------|
| `submitLabel(value)` | Submit button label |
| `resetLabel(value)` | Reset button label |
| `nextLabel(value)` | Next step label |
| `prevLabel(value)` | Previous step label |
| `showProgress(value)` | Show progress |

---

## Properties

Pre-configured property factories.

### Input Properties

| Factory | Description |
|---------|-------------|
| `pText(id, options?)` | Text input |
| `pEmail(id, options?)` | Email with validation |
| `pPassword(id, minLength, options?)` | Password input |
| `pNumber(id, options?)` | Number input |
| `pInteger(id, options?)` | Integer input |
| `pRange(id, min, max, options?)` | Range slider |
| `pCheckbox(id, options?)` | Checkbox |
| `pTextarea(id, options?)` | Multi-line text |
| `pColor(id, options?)` | Color picker |
| `pFile(id, options?)` | File upload |
| `pHidden(id, value?)` | Hidden field |

### Select Properties

| Factory | Description |
|---------|-------------|
| `pSelect(id, options, config?)` | Dropdown select |
| `pRadio(id, options, config?)` | Radio buttons |
| `pMultiSelect(id, options, config?)` | Multi-select |
| `pCountry(id, countries, config?)` | Country select |
| `pState(id, states, config?)` | State select |

### Date Properties

| Factory | Description |
|---------|-------------|
| `pDate(id, options?)` | Date picker |
| `pDateTime(id, options?)` | Date + time |
| `pTime(id, options?)` | Time picker |
| `pDateOfBirth(id, minAge?, options?)` | Date of birth |

### Special Properties

| Factory | Description |
|---------|-------------|
| `pPhone(id, options?)` | Phone number |
| `pUrl(id, options?)` | URL input |
| `pCurrency(id, symbol?, options?)` | Currency input |
| `pPercent(id, options?)` | Percentage |
| `pAge(id, options?)` | Age input |
| `pQuantity(id, min?, max?, options?)` | Quantity |
| `pRating(id, max?, options?)` | Star rating |
| `pCreditCard(id, options?)` | Credit card |
| `pCvv(id, options?)` | CVV code |
| `pPostalCode(id, options?)` | Postal code |

### Container Properties

| Factory | Description |
|---------|-------------|
| `pGroup(id, children, options?)` | Group container |
| `pForm(id, children, options?)` | Form container |
| `pStep(id, children, options?)` | Wizard step |
| `pWizard(id, steps, options?)` | Multi-step wizard |
| `pComputed(id, expression)` | Computed value |

### Composite Properties

| Factory | Description |
|---------|-------------|
| `pName(id, options?)` | First + last name |
| `pFullName(id, options?)` | Full name with prefix/suffix |
| `pAddress(id, options?)` | Full address |

---

## Utilities

### Traversal

| Function | Signature | Description |
|----------|-----------|-------------|
| `traverse(property, callback)` | `(Property, TraversalCallback) => void` | Walk property tree |
| `findAll(property, predicate)` | `(Property, (p) => boolean) => Property[]` | Find all matching |
| `findFirst(property, predicate)` | `(Property, (p) => boolean) => Property \| undefined` | Find first matching |
| `countNodes(property)` | `(Property) => number` | Count nodes |
| `maxDepth(property)` | `(Property) => number` | Get max depth |
| `collectIds(property)` | `(Property) => string[]` | Collect all IDs |
| `hasDuplicateIds(property)` | `(Property) => boolean` | Check for duplicates |
| `getDuplicateIds(property)` | `(Property) => string[]` | Get duplicate IDs |

### Serialization

| Function | Signature | Description |
|----------|-----------|-------------|
| `toJSON(property, options?)` | `(Property, ExportOptions?) => object` | Convert to JSON object |
| `toJSONString(property, options?)` | `(Property, ExportOptions?) => string` | Convert to JSON string |
| `fromJSON(json, options?)` | `(object, ImportOptions?) => Property` | Create from JSON object |
| `parseJSON(json, options?)` | `(string, ImportOptions?) => Property` | Parse from JSON string |

### Clone & Merge

| Function | Signature | Description |
|----------|-----------|-------------|
| `clone(property)` | `(Property) => Property` | Deep clone property |
| `merge(target, source)` | `(Property, Property) => Property` | Merge properties |

### Diff

| Function | Signature | Description |
|----------|-----------|-------------|
| `diff(a, b)` | `(Property, Property) => DiffResult` | Compare properties |

### Schema Validation

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateProperty(property)` | `(unknown) => ValidationResult` | Validate property structure |
| `validatePropertyJSON(json)` | `(string) => ValidationResult` | Validate JSON string |
| `validateExpression(expr)` | `(unknown) => ValidationResult` | Validate expression |
| `assertValidProperty(property)` | `(unknown) => void` | Assert valid (throws) |
| `isValidProperty(property)` | `(unknown) => boolean` | Check if valid |

---

## Import Example

```typescript
import {
    // Core
    Property,
    PropertyNode,
    defaultRegistry,

    // Primitive Types
    TYPE, STRING, NUMBER, BOOLEAN, NULL, ANY,

    // Temporal Types
    DATE, DATETIME, TIME, DURATION, TIMESTAMP,

    // Structural Types
    LIST, OBJECT, RECORD, UNION, ENUM,

    // Type Factories
    tString, tNumber, tBoolean, tDate, tDateTime, tTime, tEnum,
    tList, tObject, tUnion,

    // Expressions
    lit, ref, op,

    // Constraints
    REQUIRED, MIN_LENGTH, MAX_LENGTH, PATTERN,
    checkConstraintsDeep,

    // Metadata
    label, hint, visible, disabled,

    // Properties
    pText, pEmail, pGroup, pForm,

    // Utilities
    clone, diff, toJSON, fromJSON
} from 'turing-property';
```
