/**
 * Scenario 02: Default Values and Reset
 *
 * Demonstrates:
 * - defaultValue on properties
 * - reset() and resetDeep() functionality
 * - Pre-filled forms with initial values
 * - Clearing vs resetting
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    Property,
    TYPE,
    PROPERTY,
    CONSTRAINT,
    PropertyNode,
    createRegistry,
    evalArg,
    evalArgs,
    op,
    ref,
    lit,
} from '../../../src';

// ============================================================================
// Domain Types (as Properties)
// ============================================================================

const STRING: Property = { id: 'String', type: TYPE };
const NUMBER: Property = { id: 'Number', type: TYPE };
const BOOLEAN: Property = { id: 'Boolean', type: TYPE };

// ============================================================================
// Registry with Operators
// ============================================================================

const createFormRegistry = () => {
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

    // Comparison
    registry.register('gte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) >= (b as number);
    });

    registry.register('lte', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) <= (b as number);
    });

    registry.register('neq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a !== b;
    });

    registry.register('eq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a === b;
    });

    // Logic
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

    return registry;
};

// ============================================================================
// Tests
// ============================================================================

describe('Scenario 02: Default Values and Reset', () => {
    describe('Basic Default Values', () => {
        test('reset() restores value to defaultValue', async () => {
            const registry = createFormRegistry();

            const field: Property = {
                id: 'username',
                type: STRING,
                value: 'guest', // Initial value matches defaultValue
                defaultValue: 'guest',
            };

            const node = PropertyNode.create(field, registry);

            // Initial value
            expect(await node.getValue()).toBe('guest');

            // Change value
            node.setValue('john');
            expect(await node.getValue()).toBe('john');

            // Reset restores to defaultValue
            node.reset();
            expect(await node.getValue()).toBe('guest');
        });

        test('value takes precedence over defaultValue', async () => {
            const registry = createFormRegistry();

            const field: Property = {
                id: 'counter',
                type: NUMBER,
                value: 10,
                defaultValue: 0,
            };

            const node = PropertyNode.create(field, registry);

            // Initial value is the explicit value, not defaultValue
            expect(await node.getValue()).toBe(10);

            // After reset, goes back to defaultValue
            node.reset();
            expect(await node.getValue()).toBe(0);
        });

        test('defaultValue can be any type', async () => {
            const registry = createFormRegistry();

            // Array default
            const tags: Property = {
                id: 'tags',
                type: PROPERTY,
                value: ['default', 'tags'],
                defaultValue: ['default', 'tags'],
            };

            // Object default
            const config: Property = {
                id: 'config',
                type: PROPERTY,
                value: { theme: 'light', language: 'en' },
                defaultValue: { theme: 'light', language: 'en' },
            };

            // Boolean default
            const active: Property = {
                id: 'active',
                type: BOOLEAN,
                value: false,
                defaultValue: false,
            };

            const tagsNode = PropertyNode.create(tags, registry);
            const configNode = PropertyNode.create(config, registry);
            const activeNode = PropertyNode.create(active, registry);

            expect(await tagsNode.getValue()).toEqual(['default', 'tags']);
            expect(await configNode.getValue()).toEqual({ theme: 'light', language: 'en' });
            expect(await activeNode.getValue()).toBe(false);

            // Modify and reset
            tagsNode.setValue(['new', 'values']);
            expect(await tagsNode.getValue()).toEqual(['new', 'values']);
            tagsNode.reset();
            expect(await tagsNode.getValue()).toEqual(['default', 'tags']);
        });
    });

    describe('Pre-filled Form', () => {
        test('form with pre-filled values for editing existing data', async () => {
            const registry = createFormRegistry();

            // Simulating editing an existing user profile
            const existingUser = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                age: 30,
            };

            const editForm: Property = {
                id: 'editUserForm',
                type: PROPERTY,
                children: {
                    firstName: {
                        id: 'firstName',
                        type: STRING,
                        value: existingUser.firstName,
                        defaultValue: existingUser.firstName, // Original value for reset
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'First Name' },
                        },
                    },
                    lastName: {
                        id: 'lastName',
                        type: STRING,
                        value: existingUser.lastName,
                        defaultValue: existingUser.lastName,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Last Name' },
                        },
                    },
                    email: {
                        id: 'email',
                        type: STRING,
                        value: existingUser.email,
                        defaultValue: existingUser.email,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Email' },
                        },
                    },
                    age: {
                        id: 'age',
                        type: NUMBER,
                        value: existingUser.age,
                        defaultValue: existingUser.age,
                        metadata: {
                            label: { id: 'label', type: STRING, value: 'Age' },
                        },
                    },
                },
            };

            const form = PropertyNode.create(editForm, registry);

            // Verify pre-filled values
            expect(await form.getValue('firstName')).toBe('John');
            expect(await form.getValue('lastName')).toBe('Doe');
            expect(await form.getValue('email')).toBe('john@example.com');
            expect(await form.getValue('age')).toBe(30);

            // User makes changes
            form.setValue('Jane', { path: 'firstName' });
            form.setValue('Smith', { path: 'lastName' });
            form.setValue(25, { path: 'age' });

            expect(await form.getValue('firstName')).toBe('Jane');
            expect(await form.getValue('lastName')).toBe('Smith');
            expect(await form.getValue('age')).toBe(25);

            // Reset all fields to original values
            form.resetDeep();

            expect(await form.getValue('firstName')).toBe('John');
            expect(await form.getValue('lastName')).toBe('Doe');
            expect(await form.getValue('email')).toBe('john@example.com');
            expect(await form.getValue('age')).toBe(30);
        });
    });

    describe('Reset Functionality', () => {
        let registry: ReturnType<typeof createFormRegistry>;
        let form: PropertyNode;

        beforeEach(() => {
            registry = createFormRegistry();

            const formDefinition: Property = {
                id: 'registrationForm',
                type: PROPERTY,
                children: {
                    username: {
                        id: 'username',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                    },
                    password: {
                        id: 'password',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                    },
                    rememberMe: {
                        id: 'rememberMe',
                        type: BOOLEAN,
                        value: true, // Start with defaultValue
                        defaultValue: true, // Default to remember
                    },
                    newsletter: {
                        id: 'newsletter',
                        type: BOOLEAN,
                        value: false,
                        defaultValue: false,
                    },
                },
            };

            form = PropertyNode.create(formDefinition, registry);
        });

        test('reset() only resets the current node', async () => {
            // Fill the form
            form.setValue('john_doe', { path: 'username' });
            form.setValue('secret123', { path: 'password' });
            form.setValue(false, { path: 'rememberMe' }); // Changed from default

            // Reset only the username field
            form.child('username')?.reset();

            expect(await form.getValue('username')).toBe(''); // Reset
            expect(await form.getValue('password')).toBe('secret123'); // Not reset
            expect(await form.getValue('rememberMe')).toBe(false); // Not reset
        });

        test('resetDeep() resets all children recursively', async () => {
            // Fill the form
            form.setValue('john_doe', { path: 'username' });
            form.setValue('secret123', { path: 'password' });
            form.setValue(false, { path: 'rememberMe' }); // Changed from default (true)
            form.setValue(true, { path: 'newsletter' }); // Changed from default (false)

            // Reset the entire form
            form.resetDeep();

            expect(await form.getValue('username')).toBe('');
            expect(await form.getValue('password')).toBe('');
            expect(await form.getValue('rememberMe')).toBe(true); // Back to default
            expect(await form.getValue('newsletter')).toBe(false); // Back to default
        });

        test('reset works with nested structures', async () => {
            const nestedForm: Property = {
                id: 'profile',
                type: PROPERTY,
                children: {
                    personal: {
                        id: 'personal',
                        type: PROPERTY,
                        children: {
                            name: {
                                id: 'name',
                                type: STRING,
                                value: 'Anonymous',
                                defaultValue: 'Anonymous',
                            },
                            bio: {
                                id: 'bio',
                                type: STRING,
                                value: 'No bio yet',
                                defaultValue: 'No bio yet',
                            },
                        },
                    },
                    settings: {
                        id: 'settings',
                        type: PROPERTY,
                        children: {
                            notifications: {
                                id: 'notifications',
                                type: BOOLEAN,
                                value: true,
                                defaultValue: true,
                            },
                            darkMode: {
                                id: 'darkMode',
                                type: BOOLEAN,
                                value: false,
                                defaultValue: false,
                            },
                        },
                    },
                },
            };

            const profile = PropertyNode.create(nestedForm, registry);

            // Make changes
            profile.setValue('John Doe', { path: 'personal.name' });
            profile.setValue('Hello world!', { path: 'personal.bio' });
            profile.setValue(false, { path: 'settings.notifications' });
            profile.setValue(true, { path: 'settings.darkMode' });

            // Reset only personal section
            profile.child('personal')?.resetDeep();

            expect(await profile.getValue('personal.name')).toBe('Anonymous');
            expect(await profile.getValue('personal.bio')).toBe('No bio yet');
            // Settings unchanged
            expect(await profile.getValue('settings.notifications')).toBe(false);
            expect(await profile.getValue('settings.darkMode')).toBe(true);

            // Reset entire profile
            profile.resetDeep();

            expect(await profile.getValue('settings.notifications')).toBe(true);
            expect(await profile.getValue('settings.darkMode')).toBe(false);
        });
    });

    describe('Default Values with Validation', () => {
        test('defaultValue should pass validation when reset', async () => {
            const registry = createFormRegistry();

            const form: Property = {
                id: 'form',
                type: PROPERTY,
                children: {
                    quantity: {
                        id: 'quantity',
                        type: NUMBER,
                        value: 5,
                        defaultValue: 1, // Valid default (between 1-100)
                        constraints: {
                            range: {
                                id: 'range',
                                type: CONSTRAINT,
                                value: op(
                                    'and',
                                    op('gte', ref('self.value'), lit(1)),
                                    op('lte', ref('self.value'), lit(100))
                                ),
                                metadata: {
                                    message: {
                                        id: 'message',
                                        type: STRING,
                                        value: 'Quantity must be between 1 and 100',
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);
            const quantityNode = node.child('quantity')!;

            // Initial value is valid
            const initialResult = await quantityNode.validate();
            expect(initialResult.valid).toBe(true);

            // Set invalid value
            quantityNode.setValue(0);
            const invalidResult = await quantityNode.validate();
            expect(invalidResult.valid).toBe(false);
            expect(invalidResult.errors.range).toBe('Quantity must be between 1 and 100');

            // Reset to valid default
            quantityNode.reset();
            expect(await quantityNode.getValue()).toBe(1);
            const resetResult = await quantityNode.validate();
            expect(resetResult.valid).toBe(true);
        });

        test('validation message available when invalid', async () => {
            const registry = createFormRegistry();

            const form: Property = {
                id: 'form',
                type: PROPERTY,
                children: {
                    email: {
                        id: 'email',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                        constraints: {
                            required: {
                                id: 'required',
                                type: CONSTRAINT,
                                value: op('isNotBlank', ref('self.value')),
                                metadata: {
                                    message: {
                                        id: 'message',
                                        type: STRING,
                                        value: 'Email is required',
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);
            const emailNode = node.child('email')!;

            // Empty by default - invalid
            const emptyResult = await emailNode.validate();
            expect(emptyResult.valid).toBe(false);
            expect(emptyResult.errors.required).toBe('Email is required');

            // Fill in email - valid
            emailNode.setValue('test@example.com');
            const validResult = await emailNode.validate();
            expect(validResult.valid).toBe(true);

            // Reset clears the value - invalid again
            emailNode.reset();
            const resetResult = await emailNode.validate();
            expect(resetResult.valid).toBe(false);
        });
    });

    describe('Computed Metadata with Default Values', () => {
        test('isDirty computed metadata tracks changes from default', async () => {
            const registry = createFormRegistry();

            // For computed metadata, the metadata property itself must BE an expression
            const form: Property = {
                id: 'form',
                type: PROPERTY,
                children: {
                    name: {
                        id: 'name',
                        type: STRING,
                        value: 'John',
                        defaultValue: 'John',
                        metadata: {
                            // Computed metadata: the property IS an op expression
                            isDirty: op('neq', ref('self.value'), lit('John')),
                        },
                    },
                },
            };

            const node = PropertyNode.create(form, registry);
            const nameNode = node.child('name')!;

            // Initially not dirty (value equals default)
            expect(await nameNode.getMetadata('isDirty')).toBe(false);

            // Change the value
            nameNode.setValue('Jane');
            expect(await nameNode.getMetadata('isDirty')).toBe(true);

            // Reset back to default
            nameNode.reset();
            expect(await nameNode.getMetadata('isDirty')).toBe(false);
        });

        test('form-level isDirty computed from children', async () => {
            const registry = createFormRegistry();

            const form: Property = {
                id: 'form',
                type: PROPERTY,
                metadata: {
                    // Form is dirty if any child value is not empty
                    isDirty: op(
                        'or',
                        op('neq', ref('self.firstName.value'), lit('')),
                        op('neq', ref('self.lastName.value'), lit(''))
                    ),
                },
                children: {
                    firstName: {
                        id: 'firstName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                    },
                    lastName: {
                        id: 'lastName',
                        type: STRING,
                        value: '',
                        defaultValue: '',
                    },
                },
            };

            const node = PropertyNode.create(form, registry);

            // Initially clean
            expect(await node.getMetadata('isDirty')).toBe(false);

            // Change first name
            node.setValue('John', { path: 'firstName' });
            expect(await node.getMetadata('isDirty')).toBe(true);

            // Reset entire form
            node.resetDeep();
            expect(await node.getMetadata('isDirty')).toBe(false);
        });
    });

    describe('Reactivity with Reset', () => {
        test('subscribers are notified on reset', async () => {
            const registry = createFormRegistry();

            const field: Property = {
                id: 'field',
                type: STRING,
                value: 'current',
                defaultValue: 'default',
            };

            const node = PropertyNode.create(field, registry);

            const changes: string[][] = [];
            node.subscribe((paths) => {
                changes.push(paths);
            });

            // Reset triggers notification
            node.reset();

            expect(changes.length).toBe(1);
            expect(await node.getValue()).toBe('default');
        });

        test('batch reset multiple fields', async () => {
            const registry = createFormRegistry();

            const form: Property = {
                id: 'form',
                type: PROPERTY,
                children: {
                    field1: { id: 'field1', type: STRING, value: 'a', defaultValue: '' },
                    field2: { id: 'field2', type: STRING, value: 'b', defaultValue: '' },
                    field3: { id: 'field3', type: STRING, value: 'c', defaultValue: '' },
                },
            };

            const node = PropertyNode.create(form, registry);

            let notificationCount = 0;
            node.subscribe(() => {
                notificationCount++;
            });

            // Batch reset - only one notification
            node.batch(() => {
                node.child('field1')?.reset();
                node.child('field2')?.reset();
                node.child('field3')?.reset();
            });

            expect(notificationCount).toBe(1);
            expect(await node.getValue('field1')).toBe('');
            expect(await node.getValue('field2')).toBe('');
            expect(await node.getValue('field3')).toBe('');
        });
    });

    describe('Utility Methods', () => {
        test('hasDefaultValue() checks if defaultValue exists', () => {
            const registry = createFormRegistry();

            const withDefault: Property = {
                id: 'field1',
                type: STRING,
                value: 'test',
                defaultValue: 'default',
            };

            const withoutDefault: Property = {
                id: 'field2',
                type: STRING,
                value: 'test',
            };

            const node1 = PropertyNode.create(withDefault, registry);
            const node2 = PropertyNode.create(withoutDefault, registry);

            expect(node1.hasDefaultValue()).toBe(true);
            expect(node2.hasDefaultValue()).toBe(false);
        });

        test('getDefaultValue() returns the default value', () => {
            const registry = createFormRegistry();

            const field: Property = {
                id: 'field',
                type: NUMBER,
                value: 100,
                defaultValue: 42,
            };

            const node = PropertyNode.create(field, registry);

            expect(node.getDefaultValue()).toBe(42);
        });

        test('hasValue() checks if value is set', () => {
            const registry = createFormRegistry();

            const withValue: Property = {
                id: 'field1',
                type: STRING,
                value: 'test',
            };

            const withoutValue: Property = {
                id: 'field2',
                type: STRING,
                defaultValue: 'default',
            };

            const node1 = PropertyNode.create(withValue, registry);
            const node2 = PropertyNode.create(withoutValue, registry);

            expect(node1.hasValue()).toBe(true);
            expect(node2.hasValue()).toBe(false);
        });
    });
});
