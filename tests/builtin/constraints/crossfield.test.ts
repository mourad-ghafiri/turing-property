import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { EQUALS_FIELD, BEFORE_FIELD, AFTER_FIELD } from '../../../src/builtin/constraints/crossfield';
import { STRING } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (prop: Property, root: Property): EvaluationContext => ({
    current: prop,
    root,
    registry: defaultRegistry
});

describe('Cross-field Constraints', () => {
    describe('EQUALS_FIELD', () => {
        it('should pass when values are equal', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    password: {
                        id: 'password',
                        type: STRING,
                        value: 'secret123'
                    },
                    confirmPassword: {
                        id: 'confirmPassword',
                        type: STRING,
                        value: 'secret123',
                        constraints: {
                            match: EQUALS_FIELD(['root', 'children', 'password'])
                        }
                    }
                }
            };
            const confirm = root.children!.confirmPassword;
            const errors = await checkConstraints(confirm, createCtx(confirm, root));
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should fail when values are different', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    password: {
                        id: 'password',
                        type: STRING,
                        value: 'secret123'
                    },
                    confirmPassword: {
                        id: 'confirmPassword',
                        type: STRING,
                        value: 'different',
                        constraints: {
                            match: EQUALS_FIELD(['root', 'children', 'password'])
                        }
                    }
                }
            };
            const confirm = root.children!.confirmPassword;
            const errors = await checkConstraints(confirm, createCtx(confirm, root));
            expect(Object.keys(errors).length).toBeGreaterThan(0);
        });
    });

    describe('BEFORE_FIELD', () => {
        it('should pass when date is before the other field', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    endDate: {
                        id: 'endDate',
                        type: STRING,
                        value: '2024-12-31'
                    },
                    startDate: {
                        id: 'startDate',
                        type: STRING,
                        value: '2024-01-01',
                        constraints: {
                            before: BEFORE_FIELD(['root', 'children', 'endDate'])
                        }
                    }
                }
            };
            const startDate = root.children!.startDate;
            const errors = await checkConstraints(startDate, createCtx(startDate, root));
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should fail when date is after the other field', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    endDate: {
                        id: 'endDate',
                        type: STRING,
                        value: '2024-01-01'
                    },
                    startDate: {
                        id: 'startDate',
                        type: STRING,
                        value: '2024-12-31',
                        constraints: {
                            before: BEFORE_FIELD(['root', 'children', 'endDate'])
                        }
                    }
                }
            };
            const startDate = root.children!.startDate;
            const errors = await checkConstraints(startDate, createCtx(startDate, root));
            expect(Object.keys(errors).length).toBeGreaterThan(0);
        });
    });

    describe('AFTER_FIELD', () => {
        it('should pass when date is after the other field', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    startDate: {
                        id: 'startDate',
                        type: STRING,
                        value: '2024-01-01'
                    },
                    endDate: {
                        id: 'endDate',
                        type: STRING,
                        value: '2024-12-31',
                        constraints: {
                            after: AFTER_FIELD(['root', 'children', 'startDate'])
                        }
                    }
                }
            };
            const endDate = root.children!.endDate;
            const errors = await checkConstraints(endDate, createCtx(endDate, root));
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should fail when date is before the other field', async () => {
            const root: Property = {
                id: 'form',
                type: STRING,
                children: {
                    startDate: {
                        id: 'startDate',
                        type: STRING,
                        value: '2024-12-31'
                    },
                    endDate: {
                        id: 'endDate',
                        type: STRING,
                        value: '2024-01-01',
                        constraints: {
                            after: AFTER_FIELD(['root', 'children', 'startDate'])
                        }
                    }
                }
            };
            const endDate = root.children!.endDate;
            const errors = await checkConstraints(endDate, createCtx(endDate, root));
            expect(Object.keys(errors).length).toBeGreaterThan(0);
        });
    });
});

