/**
 * Scenario 12: Multi-Agent Orchestration
 *
 * Models a multi-agent system with:
 * - Agent registry with specialized agents
 * - Task routing based on capabilities
 * - Agent handoffs and collaboration
 * - Workload balancing
 * - Aggregate performance metrics
 */

import { describe, it, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

// =============================================================================
// MULTI-AGENT ORCHESTRATION SCHEMA
// =============================================================================

function createAgent(config: {
    id: string;
    name: string;
    specialty: string;
    capabilities: string[];
    maxConcurrentTasks: number;
    costPerTask: number;
}): Property {
    return {
        id: config.id,
        type: TYPE,
        children: {
            name: { id: 'name', type: STRING, value: config.name },
            specialty: { id: 'specialty', type: STRING, value: config.specialty },
            capabilities: { id: 'capabilities', type: TYPE, value: config.capabilities },
            maxConcurrentTasks: { id: 'maxConcurrentTasks', type: NUMBER, value: config.maxConcurrentTasks },
            costPerTask: { id: 'costPerTask', type: NUMBER, value: config.costPerTask },

            // Runtime state
            currentTasks: { id: 'currentTasks', type: NUMBER, value: 0 },
            completedTasks: { id: 'completedTasks', type: NUMBER, value: 0 },
            failedTasks: { id: 'failedTasks', type: NUMBER, value: 0 },
            totalResponseTime: { id: 'totalResponseTime', type: NUMBER, value: 0 },
            isOnline: { id: 'isOnline', type: BOOLEAN, value: true },

            // Computed metrics
            availableSlots: {
                id: 'availableSlots',
                type: NUMBER,
                value: op('sub',
                    ref(['self', 'parent', 'maxConcurrentTasks', 'value']),
                    ref(['self', 'parent', 'currentTasks', 'value'])
                )
            },

            utilizationPercent: {
                id: 'utilizationPercent',
                type: NUMBER,
                value: op('mul',
                    op('div',
                        ref(['self', 'parent', 'currentTasks', 'value']),
                        ref(['self', 'parent', 'maxConcurrentTasks', 'value'])
                    ),
                    lit(100)
                )
            },

            isAvailable: {
                id: 'isAvailable',
                type: BOOLEAN,
                value: op('and',
                    ref(['self', 'parent', 'isOnline', 'value']),
                    op('gt', ref(['self', 'parent', 'availableSlots', 'value']), lit(0))
                )
            },

            successRate: {
                id: 'successRate',
                type: NUMBER,
                value: op('if',
                    op('gt',
                        op('add',
                            ref(['self', 'parent', 'completedTasks', 'value']),
                            ref(['self', 'parent', 'failedTasks', 'value'])
                        ),
                        lit(0)
                    ),
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'completedTasks', 'value']),
                            op('add',
                                ref(['self', 'parent', 'completedTasks', 'value']),
                                ref(['self', 'parent', 'failedTasks', 'value'])
                            )
                        ),
                        lit(100)
                    ),
                    lit(100) // Default to 100% if no tasks processed
                )
            },

            averageResponseTime: {
                id: 'averageResponseTime',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'completedTasks', 'value']), lit(0)),
                    op('div',
                        ref(['self', 'parent', 'totalResponseTime', 'value']),
                        ref(['self', 'parent', 'completedTasks', 'value'])
                    ),
                    lit(0)
                )
            },

            totalCost: {
                id: 'totalCost',
                type: NUMBER,
                value: op('mul',
                    ref(['self', 'parent', 'completedTasks', 'value']),
                    ref(['self', 'parent', 'costPerTask', 'value'])
                )
            },

            // Agent health score (0-100)
            healthScore: {
                id: 'healthScore',
                type: NUMBER,
                value: op('if', op('not', ref(['self', 'parent', 'isOnline', 'value'])),
                    lit(0),
                    op('sub',
                        lit(100),
                        op('mul',
                            op('sub', lit(100), ref(['self', 'parent', 'successRate', 'value'])),
                            lit(0.5) // Penalty factor for failures
                        )
                    )
                )
            }
        }
    };
}

function createOrchestrator(agents: Property[]): Property {
    const agentChildren: Record<string, Property> = {};
    agents.forEach(agent => {
        agentChildren[agent.id] = agent;
    });

    return {
        id: 'orchestrator',
        type: TYPE,
        children: {
            // Orchestrator config
            config: {
                id: 'config',
                type: TYPE,
                children: {
                    name: { id: 'name', type: STRING, value: 'Main Orchestrator' },
                    loadBalancingStrategy: { id: 'loadBalancingStrategy', type: STRING, value: 'round_robin' },
                    maxRetries: { id: 'maxRetries', type: NUMBER, value: 3 },
                    timeoutMs: { id: 'timeoutMs', type: NUMBER, value: 30000 }
                }
            },

            // Agent registry
            agents: {
                id: 'agents',
                type: TYPE,
                children: agentChildren
            },

            // Current task queue
            taskQueue: {
                id: 'taskQueue',
                type: TYPE,
                children: {
                    pending: { id: 'pending', type: NUMBER, value: 0 },
                    inProgress: { id: 'inProgress', type: NUMBER, value: 0 },
                    completed: { id: 'completed', type: NUMBER, value: 0 },
                    failed: { id: 'failed', type: NUMBER, value: 0 },

                    total: {
                        id: 'total',
                        type: NUMBER,
                        value: op('add',
                            op('add',
                                ref(['self', 'parent', 'pending', 'value']),
                                ref(['self', 'parent', 'inProgress', 'value'])
                            ),
                            op('add',
                                ref(['self', 'parent', 'completed', 'value']),
                                ref(['self', 'parent', 'failed', 'value'])
                            )
                        )
                    },

                    completionRate: {
                        id: 'completionRate',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'total', 'value']), lit(0)),
                            op('mul',
                                op('div',
                                    ref(['self', 'parent', 'completed', 'value']),
                                    ref(['self', 'parent', 'total', 'value'])
                                ),
                                lit(100)
                            ),
                            lit(0)
                        )
                    },

                    failureRate: {
                        id: 'failureRate',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'total', 'value']), lit(0)),
                            op('mul',
                                op('div',
                                    ref(['self', 'parent', 'failed', 'value']),
                                    ref(['self', 'parent', 'total', 'value'])
                                ),
                                lit(100)
                            ),
                            lit(0)
                        )
                    },

                    hasBacklog: {
                        id: 'hasBacklog',
                        type: BOOLEAN,
                        value: op('gt', ref(['self', 'parent', 'pending', 'value']), lit(10))
                    }
                }
            },

            // System metrics (would be computed from all agents)
            systemMetrics: {
                id: 'systemMetrics',
                type: TYPE,
                children: {
                    totalAgents: { id: 'totalAgents', type: NUMBER, value: agents.length },
                    onlineAgents: { id: 'onlineAgents', type: NUMBER, value: agents.length },
                    totalCapacity: { id: 'totalCapacity', type: NUMBER, value: 0 },
                    currentLoad: { id: 'currentLoad', type: NUMBER, value: 0 },

                    systemUtilization: {
                        id: 'systemUtilization',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'totalCapacity', 'value']), lit(0)),
                            op('mul',
                                op('div',
                                    ref(['self', 'parent', 'currentLoad', 'value']),
                                    ref(['self', 'parent', 'totalCapacity', 'value'])
                                ),
                                lit(100)
                            ),
                            lit(0)
                        )
                    },

                    availableCapacity: {
                        id: 'availableCapacity',
                        type: NUMBER,
                        value: op('sub',
                            ref(['self', 'parent', 'totalCapacity', 'value']),
                            ref(['self', 'parent', 'currentLoad', 'value'])
                        )
                    },

                    isOverloaded: {
                        id: 'isOverloaded',
                        type: BOOLEAN,
                        value: op('gt',
                            ref(['self', 'parent', 'systemUtilization', 'value']),
                            lit(90)
                        )
                    },

                    healthStatus: {
                        id: 'healthStatus',
                        type: STRING,
                        value: op('if',
                            op('eq', ref(['self', 'parent', 'onlineAgents', 'value']), lit(0)),
                            lit('critical'),
                            op('if', ref(['self', 'parent', 'isOverloaded', 'value']),
                                lit('degraded'),
                                op('if', ref(['root', 'taskQueue', 'hasBacklog', 'value']),
                                    lit('busy'),
                                    lit('healthy')
                                )
                            )
                        )
                    }
                }
            }
        }
    };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Scenario 12: Multi-Agent Orchestration', () => {
    describe('Individual Agent Metrics', () => {
        it('should calculate agent availability', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python', 'javascript', 'typescript'],
                maxConcurrentTasks: 5,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(2, ['currentTasks']);

            expect(await node.getValue(['availableSlots'])).toBe(3);
            expect(await node.getValue(['utilizationPercent'])).toBe(40);
            expect(await node.getValue(['isAvailable'])).toBe(true);
        });

        it('should mark agent unavailable when at capacity', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 3,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(3, ['currentTasks']);

            expect(await node.getValue(['availableSlots'])).toBe(0);
            expect(await node.getValue(['utilizationPercent'])).toBe(100);
            expect(await node.getValue(['isAvailable'])).toBe(false);
        });

        it('should mark agent unavailable when offline', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 5,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(false, ['isOnline']);

            expect(await node.getValue(['isAvailable'])).toBe(false);
            expect(await node.getValue(['healthScore'])).toBe(0);
        });

        it('should calculate success rate', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 5,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(90, ['completedTasks']);
            node.setValue(10, ['failedTasks']);

            expect(await node.getValue(['successRate'])).toBe(90);
        });

        it('should calculate average response time', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 5,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(100, ['completedTasks']);
            node.setValue(5000, ['totalResponseTime']); // 5000ms total

            expect(await node.getValue(['averageResponseTime'])).toBe(50); // 50ms average
        });

        it('should calculate total cost', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 5,
                costPerTask: 0.05
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(200, ['completedTasks']);

            expect(await node.getValue(['totalCost'])).toBe(10); // 200 * 0.05
        });

        it('should calculate health score with penalty for failures', async () => {
            const agent = createAgent({
                id: 'coder',
                name: 'Code Agent',
                specialty: 'code_generation',
                capabilities: ['python'],
                maxConcurrentTasks: 5,
                costPerTask: 0.01
            });

            const node = new PropertyNode(agent);
            node.setRegistry(defaultRegistry);

            node.setValue(80, ['completedTasks']);
            node.setValue(20, ['failedTasks']); // 80% success rate

            const healthScore = await node.getValue(['healthScore']);
            expect(healthScore).toBe(90); // 100 - (20 * 0.5)
        });
    });

    describe('Orchestrator Task Queue', () => {
        it('should track task queue metrics', async () => {
            const orchestrator = createOrchestrator([
                createAgent({
                    id: 'agent1',
                    name: 'Agent 1',
                    specialty: 'general',
                    capabilities: [],
                    maxConcurrentTasks: 5,
                    costPerTask: 0.01
                })
            ]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            node.setValue(10, ['taskQueue', 'pending']);
            node.setValue(5, ['taskQueue', 'inProgress']);
            node.setValue(80, ['taskQueue', 'completed']);
            node.setValue(5, ['taskQueue', 'failed']);

            expect(await node.getValue(['taskQueue', 'total'])).toBe(100);
            expect(await node.getValue(['taskQueue', 'completionRate'])).toBe(80);
            expect(await node.getValue(['taskQueue', 'failureRate'])).toBe(5);
        });

        it('should detect backlog', async () => {
            const orchestrator = createOrchestrator([]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            node.setValue(5, ['taskQueue', 'pending']);
            node.clearCache();
            expect(await node.getValue(['taskQueue', 'hasBacklog'])).toBe(false);

            node.setValue(15, ['taskQueue', 'pending']);
            node.clearCache();
            expect(await node.getValue(['taskQueue', 'hasBacklog'])).toBe(true);
        });
    });

    describe('System Metrics', () => {
        it('should calculate system utilization', async () => {
            const orchestrator = createOrchestrator([
                createAgent({
                    id: 'agent1',
                    name: 'Agent 1',
                    specialty: 'general',
                    capabilities: [],
                    maxConcurrentTasks: 10,
                    costPerTask: 0.01
                }),
                createAgent({
                    id: 'agent2',
                    name: 'Agent 2',
                    specialty: 'general',
                    capabilities: [],
                    maxConcurrentTasks: 10,
                    costPerTask: 0.01
                })
            ]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            node.setValue(20, ['systemMetrics', 'totalCapacity']);
            node.setValue(10, ['systemMetrics', 'currentLoad']);

            expect(await node.getValue(['systemMetrics', 'systemUtilization'])).toBe(50);
            expect(await node.getValue(['systemMetrics', 'availableCapacity'])).toBe(10);
            expect(await node.getValue(['systemMetrics', 'isOverloaded'])).toBe(false);
        });

        it('should detect overload condition', async () => {
            const orchestrator = createOrchestrator([]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            node.setValue(100, ['systemMetrics', 'totalCapacity']);
            node.setValue(95, ['systemMetrics', 'currentLoad']);

            expect(await node.getValue(['systemMetrics', 'systemUtilization'])).toBe(95);
            expect(await node.getValue(['systemMetrics', 'isOverloaded'])).toBe(true);
        });

        it('should report health status based on conditions', async () => {
            const orchestrator = createOrchestrator([]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            // Healthy state
            node.setValue(2, ['systemMetrics', 'onlineAgents']);
            node.setValue(100, ['systemMetrics', 'totalCapacity']);
            node.setValue(50, ['systemMetrics', 'currentLoad']);
            node.setValue(5, ['taskQueue', 'pending']);
            node.clearCache();

            expect(await node.getValue(['systemMetrics', 'healthStatus'])).toBe('healthy');

            // Busy state (backlog)
            node.setValue(15, ['taskQueue', 'pending']);
            node.clearCache();
            expect(await node.getValue(['systemMetrics', 'healthStatus'])).toBe('busy');

            // Degraded state (overloaded)
            node.setValue(95, ['systemMetrics', 'currentLoad']);
            node.clearCache();
            expect(await node.getValue(['systemMetrics', 'healthStatus'])).toBe('degraded');

            // Critical state (no agents)
            node.setValue(0, ['systemMetrics', 'onlineAgents']);
            node.clearCache();
            expect(await node.getValue(['systemMetrics', 'healthStatus'])).toBe('critical');
        });
    });

    describe('Multi-Agent Scenarios', () => {
        it('should manage multiple specialized agents', async () => {
            const orchestrator = createOrchestrator([
                createAgent({
                    id: 'coder',
                    name: 'Code Agent',
                    specialty: 'code_generation',
                    capabilities: ['python', 'javascript'],
                    maxConcurrentTasks: 5,
                    costPerTask: 0.02
                }),
                createAgent({
                    id: 'researcher',
                    name: 'Research Agent',
                    specialty: 'web_search',
                    capabilities: ['search', 'summarize'],
                    maxConcurrentTasks: 10,
                    costPerTask: 0.01
                }),
                createAgent({
                    id: 'writer',
                    name: 'Writer Agent',
                    specialty: 'content_creation',
                    capabilities: ['blog', 'documentation'],
                    maxConcurrentTasks: 3,
                    costPerTask: 0.03
                })
            ]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            // Simulate workload
            node.setValue(3, ['agents', 'coder', 'currentTasks']);
            node.setValue(7, ['agents', 'researcher', 'currentTasks']);
            node.setValue(3, ['agents', 'writer', 'currentTasks']);

            // Check individual agent availability
            expect(await node.getValue(['agents', 'coder', 'isAvailable'])).toBe(true);
            expect(await node.getValue(['agents', 'researcher', 'isAvailable'])).toBe(true);
            expect(await node.getValue(['agents', 'writer', 'isAvailable'])).toBe(false); // At capacity

            // Check utilization
            expect(await node.getValue(['agents', 'coder', 'utilizationPercent'])).toBe(60);
            expect(await node.getValue(['agents', 'researcher', 'utilizationPercent'])).toBe(70);
            expect(await node.getValue(['agents', 'writer', 'utilizationPercent'])).toBe(100);
        });

        it('should track costs across agents', async () => {
            const orchestrator = createOrchestrator([
                createAgent({
                    id: 'expensive',
                    name: 'Premium Agent',
                    specialty: 'complex_tasks',
                    capabilities: [],
                    maxConcurrentTasks: 2,
                    costPerTask: 0.10
                }),
                createAgent({
                    id: 'cheap',
                    name: 'Basic Agent',
                    specialty: 'simple_tasks',
                    capabilities: [],
                    maxConcurrentTasks: 10,
                    costPerTask: 0.01
                })
            ]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            // Simulate completed tasks
            node.setValue(50, ['agents', 'expensive', 'completedTasks']);
            node.setValue(500, ['agents', 'cheap', 'completedTasks']);

            const expensiveCost = await node.getValue(['agents', 'expensive', 'totalCost']);
            const cheapCost = await node.getValue(['agents', 'cheap', 'totalCost']);

            expect(expensiveCost).toBe(5); // 50 * 0.10
            expect(cheapCost).toBe(5); // 500 * 0.01
        });

        it('should handle agent failures gracefully', async () => {
            const orchestrator = createOrchestrator([
                createAgent({
                    id: 'reliable',
                    name: 'Reliable Agent',
                    specialty: 'general',
                    capabilities: [],
                    maxConcurrentTasks: 5,
                    costPerTask: 0.02
                }),
                createAgent({
                    id: 'unreliable',
                    name: 'Unreliable Agent',
                    specialty: 'general',
                    capabilities: [],
                    maxConcurrentTasks: 5,
                    costPerTask: 0.01
                })
            ]);

            const node = new PropertyNode(orchestrator);
            node.setRegistry(defaultRegistry);

            // Reliable agent: 95% success
            node.setValue(95, ['agents', 'reliable', 'completedTasks']);
            node.setValue(5, ['agents', 'reliable', 'failedTasks']);

            // Unreliable agent: 60% success
            node.setValue(60, ['agents', 'unreliable', 'completedTasks']);
            node.setValue(40, ['agents', 'unreliable', 'failedTasks']);

            expect(await node.getValue(['agents', 'reliable', 'successRate'])).toBe(95);
            expect(await node.getValue(['agents', 'unreliable', 'successRate'])).toBe(60);

            // Health scores reflect reliability
            const reliableHealth = await node.getValue(['agents', 'reliable', 'healthScore']);
            const unreliableHealth = await node.getValue(['agents', 'unreliable', 'healthScore']);

            expect(reliableHealth).toBeGreaterThan(unreliableHealth);
        });
    });
});
