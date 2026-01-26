/**
 * Scenario 04: Multi-Step Form with Navigation
 *
 * Demonstrates:
 * - Custom complex types (WIZARD, STEP) with metadata
 * - Step-based navigation using computed metadata
 * - Progress tracking as computed metadata
 * - Step validation before navigation
 * - Conditional step visibility
 * - Cross-step data dependencies
 * - State management patterns
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
// CUSTOM DOMAIN TYPES
// ============================================================================

// Basic types
const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };
const EMAIL: Property = { id: 'Email', type: TYPE };

/**
 * WIZARD type - represents a multi-step form wizard
 * Metadata defines behavior and state
 */
const WIZARD: Property = {
    id: 'Wizard',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Multi-step form wizard' },
        supportsNavigation: { id: 'supportsNavigation', type: BOOLEAN, value: true },
        supportsValidation: { id: 'supportsValidation', type: BOOLEAN, value: true },
    },
};

/**
 * STEP type - represents a single step in a wizard
 * Children of a WIZARD are STEPs
 */
const STEP: Property = {
    id: 'Step',
    type: TYPE,
    metadata: {
        description: { id: 'description', type: STRING, value: 'A single step in a wizard' },
        isNavigable: { id: 'isNavigable', type: BOOLEAN, value: true },
    },
};

// ============================================================================
// REUSABLE CONSTRAINT FACTORIES
// ============================================================================

const REQUIRED = (message?: string): Property => ({
    id: 'required',
    type: CONSTRAINT,
    value: op('isNotBlank', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'This field is required' },
    },
});

const EMAIL_FORMAT = (message?: string): Property => ({
    id: 'emailFormat',
    type: CONSTRAINT,
    value: op('isEmail', ref('self.value')),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Please enter a valid email' },
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

const MATCHES_FIELD = (fieldPath: string, message?: string): Property => ({
    id: 'matchesField',
    type: CONSTRAINT,
    value: op('eq', ref('self.value'), ref(fieldPath)),
    metadata: {
        message: { id: 'message', type: STRING, value: message || 'Fields must match' },
    },
});

const IN_RANGE = (min: number, max: number, message?: string): Property => ({
    id: 'inRange',
    type: CONSTRAINT,
    value: op('and',
        op('gte', ref('self.value'), lit(min)),
        op('lte', ref('self.value'), lit(max))
    ),
    metadata: {
        message: { id: 'message', type: STRING, value: message || `Must be between ${min} and ${max}` },
    },
});

// ============================================================================
// REGISTRY
// ============================================================================

const createFormRegistry = (): Registry => {
    const registry = createRegistry();

    // String operations
    registry.register('isNotBlank', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' && value.trim().length > 0;
    });

    registry.register('strlen', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.length : 0;
    });

    registry.register('concat', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return values.map(v => String(v ?? '')).join('');
    });

    // Validation
    registry.register('isEmail', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string' || value.trim() === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

    registry.register('mod', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) % (b as number);
    });

    // Math helpers
    registry.register('floor', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return Math.floor(Number(value) || 0);
    });

    registry.register('round', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return Math.round(Number(value) || 0);
    });

    registry.register('min', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return Math.min(...values.map(v => Number(v) || 0));
    });

    registry.register('max', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return Math.max(...values.map(v => Number(v) || 0));
    });

    return registry;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a registration wizard with multiple steps
 */
const createRegistrationWizard = (): Property => {
    // Total steps (used for progress calculation)
    const TOTAL_STEPS = 4;

    return {
        id: 'registrationWizard',
        type: WIZARD,
        metadata: {
            // Current step (1-based for user display, stored as number)
            currentStep: { id: 'currentStep', type: NUMBER, value: 1 },
            totalSteps: { id: 'totalSteps', type: NUMBER, value: TOTAL_STEPS },

            // Computed: Progress percentage
            progress: op('mul',
                op('div',
                    op('sub', ref('self.currentStep.value'), lit(1)),
                    op('sub', lit(TOTAL_STEPS), lit(1))
                ),
                lit(100)
            ),

            // Computed: Progress text
            progressText: op('concat',
                lit('Step '),
                ref('self.currentStep.value'),
                lit(' of '),
                lit(TOTAL_STEPS)
            ),

            // Computed: Can go back?
            canGoBack: op('gt', ref('self.currentStep.value'), lit(1)),

            // Computed: Can go forward? (not on last step)
            canGoForward: op('lt', ref('self.currentStep.value'), lit(TOTAL_STEPS)),

            // Computed: Is on last step?
            isLastStep: op('eq', ref('self.currentStep.value'), lit(TOTAL_STEPS)),

            // Computed: Is on first step?
            isFirstStep: op('eq', ref('self.currentStep.value'), lit(1)),

            // Computed: Current step title
            currentStepTitle: op('if',
                op('eq', ref('self.currentStep.value'), lit(1)),
                lit('Personal Information'),
                op('if',
                    op('eq', ref('self.currentStep.value'), lit(2)),
                    lit('Account Setup'),
                    op('if',
                        op('eq', ref('self.currentStep.value'), lit(3)),
                        lit('Preferences'),
                        lit('Review & Submit')
                    )
                )
            ),
        },
        children: {
            // ==================== STEP 1: Personal Information ====================
            step1: {
                id: 'step1',
                type: STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Personal Information' },
                    description: { id: 'description', type: STRING, value: 'Tell us about yourself' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 1 },
                    // Computed: Is this step active?
                    isActive: op('eq', ref('root.currentStep.value'), lit(1)),
                    // Computed: Is this step completed?
                    isCompleted: op('gt', ref('root.currentStep.value'), lit(1)),
                    // Computed: Is this step visible? (always for step 1)
                    visible: { id: 'visible', type: BOOLEAN, value: true },
                },
                children: {
                    firstName: {
                        id: 'firstName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'First Name' },
                            placeholder: { id: 'placeholder', type: STRING, value: 'John' },
                        },
                        constraints: {
                            required: REQUIRED('First name is required'),
                            minLength: MIN_LENGTH(2, 'First name must be at least 2 characters'),
                        },
                    },
                    lastName: {
                        id: 'lastName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Last Name' },
                            placeholder: { id: 'placeholder', type: STRING, value: 'Doe' },
                        },
                        constraints: {
                            required: REQUIRED('Last name is required'),
                        },
                    },
                    age: {
                        id: 'age',
                        type: NUMBER,
                        value: 0,
                        defaultValue: 0,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Age' },
                            hint: { id: 'hint', type: STRING, value: 'You must be at least 18 years old' },
                        },
                        constraints: {
                            range: IN_RANGE(18, 120, 'You must be between 18 and 120 years old'),
                        },
                    },
                },
            },

            // ==================== STEP 2: Account Setup ====================
            step2: {
                id: 'step2',
                type: STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Account Setup' },
                    description: { id: 'description', type: STRING, value: 'Create your account credentials' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 2 },
                    isActive: op('eq', ref('root.currentStep.value'), lit(2)),
                    isCompleted: op('gt', ref('root.currentStep.value'), lit(2)),
                    visible: { id: 'visible', type: BOOLEAN, value: true },
                },
                children: {
                    email: {
                        id: 'email',
                        type: EMAIL,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Email Address' },
                            placeholder: { id: 'placeholder', type: STRING, value: 'john.doe@example.com' },
                            // Dynamic hint based on entered value
                            hint: op('if',
                                op('isNotBlank', ref('self.value')),
                                op('concat', lit('We will send a verification email to '), ref('self.value')),
                                lit('Enter your email address')
                            ),
                        },
                        constraints: {
                            required: REQUIRED('Email is required'),
                            format: EMAIL_FORMAT(),
                        },
                    },
                    password: {
                        id: 'password',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Password' },
                            inputType: { id: 'inputType', type: STRING, value: 'password' },
                            // Computed password strength indicator
                            strength: op('if',
                                op('lt', op('strlen', ref('self.value')), lit(8)),
                                lit('weak'),
                                op('if',
                                    op('lt', op('strlen', ref('self.value')), lit(12)),
                                    lit('medium'),
                                    lit('strong')
                                )
                            ),
                        },
                        constraints: {
                            required: REQUIRED('Password is required'),
                            minLength: MIN_LENGTH(8, 'Password must be at least 8 characters'),
                        },
                    },
                    confirmPassword: {
                        id: 'confirmPassword',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Confirm Password' },
                            inputType: { id: 'inputType', type: STRING, value: 'password' },
                            // Show match indicator
                            matches: op('and',
                                op('isNotBlank', ref('self.value')),
                                op('eq', ref('self.value'), ref('parent.password.value'))
                            ),
                        },
                        constraints: {
                            required: REQUIRED('Please confirm your password'),
                            matches: MATCHES_FIELD('parent.password.value', 'Passwords do not match'),
                        },
                    },
                },
            },

            // ==================== STEP 3: Preferences ====================
            step3: {
                id: 'step3',
                type: STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Preferences' },
                    description: { id: 'description', type: STRING, value: 'Customize your experience' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 3 },
                    isActive: op('eq', ref('root.currentStep.value'), lit(3)),
                    isCompleted: op('gt', ref('root.currentStep.value'), lit(3)),
                    visible: { id: 'visible', type: BOOLEAN, value: true },
                },
                children: {
                    newsletter: {
                        id: 'newsletter',
                        type: BOOLEAN,
                        value: true,
                        defaultValue: true,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Subscribe to Newsletter' },
                            hint: { id: 'hint', type: STRING, value: 'Get weekly updates about new features' },
                        },
                    },
                    theme: {
                        id: 'theme',
                        type: STRING,
                        value: 'light',
                        defaultValue: 'light',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Theme' },
                            options: { id: 'options', type: PROPERTY, value: ['light', 'dark', 'system'] },
                        },
                    },
                    notifications: {
                        id: 'notifications',
                        type: BOOLEAN,
                        value: true,
                        defaultValue: true,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Enable Notifications' },
                        },
                    },
                    // Email frequency is only visible if notifications are enabled
                    emailFrequency: {
                        id: 'emailFrequency',
                        type: STRING,
                        value: 'daily',
                        defaultValue: 'daily',
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Email Frequency' },
                            visible: op('eq', ref('parent.notifications.value'), lit(true)),
                            options: { id: 'options', type: PROPERTY, value: ['realtime', 'daily', 'weekly'] },
                        },
                    },
                },
            },

            // ==================== STEP 4: Review & Submit ====================
            step4: {
                id: 'step4',
                type: STEP,
                metadata: {
                    title: { id: 'title', type: STRING, value: 'Review & Submit' },
                    description: { id: 'description', type: STRING, value: 'Review your information and submit' },
                    stepNumber: { id: 'stepNumber', type: NUMBER, value: 4 },
                    isActive: op('eq', ref('root.currentStep.value'), lit(4)),
                    isCompleted: { id: 'isCompleted', type: BOOLEAN, value: false }, // Never completed (it's the last step)
                    visible: { id: 'visible', type: BOOLEAN, value: true },

                    // Summary data from previous steps
                    summaryName: op('concat',
                        ref('root.step1.firstName.value'),
                        lit(' '),
                        ref('root.step1.lastName.value')
                    ),
                    summaryEmail: ref('root.step2.email.value'),
                    summaryTheme: ref('root.step3.theme.value'),
                },
                children: {
                    termsAccepted: {
                        id: 'termsAccepted',
                        type: BOOLEAN,
                        value: false,
                        defaultValue: false,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'I accept the Terms and Conditions' },
                        },
                        constraints: {
                            required: {
                                id: 'required',
                                type: CONSTRAINT,
                                value: op('eq', ref('self.value'), lit(true)),
                                metadata: {
                                    message: { id: 'message', type: STRING, value: 'You must accept the terms to continue' },
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

describe('Scenario 04: Multi-Step Form with Navigation', () => {
    let registry: Registry;

    beforeEach(() => {
        registry = createFormRegistry();
    });

    describe('Wizard Type and Structure', () => {
        test('wizard type has correct metadata', async () => {
            const wizardType = PropertyNode.create(WIZARD, registry);

            expect(await wizardType.getMetadata('description')).toBe('Multi-step form wizard');
            expect(await wizardType.getMetadata('supportsNavigation')).toBe(true);
            expect(await wizardType.getMetadata('supportsValidation')).toBe(true);
        });

        test('step type has correct metadata', async () => {
            const stepType = PropertyNode.create(STEP, registry);

            expect(await stepType.getMetadata('description')).toBe('A single step in a wizard');
            expect(await stepType.getMetadata('isNavigable')).toBe(true);
        });

        test('wizard has correct structure', () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            expect(node.hasChildren()).toBe(true);
            expect(node.childKeys()).toEqual(['step1', 'step2', 'step3', 'step4']);
            expect(node.childCount).toBe(4);
        });
    });

    describe('Navigation State', () => {
        test('initial state is step 1', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            expect(await node.getMetadata('currentStep')).toBe(1);
            expect(await node.getMetadata('isFirstStep')).toBe(true);
            expect(await node.getMetadata('isLastStep')).toBe(false);
            expect(await node.getMetadata('canGoBack')).toBe(false);
            expect(await node.getMetadata('canGoForward')).toBe(true);
        });

        test('navigation metadata updates when step changes', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            // Go to step 2
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 2 });

            expect(await node.getMetadata('currentStep')).toBe(2);
            expect(await node.getMetadata('isFirstStep')).toBe(false);
            expect(await node.getMetadata('isLastStep')).toBe(false);
            expect(await node.getMetadata('canGoBack')).toBe(true);
            expect(await node.getMetadata('canGoForward')).toBe(true);

            // Go to last step
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 4 });

            expect(await node.getMetadata('currentStep')).toBe(4);
            expect(await node.getMetadata('isFirstStep')).toBe(false);
            expect(await node.getMetadata('isLastStep')).toBe(true);
            expect(await node.getMetadata('canGoBack')).toBe(true);
            expect(await node.getMetadata('canGoForward')).toBe(false);
        });
    });

    describe('Progress Tracking', () => {
        test('progress percentage calculation', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            // Step 1: 0% progress (step 1 of 4)
            expect(await node.getMetadata('progress')).toBeCloseTo(0);
            expect(await node.getMetadata('progressText')).toBe('Step 1 of 4');

            // Step 2: 33.3% progress
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 2 });
            expect(await node.getMetadata('progress')).toBeCloseTo(33.33, 1);
            expect(await node.getMetadata('progressText')).toBe('Step 2 of 4');

            // Step 3: 66.7% progress
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 3 });
            expect(await node.getMetadata('progress')).toBeCloseTo(66.67, 1);
            expect(await node.getMetadata('progressText')).toBe('Step 3 of 4');

            // Step 4: 100% progress
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 4 });
            expect(await node.getMetadata('progress')).toBeCloseTo(100);
            expect(await node.getMetadata('progressText')).toBe('Step 4 of 4');
        });

        test('current step title updates', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            expect(await node.getMetadata('currentStepTitle')).toBe('Personal Information');

            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 2 });
            expect(await node.getMetadata('currentStepTitle')).toBe('Account Setup');

            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 3 });
            expect(await node.getMetadata('currentStepTitle')).toBe('Preferences');

            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 4 });
            expect(await node.getMetadata('currentStepTitle')).toBe('Review & Submit');
        });
    });

    describe('Step Active State', () => {
        test('step active state reflects current step', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            // Step 1 is active
            expect(await node.child('step1')?.getMetadata('isActive')).toBe(true);
            expect(await node.child('step2')?.getMetadata('isActive')).toBe(false);
            expect(await node.child('step3')?.getMetadata('isActive')).toBe(false);
            expect(await node.child('step4')?.getMetadata('isActive')).toBe(false);

            // Move to step 3
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 3 });

            expect(await node.child('step1')?.getMetadata('isActive')).toBe(false);
            expect(await node.child('step2')?.getMetadata('isActive')).toBe(false);
            expect(await node.child('step3')?.getMetadata('isActive')).toBe(true);
            expect(await node.child('step4')?.getMetadata('isActive')).toBe(false);
        });

        test('step completed state tracks progress', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            // Initially nothing is completed
            expect(await node.child('step1')?.getMetadata('isCompleted')).toBe(false);
            expect(await node.child('step2')?.getMetadata('isCompleted')).toBe(false);
            expect(await node.child('step3')?.getMetadata('isCompleted')).toBe(false);

            // Move to step 3
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 3 });

            // Steps 1 and 2 are completed
            expect(await node.child('step1')?.getMetadata('isCompleted')).toBe(true);
            expect(await node.child('step2')?.getMetadata('isCompleted')).toBe(true);
            expect(await node.child('step3')?.getMetadata('isCompleted')).toBe(false);
        });
    });

    describe('Step Validation', () => {
        test('step 1 validation', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const step1 = node.child('step1')!;

            // Initially invalid
            const initialValidation = await step1.validateDeep();
            expect(initialValidation.valid).toBe(false);

            // Fill in required fields
            node.setValue('John', { path: 'step1.firstName' });
            node.setValue('Doe', { path: 'step1.lastName' });
            node.setValue(25, { path: 'step1.age' });

            const filledValidation = await step1.validateDeep();
            expect(filledValidation.valid).toBe(true);
        });

        test('step 2 validation with password match', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const step2 = node.child('step2')!;

            // Fill in fields with non-matching passwords
            node.setValue('john@example.com', { path: 'step2.email' });
            node.setValue('password123', { path: 'step2.password' });
            node.setValue('password456', { path: 'step2.confirmPassword' });

            // Should fail due to password mismatch
            let validation = await step2.validateDeep();
            expect(validation.valid).toBe(false);
            expect(validation.errors['confirmPassword']?.matches).toBe('Passwords do not match');

            // Fix password match
            node.setValue('password123', { path: 'step2.confirmPassword' });

            validation = await step2.validateDeep();
            expect(validation.valid).toBe(true);
        });

        test('step 4 terms acceptance validation', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const step4 = node.child('step4')!;

            // Terms not accepted
            let validation = await step4.validateDeep();
            expect(validation.valid).toBe(false);

            // Accept terms
            node.setValue(true, { path: 'step4.termsAccepted' });

            validation = await step4.validateDeep();
            expect(validation.valid).toBe(true);
        });
    });

    describe('Computed Metadata in Steps', () => {
        test('password strength indicator', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const passwordNode = node.get('step2.password')!;

            // Short password = weak
            node.setValue('pass', { path: 'step2.password' });
            expect(await passwordNode.getMetadata('strength')).toBe('weak');

            // Medium password
            node.setValue('password1', { path: 'step2.password' });
            expect(await passwordNode.getMetadata('strength')).toBe('medium');

            // Strong password
            node.setValue('verylongpassword123', { path: 'step2.password' });
            expect(await passwordNode.getMetadata('strength')).toBe('strong');
        });

        test('password match indicator', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const confirmNode = node.get('step2.confirmPassword')!;

            // No input yet
            expect(await confirmNode.getMetadata('matches')).toBe(false);

            // Non-matching passwords
            node.setValue('password123', { path: 'step2.password' });
            node.setValue('password456', { path: 'step2.confirmPassword' });
            expect(await confirmNode.getMetadata('matches')).toBe(false);

            // Matching passwords
            node.setValue('password123', { path: 'step2.confirmPassword' });
            expect(await confirmNode.getMetadata('matches')).toBe(true);
        });

        test('conditional visibility in preferences', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const frequencyNode = node.get('step3.emailFrequency')!;

            // Notifications enabled - frequency visible
            expect(await frequencyNode.getMetadata('visible')).toBe(true);

            // Disable notifications - frequency hidden
            node.setValue(false, { path: 'step3.notifications' });
            expect(await frequencyNode.getMetadata('visible')).toBe(false);

            // Enable notifications again
            node.setValue(true, { path: 'step3.notifications' });
            expect(await frequencyNode.getMetadata('visible')).toBe(true);
        });
    });

    describe('Review Step Summary', () => {
        test('summary data from previous steps', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);
            const step4 = node.child('step4')!;

            // Fill in data
            node.setValue('John', { path: 'step1.firstName' });
            node.setValue('Doe', { path: 'step1.lastName' });
            node.setValue('john@example.com', { path: 'step2.email' });
            node.setValue('dark', { path: 'step3.theme' });

            // Check summary
            expect(await step4.getMetadata('summaryName')).toBe('John Doe');
            expect(await step4.getMetadata('summaryEmail')).toBe('john@example.com');
            expect(await step4.getMetadata('summaryTheme')).toBe('dark');
        });
    });

    describe('Full Wizard Flow', () => {
        test('complete wizard flow with validation', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            // ========== STEP 1: Personal Information ==========
            expect(await node.getMetadata('currentStep')).toBe(1);
            expect(await node.getMetadata('currentStepTitle')).toBe('Personal Information');

            // Fill step 1
            node.setValue('Jane', { path: 'step1.firstName' });
            node.setValue('Smith', { path: 'step1.lastName' });
            node.setValue(28, { path: 'step1.age' });

            // Validate step 1
            let step1Valid = await node.child('step1')?.validateDeep();
            expect(step1Valid?.valid).toBe(true);

            // ========== STEP 2: Account Setup ==========
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 2 });
            expect(await node.getMetadata('currentStepTitle')).toBe('Account Setup');
            expect(await node.child('step1')?.getMetadata('isCompleted')).toBe(true);

            // Fill step 2
            node.setValue('jane@example.com', { path: 'step2.email' });
            node.setValue('securepassword123', { path: 'step2.password' });
            node.setValue('securepassword123', { path: 'step2.confirmPassword' });

            // Validate step 2
            let step2Valid = await node.child('step2')?.validateDeep();
            expect(step2Valid?.valid).toBe(true);

            // ========== STEP 3: Preferences ==========
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 3 });
            expect(await node.getMetadata('progress')).toBeCloseTo(66.67, 1);

            // Fill step 3 (optional, defaults are fine)
            node.setValue(false, { path: 'step3.newsletter' });
            node.setValue('dark', { path: 'step3.theme' });

            // Step 3 has no required fields, so it's always valid
            let step3Valid = await node.child('step3')?.validateDeep();
            expect(step3Valid?.valid).toBe(true);

            // ========== STEP 4: Review & Submit ==========
            node.setMetadata('currentStep', { id: 'currentStep', type: NUMBER, value: 4 });
            expect(await node.getMetadata('isLastStep')).toBe(true);
            expect(await node.getMetadata('progress')).toBe(100);

            // Check summary
            expect(await node.child('step4')?.getMetadata('summaryName')).toBe('Jane Smith');
            expect(await node.child('step4')?.getMetadata('summaryEmail')).toBe('jane@example.com');

            // Terms not accepted - validation fails
            let step4Valid = await node.child('step4')?.validateDeep();
            expect(step4Valid?.valid).toBe(false);

            // Accept terms
            node.setValue(true, { path: 'step4.termsAccepted' });
            step4Valid = await node.child('step4')?.validateDeep();
            expect(step4Valid?.valid).toBe(true);

            // ========== Full form validation ==========
            const fullValidation = await node.validateDeep();
            expect(fullValidation.valid).toBe(true);
        });
    });

    describe('Reactivity', () => {
        test('subscribers notified of field changes', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            const changes: string[][] = [];
            node.subscribe((paths) => {
                changes.push([...paths]);
            });

            // Change a field value
            node.setValue('John', { path: 'step1.firstName' });

            expect(changes.length).toBe(1);
            expect(changes[0]).toContain('step1.firstName');
        });

        test('batch updates for multi-field changes', async () => {
            const wizard = createRegistrationWizard();
            const node = PropertyNode.create(wizard, registry);

            let notificationCount = 0;
            node.subscribe(() => {
                notificationCount++;
            });

            // Batch update multiple fields
            node.batch(() => {
                node.setValue('John', { path: 'step1.firstName' });
                node.setValue('Doe', { path: 'step1.lastName' });
                node.setValue(30, { path: 'step1.age' });
            });

            // Should only have one notification
            expect(notificationCount).toBe(1);
        });
    });
});
