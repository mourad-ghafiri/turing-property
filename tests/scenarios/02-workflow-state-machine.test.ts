import { describe, it, expect } from 'bun:test';
import { PropertyNode } from '../../src/core/node';
import { Property } from '../../src/core/property';
import {
    TYPE, STRING, NUMBER, BOOLEAN,
    DATETIME, TIMESTAMP,
    tEnum
} from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';
import { ONE_OF, REQUIRED } from '../../src/builtin/constraints';
import { checkConstraintsDeep } from '../../src/builtin/constraints';
import { EvaluationContext } from '../../src/core/evaluate';

/**
 * SCENARIO 2: Workflow State Machine
 *
 * Demonstrates the expression evaluation engine for workflow logic:
 * - State-based computed permissions using expressions
 * - Role-based access control via expressions
 * - Workflow state transition rules as data
 * - Audit trail with proper types
 * - All business logic expressed declaratively
 */

describe('Scenario: Workflow State Machine', () => {
    function createContext(node: PropertyNode): EvaluationContext {
        return { current: node, root: node.root, registry: defaultRegistry };
    }

    // ========================================================================
    // ENUM TYPES
    // ========================================================================

    const WorkflowStateEnum = tEnum('WorkflowState', [
        'draft', 'submitted', 'in_review', 'approved', 'rejected', 'published', 'archived'
    ]);

    const RoleEnum = tEnum('Role', [
        'author', 'reviewer', 'approver', 'publisher', 'admin'
    ]);

    const ActionEnum = tEnum('Action', [
        'submit', 'start_review', 'approve', 'reject', 'request_changes', 'publish', 'archive', 'revise'
    ]);

    // State and role values for easy reference
    const States = {
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        IN_REVIEW: 'in_review',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        PUBLISHED: 'published',
        ARCHIVED: 'archived'
    } as const;

    const Roles = {
        AUTHOR: 'author',
        REVIEWER: 'reviewer',
        APPROVER: 'approver',
        PUBLISHER: 'publisher',
        ADMIN: 'admin'
    } as const;

    // ========================================================================
    // CUSTOM DOMAIN TYPES
    // ========================================================================

    const TRANSITION: Property = { id: 'Transition', type: TYPE };
    const DOCUMENT: Property = { id: 'Document', type: TYPE };
    const AUDIT_ENTRY: Property = { id: 'AuditEntry', type: TYPE };
    const WORKFLOW_CONTEXT: Property = { id: 'WorkflowContext', type: TYPE };

    // ========================================================================
    // FACTORIES WITH EXPRESSIONS
    // ========================================================================

    /**
     * Transition Rule - defines a state transition with role-based permissions
     * Uses expressions to compute whether a role is allowed
     */
    const createTransition = (
        id: string,
        from: string,
        to: string,
        action: string,
        allowedRoles: string[]
    ): Property => ({
        id,
        type: TRANSITION,
        children: {
            from: { id: 'from', type: WorkflowStateEnum, value: from },
            to: { id: 'to', type: WorkflowStateEnum, value: to },
            action: { id: 'action', type: ActionEnum, value: action },
            // Store allowed roles
            allowedRoles: {
                id: 'allowedRoles',
                type: TYPE,
                children: allowedRoles.reduce((acc, role) => ({
                    ...acc,
                    [role]: { id: role, type: RoleEnum, value: role }
                }), {} as Record<string, Property>)
            }
        }
    });

    /**
     * Workflow Configuration - all transitions defined as properties
     */
    const createWorkflowConfig = (): Property => ({
        id: 'workflowConfig',
        type: TYPE,
        children: {
            transitions: {
                id: 'transitions',
                type: TYPE,
                children: {
                    submit: createTransition('submit', States.DRAFT, States.SUBMITTED, 'submit', [Roles.AUTHOR, Roles.ADMIN]),
                    start_review: createTransition('start_review', States.SUBMITTED, States.IN_REVIEW, 'start_review', [Roles.REVIEWER, Roles.ADMIN]),
                    approve: createTransition('approve', States.IN_REVIEW, States.APPROVED, 'approve', [Roles.APPROVER, Roles.ADMIN]),
                    reject: createTransition('reject', States.IN_REVIEW, States.REJECTED, 'reject', [Roles.REVIEWER, Roles.APPROVER, Roles.ADMIN]),
                    request_changes: createTransition('request_changes', States.IN_REVIEW, States.DRAFT, 'request_changes', [Roles.REVIEWER, Roles.ADMIN]),
                    publish: createTransition('publish', States.APPROVED, States.PUBLISHED, 'publish', [Roles.PUBLISHER, Roles.ADMIN]),
                    archive: createTransition('archive', States.PUBLISHED, States.ARCHIVED, 'archive', [Roles.ADMIN]),
                    revise: createTransition('revise', States.REJECTED, States.DRAFT, 'revise', [Roles.AUTHOR, Roles.ADMIN])
                }
            },
            // Final states configuration
            finalStates: {
                id: 'finalStates',
                type: TYPE,
                children: {
                    published: { id: 'published', type: WorkflowStateEnum, value: States.PUBLISHED },
                    archived: { id: 'archived', type: WorkflowStateEnum, value: States.ARCHIVED }
                }
            },
            // Editable states
            editableStates: {
                id: 'editableStates',
                type: TYPE,
                children: {
                    draft: { id: 'draft', type: WorkflowStateEnum, value: States.DRAFT }
                }
            }
        }
    });

    /**
     * Audit Entry Factory
     */
    let auditCounter = 0;
    const createAuditEntry = (
        action: string,
        fromState: string,
        toState: string,
        userId: string,
        userRole: string,
        comment: string = ''
    ): Property => {
        auditCounter++;
        return {
            id: `audit_${auditCounter}`,
            type: AUDIT_ENTRY,
            children: {
                sequence: { id: 'sequence', type: NUMBER, value: auditCounter },
                timestamp: { id: 'timestamp', type: DATETIME, value: new Date().toISOString() },
                action: { id: 'action', type: ActionEnum, value: action },
                fromState: { id: 'fromState', type: WorkflowStateEnum, value: fromState },
                toState: { id: 'toState', type: WorkflowStateEnum, value: toState },
                userId: { id: 'userId', type: STRING, value: userId },
                userRole: { id: 'userRole', type: RoleEnum, value: userRole },
                comment: { id: 'comment', type: STRING, value: comment }
            }
        };
    };

    /**
     * Document with Computed Workflow Properties
     * Uses expressions for:
     * - isInFinalState: computed based on current state
     * - isEditable: computed based on current state
     * - daysInCurrentState: computed time
     */
    const createDocument = (
        docId: string,
        title: string,
        content: string,
        authorId: string,
        initialState: string = States.DRAFT
    ): Property => ({
        id: docId,
        type: DOCUMENT,
        children: {
            // Identity
            docId: { id: 'docId', type: STRING, value: docId },
            title: { id: 'title', type: STRING, value: title, constraints: { required: REQUIRED } },
            content: { id: 'content', type: STRING, value: content },
            authorId: { id: 'authorId', type: STRING, value: authorId },

            // Versioning
            version: { id: 'version', type: NUMBER, value: 1, defaultValue: 1 },
            createdAt: { id: 'createdAt', type: DATETIME, value: new Date().toISOString() },
            updatedAt: { id: 'updatedAt', type: TIMESTAMP, value: Date.now() },
            stateChangedAt: { id: 'stateChangedAt', type: TIMESTAMP, value: Date.now() },

            // Workflow state
            state: {
                id: 'state',
                type: WorkflowStateEnum,
                value: initialState,
                defaultValue: States.DRAFT,
                constraints: { validState: ONE_OF(Object.values(States)) }
            },

            // Assignment
            assigneeId: { id: 'assigneeId', type: STRING, value: '', defaultValue: '' },
            reviewComments: { id: 'reviewComments', type: STRING, value: '', defaultValue: '' },

            // Workflow configuration
            workflow: createWorkflowConfig(),

            // EXPRESSION: isInFinalState = state == 'published' OR state == 'archived'
            isInFinalState: {
                id: 'isInFinalState',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.PUBLISHED)),
                    op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.ARCHIVED))
                )
            },

            // EXPRESSION: isEditable = state == 'draft'
            isEditable: {
                id: 'isEditable',
                type: BOOLEAN,
                value: op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.DRAFT))
            },

            // EXPRESSION: isPending = state == 'submitted' OR state == 'in_review'
            isPending: {
                id: 'isPending',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.SUBMITTED)),
                    op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.IN_REVIEW))
                )
            },

            // EXPRESSION: needsAttention = state == 'rejected'
            needsAttention: {
                id: 'needsAttention',
                type: BOOLEAN,
                value: op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.REJECTED))
            },

            // EXPRESSION: canBePublished = state == 'approved'
            canBePublished: {
                id: 'canBePublished',
                type: BOOLEAN,
                value: op('eq', ref(['self', 'parent', 'state', 'value']), lit(States.APPROVED))
            },

            // Audit trail container
            auditTrail: {
                id: 'auditTrail',
                type: TYPE,
                children: {}
            }
        }
    });

    /**
     * Workflow Context - Current user and computed permissions
     * Uses expressions to compute role-based permissions
     */
    const createWorkflowContext = (userId: string, role: string): Property => ({
        id: 'context',
        type: WORKFLOW_CONTEXT,
        children: {
            userId: { id: 'userId', type: STRING, value: userId },
            role: { id: 'role', type: RoleEnum, value: role },

            // EXPRESSION: isAdmin = role == 'admin'
            isAdmin: {
                id: 'isAdmin',
                type: BOOLEAN,
                value: op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.ADMIN))
            },

            // EXPRESSION: canReview = role == 'reviewer' OR role == 'approver' OR role == 'admin'
            canReview: {
                id: 'canReview',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.REVIEWER)),
                    op('or',
                        op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.APPROVER)),
                        op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.ADMIN))
                    )
                )
            },

            // EXPRESSION: canApprove = role == 'approver' OR role == 'admin'
            canApprove: {
                id: 'canApprove',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.APPROVER)),
                    op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.ADMIN))
                )
            },

            // EXPRESSION: canPublish = role == 'publisher' OR role == 'admin'
            canPublish: {
                id: 'canPublish',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.PUBLISHER)),
                    op('eq', ref(['self', 'parent', 'role', 'value']), lit(Roles.ADMIN))
                )
            }
        }
    });

    // ========================================================================
    // WORKFLOW ENGINE
    // ========================================================================

    class WorkflowEngine {
        private doc: PropertyNode;
        private entryCounter = 0;

        constructor(doc: PropertyNode) {
            this.doc = doc;
        }

        getCurrentState(): string {
            return this.doc.child('state')?.value as string;
        }

        private getWorkflowConfig(): PropertyNode | undefined {
            return this.doc.child('workflow');
        }

        private isRoleAllowed(transition: PropertyNode, role: string): boolean {
            const allowedRoles = transition.child('allowedRoles');
            return allowedRoles?.childKeys.includes(role) ?? false;
        }

        getAvailableActions(role: string): string[] {
            const currentState = this.getCurrentState();
            const transitions = this.getWorkflowConfig()?.child('transitions');
            if (!transitions) return [];

            const available: string[] = [];
            for (const key of transitions.childKeys) {
                const transition = transitions.child(key);
                if (!transition) continue;

                const from = transition.child('from')?.value as string;
                if (from === currentState && this.isRoleAllowed(transition, role)) {
                    available.push(transition.child('action')?.value as string);
                }
            }
            return available;
        }

        canPerformAction(action: string, role: string): boolean {
            return this.getAvailableActions(role).includes(action);
        }

        private findTransition(action: string): PropertyNode | null {
            const transitions = this.getWorkflowConfig()?.child('transitions');
            if (!transitions) return null;

            for (const key of transitions.childKeys) {
                const transition = transitions.child(key);
                if (transition?.child('action')?.value === action) {
                    return transition;
                }
            }
            return null;
        }

        async performTransition(
            action: string,
            userId: string,
            role: string,
            comment: string = ''
        ): Promise<{ success: boolean; error?: string; newState?: string }> {
            if (!this.canPerformAction(action, role)) {
                return {
                    success: false,
                    error: `Action '${action}' not available for role '${role}' in state '${this.getCurrentState()}'`
                };
            }

            const transition = this.findTransition(action);
            if (!transition) {
                return { success: false, error: `Transition '${action}' not found` };
            }

            const fromState = this.getCurrentState();
            const toState = transition.child('to')?.value as string;

            this.doc.setValue(toState, ['state']);
            this.doc.setValue(Date.now(), ['updatedAt']);
            this.doc.setValue(Date.now(), ['stateChangedAt']);

            // Increment version on revision
            if (toState === States.DRAFT && fromState !== States.DRAFT) {
                const currentVersion = this.doc.child('version')?.value as number || 1;
                this.doc.setValue(currentVersion + 1, ['version']);
            }

            this.addAuditEntry(action, fromState, toState, userId, role, comment);

            return { success: true, newState: toState };
        }

        private addAuditEntry(
            action: string,
            fromState: string,
            toState: string,
            userId: string,
            role: string,
            comment: string
        ): void {
            const auditTrail = this.doc.child('auditTrail');
            if (!auditTrail) return;

            this.entryCounter++;
            const entryId = `entry_${this.entryCounter}`;
            const entry: Property = {
                id: entryId,
                type: AUDIT_ENTRY,
                children: {
                    sequence: { id: 'sequence', type: NUMBER, value: this.entryCounter },
                    timestamp: { id: 'timestamp', type: DATETIME, value: new Date().toISOString() },
                    action: { id: 'action', type: ActionEnum, value: action },
                    fromState: { id: 'fromState', type: WorkflowStateEnum, value: fromState },
                    toState: { id: 'toState', type: WorkflowStateEnum, value: toState },
                    userId: { id: 'userId', type: STRING, value: userId },
                    userRole: { id: 'userRole', type: RoleEnum, value: role },
                    comment: { id: 'comment', type: STRING, value: comment }
                }
            };

            auditTrail.addChild(entryId, entry);
        }

        getAuditTrail(): Array<{
            sequence: number;
            action: string;
            fromState: string;
            toState: string;
            userId: string;
            userRole: string;
        }> {
            const auditTrail = this.doc.child('auditTrail');
            if (!auditTrail) return [];

            return auditTrail.childKeys.map(key => {
                const entry = auditTrail.child(key)!;
                return {
                    sequence: entry.child('sequence')?.value as number,
                    action: entry.child('action')?.value as string,
                    fromState: entry.child('fromState')?.value as string,
                    toState: entry.child('toState')?.value as string,
                    userId: entry.child('userId')?.value as string,
                    userRole: entry.child('userRole')?.value as string
                };
            }).sort((a, b) => a.sequence - b.sequence);
        }
    }

    // ========================================================================
    // TESTS: Expression-Based Computed Properties
    // ========================================================================

    describe('Expression-Based Computed Properties', () => {
        it('should compute isInFinalState via expression', async () => {
            // Not final state
            const draftDoc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.DRAFT));
            draftDoc.setRegistry(defaultRegistry);
            expect(await draftDoc.getValue(['isInFinalState'])).toBe(false);

            // Final state: published
            const publishedDoc = new PropertyNode(createDocument('DOC-002', 'Test', 'Content', 'user-123', States.PUBLISHED));
            publishedDoc.setRegistry(defaultRegistry);
            expect(await publishedDoc.getValue(['isInFinalState'])).toBe(true);

            // Final state: archived
            const archivedDoc = new PropertyNode(createDocument('DOC-003', 'Test', 'Content', 'user-123', States.ARCHIVED));
            archivedDoc.setRegistry(defaultRegistry);
            expect(await archivedDoc.getValue(['isInFinalState'])).toBe(true);
        });

        it('should compute isEditable via expression', async () => {
            const draftDoc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.DRAFT));
            draftDoc.setRegistry(defaultRegistry);
            expect(await draftDoc.getValue(['isEditable'])).toBe(true);

            const submittedDoc = new PropertyNode(createDocument('DOC-002', 'Test', 'Content', 'user-123', States.SUBMITTED));
            submittedDoc.setRegistry(defaultRegistry);
            expect(await submittedDoc.getValue(['isEditable'])).toBe(false);

            const inReviewDoc = new PropertyNode(createDocument('DOC-003', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            inReviewDoc.setRegistry(defaultRegistry);
            expect(await inReviewDoc.getValue(['isEditable'])).toBe(false);
        });

        it('should compute isPending via expression', async () => {
            const submittedDoc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.SUBMITTED));
            submittedDoc.setRegistry(defaultRegistry);
            expect(await submittedDoc.getValue(['isPending'])).toBe(true);

            const inReviewDoc = new PropertyNode(createDocument('DOC-002', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            inReviewDoc.setRegistry(defaultRegistry);
            expect(await inReviewDoc.getValue(['isPending'])).toBe(true);

            const draftDoc = new PropertyNode(createDocument('DOC-003', 'Test', 'Content', 'user-123', States.DRAFT));
            draftDoc.setRegistry(defaultRegistry);
            expect(await draftDoc.getValue(['isPending'])).toBe(false);
        });

        it('should compute needsAttention via expression', async () => {
            const rejectedDoc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.REJECTED));
            rejectedDoc.setRegistry(defaultRegistry);
            expect(await rejectedDoc.getValue(['needsAttention'])).toBe(true);

            const draftDoc = new PropertyNode(createDocument('DOC-002', 'Test', 'Content', 'user-123', States.DRAFT));
            draftDoc.setRegistry(defaultRegistry);
            expect(await draftDoc.getValue(['needsAttention'])).toBe(false);
        });

        it('should compute canBePublished via expression', async () => {
            const approvedDoc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.APPROVED));
            approvedDoc.setRegistry(defaultRegistry);
            expect(await approvedDoc.getValue(['canBePublished'])).toBe(true);

            const inReviewDoc = new PropertyNode(createDocument('DOC-002', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            inReviewDoc.setRegistry(defaultRegistry);
            expect(await inReviewDoc.getValue(['canBePublished'])).toBe(false);
        });
    });

    // ========================================================================
    // TESTS: Workflow Context Computed Permissions
    // ========================================================================

    describe('Workflow Context Computed Permissions', () => {
        it('should compute isAdmin via expression', async () => {
            const adminContext = new PropertyNode(createWorkflowContext('admin-001', Roles.ADMIN));
            adminContext.setRegistry(defaultRegistry);
            expect(await adminContext.getValue(['isAdmin'])).toBe(true);

            const authorContext = new PropertyNode(createWorkflowContext('author-001', Roles.AUTHOR));
            authorContext.setRegistry(defaultRegistry);
            expect(await authorContext.getValue(['isAdmin'])).toBe(false);
        });

        it('should compute canReview via expression', async () => {
            const reviewerContext = new PropertyNode(createWorkflowContext('reviewer-001', Roles.REVIEWER));
            reviewerContext.setRegistry(defaultRegistry);
            expect(await reviewerContext.getValue(['canReview'])).toBe(true);

            const approverContext = new PropertyNode(createWorkflowContext('approver-001', Roles.APPROVER));
            approverContext.setRegistry(defaultRegistry);
            expect(await approverContext.getValue(['canReview'])).toBe(true);

            const adminContext = new PropertyNode(createWorkflowContext('admin-001', Roles.ADMIN));
            adminContext.setRegistry(defaultRegistry);
            expect(await adminContext.getValue(['canReview'])).toBe(true);

            const authorContext = new PropertyNode(createWorkflowContext('author-001', Roles.AUTHOR));
            authorContext.setRegistry(defaultRegistry);
            expect(await authorContext.getValue(['canReview'])).toBe(false);
        });

        it('should compute canApprove via expression', async () => {
            const approverContext = new PropertyNode(createWorkflowContext('approver-001', Roles.APPROVER));
            approverContext.setRegistry(defaultRegistry);
            expect(await approverContext.getValue(['canApprove'])).toBe(true);

            const adminContext = new PropertyNode(createWorkflowContext('admin-001', Roles.ADMIN));
            adminContext.setRegistry(defaultRegistry);
            expect(await adminContext.getValue(['canApprove'])).toBe(true);

            const reviewerContext = new PropertyNode(createWorkflowContext('reviewer-001', Roles.REVIEWER));
            reviewerContext.setRegistry(defaultRegistry);
            expect(await reviewerContext.getValue(['canApprove'])).toBe(false);
        });

        it('should compute canPublish via expression', async () => {
            const publisherContext = new PropertyNode(createWorkflowContext('publisher-001', Roles.PUBLISHER));
            publisherContext.setRegistry(defaultRegistry);
            expect(await publisherContext.getValue(['canPublish'])).toBe(true);

            const adminContext = new PropertyNode(createWorkflowContext('admin-001', Roles.ADMIN));
            adminContext.setRegistry(defaultRegistry);
            expect(await adminContext.getValue(['canPublish'])).toBe(true);

            const approverContext = new PropertyNode(createWorkflowContext('approver-001', Roles.APPROVER));
            approverContext.setRegistry(defaultRegistry);
            expect(await approverContext.getValue(['canPublish'])).toBe(false);
        });
    });

    // ========================================================================
    // TESTS: ENUM Types
    // ========================================================================

    describe('ENUM Types', () => {
        it('should create WorkflowState enum correctly', () => {
            expect(WorkflowStateEnum.type.id).toBe('Enum');
            expect(WorkflowStateEnum.children!['draft'].value).toBe('draft');
            expect(WorkflowStateEnum.children!['published'].value).toBe('published');
        });

        it('should create Role enum correctly', () => {
            expect(RoleEnum.type.id).toBe('Enum');
            expect(RoleEnum.children!['author'].value).toBe('author');
            expect(RoleEnum.children!['admin'].value).toBe('admin');
        });

        it('should create Action enum correctly', () => {
            expect(ActionEnum.type.id).toBe('Enum');
            expect(ActionEnum.children!['submit'].value).toBe('submit');
            expect(ActionEnum.children!['approve'].value).toBe('approve');
        });
    });

    // ========================================================================
    // TESTS: Document Types
    // ========================================================================

    describe('Document Types', () => {
        it('should create document with proper types', () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            expect(doc.type.id).toBe('Document');
            expect(doc.child('state')?.type.id).toBe('WorkflowState');
            expect(doc.child('createdAt')?.type.id).toBe('DateTime');
            expect(doc.child('updatedAt')?.type.id).toBe('Timestamp');
        });

        it('should have properly typed transitions', () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const transition = doc.child('workflow')?.child('transitions')?.child('submit');
            expect(transition?.type.id).toBe('Transition');
            expect(transition?.child('from')?.type.id).toBe('WorkflowState');
            expect(transition?.child('action')?.type.id).toBe('Action');
        });
    });

    // ========================================================================
    // TESTS: State Transitions
    // ========================================================================

    describe('State Transitions', () => {
        it('should start in draft state', () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            expect(engine.getCurrentState()).toBe(States.DRAFT);
        });

        it('should show available actions for author in draft', () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            const actions = engine.getAvailableActions(Roles.AUTHOR);

            expect(actions).toContain('submit');
            expect(actions).not.toContain('approve');
        });

        it('should allow author to submit', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            const result = await engine.performTransition('submit', 'user-123', Roles.AUTHOR);

            expect(result.success).toBe(true);
            expect(result.newState).toBe(States.SUBMITTED);
            expect(engine.getCurrentState()).toBe(States.SUBMITTED);
        });

        it('should not allow author to approve', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            const result = await engine.performTransition('approve', 'user-123', Roles.AUTHOR);

            expect(result.success).toBe(false);
            expect(result.error).toContain('not available');
        });

        it('should complete full workflow', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'author-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);

            await engine.performTransition('submit', 'author-123', Roles.AUTHOR);
            expect(engine.getCurrentState()).toBe(States.SUBMITTED);

            await engine.performTransition('start_review', 'reviewer-456', Roles.REVIEWER);
            expect(engine.getCurrentState()).toBe(States.IN_REVIEW);

            await engine.performTransition('approve', 'approver-789', Roles.APPROVER);
            expect(engine.getCurrentState()).toBe(States.APPROVED);

            await engine.performTransition('publish', 'publisher-101', Roles.PUBLISHER);
            expect(engine.getCurrentState()).toBe(States.PUBLISHED);

            // Verify final state via expression
            expect(await doc.getValue(['isInFinalState'])).toBe(true);
        });
    });

    // ========================================================================
    // TESTS: Role-Based Access
    // ========================================================================

    describe('Role-Based Access', () => {
        it('should give admin all permissions at each state', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'admin-000'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);

            expect(engine.canPerformAction('submit', Roles.ADMIN)).toBe(true);

            await engine.performTransition('submit', 'admin-000', Roles.ADMIN);
            expect(engine.canPerformAction('start_review', Roles.ADMIN)).toBe(true);

            await engine.performTransition('start_review', 'admin-000', Roles.ADMIN);
            expect(engine.canPerformAction('approve', Roles.ADMIN)).toBe(true);
            expect(engine.canPerformAction('reject', Roles.ADMIN)).toBe(true);
            expect(engine.canPerformAction('request_changes', Roles.ADMIN)).toBe(true);
        });

        it('should restrict reviewer to review actions only', () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);

            expect(engine.canPerformAction('reject', Roles.REVIEWER)).toBe(true);
            expect(engine.canPerformAction('request_changes', Roles.REVIEWER)).toBe(true);
            expect(engine.canPerformAction('approve', Roles.REVIEWER)).toBe(false);
        });
    });

    // ========================================================================
    // TESTS: Audit Trail
    // ========================================================================

    describe('Audit Trail', () => {
        it('should record transitions with typed entries', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            await engine.performTransition('submit', 'user-123', Roles.AUTHOR, 'Ready for review');

            const trail = engine.getAuditTrail();
            expect(trail.length).toBe(1);
            expect(trail[0].action).toBe('submit');
            expect(trail[0].fromState).toBe(States.DRAFT);
            expect(trail[0].toState).toBe(States.SUBMITTED);
        });

        it('should maintain ordered audit history', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'author-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);

            await engine.performTransition('submit', 'author-123', Roles.AUTHOR);
            await engine.performTransition('start_review', 'reviewer-456', Roles.REVIEWER);
            await engine.performTransition('approve', 'approver-789', Roles.APPROVER);
            await engine.performTransition('publish', 'publisher-101', Roles.PUBLISHER);

            const trail = engine.getAuditTrail();
            expect(trail.length).toBe(4);
            expect(trail[0].action).toBe('submit');
            expect(trail[1].action).toBe('start_review');
            expect(trail[2].action).toBe('approve');
            expect(trail[3].action).toBe('publish');
        });

        it('should have properly typed audit entries', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            await engine.performTransition('submit', 'user-123', Roles.AUTHOR);

            const auditTrail = doc.child('auditTrail');
            const firstEntry = auditTrail?.child('entry_1');

            expect(firstEntry?.type.id).toBe('AuditEntry');
            expect(firstEntry?.child('action')?.type.id).toBe('Action');
            expect(firstEntry?.child('fromState')?.type.id).toBe('WorkflowState');
            expect(firstEntry?.child('userRole')?.type.id).toBe('Role');
            expect(firstEntry?.child('timestamp')?.type.id).toBe('DateTime');
        });
    });

    // ========================================================================
    // TESTS: Revision Flow
    // ========================================================================

    describe('Revision Flow', () => {
        it('should increment version on changes requested', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.IN_REVIEW));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            expect(doc.child('version')?.value).toBe(1);

            await engine.performTransition('request_changes', 'reviewer-456', Roles.REVIEWER, 'Fix formatting');

            expect(engine.getCurrentState()).toBe(States.DRAFT);
            expect(doc.child('version')?.value).toBe(2);

            // Document should be editable again
            expect(await doc.getValue(['isEditable'])).toBe(true);
        });

        it('should allow revision from rejected state', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123', States.REJECTED));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            expect(engine.canPerformAction('revise', Roles.AUTHOR)).toBe(true);

            await engine.performTransition('revise', 'user-123', Roles.AUTHOR, 'Revised content');

            expect(engine.getCurrentState()).toBe(States.DRAFT);
            expect(doc.child('version')?.value).toBe(2);
        });
    });

    // ========================================================================
    // TESTS: Constraint Validation
    // ========================================================================

    describe('Constraint Validation', () => {
        it('should validate state against enum values', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const result1 = await checkConstraintsDeep(doc.child('state')!, createContext(doc));
            expect(result1.valid).toBe(true);

            doc.setValue('invalid_state', ['state']);
            const result2 = await checkConstraintsDeep(doc.child('state')!, createContext(doc));
            expect(result2.valid).toBe(false);
        });

        it('should validate required title', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', '', 'Content', 'user-123'));
            doc.setRegistry(defaultRegistry);

            const result = await checkConstraintsDeep(doc.child('title')!, createContext(doc));
            expect(result.valid).toBe(false);
        });
    });

    // ========================================================================
    // TESTS: Snapshots
    // ========================================================================

    describe('Snapshots', () => {
        it('should snapshot document state', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test Document', 'Content', 'author-123'));
            doc.setRegistry(defaultRegistry);

            const snapshot = await doc.snapshot();

            expect(snapshot.docId).toBe('DOC-001');
            expect(snapshot.title).toBe('Test Document');
            expect(snapshot.state).toBe(States.DRAFT);
            expect(snapshot.version).toBe(1);
        });

        it('should capture workflow progress in snapshot', async () => {
            const doc = new PropertyNode(createDocument('DOC-001', 'Test', 'Content', 'author-123'));
            doc.setRegistry(defaultRegistry);

            const engine = new WorkflowEngine(doc);
            await engine.performTransition('submit', 'author-123', Roles.AUTHOR);
            await engine.performTransition('start_review', 'reviewer-456', Roles.REVIEWER);

            const snapshot = await doc.snapshot();
            expect(snapshot.state).toBe(States.IN_REVIEW);
        });
    });
});
