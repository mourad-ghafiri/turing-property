# ✅ Constraints System

Constraints are validation rules that ensure property values meet specific requirements. Like everything in Turing Property, constraints are Properties!

---

## 🎯 How Constraints Work

A constraint is a Property whose value is an expression that evaluates to `true` (valid) or `false` (invalid):

```typescript
import { CONSTRAINT, op, ref, lit } from 'turing-property';

const REQUIRED: Property = {
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'This field is required' }
    }
};
```

---

## 📦 Builtin Constraints

### ✋ Presence Constraints

```typescript
import { REQUIRED, OPTIONAL, NOT_EMPTY, MUST_BE_NULL } from 'turing-property';

const email = pEmail('email', {
    constraints: {
        required: REQUIRED  // Must not be null/empty
    }
});

const nickname = pText('nickname', {
    constraints: {
        optional: OPTIONAL  // Always passes (explicit optional marker)
    }
});
```

### 📝 String Constraints

```typescript
import {
    MIN_LENGTH, MAX_LENGTH, EXACT_LENGTH, LENGTH_BETWEEN, PATTERN,
    EMAIL, URL, PHONE, ALPHA, ALPHANUMERIC, NUMERIC,
    UUID, SLUG, IPV4, IPV6, HEX_COLOR, CREDIT_CARD, POSTAL_CODE, SSN,
    STARTS_WITH, ENDS_WITH, CONTAINS, LOWERCASE, UPPERCASE
} from 'turing-property';

// Length constraints
const username = pText('username', {
    constraints: {
        minLength: MIN_LENGTH(3),
        maxLength: MAX_LENGTH(20)
    }
});

const code = pText('code', {
    constraints: {
        exactLength: EXACT_LENGTH(6)
    }
});

// Pattern matching
const phone = pPhone('phone', {
    constraints: {
        phone: PHONE,
        pattern: PATTERN(/^\+\d{1,3}\s?\d+$/, 'Include country code')
    }
});

// Format validation
const email = pEmail('email', { constraints: { email: EMAIL } });
const website = pUrl('website', { constraints: { url: URL } });
const uuid = pUuid('id', { constraints: { uuid: UUID } });

// Content validation
const tag = pText('tag', {
    constraints: {
        slug: SLUG,           // URL-friendly
        lowercase: LOWERCASE  // Must be lowercase
    }
});
```

### 🔢 Number Constraints

```typescript
import {
    MIN, MAX, BETWEEN, IN_RANGE, POSITIVE, NEGATIVE, NON_NEGATIVE,
    INTEGER, EVEN, ODD, DIVISIBLE_BY
} from 'turing-property';

const age = pNumber('age', {
    constraints: {
        min: MIN(0),
        max: MAX(150),
        integer: INTEGER
    }
});

const quantity = pNumber('quantity', {
    constraints: {
        positive: POSITIVE,
        integer: INTEGER
    }
});

const discount = pNumber('discount', {
    constraints: {
        between: BETWEEN(0, 100)
    }
});

const evenNumber = pNumber('even', {
    constraints: {
        even: EVEN
    }
});
```

### 📅 Date Constraints

```typescript
import {
    FUTURE_DATE, PAST_DATE, TODAY, AFTER_DATE, BEFORE_DATE,
    MIN_AGE, MAX_AGE, WEEKDAY, WEEKEND
} from 'turing-property';

const birthDate = pDateOfBirth('dob', 18, {
    constraints: {
        pastDate: PAST_DATE,
        minAge: MIN_AGE(18)
    }
});

const appointmentDate = pFutureDate('appointment', {
    constraints: {
        futureDate: FUTURE_DATE,
        weekday: WEEKDAY  // No weekends
    }
});

const eventDate = pDate('eventDate', {
    constraints: {
        afterDate: AFTER_DATE('2024-01-01'),
        beforeDate: BEFORE_DATE('2025-12-31')
    }
});
```

### 📚 Array Constraints

```typescript
import { MIN_ITEMS, MAX_ITEMS, UNIQUE_ITEMS, NOT_EMPTY_ARRAY } from 'turing-property';

const tags = pMultiSelect('tags', options, {
    constraints: {
        notEmpty: NOT_EMPTY_ARRAY,
        minItems: MIN_ITEMS(1),
        maxItems: MAX_ITEMS(10),
        unique: UNIQUE_ITEMS
    }
});
```

### 📁 File Constraints

```typescript
import { MAX_FILE_SIZE, IS_IMAGE, IS_PDF } from 'turing-property';

const avatar = pImageFile('avatar', {
    constraints: {
        isImage: IS_IMAGE,
        maxSize: MAX_FILE_SIZE(5 * 1024 * 1024)  // 5MB
    }
});

const document = pPdfFile('contract', {
    constraints: {
        isPdf: IS_PDF,
        maxSize: MAX_FILE_SIZE(10 * 1024 * 1024)  // 10MB
    }
});
```

### 🔗 Cross-Field Constraints

```typescript
import { EQUALS_FIELD, BEFORE_FIELD, AFTER_FIELD } from 'turing-property';

const form = pForm('registration', {
    password: pPassword('password'),
    confirmPassword: pPassword('confirmPassword', 8, {
        constraints: {
            // Must match password field
            equalsPassword: EQUALS_FIELD(['parent', 'children', 'password', 'value'])
        }
    }),
    
    startDate: pDate('startDate'),
    endDate: pDate('endDate', {
        constraints: {
            // Must be after start date
            afterStart: AFTER_FIELD(['parent', 'children', 'startDate', 'value'])
        }
    })
});
```

### 🎯 Value Constraints

```typescript
import { ONE_OF, EQUALS, IS_TRUE, ACCEPTED } from 'turing-property';

const status = pSelect('status', options, {
    constraints: {
        oneOf: ONE_OF(['active', 'pending', 'inactive'])
    }
});

const terms = pCheckbox('acceptTerms', {
    constraints: {
        accepted: ACCEPTED  // Must be true
    }
});
```

### ❓ Conditional Constraints

```typescript
import { REQUIRED_IF, REQUIRED_IF_FIELD_EQUALS } from 'turing-property';

const form = pForm('order', {
    orderType: pSelect('orderType', [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' }
    ]),
    
    // Required only for business orders
    companyName: pText('companyName', {
        constraints: {
            requiredIfBusiness: REQUIRED_IF_FIELD_EQUALS(
                ['parent', 'children', 'orderType', 'value'],
                'business'
            )
        }
    }),
    
    // Required if quantity > 100
    bulkDiscount: pNumber('bulkDiscount', {
        constraints: {
            requiredIfBulk: REQUIRED_IF(
                op('gt', ref(['parent', 'children', 'quantity', 'value']), lit(100))
            )
        }
    })
});
```

### 🛠️ Utility Constraints

```typescript
import { ALWAYS_VALID, ALWAYS_INVALID, CUSTOM } from 'turing-property';

// Always valid (useful for debugging)
const debug = pText('debug', {
    constraints: { always: ALWAYS_VALID }
});

// Custom constraint with expression
const customField = pText('customField', {
    constraints: {
        custom: CUSTOM(
            op('and',
                op('isNotBlank', ref(['self', 'value'])),
                op('startsWith', ref(['self', 'value']), lit('PREFIX_'))
            ),
            'Value must start with PREFIX_'
        )
    }
});
```

---

## 🔍 Checking Constraints

### Single Property

```typescript
import { checkConstraints, defaultRegistry } from 'turing-property';

const ctx = {
    current: myProperty,
    root: rootProperty,
    registry: defaultRegistry
};

const errors = await checkConstraints(myProperty, ctx);
// { required: 'This field is required', email: 'Invalid email format' }

if (Object.keys(errors).length === 0) {
    console.log('Valid!');
}
```

### Deep Checking (Entire Tree)

```typescript
import { checkConstraintsDeep } from 'turing-property';

const result = await checkConstraintsDeep(formProperty, ctx);

// {
//   valid: false,
//   errors: {
//     'children.email.required': 'This field is required',
//     'children.password.minLength': 'Must be at least 8 characters'
//   }
// }
```

### Using PropertyNode

```typescript
const form = new PropertyNode(myForm);
form.setRegistry(defaultRegistry);

// Validate a specific field
const emailNode = form.child('email');
const errors = await checkConstraints(emailNode!.toProperty(), {
    current: emailNode!,
    root: form,
    registry: defaultRegistry
});
```

---

## 💡 Custom Constraint Examples

### 🔒 Strong Password

```typescript
const STRONG_PASSWORD = CUSTOM(
    op('and',
        op('gte', op('strlen', ref(['self', 'value'])), lit(8)),
        op('and',
            op('matches', ref(['self', 'value']), lit('[A-Z]')),  // Uppercase
            op('and',
                op('matches', ref(['self', 'value']), lit('[a-z]')),  // Lowercase
                op('and',
                    op('matches', ref(['self', 'value']), lit('[0-9]')),  // Number
                    op('matches', ref(['self', 'value']), lit('[^A-Za-z0-9]'))  // Special
                )
            )
        )
    ),
    'Password must contain uppercase, lowercase, number, and special character'
);
```

### 💳 Valid Credit Card Expiry

```typescript
const VALID_EXPIRY = CUSTOM(
    op('and',
        op('matches', ref(['self', 'value']), lit('^(0[1-9]|1[0-2])/([0-9]{2})$')),
        op('isFuture',
            op('concat',
                lit('20'),
                op('substr', ref(['self', 'value']), lit(3), lit(2)),
                lit('-'),
                op('substr', ref(['self', 'value']), lit(0), lit(2)),
                lit('-01')
            )
        )
    ),
    'Card has expired'
);
```

### 🏷️ Unique in List

```typescript
const UNIQUE_IN_LIST = (listPath: string[]) => CUSTOM(
    op('not',
        op('contains',
            op('filter',
                ref(listPath),
                op('neq', ref(['item']), ref(['self', 'value']))
            ),
            ref(['self', 'value'])
        )
    ),
    'This value is already in use'
);
```

### 📊 Business Hours

```typescript
const BUSINESS_HOURS = CUSTOM(
    op('and',
        op('gte', op('hour', ref(['self', 'value'])), lit(9)),
        op('lte', op('hour', ref(['self', 'value'])), lit(17))
    ),
    'Please select a time between 9 AM and 5 PM'
);
```

---

## 🌍 Real-World Validation Patterns

### 📝 Registration Form

```typescript
const registrationForm = pForm('registration', {
    email: pEmail('email', {
        constraints: {
            required: REQUIRED,
            email: EMAIL,
            maxLength: MAX_LENGTH(255)
        }
    }),
    
    password: pPassword('password', 8, {
        constraints: {
            required: REQUIRED,
            minLength: MIN_LENGTH(8),
            maxLength: MAX_LENGTH(128)
        }
    }),
    
    confirmPassword: pPassword('confirmPassword', 8, {
        constraints: {
            required: REQUIRED,
            equalsPassword: EQUALS_FIELD(['parent', 'children', 'password', 'value'])
        }
    }),
    
    age: pNumber('age', {
        constraints: {
            required: REQUIRED,
            between: BETWEEN(13, 120)
        }
    }),
    
    acceptTerms: pCheckbox('acceptTerms', {
        constraints: {
            accepted: ACCEPTED
        }
    })
});
```

### 🛒 Checkout Form

```typescript
const checkoutForm = pForm('checkout', {
    shipping: pAddress('shipping', {
        constraints: { required: REQUIRED }
    }),
    
    sameAsBilling: pCheckbox('sameAsBilling'),
    
    billing: pAddress('billing', {
        constraints: {
            requiredIfDifferent: REQUIRED_IF(
                op('not', ref(['parent', 'children', 'sameAsBilling', 'value']))
            )
        }
    }),
    
    payment: pCreditCardInfo('payment', {
        constraints: { required: REQUIRED }
    })
});
```

---

## 📚 Next Steps

- 🏷️ [Types](./types.md) — The type system
- 🧩 [Properties](./properties.md) — All builtin properties
- 💡 [Examples](./examples/) — More validation patterns
- 🔢 [Expressions](./expressions.md) — Master expression building

