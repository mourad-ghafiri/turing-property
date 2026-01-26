/**
 * Complex Scenarios Benchmarks
 * Tests real-world usage patterns and end-to-end workflows.
 */

import { describe, test, expect } from 'bun:test';
import {
    Property,
    PROPERTY,
    CONSTRAINT,
    LIT,
    lit,
    op,
    ref,
    PropertyNode,
    createRegistry,
    evalArg,
    evalArgs,
    Registry,
} from '../../src';

// Helper to measure execution time
const benchmark = async (
    name: string,
    fn: () => void | Promise<void>,
    iterations = 1
): Promise<number> => {
    // Warmup
    for (let i = 0; i < Math.min(10, iterations); i++) {
        await fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`  ${name}: ${totalTime.toFixed(2)}ms total, ${avgTime.toFixed(4)}ms avg (${iterations} iterations)`);
    return avgTime;
};

// Create a registry with common operators
const createBenchmarkRegistry = (): Registry => {
    const registry = createRegistry();

    // Arithmetic
    registry.register('add', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return (a as number) + (b as number);
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
        return (a as number) / (b as number);
    });

    // Comparison
    registry.register('eq', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return a === b;
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

    // Logic
    registry.register('and', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return Boolean(a) && Boolean(b);
    });

    registry.register('or', async (args, ctx) => {
        const [a, b] = await evalArgs(args, ctx);
        return Boolean(a) || Boolean(b);
    });

    registry.register('not', async (args, ctx) => {
        const a = await evalArg(args[0]!, ctx);
        return !a;
    });

    registry.register('if', async (args, ctx) => {
        const condition = await evalArg(args[0]!, ctx);
        if (condition) {
            return evalArg(args[1]!, ctx);
        } else {
            return args[2] ? evalArg(args[2], ctx) : null;
        }
    });

    // String/Array
    registry.register('isEmpty', async (args, ctx) => {
        const val = await evalArg(args[0]!, ctx);
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') return val.trim() === '';
        if (Array.isArray(val)) return val.length === 0;
        return false;
    });

    registry.register('len', async (args, ctx) => {
        const val = await evalArg(args[0]!, ctx);
        if (typeof val === 'string') return val.length;
        if (Array.isArray(val)) return val.length;
        return 0;
    });

    registry.register('concat', async (args, ctx) => {
        const values = await evalArgs(args, ctx);
        return values.map(String).join('');
    });

    // Math
    registry.register('round', async (args, ctx) => {
        const [n, decimals = 0] = await evalArgs(args, ctx);
        const factor = Math.pow(10, decimals as number);
        return Math.round((n as number) * factor) / factor;
    });

    registry.register('sum', async (args, ctx) => {
        const arr = await evalArg(args[0]!, ctx);
        if (!Array.isArray(arr)) return 0;
        return arr.reduce((sum: number, n) => sum + (n as number), 0);
    });

    // Validation
    registry.register('isEmail', async (args, ctx) => {
        const val = await evalArg(args[0]!, ctx);
        if (typeof val !== 'string') return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    });

    registry.register('matches', async (args, ctx) => {
        const [val, pattern] = await evalArgs(args, ctx);
        if (typeof val !== 'string') return false;
        return new RegExp(pattern as string).test(val);
    });

    return registry;
};

describe('Complex Scenarios Benchmarks', () => {
    const registry = createBenchmarkRegistry();

    describe('Multi-Step Wizard', () => {
        const createWizard = (): Property => ({
            id: 'wizard',
            type: PROPERTY,
            value: { currentStep: 0 },
            children: {
                step1: {
                    id: 'personalInfo',
                    type: PROPERTY,
                    metadata: {
                        title: { id: 'title', type: PROPERTY, value: 'Personal Information' },
                    },
                    children: {
                        firstName: { id: 'firstName', type: PROPERTY, value: '', defaultValue: '' },
                        lastName: { id: 'lastName', type: PROPERTY, value: '', defaultValue: '' },
                        email: { id: 'email', type: PROPERTY, value: '', defaultValue: '' },
                    },
                },
                step2: {
                    id: 'address',
                    type: PROPERTY,
                    metadata: {
                        title: { id: 'title', type: PROPERTY, value: 'Address' },
                    },
                    children: {
                        street: { id: 'street', type: PROPERTY, value: '', defaultValue: '' },
                        city: { id: 'city', type: PROPERTY, value: '', defaultValue: '' },
                        zip: { id: 'zip', type: PROPERTY, value: '', defaultValue: '' },
                        country: { id: 'country', type: PROPERTY, value: '', defaultValue: '' },
                    },
                },
                step3: {
                    id: 'payment',
                    type: PROPERTY,
                    metadata: {
                        title: { id: 'title', type: PROPERTY, value: 'Payment' },
                    },
                    children: {
                        cardNumber: { id: 'cardNumber', type: PROPERTY, value: '', defaultValue: '' },
                        expiry: { id: 'expiry', type: PROPERTY, value: '', defaultValue: '' },
                        cvv: { id: 'cvv', type: PROPERTY, value: '', defaultValue: '' },
                    },
                },
            },
        });

        test('wizard creation and navigation', async () => {
            const time = await benchmark('wizard creation + navigation', () => {
                const wizard = createWizard();
                const node = PropertyNode.create(wizard, registry);

                // Navigate through steps
                const step1 = node.child('step1');
                const step2 = node.child('step2');
                const step3 = node.child('step3');

                // Access fields in each step
                step1?.child('firstName');
                step1?.child('email');
                step2?.child('city');
                step3?.child('cardNumber');
            }, 100);

            expect(time).toBeLessThan(1);
        });

        test('wizard form filling simulation', async () => {
            const wizard = createWizard();
            const node = PropertyNode.create(wizard, registry);
            let notificationCount = 0;
            node.subscribe(() => notificationCount++);

            const time = await benchmark('wizard form filling', () => {
                // Step 1
                node.setValue('John', { path: 'step1.firstName' });
                node.setValue('Doe', { path: 'step1.lastName' });
                node.setValue('john@example.com', { path: 'step1.email' });

                // Step 2
                node.setValue('123 Main St', { path: 'step2.street' });
                node.setValue('New York', { path: 'step2.city' });
                node.setValue('10001', { path: 'step2.zip' });
                node.setValue('USA', { path: 'step2.country' });

                // Step 3
                node.setValue('4111111111111111', { path: 'step3.cardNumber' });
                node.setValue('12/25', { path: 'step3.expiry' });
                node.setValue('123', { path: 'step3.cvv' });
            }, 10);

            expect(time).toBeLessThan(10);
            node.unsubscribeAll();
        });
    });

    describe('Shopping Cart with Computed Totals', () => {
        const createCart = (itemCount: number): Property => {
            const items: Record<string, Property> = {};
            for (let i = 0; i < itemCount; i++) {
                items[`item${i}`] = {
                    id: `item${i}`,
                    type: PROPERTY,
                    children: {
                        name: { id: 'name', type: PROPERTY, value: `Product ${i}` },
                        quantity: { id: 'quantity', type: PROPERTY, value: 1 },
                        unitPrice: { id: 'unitPrice', type: PROPERTY, value: 10 + (i * 5) },
                        subtotal: {
                            id: 'subtotal',
                            type: PROPERTY,
                            value: op('mul', ref('self.quantity.value'), ref('self.unitPrice.value')),
                        },
                    },
                };
            }
            return {
                id: 'cart',
                type: PROPERTY,
                children: {
                    items: { id: 'items', type: PROPERTY, children: items },
                    taxRate: { id: 'taxRate', type: PROPERTY, value: 0.08 },
                },
            };
        };

        test('cart with 10 items - compute subtotals', async () => {
            const cart = createCart(10);
            const node = PropertyNode.create(cart, registry);

            const time = await benchmark('compute 10 subtotals', async () => {
                for (let i = 0; i < 10; i++) {
                    await node.getValue(`items.item${i}.subtotal`);
                }
            }, 10);

            expect(time).toBeLessThan(30);
        });

        test('cart with 50 items - update quantities', async () => {
            const time = await benchmark('50 quantity updates', () => {
                const cart = createCart(50);
                const node = PropertyNode.create(cart, registry);
                let notificationCount = 0;
                node.subscribe(() => notificationCount++);

                for (let i = 0; i < 50; i++) {
                    node.setValue(Math.floor(Math.random() * 10) + 1, { path: `items.item${i}.quantity` });
                }
                expect(notificationCount).toBe(50);
            });

            expect(time).toBeLessThan(10);
        });

        test('cart - batch quantity updates', async () => {
            const cart = createCart(50);
            const node = PropertyNode.create(cart, registry);
            let notificationCount = 0;
            node.subscribe(() => notificationCount++);

            const time = await benchmark('batched 50 quantity updates', () => {
                notificationCount = 0;
                node.batch(() => {
                    for (let i = 0; i < 50; i++) {
                        node.setValue(Math.floor(Math.random() * 10) + 1, { path: `items.item${i}.quantity` });
                    }
                });
            });

            expect(notificationCount).toBe(1); // Only one notification for batch
            expect(time).toBeLessThan(5);

            node.unsubscribeAll();
        });
    });

    describe('Form with Validation', () => {
        const createValidatedForm = (fieldCount: number): Property => {
            const children: Record<string, Property> = {};
            for (let i = 0; i < fieldCount; i++) {
                children[`field${i}`] = {
                    id: `field${i}`,
                    type: PROPERTY,
                    value: '',
                    constraints: {
                        required: {
                            id: 'required',
                            type: CONSTRAINT,
                            value: op('not', op('isEmpty', ref('self.value'))),
                            metadata: {
                                message: { id: 'msg', type: PROPERTY, value: `Field ${i} is required` },
                            },
                        },
                        minLength: {
                            id: 'minLength',
                            type: CONSTRAINT,
                            value: op('gte', op('len', ref('self.value')), lit(3)),
                            metadata: {
                                message: { id: 'msg', type: PROPERTY, value: 'Minimum 3 characters' },
                            },
                        },
                    },
                };
            }
            return { id: 'form', type: PROPERTY, children };
        };

        test('validate 100 fields', async () => {
            const form = createValidatedForm(100);
            const node = PropertyNode.create(form, registry);

            // Fill some fields
            for (let i = 0; i < 50; i++) {
                node.setValue(`value${i}`, { path: `field${i}` });
            }

            const time = await benchmark('validate 100 fields', async () => {
                await node.validateDeep();
            });

            expect(time).toBeLessThan(200);
        });

        test('validate 500 fields', async () => {
            const form = createValidatedForm(500);
            const node = PropertyNode.create(form, registry);

            // Fill all fields to make them valid
            for (let i = 0; i < 500; i++) {
                node.setValue(`value${i}`, { path: `field${i}` });
            }

            const time = await benchmark('validate 500 fields', async () => {
                await node.validateDeep();
            });

            expect(time).toBeLessThan(500);
        });
    });

    describe('Dynamic Form with Conditional Fields', () => {
        const createDynamicForm = (): Property => ({
            id: 'dynamicForm',
            type: PROPERTY,
            children: {
                userType: { id: 'userType', type: PROPERTY, value: 'individual' },
                // Fields for individuals
                firstName: {
                    id: 'firstName',
                    type: PROPERTY,
                    value: '',
                    metadata: {
                        visible: {
                            id: 'visible',
                            type: LIT,
                            value: op('eq', ref('parent.userType.value'), lit('individual')),
                        },
                    },
                },
                lastName: {
                    id: 'lastName',
                    type: PROPERTY,
                    value: '',
                    metadata: {
                        visible: {
                            id: 'visible',
                            type: LIT,
                            value: op('eq', ref('parent.userType.value'), lit('individual')),
                        },
                    },
                },
                // Fields for companies
                companyName: {
                    id: 'companyName',
                    type: PROPERTY,
                    value: '',
                    metadata: {
                        visible: {
                            id: 'visible',
                            type: LIT,
                            value: op('eq', ref('parent.userType.value'), lit('company')),
                        },
                    },
                },
                taxId: {
                    id: 'taxId',
                    type: PROPERTY,
                    value: '',
                    metadata: {
                        visible: {
                            id: 'visible',
                            type: LIT,
                            value: op('eq', ref('parent.userType.value'), lit('company')),
                        },
                    },
                },
            },
        });

        test('toggle user type and check visibility 100 times', async () => {
            const form = createDynamicForm();
            const node = PropertyNode.create(form, registry);

            const time = await benchmark('100 type toggles + visibility checks', async () => {
                for (let i = 0; i < 100; i++) {
                    const type = i % 2 === 0 ? 'individual' : 'company';
                    node.setValue(type, { path: 'userType' });

                    // Check visibility of relevant fields
                    await node.getMetadata('firstName');
                    await node.getMetadata('companyName');
                }
            });

            expect(time).toBeLessThan(200);
        });
    });

    describe('Large Form Operations', () => {
        const createLargeForm = (sections: number, fieldsPerSection: number): Property => {
            const sectionChildren: Record<string, Property> = {};
            for (let s = 0; s < sections; s++) {
                const fieldChildren: Record<string, Property> = {};
                for (let f = 0; f < fieldsPerSection; f++) {
                    fieldChildren[`field${f}`] = {
                        id: `field${f}`,
                        type: PROPERTY,
                        value: '',
                        defaultValue: '',
                        metadata: {
                            label: { id: 'label', type: PROPERTY, value: `Section ${s} Field ${f}` },
                        },
                    };
                }
                sectionChildren[`section${s}`] = {
                    id: `section${s}`,
                    type: PROPERTY,
                    children: fieldChildren,
                };
            }
            return { id: 'largeForm', type: PROPERTY, children: sectionChildren };
        };

        test('create and traverse 1000-field form (10 sections x 100 fields)', async () => {
            const time = await benchmark('create + traverse 1000 fields', () => {
                const form = createLargeForm(10, 100);
                const node = PropertyNode.create(form, registry);

                let count = 0;
                node.traverse(() => { count++; });
                expect(count).toBe(1011); // root + 10 sections + 1000 fields
            });

            expect(time).toBeLessThan(10);
        });

        test('deep reset on 1000-field form', async () => {
            const form = createLargeForm(10, 100);
            const node = PropertyNode.create(form, registry);

            // Set values
            for (let s = 0; s < 10; s++) {
                for (let f = 0; f < 100; f++) {
                    node.setValue(`value_${s}_${f}`, { path: `section${s}.field${f}`, silent: true });
                }
            }

            const time = await benchmark('resetDeep 1000 fields', () => {
                node.resetDeep();
            });

            expect(time).toBeLessThan(20);
        });

        test('clone 1000-field form', async () => {
            const form = createLargeForm(10, 100);
            const node = PropertyNode.create(form, registry);

            const time = await benchmark('clone 1000 fields', () => {
                node.clone();
            });

            expect(time).toBeLessThan(20);
        });
    });

    describe('End-to-End Workflow', () => {
        test('complete form lifecycle', async () => {
            const time = await benchmark('complete form lifecycle', async () => {
                // 1. Create form
                const form: Property = {
                    id: 'userForm',
                    type: PROPERTY,
                    children: {
                        name: { id: 'name', type: PROPERTY, value: '', defaultValue: '' },
                        email: { id: 'email', type: PROPERTY, value: '', defaultValue: '' },
                        age: { id: 'age', type: PROPERTY, value: null, defaultValue: null },
                    },
                };
                const node = PropertyNode.create(form, registry);

                // 2. Set up subscriptions
                let changeCount = 0;
                const sub = node.subscribe(() => changeCount++);

                // 3. Fill form
                node.setValue('John Doe', { path: 'name' });
                node.setValue('john@example.com', { path: 'email' });
                node.setValue(30, { path: 'age' });

                // 4. Read values
                await node.getValue('name');
                await node.getValue('email');
                await node.getValue('age');

                // 5. Serialize
                const json = node.toJSON();
                const jsonStr = JSON.stringify(json);

                // 6. Deserialize
                PropertyNode.fromJSON(JSON.parse(jsonStr));

                // 7. Verify
                expect(changeCount).toBe(3);

                // 8. Cleanup
                sub.unsubscribe();
                node.destroy();
            }, 100);

            expect(time).toBeLessThan(5);
        });
    });
});
