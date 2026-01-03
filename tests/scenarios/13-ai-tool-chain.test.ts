/**
 * Scenario 13: AI Tool Chain / RAG Pipeline
 *
 * Models an AI tool chain system with:
 * - Tool definitions and execution flow
 * - RAG (Retrieval Augmented Generation) pipeline
 * - Context window management
 * - Chain of thought reasoning
 * - Output validation and formatting
 */

import { describe, it, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';
import { defaultRegistry } from '../../src/builtin/operators';

// =============================================================================
// AI TOOL CHAIN SCHEMA
// =============================================================================

function createToolDefinition(config: {
    id: string;
    name: string;
    description: string;
    inputSchema: Record<string, string>;
    estimatedLatencyMs: number;
    costPerCall: number;
}): Property {
    return {
        id: config.id,
        type: TYPE,
        children: {
            name: { id: 'name', type: STRING, value: config.name },
            description: { id: 'description', type: STRING, value: config.description },
            inputSchema: { id: 'inputSchema', type: TYPE, value: config.inputSchema },
            estimatedLatencyMs: { id: 'estimatedLatencyMs', type: NUMBER, value: config.estimatedLatencyMs },
            costPerCall: { id: 'costPerCall', type: NUMBER, value: config.costPerCall },

            // Execution tracking
            callCount: { id: 'callCount', type: NUMBER, value: 0 },
            successCount: { id: 'successCount', type: NUMBER, value: 0 },
            totalLatencyMs: { id: 'totalLatencyMs', type: NUMBER, value: 0 },
            isEnabled: { id: 'isEnabled', type: BOOLEAN, value: true },

            // Computed metrics
            successRate: {
                id: 'successRate',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'callCount', 'value']), lit(0)),
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'successCount', 'value']),
                            ref(['self', 'parent', 'callCount', 'value'])
                        ),
                        lit(100)
                    ),
                    lit(100)
                )
            },

            averageLatencyMs: {
                id: 'averageLatencyMs',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'callCount', 'value']), lit(0)),
                    op('div',
                        ref(['self', 'parent', 'totalLatencyMs', 'value']),
                        ref(['self', 'parent', 'callCount', 'value'])
                    ),
                    ref(['self', 'parent', 'estimatedLatencyMs', 'value'])
                )
            },

            totalCost: {
                id: 'totalCost',
                type: NUMBER,
                value: op('mul',
                    ref(['self', 'parent', 'callCount', 'value']),
                    ref(['self', 'parent', 'costPerCall', 'value'])
                )
            }
        }
    };
}

function createRAGPipeline(config: {
    embeddingModel: string;
    retrievalTopK: number;
    chunkSize: number;
    chunkOverlap: number;
    similarityThreshold: number;
}): Property {
    return {
        id: 'ragPipeline',
        type: TYPE,
        children: {
            // Configuration
            config: {
                id: 'config',
                type: TYPE,
                children: {
                    embeddingModel: { id: 'embeddingModel', type: STRING, value: config.embeddingModel },
                    retrievalTopK: { id: 'retrievalTopK', type: NUMBER, value: config.retrievalTopK },
                    chunkSize: { id: 'chunkSize', type: NUMBER, value: config.chunkSize },
                    chunkOverlap: { id: 'chunkOverlap', type: NUMBER, value: config.chunkOverlap },
                    similarityThreshold: { id: 'similarityThreshold', type: NUMBER, value: config.similarityThreshold },

                    // Effective chunk stride
                    chunkStride: {
                        id: 'chunkStride',
                        type: NUMBER,
                        value: op('sub',
                            ref(['self', 'parent', 'chunkSize', 'value']),
                            ref(['self', 'parent', 'chunkOverlap', 'value'])
                        )
                    }
                }
            },

            // Query state
            query: {
                id: 'query',
                type: TYPE,
                children: {
                    originalQuery: { id: 'originalQuery', type: STRING, value: '' },
                    expandedQuery: { id: 'expandedQuery', type: STRING, value: '' },
                    queryEmbedding: { id: 'queryEmbedding', type: TYPE, value: [] },
                    queryTokenCount: { id: 'queryTokenCount', type: NUMBER, value: 0 }
                }
            },

            // Retrieval results
            retrieval: {
                id: 'retrieval',
                type: TYPE,
                children: {
                    totalDocuments: { id: 'totalDocuments', type: NUMBER, value: 0 },
                    retrievedChunks: { id: 'retrievedChunks', type: NUMBER, value: 0 },
                    relevantChunks: { id: 'relevantChunks', type: NUMBER, value: 0 },
                    avgSimilarityScore: { id: 'avgSimilarityScore', type: NUMBER, value: 0 },
                    maxSimilarityScore: { id: 'maxSimilarityScore', type: NUMBER, value: 0 },
                    retrievalLatencyMs: { id: 'retrievalLatencyMs', type: NUMBER, value: 0 },

                    // Retrieval quality metrics
                    relevanceRatio: {
                        id: 'relevanceRatio',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'retrievedChunks', 'value']), lit(0)),
                            op('div',
                                ref(['self', 'parent', 'relevantChunks', 'value']),
                                ref(['self', 'parent', 'retrievedChunks', 'value'])
                            ),
                            lit(0)
                        )
                    },

                    meetsThreshold: {
                        id: 'meetsThreshold',
                        type: BOOLEAN,
                        value: op('gte',
                            ref(['self', 'parent', 'maxSimilarityScore', 'value']),
                            ref(['root', 'config', 'similarityThreshold', 'value'])
                        )
                    },

                    retrievalQuality: {
                        id: 'retrievalQuality',
                        type: STRING,
                        value: op('if',
                            op('gte', ref(['self', 'parent', 'avgSimilarityScore', 'value']), lit(0.8)),
                            lit('excellent'),
                            op('if',
                                op('gte', ref(['self', 'parent', 'avgSimilarityScore', 'value']), lit(0.6)),
                                lit('good'),
                                op('if',
                                    op('gte', ref(['self', 'parent', 'avgSimilarityScore', 'value']), lit(0.4)),
                                    lit('fair'),
                                    lit('poor')
                                )
                            )
                        )
                    }
                }
            },

            // Context assembly
            context: {
                id: 'context',
                type: TYPE,
                children: {
                    systemPromptTokens: { id: 'systemPromptTokens', type: NUMBER, value: 0 },
                    contextTokens: { id: 'contextTokens', type: NUMBER, value: 0 },
                    maxContextTokens: { id: 'maxContextTokens', type: NUMBER, value: 4096 },
                    reservedOutputTokens: { id: 'reservedOutputTokens', type: NUMBER, value: 1024 },

                    // Total tokens used
                    totalUsedTokens: {
                        id: 'totalUsedTokens',
                        type: NUMBER,
                        value: op('add',
                            op('add',
                                ref(['self', 'parent', 'systemPromptTokens', 'value']),
                                ref(['self', 'parent', 'contextTokens', 'value'])
                            ),
                            ref(['root', 'query', 'queryTokenCount', 'value'])
                        )
                    },

                    // Available for context
                    availableContextTokens: {
                        id: 'availableContextTokens',
                        type: NUMBER,
                        value: op('sub',
                            op('sub',
                                ref(['self', 'parent', 'maxContextTokens', 'value']),
                                ref(['self', 'parent', 'reservedOutputTokens', 'value'])
                            ),
                            op('add',
                                ref(['self', 'parent', 'systemPromptTokens', 'value']),
                                ref(['root', 'query', 'queryTokenCount', 'value'])
                            )
                        )
                    },

                    // Context utilization
                    contextUtilization: {
                        id: 'contextUtilization',
                        type: NUMBER,
                        value: op('mul',
                            op('div',
                                ref(['self', 'parent', 'totalUsedTokens', 'value']),
                                op('sub',
                                    ref(['self', 'parent', 'maxContextTokens', 'value']),
                                    ref(['self', 'parent', 'reservedOutputTokens', 'value'])
                                )
                            ),
                            lit(100)
                        )
                    },

                    // Is context truncated
                    isTruncated: {
                        id: 'isTruncated',
                        type: BOOLEAN,
                        value: op('gt',
                            ref(['self', 'parent', 'contextTokens', 'value']),
                            ref(['self', 'parent', 'availableContextTokens', 'value'])
                        )
                    }
                }
            },

            // Generation output
            generation: {
                id: 'generation',
                type: TYPE,
                children: {
                    outputTokens: { id: 'outputTokens', type: NUMBER, value: 0 },
                    generationLatencyMs: { id: 'generationLatencyMs', type: NUMBER, value: 0 },
                    confidenceScore: { id: 'confidenceScore', type: NUMBER, value: 0 },
                    citationCount: { id: 'citationCount', type: NUMBER, value: 0 },
                    hallucinationRisk: { id: 'hallucinationRisk', type: NUMBER, value: 0 },

                    // Output quality assessment
                    outputQuality: {
                        id: 'outputQuality',
                        type: STRING,
                        value: op('if',
                            op('and',
                                op('gte', ref(['self', 'parent', 'confidenceScore', 'value']), lit(0.8)),
                                op('lt', ref(['self', 'parent', 'hallucinationRisk', 'value']), lit(0.2))
                            ),
                            lit('high'),
                            op('if',
                                op('and',
                                    op('gte', ref(['self', 'parent', 'confidenceScore', 'value']), lit(0.5)),
                                    op('lt', ref(['self', 'parent', 'hallucinationRisk', 'value']), lit(0.5))
                                ),
                                lit('medium'),
                                lit('low')
                            )
                        )
                    },

                    // Is grounded (has citations and low hallucination)
                    isGrounded: {
                        id: 'isGrounded',
                        type: BOOLEAN,
                        value: op('and',
                            op('gt', ref(['self', 'parent', 'citationCount', 'value']), lit(0)),
                            op('lt', ref(['self', 'parent', 'hallucinationRisk', 'value']), lit(0.3))
                        )
                    }
                }
            },

            // Pipeline metrics
            metrics: {
                id: 'metrics',
                type: TYPE,
                children: {
                    // Total latency
                    totalLatencyMs: {
                        id: 'totalLatencyMs',
                        type: NUMBER,
                        value: op('add',
                            ref(['root', 'retrieval', 'retrievalLatencyMs', 'value']),
                            ref(['root', 'generation', 'generationLatencyMs', 'value'])
                        )
                    },

                    // Tokens per second
                    tokensPerSecond: {
                        id: 'tokensPerSecond',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['root', 'generation', 'generationLatencyMs', 'value']), lit(0)),
                            op('div',
                                op('mul',
                                    ref(['root', 'generation', 'outputTokens', 'value']),
                                    lit(1000)
                                ),
                                ref(['root', 'generation', 'generationLatencyMs', 'value'])
                            ),
                            lit(0)
                        )
                    },

                    // Overall pipeline score (0-100)
                    pipelineScore: {
                        id: 'pipelineScore',
                        type: NUMBER,
                        value: op('mul',
                            op('mul',
                                ref(['root', 'retrieval', 'relevanceRatio', 'value']),
                                ref(['root', 'generation', 'confidenceScore', 'value'])
                            ),
                            op('sub', lit(1), ref(['root', 'generation', 'hallucinationRisk', 'value']))
                        )
                    }
                }
            }
        }
    };
}

function createToolChain(tools: Property[]): Property {
    const toolChildren: Record<string, Property> = {};
    tools.forEach(tool => {
        toolChildren[tool.id] = tool;
    });

    return {
        id: 'toolChain',
        type: TYPE,
        children: {
            // Tool registry
            tools: {
                id: 'tools',
                type: TYPE,
                children: toolChildren
            },

            // Chain execution state
            execution: {
                id: 'execution',
                type: TYPE,
                children: {
                    currentStep: { id: 'currentStep', type: NUMBER, value: 0 },
                    totalSteps: { id: 'totalSteps', type: NUMBER, value: 0 },
                    isRunning: { id: 'isRunning', type: BOOLEAN, value: false },
                    hasError: { id: 'hasError', type: BOOLEAN, value: false },
                    errorMessage: { id: 'errorMessage', type: STRING, value: '' },

                    // Progress percentage
                    progress: {
                        id: 'progress',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'totalSteps', 'value']), lit(0)),
                            op('mul',
                                op('div',
                                    ref(['self', 'parent', 'currentStep', 'value']),
                                    ref(['self', 'parent', 'totalSteps', 'value'])
                                ),
                                lit(100)
                            ),
                            lit(0)
                        )
                    },

                    // Is completed
                    isCompleted: {
                        id: 'isCompleted',
                        type: BOOLEAN,
                        value: op('and',
                            op('not', ref(['self', 'parent', 'isRunning', 'value'])),
                            op('and',
                                op('not', ref(['self', 'parent', 'hasError', 'value'])),
                                op('eq',
                                    ref(['self', 'parent', 'currentStep', 'value']),
                                    ref(['self', 'parent', 'totalSteps', 'value'])
                                )
                            )
                        )
                    },

                    // Execution status
                    status: {
                        id: 'status',
                        type: STRING,
                        value: op('if', ref(['self', 'parent', 'hasError', 'value']),
                            lit('error'),
                            op('if', ref(['self', 'parent', 'isRunning', 'value']),
                                lit('running'),
                                op('if', ref(['self', 'parent', 'isCompleted', 'value']),
                                    lit('completed'),
                                    lit('pending')
                                )
                            )
                        )
                    }
                }
            },

            // Chain metrics
            chainMetrics: {
                id: 'chainMetrics',
                type: TYPE,
                children: {
                    totalToolCalls: { id: 'totalToolCalls', type: NUMBER, value: 0 },
                    successfulCalls: { id: 'successfulCalls', type: NUMBER, value: 0 },
                    totalLatencyMs: { id: 'totalLatencyMs', type: NUMBER, value: 0 },
                    totalCost: { id: 'totalCost', type: NUMBER, value: 0 },

                    // Chain success rate
                    chainSuccessRate: {
                        id: 'chainSuccessRate',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'totalToolCalls', 'value']), lit(0)),
                            op('mul',
                                op('div',
                                    ref(['self', 'parent', 'successfulCalls', 'value']),
                                    ref(['self', 'parent', 'totalToolCalls', 'value'])
                                ),
                                lit(100)
                            ),
                            lit(0)
                        )
                    },

                    // Average latency per call
                    avgLatencyPerCall: {
                        id: 'avgLatencyPerCall',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'totalToolCalls', 'value']), lit(0)),
                            op('div',
                                ref(['self', 'parent', 'totalLatencyMs', 'value']),
                                ref(['self', 'parent', 'totalToolCalls', 'value'])
                            ),
                            lit(0)
                        )
                    },

                    // Cost per successful call
                    costPerSuccess: {
                        id: 'costPerSuccess',
                        type: NUMBER,
                        value: op('if',
                            op('gt', ref(['self', 'parent', 'successfulCalls', 'value']), lit(0)),
                            op('div',
                                ref(['self', 'parent', 'totalCost', 'value']),
                                ref(['self', 'parent', 'successfulCalls', 'value'])
                            ),
                            lit(0)
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

describe('Scenario 13: AI Tool Chain / RAG Pipeline', () => {
    describe('Tool Definition', () => {
        it('should track tool execution metrics', async () => {
            const tool = createToolDefinition({
                id: 'search',
                name: 'Web Search',
                description: 'Search the web for information',
                inputSchema: { query: 'string' },
                estimatedLatencyMs: 500,
                costPerCall: 0.001
            });

            const node = new PropertyNode(tool);
            node.setRegistry(defaultRegistry);

            node.setValue(100, ['callCount']);
            node.setValue(95, ['successCount']);
            node.setValue(45000, ['totalLatencyMs']);

            expect(await node.getValue(['successRate'])).toBe(95);
            expect(await node.getValue(['averageLatencyMs'])).toBe(450);
            expect(await node.getValue(['totalCost'])).toBe(0.1);
        });

        it('should use estimated latency when no calls yet', async () => {
            const tool = createToolDefinition({
                id: 'calculator',
                name: 'Calculator',
                description: 'Perform calculations',
                inputSchema: { expression: 'string' },
                estimatedLatencyMs: 100,
                costPerCall: 0.0001
            });

            const node = new PropertyNode(tool);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['averageLatencyMs'])).toBe(100);
            expect(await node.getValue(['successRate'])).toBe(100);
        });
    });

    describe('RAG Pipeline', () => {
        it('should calculate chunk stride', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['config', 'chunkStride'])).toBe(448);
        });

        it('should assess retrieval quality', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            // Excellent retrieval
            node.setValue(0.85, ['retrieval', 'avgSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'retrievalQuality'])).toBe('excellent');

            // Good retrieval
            node.setValue(0.65, ['retrieval', 'avgSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'retrievalQuality'])).toBe('good');

            // Fair retrieval
            node.setValue(0.45, ['retrieval', 'avgSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'retrievalQuality'])).toBe('fair');

            // Poor retrieval
            node.setValue(0.3, ['retrieval', 'avgSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'retrievalQuality'])).toBe('poor');
        });

        it('should check if retrieval meets threshold', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(0.75, ['retrieval', 'maxSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'meetsThreshold'])).toBe(true);

            node.setValue(0.65, ['retrieval', 'maxSimilarityScore']);
            node.clearCache();
            expect(await node.getValue(['retrieval', 'meetsThreshold'])).toBe(false);
        });

        it('should calculate relevance ratio', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 10,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(10, ['retrieval', 'retrievedChunks']);
            node.setValue(7, ['retrieval', 'relevantChunks']);

            expect(await node.getValue(['retrieval', 'relevanceRatio'])).toBe(0.7);
        });
    });

    describe('Context Management', () => {
        it('should calculate context token usage', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(200, ['context', 'systemPromptTokens']);
            node.setValue(1500, ['context', 'contextTokens']);
            node.setValue(100, ['query', 'queryTokenCount']);

            const totalUsed = await node.getValue(['context', 'totalUsedTokens']);
            expect(totalUsed).toBe(1800);
        });

        it('should calculate available context tokens', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(4096, ['context', 'maxContextTokens']);
            node.setValue(1024, ['context', 'reservedOutputTokens']);
            node.setValue(200, ['context', 'systemPromptTokens']);
            node.setValue(50, ['query', 'queryTokenCount']);

            // Available = 4096 - 1024 - 200 - 50 = 2822
            expect(await node.getValue(['context', 'availableContextTokens'])).toBe(2822);
        });

        it('should detect context truncation', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(4096, ['context', 'maxContextTokens']);
            node.setValue(1024, ['context', 'reservedOutputTokens']);
            node.setValue(200, ['context', 'systemPromptTokens']);
            node.setValue(50, ['query', 'queryTokenCount']);
            node.setValue(2000, ['context', 'contextTokens']);
            node.clearCache();

            expect(await node.getValue(['context', 'isTruncated'])).toBe(false);

            node.setValue(3000, ['context', 'contextTokens']); // Exceeds available
            node.clearCache();
            expect(await node.getValue(['context', 'isTruncated'])).toBe(true);
        });
    });

    describe('Generation Quality', () => {
        it('should assess output quality', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            // High quality output
            node.setValue(0.9, ['generation', 'confidenceScore']);
            node.setValue(0.1, ['generation', 'hallucinationRisk']);
            node.clearCache();
            expect(await node.getValue(['generation', 'outputQuality'])).toBe('high');

            // Medium quality output
            node.setValue(0.6, ['generation', 'confidenceScore']);
            node.setValue(0.3, ['generation', 'hallucinationRisk']);
            node.clearCache();
            expect(await node.getValue(['generation', 'outputQuality'])).toBe('medium');

            // Low quality output
            node.setValue(0.4, ['generation', 'confidenceScore']);
            node.setValue(0.6, ['generation', 'hallucinationRisk']);
            node.clearCache();
            expect(await node.getValue(['generation', 'outputQuality'])).toBe('low');
        });

        it('should check if output is grounded', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            // Grounded output
            node.setValue(3, ['generation', 'citationCount']);
            node.setValue(0.2, ['generation', 'hallucinationRisk']);
            node.clearCache();
            expect(await node.getValue(['generation', 'isGrounded'])).toBe(true);

            // Not grounded (no citations)
            node.setValue(0, ['generation', 'citationCount']);
            node.clearCache();
            expect(await node.getValue(['generation', 'isGrounded'])).toBe(false);

            // Not grounded (high hallucination)
            node.setValue(5, ['generation', 'citationCount']);
            node.setValue(0.5, ['generation', 'hallucinationRisk']);
            node.clearCache();
            expect(await node.getValue(['generation', 'isGrounded'])).toBe(false);
        });
    });

    describe('Pipeline Metrics', () => {
        it('should calculate total latency', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(150, ['retrieval', 'retrievalLatencyMs']);
            node.setValue(800, ['generation', 'generationLatencyMs']);

            expect(await node.getValue(['metrics', 'totalLatencyMs'])).toBe(950);
        });

        it('should calculate tokens per second', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(200, ['generation', 'outputTokens']);
            node.setValue(2000, ['generation', 'generationLatencyMs']); // 2 seconds

            expect(await node.getValue(['metrics', 'tokensPerSecond'])).toBe(100);
        });

        it('should calculate pipeline score', async () => {
            const pipeline = createRAGPipeline({
                embeddingModel: 'text-embedding-3-small',
                retrievalTopK: 5,
                chunkSize: 512,
                chunkOverlap: 64,
                similarityThreshold: 0.7
            });

            const node = new PropertyNode(pipeline);
            node.setRegistry(defaultRegistry);

            node.setValue(10, ['retrieval', 'retrievedChunks']);
            node.setValue(8, ['retrieval', 'relevantChunks']); // 0.8 relevance ratio
            node.setValue(0.9, ['generation', 'confidenceScore']);
            node.setValue(0.1, ['generation', 'hallucinationRisk']);
            node.clearCache();

            // Score = 0.8 * 0.9 * (1 - 0.1) = 0.8 * 0.9 * 0.9 = 0.648
            const score = await node.getValue(['metrics', 'pipelineScore']);
            expect(score).toBeCloseTo(0.648, 3);
        });
    });

    describe('Tool Chain Execution', () => {
        it('should track chain execution progress', async () => {
            const chain = createToolChain([
                createToolDefinition({
                    id: 'search',
                    name: 'Search',
                    description: 'Search',
                    inputSchema: {},
                    estimatedLatencyMs: 500,
                    costPerCall: 0.001
                }),
                createToolDefinition({
                    id: 'summarize',
                    name: 'Summarize',
                    description: 'Summarize',
                    inputSchema: {},
                    estimatedLatencyMs: 1000,
                    costPerCall: 0.01
                })
            ]);

            const node = new PropertyNode(chain);
            node.setRegistry(defaultRegistry);

            node.setValue(5, ['execution', 'totalSteps']);
            node.setValue(2, ['execution', 'currentStep']);
            node.setValue(true, ['execution', 'isRunning']);

            expect(await node.getValue(['execution', 'progress'])).toBe(40);
            expect(await node.getValue(['execution', 'status'])).toBe('running');
        });

        it('should detect chain completion', async () => {
            const chain = createToolChain([]);

            const node = new PropertyNode(chain);
            node.setRegistry(defaultRegistry);

            node.setValue(3, ['execution', 'totalSteps']);
            node.setValue(3, ['execution', 'currentStep']);
            node.setValue(false, ['execution', 'isRunning']);
            node.setValue(false, ['execution', 'hasError']);

            expect(await node.getValue(['execution', 'isCompleted'])).toBe(true);
            expect(await node.getValue(['execution', 'status'])).toBe('completed');
        });

        it('should detect chain error', async () => {
            const chain = createToolChain([]);

            const node = new PropertyNode(chain);
            node.setRegistry(defaultRegistry);

            node.setValue(true, ['execution', 'hasError']);
            node.setValue('Tool timeout', ['execution', 'errorMessage']);

            expect(await node.getValue(['execution', 'status'])).toBe('error');
            expect(await node.getValue(['execution', 'isCompleted'])).toBe(false);
        });

        it('should calculate chain metrics', async () => {
            const chain = createToolChain([]);

            const node = new PropertyNode(chain);
            node.setRegistry(defaultRegistry);

            node.setValue(100, ['chainMetrics', 'totalToolCalls']);
            node.setValue(90, ['chainMetrics', 'successfulCalls']);
            node.setValue(50000, ['chainMetrics', 'totalLatencyMs']);
            node.setValue(0.5, ['chainMetrics', 'totalCost']);

            expect(await node.getValue(['chainMetrics', 'chainSuccessRate'])).toBe(90);
            expect(await node.getValue(['chainMetrics', 'avgLatencyPerCall'])).toBe(500);
            expect(await node.getValue(['chainMetrics', 'costPerSuccess'])).toBeCloseTo(0.00556, 4);
        });
    });
});
