/**
 * Scenario 03: Conditional Visibility and Dynamic Behavior
 *
 * Demonstrates:
 * - Custom domain types with metadata (descriptions, validators, formats)
 * - Complex types with default constraints and metadata
 * - Computed metadata using expressions (visible, disabled, label, hint)
 * - Cross-field dependencies
 * - Conditional visibility based on other field values
 * - Dynamic disabled states
 * - Reusable constraint factories
 * - Full exploitation of the expression system
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    Property,
    TYPE,
    PROPERTY,
    CONSTRAINT,
    PropertyNode,
    createRegistry,
    Registry,
    evalArg,
    evalArgs,
    op,
    ref,
    lit,
} from '../../../src';

// ============================================================================
// CUSTOM DOMAIN TYPES (Types are Properties with type: TYPE)
// ============================================================================

// Basic types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

// Email type with metadata describing its format and validation
const EMAIL: Property = {
    id: 'Email',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Email address field' },
        format: { id: 'format', type: STRING, value: 'user@domain.com' },
        inputType: { id: 'inputType', type: STRING, value: 'email' },
    },
};

// Phone type with metadata
const PHONE: Property = {
    id: 'Phone',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Phone number field' },
        format: { id: 'format', type: STRING, value: '+1 (XXX) XXX-XXXX' },
        inputType: { id: 'inputType', type: STRING, value: 'tel' },
    },
};

// Select type with options support
const SELECT: Property = {
    id: 'Select',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Dropdown selection field' },
        inputType: { id: 'inputType', type: STRING, value: 'select' },
    },
};

// Currency type with precision and symbol
const CURRENCY: Property = {
    id: 'Currency',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Monetary value' },
        precision: { id: 'precision', type: NUMBER, value: 2 },
        symbol: { id: 'symbol', type: STRING, value: '$' },
        inputType: { id: 'inputType', type: STRING, value: 'number' },
    },
};

// Date type
const DATE: Property = {
    id: 'Date',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Date field' },
        format: { id: 'format', type: STRING, value: 'YYYY-MM-DD' },
        inputType: { id: 'inputType', type: STRING, value: 'date' },
    },
};

// Address type - a complex type that defines expected structure
const ADDRESS: Property = {
    id: 'Address',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Postal address' },
        isComplex: { id: 'isComplex', type: BOOLEAN, value: true },
    },
    // Types can have children that describe their expected structure
    children: {
        street: { id: 'street', type: STRING },
        city: { id: 'city', type: STRING },
        state: { id: 'state', type: STRING },
        zipCode: { id: 'zipCode', type: STRING },
        country: { id: 'country', type: STRING },
    },
};

// ============================================================================
// REUSABLE CONSTRAINT FACTORIES
// ============================================================================

/**
 * Required field constraint factory
 */
const REQUIRED = (message?: string): Property => ({
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'This field is required' },
        priority: { id: 'priority', type: NUMBER, value: 1 },
    },
});

/**
 * Minimum length constraint factory
 */
const MIN_LENGTH = (min: number, message?: string): Property => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('gte', op('strlen', ref('self.value')), lit(min)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum ${min} characters required` },
        priority: { id: 'priority', type: NUMBER, value: 2 },
    },
});

/**
 * Maximum length constraint factory
 */
const MAX_LENGTH = (max: number, message?: string): Property => ({
    id: 'maxLength',
    type: CONSTRAINT,
    value: op('lte', op('strlen', ref('self.value')), lit(max)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Maximum ${max} characters allowed` },
        priority: { id: 'priority', type: NUMBER, value: 2 },
    },
});

/**
 * Email format constraint factory
 */
const EMAIL_FORMAT = (message?: string): Property => ({
    id: 'emailFormat',
    type: CONSTRAINT,
    value: op('isEmail', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Please enter a valid email address' },
        priority: { id: 'priority', type: NUMBER, value: 3 },
    },
});

/**
 * Phone format constraint factory
 */
const PHONE_FORMAT = (message?: string): Property => ({
    id: 'phoneFormat',
    type: CONSTRAINT,
    value: op('isPhone', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Please enter a valid phone number' },
        priority: { id: 'priority', type: NUMBER, value: 3 },
    },
});

/**
 * Numeric range constraint factory
 */
const IN_RANGE = (min: number, max: number, message?: string): Property => ({
    id: 'inRange',
    type: CONSTRAINT,
    value: op('and',
        op('gte', ref('self.value'), lit(min)),
        op('lte', ref('self.value'), lit(max))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Value must be between ${min} and ${max}` },
        min: { id: 'min', type: NUMBER, value: min },
        max: { id: 'max', type: NUMBER, value: max },
    },
});

/**
 * Conditional required - only required when another field has a specific value
 */
const REQUIRED_WHEN = (
    conditionPath: string,
    conditionValue: unknown,
    message?: string
): Property => ({
    id: 'requiredWhen',
    type: CONSTRAINT,
    // Valid if: condition is false OR (condition is true AND field is not blank)
    value: op('or',
        op('neq', ref(conditionPath), lit(conditionValue)),
        op('isNotBlank', ref('self.value'))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'This field is required' },
        conditionPath: { id: 'conditionPath', type: STRING, value: conditionPath },
    },
});

/**
 * Match another field constraint
 */
const MATCHES_FIELD = (fieldPath: string, message?: string): Property => ({
    id: 'matchesField',
    type: CONSTRAINT,
    value: op('eq', ref('self.value'), ref(fieldPath)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Fields must match' },
        targetField: { id: 'targetField', type: STRING, value: fieldPath },
    },
});

// ============================================================================
// REGISTRY WITH CUSTOM OPERATORS
// ============================================================================

const createFormRegistry = (): Registry => {
    const registry = createRegistry();

    // ========== String Operations ==========
    registry.register('isNotBlank', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' && value.trim().length > 0;
    });

    registry.register('isBlank', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return value === '' || value === null || value === undefined ||
            (typeof value === 'string' && value.trim().length === 0);
    });

    registry.register('strlen', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.length : 0;
    });

    registry.register('concat', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return values.map(v => String(v ?? '')).join('');
    });

    registry.register('upper', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.toUpperCase() : '';
    });

    registry.register('lower', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.toLowerCase() : '';
    });

    registry.register('trim', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.trim() : '';
    });

    // ========== Validation Operations ==========
    registry.register('isEmail', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true; // Empty is valid (use required for non-empty)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    });

    registry.register('isPhone', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    });

    // ========== Comparison Operations ==========
    registry.register('eq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a === b;
    });

    registry.register('neq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a !== b;
    });

    registry.register('gt', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) > (b as number);
    });

    registry.register('gte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) >= (b as number);
    });

    registry.register('lt', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) < (b as number);
    });

    registry.register('lte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) <= (b as number);
    });

    // ========== Logical Operations ==========
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

    // ========== Conditional Operations ==========
    registry.register('if', async (args, ctx) => {
        const condition = await evalArg(args[0]!, ctx);
        if (condition) {
            return evalArg(args[1]!, ctx);
        }
        return args[2] ? evalArg(args[2], ctx) : null;
    });

    registry.register('switch', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        // args[1..n-1] are case pairs [condition, result], args[n] is default
        for (let i = 1; i < args.length - 1; i += 2) {
            const caseValue = await evalArg(args[i]!, ctx);
            if (value === caseValue) {
                return evalArg(args[i + 1]!, ctx);
            }
        }
        // Last arg is default if odd number of remaining args
        if ((args.length - 1) % 2 === 1) {
            return evalArg(args[args.length - 1]!, ctx);
        }
        return null;
    });

    // ========== Collection Operations ==========
    registry.register('includes', async (args, ctx) => {
        const [arr, value] = await evalArgs(args, ctx);
        return Array.isArray(arr) && arr.includes(value);
    });

    registry.register('count', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        return Array.isArray(arr) ? arr.length : 0;
    });

    // ========== Arithmetic Operations ==========
    registry.register('add', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return values.reduce((sum: number, v) => sum + (Number(v) || 0), 0);
    });

    registry.register('sub', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) - (b as number);
    });

    registry.register('mul', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) * (b as number);
    });

    registry.register('div', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (b as number) !== 0 ? (a as number) / (b as number) : 0;
    });

    return registry;
};

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 03: Conditional Visibility and Dynamic Behavior', () => {
    let registry: Registry;

    beforeEach(() => {
        registry = createFormRegistry();
    });

    describe('Custom Types with Metadata', () => {
        test('types have metadata describing their properties', async () => {
            const emailTypeNode = PropertyNode.create(EMAIL, registry);

            expect(await emailTypeNode.getMetadata('description')).toBe('Email address field');
            expect(await emailTypeNode.getMetadata('format')).toBe('user@domain.com');
            expect(await emailTypeNode.getMetadata('inputType')).toBe('email');
        });

        test('currency type has precision and symbol', async () => {
            const currencyNode = PropertyNode.create(CURRENCY, registry);

            expect(await currencyNode.getMetadata('precision')).toBe(2);
            expect(await currencyNode.getMetadata('symbol')).toBe('$');
        });

        test('complex type (Address) has structure in children', () => {
            const addressNode = PropertyNode.create(ADDRESS, registry);

            expect(addressNode.hasChildren()).toBe(true);
            expect(addressNode.childKeys()).toContain('street');
            expect(addressNode.childKeys()).toContain('city');
            expect(addressNode.childKeys()).toContain('zipCode');
        });
    });

    describe('Computed Metadata - Conditional Visibility', () => {
        test('field visibility based on another field value', async () => {
            const form: Property = {
                id: 'orderForm',
                type: PROPERTY,
                children: {
                    orderType: {
                        id: 'orderType',
                        type: SELECT,
                        value: 'personal',
                        defaultValue: 'personal',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Order Type' },
                            options: {
                                id: 'options',
                                type: PROPERTY,
                                value: ['personal', 'business'],
                            },
                        },
                    },
                    // Company name is only visible when orderType is 'business'
                    companyName: {
                        id: 'companyName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Company Name' },
                            // COMPUTED METADATA: visible is an expression
                            visible: op('eq', ref('parent.orderType.value'), lit('business')),
                        },
                        constraints: {
                            // Conditionally required
                            required: REQUIRED_WHEN('parent.orderType.value', 'business', 'Company name is required for business orders'),
                        },
                    },
                    // Tax ID is only visible when orderType is 'business'
                    taxId: {
                        id: 'taxId',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Tax ID' },
                            visible: op('eq', ref('parent.orderType.value'), lit('business')),
                            hint: { id: 'hint', type: STRING, value: 'Enter your company tax identification number' },
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Initially personal - business fields should be hidden
            expect(await node.child('companyName')?.getMetadata('visible')).toBe(false);
            expect(await node.child('taxId')?.getMetadata('visible')).toBe(false);

            // Validation should pass (companyName not required for personal)
            const personalValidation = await node.child('companyName')?.validate();
            expect(personalValidation?.valid).toBe(true);

            // Switch to business
            node.setValue('business', { path: 'orderType' });

            // Now business fields should be visible
            expect(await node.child('companyName')?.getMetadata('visible')).toBe(true);
            expect(await node.child('taxId')?.getMetadata('visible')).toBe(true);

            // Validation should fail (companyName required for business)
            const businessValidation = await node.child('companyName')?.validate();
            expect(businessValidation?.valid).toBe(false);
            // The constraint key is 'required' (the key in constraints map)
            expect(businessValidation?.errors.required).toBe('Company name is required for business orders');

            // Fill company name
            node.setValue('Acme Corp', { path: 'companyName' });
            const filledValidation = await node.child('companyName')?.validate();
            expect(filledValidation?.valid).toBe(true);
        });

        test('cascading visibility - multiple levels of conditions', async () => {
            const form: Property = {
                id: 'shippingForm',
                type: PROPERTY,
                children: {
                    needsShipping: {
                        id: 'needsShipping',
                        type: BOOLEAN,
                        value: false,
                        defaultValue: false,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Requires Shipping?' },
                        },
                    },
                    shippingMethod: {
                        id: 'shippingMethod',
                        type: SELECT,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Shipping Method' },
                            // Only visible if shipping is needed
                            visible: op('eq', ref('parent.needsShipping.value'), lit(true)),
                            options: {
                                id: 'options',
                                type: PROPERTY,
                                value: ['standard', 'express', 'overnight'],
                            },
                        },
                    },
                    expressInstructions: {
                        id: 'expressInstructions',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Express Delivery Instructions' },
                            // Only visible if shipping AND express/overnight selected
                            visible: op('and',
                                op('eq', ref('parent.needsShipping.value'), lit(true)),
                                op('or',
                                    op('eq', ref('parent.shippingMethod.value'), lit('express')),
                                    op('eq', ref('parent.shippingMethod.value'), lit('overnight'))
                                )
                            ),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Initially no shipping
            expect(await node.child('shippingMethod')?.getMetadata('visible')).toBe(false);
            expect(await node.child('expressInstructions')?.getMetadata('visible')).toBe(false);

            // Enable shipping
            node.setValue(true, { path: 'needsShipping' });
            expect(await node.child('shippingMethod')?.getMetadata('visible')).toBe(true);
            expect(await node.child('expressInstructions')?.getMetadata('visible')).toBe(false);

            // Select standard shipping
            node.setValue('standard', { path: 'shippingMethod' });
            expect(await node.child('expressInstructions')?.getMetadata('visible')).toBe(false);

            // Select express shipping
            node.setValue('express', { path: 'shippingMethod' });
            expect(await node.child('expressInstructions')?.getMetadata('visible')).toBe(true);

            // Select overnight shipping
            node.setValue('overnight', { path: 'shippingMethod' });
            expect(await node.child('expressInstructions')?.getMetadata('visible')).toBe(true);
        });
    });

    describe('Computed Metadata - Dynamic Labels and Hints', () => {
        test('dynamic label based on context', async () => {
            const form: Property = {
                id: 'contactForm',
                type: PROPERTY,
                children: {
                    contactType: {
                        id: 'contactType',
                        type: SELECT,
                        value: 'email',
                        defaultValue: 'email',
                    },
                    contactValue: {
                        id: 'contactValue',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            // Dynamic label based on contact type
                            label: op('if',
                                op('eq', ref('parent.contactType.value'), lit('email')),
                                lit('Email Address'),
                                op('if',
                                    op('eq', ref('parent.contactType.value'), lit('phone')),
                                    lit('Phone Number'),
                                    lit('Contact Info')
                                )
                            ),
                            // Dynamic placeholder
                            placeholder: op('if',
                                op('eq', ref('parent.contactType.value'), lit('email')),
                                lit('user@example.com'),
                                op('if',
                                    op('eq', ref('parent.contactType.value'), lit('phone')),
                                    lit('+1 (555) 123-4567'),
                                    lit('Enter contact information')
                                )
                            ),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);
            const contactValueNode = node.child('contactValue')!;

            // Email selected
            expect(await contactValueNode.getMetadata('label')).toBe('Email Address');
            expect(await contactValueNode.getMetadata('placeholder')).toBe('user@example.com');

            // Switch to phone
            node.setValue('phone', { path: 'contactType' });
            expect(await contactValueNode.getMetadata('label')).toBe('Phone Number');
            expect(await contactValueNode.getMetadata('placeholder')).toBe('+1 (555) 123-4567');

            // Switch to other
            node.setValue('other', { path: 'contactType' });
            expect(await contactValueNode.getMetadata('label')).toBe('Contact Info');
            expect(await contactValueNode.getMetadata('placeholder')).toBe('Enter contact information');
        });

        test('computed hint shows character count', async () => {
            const form: Property = {
                id: 'bioForm',
                type: PROPERTY,
                children: {
                    bio: {
                        id: 'bio',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Biography' },
                            maxLength: { id: 'maxLength', type: NUMBER, value: 500 },
                            // Computed hint showing remaining characters
                            remainingChars: op('sub', lit(500), op('strlen', ref('self.value'))),
                        },
                        constraints: {
                            maxLength: MAX_LENGTH(500, 'Biography cannot exceed 500 characters'),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);
            const bioNode = node.child('bio')!;

            // Initially 500 remaining
            expect(await bioNode.getMetadata('remainingChars')).toBe(500);

            // Type some text
            bioNode.setValue('Hello, I am a developer.');
            expect(await bioNode.getMetadata('remainingChars')).toBe(500 - 24);

            // Type more
            bioNode.setValue('Hello, I am a developer with 10 years of experience.');
            expect(await bioNode.getMetadata('remainingChars')).toBe(500 - 52);
        });
    });

    describe('Computed Metadata - Disabled States', () => {
        test('field disabled based on another field', async () => {
            const form: Property = {
                id: 'accountForm',
                type: PROPERTY,
                children: {
                    accountLocked: {
                        id: 'accountLocked',
                        type: BOOLEAN,
                        value: false,
                        defaultValue: false,
                    },
                    email: {
                        id: 'email',
                        type: EMAIL,
                        value: 'user@example.com',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Email' },
                            // Disabled when account is locked
                            disabled: op('eq', ref('parent.accountLocked.value'), lit(true)),
                        },
                    },
                    password: {
                        id: 'password',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Password' },
                            disabled: op('eq', ref('parent.accountLocked.value'), lit(true)),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Initially not locked
            expect(await node.child('email')?.getMetadata('disabled')).toBe(false);
            expect(await node.child('password')?.getMetadata('disabled')).toBe(false);

            // Lock account
            node.setValue(true, { path: 'accountLocked' });
            expect(await node.child('email')?.getMetadata('disabled')).toBe(true);
            expect(await node.child('password')?.getMetadata('disabled')).toBe(true);

            // Unlock
            node.setValue(false, { path: 'accountLocked' });
            expect(await node.child('email')?.getMetadata('disabled')).toBe(false);
        });

        test('submit button disabled until form is valid', async () => {
            const form: Property = {
                id: 'registrationForm',
                type: PROPERTY,
                metadata: {
                    // Form-level computed metadata
                    isComplete: op('and',
                        op('isNotBlank', ref('self.username.value')),
                        op('isNotBlank', ref('self.email.value')),
                        op('gte', op('strlen', ref('self.password.value')), lit(8))
                    ),
                    submitDisabled: op('not',
                        op('and',
                            op('isNotBlank', ref('self.username.value')),
                            op('isNotBlank', ref('self.email.value')),
                            op('gte', op('strlen', ref('self.password.value')), lit(8))
                        )
                    ),
                },
                children: {
                    username: {
                        id: 'username',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        constraints: { required: REQUIRED() },
                    },
                    email: {
                        id: 'email',
                        type: EMAIL,
                        value: '',
                        defaultValue: '',
                        constraints: {
                            required: REQUIRED(),
                            format: EMAIL_FORMAT(),
                        },
                    },
                    password: {
                        id: 'password',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        constraints: {
                            required: REQUIRED(),
                            minLength: MIN_LENGTH(8, 'Password must be at least 8 characters'),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Initially incomplete
            expect(await node.getMetadata('isComplete')).toBe(false);
            expect(await node.getMetadata('submitDisabled')).toBe(true);

            // Fill username
            node.setValue('john_doe', { path: 'username' });
            expect(await node.getMetadata('isComplete')).toBe(false);

            // Fill email
            node.setValue('john@example.com', { path: 'email' });
            expect(await node.getMetadata('isComplete')).toBe(false);

            // Fill password (too short)
            node.setValue('pass', { path: 'password' });
            expect(await node.getMetadata('isComplete')).toBe(false);

            // Fill password (valid length)
            node.setValue('password123', { path: 'password' });
            expect(await node.getMetadata('isComplete')).toBe(true);
            expect(await node.getMetadata('submitDisabled')).toBe(false);
        });
    });

    describe('Reusable Constraint Factories', () => {
        test('REQUIRED constraint', async () => {
            const field: Property = {
                id: 'name',
                type: STRING,
                value: '',
                constraints: {
                    required: REQUIRED('Name is required'),
                },
            };

            const node = PropertyNode.create(field, registry);

            // Empty - invalid
            let result = await node.validate();
            expect(result.valid).toBe(false);
            expect(result.errors.required).toBe('Name is required');

            // Filled - valid
            node.setValue('John');
            result = await node.validate();
            expect(result.valid).toBe(true);
        });

        test('MIN_LENGTH constraint', async () => {
            const field: Property = {
                id: 'username',
                type: STRING,
                value: 'ab',
                constraints: {
                    minLength: MIN_LENGTH(3),
                },
            };

            const node = PropertyNode.create(field, registry);

            // Too short
            let result = await node.validate();
            expect(result.valid).toBe(false);

            // Long enough
            node.setValue('abc');
            result = await node.validate();
            expect(result.valid).toBe(true);
        });

        test('IN_RANGE constraint', async () => {
            const field: Property = {
                id: 'age',
                type: NUMBER,
                value: 15,
                constraints: {
                    range: IN_RANGE(18, 120, 'Age must be between 18 and 120'),
                },
            };

            const node = PropertyNode.create(field, registry);

            // Too young
            let result = await node.validate();
            expect(result.valid).toBe(false);

            // Valid
            node.setValue(25);
            result = await node.validate();
            expect(result.valid).toBe(true);

            // Too old
            node.setValue(150);
            result = await node.validate();
            expect(result.valid).toBe(false);
        });

        test('MATCHES_FIELD constraint for password confirmation', async () => {
            const form: Property = {
                id: 'passwordForm',
                type: PROPERTY,
                children: {
                    password: {
                        id: 'password',
                        type: STRING,
                        value: 'secret123',
                        constraints: {
                            required: REQUIRED(),
                            minLength: MIN_LENGTH(8),
                        },
                    },
                    confirmPassword: {
                        id: 'confirmPassword',
                        type: STRING,
                        value: 'secret12',
                        constraints: {
                            required: REQUIRED(),
                            matches: MATCHES_FIELD('parent.password.value', 'Passwords do not match'),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Passwords don't match
            let result = await node.child('confirmPassword')?.validate();
            expect(result?.valid).toBe(false);
            expect(result?.errors.matches).toBe('Passwords do not match');

            // Make them match
            node.setValue('secret123', { path: 'confirmPassword' });
            result = await node.child('confirmPassword')?.validate();
            expect(result?.valid).toBe(true);
        });
    });

    describe('Complex Form with All Features', () => {
        test('complete order form with conditional fields and validation', async () => {
            const orderForm: Property = {
                id: 'orderForm',
                type: PROPERTY,
                metadata: {
                    // Form-level computed metadata
                    totalFields: { id: 'totalFields', type: NUMBER, value: 6 },
                    isBusinessOrder: op('eq', ref('self.customerType.value'), lit('business')),
                    orderSummary: op('concat',
                        lit('Order for: '),
                        op('if',
                            op('eq', ref('self.customerType.value'), lit('business')),
                            ref('self.companyName.value'),
                            ref('self.personalName.value')
                        )
                    ),
                },
                children: {
                    customerType: {
                        id: 'customerType',
                        type: SELECT,
                        value: 'personal',
                        defaultValue: 'personal',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Customer Type' },
                            options: { id: 'options', type: PROPERTY, value: ['personal', 'business'] },
                        },
                    },
                    personalName: {
                        id: 'personalName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Your Name' },
                            visible: op('eq', ref('parent.customerType.value'), lit('personal')),
                        },
                        constraints: {
                            required: REQUIRED_WHEN('parent.customerType.value', 'personal'),
                            minLength: MIN_LENGTH(2),
                        },
                    },
                    companyName: {
                        id: 'companyName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Company Name' },
                            visible: op('eq', ref('parent.customerType.value'), lit('business')),
                        },
                        constraints: {
                            required: REQUIRED_WHEN('parent.customerType.value', 'business'),
                        },
                    },
                    email: {
                        id: 'email',
                        type: EMAIL,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Email' },
                            visible: { id: 'visible', type: BOOLEAN, value: true },
                        },
                        constraints: {
                            required: REQUIRED(),
                            format: EMAIL_FORMAT(),
                        },
                    },
                    phone: {
                        id: 'phone',
                        type: PHONE,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Phone' },
                            // Phone is only required for business customers
                            required: op('eq', ref('parent.customerType.value'), lit('business')),
                        },
                        constraints: {
                            requiredForBusiness: REQUIRED_WHEN('parent.customerType.value', 'business', 'Phone is required for business orders'),
                            format: PHONE_FORMAT(),
                        },
                    },
                    orderAmount: {
                        id: 'orderAmount',
                        type: CURRENCY,
                        value: 0,
                        defaultValue: 0,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Order Amount' },
                            // Show discount hint for large orders
                            hint: op('if',
                                op('gte', ref('self.value'), lit(1000)),
                                lit('You qualify for a 10% bulk discount!'),
                                lit('Orders over $1000 receive 10% off')
                            ),
                        },
                        constraints: {
                            positive: IN_RANGE(0.01, 1000000, 'Order amount must be positive'),
                        },
                    },
                },
            };

            const node = PropertyNode.create(orderForm, registry);

            // Test initial state (personal)
            expect(await node.getMetadata('isBusinessOrder')).toBe(false);
            expect(await node.child('personalName')?.getMetadata('visible')).toBe(true);
            expect(await node.child('companyName')?.getMetadata('visible')).toBe(false);

            // Fill personal order
            node.setValue('John Doe', { path: 'personalName' });
            node.setValue('john@example.com', { path: 'email' });
            node.setValue(500, { path: 'orderAmount' });

            expect(await node.getMetadata('orderSummary')).toBe('Order for: John Doe');
            expect(await node.child('orderAmount')?.getMetadata('hint')).toBe('Orders over $1000 receive 10% off');

            // Validate personal order
            let validation = await node.validateDeep();
            expect(validation.valid).toBe(true);

            // Switch to business
            node.setValue('business', { path: 'customerType' });
            expect(await node.getMetadata('isBusinessOrder')).toBe(true);
            expect(await node.child('personalName')?.getMetadata('visible')).toBe(false);
            expect(await node.child('companyName')?.getMetadata('visible')).toBe(true);

            // Business order needs company name and phone
            validation = await node.validateDeep();
            expect(validation.valid).toBe(false);

            // Fill business fields
            node.setValue('Acme Corp', { path: 'companyName' });
            node.setValue('+1 555 123 4567', { path: 'phone' });
            node.setValue(1500, { path: 'orderAmount' });

            expect(await node.getMetadata('orderSummary')).toBe('Order for: Acme Corp');
            expect(await node.child('orderAmount')?.getMetadata('hint')).toBe('You qualify for a 10% bulk discount!');

            validation = await node.validateDeep();
            expect(validation.valid).toBe(true);
        });
    });
});
