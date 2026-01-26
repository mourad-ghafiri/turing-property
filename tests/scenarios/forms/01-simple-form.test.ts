/**
 * Simple Form Scenario Test
 *
 * This test demonstrates best practices for modeling a reactive simple form
 * using the "All is Property" principle.
 *
 * Form structure:
 * - Contact form with name, email, and message fields
 * - Each field has metadata (label, placeholder, visible)
 * - Each field has constraints (required, format validation)
 * - Form tracks dirty state and validity
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    Property,
    PROPERTY,
    CONSTRAINT,
    TYPE,
    op,
    ref,
    lit,
    PropertyNode,
    createRegistry,
    Registry,
    evalArg,
    evalArgs,
} from '../../../src';

// =============================================================================
// Domain Types (Best Practice: Types are Properties with type: TYPE)
// =============================================================================

/** String field type - a Property with type TYPE */
const STRING: Property = { id: 'String', type: TYPE };

/** Email field type */
const EMAIL: Property = { id: 'Email', type: TYPE };

/** Text area field type */
const TEXT: Property = { id: 'Text', type: TYPE };

/** Boolean type for metadata */
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

/** Number type */
const NUMBER: Property = { id: 'Number', type: TYPE };

// =============================================================================
// Custom Operators (Best Practice: Use evalArg/evalArgs for argument evaluation)
// =============================================================================

/**
 * Creates a registry with form-specific operators
 */
const createFormRegistry = (): Registry => {
    const registry = createRegistry();

    // String operators
    registry.register('isNotBlank', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' && value.trim().length > 0;
    });

    registry.register('strlen', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        return typeof value === 'string' ? value.length : 0;
    });

    registry.register('minLength', async (args, ctx) => {
        const [value, min] = await evalArgs(args, ctx);
        return typeof value === 'string' && value.length >= (min as number);
    });

    registry.register('maxLength', async (args, ctx) => {
        const [value, max] = await evalArgs(args, ctx);
        return typeof value === 'string' && value.length <= (max as number);
    });

    // Email validation
    registry.register('isEmail', async (args, ctx) => {
        const value = await evalArg(args[0]!, ctx);
        if (typeof value !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    });

    // Comparison operators
    registry.register('gte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) >= (b as number);
    });

    registry.register('lte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) <= (b as number);
    });

    registry.register('eq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a === b;
    });

    registry.register('neq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a !== b;
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

    // Conditional
    registry.register('if', async (args, ctx) => {
        const condition = await evalArg(args[0]!, ctx);
        if (condition) {
            return evalArg(args[1]!, ctx);
        }
        return args[2] ? evalArg(args[2], ctx) : null;
    });

    return registry;
};

// =============================================================================
// Form Definition (Best Practice: Children for structure, Metadata for attributes)
// =============================================================================

/**
 * Creates a simple contact form property structure
 *
 * Structure:
 * - form (PROPERTY)
 *   - name (STRING) - required, min 2 chars
 *   - email (EMAIL) - required, valid email format
 *   - message (TEXT) - required, min 10 chars
 */
const createContactForm = (): Property => {
    // Name field
    const nameField: Property = {
        id: 'name',
        type: STRING,
        value: '',
        defaultValue: '',
        metadata: {
            label: { id: 'label', type: STRING, value: 'Full Name' },
            placeholder: { id: 'placeholder', type: STRING, value: 'Enter your full name' },
            visible: { id: 'visible', type: BOOLEAN, value: true },
            disabled: { id: 'disabled', type: BOOLEAN, value: false },
            hint: { id: 'hint', type: STRING, value: 'Please enter your first and last name' },
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
            minLength: {
                id: 'minLength',
                type: CONSTRAINT,
                value: op('minLength', ref('self.value'), lit(2)),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Name must be at least 2 characters' },
                },
            },
        },
    };

    // Email field
    const emailField: Property = {
        id: 'email',
        type: EMAIL,
        value: '',
        defaultValue: '',
        metadata: {
            label: { id: 'label', type: STRING, value: 'Email Address' },
            placeholder: { id: 'placeholder', type: STRING, value: 'user@example.com' },
            visible: { id: 'visible', type: BOOLEAN, value: true },
            disabled: { id: 'disabled', type: BOOLEAN, value: false },
            hint: { id: 'hint', type: STRING, value: 'We will never share your email' },
        },
        constraints: {
            required: {
                id: 'required',
                type: CONSTRAINT,
                value: op('isNotBlank', ref('self.value')),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Email is required' },
                },
            },
            format: {
                id: 'format',
                type: CONSTRAINT,
                // Only validate format if not empty (allows required to catch empty)
                value: op('or',
                    op('not', op('isNotBlank', ref('self.value'))),
                    op('isEmail', ref('self.value'))
                ),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Please enter a valid email address' },
                },
            },
        },
    };

    // Message field
    const messageField: Property = {
        id: 'message',
        type: TEXT,
        value: '',
        defaultValue: '',
        metadata: {
            label: { id: 'label', type: STRING, value: 'Message' },
            placeholder: { id: 'placeholder', type: STRING, value: 'Enter your message here...' },
            visible: { id: 'visible', type: BOOLEAN, value: true },
            disabled: { id: 'disabled', type: BOOLEAN, value: false },
            hint: { id: 'hint', type: STRING, value: 'Minimum 10 characters' },
            rows: { id: 'rows', type: NUMBER, value: 5 },
        },
        constraints: {
            required: {
                id: 'required',
                type: CONSTRAINT,
                value: op('isNotBlank', ref('self.value')),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Message is required' },
                },
            },
            minLength: {
                id: 'minLength',
                type: CONSTRAINT,
                value: op('minLength', ref('self.value'), lit(10)),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Message must be at least 10 characters' },
                },
            },
            maxLength: {
                id: 'maxLength',
                type: CONSTRAINT,
                value: op('maxLength', ref('self.value'), lit(500)),
                metadata: {
                    message: { id: 'message', type: STRING, value: 'Message cannot exceed 500 characters' },
                },
            },
        },
    };

    // Form container
    return {
        id: 'contactForm',
        type: PROPERTY,
        metadata: {
            title: { id: 'title', type: STRING, value: 'Contact Us' },
            description: { id: 'description', type: STRING, value: 'Please fill out the form below' },
        },
        children: {
            name: nameField,
            email: emailField,
            message: messageField,
        },
    };
};

// =============================================================================
// Tests
// =============================================================================

describe('Simple Form Scenario', () => {
    let registry: Registry;
    let formNode: PropertyNode;

    beforeEach(() => {
        registry = createFormRegistry();
        formNode = PropertyNode.create(createContactForm(), registry);
    });

    describe('Form Structure', () => {
        test('form has correct structure', () => {
            expect(formNode.id).toBe('contactForm');
            expect(formNode.type).toBe(PROPERTY);

            // Check children exist
            const nameNode = formNode.child('name');
            const emailNode = formNode.child('email');
            const messageNode = formNode.child('message');

            expect(nameNode).not.toBeNull();
            expect(emailNode).not.toBeNull();
            expect(messageNode).not.toBeNull();
        });

        test('fields have correct types (types are Properties)', () => {
            expect(formNode.child('name')?.type).toBe(STRING);
            expect(formNode.child('email')?.type).toBe(EMAIL);
            expect(formNode.child('message')?.type).toBe(TEXT);

            // Types are themselves Properties with type TYPE
            expect(STRING.type).toBe(TYPE);
            expect(EMAIL.type).toBe(TYPE);
        });

        test('fields have metadata (metadata values are Properties)', () => {
            const nameNode = formNode.child('name')!;

            // getRawMetadata returns the Property, not just the value
            const labelProp = nameNode.getRawMetadata('label');
            expect(labelProp?.value).toBe('Full Name');
            expect(labelProp?.type).toBe(STRING);

            const placeholderProp = nameNode.getRawMetadata('placeholder');
            expect(placeholderProp?.value).toBe('Enter your full name');

            const visibleProp = nameNode.getRawMetadata('visible');
            expect(visibleProp?.value).toBe(true);
        });

        test('fields have constraints (constraints are Properties with CONSTRAINT type)', () => {
            const nameNode = formNode.child('name')!;

            const requiredConstraint = nameNode.getRawConstraint('required');
            const minLengthConstraint = nameNode.getRawConstraint('minLength');

            expect(requiredConstraint).not.toBeUndefined();
            expect(minLengthConstraint).not.toBeUndefined();

            // Constraints have type CONSTRAINT
            expect(requiredConstraint?.type).toBe(CONSTRAINT);

            // Check constraint message metadata
            expect(requiredConstraint?.metadata?.message?.value).toBe('Name is required');
        });

        test('form has metadata', async () => {
            // getMetadata is async and returns the evaluated value
            const title = await formNode.getMetadata('title');
            const description = await formNode.getMetadata('description');

            expect(title).toBe('Contact Us');
            expect(description).toBe('Please fill out the form below');
        });
    });

    describe('Initial State', () => {
        test('all fields start empty', () => {
            expect(formNode.child('name')?.getRawValue()).toBe('');
            expect(formNode.child('email')?.getRawValue()).toBe('');
            expect(formNode.child('message')?.getRawValue()).toBe('');
        });

        test('form starts in default state (not dirty)', () => {
            const nameNode = formNode.child('name')!;
            expect(nameNode.getRawValue()).toBe(nameNode.getDefaultValue());
        });
    });

    describe('Reactivity', () => {
        test('setValue triggers notification', () => {
            let notificationCount = 0;
            let lastPaths: string[] = [];

            formNode.subscribe((paths) => {
                notificationCount++;
                lastPaths = paths;
            });

            formNode.child('name')?.setValue('John Doe');

            expect(notificationCount).toBe(1);
            expect(lastPaths).toContain('name');
        });

        test('watch specific field triggers on change', () => {
            let watchCalled = false;
            let watchedPaths: string[] = [];

            formNode.watch('name', (paths) => {
                watchCalled = true;
                watchedPaths = paths;
            });

            formNode.child('name')?.setValue('Jane');

            expect(watchCalled).toBe(true);
            expect(watchedPaths.some(p => p.startsWith('name'))).toBe(true);
        });

        test('watch does not trigger for other fields', () => {
            let nameWatchCount = 0;

            formNode.watch('name', () => {
                nameWatchCount++;
            });

            // Change email, not name
            formNode.child('email')?.setValue('test@example.com');

            expect(nameWatchCount).toBe(0);
        });

        test('batch updates trigger single notification', () => {
            let notificationCount = 0;

            formNode.subscribe(() => {
                notificationCount++;
            });

            formNode.batch(() => {
                formNode.child('name')?.setValue('John');
                formNode.child('email')?.setValue('john@example.com');
                formNode.child('message')?.setValue('Hello world!');
            });

            expect(notificationCount).toBe(1);
        });

        test('silent setValue does not trigger notification', () => {
            let notificationCount = 0;

            formNode.subscribe(() => {
                notificationCount++;
            });

            formNode.setValue('John', { path: 'name', silent: true });

            expect(notificationCount).toBe(0);
            expect(formNode.child('name')?.getRawValue()).toBe('John');
        });
    });

    describe('Validation', () => {
        test('empty required field fails validation', async () => {
            const nameNode = formNode.child('name')!;
            const result = await nameNode.validate();

            expect(result.valid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
            expect(Object.values(result.errors)).toContain('Name is required');
        });

        test('valid name passes validation', async () => {
            const nameNode = formNode.child('name')!;
            nameNode.setValue('John Doe');

            const result = await nameNode.validate();
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
        });

        test('name too short fails minLength', async () => {
            const nameNode = formNode.child('name')!;
            nameNode.setValue('J');

            const result = await nameNode.validate();
            expect(result.valid).toBe(false);
            expect(Object.values(result.errors)).toContain('Name must be at least 2 characters');
        });

        test('invalid email fails format validation', async () => {
            const emailNode = formNode.child('email')!;
            emailNode.setValue('not-an-email');

            const result = await emailNode.validate();
            expect(result.valid).toBe(false);
            expect(Object.values(result.errors)).toContain('Please enter a valid email address');
        });

        test('valid email passes validation', async () => {
            const emailNode = formNode.child('email')!;
            emailNode.setValue('john@example.com');

            const result = await emailNode.validate();
            expect(result.valid).toBe(true);
        });

        test('message too short fails validation', async () => {
            const messageNode = formNode.child('message')!;
            messageNode.setValue('Hi');

            const result = await messageNode.validate();
            expect(result.valid).toBe(false);
            expect(Object.values(result.errors)).toContain('Message must be at least 10 characters');
        });

        test('message too long fails validation', async () => {
            const messageNode = formNode.child('message')!;
            messageNode.setValue('A'.repeat(501));

            const result = await messageNode.validate();
            expect(result.valid).toBe(false);
            expect(Object.values(result.errors)).toContain('Message cannot exceed 500 characters');
        });

        test('validateDeep validates entire form', async () => {
            // All fields empty - should have errors
            const result = await formNode.validateDeep();

            expect(result.valid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        });

        test('valid form passes validateDeep', async () => {
            formNode.child('name')?.setValue('John Doe');
            formNode.child('email')?.setValue('john@example.com');
            formNode.child('message')?.setValue('Hello, this is a test message!');

            const result = await formNode.validateDeep();

            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
        });
    });

    describe('Dirty State', () => {
        test('field is dirty after value change', () => {
            const nameNode = formNode.child('name')!;

            // Same as default value
            expect(nameNode.getRawValue()).toBe(nameNode.getDefaultValue());

            nameNode.setValue('John');

            // Different from default value
            expect(nameNode.getRawValue()).not.toBe(nameNode.getDefaultValue());
        });

        test('field is not dirty after reset', () => {
            const nameNode = formNode.child('name')!;

            nameNode.setValue('John');
            expect(nameNode.getRawValue()).toBe('John');

            nameNode.reset();
            expect(nameNode.getRawValue()).toBe('');
            expect(nameNode.getRawValue()).toBe(nameNode.getDefaultValue());
        });

        test('resetDeep resets entire form', () => {
            formNode.child('name')?.setValue('John');
            formNode.child('email')?.setValue('john@example.com');
            formNode.child('message')?.setValue('Hello!');

            formNode.resetDeep();

            expect(formNode.child('name')?.getRawValue()).toBe('');
            expect(formNode.child('email')?.getRawValue()).toBe('');
            expect(formNode.child('message')?.getRawValue()).toBe('');
        });
    });

    describe('Navigation', () => {
        test('child navigation works', () => {
            const nameNode = formNode.child('name');
            expect(nameNode?.id).toBe('name');
        });

        test('parent navigation works', () => {
            const nameNode = formNode.child('name')!;
            expect(nameNode.parent).toBe(formNode);
        });

        test('root navigation works', () => {
            const nameNode = formNode.child('name')!;
            expect(nameNode.root).toBe(formNode);
        });

        test('path returns correct value', () => {
            const nameNode = formNode.child('name')!;
            expect(nameNode.pathString()).toBe('name');
        });

        test('traverse visits all nodes', () => {
            const visited: string[] = [];

            formNode.traverse((node) => {
                visited.push(node.id);
            });

            expect(visited).toContain('contactForm');
            expect(visited).toContain('name');
            expect(visited).toContain('email');
            expect(visited).toContain('message');
        });
    });

    describe('Serialization', () => {
        test('toJSON serializes form', () => {
            formNode.child('name')?.setValue('John Doe');
            formNode.child('email')?.setValue('john@example.com');

            const json = formNode.toJSON();

            expect(json.id).toBe('contactForm');
            expect(json.children?.name.value).toBe('John Doe');
            expect(json.children?.email.value).toBe('john@example.com');
        });

        test('fromJSON restores form', () => {
            formNode.child('name')?.setValue('John Doe');
            formNode.child('email')?.setValue('john@example.com');

            const json = formNode.toJSON();
            const restored = PropertyNode.fromJSON(json);
            restored.setRegistry(registry);

            expect(restored.child('name')?.getRawValue()).toBe('John Doe');
            expect(restored.child('email')?.getRawValue()).toBe('john@example.com');
        });

        test('clone creates independent copy', () => {
            formNode.child('name')?.setValue('John');

            const clone = formNode.clone();

            // Modify original
            formNode.child('name')?.setValue('Jane');

            // Clone should be unchanged
            expect(clone.child('name')?.getRawValue()).toBe('John');
        });
    });

    describe('Expression Evaluation', () => {
        test('constraint expressions evaluate correctly', async () => {
            const nameNode = formNode.child('name')!;

            // Empty value - constraint should fail
            const isValidEmpty = await nameNode.getConstraint('required');
            expect(isValidEmpty).toBe(false);

            // Set value - constraint should pass
            nameNode.setValue('John');
            const isValidFilled = await nameNode.getConstraint('required');
            expect(isValidFilled).toBe(true);
        });

        test('getValue evaluates expressions', async () => {
            const nameNode = formNode.child('name')!;

            nameNode.setValue('TestValue');
            const value = await nameNode.getValue();
            expect(value).toBe('TestValue');
        });
    });

    describe('Real-World Workflow', () => {
        test('complete form submission workflow', async () => {
            const submissionLog: string[] = [];

            // Subscribe to form changes (simulating UI binding)
            formNode.subscribe((paths) => {
                submissionLog.push(`changed: ${paths.join(', ')}`);
            });

            // User fills out form
            formNode.child('name')?.setValue('John Doe');
            formNode.child('email')?.setValue('john@example.com');
            formNode.child('message')?.setValue('Hello, I would like to inquire about your services.');

            // Validate before submission
            const validationResult = await formNode.validateDeep();
            expect(validationResult.valid).toBe(true);

            // Check that all changes were tracked
            expect(submissionLog.length).toBe(3);

            // Form can be serialized for submission
            const formData = formNode.toJSON();
            expect(formData.children?.name.value).toBe('John Doe');
            expect(formData.children?.email.value).toBe('john@example.com');
        });

        test('form with validation errors workflow', async () => {
            // User submits with errors
            formNode.child('name')?.setValue('J'); // Too short
            formNode.child('email')?.setValue('invalid'); // Not an email
            formNode.child('message')?.setValue('Hi'); // Too short

            const result = await formNode.validateDeep();

            expect(result.valid).toBe(false);

            // Collect all error messages from all fields
            const allMessages: string[] = [];
            for (const fieldErrors of Object.values(result.errors)) {
                allMessages.push(...Object.values(fieldErrors));
            }

            expect(allMessages).toContain('Name must be at least 2 characters');
            expect(allMessages).toContain('Please enter a valid email address');
            expect(allMessages).toContain('Message must be at least 10 characters');
        });

        test('form reset after submission', () => {
            // Fill and validate
            formNode.child('name')?.setValue('John Doe');
            formNode.child('email')?.setValue('john@example.com');
            formNode.child('message')?.setValue('Hello, this is my message.');

            // "Submit" successful, reset form
            formNode.resetDeep();

            // All fields should be empty
            expect(formNode.child('name')?.getRawValue()).toBe('');
            expect(formNode.child('email')?.getRawValue()).toBe('');
            expect(formNode.child('message')?.getRawValue()).toBe('');

            // Form values should match defaults
            expect(formNode.child('name')?.getRawValue()).toBe(formNode.child('name')?.getDefaultValue());
        });
    });
});
