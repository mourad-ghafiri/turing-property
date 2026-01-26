/**
 * Scenario 05: Wizard with Sub-steps and Complex State
 *
 * Demonstrates:
 * - Nested wizard structure (steps with sub-steps)
 * - Complex type hierarchies
 * - Advanced computed metadata
 * - Dynamic expressions in defaultValue
 * - Array-based operators (map, filter, reduce concepts)
 * - State machine patterns
 * - Complex validation dependencies
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
// CUSTOM DOMAIN TYPES - Rich Type Hierarchy
// ============================================================================

// Primitive types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
const DATE: Property = { id: 'Date', type: TYPE };

// Form field types with metadata
const EMAIL: Property = {
    id: 'Email',
    type: TYPE,
    metadata: {
        inputType: { id: 'inputType', type: STRING, value: 'email' },
        pattern: { id: 'pattern', type: STRING, value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    },
};

const PHONE: Property = {
    id: 'Phone',
    type: TYPE,
    metadata: {
        inputType: { id: 'inputType', type: STRING, value: 'tel' },
    },
};

const CURRENCY: Property = {
    id: 'Currency',
    type: TYPE,
    metadata: {
        precision: { id: 'precision', type: NUMBER, value: 2 },
        symbol: { id: 'symbol', type: STRING, value: '$' },
    },
};

const SELECT: Property = {
    id: 'Select',
    type: TYPE,
    metadata: {
        inputType: { id: 'inputType', type: STRING, value: 'select' },
    },
};

const CHECKBOX: Property = {
    id: 'Checkbox',
    type: TYPE,
    metadata: {
        inputType: { id: 'inputType', type: STRING, value: 'checkbox' },
    },
};

// Complex structural types
const WIZARD: Property = {
    id: 'Wizard',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Multi-step wizard with sub-steps' },
        supportsSubsteps: { id: 'supportsSubsteps', type: BOOLEAN, value: true },
    },
};

const MAJOR_STEP: Property = {
    id: 'MajorStep',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A major step that can contain sub-steps' },
        canHaveSubsteps: { id: 'canHaveSubsteps', type: BOOLEAN, value: true },
    },
};

const SUB_STEP: Property = {
    id: 'SubStep',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A sub-step within a major step' },
    },
};

// Order-related types
const ORDER: Property = {
    id: 'Order',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A purchase order' },
    },
};

const ORDER_ITEM: Property = {
    id: 'OrderItem',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'An item in an order' },
    },
};

const ADDRESS: Property = {
    id: 'Address',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A postal address' },
    },
};

const PAYMENT_METHOD: Property = {
    id: 'PaymentMethod',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A payment method' },
    },
};

// ============================================================================
// CONSTRAINT FACTORIES
// ============================================================================

const REQUIRED = (message?: string): Property => ({
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Required' },
    },
});

const MIN_LENGTH = (min: number, message?: string): Property => ({
    id: 'minLength',
    type: CONSTRAINT,
    value: op('gte', op('strlen', ref('self.value')), lit(min)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum ${min} characters` },
    },
});

const EMAIL_FORMAT = (message?: string): Property => ({
    id: 'emailFormat',
    type: CONSTRAINT,
    value: op('isValidEmail', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Invalid email format' },
    },
});

const PHONE_FORMAT = (message?: string): Property => ({
    id: 'phoneFormat',
    type: CONSTRAINT,
    value: op('isValidPhone', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Invalid phone format' },
    },
});

const MIN_VALUE = (min: number, message?: string): Property => ({
    id: 'minValue',
    type: CONSTRAINT,
    value: op('gte', ref('self.value'), lit(min)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Minimum value is ${min}` },
    },
});

const REQUIRED_WHEN = (conditionPath: string, conditionValue: unknown, message?: string): Property => ({
    id: 'requiredWhen',
    type: CONSTRAINT,
    value: op('or',
        op('neq', ref(conditionPath), lit(conditionValue)),
        op('isNotBlank', ref('self.value'))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Required' },
    },
});

// ============================================================================
// REGISTRY WITH COMPREHENSIVE OPERATORS
// ============================================================================

const createFormRegistry = (): Registry => {
    const registry = createRegistry();

    // String operations
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

    registry.register('join', async (args, ctx) => {
        const [arr, separator] = await evalArgs(args, ctx);
        return Array.isArray(arr) ? arr.join(String(separator || ',')) : '';
    });

    registry.register('trim', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.trim() : '';
    });

    // Validation
    registry.register('isValidEmail', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    });

    registry.register('isValidPhone', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        return /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
    });

    registry.register('isValidCreditCard', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        const digits = value.replace(/\D/g, '');
        return digits.length >= 13 && digits.length <= 19;
    });

    registry.register('isValidZip', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        return /^\d{5}(-\d{4})?$/.test(value);
    });

    // Comparison
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

    // Logical
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

    // Conditional
    registry.register('if', async (args, ctx) => {
        const condition = await evalArg(args[0]!, ctx);
        if (condition) {
            return evalArg(args[1]!, ctx);
        }
        return args[2] ? evalArg(args[2], ctx) : null;
    });

    registry.register('cond', async (args, ctx) => {
        // cond(condition1, result1, condition2, result2, ..., default)
        for (let i = 0; i < args.length - 1; i += 2) {
            const condition = await evalArg(args[i]!, ctx);
            if (condition) {
                return evalArg(args[i + 1]!, ctx);
            }
        }
        // Return last arg as default if odd number of args
        if (args.length % 2 === 1) {
            return evalArg(args[args.length - 1]!, ctx);
        }
        return null;
    });

    // Arithmetic
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

    registry.register('round', async (args, ctx) => {
        const [value, decimals] = await evalArgs(args, ctx);
        const factor = Math.pow(10, Number(decimals) || 0);
        return Math.round((Number(value) || 0) * factor) / factor;
    });

    registry.register('percent', async (args, ctx) => {
        const [value, total] = await evalArgs(args, ctx);
        const t = Number(total) || 0;
        return t !== 0 ? ((Number(value) || 0) / t) * 100 : 0;
    });

    // Collection operations
    registry.register('count', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        return Array.isArray(arr) ? arr.length : 0;
    });

    registry.register('includes', async (args, ctx) => {
        const [arr, value] = await evalArgs(args, ctx);
        return Array.isArray(arr) && arr.includes(value);
    });

    return registry;
};

// ============================================================================
// ORDER CHECKOUT WIZARD
// ============================================================================

const createCheckoutWizard = (): Property => {
    return {
        id: 'checkoutWizard',
        type: WIZARD,
        metadata: {
            // Navigation state
            currentMajorStep: { id: 'currentMajorStep', type: NUMBER, value: 1 },
            currentSubStep: { id: 'currentSubStep', type: NUMBER, value: 1 },
            totalMajorSteps: { id: 'totalMajorSteps', type: NUMBER, value: 3 },

            // Computed overall progress (0-100)
            overallProgress: op('round',
                op('mul',
                    op('div',
                        op('add',
                            // Completed major steps contribute fully
                            op('mul', op('sub', ref('self.metadata.currentMajorStep.value'), lit(1)), lit(100)),
                            // Current step contributes partial progress based on sub-step
                            op('mul',
                                op('div',
                                    op('sub', ref('self.metadata.currentSubStep.value'), lit(1)),
                                    lit(2) // Assume max 2 sub-steps per major step
                                ),
                                lit(100)
                            )
                        ),
                        lit(300) // 3 major steps * 100
                    ),
                    lit(100)
                ),
                lit(0)
            ),

            // Progress bar label
            progressLabel: op('concat',
                lit('Step '),
                ref('self.metadata.currentMajorStep.value'),
                lit('.'),
                ref('self.metadata.currentSubStep.value'),
                lit(' - '),
                op('round', ref('self.metadata.overallProgress'), lit(0)),
                lit('% complete')
            ),

            // Navigation helpers
            canNavigateBack: op('or',
                op('gt', ref('self.metadata.currentSubStep.value'), lit(1)),
                op('gt', ref('self.metadata.currentMajorStep.value'), lit(1))
            ),

            canNavigateForward: op('not',
                op('and',
                    op('eq', ref('self.metadata.currentMajorStep.value'), lit(3)),
                    op('eq', ref('self.metadata.currentSubStep.value'), lit(2))
                )
            ),

            // Order totals configuration
            taxRate: { id: 'taxRate', type: NUMBER, value: 0.08 },
            freeShippingThreshold: { id: 'freeShippingThreshold', type: NUMBER, value: 100 },
            baseShippingCost: { id: 'baseShippingCost', type: NUMBER, value: 9.99 },

            // Computed order subtotal (sum of all line totals)
            // Cross-references to other computed metadata work correctly
            orderSubtotal: op('round',
                op('add',
                    op('mul', ref('self.children.items.children.item1.children.quantity.value'), ref('self.children.items.children.item1.children.price.value')),
                    op('mul', ref('self.children.items.children.item2.children.quantity.value'), ref('self.children.items.children.item2.children.price.value'))
                ),
                lit(2)
            ),

            // Shipping cost (free over threshold) - references orderSubtotal
            shippingCost: op('if',
                op('gte', ref('self.metadata.orderSubtotal'), ref('self.metadata.freeShippingThreshold.value')),
                lit(0),
                ref('self.metadata.baseShippingCost.value')
            ),

            // Tax calculation - references orderSubtotal
            orderTax: op('round',
                op('mul', ref('self.metadata.orderSubtotal'), ref('self.metadata.taxRate.value')),
                lit(2)
            ),

            // Order total - references other computed metadata
            orderTotal: op('round',
                op('add',
                    op('add', ref('self.metadata.orderSubtotal'), ref('self.metadata.shippingCost')),
                    ref('self.metadata.orderTax')
                ),
                lit(2)
            ),
        },
        children: {
            // ==================== ORDER ITEMS ====================
            items: {
                id: 'items',
                type: PROPERTY,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Your Order' },
                },
                children: {
                    item1: {
                        id: 'item1',
                        type: ORDER_ITEM,
                        metadata: {
                            name: { id: 'name', type: STRING, value: 'Widget Pro' },
                        },
                        children: {
                            quantity: {
                                id: 'quantity',
                                type: NUMBER,
                                value: 2,
                                defaultValue: 1,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Quantity' },
                                },
                                constraints: {
                                    minValue: MIN_VALUE(1, 'Quantity must be at least 1'),
                                },
                            },
                            price: {
                                id: 'price',
                                type: CURRENCY,
                                value: 29.99,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Price' },
                                    readonly: { id: 'readonly', type: BOOLEAN, value: true },
                                },
                            },
                            // Computed line total
                            lineTotal: {
                                id: 'lineTotal',
                                type: CURRENCY,
                                // Expression as the value itself
                                value: op('round',
                                    op('mul', ref('parent.quantity.value'), ref('parent.price.value')),
                                    lit(2)
                                ),
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Line Total' },
                                    computed: { id: 'computed', type: BOOLEAN, value: true },
                                },
                            },
                        },
                    },
                    item2: {
                        id: 'item2',
                        type: ORDER_ITEM,
                        metadata: {
                            name: { id: 'name', type: STRING, value: 'Gadget Plus' },
                        },
                        children: {
                            quantity: {
                                id: 'quantity',
                                type: NUMBER,
                                value: 1,
                                defaultValue: 1,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Quantity' },
                                },
                                constraints: {
                                    minValue: MIN_VALUE(1, 'Quantity must be at least 1'),
                                },
                            },
                            price: {
                                id: 'price',
                                type: CURRENCY,
                                value: 49.99,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Price' },
                                    readonly: { id: 'readonly', type: BOOLEAN, value: true },
                                },
                            },
                            lineTotal: {
                                id: 'lineTotal',
                                type: CURRENCY,
                                value: op('round',
                                    op('mul', ref('parent.quantity.value'), ref('parent.price.value')),
                                    lit(2)
                                ),
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Line Total' },
                                    computed: { id: 'computed', type: BOOLEAN, value: true },
                                },
                            },
                        },
                    },
                },
            },

            // ==================== STEP 1: SHIPPING ====================
            shipping: {
                id: 'shipping',
                type: MAJOR_STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Shipping Information' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 1 },
                    isActive: op('eq', ref('root.metadata.currentMajorStep.value'), lit(1)),
                    isCompleted: op('gt', ref('root.metadata.currentMajorStep.value'), lit(1)),
                },
                children: {
                    // Sub-step 1.1: Contact Info
                    contactInfo: {
                        id: 'contactInfo',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Contact Information' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 1 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(1)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(1))
                            ),
                            isCompleted: op('or',
                                op('gt', ref('root.metadata.currentMajorStep.value'), lit(1)),
                                op('and',
                                    op('eq', ref('root.metadata.currentMajorStep.value'), lit(1)),
                                    op('gt', ref('root.metadata.currentSubStep.value'), lit(1))
                                )
                            ),
                        },
                        children: {
                            fullName: {
                                id: 'fullName',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Full Name' },
                                },
                                constraints: {
                                    required: REQUIRED('Name is required'),
                                    minLength: MIN_LENGTH(3, 'Name must be at least 3 characters'),
                                },
                            },
                            email: {
                                id: 'email',
                                type: EMAIL,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Email Address' },
                                    // Computed hint
                                    hint: op('if',
                                        op('isNotBlank', ref('self.value')),
                                        op('concat', lit('Order confirmation will be sent to '), ref('self.value')),
                                        lit('We\'ll send order updates here')
                                    ),
                                },
                                constraints: {
                                    required: REQUIRED('Email is required'),
                                    format: EMAIL_FORMAT(),
                                },
                            },
                            phone: {
                                id: 'phone',
                                type: PHONE,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Phone Number' },
                                    hint: { id: 'hint', type: STRING, value: 'For delivery updates' },
                                },
                                constraints: {
                                    required: REQUIRED('Phone is required'),
                                    format: PHONE_FORMAT(),
                                },
                            },
                        },
                    },
                    // Sub-step 1.2: Address
                    address: {
                        id: 'address',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Shipping Address' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 2 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(1)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(2))
                            ),
                            isCompleted: op('gt', ref('root.metadata.currentMajorStep.value'), lit(1)),
                            // Full address as computed metadata
                            fullAddress: op('concat',
                                ref('self.street.value'),
                                lit(', '),
                                ref('self.city.value'),
                                lit(', '),
                                ref('self.state.value'),
                                lit(' '),
                                ref('self.zip.value')
                            ),
                        },
                        children: {
                            street: {
                                id: 'street',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Street Address' },
                                },
                                constraints: {
                                    required: REQUIRED('Street address is required'),
                                },
                            },
                            city: {
                                id: 'city',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'City' },
                                },
                                constraints: {
                                    required: REQUIRED('City is required'),
                                },
                            },
                            state: {
                                id: 'state',
                                type: SELECT,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'State' },
                                    options: {
                                        id: 'options',
                                        type: PROPERTY,
                                        value: ['CA', 'NY', 'TX', 'FL', 'WA'],
                                    },
                                },
                                constraints: {
                                    required: REQUIRED('State is required'),
                                },
                            },
                            zip: {
                                id: 'zip',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'ZIP Code' },
                                },
                                constraints: {
                                    required: REQUIRED('ZIP code is required'),
                                    format: {
                                        id: 'format',
                                        type: CONSTRAINT,
                                        value: op('isValidZip', ref('self.value')),
                                        metadata: {
                                            message: { id: 'message', type: STRING, value: 'Invalid ZIP code format' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // ==================== STEP 2: PAYMENT ====================
            payment: {
                id: 'payment',
                type: MAJOR_STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Payment Information' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 2 },
                    isActive: op('eq', ref('root.metadata.currentMajorStep.value'), lit(2)),
                    isCompleted: op('gt', ref('root.metadata.currentMajorStep.value'), lit(2)),
                },
                children: {
                    // Sub-step 2.1: Payment Method
                    method: {
                        id: 'method',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Payment Method' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 1 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(2)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(1))
                            ),
                        },
                        children: {
                            paymentType: {
                                id: 'paymentType',
                                type: SELECT,
                                value: 'credit',
                                defaultValue: 'credit',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Payment Type' },
                                    options: {
                                        id: 'options',
                                        type: PROPERTY,
                                        value: ['credit', 'debit', 'paypal'],
                                    },
                                },
                            },
                            // Credit card fields - visible only for credit/debit
                            cardNumber: {
                                id: 'cardNumber',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Card Number' },
                                    visible: op('or',
                                        op('eq', ref('parent.paymentType.value'), lit('credit')),
                                        op('eq', ref('parent.paymentType.value'), lit('debit'))
                                    ),
                                    // Masked display
                                    maskedValue: op('if',
                                        op('gte', op('strlen', ref('self.value')), lit(4)),
                                        op('concat',
                                            lit('**** **** **** '),
                                            ref('self.value') // Would need substring operator for proper masking
                                        ),
                                        lit('')
                                    ),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.paymentType.value', 'credit', 'Card number is required'),
                                    format: {
                                        id: 'format',
                                        type: CONSTRAINT,
                                        value: op('or',
                                            op('eq', ref('parent.paymentType.value'), lit('paypal')),
                                            op('isValidCreditCard', ref('self.value'))
                                        ),
                                        metadata: {
                                            message: { id: 'message', type: STRING, value: 'Invalid card number' },
                                        },
                                    },
                                },
                            },
                            expiryDate: {
                                id: 'expiryDate',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Expiry (MM/YY)' },
                                    visible: op('or',
                                        op('eq', ref('parent.paymentType.value'), lit('credit')),
                                        op('eq', ref('parent.paymentType.value'), lit('debit'))
                                    ),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.paymentType.value', 'credit', 'Expiry date is required'),
                                },
                            },
                            cvv: {
                                id: 'cvv',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'CVV' },
                                    visible: op('or',
                                        op('eq', ref('parent.paymentType.value'), lit('credit')),
                                        op('eq', ref('parent.paymentType.value'), lit('debit'))
                                    ),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.paymentType.value', 'credit', 'CVV is required'),
                                },
                            },
                            // PayPal email - visible only for PayPal
                            paypalEmail: {
                                id: 'paypalEmail',
                                type: EMAIL,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'PayPal Email' },
                                    visible: op('eq', ref('parent.paymentType.value'), lit('paypal')),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.paymentType.value', 'paypal', 'PayPal email is required'),
                                    format: EMAIL_FORMAT(),
                                },
                            },
                        },
                    },
                    // Sub-step 2.2: Billing Address
                    billingAddress: {
                        id: 'billingAddress',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Billing Address' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 2 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(2)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(2))
                            ),
                        },
                        children: {
                            sameAsShipping: {
                                id: 'sameAsShipping',
                                type: CHECKBOX,
                                value: true,
                                defaultValue: true,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Same as shipping address' },
                                },
                            },
                            // Billing fields - only visible if different from shipping
                            billingStreet: {
                                id: 'billingStreet',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Street Address' },
                                    visible: op('not', ref('parent.sameAsShipping.value')),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.sameAsShipping.value', false, 'Billing street is required'),
                                },
                            },
                            billingCity: {
                                id: 'billingCity',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'City' },
                                    visible: op('not', ref('parent.sameAsShipping.value')),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.sameAsShipping.value', false, 'Billing city is required'),
                                },
                            },
                            billingZip: {
                                id: 'billingZip',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'ZIP Code' },
                                    visible: op('not', ref('parent.sameAsShipping.value')),
                                },
                                constraints: {
                                    required: REQUIRED_WHEN('parent.sameAsShipping.value', false, 'Billing ZIP is required'),
                                },
                            },
                        },
                    },
                },
            },

            // ==================== STEP 3: REVIEW ====================
            review: {
                id: 'review',
                type: MAJOR_STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Review & Confirm' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 3 },
                    isActive: op('eq', ref('root.metadata.currentMajorStep.value'), lit(3)),

                    // Summary - direct references to field values
                    customerName: ref('root.shipping.contactInfo.fullName.value'),
                    customerEmail: ref('root.shipping.contactInfo.email.value'),
                    shippingCity: ref('root.shipping.address.city.value'),
                    paymentMethod: ref('root.payment.method.paymentType.value'),
                },
                children: {
                    summary: {
                        id: 'summary',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Order Summary' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 1 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(3)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(1))
                            ),
                        },
                        children: {
                            promoCode: {
                                id: 'promoCode',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Promo Code (optional)' },
                                },
                            },
                            giftMessage: {
                                id: 'giftMessage',
                                type: STRING,
                                value: '',
                                defaultValue: '',
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Gift Message (optional)' },
                                    remainingChars: op('sub', lit(200), op('strlen', ref('self.value'))),
                                },
                                constraints: {
                                    maxLength: {
                                        id: 'maxLength',
                                        type: CONSTRAINT,
                                        value: op('lte', op('strlen', ref('self.value')), lit(200)),
                                        metadata: {
                                            message: { id: 'message', type: STRING, value: 'Gift message max 200 characters' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    confirm: {
                        id: 'confirm',
                        type: SUB_STEP,
                        metadata: {
                            title: { id: 'title', type: STRING, value: 'Confirm Order' },
                            subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 2 },
                            isActive: op('and',
                                op('eq', ref('root.metadata.currentMajorStep.value'), lit(3)),
                                op('eq', ref('root.metadata.currentSubStep.value'), lit(2))
                            ),
                        },
                        children: {
                            termsAccepted: {
                                id: 'termsAccepted',
                                type: CHECKBOX,
                                value: false,
                                defaultValue: false,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'I agree to the Terms and Conditions' },
                                },
                                constraints: {
                                    required: {
                                        id: 'required',
                                        type: CONSTRAINT,
                                        value: op('eq', ref('self.value'), lit(true)),
                                        metadata: {
                                            message: { id: 'message', type: STRING, value: 'You must accept the terms' },
                                        },
                                    },
                                },
                            },
                            subscribeNewsletter: {
                                id: 'subscribeNewsletter',
                                type: CHECKBOX,
                                value: false,
                                defaultValue: false,
                                metadata: {
                                    label: { id: 'label', type: STRING, value: 'Subscribe to our newsletter' },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
};

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 05: Wizard with Sub-steps and Complex State', () => {
    let registry: Registry;

    beforeEach(() => {
        registry = createFormRegistry();
    });

    describe('Type System', () => {
        test('custom types have metadata', async () => {
            const wizardType = PropertyNode.create(WIZARD, registry);
            expect(await wizardType.getMetadata('supportsSubsteps')).toBe(true);

            const majorStepType = PropertyNode.create(MAJOR_STEP, registry);
            expect(await majorStepType.getMetadata('canHaveSubsteps')).toBe(true);

            const subStepType = PropertyNode.create(SUB_STEP, registry);
            expect(await subStepType.getMetadata('description')).toBe('A sub-step within a major step');
        });

        test('currency type has precision', async () => {
            const currencyType = PropertyNode.create(CURRENCY, registry);
            expect(await currencyType.getMetadata('precision')).toBe(2);
            expect(await currencyType.getMetadata('symbol')).toBe('$');
        });
    });

    describe('Wizard Structure', () => {
        test('wizard has correct structure with sub-steps', () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Major steps
            expect(node.childKeys()).toContain('shipping');
            expect(node.childKeys()).toContain('payment');
            expect(node.childKeys()).toContain('review');

            // Sub-steps in shipping
            const shipping = node.child('shipping')!;
            expect(shipping.childKeys()).toContain('contactInfo');
            expect(shipping.childKeys()).toContain('address');

            // Sub-steps in payment
            const payment = node.child('payment')!;
            expect(payment.childKeys()).toContain('method');
            expect(payment.childKeys()).toContain('billingAddress');
        });
    });

    describe('Order Calculations', () => {
        test('line totals are computed correctly', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Item 1: 2 x $29.99 = $59.98
            const item1Total = await node.getValue('items.item1.lineTotal');
            expect(item1Total).toBeCloseTo(59.98, 2);

            // Item 2: 1 x $49.99 = $49.99
            const item2Total = await node.getValue('items.item2.lineTotal');
            expect(item2Total).toBeCloseTo(49.99, 2);
        });

        test('order totals update when quantities change', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Initial subtotal: 59.98 + 49.99 = 109.97
            let subtotal = await node.getMetadata('orderSubtotal');
            expect(subtotal).toBeCloseTo(109.97, 2);

            // Free shipping (over $100)
            let shipping = await node.getMetadata('shippingCost');
            expect(shipping).toBe(0);

            // Tax (8%): 109.97 * 0.08 = 8.80
            let tax = await node.getMetadata('orderTax');
            expect(tax).toBeCloseTo(8.80, 2);

            // Change quantity of item 1 to 1
            node.setValue(1, { path: 'items.item1.quantity' });

            // New subtotal: 29.99 + 49.99 = 79.98
            subtotal = await node.getMetadata('orderSubtotal');
            expect(subtotal).toBeCloseTo(79.98, 2);

            // Now shipping applies (under $100)
            shipping = await node.getMetadata('shippingCost');
            expect(shipping).toBe(9.99);
        });
    });

    describe('Navigation State', () => {
        test('initial navigation state', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            expect(await node.getMetadata('currentMajorStep')).toBe(1);
            expect(await node.getMetadata('currentSubStep')).toBe(1);
            expect(await node.getMetadata('canNavigateBack')).toBe(false);
            expect(await node.getMetadata('canNavigateForward')).toBe(true);
        });

        test('sub-step active state updates', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Step 1.1 is active
            expect(await node.get('shipping.contactInfo')?.getMetadata('isActive')).toBe(true);
            expect(await node.get('shipping.address')?.getMetadata('isActive')).toBe(false);

            // Move to step 1.2
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 2 });

            expect(await node.get('shipping.contactInfo')?.getMetadata('isActive')).toBe(false);
            expect(await node.get('shipping.contactInfo')?.getMetadata('isCompleted')).toBe(true);
            expect(await node.get('shipping.address')?.getMetadata('isActive')).toBe(true);
        });

        test('major step completion tracking', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Initially no major steps completed
            expect(await node.child('shipping')?.getMetadata('isCompleted')).toBe(false);
            expect(await node.child('payment')?.getMetadata('isCompleted')).toBe(false);

            // Move to step 2
            node.setMetadata('currentMajorStep', { id: 'currentMajorStep', type: NUMBER, value: 2 });

            expect(await node.child('shipping')?.getMetadata('isCompleted')).toBe(true);
            expect(await node.child('payment')?.getMetadata('isActive')).toBe(true);
            expect(await node.child('payment')?.getMetadata('isCompleted')).toBe(false);
        });
    });

    describe('Progress Tracking', () => {
        test('progress percentage calculation', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Step 1.1 = 0%
            let progress = await node.getMetadata('overallProgress');
            expect(progress).toBeCloseTo(0);

            // Step 1.2 = ~17%
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 2 });
            progress = await node.getMetadata('overallProgress');
            expect(progress).toBeGreaterThan(10);
            expect(progress).toBeLessThan(25);

            // Step 2.1 = ~33%
            node.setMetadata('currentMajorStep', { id: 'currentMajorStep', type: NUMBER, value: 2 });
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 1 });
            progress = await node.getMetadata('overallProgress');
            expect(progress).toBeGreaterThan(30);
            expect(progress).toBeLessThan(40);
        });
    });

    describe('Conditional Visibility', () => {
        test('payment method fields visibility', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Credit card selected - card fields visible, PayPal hidden
            expect(await node.get('payment.method.cardNumber')?.getMetadata('visible')).toBe(true);
            expect(await node.get('payment.method.paypalEmail')?.getMetadata('visible')).toBe(false);

            // Switch to PayPal
            node.setValue('paypal', { path: 'payment.method.paymentType' });

            expect(await node.get('payment.method.cardNumber')?.getMetadata('visible')).toBe(false);
            expect(await node.get('payment.method.paypalEmail')?.getMetadata('visible')).toBe(true);
        });

        test('billing address visibility based on same as shipping', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Same as shipping = true - billing fields hidden
            expect(await node.get('payment.billingAddress.billingStreet')?.getMetadata('visible')).toBe(false);

            // Uncheck same as shipping
            node.setValue(false, { path: 'payment.billingAddress.sameAsShipping' });

            expect(await node.get('payment.billingAddress.billingStreet')?.getMetadata('visible')).toBe(true);
            expect(await node.get('payment.billingAddress.billingCity')?.getMetadata('visible')).toBe(true);
        });
    });

    describe('Computed Metadata', () => {
        test('email hint updates dynamically', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);
            const emailNode = node.get('shipping.contactInfo.email')!;

            // Empty email - default hint
            let hint = await emailNode.getMetadata('hint');
            expect(hint).toBe('We\'ll send order updates here');

            // Enter email - personalized hint
            node.setValue('john@example.com', { path: 'shipping.contactInfo.email' });
            hint = await emailNode.getMetadata('hint');
            expect(hint).toBe('Order confirmation will be sent to john@example.com');
        });

        test('gift message remaining characters', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);
            const giftNode = node.get('review.summary.giftMessage')!;

            // Initial = 200 remaining
            let remaining = await giftNode.getMetadata('remainingChars');
            expect(remaining).toBe(200);

            // Type message
            node.setValue('Happy Birthday!', { path: 'review.summary.giftMessage' });
            remaining = await giftNode.getMetadata('remainingChars');
            expect(remaining).toBe(200 - 15);
        });

        test('full address computed in metadata', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            node.setValue('123 Main St', { path: 'shipping.address.street' });
            node.setValue('Seattle', { path: 'shipping.address.city' });
            node.setValue('WA', { path: 'shipping.address.state' });
            node.setValue('98101', { path: 'shipping.address.zip' });

            const fullAddress = await node.get('shipping.address')?.getMetadata('fullAddress');
            expect(fullAddress).toBe('123 Main St, Seattle, WA 98101');
        });
    });

    describe('Review Step', () => {
        test('review step shows data from previous steps', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Fill in data
            node.setValue('John Doe', { path: 'shipping.contactInfo.fullName' });
            node.setValue('john@example.com', { path: 'shipping.contactInfo.email' });
            node.setValue('123 Main St', { path: 'shipping.address.street' });
            node.setValue('Seattle', { path: 'shipping.address.city' });
            node.setValue('WA', { path: 'shipping.address.state' });
            node.setValue('98101', { path: 'shipping.address.zip' });
            node.setValue('credit', { path: 'payment.method.paymentType' });

            // Check review metadata
            const review = node.child('review')!;
            expect(await review.getMetadata('customerName')).toBe('John Doe');
            expect(await review.getMetadata('customerEmail')).toBe('john@example.com');
            expect(await review.getMetadata('shippingCity')).toBe('Seattle');
            expect(await review.getMetadata('paymentMethod')).toBe('credit');
        });
    });

    describe('Validation', () => {
        test('contact info validation', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);
            const contactInfo = node.get('shipping.contactInfo')!;

            // Initially invalid
            let validation = await contactInfo.validateDeep();
            expect(validation.valid).toBe(false);

            // Fill required fields
            node.setValue('John Doe', { path: 'shipping.contactInfo.fullName' });
            node.setValue('john@example.com', { path: 'shipping.contactInfo.email' });
            node.setValue('555-123-4567', { path: 'shipping.contactInfo.phone' });

            validation = await contactInfo.validateDeep();
            expect(validation.valid).toBe(true);
        });

        test('payment validation based on method', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Credit card selected - needs card info
            node.setValue('4111111111111111', { path: 'payment.method.cardNumber' });
            node.setValue('12/25', { path: 'payment.method.expiryDate' });
            node.setValue('123', { path: 'payment.method.cvv' });

            let validation = await node.get('payment.method')?.validateDeep();
            expect(validation?.valid).toBe(true);

            // Switch to PayPal - needs PayPal email
            node.setValue('paypal', { path: 'payment.method.paymentType' });
            node.setValue('', { path: 'payment.method.paypalEmail' });

            validation = await node.get('payment.method')?.validateDeep();
            expect(validation?.valid).toBe(false);

            node.setValue('john@paypal.com', { path: 'payment.method.paypalEmail' });
            validation = await node.get('payment.method')?.validateDeep();
            expect(validation?.valid).toBe(true);
        });

        test('final terms acceptance', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // Terms not accepted
            let validation = await node.get('review.confirm')?.validateDeep();
            expect(validation?.valid).toBe(false);

            // Accept terms
            node.setValue(true, { path: 'review.confirm.termsAccepted' });
            validation = await node.get('review.confirm')?.validateDeep();
            expect(validation?.valid).toBe(true);
        });
    });

    describe('Full Checkout Flow', () => {
        test('complete checkout with all validations', async () => {
            const wizard = createCheckoutWizard();
            const node = PropertyNode.create(wizard, registry);

            // ========== Step 1.1: Contact Info ==========
            node.setValue('Jane Smith', { path: 'shipping.contactInfo.fullName' });
            node.setValue('jane@example.com', { path: 'shipping.contactInfo.email' });
            node.setValue('+1 555 987 6543', { path: 'shipping.contactInfo.phone' });

            let contactValid = await node.get('shipping.contactInfo')?.validateDeep();
            expect(contactValid?.valid).toBe(true);

            // ========== Step 1.2: Shipping Address ==========
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 2 });
            node.setValue('456 Oak Ave', { path: 'shipping.address.street' });
            node.setValue('Portland', { path: 'shipping.address.city' });
            node.setValue('OR', { path: 'shipping.address.state' });
            node.setValue('97201', { path: 'shipping.address.zip' });

            let addressValid = await node.get('shipping.address')?.validateDeep();
            expect(addressValid?.valid).toBe(true);

            // ========== Step 2.1: Payment Method ==========
            node.setMetadata('currentMajorStep', { id: 'currentMajorStep', type: NUMBER, value: 2 });
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 1 });
            node.setValue('credit', { path: 'payment.method.paymentType' });
            node.setValue('4111111111111111', { path: 'payment.method.cardNumber' });
            node.setValue('12/26', { path: 'payment.method.expiryDate' });
            node.setValue('456', { path: 'payment.method.cvv' });

            let paymentValid = await node.get('payment.method')?.validateDeep();
            expect(paymentValid?.valid).toBe(true);

            // ========== Step 2.2: Billing (same as shipping) ==========
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 2 });
            // Keep sameAsShipping = true
            let billingValid = await node.get('payment.billingAddress')?.validateDeep();
            expect(billingValid?.valid).toBe(true);

            // ========== Step 3.1: Summary ==========
            node.setMetadata('currentMajorStep', { id: 'currentMajorStep', type: NUMBER, value: 3 });
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 1 });
            node.setValue('SAVE10', { path: 'review.summary.promoCode' });
            node.setValue('Thank you for your order!', { path: 'review.summary.giftMessage' });

            // ========== Step 3.2: Confirm ==========
            node.setMetadata('currentSubStep', { id: 'currentSubStep', type: NUMBER, value: 2 });
            node.setValue(true, { path: 'review.confirm.termsAccepted' });

            let confirmValid = await node.get('review.confirm')?.validateDeep();
            expect(confirmValid?.valid).toBe(true);

            // Check final order summary
            const orderTotal = await node.getMetadata('orderTotal');
            expect(orderTotal).toBeGreaterThan(100);

            // Check navigation state
            expect(await node.getMetadata('canNavigateForward')).toBe(false); // On last step
        });
    });
});
