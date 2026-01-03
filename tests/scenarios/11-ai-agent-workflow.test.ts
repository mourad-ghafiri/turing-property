/**
 * Scenario 11: AI Agent Workflow
 *
 * Models an AI agent system with:
 * - Tool selection based on user intent
 * - Context management and token tracking
 * - Response generation with confidence scores
 * - Cost calculation based on model usage
 * - Conversation state management
 */

import { describe, it, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

// =============================================================================
// AI AGENT PROPERTY SCHEMA
// =============================================================================

function createAgentWorkflow(config: {
    agentName: string;
    model: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
    systemPrompt: string;
}): Property {
    return {
        id: 'agentWorkflow',
        type: TYPE,
        children: {
            // Agent Configuration
            config: {
                id: 'config',
                type: TYPE,
                children: {
                    agentName: { id: 'agentName', type: STRING, value: config.agentName },
                    model: { id: 'model', type: STRING, value: config.model },
                    temperature: { id: 'temperature', type: NUMBER, value: config.temperature },
                    maxTokens: { id: 'maxTokens', type: NUMBER, value: config.maxTokens },
                    systemPrompt: { id: 'systemPrompt', type: STRING, value: config.systemPrompt },
                    availableTools: {
                        id: 'availableTools',
                        type: TYPE,
                        value: config.tools
                    },
                    // Cost per 1K tokens (computed based on model)
                    inputTokenCost: {
                        id: 'inputTokenCost',
                        type: NUMBER,
                        value: op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('gpt-4')),
                            lit(0.03),
                            op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('gpt-3.5-turbo')),
                                lit(0.001),
                                op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('claude-3-opus')),
                                    lit(0.015),
                                    lit(0.003) // default (claude-3-sonnet)
                                )
                            )
                        )
                    },
                    outputTokenCost: {
                        id: 'outputTokenCost',
                        type: NUMBER,
                        value: op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('gpt-4')),
                            lit(0.06),
                            op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('gpt-3.5-turbo')),
                                lit(0.002),
                                op('if', op('eq', ref(['self', 'parent', 'model', 'value']), lit('claude-3-opus')),
                                    lit(0.075),
                                    lit(0.015) // default (claude-3-sonnet)
                                )
                            )
                        )
                    }
                }
            },

            // Current Conversation State
            conversation: {
                id: 'conversation',
                type: TYPE,
                children: {
                    userMessage: { id: 'userMessage', type: STRING, value: '' },
                    detectedIntent: { id: 'detectedIntent', type: STRING, value: '' },
                    intentConfidence: { id: 'intentConfidence', type: NUMBER, value: 0 },
                    selectedTool: { id: 'selectedTool', type: STRING, value: '' },
                    toolInput: { id: 'toolInput', type: STRING, value: '' },
                    toolOutput: { id: 'toolOutput', type: STRING, value: '' },
                    agentResponse: { id: 'agentResponse', type: STRING, value: '' },

                    // Should use tool based on confidence threshold
                    shouldUseTool: {
                        id: 'shouldUseTool',
                        type: BOOLEAN,
                        value: op('and',
                            op('gt', ref(['self', 'parent', 'intentConfidence', 'value']), lit(0.7)),
                            op('neq', ref(['self', 'parent', 'selectedTool', 'value']), lit(''))
                        )
                    },

                    // Response quality score (0-100)
                    responseQuality: {
                        id: 'responseQuality',
                        type: NUMBER,
                        value: op('mul',
                            ref(['self', 'parent', 'intentConfidence', 'value']),
                            lit(100)
                        )
                    }
                }
            },

            // Token Usage Tracking
            tokenUsage: {
                id: 'tokenUsage',
                type: TYPE,
                children: {
                    inputTokens: { id: 'inputTokens', type: NUMBER, value: 0 },
                    outputTokens: { id: 'outputTokens', type: NUMBER, value: 0 },

                    // Total tokens
                    totalTokens: {
                        id: 'totalTokens',
                        type: NUMBER,
                        value: op('add',
                            ref(['self', 'parent', 'inputTokens', 'value']),
                            ref(['self', 'parent', 'outputTokens', 'value'])
                        )
                    },

                    // Token usage percentage of max
                    usagePercent: {
                        id: 'usagePercent',
                        type: NUMBER,
                        value: op('mul',
                            op('div',
                                op('add',
                                    ref(['self', 'parent', 'inputTokens', 'value']),
                                    ref(['self', 'parent', 'outputTokens', 'value'])
                                ),
                                ref(['root', 'config', 'maxTokens', 'value'])
                            ),
                            lit(100)
                        )
                    },

                    // Is approaching token limit (>80%)
                    approachingLimit: {
                        id: 'approachingLimit',
                        type: BOOLEAN,
                        value: op('gt',
                            ref(['self', 'parent', 'usagePercent', 'value']),
                            lit(80)
                        )
                    },

                    // Remaining tokens
                    remainingTokens: {
                        id: 'remainingTokens',
                        type: NUMBER,
                        value: op('sub',
                            ref(['root', 'config', 'maxTokens', 'value']),
                            op('add',
                                ref(['self', 'parent', 'inputTokens', 'value']),
                                ref(['self', 'parent', 'outputTokens', 'value'])
                            )
                        )
                    }
                }
            },

            // Cost Tracking
            costs: {
                id: 'costs',
                type: TYPE,
                children: {
                    // Input cost = (inputTokens / 1000) * inputTokenCost
                    inputCost: {
                        id: 'inputCost',
                        type: NUMBER,
                        value: op('mul',
                            op('div',
                                ref(['root', 'tokenUsage', 'inputTokens', 'value']),
                                lit(1000)
                            ),
                            ref(['root', 'config', 'inputTokenCost', 'value'])
                        )
                    },

                    // Output cost = (outputTokens / 1000) * outputTokenCost
                    outputCost: {
                        id: 'outputCost',
                        type: NUMBER,
                        value: op('mul',
                            op('div',
                                ref(['root', 'tokenUsage', 'outputTokens', 'value']),
                                lit(1000)
                            ),
                            ref(['root', 'config', 'outputTokenCost', 'value'])
                        )
                    },

                    // Total cost
                    totalCost: {
                        id: 'totalCost',
                        type: NUMBER,
                        value: op('add',
                            ref(['self', 'parent', 'inputCost', 'value']),
                            ref(['self', 'parent', 'outputCost', 'value'])
                        )
                    },

                    // Cost efficiency (quality per dollar)
                    costEfficiency: {
                        id: 'costEfficiency',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'totalCost', 'value']), lit(0)),
                            op('div',
                                ref(['root', 'conversation', 'responseQuality', 'value']),
                                ref(['self', 'parent', 'totalCost', 'value'])
                            ),
                            lit(0)
                        )
                    }
                }
            },

            // Agent Status
            status: {
                id: 'status',
                type: TYPE,
                children: {
                    isProcessing: { id: 'isProcessing', type: BOOLEAN, value: false },
                    hasError: { id: 'hasError', type: BOOLEAN, value: false },
                    errorMessage: { id: 'errorMessage', type: STRING, value: '' },

                    // Overall health status
                    healthStatus: {
                        id: 'healthStatus',
                        type: STRING,
                        value: op('if', ref(['self', 'parent', 'hasError', 'value']),
                            lit('error'),
                            op('if', ref(['root', 'tokenUsage', 'approachingLimit', 'value']),
                                lit('warning'),
                                lit('healthy')
                            )
                        )
                    },

                    // Can accept new messages
                    canAcceptMessage: {
                        id: 'canAcceptMessage',
                        type: BOOLEAN,
                        value: op('and',
                            op('not', ref(['self', 'parent', 'isProcessing', 'value'])),
                            op('and',
                                op('not', ref(['self', 'parent', 'hasError', 'value'])),
                                op('gt', ref(['root', 'tokenUsage', 'remainingTokens', 'value']), lit(100))
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

describe('Scenario 11: AI Agent Workflow', () => {
    describe('Agent Configuration', () => {
        it('should initialize agent with correct configuration', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: ['search', 'calculator', 'code_interpreter'],
                systemPrompt: 'You are a helpful assistant.'
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['config', 'agentName'])).toBe('Assistant');
            expect(await node.getValue(['config', 'model'])).toBe('claude-3-sonnet');
            expect(await node.getValue(['config', 'temperature'])).toBe(0.7);
            expect(await node.getValue(['config', 'maxTokens'])).toBe(4096);
        });

        it('should compute token costs based on model', async () => {
            const gpt4Workflow = createAgentWorkflow({
                agentName: 'GPT4-Agent',
                model: 'gpt-4',
                temperature: 0.5,
                maxTokens: 8192,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(gpt4Workflow);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['config', 'inputTokenCost'])).toBe(0.03);
            expect(await node.getValue(['config', 'outputTokenCost'])).toBe(0.06);
        });

        it('should use default costs for unknown models', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Custom-Agent',
                model: 'custom-model',
                temperature: 0.5,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            // Default is claude-3-sonnet pricing
            expect(await node.getValue(['config', 'inputTokenCost'])).toBe(0.003);
            expect(await node.getValue(['config', 'outputTokenCost'])).toBe(0.015);
        });
    });

    describe('Conversation State', () => {
        it('should track conversation state', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: ['search'],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            // Simulate user message processing
            node.setValue('What is the weather in Paris?', ['conversation', 'userMessage']);
            node.setValue('weather_query', ['conversation', 'detectedIntent']);
            node.setValue(0.95, ['conversation', 'intentConfidence']);
            node.setValue('search', ['conversation', 'selectedTool']);

            expect(await node.getValue(['conversation', 'userMessage'])).toBe('What is the weather in Paris?');
            expect(await node.getValue(['conversation', 'detectedIntent'])).toBe('weather_query');
            expect(await node.getValue(['conversation', 'shouldUseTool'])).toBe(true);
            expect(await node.getValue(['conversation', 'responseQuality'])).toBe(95);
        });

        it('should not use tool when confidence is low', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: ['search'],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue('hello', ['conversation', 'userMessage']);
            node.setValue('greeting', ['conversation', 'detectedIntent']);
            node.setValue(0.5, ['conversation', 'intentConfidence']); // Below threshold
            node.setValue('', ['conversation', 'selectedTool']);

            expect(await node.getValue(['conversation', 'shouldUseTool'])).toBe(false);
            expect(await node.getValue(['conversation', 'responseQuality'])).toBe(50);
        });
    });

    describe('Token Usage Tracking', () => {
        it('should calculate total tokens', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(500, ['tokenUsage', 'inputTokens']);
            node.setValue(300, ['tokenUsage', 'outputTokens']);

            expect(await node.getValue(['tokenUsage', 'totalTokens'])).toBe(800);
            expect(await node.getValue(['tokenUsage', 'remainingTokens'])).toBe(3296);
        });

        it('should calculate usage percentage', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 1000,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(400, ['tokenUsage', 'inputTokens']);
            node.setValue(100, ['tokenUsage', 'outputTokens']);

            expect(await node.getValue(['tokenUsage', 'usagePercent'])).toBe(50);
            expect(await node.getValue(['tokenUsage', 'approachingLimit'])).toBe(false);
        });

        it('should detect approaching token limit', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 1000,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(700, ['tokenUsage', 'inputTokens']);
            node.setValue(150, ['tokenUsage', 'outputTokens']);

            expect(await node.getValue(['tokenUsage', 'usagePercent'])).toBe(85);
            expect(await node.getValue(['tokenUsage', 'approachingLimit'])).toBe(true);
        });
    });

    describe('Cost Calculation', () => {
        it('should calculate costs correctly', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'gpt-4',
                temperature: 0.7,
                maxTokens: 8192,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(1000, ['tokenUsage', 'inputTokens']);
            node.setValue(500, ['tokenUsage', 'outputTokens']);

            // GPT-4: input $0.03/1K, output $0.06/1K
            const inputCost = await node.getValue(['costs', 'inputCost']);
            const outputCost = await node.getValue(['costs', 'outputCost']);
            const totalCost = await node.getValue(['costs', 'totalCost']);

            expect(inputCost).toBe(0.03); // 1000/1000 * 0.03
            expect(outputCost).toBe(0.03); // 500/1000 * 0.06
            expect(totalCost).toBe(0.06);
        });

        it('should calculate cost efficiency', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(0.9, ['conversation', 'intentConfidence']);
            node.setValue(1000, ['tokenUsage', 'inputTokens']);
            node.setValue(500, ['tokenUsage', 'outputTokens']);

            const quality = await node.getValue(['conversation', 'responseQuality']);
            const totalCost = await node.getValue(['costs', 'totalCost']);
            const efficiency = await node.getValue(['costs', 'costEfficiency']);

            expect(quality).toBe(90);
            // GPT-3.5: input $0.001/1K, output $0.002/1K
            expect(totalCost).toBe(0.002); // 0.001 + 0.001
            expect(efficiency).toBe(45000); // 90 / 0.002
        });
    });

    describe('Agent Status', () => {
        it('should report healthy status when no issues', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(false, ['status', 'isProcessing']);
            node.setValue(false, ['status', 'hasError']);
            node.setValue(100, ['tokenUsage', 'inputTokens']);

            expect(await node.getValue(['status', 'healthStatus'])).toBe('healthy');
            expect(await node.getValue(['status', 'canAcceptMessage'])).toBe(true);
        });

        it('should report error status when error occurs', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(true, ['status', 'hasError']);
            node.setValue('Rate limit exceeded', ['status', 'errorMessage']);

            expect(await node.getValue(['status', 'healthStatus'])).toBe('error');
            expect(await node.getValue(['status', 'canAcceptMessage'])).toBe(false);
        });

        it('should report warning status when approaching token limit', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 1000,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(false, ['status', 'hasError']);
            node.setValue(850, ['tokenUsage', 'inputTokens']);

            expect(await node.getValue(['status', 'healthStatus'])).toBe('warning');
        });

        it('should not accept messages when processing', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 4096,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(true, ['status', 'isProcessing']);

            expect(await node.getValue(['status', 'canAcceptMessage'])).toBe(false);
        });

        it('should not accept messages when tokens nearly exhausted', async () => {
            const workflow = createAgentWorkflow({
                agentName: 'Assistant',
                model: 'claude-3-sonnet',
                temperature: 0.7,
                maxTokens: 1000,
                tools: [],
                systemPrompt: ''
            });

            const node = new PropertyNode(workflow);
            node.setRegistry(defaultRegistry);

            node.setValue(false, ['status', 'isProcessing']);
            node.setValue(false, ['status', 'hasError']);
            node.setValue(950, ['tokenUsage', 'inputTokens']); // Only 50 remaining

            expect(await node.getValue(['status', 'canAcceptMessage'])).toBe(false);
        });
    });

    describe('Model Comparison', () => {
        it('should compare costs across different models', async () => {
            const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'];
            const costs: Record<string, number> = {};

            for (const model of models) {
                const workflow = createAgentWorkflow({
                    agentName: 'Test',
                    model,
                    temperature: 0.7,
                    maxTokens: 4096,
                    tools: [],
                    systemPrompt: ''
                });

                const node = new PropertyNode(workflow);
                node.setRegistry(defaultRegistry);

                node.setValue(1000, ['tokenUsage', 'inputTokens']);
                node.setValue(1000, ['tokenUsage', 'outputTokens']);

                costs[model] = await node.getValue(['costs', 'totalCost']) as number;
            }

            // GPT-4 should be most expensive
            expect(costs['gpt-4']).toBeGreaterThan(costs['gpt-3.5-turbo']);
            expect(costs['claude-3-opus']).toBeGreaterThan(costs['claude-3-sonnet']);

            // GPT-3.5-turbo should be cheapest
            expect(costs['gpt-3.5-turbo']).toBeLessThan(costs['claude-3-sonnet']);
        });
    });
});
