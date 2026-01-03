import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { Property } from '../../src/core/property';
import { EvaluationContext } from '../../src/core/evaluate';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';
import { REQUIRED, MIN_LENGTH, EMAIL, MIN, MAX } from '../../src/builtin/constraints';
import { checkConstraints, checkConstraintsDeep } from '../../src/builtin/constraints';
import { label, hint, visible } from '../../src/builtin/metadata';

// Helper to create evaluation context from PropertyNode
function createContext(node: PropertyNode): EvaluationContext {
    return {
        current: node,
        root: node.root,
        registry: defaultRegistry
    };
}

// ============================================================================
// HELPER: Generate wizard structures
// ============================================================================

function generateWizardStep(stepIndex: number, fieldsPerStep: number, withConditionals = false): Property {
    const fields: Record<string, Property> = {};

    for (let i = 0; i < fieldsPerStep; i++) {
        const fieldId = `step${stepIndex}_field${i}`;
        const field: Property = {
            id: fieldId,
            type: i % 3 === 0 ? NUMBER : STRING,
            value: i % 3 === 0 ? 0 : '',
            defaultValue: i % 3 === 0 ? 0 : '',
            constraints: {
                required: REQUIRED
            },
            metadata: {
                label: label(`Field ${i} of Step ${stepIndex}`),
                hint: hint(`Enter value for ${fieldId}`)
            }
        };

        if (withConditionals && i > 0) {
            // Make visibility depend on previous field having a value
            field.metadata!.visible = {
                id: 'visible',
                type: BOOLEAN,
                value: op('not', op('isEmpty', ref(['parent', `step${stepIndex}_field${i - 1}`, 'value'])))
            };
        }

        fields[fieldId] = field;
    }

    return {
        id: `step_${stepIndex}`,
        type: TYPE,
        children: fields,
        metadata: {
            label: label(`Step ${stepIndex + 1}`),
            visible: {
                id: 'visible',
                type: BOOLEAN,
                value: lit(true) // Could be conditional based on previous steps
            }
        }
    };
}

function generateWizard(stepCount: number, fieldsPerStep: number, withConditionals = false): Property {
    const steps: Record<string, Property> = {};

    for (let s = 0; s < stepCount; s++) {
        steps[`step_${s}`] = generateWizardStep(s, fieldsPerStep, withConditionals);
    }

    return {
        id: 'wizard',
        type: TYPE,
        children: {
            currentStep: { id: 'currentStep', type: NUMBER, value: 0, defaultValue: 0 },
            steps: {
                id: 'steps',
                type: TYPE,
                children: steps
            },
            summary: {
                id: 'summary',
                type: TYPE,
                children: {
                    totalFields: {
                        id: 'totalFields',
                        type: NUMBER,
                        value: lit(stepCount * fieldsPerStep)
                    },
                    isComplete: {
                        id: 'isComplete',
                        type: BOOLEAN,
                        value: op('eq', ref(['parent', 'parent', 'currentStep', 'value']), lit(stepCount - 1))
                    }
                }
            }
        }
    };
}

function generateConditionalWorkflow(branchCount: number, stepsPerBranch: number, fieldsPerStep: number): Property {
    const branches: Record<string, Property> = {};

    for (let b = 0; b < branchCount; b++) {
        const branchSteps: Record<string, Property> = {};

        for (let s = 0; s < stepsPerBranch; s++) {
            branchSteps[`step_${s}`] = generateWizardStep(s, fieldsPerStep);
        }

        branches[`branch_${b}`] = {
            id: `branch_${b}`,
            type: TYPE,
            children: branchSteps,
            metadata: {
                visible: {
                    id: 'visible',
                    type: BOOLEAN,
                    value: op('eq', ref(['root', 'selectedBranch', 'value']), lit(b))
                }
            }
        };
    }

    return {
        id: 'workflow',
        type: TYPE,
        children: {
            selectedBranch: { id: 'selectedBranch', type: NUMBER, value: 0 },
            branches: {
                id: 'branches',
                type: TYPE,
                children: branches
            }
        }
    };
}

// ============================================================================
// BENCHMARKS: Wizard Creation
// ============================================================================

describe('Benchmark: Wizard Creation', () => {
    const configurations = [
        { steps: 3, fields: 10 },    // Small wizard (30 fields)
        { steps: 5, fields: 20 },    // Medium wizard (100 fields)
        { steps: 10, fields: 20 },   // Large wizard (200 fields)
        { steps: 10, fields: 50 },   // Very large wizard (500 fields)
        { steps: 20, fields: 25 },   // Many steps wizard (500 fields)
    ];

    configurations.forEach(({ steps, fields }) => {
        const total = steps * fields;

        it(`should create wizard: ${steps} steps x ${fields} fields = ${total} total`, () => {
            const start = performance.now();

            const wizard = new PropertyNode(generateWizard(steps, fields));

            const elapsed = performance.now() - start;
            const nodeCount = wizard.countNodes();

            console.log(`  ${steps} steps x ${fields} fields: ${elapsed.toFixed(2)}ms (${nodeCount} nodes)`);
            expect(wizard.childKeys.length).toBe(3); // currentStep, steps, summary
        });

        it(`should create wizard with conditionals: ${steps} steps x ${fields} fields`, () => {
            const start = performance.now();

            const wizard = new PropertyNode(generateWizard(steps, fields, true));

            const elapsed = performance.now() - start;

            console.log(`  ${steps} steps x ${fields} fields (conditional): ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Wizard Navigation
// ============================================================================

describe('Benchmark: Wizard Navigation', () => {
    it('should navigate through 10-step wizard', async () => {
        const wizard = new PropertyNode(generateWizard(10, 20));
        wizard.setRegistry(defaultRegistry);

        const start = performance.now();

        // Simulate navigating through all steps
        for (let step = 0; step < 10; step++) {
            wizard.setValue(step, ['currentStep']);

            // Get visibility of current step
            await wizard.getMetadata('visible');

            // Access all fields in current step
            const stepNode = wizard.getByPath(['steps', `step_${step}`]);
            if (stepNode) {
                for (const key of stepNode.childKeys) {
                    await stepNode.getValue([key]);
                }
            }
        }

        const elapsed = performance.now() - start;
        console.log(`  navigate 10 steps (20 fields each): ${elapsed.toFixed(2)}ms`);
    });

    it('should evaluate step visibility conditions', async () => {
        // Wizard where each step is visible only if previous step has at least one filled field
        const steps: Record<string, Property> = {};

        for (let s = 0; s < 10; s++) {
            const stepFields: Record<string, Property> = {};
            for (let f = 0; f < 10; f++) {
                stepFields[`field_${f}`] = {
                    id: `field_${f}`,
                    type: STRING,
                    value: s === 0 && f === 0 ? 'filled' : '', // Only first field of first step is filled
                };
            }

            steps[`step_${s}`] = {
                id: `step_${s}`,
                type: TYPE,
                children: stepFields,
                metadata: {
                    visible: {
                        id: 'visible',
                        type: BOOLEAN,
                        value: s === 0
                            ? lit(true)
                            : op('not', op('isEmpty', ref(['parent', `step_${s - 1}`, 'field_0', 'value'])))
                    }
                }
            };
        }

        const wizard = new PropertyNode({
            id: 'wizard',
            type: TYPE,
            children: { steps: { id: 'steps', type: TYPE, children: steps } }
        });
        wizard.setRegistry(defaultRegistry);

        const start = performance.now();

        // Evaluate all step visibility
        for (let s = 0; s < 10; s++) {
            const stepNode = wizard.getByPath(['steps', `step_${s}`]);
            if (stepNode) {
                await stepNode.getMetadata('visible');
            }
        }

        const elapsed = performance.now() - start;
        console.log(`  10 step visibility evaluations: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Wizard Validation
// ============================================================================

describe('Benchmark: Wizard Validation', () => {
    const configurations = [
        { steps: 5, fields: 10 },   // 50 fields
        { steps: 10, fields: 20 },  // 200 fields
        { steps: 10, fields: 50 },  // 500 fields
    ];

    configurations.forEach(({ steps, fields }) => {
        const total = steps * fields;

        it(`should validate current step: ${fields} fields`, async () => {
            const wizard = new PropertyNode(generateWizard(steps, fields));
            wizard.setRegistry(defaultRegistry);

            // Fill in some values for the first step
            for (let f = 0; f < fields; f++) {
                wizard.setValue(`value_${f}`, ['steps', 'step_0', `step0_field${f}`]);
            }

            const stepNode = wizard.getByPath(['steps', 'step_0']);

            const start = performance.now();
            const errors = await checkConstraintsDeep(stepNode!, createContext(stepNode!));
            const elapsed = performance.now() - start;

            console.log(`  validate step (${fields} fields): ${elapsed.toFixed(2)}ms, ${errors.length} errors`);
        });

        it(`should validate entire wizard: ${total} fields`, async () => {
            const wizard = new PropertyNode(generateWizard(steps, fields));
            wizard.setRegistry(defaultRegistry);

            // Fill in half the fields to create some valid, some invalid
            for (let s = 0; s < steps; s++) {
                for (let f = 0; f < fields / 2; f++) {
                    wizard.setValue(`value_${s}_${f}`, ['steps', `step_${s}`, `step${s}_field${f}`]);
                }
            }

            const start = performance.now();
            const errors = await checkConstraintsDeep(wizard, createContext(wizard));
            const elapsed = performance.now() - start;

            console.log(`  validate wizard (${total} fields): ${elapsed.toFixed(2)}ms, ${errors.length} errors`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Wizard State Management
// ============================================================================

describe('Benchmark: Wizard State Management', () => {
    it('should snapshot and restore wizard state (200 fields)', async () => {
        const wizard = new PropertyNode(generateWizard(10, 20));
        wizard.setRegistry(defaultRegistry);

        // Fill in values
        for (let s = 0; s < 10; s++) {
            for (let f = 0; f < 20; f++) {
                wizard.setValue(`filled_${s}_${f}`, ['steps', `step_${s}`, `step${s}_field${f}`]);
            }
        }

        // Snapshot
        const startSnapshot = performance.now();
        const snapshot = await wizard.snapshot();
        const snapshotTime = performance.now() - startSnapshot;

        // Clear all
        wizard.clearAll();

        // Restore
        const startRestore = performance.now();
        wizard.setFromSnapshot(snapshot);
        const restoreTime = performance.now() - startRestore;

        console.log(`  snapshot: ${snapshotTime.toFixed(2)}ms, restore: ${restoreTime.toFixed(2)}ms`);
    });

    it('should check dirty state across wizard (200 fields)', async () => {
        const wizard = new PropertyNode(generateWizard(10, 20));
        wizard.setRegistry(defaultRegistry);

        // Modify half the fields
        for (let s = 0; s < 5; s++) {
            for (let f = 0; f < 20; f++) {
                wizard.setValue(`modified_${s}_${f}`, ['steps', `step_${s}`, `step${s}_field${f}`]);
            }
        }

        const start = performance.now();
        const isDirty = wizard.isDirty();
        const modifiedFields = wizard.getModifiedFields();
        const elapsed = performance.now() - start;

        expect(isDirty).toBe(true);
        console.log(`  isDirty + getModifiedFields: ${elapsed.toFixed(2)}ms (${modifiedFields.length} modified)`);
    });

    it('should reset wizard to defaults', () => {
        const wizard = new PropertyNode(generateWizard(10, 20));

        // Modify all fields
        for (let s = 0; s < 10; s++) {
            for (let f = 0; f < 20; f++) {
                wizard.setValue(`modified_${s}_${f}`, ['steps', `step_${s}`, `step${s}_field${f}`]);
            }
        }

        const start = performance.now();
        wizard.resetDeep();
        const elapsed = performance.now() - start;

        console.log(`  resetDeep (200 fields): ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Conditional Branching Workflow
// ============================================================================

describe('Benchmark: Conditional Branching Workflow', () => {
    const configurations = [
        { branches: 3, steps: 5, fields: 10 },   // 150 total fields
        { branches: 5, steps: 5, fields: 10 },   // 250 total fields
        { branches: 5, steps: 10, fields: 10 },  // 500 total fields
    ];

    configurations.forEach(({ branches, steps, fields }) => {
        const total = branches * steps * fields;

        it(`should create workflow: ${branches} branches x ${steps} steps x ${fields} fields`, () => {
            const start = performance.now();

            const workflow = new PropertyNode(generateConditionalWorkflow(branches, steps, fields));

            const elapsed = performance.now() - start;
            console.log(`  ${branches}x${steps}x${fields} = ${total} fields: ${elapsed.toFixed(2)}ms`);
        });

        it(`should evaluate branch visibility for ${branches} branches`, async () => {
            const workflow = new PropertyNode(generateConditionalWorkflow(branches, steps, fields));
            workflow.setRegistry(defaultRegistry);

            const start = performance.now();

            // Evaluate visibility for all branches
            for (let b = 0; b < branches; b++) {
                const branchNode = workflow.getByPath(['branches', `branch_${b}`]);
                if (branchNode) {
                    await branchNode.getMetadata('visible');
                }
            }

            const elapsed = performance.now() - start;
            console.log(`  ${branches} branch visibility evals: ${elapsed.toFixed(2)}ms`);
        });

        it(`should switch branches and access fields`, async () => {
            const workflow = new PropertyNode(generateConditionalWorkflow(branches, steps, fields));
            workflow.setRegistry(defaultRegistry);

            const start = performance.now();

            // Switch through all branches
            for (let b = 0; b < branches; b++) {
                workflow.setValue(b, ['selectedBranch']);

                // Access all fields in current branch
                for (let s = 0; s < steps; s++) {
                    const stepNode = workflow.getByPath(['branches', `branch_${b}`, `step_${s}`]);
                    if (stepNode) {
                        for (const key of stepNode.childKeys) {
                            await stepNode.getValue([key]);
                        }
                    }
                }
            }

            const elapsed = performance.now() - start;
            console.log(`  switch ${branches} branches, access ${total} fields: ${elapsed.toFixed(2)}ms`);
        });
    });
});

// ============================================================================
// BENCHMARKS: Dynamic Field Visibility
// ============================================================================

describe('Benchmark: Dynamic Field Visibility', () => {
    it('should evaluate cascading visibility (100 dependent fields)', async () => {
        // Each field's visibility depends on the previous field being non-empty
        const fields: Record<string, Property> = {
            trigger: { id: 'trigger', type: STRING, value: 'filled' }
        };

        for (let i = 1; i <= 100; i++) {
            fields[`field_${i}`] = {
                id: `field_${i}`,
                type: STRING,
                value: '',
                metadata: {
                    visible: {
                        id: 'visible',
                        type: BOOLEAN,
                        value: op('not', op('isEmpty',
                            ref(['parent', i === 1 ? 'trigger' : `field_${i - 1}`, 'value'])
                        ))
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

        // Evaluate all visibility conditions
        for (let i = 1; i <= 100; i++) {
            const fieldNode = form.child(`field_${i}`);
            if (fieldNode) {
                await fieldNode.getMetadata('visible');
            }
        }

        const elapsed = performance.now() - start;
        console.log(`  100 cascading visibility evals: ${elapsed.toFixed(2)}ms`);
    });

    it('should evaluate complex visibility rules', async () => {
        // Fields with complex visibility rules involving multiple conditions
        const fields: Record<string, Property> = {
            type: { id: 'type', type: STRING, value: 'business' },
            country: { id: 'country', type: STRING, value: 'US' },
            age: { id: 'age', type: NUMBER, value: 25 },
            hasLicense: { id: 'hasLicense', type: BOOLEAN, value: true }
        };

        // 50 fields with complex visibility
        for (let i = 0; i < 50; i++) {
            fields[`conditional_${i}`] = {
                id: `conditional_${i}`,
                type: STRING,
                value: '',
                metadata: {
                    visible: {
                        id: 'visible',
                        type: BOOLEAN,
                        value: op('and',
                            op('or',
                                op('eq', ref(['parent', 'type', 'value']), lit('business')),
                                op('and',
                                    op('eq', ref(['parent', 'type', 'value']), lit('personal')),
                                    op('gte', ref(['parent', 'age', 'value']), lit(21))
                                )
                            ),
                            op('or',
                                op('eq', ref(['parent', 'country', 'value']), lit('US')),
                                op('eq', ref(['parent', 'country', 'value']), lit('CA'))
                            ),
                            ref(['parent', 'hasLicense', 'value'])
                        )
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

        // Evaluate all complex visibility conditions
        for (let i = 0; i < 50; i++) {
            const fieldNode = form.child(`conditional_${i}`);
            if (fieldNode) {
                await fieldNode.getMetadata('visible');
            }
        }

        const elapsed = performance.now() - start;
        console.log(`  50 complex visibility evals: ${elapsed.toFixed(2)}ms`);
    });
});

// ============================================================================
// BENCHMARKS: Real-World Wizard Simulation
// ============================================================================

describe('Benchmark: Real-World Wizard Simulation', () => {
    it('should simulate complete wizard flow (user registration)', async () => {
        const registrationWizard = new PropertyNode({
            id: 'registration',
            type: TYPE,
            children: {
                currentStep: { id: 'currentStep', type: NUMBER, value: 0 },
                steps: {
                    id: 'steps',
                    type: TYPE,
                    children: {
                        account: {
                            id: 'account',
                            type: TYPE,
                            children: {
                                email: {
                                    id: 'email',
                                    type: STRING,
                                    value: '',
                                    constraints: { required: REQUIRED, email: EMAIL }
                                },
                                password: {
                                    id: 'password',
                                    type: STRING,
                                    value: '',
                                    constraints: { required: REQUIRED, minLength: MIN_LENGTH(8) }
                                },
                                confirmPassword: {
                                    id: 'confirmPassword',
                                    type: STRING,
                                    value: '',
                                    constraints: { required: REQUIRED }
                                }
                            },
                            metadata: {
                                label: label('Account Information'),
                                visible: {
                                    id: 'visible',
                                    type: BOOLEAN,
                                    value: op('eq', ref(['root', 'currentStep', 'value']), lit(0))
                                }
                            }
                        },
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                firstName: { id: 'firstName', type: STRING, value: '', constraints: { required: REQUIRED } },
                                lastName: { id: 'lastName', type: STRING, value: '', constraints: { required: REQUIRED } },
                                dateOfBirth: { id: 'dateOfBirth', type: STRING, value: '' },
                                phone: { id: 'phone', type: STRING, value: '' }
                            },
                            metadata: {
                                label: label('Personal Information'),
                                visible: {
                                    id: 'visible',
                                    type: BOOLEAN,
                                    value: op('eq', ref(['root', 'currentStep', 'value']), lit(1))
                                }
                            }
                        },
                        address: {
                            id: 'address',
                            type: TYPE,
                            children: {
                                street: { id: 'street', type: STRING, value: '', constraints: { required: REQUIRED } },
                                city: { id: 'city', type: STRING, value: '', constraints: { required: REQUIRED } },
                                state: { id: 'state', type: STRING, value: '' },
                                zip: { id: 'zip', type: STRING, value: '', constraints: { required: REQUIRED } },
                                country: { id: 'country', type: STRING, value: 'US' }
                            },
                            metadata: {
                                label: label('Address'),
                                visible: {
                                    id: 'visible',
                                    type: BOOLEAN,
                                    value: op('eq', ref(['root', 'currentStep', 'value']), lit(2))
                                }
                            }
                        },
                        review: {
                            id: 'review',
                            type: TYPE,
                            children: {
                                summary: {
                                    id: 'summary',
                                    type: STRING,
                                    value: op('concat',
                                        lit('Email: '),
                                        ref(['root', 'steps', 'account', 'email', 'value']),
                                        lit('\nName: '),
                                        ref(['root', 'steps', 'personal', 'firstName', 'value']),
                                        lit(' '),
                                        ref(['root', 'steps', 'personal', 'lastName', 'value']),
                                        lit('\nAddress: '),
                                        ref(['root', 'steps', 'address', 'street', 'value']),
                                        lit(', '),
                                        ref(['root', 'steps', 'address', 'city', 'value']),
                                        lit(' '),
                                        ref(['root', 'steps', 'address', 'zip', 'value'])
                                    )
                                },
                                termsAccepted: {
                                    id: 'termsAccepted',
                                    type: BOOLEAN,
                                    value: false,
                                    constraints: { required: REQUIRED }
                                }
                            },
                            metadata: {
                                label: label('Review & Submit'),
                                visible: {
                                    id: 'visible',
                                    type: BOOLEAN,
                                    value: op('eq', ref(['root', 'currentStep', 'value']), lit(3))
                                }
                            }
                        }
                    }
                }
            }
        });
        registrationWizard.setRegistry(defaultRegistry);

        const start = performance.now();

        // Step 1: Fill account info
        registrationWizard.setValue('user@example.com', ['steps', 'account', 'email']);
        registrationWizard.setValue('password123', ['steps', 'account', 'password']);
        registrationWizard.setValue('password123', ['steps', 'account', 'confirmPassword']);

        // Validate step 1
        const step1Node = registrationWizard.getByPath(['steps', 'account']);
        await checkConstraintsDeep(step1Node!, createContext(step1Node!));

        // Navigate to step 2
        registrationWizard.setValue(1, ['currentStep']);
        await registrationWizard.getByPath(['steps', 'personal'])?.getMetadata('visible');

        // Step 2: Fill personal info
        registrationWizard.setValue('John', ['steps', 'personal', 'firstName']);
        registrationWizard.setValue('Doe', ['steps', 'personal', 'lastName']);

        // Validate step 2
        const step2Node = registrationWizard.getByPath(['steps', 'personal']);
        await checkConstraintsDeep(step2Node!, createContext(step2Node!));

        // Navigate to step 3
        registrationWizard.setValue(2, ['currentStep']);

        // Step 3: Fill address
        registrationWizard.setValue('123 Main St', ['steps', 'address', 'street']);
        registrationWizard.setValue('New York', ['steps', 'address', 'city']);
        registrationWizard.setValue('10001', ['steps', 'address', 'zip']);

        // Validate step 3
        const step3Node = registrationWizard.getByPath(['steps', 'address']);
        await checkConstraintsDeep(step3Node!, createContext(step3Node!));

        // Navigate to review
        registrationWizard.setValue(3, ['currentStep']);

        // Generate summary
        const summary = await registrationWizard.getValue(['steps', 'review', 'summary']);

        // Final validation
        await checkConstraintsDeep(registrationWizard, createContext(registrationWizard));

        const elapsed = performance.now() - start;
        console.log(`  complete registration wizard flow: ${elapsed.toFixed(2)}ms`);
        expect(summary).toContain('user@example.com');
    });
});
