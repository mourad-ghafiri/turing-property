/**
 * All is Property - Design Principle Tests
 * =========================================
 * Tests verifying the fundamental principle: Everything is a Property.
 * Types, expressions, constraints, metadata - all are Properties.
 */

import { describe, test, expect } from 'bun:test';
import {
    // Types
    TYPE,
    EXPR,
    OPERATOR,
    CONSTRAINT,
    PROPERTY,
    LIT,
    REF,
    OP,
    // Expressions
    lit,
    ref,
    op,
    // Guards
    isLit,
    isRef,
    isOp,
    isConstraint,
    isProperty,
    // Registry & Evaluation
    createRegistry,
    evaluate,
    evalArg,
    evalArgs,
    // PropertyNode
    PropertyNode,
} from '../../src';
import type { Property, EvaluationContext } from '../../src';

// ============================================================================
// PRINCIPLE 1: ALL IS PROPERTY
// ============================================================================

describe('Principle: All is Property', () => {
    test('TYPE is a Property', () => {
        expect(isProperty(TYPE)).toBe(true);
        expect(TYPE.id).toBe('Type');
        expect(TYPE.type).toBe(TYPE); // Self-referential
    });

    test('EXPR is a Property', () => {
        expect(isProperty(EXPR)).toBe(true);
        expect(EXPR.type).toBe(TYPE);
    });

    test('OPERATOR is a Property', () => {
        expect(isProperty(OPERATOR)).toBe(true);
        expect(OPERATOR.type).toBe(TYPE);
    });

    test('CONSTRAINT is a Property', () => {
        expect(isProperty(CONSTRAINT)).toBe(true);
        expect(CONSTRAINT.type).toBe(TYPE);
    });

    test('LIT, REF, OP are Properties with type EXPR', () => {
        expect(isProperty(LIT)).toBe(true);
        expect(isProperty(REF)).toBe(true);
        expect(isProperty(OP)).toBe(true);
        expect(LIT.type).toBe(EXPR);
        expect(REF.type).toBe(EXPR);
        expect(OP.type).toBe(EXPR);
    });

    test('Expressions created by factories are Properties', () => {
        const literal = lit(42);
        const reference = ref('self.value');
        const operator = op('add', lit(1), lit(2));

        expect(isProperty(literal)).toBe(true);
        expect(isProperty(reference)).toBe(true);
        expect(isProperty(operator)).toBe(true);
    });

    test('Metadata values are Properties', () => {
        const prop: Property = {
            id: 'field',
            type: PROPERTY,
            value: 'test',
            metadata: {
                label: { id: 'label', type: LIT, value: 'My Field' },
                visible: { id: 'visible', type: LIT, value: true },
            },
        };

        expect(isProperty(prop.metadata!.label)).toBe(true);
        expect(isProperty(prop.metadata!.visible)).toBe(true);
    });

    test('Constraints are Properties', () => {
        const constraint: Property = {
            id: 'required',
            type: CONSTRAINT,
            value: op('isNotBlank', ref('self.value')),
            metadata: {
                message: { id: 'message', type: LIT, value: 'This field is required' },
            },
        };

        expect(isProperty(constraint)).toBe(true);
        expect(isConstraint(constraint)).toBe(true);
        expect(isProperty(constraint.metadata!.message)).toBe(true);
    });

    test('Children are Properties', () => {
        const form: Property = {
            id: 'form',
            type: PROPERTY,
            children: {
                name: { id: 'name', type: PROPERTY, value: '' },
                email: { id: 'email', type: PROPERTY, value: '' },
            },
        };

        expect(isProperty(form.children!.name)).toBe(true);
        expect(isProperty(form.children!.email)).toBe(true);
    });
});

// ============================================================================
// PRINCIPLE 2: THREE BUILDING BLOCKS
// ============================================================================

describe('Principle: Three Building Blocks (lit, ref, op)', () => {
    describe('lit() - Literal expressions', () => {
        test('lit() creates Property with type LIT', () => {
            const expr = lit(42);
            expect(expr.type).toBe(LIT);
            expect(isLit(expr)).toBe(true);
        });

        test('lit() supports all primitive types', () => {
            expect(lit(42).value).toBe(42);
            expect(lit('hello').value).toBe('hello');
            expect(lit(true).value).toBe(true);
            expect(lit(null).value).toBe(null);
            expect(lit(undefined).value).toBe(undefined);
        });

        test('lit() supports complex values', () => {
            const arr = [1, 2, 3];
            const obj = { a: 1, b: 2 };
            expect(lit(arr).value).toBe(arr);
            expect(lit(obj).value).toBe(obj);
        });

        test('lit() evaluates to its value', async () => {
            const registry = createRegistry();
            const ctx: EvaluationContext = {
                current: lit(0),
                root: lit(0),
                registry,
            };

            expect(await evaluate(lit(42), ctx)).toBe(42);
            expect(await evaluate(lit('hello'), ctx)).toBe('hello');
            expect(await evaluate(lit(true), ctx)).toBe(true);
        });
    });

    describe('ref() - Reference expressions', () => {
        test('ref() creates Property with type REF', () => {
            const expr = ref('self.value');
            expect(expr.type).toBe(REF);
            expect(isRef(expr)).toBe(true);
        });

        test('ref() supports dot notation', () => {
            const expr = ref('parent.name.value');
            expect(expr.value).toEqual(['parent', 'name', 'value']);
        });

        test('ref() supports array notation', () => {
            const expr = ref(['root', 'metadata', 'config']);
            expect(expr.value).toEqual(['root', 'metadata', 'config']);
        });

        test('ref() resolves self.value', async () => {
            const registry = createRegistry();
            const current: Property = {
                id: 'test',
                type: PROPERTY,
                value: 42,
            };
            const ctx: EvaluationContext = { current, root: current, registry };

            expect(await evaluate(ref('self.value'), ctx)).toBe(42);
        });

        test('ref() resolves parent references', async () => {
            const registry = createRegistry();
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    a: { id: 'a', type: PROPERTY, value: 100 },
                    b: { id: 'b', type: PROPERTY, value: ref('parent.a.value') },
                },
            };

            const bNode = new PropertyNode(root).setRegistry(registry).child('b')!;
            const result = await bNode.getValue();
            expect(result).toBe(100);
        });

        test('ref() resolves root references', async () => {
            const registry = createRegistry();
            const root: Property = {
                id: 'root',
                type: PROPERTY,
                value: 'root-value',
                children: {
                    deep: {
                        id: 'deep',
                        type: PROPERTY,
                        children: {
                            nested: {
                                id: 'nested',
                                type: PROPERTY,
                                value: ref('root.value'),
                            },
                        },
                    },
                },
            };

            const node = PropertyNode.create(root, registry);
            const result = await node.getValue('deep.nested');
            expect(result).toBe('root-value');
        });
    });

    describe('op() - Operator expressions', () => {
        test('op() creates Property with type OP', () => {
            const expr = op('add', lit(1), lit(2));
            expect(expr.type).toBe(OP);
            expect(isOp(expr)).toBe(true);
        });

        test('op() stores arguments as children', () => {
            const expr = op('add', lit(1), lit(2), lit(3));
            expect(expr.children?.arg0?.value).toBe(1);
            expect(expr.children?.arg1?.value).toBe(2);
            expect(expr.children?.arg2?.value).toBe(3);
        });

        test('op() evaluates using registry', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const values = await evalArgs(args, ctx);
                return (values[0] as number) + (values[1] as number);
            });

            const ctx: EvaluationContext = {
                current: lit(0),
                root: lit(0),
                registry,
            };

            const result = await evaluate(op('add', lit(1), lit(2)), ctx);
            expect(result).toBe(3);
        });

        test('op() supports nested operators', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });
            registry.register('mul', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) * (b as number);
            });

            const ctx: EvaluationContext = {
                current: lit(0),
                root: lit(0),
                registry,
            };

            // (1 + 2) * 3 = 9
            const expr = op('mul', op('add', lit(1), lit(2)), lit(3));
            const result = await evaluate(expr, ctx);
            expect(result).toBe(9);
        });

        test('op() can reference values', async () => {
            const registry = createRegistry();
            registry.register('add', async (args, ctx) => {
                const [a, b] = await evalArgs(args, ctx);
                return (a as number) + (b as number);
            });

            const root: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    x: { id: 'x', type: PROPERTY, value: 10 },
                    y: { id: 'y', type: PROPERTY, value: 20 },
                    sum: op('add', ref('parent.x.value'), ref('parent.y.value')),
                },
            };

            const node = PropertyNode.create(root, registry);
            const result = await node.getValue('sum');
            expect(result).toBe(30);
        });
    });
});

// ============================================================================
// PRINCIPLE 3: CHILDREN VS METADATA
// ============================================================================

describe('Principle: Children vs Metadata', () => {
    describe('Children = Structural Hierarchy', () => {
        test('Form fields are children', () => {
            const form: Property = {
                id: 'registrationForm',
                type: PROPERTY,
                children: {
                    firstName: { id: 'firstName', type: PROPERTY, value: '' },
                    lastName: { id: 'lastName', type: PROPERTY, value: '' },
                    email: { id: 'email', type: PROPERTY, value: '' },
                },
            };

            const node = PropertyNode.create(form);
            expect(node.childKeys()).toEqual(['firstName', 'lastName', 'email']);
            expect(node.hasChildren()).toBe(true);
        });

        test('Tree nodes are children', () => {
            const tree: Property = {
                id: 'root',
                type: PROPERTY,
                children: {
                    left: {
                        id: 'left',
                        type: PROPERTY,
                        children: {
                            leaf1: { id: 'leaf1', type: PROPERTY, value: 1 },
                        },
                    },
                    right: {
                        id: 'right',
                        type: PROPERTY,
                        children: {
                            leaf2: { id: 'leaf2', type: PROPERTY, value: 2 },
                        },
                    },
                },
            };

            const node = PropertyNode.create(tree);
            expect(node.count()).toBe(5); // root + left + right + 2 leaves
        });

        test('Workflow steps are children', () => {
            const STEP: Property = { id: 'Step', type: TYPE };
            const STAGE: Property = { id: 'Stage', type: TYPE };

            const stage: Property = {
                id: 'buildStage',
                type: STAGE,
                children: {
                    checkout: { id: 'checkout', type: STEP, value: 'git clone' },
                    install: { id: 'install', type: STEP, value: 'npm install' },
                    build: { id: 'build', type: STEP, value: 'npm run build' },
                },
            };

            const node = PropertyNode.create(stage);
            expect(node.childCount).toBe(3);
        });
    });

    describe('Metadata = Descriptions / Attributes', () => {
        test('UI hints go in metadata', () => {
            const field: Property = {
                id: 'email',
                type: PROPERTY,
                value: '',
                metadata: {
                    label: { id: 'label', type: LIT, value: 'Email Address' },
                    placeholder: { id: 'placeholder', type: LIT, value: 'user@example.com' },
                    hint: { id: 'hint', type: LIT, value: 'We will never share your email' },
                },
            };

            const node = PropertyNode.create(field);
            expect(node.metadataKeys()).toEqual(['label', 'placeholder', 'hint']);
        });

        test('Computed values go in metadata', async () => {
            const registry = createRegistry();
            registry.register('strlen', async (args, ctx) => {
                const val = await evalArg(args[0]!, ctx);
                return String(val).length;
            });

            const field: Property = {
                id: 'name',
                type: PROPERTY,
                value: 'John Doe',
                metadata: {
                    length: op('strlen', ref('self.value')),
                },
            };

            const node = PropertyNode.create(field, registry);
            const length = await node.getMetadata('length');
            expect(length).toBe(8);
        });

        test('State goes in metadata', () => {
            const wizard: Property = {
                id: 'wizard',
                type: PROPERTY,
                metadata: {
                    currentStep: { id: 'currentStep', type: LIT, value: 0 },
                    totalSteps: { id: 'totalSteps', type: LIT, value: 3 },
                    isComplete: { id: 'isComplete', type: LIT, value: false },
                },
                children: {
                    step1: { id: 'step1', type: PROPERTY },
                    step2: { id: 'step2', type: PROPERTY },
                    step3: { id: 'step3', type: PROPERTY },
                },
            };

            const node = PropertyNode.create(wizard);
            expect(node.hasMetadata('currentStep')).toBe(true);
            expect(node.hasMetadata('isComplete')).toBe(true);
            // Steps are children, not metadata
            expect(node.hasChildren()).toBe(true);
        });

        test('Relationships/Edges go in metadata', () => {
            const NODE: Property = { id: 'Node', type: TYPE };
            const EDGE: Property = { id: 'Edge', type: TYPE };

            const nodeA: Property = { id: 'nodeA', type: NODE, value: 'A' };
            const edge: Property = {
                id: 'edge1',
                type: EDGE,
                metadata: {
                    from: { id: 'from', type: REF, value: ['root', 'nodes', 'nodeA'] },
                    to: { id: 'to', type: REF, value: ['root', 'nodes', 'nodeB'] },
                    weight: { id: 'weight', type: LIT, value: 10 },
                },
            };

            expect(nodeA.type).toBe(NODE);
            expect(edge.metadata?.from).toBeDefined();
            expect(edge.metadata?.to).toBeDefined();
            expect(edge.metadata?.weight).toBeDefined();
        });
    });
});

// ============================================================================
// PRINCIPLE 4: TYPES AS PROPERTIES
// ============================================================================

describe('Principle: Types are First-Class Properties', () => {
    test('Custom types extend TYPE', () => {
        const ENTITY: Property = { id: 'Entity', type: TYPE };
        const PERSON: Property = { id: 'Person', type: ENTITY };
        const EMPLOYEE: Property = { id: 'Employee', type: PERSON };

        expect(isProperty(ENTITY)).toBe(true);
        expect(isProperty(PERSON)).toBe(true);
        expect(isProperty(EMPLOYEE)).toBe(true);

        expect(ENTITY.type).toBe(TYPE);
        expect(PERSON.type).toBe(ENTITY);
        expect(EMPLOYEE.type).toBe(PERSON);
    });

    test('Types can have metadata', () => {
        const PERSON: Property = {
            id: 'Person',
            type: TYPE,
            metadata: {
                description: { id: 'description', type: LIT, value: 'A person entity' },
                icon: { id: 'icon', type: LIT, value: 'user' },
            },
        };

        expect(PERSON.metadata?.description?.value).toBe('A person entity');
    });

    test('Domain types form hierarchies', () => {
        // Graph domain
        const NODE: Property = { id: 'GraphNode', type: TYPE };
        const EDGE: Property = { id: 'GraphEdge', type: TYPE };
        const LOCATION_NODE: Property = { id: 'LocationNode', type: NODE };
        const ROUTE_EDGE: Property = { id: 'RouteEdge', type: EDGE };

        expect(LOCATION_NODE.type).toBe(NODE);
        expect(ROUTE_EDGE.type).toBe(EDGE);

        // Can check type hierarchy
        const city: Property = { id: 'paris', type: LOCATION_NODE };
        expect(city.type.type).toBe(NODE);
    });

    test('findByType works with custom types', () => {
        const FIELD: Property = { id: 'Field', type: TYPE };
        const STRING_FIELD: Property = { id: 'StringField', type: FIELD };
        const NUMBER_FIELD: Property = { id: 'NumberField', type: FIELD };

        const form: Property = {
            id: 'form',
            type: PROPERTY,
            children: {
                name: { id: 'name', type: STRING_FIELD, value: '' },
                age: { id: 'age', type: NUMBER_FIELD, value: 0 },
                email: { id: 'email', type: STRING_FIELD, value: '' },
            },
        };

        const node = PropertyNode.create(form);
        const stringFields = node.findByType('StringField');
        const numberFields = node.findByType('NumberField');

        expect(stringFields.length).toBe(2);
        expect(numberFields.length).toBe(1);
    });
});

// ============================================================================
// PRINCIPLE 5: CONSTRAINTS AS PROPERTIES
// ============================================================================

describe('Principle: Constraints are Properties', () => {
    test('Constraints have type CONSTRAINT', () => {
        const required: Property = {
            id: 'required',
            type: CONSTRAINT,
            value: op('isNotBlank', ref('self.value')),
        };

        expect(isConstraint(required)).toBe(true);
        expect(required.type).toBe(CONSTRAINT);
    });

    test('Constraint messages are in metadata', () => {
        const required: Property = {
            id: 'required',
            type: CONSTRAINT,
            value: op('isNotBlank', ref('self.value')),
            metadata: {
                message: { id: 'message', type: LIT, value: 'This field is required' },
            },
        };

        expect(required.metadata?.message?.value).toBe('This field is required');
    });

    test('Constraints can be evaluated', async () => {
        const registry = createRegistry();
        registry.register('isNotBlank', async (args, ctx) => {
            const val = await evalArg(args[0]!, ctx);
            return val !== null && val !== undefined && String(val).trim() !== '';
        });

        const field: Property = {
            id: 'name',
            type: PROPERTY,
            value: '',
            constraints: {
                required: {
                    id: 'required',
                    type: CONSTRAINT,
                    value: op('isNotBlank', ref('self.value')),
                    metadata: {
                        message: { id: 'message', type: LIT, value: 'Name is required' },
                    },
                },
            },
        };

        const node = PropertyNode.create(field, registry);
        const result = await node.validate();

        expect(result.valid).toBe(false);
        expect(result.errors.required).toBe('Name is required');
    });

    test('Cross-field constraints work', async () => {
        const registry = createRegistry();
        registry.register('eq', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return a === b;
        });

        const form: Property = {
            id: 'form',
            type: PROPERTY,
            children: {
                password: { id: 'password', type: PROPERTY, value: 'secret123' },
                confirmPassword: {
                    id: 'confirmPassword',
                    type: PROPERTY,
                    value: 'secret456',
                    constraints: {
                        match: {
                            id: 'match',
                            type: CONSTRAINT,
                            value: op('eq', ref('self.value'), ref('parent.password.value')),
                            metadata: {
                                message: { id: 'message', type: LIT, value: 'Passwords must match' },
                            },
                        },
                    },
                },
            },
        };

        const node = PropertyNode.create(form, registry);
        const confirmNode = node.child('confirmPassword')!;
        const result = await confirmNode.validate();

        expect(result.valid).toBe(false);
        expect(result.errors.match).toBe('Passwords must match');
    });

    test('Parameterized constraint factories', async () => {
        const registry = createRegistry();
        registry.register('gte', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) >= (b as number);
        });
        registry.register('strlen', async (args, ctx) => {
            const val = await evalArg(args[0]!, ctx);
            return String(val).length;
        });

        // Factory for min length constraint
        const minLength = (n: number, message?: string): Property => ({
            id: 'minLength',
            type: CONSTRAINT,
            value: op('gte', op('strlen', ref('self.value')), lit(n)),
            metadata: {
                message: { id: 'message', type: LIT, value: message || `Minimum ${n} characters` },
            },
        });

        const field: Property = {
            id: 'password',
            type: PROPERTY,
            value: 'abc',
            constraints: {
                minLength: minLength(8, 'Password must be at least 8 characters'),
            },
        };

        const node = PropertyNode.create(field, registry);
        const result = await node.validate();

        expect(result.valid).toBe(false);
        expect(result.errors.minLength).toBe('Password must be at least 8 characters');
    });
});

// ============================================================================
// PATTERN: GRAPH MODELING
// ============================================================================

describe('Pattern: Graph Modeling', () => {
    const NODE: Property = { id: 'GraphNode', type: TYPE };
    const EDGE: Property = { id: 'GraphEdge', type: TYPE };

    test('Nodes are children, edges reference nodes via metadata', () => {
        const graph: Property = {
            id: 'network',
            type: PROPERTY,
            children: {
                nodes: {
                    id: 'nodes',
                    type: PROPERTY,
                    children: {
                        nodeA: {
                            id: 'nodeA',
                            type: NODE,
                            metadata: {
                                label: { id: 'label', type: LIT, value: 'Node A' },
                            },
                        },
                        nodeB: {
                            id: 'nodeB',
                            type: NODE,
                            metadata: {
                                label: { id: 'label', type: LIT, value: 'Node B' },
                            },
                        },
                    },
                },
                edges: {
                    id: 'edges',
                    type: PROPERTY,
                    children: {
                        edge1: {
                            id: 'edge1',
                            type: EDGE,
                            metadata: {
                                from: { id: 'from', type: REF, value: ['root', 'nodes', 'nodeA'] },
                                to: { id: 'to', type: REF, value: ['root', 'nodes', 'nodeB'] },
                                weight: { id: 'weight', type: LIT, value: 5 },
                            },
                        },
                    },
                },
            },
        };

        const root = PropertyNode.create(graph);

        // Nodes are in children
        const nodes = root.get('nodes')!;
        expect(nodes.childKeys()).toContain('nodeA');
        expect(nodes.childKeys()).toContain('nodeB');

        // Edge references are in metadata
        const edge = root.get('edges.edge1')!;
        expect(edge.hasMetadata('from')).toBe(true);
        expect(edge.hasMetadata('to')).toBe(true);
        expect(edge.getRawMetadata('weight')?.value).toBe(5);
    });

    test('Graph can be traversed', () => {
        const graph: Property = {
            id: 'tree',
            type: PROPERTY,
            children: {
                root: {
                    id: 'root',
                    type: NODE,
                    children: {
                        child1: { id: 'child1', type: NODE },
                        child2: {
                            id: 'child2',
                            type: NODE,
                            children: {
                                grandchild: { id: 'grandchild', type: NODE },
                            },
                        },
                    },
                },
            },
        };

        const node = PropertyNode.create(graph);
        const allNodes = node.findByType('GraphNode');
        expect(allNodes.length).toBe(4);
    });
});

// ============================================================================
// PATTERN: STATE MACHINE
// ============================================================================

describe('Pattern: State Machine', () => {
    const STATE: Property = { id: 'State', type: TYPE };
    const TRANSITION: Property = { id: 'Transition', type: TYPE };

    test('States are children, current state is in metadata', () => {
        const machine: Property = {
            id: 'orderStatus',
            type: PROPERTY,
            metadata: {
                initial: { id: 'initial', type: LIT, value: 'pending' },
                current: { id: 'current', type: LIT, value: 'pending' },
            },
            children: {
                states: {
                    id: 'states',
                    type: PROPERTY,
                    children: {
                        pending: {
                            id: 'pending',
                            type: STATE,
                            metadata: {
                                label: { id: 'label', type: LIT, value: 'Pending' },
                            },
                        },
                        shipped: {
                            id: 'shipped',
                            type: STATE,
                            metadata: {
                                label: { id: 'label', type: LIT, value: 'Shipped' },
                            },
                        },
                        delivered: {
                            id: 'delivered',
                            type: STATE,
                            metadata: {
                                label: { id: 'label', type: LIT, value: 'Delivered' },
                                final: { id: 'final', type: LIT, value: true },
                            },
                        },
                    },
                },
                transitions: {
                    id: 'transitions',
                    type: PROPERTY,
                    children: {
                        ship: {
                            id: 'ship',
                            type: TRANSITION,
                            metadata: {
                                event: { id: 'event', type: LIT, value: 'ship' },
                                from: { id: 'from', type: REF, value: ['root', 'states', 'pending'] },
                                to: { id: 'to', type: REF, value: ['root', 'states', 'shipped'] },
                            },
                        },
                        deliver: {
                            id: 'deliver',
                            type: TRANSITION,
                            metadata: {
                                event: { id: 'event', type: LIT, value: 'deliver' },
                                from: { id: 'from', type: REF, value: ['root', 'states', 'shipped'] },
                                to: { id: 'to', type: REF, value: ['root', 'states', 'delivered'] },
                            },
                        },
                    },
                },
            },
        };

        const node = PropertyNode.create(machine);

        // States are structural children
        const states = node.findByType('State');
        expect(states.length).toBe(3);

        // Current state is in metadata
        expect(node.hasMetadata('current')).toBe(true);
        expect(node.getRawMetadata('current')?.value).toBe('pending');

        // Transitions reference states via metadata
        const transitions = node.findByType('Transition');
        expect(transitions.length).toBe(2);
        expect(transitions[0]?.hasMetadata('from')).toBe(true);
        expect(transitions[0]?.hasMetadata('to')).toBe(true);
    });
});

// ============================================================================
// PATTERN: FORM WITH VALIDATION
// ============================================================================

describe('Pattern: Form with Validation', () => {
    test('Complete form structure follows all principles', async () => {
        const registry = createRegistry();

        // Register operators
        registry.register('isNotBlank', async (args, ctx) => {
            const val = await evalArg(args[0]!, ctx);
            return val !== null && val !== undefined && String(val).trim() !== '';
        });
        registry.register('isEmail', async (args, ctx) => {
            const val = await evalArg(args[0]!, ctx);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val));
        });
        registry.register('gte', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) >= (b as number);
        });
        registry.register('lte', async (args, ctx) => {
            const [a, b] = await evalArgs(args, ctx);
            return (a as number) <= (b as number);
        });
        registry.register('and', async (args, ctx) => {
            for (const arg of args) {
                const val = await evalArg(arg, ctx);
                if (!val) return false;
            }
            return true;
        });

        // Type definitions (all Properties!)
        const FIELD: Property = { id: 'Field', type: TYPE };
        const STRING_FIELD: Property = { id: 'StringField', type: FIELD };
        const NUMBER_FIELD: Property = { id: 'NumberField', type: FIELD };

        // Form definition
        const form: Property = {
            id: 'userForm',
            type: PROPERTY,
            metadata: {
                title: { id: 'title', type: LIT, value: 'User Registration' },
                submitLabel: { id: 'submitLabel', type: LIT, value: 'Register' },
            },
            children: {
                name: {
                    id: 'name',
                    type: STRING_FIELD,
                    value: '',
                    defaultValue: '',
                    metadata: {
                        label: { id: 'label', type: LIT, value: 'Full Name' },
                        placeholder: { id: 'placeholder', type: LIT, value: 'Enter your name' },
                    },
                    constraints: {
                        required: {
                            id: 'required',
                            type: CONSTRAINT,
                            value: op('isNotBlank', ref('self.value')),
                            metadata: {
                                message: { id: 'message', type: LIT, value: 'Name is required' },
                            },
                        },
                    },
                },
                email: {
                    id: 'email',
                    type: STRING_FIELD,
                    value: '',
                    metadata: {
                        label: { id: 'label', type: LIT, value: 'Email' },
                        placeholder: { id: 'placeholder', type: LIT, value: 'user@example.com' },
                    },
                    constraints: {
                        required: {
                            id: 'required',
                            type: CONSTRAINT,
                            value: op('isNotBlank', ref('self.value')),
                            metadata: {
                                message: { id: 'message', type: LIT, value: 'Email is required' },
                            },
                        },
                        format: {
                            id: 'format',
                            type: CONSTRAINT,
                            value: op('isEmail', ref('self.value')),
                            metadata: {
                                message: { id: 'message', type: LIT, value: 'Invalid email format' },
                            },
                        },
                    },
                },
                age: {
                    id: 'age',
                    type: NUMBER_FIELD,
                    value: 0,
                    defaultValue: 0,
                    metadata: {
                        label: { id: 'label', type: LIT, value: 'Age' },
                        min: { id: 'min', type: LIT, value: 18 },
                        max: { id: 'max', type: LIT, value: 120 },
                    },
                    constraints: {
                        range: {
                            id: 'range',
                            type: CONSTRAINT,
                            value: op('and',
                                op('gte', ref('self.value'), lit(18)),
                                op('lte', ref('self.value'), lit(120))
                            ),
                            metadata: {
                                message: { id: 'message', type: LIT, value: 'Age must be between 18 and 120' },
                            },
                        },
                    },
                },
            },
        };

        const node = PropertyNode.create(form, registry);

        // Test structure
        expect(node.hasMetadata('title')).toBe(true);
        expect(node.childKeys()).toEqual(['name', 'email', 'age']);

        // Test field metadata
        const nameField = node.child('name')!;
        expect(nameField.hasMetadata('label')).toBe(true);
        expect(nameField.hasConstraints()).toBe(true);

        // Test validation with invalid data
        const result = await node.validateDeep();
        expect(result.valid).toBe(false);
        expect(result.errors['name']).toBeDefined();
        expect(result.errors['email']).toBeDefined();
        expect(result.errors['age']).toBeDefined();

        // Update with valid data
        node.setValue('John Doe', { path: 'name', silent: true });
        node.setValue('john@example.com', { path: 'email', silent: true });
        node.setValue(25, { path: 'age', silent: true });

        const validResult = await node.validateDeep();
        expect(validResult.valid).toBe(true);
    });
});

// ============================================================================
// SERIALIZATION PRESERVES ALL IS PROPERTY
// ============================================================================

describe('Serialization Preserves All is Property', () => {
    test('toJSON and fromJSON preserve structure', () => {
        const form: Property = {
            id: 'form',
            type: PROPERTY,
            value: 'test',
            defaultValue: 'default',
            metadata: {
                label: { id: 'label', type: LIT, value: 'My Form' },
            },
            constraints: {
                valid: { id: 'valid', type: CONSTRAINT },
            },
            children: {
                field: { id: 'field', type: PROPERTY, value: 'value' },
            },
        };

        const node = PropertyNode.create(form);
        const json = node.toJSON();
        const restored = PropertyNode.fromJSON(json);

        expect(restored.id).toBe('form');
        expect(restored.getRawValue()).toBe('test');
        expect(restored.getDefaultValue()).toBe('default');
        expect(restored.hasMetadata('label')).toBe(true);
        expect(restored.hasConstraints('valid')).toBe(true);
        expect(restored.hasChildren()).toBe(true);
    });

    test('clone preserves complete structure', () => {
        const original: Property = {
            id: 'original',
            type: PROPERTY,
            children: {
                child: {
                    id: 'child',
                    type: PROPERTY,
                    value: 'original-value',
                    metadata: {
                        meta: { id: 'meta', type: LIT, value: 'meta-value' },
                    },
                },
            },
        };

        const node = PropertyNode.create(original);
        const cloned = node.clone();

        // Modify cloned
        cloned.child('child')?.setValue('cloned-value', { silent: true });

        // Original unchanged
        expect(node.child('child')?.getRawValue()).toBe('original-value');
        expect(cloned.child('child')?.getRawValue()).toBe('cloned-value');
    });
});
