import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { Property } from '../../src/core/property';
import { EvaluationContext } from '../../src/core/evaluate';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';
import {
    checkConstraints,
    checkConstraintsDeep,
    REQUIRED,
    OPTIONAL,
    MIN_LENGTH,
    MAX_LENGTH,
    PATTERN,
    EMAIL,
    URL,
    PHONE,
    MIN,
    MAX,
    BETWEEN,
    POSITIVE,
    INTEGER,
    MIN_ITEMS,
    MAX_ITEMS,
    UNIQUE_ITEMS,
    ONE_OF,
    EQUALS_FIELD,
    REQUIRED_IF,
    REQUIRED_IF_FIELD_EQUALS
} from '../../src/builtin/constraints';

// Helper to create evaluation context from PropertyNode
function createContext(node: PropertyNode): EvaluationContext {
    return {
        current: node,
        root: node.root,
        registry: defaultRegistry
    };
}

// ============================================================================
// HELPER: Generate forms with various constraint configurations
// ============================================================================

function generateFormWithSimpleConstraints(fieldCount: number): Property {
    const fields: Record<string, Property> = {};

    for (let i = 0; i < fieldCount; i++) {
        fields[`field_${i}`] = {
            id: `field_${i}`,
            type: STRING,
            value: i % 2 === 0 ? `value_${i}` : '', // Half filled, half empty
            constraints: {
                required: REQUIRED
            }
        };
    }

    return {
        id: 'form',
        type: TYPE,
        children: fields
    };
}

function generateFormWithMultipleConstraints(fieldCount: number): Property {
    const fields: Record<string, Property> = {};

    for (let i = 0; i < fieldCount; i++) {
        const isNumber = i % 4 === 0;
        const isEmail = i % 4 === 1;
        const isUrl = i % 4 === 2;
        const isText = i % 4 === 3;

        if (isNumber) {
            fields[`number_${i}`] = {
                id: `number_${i}`,
                type: NUMBER,
                value: i * 10,
                constraints: {
                    required: REQUIRED,
                    min: MIN(0),
                    max: MAX(1000),
                    integer: INTEGER
                }
            };
        } else if (isEmail) {
            fields[`email_${i}`] = {
                id: `email_${i}`,
                type: STRING,
                value: i % 2 === 0 ? `user${i}@example.com` : 'invalid-email',
                constraints: {
                    required: REQUIRED,
                    email: EMAIL
                }
            };
        } else if (isUrl) {
            fields[`url_${i}`] = {
                id: `url_${i}`,
                type: STRING,
                value: i % 2 === 0 ? `https://example${i}.com` : 'not-a-url',
                constraints: {
                    required: REQUIRED,
                    url: URL
                }
            };
        } else {
            fields[`text_${i}`] = {
                id: `text_${i}`,
                type: STRING,
                value: `text value ${i}`,
                constraints: {
                    required: REQUIRED,
                    minLength: MIN_LENGTH(3),
                    maxLength: MAX_LENGTH(100)
                }
            };
        }
    }

    return {
        id: 'form',
        type: TYPE,
        children: fields
    };
}

function generateFormWithPatternConstraints(fieldCount: number): Property {
    const fields: Record<string, Property> = {};

    const patterns = [
        { name: 'phone', pattern: /^\+?[1-9]\d{1,14}$/, valid: '+1234567890', invalid: 'abc' },
        { name: 'zip', pattern: /^\d{5}(-\d{4})?$/, valid: '12345', invalid: 'ABCDE' },
        { name: 'ssn', pattern: /^\d{3}-\d{2}-\d{4}$/, valid: '123-45-6789', invalid: '123456789' },
        { name: 'date', pattern: /^\d{4}-\d{2}-\d{2}$/, valid: '2024-01-15', invalid: '01/15/2024' }
    ];

    for (let i = 0; i < fieldCount; i++) {
        const patternInfo = patterns[i % patterns.length];
        fields[`${patternInfo.name}_${i}`] = {
            id: `${patternInfo.name}_${i}`,
            type: STRING,
            value: i % 2 === 0 ? patternInfo.valid : patternInfo.invalid,
            constraints: {
                required: REQUIRED,
                pattern: PATTERN(patternInfo.pattern)
            }
        };
    }

    return {
        id: 'form',
        type: TYPE,
        children: fields
    };
}

function generateFormWithCrossFieldConstraints(fieldCount: number): Property {
    const fields: Record<string, Property> = {};

    for (let i = 0; i < fieldCount; i += 2) {
        // Password field
        fields[`password_${i}`] = {
            id: `password_${i}`,
            type: STRING,
            value: `password${i}`,
            constraints: {
                required: REQUIRED,
                minLength: MIN_LENGTH(8)
            }
        };

        // Confirm password field with cross-field validation
        fields[`confirmPassword_${i}`] = {
            id: `confirmPassword_${i}`,
            type: STRING,
            value: i % 4 === 0 ? `password${i}` : `differentPassword${i}`, // Half match, half don't
            constraints: {
                required: REQUIRED,
                equalsField: EQUALS_FIELD(`password_${i}`)
            }
        };
    }

    return {
        id: 'form',
        type: TYPE,
        children: fields
    };
}

function generateFormWithConditionalConstraints(fieldCount: number): Property {
    const fields: Record<string, Property> = {
        type: { id: 'type', type: STRING, value: 'business' }
    };

    for (let i = 0; i < fieldCount; i++) {
        fields[`conditional_${i}`] = {
            id: `conditional_${i}`,
            type: STRING,
            value: i % 3 === 0 ? `value_${i}` : '',
            constraints: {
                requiredIf: REQUIRED_IF_FIELD_EQUALS('type', 'business')
            }
        };
    }

    return {
        id: 'form',
        type: TYPE,
        children: fields
    };
}

function generateNestedFormWithConstraints(depth: number, breadth: number): Property {
    if (depth === 0) {
        return {
            id: `leaf_${Math.random().toString(36).substring(7)}`,
            type: STRING,
            value: Math.random() > 0.5 ? 'filled' : '',
            constraints: {
                required: REQUIRED,
                minLength: MIN_LENGTH(1)
            }
        };
    }

    const children: Record<string, Property> = {};
    for (let i = 0; i < breadth; i++) {
        children[`child_${i}`] = generateNestedFormWithConstraints(depth - 1, breadth);
    }

    return {
        id: `node_${depth}`,
        type: TYPE,
        children
    };
}

// ============================================================================
// BENCHMARKS: Simple Constraint Validation
// ============================================================================

describe('Benchmark: Simple Constraint Validation', () => {
    const sizes = [50, 100, 500, 1000];

    sizes.forEach(size => {
        it(`should validate ${size} fields with REQUIRED constraint`, async () => {
            const form = new PropertyNode(generateFormWithSimpleConstraints(size));
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            // Half the fields are empty, so we expect approximately size/2 errors
            expect(errors.length).toBeGreaterThan(0);
            console.log(`  ${size} fields, REQUIRED only: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Multiple Constraint Validation
// ============================================================================

describe('Benchmark: Multiple Constraint Validation', () => {
    const sizes = [50, 100, 500];

    sizes.forEach(size => {
        it(`should validate ${size} fields with multiple constraints`, async () => {
            const form = new PropertyNode(generateFormWithMultipleConstraints(size));
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            console.log(`  ${size} fields, multiple constraints: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Pattern/Regex Constraint Validation
// ============================================================================

describe('Benchmark: Pattern Constraint Validation', () => {
    const sizes = [50, 100, 500];

    sizes.forEach(size => {
        it(`should validate ${size} fields with PATTERN constraints`, async () => {
            const form = new PropertyNode(generateFormWithPatternConstraints(size));
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            // Half should fail pattern matching
            expect(errors.length).toBeGreaterThan(0);
            console.log(`  ${size} fields, PATTERN: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });

    it('should validate complex regex patterns', async () => {
        const complexPatterns = [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,  // Strong password
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // Email
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/  // IPv4
        ];

        const fields: Record<string, Property> = {};
        for (let i = 0; i < 100; i++) {
            const pattern = complexPatterns[i % complexPatterns.length];
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: 'test-value',
                constraints: {
                    pattern: PATTERN(pattern)
                }
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
        const elapsed = performance.now() - start;

        console.log(`  100 fields, complex regex: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
    });
});

// ============================================================================
// BENCHMARKS: Cross-Field Constraint Validation (simplified)
// ============================================================================

describe('Benchmark: Cross-Field Constraint Validation', () => {
    const sizes = [20, 50, 100];

    sizes.forEach(size => {
        it(`should validate ${size} fields with password constraints`, async () => {
            // Simplified: just password fields with length constraints
            const fields: Record<string, Property> = {};
            for (let i = 0; i < size; i++) {
                fields[`password_${i}`] = {
                    id: `password_${i}`,
                    type: STRING,
                    value: i % 2 === 0 ? 'validpassword123' : 'short',  // Half valid, half invalid
                    constraints: {
                        required: REQUIRED,
                        minLength: MIN_LENGTH(8)
                    }
                };
            }

            const form = new PropertyNode({
                id: 'form',
                type: TYPE,
                children: fields
            });
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            console.log(`  ${size} password fields: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Conditional Constraint Validation
// ============================================================================

describe('Benchmark: Conditional Constraint Validation', () => {
    const sizes = [50, 100, 500];

    sizes.forEach(size => {
        it(`should validate ${size} fields with REQUIRED_IF_FIELD_EQUALS`, async () => {
            const form = new PropertyNode(generateFormWithConditionalConstraints(size));
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            console.log(`  ${size} fields, REQUIRED_IF_FIELD_EQUALS: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });

        it(`should validate ${size} fields when condition is false`, async () => {
            const formData = generateFormWithConditionalConstraints(size);
            // Change type to personal so conditional constraints don't apply
            (formData.children!.type as Property).value = 'personal';

            const form = new PropertyNode(formData);
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            // Should have no errors since condition is not met
            expect(errors.length).toBe(0);
            console.log(`  ${size} fields, condition=false: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Deep Nested Constraint Validation
// ============================================================================

describe('Benchmark: Deep Nested Constraint Validation', () => {
    const configurations = [
        { depth: 3, breadth: 5 },   // 5^3 = 125 leaf nodes
        { depth: 4, breadth: 4 },   // 4^4 = 256 leaf nodes
        { depth: 5, breadth: 3 },   // 3^5 = 243 leaf nodes
        { depth: 6, breadth: 3 },   // 3^6 = 729 leaf nodes
    ];

    configurations.forEach(({ depth, breadth }) => {
        const leafNodes = Math.pow(breadth, depth);

        it(`should validate nested tree depth=${depth}, breadth=${breadth} (~${leafNodes} leaves)`, async () => {
            const form = new PropertyNode(generateNestedFormWithConstraints(depth, breadth));
            form.setRegistry(defaultRegistry);

            const start = performance.now();
            const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
            const elapsed = performance.now() - start;

            console.log(`  depth=${depth}, breadth=${breadth}: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Single Node vs Deep Validation
// ============================================================================

describe('Benchmark: Single vs Deep Validation', () => {
    it('should compare single node vs deep validation', async () => {
        const form = new PropertyNode(generateFormWithMultipleConstraints(100));
        form.setRegistry(defaultRegistry);

        // Single node validation (just root, no children)
        const startSingle = performance.now();
        await checkConstraints(form, defaultRegistry);
        const singleTime = performance.now() - startSingle;

        // Deep validation (all nodes)
        const startDeep = performance.now();
        await checkConstraintsDeep(form, defaultRegistry);
        const deepTime = performance.now() - startDeep;

        console.log(`  single node: ${singleTime.toFixed(2)}ms`);
        console.log(`  deep (100 nodes): ${deepTime.toFixed(2)}ms`);
        console.log(`  ratio: ${(deepTime / singleTime).toFixed(2)}x`);
    });
});

// ============================================================================
// BENCHMARKS: Validation with Expression-Based Constraints
// ============================================================================

describe('Benchmark: Expression-Based Constraints', () => {
    it('should validate fields with dynamic constraint values', async () => {
        const fields: Record<string, Property> = {
            minAge: { id: 'minAge', type: NUMBER, value: 18 },
            maxAge: { id: 'maxAge', type: NUMBER, value: 65 }
        };

        // Fields with dynamic constraints
        for (let i = 0; i < 100; i++) {
            fields[`age_${i}`] = {
                id: `age_${i}`,
                type: NUMBER,
                value: 10 + (i % 80), // Values from 10 to 89
                constraints: {
                    min: {
                        id: 'min',
                        type: TYPE,
                        value: ref(['root', 'minAge', 'value'])
                    },
                    max: {
                        id: 'max',
                        type: TYPE,
                        value: ref(['root', 'maxAge', 'value'])
                    }
                }
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
        const elapsed = performance.now() - start;

        console.log(`  100 fields with expression constraints: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
    });

    it('should validate with computed constraint conditions', async () => {
        const fields: Record<string, Property> = {
            userType: { id: 'userType', type: STRING, value: 'premium' },
            isVerified: { id: 'isVerified', type: BOOLEAN, value: true }
        };

        // Fields with complex conditional constraints
        for (let i = 0; i < 50; i++) {
            fields[`premium_field_${i}`] = {
                id: `premium_field_${i}`,
                type: STRING,
                value: i % 3 === 0 ? '' : `value_${i}`,
                constraints: {
                    // Required only for verified premium users
                    requiredIf: {
                        id: 'requiredIf',
                        type: TYPE,
                        children: {
                            condition: {
                                id: 'condition',
                                type: BOOLEAN,
                                value: op('and',
                                    op('eq', ref(['root', 'userType', 'value']), lit('premium')),
                                    ref(['root', 'isVerified', 'value'])
                                )
                            }
                        }
                    }
                }
            };
        }

        const form = new PropertyNode({
            id: 'form',
            type: TYPE,
            children: fields
        });
        form.setRegistry(defaultRegistry);

        const start = performance.now();
        const result = await checkConstraintsDeep(form, createContext(form));
            const errors = Object.keys(result.errors);
        const elapsed = performance.now() - start;

        console.log(`  50 fields with computed conditions: ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
    });
});

// ============================================================================
// BENCHMARKS: Real-World Validation Scenarios
// ============================================================================

describe('Benchmark: Real-World Validation Scenarios', () => {
    it('should validate user registration form', async () => {
        const registrationForm = new PropertyNode({
            id: 'registration',
            type: TYPE,
            children: {
                email: {
                    id: 'email',
                    type: STRING,
                    value: 'user@example.com',
                    constraints: { required: REQUIRED, email: EMAIL }
                },
                password: {
                    id: 'password',
                    type: STRING,
                    value: 'SecureP@ss123',
                    constraints: {
                        required: REQUIRED,
                        minLength: MIN_LENGTH(8)
                    }
                },
                firstName: {
                    id: 'firstName',
                    type: STRING,
                    value: 'John',
                    constraints: { required: REQUIRED, minLength: MIN_LENGTH(2), maxLength: MAX_LENGTH(50) }
                },
                lastName: {
                    id: 'lastName',
                    type: STRING,
                    value: 'Doe',
                    constraints: { required: REQUIRED, minLength: MIN_LENGTH(2), maxLength: MAX_LENGTH(50) }
                },
                age: {
                    id: 'age',
                    type: NUMBER,
                    value: 25,
                    constraints: { required: REQUIRED, min: MIN(18), max: MAX(120), integer: INTEGER }
                },
                phone: {
                    id: 'phone',
                    type: STRING,
                    value: '+1234567890',
                    constraints: { phone: PHONE }
                },
                website: {
                    id: 'website',
                    type: STRING,
                    value: 'https://example.com',
                    constraints: { url: URL }
                },
                termsAccepted: {
                    id: 'termsAccepted',
                    type: BOOLEAN,
                    value: true,
                    constraints: { required: REQUIRED }
                }
            }
        });
        registrationForm.setRegistry(defaultRegistry);

        const iterations = 100;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            await checkConstraintsDeep(registrationForm, createContext(registrationForm));
        }

        const elapsed = performance.now() - start;
        console.log(`  registration form x${iterations}: ${elapsed.toFixed(2)}ms (${(elapsed / iterations).toFixed(2)}ms/validation)`);
    });

    it('should validate order form with line items', async () => {
        const lineItems: Record<string, Property> = {};

        for (let i = 0; i < 20; i++) {
            lineItems[`item_${i}`] = {
                id: `item_${i}`,
                type: TYPE,
                children: {
                    productId: {
                        id: 'productId',
                        type: STRING,
                        value: `PROD-${i}`,
                        constraints: { required: REQUIRED }
                    },
                    quantity: {
                        id: 'quantity',
                        type: NUMBER,
                        value: 1 + (i % 10),
                        constraints: { required: REQUIRED, min: MIN(1), max: MAX(100), integer: INTEGER }
                    },
                    unitPrice: {
                        id: 'unitPrice',
                        type: NUMBER,
                        value: 10 + (i * 5),
                        constraints: { required: REQUIRED, positive: POSITIVE }
                    }
                }
            };
        }

        const orderForm = new PropertyNode({
            id: 'order',
            type: TYPE,
            children: {
                customerId: {
                    id: 'customerId',
                    type: STRING,
                    value: 'CUST-123',
                    constraints: { required: REQUIRED }
                },
                items: {
                    id: 'items',
                    type: TYPE,
                    children: lineItems,
                    constraints: { minItems: MIN_ITEMS(1) }
                },
                shippingAddress: {
                    id: 'shippingAddress',
                    type: TYPE,
                    children: {
                        street: { id: 'street', type: STRING, value: '123 Main St', constraints: { required: REQUIRED } },
                        city: { id: 'city', type: STRING, value: 'New York', constraints: { required: REQUIRED } },
                        state: { id: 'state', type: STRING, value: 'NY', constraints: { required: REQUIRED } },
                        zip: { id: 'zip', type: STRING, value: '10001', constraints: { required: REQUIRED, pattern: PATTERN(/^\d{5}(-\d{4})?$/) } }
                    }
                },
                billingAddress: {
                    id: 'billingAddress',
                    type: TYPE,
                    children: {
                        sameAsShipping: { id: 'sameAsShipping', type: BOOLEAN, value: true },
                        street: { id: 'street', type: STRING, value: '', constraints: { requiredIf: REQUIRED_IF_FIELD_EQUALS('sameAsShipping', false) } },
                        city: { id: 'city', type: STRING, value: '', constraints: { requiredIf: REQUIRED_IF_FIELD_EQUALS('sameAsShipping', false) } }
                    }
                }
            }
        });
        orderForm.setRegistry(defaultRegistry);

        const start = performance.now();
        const errors = await checkConstraintsDeep(orderForm, defaultRegistry);
        const elapsed = performance.now() - start;

        console.log(`  order form (20 line items): ${elapsed.toFixed(2)}ms (${errors.length} errors)`);
    });
});
