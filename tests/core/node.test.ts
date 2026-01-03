import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { TYPE, STRING, NUMBER } from '../../src/builtin/types';
import { lit } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

describe('PropertyNode', () => {
    describe('Construction', () => {
        it('should create a node from a property', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: 'hello'
            });

            expect(node.id).toBe('test');
            expect(node.type).toBe(STRING);
            expect(node.value).toBe('hello');
        });

        it('should create children as PropertyNodes', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: 'John' },
                    age: { id: 'age', type: NUMBER, value: 30 }
                }
            });

            expect(node.children.name).toBeInstanceOf(PropertyNode);
            expect(node.children.age).toBeInstanceOf(PropertyNode);
            expect(node.children.name.id).toBe('name');
            expect(node.children.age.id).toBe('age');
        });

        it('should set parent references', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: 'John' }
                }
            });

            expect(node.children.name.parent).toBe(node);
        });

        it('should preserve defaultValue', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: 'current',
                defaultValue: 'default'
            });

            expect(node.defaultValue).toBe('default');
        });
    });

    describe('Navigation', () => {
        it('should get child by key', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: 'John' }
                }
            });

            const child = node.child('name');
            expect(child).toBeDefined();
            expect(child?.id).toBe('name');
        });

        it('should get root', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    section: {
                        id: 'section',
                        type: TYPE,
                        children: {
                            field: { id: 'field', type: STRING, value: '' }
                        }
                    }
                }
            });

            const field = root.children.section.children.field;
            expect(field.root).toBe(root);
        });

        it('should get by path', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    section: {
                        id: 'section',
                        type: TYPE,
                        children: {
                            field: { id: 'field', type: STRING, value: 'deep' }
                        }
                    }
                }
            });

            const field = root.getByPath(['section', 'field']);
            expect(field).toBeDefined();
            expect(field?.id).toBe('field');
            expect(field?.value).toBe('deep');
        });

        it('should return undefined for invalid path', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: '' }
                }
            });

            const result = root.getByPath(['nonexistent', 'path']);
            expect(result).toBeUndefined();
        });

        it('should get path from node', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    section: {
                        id: 'section',
                        type: TYPE,
                        children: {
                            field: { id: 'field', type: STRING, value: '' }
                        }
                    }
                }
            });

            const field = root.children.section.children.field;
            expect(field.path()).toEqual(['section', 'field']);
        });

        it('should get descendants', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    a: { id: 'a', type: STRING, value: '' },
                    b: { 
                        id: 'b', 
                        type: TYPE,
                        children: {
                            c: { id: 'c', type: STRING, value: '' }
                        }
                    }
                }
            });

            const descendants = root.descendants();
            expect(descendants).toHaveLength(3);
            expect(descendants.map(d => d.id)).toContain('a');
            expect(descendants.map(d => d.id)).toContain('b');
            expect(descendants.map(d => d.id)).toContain('c');
        });

        it('should get ancestors', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    section: {
                        id: 'section',
                        type: TYPE,
                        children: {
                            field: { id: 'field', type: STRING, value: '' }
                        }
                    }
                }
            });

            const field = root.children.section.children.field;
            const ancestors = field.ancestors();
            
            expect(ancestors).toHaveLength(2);
            expect(ancestors[0].id).toBe('section');
            expect(ancestors[1].id).toBe('root');
        });

        it('should get siblings', () => {
            const root = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    a: { id: 'a', type: STRING, value: '' },
                    b: { id: 'b', type: STRING, value: '' },
                    c: { id: 'c', type: STRING, value: '' }
                }
            });

            const siblings = root.children.b.siblings();
            expect(siblings).toHaveLength(2);
            expect(siblings.map(s => s.id)).toContain('a');
            expect(siblings.map(s => s.id)).toContain('c');
        });
    });

    describe('Value Operations', () => {
        it('should get value', async () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: 'hello'
            });
            node.setRegistry(defaultRegistry);

            const value = await node.getValue();
            expect(value).toBe('hello');
        });

        it('should get nested value by path', async () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: 'John' }
                }
            });
            node.setRegistry(defaultRegistry);

            const value = await node.getValue(['name']);
            expect(value).toBe('John');
        });

        it('should set value', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: ''
            });

            node.setValue('new value');
            expect(node.value).toBe('new value');
        });

        it('should set nested value by path', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: '' }
                }
            });

            node.setValue('Jane', ['name']);
            expect(node.children.name.value).toBe('Jane');
        });
    });

    describe('Tree Operations', () => {
        it('should add child', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {}
            });

            const child = node.addChild('email', {
                id: 'email',
                type: STRING,
                value: ''
            });

            expect(node.children.email).toBe(child);
            expect(child.parent).toBe(node);
        });

        it('should remove child', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: '' }
                }
            });

            node.removeChild('name');
            expect(node.children.name).toBeUndefined();
        });
    });

    describe('Serialization', () => {
        it('should convert to plain property', () => {
            const node = new PropertyNode({
                id: 'root',
                type: TYPE,
                value: 'test',
                children: {
                    name: { id: 'name', type: STRING, value: 'John' }
                }
            });

            const plain = node.toProperty();

            expect(plain.id).toBe('root');
            expect(plain.type).toBe(TYPE);
            expect(plain.value).toBe('test');
            expect(plain.children?.name?.id).toBe('name');
        });

        it('should convert to JSON', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: 'hello'
            });

            const json = node.toJSON();
            expect(json).toHaveProperty('id', 'test');
        });

        it('should create from property', () => {
            const prop = {
                id: 'test',
                type: STRING,
                value: 'hello'
            };

            const node = PropertyNode.from(prop);
            expect(node).toBeInstanceOf(PropertyNode);
            expect(node.id).toBe('test');
        });

        it('should serialize defaultValue', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: 'current',
                defaultValue: 'default'
            });

            const plain = node.toProperty();
            expect(plain.defaultValue).toBe('default');
        });
    });

    describe('Metadata Operations', () => {
        it('should get metadata', async () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: '',
                metadata: {
                    label: { id: 'label', type: STRING, value: 'My Label' }
                }
            });
            node.setRegistry(defaultRegistry);

            const label = await node.getMetadata('label');
            expect(label).toBe('My Label');
        });

        it('should set metadata', () => {
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: ''
            });

            node.setMetadata('label', { id: 'label', type: STRING, value: 'New Label' });
            expect(node.metadata?.label?.value).toBe('New Label');
        });
    });

    describe('Constraint Operations', () => {
        it('should add constraint', () => {
            const CONSTRAINT = { id: 'Constraint', type: TYPE };
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: ''
            });

            node.addConstraint({ id: 'required', type: CONSTRAINT, value: true });
            expect(node.constraints?.required).toBeDefined();
        });

        it('should remove constraint', () => {
            const CONSTRAINT = { id: 'Constraint', type: TYPE };
            const node = new PropertyNode({
                id: 'test',
                type: STRING,
                value: '',
                constraints: {
                    required: { id: 'required', type: CONSTRAINT, value: true }
                }
            });

            node.removeConstraint('required');
            expect(node.constraints?.required).toBeUndefined();
        });
    });

    describe('Reset Operations', () => {
        describe('getDefaultValue / hasDefaultValue', () => {
            it('should return default value from native field', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current',
                    defaultValue: 'default'
                });

                expect(node.hasDefaultValue()).toBe(true);
                expect(node.getDefaultValue()).toBe('default');
            });

            it('should return undefined when no default value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current'
                });

                expect(node.hasDefaultValue()).toBe(false);
                expect(node.getDefaultValue()).toBeUndefined();
            });
        });

        describe('setDefaultValue', () => {
            it('should set default value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current'
                });

                node.setDefaultValue('new-default');
                expect(node.defaultValue).toBe('new-default');
                expect(node.getDefaultValue()).toBe('new-default');
            });

            it('should set default value as expression', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current'
                });

                const expr = lit('computed-default');
                node.setDefaultValueExpr(expr);
                expect(node.defaultValue).toBe(expr);
            });
        });

        describe('resetNode', () => {
            it('should reset to default value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'modified',
                    defaultValue: 'default'
                });

                node.resetNode();
                expect(node.value).toBe('default');
            });

            it('should reset to undefined when no default', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'modified'
                });

                node.resetNode();
                expect(node.value).toBeUndefined();
            });

            it('should not affect children', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    value: 'modified',
                    defaultValue: '',
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'child-modified',
                            defaultValue: 'child-default'
                        }
                    }
                });

                node.resetNode();
                expect(node.value).toBe('');
                expect(node.children.name.value).toBe('child-modified');
            });
        });

        describe('resetToValue', () => {
            it('should reset to a specific value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'old'
                });

                node.resetToValue('specific');
                expect(node.value).toBe('specific');
            });
        });

        describe('resetChildren', () => {
            it('should reset only children, not self', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    value: 'root-value',
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'modified',
                            defaultValue: ''
                        },
                        age: { 
                            id: 'age', 
                            type: NUMBER, 
                            value: 99,
                            defaultValue: 0
                        }
                    }
                });

                node.resetChildren();
                expect(node.value).toBe('root-value'); // unchanged
                expect(node.children.name.value).toBe('');
                expect(node.children.age.value).toBe(0);
            });
        });

        describe('resetDeep / resetFromNode', () => {
            it('should reset node and all descendants', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    value: 'root-modified',
                    defaultValue: 'root-default',
                    children: {
                        section: {
                            id: 'section',
                            type: TYPE,
                            value: 'section-modified',
                            defaultValue: 'section-default',
                            children: {
                                field: { 
                                    id: 'field', 
                                    type: STRING, 
                                    value: 'field-modified',
                                    defaultValue: 'field-default'
                                }
                            }
                        }
                    }
                });

                node.resetDeep();
                expect(node.value).toBe('root-default');
                expect(node.children.section.value).toBe('section-default');
                expect(node.children.section.children.field.value).toBe('field-default');
            });

            it('resetFromNode should be alias for resetDeep', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'modified',
                    defaultValue: 'default'
                });

                node.resetFromNode();
                expect(node.value).toBe('default');
            });
        });

        describe('resetAll', () => {
            it('should reset entire tree from root', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    value: 'root-modified',
                    defaultValue: 'root-default',
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'name-modified',
                            defaultValue: ''
                        }
                    }
                });

                // Call resetAll from a child node
                const child = root.children.name;
                child.resetAll();

                expect(root.value).toBe('root-default');
                expect(root.children.name.value).toBe('');
            });
        });

        describe('resetByPath', () => {
            it('should reset node at path', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        section: {
                            id: 'section',
                            type: TYPE,
                            children: {
                                field: { 
                                    id: 'field', 
                                    type: STRING, 
                                    value: 'modified',
                                    defaultValue: 'default'
                                }
                            }
                        }
                    }
                });

                const result = root.resetByPath(['section', 'field']);
                expect(result).toBe(true);
                expect(root.children.section.children.field.value).toBe('default');
            });

            it('should return false for invalid path', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {}
                });

                const result = root.resetByPath(['nonexistent']);
                expect(result).toBe(false);
            });

            it('should reset deeply when deep=true', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        section: {
                            id: 'section',
                            type: TYPE,
                            value: 'section-modified',
                            defaultValue: 'section-default',
                            children: {
                                field: { 
                                    id: 'field', 
                                    type: STRING, 
                                    value: 'field-modified',
                                    defaultValue: 'field-default'
                                }
                            }
                        }
                    }
                });

                root.resetByPath(['section'], true);
                expect(root.children.section.value).toBe('section-default');
                expect(root.children.section.children.field.value).toBe('field-default');
            });
        });

        describe('resetIf', () => {
            it('should reset nodes matching predicate', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'modified',
                            defaultValue: ''
                        },
                        age: { 
                            id: 'age', 
                            type: NUMBER, 
                            value: 99,
                            defaultValue: 0
                        }
                    }
                });

                // Reset only STRING type nodes
                root.resetIf(node => node.type?.id === 'String');
                expect(root.children.name.value).toBe('');
                expect(root.children.age.value).toBe(99); // unchanged
            });
        });

        describe('resetByType', () => {
            it('should reset all nodes of specific type', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'modified',
                            defaultValue: ''
                        },
                        email: { 
                            id: 'email', 
                            type: STRING, 
                            value: 'test@test.com',
                            defaultValue: ''
                        },
                        age: { 
                            id: 'age', 
                            type: NUMBER, 
                            value: 99,
                            defaultValue: 0
                        }
                    }
                });

                root.resetByType('String');
                expect(root.children.name.value).toBe('');
                expect(root.children.email.value).toBe('');
                expect(root.children.age.value).toBe(99); // unchanged
            });
        });

        describe('resetModified', () => {
            it('should reset only modified nodes with defaults', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { 
                            id: 'name', 
                            type: STRING, 
                            value: 'modified', // modified
                            defaultValue: ''
                        },
                        email: { 
                            id: 'email', 
                            type: STRING, 
                            value: '', // not modified (matches default)
                            defaultValue: ''
                        },
                        age: { 
                            id: 'age', 
                            type: NUMBER, 
                            value: 99 // no default defined
                        }
                    }
                });

                root.resetModified();
                expect(root.children.name.value).toBe('');
                expect(root.children.email.value).toBe('');
                expect(root.children.age.value).toBe(99); // unchanged
            });
        });

        describe('clear / clearAll', () => {
            it('should clear single node value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'something'
                });

                node.clear();
                expect(node.value).toBeUndefined();
            });

            it('should clear all values in tree', () => {
                const root = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    value: 'root-value',
                    children: {
                        name: { id: 'name', type: STRING, value: 'John' },
                        section: {
                            id: 'section',
                            type: TYPE,
                            value: 'section-value',
                            children: {
                                field: { id: 'field', type: STRING, value: 'nested' }
                            }
                        }
                    }
                });

                root.clearAll();
                expect(root.value).toBeUndefined();
                expect(root.children.name.value).toBeUndefined();
                expect(root.children.section.value).toBeUndefined();
                expect(root.children.section.children.field.value).toBeUndefined();
            });
        });

        describe('getDefaultValueEvaluated', () => {
            it('should evaluate expression default value', async () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current',
                    defaultValue: lit('evaluated-default')
                });
                node.setRegistry(defaultRegistry);

                const evaluated = await node.getDefaultValueEvaluated();
                expect(evaluated).toBe('evaluated-default');
            });

            it('should return raw value if not expression', async () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'current',
                    defaultValue: 'raw-default'
                });
                node.setRegistry(defaultRegistry);

                const evaluated = await node.getDefaultValueEvaluated();
                expect(evaluated).toBe('raw-default');
            });
        });
    });

    describe('Snapshot Operations', () => {
        describe('snapshot', () => {
            it('should return nested key-value object', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John' },
                        email: { id: 'email', type: STRING, value: 'john@test.com' }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshot();
                expect(result).toEqual({
                    name: 'John',
                    email: 'john@test.com'
                });
            });

            it('should handle nested children', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'John' },
                                age: { id: 'age', type: NUMBER, value: 30 }
                            }
                        },
                        message: { id: 'message', type: STRING, value: 'Hello' }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshot();
                expect(result).toEqual({
                    personal: {
                        name: 'John',
                        age: 30
                    },
                    message: 'Hello'
                });
            });

            it('should evaluate expressions', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        greeting: { id: 'greeting', type: STRING, value: lit('Hello World') }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshot();
                expect(result).toEqual({
                    greeting: 'Hello World'
                });
            });

            it('should return empty object for no children', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshot();
                expect(result).toEqual({});
            });

            it('should handle undefined values', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: undefined },
                        email: { id: 'email', type: STRING, value: 'test@test.com' }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshot();
                expect(result).toEqual({
                    name: undefined,
                    email: 'test@test.com'
                });
            });

            it('should throw if registry not set', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John' }
                    }
                });

                await expect(node.snapshot()).rejects.toThrow('Registry not set');
            });
        });

        describe('snapshotFlat', () => {
            it('should return flat key-value object with dot notation', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'John' },
                                email: { id: 'email', type: STRING, value: 'john@test.com' }
                            }
                        },
                        message: { id: 'message', type: STRING, value: 'Hello' }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshotFlat();
                expect(result).toEqual({
                    'personal.name': 'John',
                    'personal.email': 'john@test.com',
                    'message': 'Hello'
                });
            });

            it('should handle deeply nested children', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        section: {
                            id: 'section',
                            type: TYPE,
                            children: {
                                subsection: {
                                    id: 'subsection',
                                    type: TYPE,
                                    children: {
                                        field: { id: 'field', type: STRING, value: 'deep' }
                                    }
                                }
                            }
                        }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshotFlat();
                expect(result).toEqual({
                    'section.subsection.field': 'deep'
                });
            });

            it('should return simple keys for flat children', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John' },
                        age: { id: 'age', type: NUMBER, value: 30 }
                    }
                });
                node.setRegistry(defaultRegistry);

                const result = await node.snapshotFlat();
                expect(result).toEqual({
                    'name': 'John',
                    'age': 30
                });
            });

            it('should throw if registry not set', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John' }
                    }
                });

                await expect(node.snapshotFlat()).rejects.toThrow('Registry not set');
            });
        });

        describe('setFromSnapshot', () => {
            it('should set values from nested object', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: '' },
                        email: { id: 'email', type: STRING, value: '' }
                    }
                });

                node.setFromSnapshot({
                    name: 'Jane',
                    email: 'jane@test.com'
                });

                expect(node.children.name.value).toBe('Jane');
                expect(node.children.email.value).toBe('jane@test.com');
            });

            it('should handle nested children', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: '' },
                                age: { id: 'age', type: NUMBER, value: 0 }
                            }
                        },
                        message: { id: 'message', type: STRING, value: '' }
                    }
                });

                node.setFromSnapshot({
                    personal: {
                        name: 'Jane',
                        age: 25
                    },
                    message: 'Updated'
                });

                expect(node.children.personal.children.name.value).toBe('Jane');
                expect(node.children.personal.children.age.value).toBe(25);
                expect(node.children.message.value).toBe('Updated');
            });

            it('should ignore unknown keys', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'Original' }
                    }
                });

                node.setFromSnapshot({
                    name: 'Updated',
                    unknown: 'ignored'
                });

                expect(node.children.name.value).toBe('Updated');
                expect(node.children.unknown).toBeUndefined();
            });

            it('should handle arrays as leaf values', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        tags: { id: 'tags', type: TYPE, value: [] }
                    }
                });

                node.setFromSnapshot({
                    tags: ['a', 'b', 'c']
                });

                expect(node.children.tags.value).toEqual(['a', 'b', 'c']);
            });
        });

        describe('setFromSnapshotFlat', () => {
            it('should set values from flat object with dot notation', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: '' },
                                email: { id: 'email', type: STRING, value: '' }
                            }
                        },
                        message: { id: 'message', type: STRING, value: '' }
                    }
                });

                node.setFromSnapshotFlat({
                    'personal.name': 'Jane',
                    'personal.email': 'jane@test.com',
                    'message': 'Hello'
                });

                expect(node.children.personal.children.name.value).toBe('Jane');
                expect(node.children.personal.children.email.value).toBe('jane@test.com');
                expect(node.children.message.value).toBe('Hello');
            });

            it('should ignore invalid paths', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'Original' }
                    }
                });

                node.setFromSnapshotFlat({
                    'name': 'Updated',
                    'invalid.path': 'ignored'
                });

                expect(node.children.name.value).toBe('Updated');
            });
        });

        describe('round-trip', () => {
            it('should round-trip nested snapshot', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'John' },
                                age: { id: 'age', type: NUMBER, value: 30 }
                            }
                        },
                        message: { id: 'message', type: STRING, value: 'Hello' }
                    }
                });
                node.setRegistry(defaultRegistry);

                const original = await node.snapshot();

                // Clear all values
                node.clearAll();

                // Restore from snapshot
                node.setFromSnapshot(original);

                const restored = await node.snapshot();
                expect(restored).toEqual(original);
            });

            it('should round-trip flat snapshot', async () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        personal: {
                            id: 'personal',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'John' },
                                email: { id: 'email', type: STRING, value: 'john@test.com' }
                            }
                        }
                    }
                });
                node.setRegistry(defaultRegistry);

                const original = await node.snapshotFlat();

                // Clear all values
                node.clearAll();

                // Restore from flat snapshot
                node.setFromSnapshotFlat(original as Record<string, unknown>);

                const restored = await node.snapshotFlat();
                expect(restored).toEqual(original);
            });
        });
    });

    // ========================================================================
    // DIRTY CHECK TESTS
    // ========================================================================

    describe('Dirty Check', () => {
        describe('isDirtyNode()', () => {
            it('should return false if no default value', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'hello'
                });
                expect(node.isDirtyNode()).toBe(false);
            });

            it('should return false if value equals default', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'hello',
                    defaultValue: 'hello'
                });
                expect(node.isDirtyNode()).toBe(false);
            });

            it('should return true if value differs from default', () => {
                const node = new PropertyNode({
                    id: 'test',
                    type: STRING,
                    value: 'world',
                    defaultValue: 'hello'
                });
                expect(node.isDirtyNode()).toBe(true);
            });
        });

        describe('isDirty()', () => {
            it('should return false if no nodes are modified', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John', defaultValue: 'John' },
                        email: { id: 'email', type: STRING, value: 'john@test.com', defaultValue: 'john@test.com' }
                    }
                });
                expect(node.isDirty()).toBe(false);
            });

            it('should return true if a child is modified', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'Jane', defaultValue: 'John' },
                        email: { id: 'email', type: STRING, value: 'john@test.com', defaultValue: 'john@test.com' }
                    }
                });
                expect(node.isDirty()).toBe(true);
            });

            it('should return true if a deep child is modified', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        user: {
                            id: 'user',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'Modified', defaultValue: 'Original' }
                            }
                        }
                    }
                });
                expect(node.isDirty()).toBe(true);
            });
        });

        describe('getModifiedFields()', () => {
            it('should return empty array if no modifications', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'John', defaultValue: 'John' }
                    }
                });
                expect(node.getModifiedFields()).toEqual([]);
            });

            it('should return paths of modified fields', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING, value: 'Jane', defaultValue: 'John' },
                        email: { id: 'email', type: STRING, value: 'test@test.com', defaultValue: 'test@test.com' }
                    }
                });
                expect(node.getModifiedFields()).toEqual([['name']]);
            });

            it('should return deep paths', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        user: {
                            id: 'user',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'Modified', defaultValue: 'Original' },
                                email: { id: 'email', type: STRING, value: 'same', defaultValue: 'same' }
                            }
                        }
                    }
                });
                expect(node.getModifiedFields()).toEqual([['user', 'name']]);
            });
        });

        describe('getModifiedFieldsFlat()', () => {
            it('should return dot-notation paths', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        user: {
                            id: 'user',
                            type: TYPE,
                            children: {
                                name: { id: 'name', type: STRING, value: 'Modified', defaultValue: 'Original' }
                            }
                        }
                    }
                });
                expect(node.getModifiedFieldsFlat()).toEqual(['user.name']);
            });
        });
    });

    // ========================================================================
    // TREE STATISTICS TESTS
    // ========================================================================

    describe('Tree Statistics', () => {
        describe('countNodes()', () => {
            it('should return 1 for a single node', () => {
                const node = new PropertyNode({ id: 'root', type: TYPE });
                expect(node.countNodes()).toBe(1);
            });

            it('should count all nodes in the tree', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        a: { id: 'a', type: STRING },
                        b: {
                            id: 'b',
                            type: TYPE,
                            children: {
                                c: { id: 'c', type: STRING },
                                d: { id: 'd', type: STRING }
                            }
                        }
                    }
                });
                expect(node.countNodes()).toBe(5); // root, a, b, c, d
            });
        });

        describe('maxDepth()', () => {
            it('should return 0 for a leaf node', () => {
                const node = new PropertyNode({ id: 'root', type: TYPE });
                expect(node.maxDepth()).toBe(0);
            });

            it('should return 1 for a node with children', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        a: { id: 'a', type: STRING }
                    }
                });
                expect(node.maxDepth()).toBe(1);
            });

            it('should return correct depth for nested tree', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        level1: {
                            id: 'level1',
                            type: TYPE,
                            children: {
                                level2: {
                                    id: 'level2',
                                    type: TYPE,
                                    children: {
                                        level3: { id: 'level3', type: STRING }
                                    }
                                }
                            }
                        }
                    }
                });
                expect(node.maxDepth()).toBe(3);
            });
        });

        describe('collectIds()', () => {
            it('should collect all IDs', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING },
                        email: { id: 'email', type: STRING }
                    }
                });
                expect(node.collectIds()).toEqual(['root', 'name', 'email']);
            });
        });

        describe('hasDuplicateIds()', () => {
            it('should return false for unique IDs', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING },
                        email: { id: 'email', type: STRING }
                    }
                });
                expect(node.hasDuplicateIds()).toBe(false);
            });

            it('should return true for duplicate IDs', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'field', type: STRING },
                        email: { id: 'field', type: STRING }
                    }
                });
                expect(node.hasDuplicateIds()).toBe(true);
            });
        });

        describe('getDuplicateIds()', () => {
            it('should return empty array for unique IDs', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        name: { id: 'name', type: STRING }
                    }
                });
                expect(node.getDuplicateIds()).toEqual([]);
            });

            it('should return duplicate IDs', () => {
                const node = new PropertyNode({
                    id: 'root',
                    type: TYPE,
                    children: {
                        a: { id: 'dup', type: STRING },
                        b: { id: 'dup', type: STRING },
                        c: { id: 'unique', type: STRING }
                    }
                });
                expect(node.getDuplicateIds()).toEqual(['dup']);
            });
        });
    });
});
