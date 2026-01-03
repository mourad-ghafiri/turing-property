// ============================================================================
// SCENARIO 10: ML Pipeline Configuration
// ============================================================================
// Demonstrates ML pipeline configuration using the Property expression system.
// Model performance metrics, training parameters, and deployment readiness
// are computed via expressions.
//
// Real-world use case: MLOps model registry and deployment configuration
// ============================================================================

import { describe, test, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const MODEL = { id: 'Model', type: TYPE };
const EXPERIMENT = { id: 'Experiment', type: TYPE };

// ============================================================================
// ML MODEL FACTORY
// ============================================================================

interface ModelData {
    id: string;
    name: string;
    version: string;
    framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'xgboost';
    modelType: 'classification' | 'regression' | 'clustering';

    // Performance metrics
    accuracy: number;
    precision: number;
    recall: number;
    auc: number;
    mse: number;
    r2Score: number;

    // Resource metrics
    trainingTimeMinutes: number;
    modelSizeMB: number;
    inferenceTimeMs: number;
    memoryUsageMB: number;

    // Data info
    trainingDataSize: number;
    testDataSize: number;
    featureCount: number;
    labelCount: number;

    // Status
    isValidated: boolean;
    isApproved: boolean;
}

function createModel(data: ModelData): Property {
    return {
        id: data.id,
        type: MODEL,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            version: { id: 'version', type: STRING, value: data.version },
            framework: { id: 'framework', type: STRING, value: data.framework },
            modelType: { id: 'modelType', type: STRING, value: data.modelType },

            // Performance metrics
            accuracy: { id: 'accuracy', type: NUMBER, value: data.accuracy },
            precision: { id: 'precision', type: NUMBER, value: data.precision },
            recall: { id: 'recall', type: NUMBER, value: data.recall },
            auc: { id: 'auc', type: NUMBER, value: data.auc },
            mse: { id: 'mse', type: NUMBER, value: data.mse },
            r2Score: { id: 'r2Score', type: NUMBER, value: data.r2Score },

            // Resource metrics
            trainingTimeMinutes: { id: 'trainingTimeMinutes', type: NUMBER, value: data.trainingTimeMinutes },
            modelSizeMB: { id: 'modelSizeMB', type: NUMBER, value: data.modelSizeMB },
            inferenceTimeMs: { id: 'inferenceTimeMs', type: NUMBER, value: data.inferenceTimeMs },
            memoryUsageMB: { id: 'memoryUsageMB', type: NUMBER, value: data.memoryUsageMB },

            // Data info
            trainingDataSize: { id: 'trainingDataSize', type: NUMBER, value: data.trainingDataSize },
            testDataSize: { id: 'testDataSize', type: NUMBER, value: data.testDataSize },
            featureCount: { id: 'featureCount', type: NUMBER, value: data.featureCount },
            labelCount: { id: 'labelCount', type: NUMBER, value: data.labelCount },

            // Status
            isValidated: { id: 'isValidated', type: BOOLEAN, value: data.isValidated },
            isApproved: { id: 'isApproved', type: BOOLEAN, value: data.isApproved },

            // ========== COMPUTED METRICS ==========

            // EXPRESSION: F1 Score = 2 * (precision * recall) / (precision + recall)
            f1Score: {
                id: 'f1Score',
                type: NUMBER,
                value: op('if',
                    op('gt',
                        op('add',
                            ref(['self', 'parent', 'precision', 'value']),
                            ref(['self', 'parent', 'recall', 'value'])
                        ),
                        lit(0)
                    ),
                    op('div',
                        op('mul',
                            lit(2),
                            op('mul',
                                ref(['self', 'parent', 'precision', 'value']),
                                ref(['self', 'parent', 'recall', 'value'])
                            )
                        ),
                        op('add',
                            ref(['self', 'parent', 'precision', 'value']),
                            ref(['self', 'parent', 'recall', 'value'])
                        )
                    ),
                    lit(0)
                )
            },

            // EXPRESSION: Data split ratio (test / total)
            dataSplitRatio: {
                id: 'dataSplitRatio',
                type: NUMBER,
                value: op('round',
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'testDataSize', 'value']),
                            op('add',
                                ref(['self', 'parent', 'trainingDataSize', 'value']),
                                ref(['self', 'parent', 'testDataSize', 'value'])
                            )
                        ),
                        lit(100)
                    )
                )
            },

            // EXPRESSION: Total data size
            totalDataSize: {
                id: 'totalDataSize',
                type: NUMBER,
                value: op('add',
                    ref(['self', 'parent', 'trainingDataSize', 'value']),
                    ref(['self', 'parent', 'testDataSize', 'value'])
                )
            },

            // EXPRESSION: Samples per feature ratio
            samplesPerFeature: {
                id: 'samplesPerFeature',
                type: NUMBER,
                value: op('round',
                    op('div',
                        ref(['self', 'parent', 'trainingDataSize', 'value']),
                        ref(['self', 'parent', 'featureCount', 'value'])
                    )
                )
            },

            // EXPRESSION: Has sufficient data (>= 10 samples per feature)
            hasSufficientData: {
                id: 'hasSufficientData',
                type: BOOLEAN,
                value: op('gte',
                    op('div',
                        ref(['self', 'parent', 'trainingDataSize', 'value']),
                        ref(['self', 'parent', 'featureCount', 'value'])
                    ),
                    lit(10)
                )
            },

            // EXPRESSION: Is classification model
            isClassification: {
                id: 'isClassification',
                type: BOOLEAN,
                value: op('eq',
                    ref(['self', 'parent', 'modelType', 'value']),
                    lit('classification')
                )
            },

            // EXPRESSION: Is regression model
            isRegression: {
                id: 'isRegression',
                type: BOOLEAN,
                value: op('eq',
                    ref(['self', 'parent', 'modelType', 'value']),
                    lit('regression')
                )
            },

            // EXPRESSION: Primary metric based on model type
            primaryMetric: {
                id: 'primaryMetric',
                type: NUMBER,
                value: op('if',
                    op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('classification')),
                    ref(['self', 'parent', 'accuracy', 'value']),
                    op('if',
                        op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('regression')),
                        ref(['self', 'parent', 'r2Score', 'value']),
                        lit(0)  // clustering
                    )
                )
            },

            // EXPRESSION: Performance score (0-100) based on model type
            performanceScore: {
                id: 'performanceScore',
                type: NUMBER,
                value: op('round',
                    op('mul',
                        op('if',
                            op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('classification')),
                            // Classification: weighted average of accuracy, precision, recall, AUC
                            op('div',
                                op('add',
                                    op('mul', ref(['self', 'parent', 'accuracy', 'value']), lit(0.3)),
                                    op('add',
                                        op('mul', ref(['self', 'parent', 'precision', 'value']), lit(0.2)),
                                        op('add',
                                            op('mul', ref(['self', 'parent', 'recall', 'value']), lit(0.2)),
                                            op('mul', ref(['self', 'parent', 'auc', 'value']), lit(0.3))
                                        )
                                    )
                                ),
                                lit(1)
                            ),
                            // Regression: R2 score
                            ref(['self', 'parent', 'r2Score', 'value'])
                        ),
                        lit(100)
                    )
                )
            },

            // EXPRESSION: Meets accuracy threshold (>= 0.80 for classification)
            meetsAccuracyThreshold: {
                id: 'meetsAccuracyThreshold',
                type: BOOLEAN,
                value: op('if',
                    op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('classification')),
                    op('gte', ref(['self', 'parent', 'accuracy', 'value']), lit(0.80)),
                    op('gte', ref(['self', 'parent', 'r2Score', 'value']), lit(0.70))
                )
            },

            // EXPRESSION: Is fast inference (< 100ms)
            isFastInference: {
                id: 'isFastInference',
                type: BOOLEAN,
                value: op('lt',
                    ref(['self', 'parent', 'inferenceTimeMs', 'value']),
                    lit(100)
                )
            },

            // EXPRESSION: Is lightweight (< 100MB)
            isLightweight: {
                id: 'isLightweight',
                type: BOOLEAN,
                value: op('lt',
                    ref(['self', 'parent', 'modelSizeMB', 'value']),
                    lit(100)
                )
            },

            // EXPRESSION: Is low memory (< 1024MB = 1GB)
            isLowMemory: {
                id: 'isLowMemory',
                type: BOOLEAN,
                value: op('lt',
                    ref(['self', 'parent', 'memoryUsageMB', 'value']),
                    lit(1024)
                )
            },

            // EXPRESSION: Resource efficiency score (0-100)
            resourceScore: {
                id: 'resourceScore',
                type: NUMBER,
                value: op('round',
                    op('sub',
                        lit(100),
                        op('add',
                            op('min', op('div', ref(['self', 'parent', 'inferenceTimeMs', 'value']), lit(10)), lit(30)),
                            op('add',
                                op('min', op('div', ref(['self', 'parent', 'modelSizeMB', 'value']), lit(10)), lit(35)),
                                op('min', op('div', ref(['self', 'parent', 'memoryUsageMB', 'value']), lit(100)), lit(35))
                            )
                        )
                    )
                )
            },

            // EXPRESSION: Is edge deployable (fast, lightweight, low memory)
            isEdgeDeployable: {
                id: 'isEdgeDeployable',
                type: BOOLEAN,
                value: op('and',
                    op('lt', ref(['self', 'parent', 'inferenceTimeMs', 'value']), lit(50)),
                    op('and',
                        op('lt', ref(['self', 'parent', 'modelSizeMB', 'value']), lit(50)),
                        op('lt', ref(['self', 'parent', 'memoryUsageMB', 'value']), lit(512))
                    )
                )
            },

            // EXPRESSION: Is production ready (validated, approved, meets thresholds)
            isProductionReady: {
                id: 'isProductionReady',
                type: BOOLEAN,
                value: op('and',
                    ref(['self', 'parent', 'isValidated', 'value']),
                    op('and',
                        ref(['self', 'parent', 'isApproved', 'value']),
                        op('if',
                            op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('classification')),
                            op('gte', ref(['self', 'parent', 'accuracy', 'value']), lit(0.80)),
                            op('gte', ref(['self', 'parent', 'r2Score', 'value']), lit(0.70))
                        )
                    )
                )
            },

            // EXPRESSION: Deployment recommendation
            deploymentRecommendation: {
                id: 'deploymentRecommendation',
                type: NUMBER,
                // 0 = not ready, 1 = staging only, 2 = production ready, 3 = production + edge
                value: op('if',
                    op('not',
                        op('and',
                            ref(['self', 'parent', 'isValidated', 'value']),
                            op('and',
                                ref(['self', 'parent', 'isApproved', 'value']),
                                op('if',
                                    op('eq', ref(['self', 'parent', 'modelType', 'value']), lit('classification')),
                                    op('gte', ref(['self', 'parent', 'accuracy', 'value']), lit(0.80)),
                                    op('gte', ref(['self', 'parent', 'r2Score', 'value']), lit(0.70))
                                )
                            )
                        )
                    ),
                    op('if',
                        ref(['self', 'parent', 'isValidated', 'value']),
                        lit(1),  // Staging only
                        lit(0)   // Not ready
                    ),
                    op('if',
                        op('and',
                            op('lt', ref(['self', 'parent', 'inferenceTimeMs', 'value']), lit(50)),
                            op('and',
                                op('lt', ref(['self', 'parent', 'modelSizeMB', 'value']), lit(50)),
                                op('lt', ref(['self', 'parent', 'memoryUsageMB', 'value']), lit(512))
                            )
                        ),
                        lit(3),  // Production + Edge
                        lit(2)   // Production only
                    )
                )
            }
        }
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 10: ML Pipeline Configuration', () => {
    describe('Performance Metrics', () => {
        test('should calculate F1 score', async () => {
            const model = createModel({
                id: 'model1',
                name: 'Sentiment Classifier',
                version: '1.0.0',
                framework: 'pytorch',
                modelType: 'classification',
                accuracy: 0.92,
                precision: 0.90,
                recall: 0.88,
                auc: 0.95,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 120,
                modelSizeMB: 250,
                inferenceTimeMs: 45,
                memoryUsageMB: 800,
                trainingDataSize: 50000,
                testDataSize: 10000,
                featureCount: 100,
                labelCount: 2,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            // F1 = 2 * (0.90 * 0.88) / (0.90 + 0.88) = 2 * 0.792 / 1.78 ≈ 0.89
            const f1 = await node.getValue(['f1Score']) as number;
            expect(f1).toBeCloseTo(0.89, 2);
        });

        test('should calculate performance score for classification', async () => {
            const model = createModel({
                id: 'class-model',
                name: 'Image Classifier',
                version: '2.0.0',
                framework: 'tensorflow',
                modelType: 'classification',
                accuracy: 0.95,
                precision: 0.94,
                recall: 0.93,
                auc: 0.98,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 180,
                modelSizeMB: 500,
                inferenceTimeMs: 80,
                memoryUsageMB: 1500,
                trainingDataSize: 100000,
                testDataSize: 20000,
                featureCount: 1000,
                labelCount: 10,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            // Score = (0.95*0.3 + 0.94*0.2 + 0.93*0.2 + 0.98*0.3) * 100
            // = (0.285 + 0.188 + 0.186 + 0.294) * 100 = 95.3
            const score = await node.getValue(['performanceScore']);
            expect(score).toBe(95);
        });

        test('should calculate performance score for regression', async () => {
            const model = createModel({
                id: 'reg-model',
                name: 'Price Predictor',
                version: '1.5.0',
                framework: 'xgboost',
                modelType: 'regression',
                accuracy: 0,
                precision: 0,
                recall: 0,
                auc: 0,
                mse: 0.05,
                r2Score: 0.92,
                trainingTimeMinutes: 30,
                modelSizeMB: 10,
                inferenceTimeMs: 5,
                memoryUsageMB: 200,
                trainingDataSize: 10000,
                testDataSize: 2000,
                featureCount: 50,
                labelCount: 1,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            // Score = r2Score * 100 = 0.92 * 100 = 92
            expect(await node.getValue(['performanceScore'])).toBe(92);
        });

        test('should select primary metric based on model type', async () => {
            const classifier = createModel({
                id: 'clf',
                name: 'Classifier',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.88,
                precision: 0.85,
                recall: 0.82,
                auc: 0.90,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 10,
                modelSizeMB: 5,
                inferenceTimeMs: 2,
                memoryUsageMB: 100,
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 20,
                labelCount: 2,
                isValidated: false,
                isApproved: false
            });

            const clfNode = new PropertyNode(classifier);
            clfNode.setRegistry(defaultRegistry);
            expect(await clfNode.getValue(['primaryMetric'])).toBe(0.88);  // accuracy

            const regressor = createModel({
                id: 'reg',
                name: 'Regressor',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'regression',
                accuracy: 0,
                precision: 0,
                recall: 0,
                auc: 0,
                mse: 0.1,
                r2Score: 0.85,
                trainingTimeMinutes: 5,
                modelSizeMB: 2,
                inferenceTimeMs: 1,
                memoryUsageMB: 50,
                trainingDataSize: 3000,
                testDataSize: 600,
                featureCount: 15,
                labelCount: 1,
                isValidated: false,
                isApproved: false
            });

            const regNode = new PropertyNode(regressor);
            regNode.setRegistry(defaultRegistry);
            expect(await regNode.getValue(['primaryMetric'])).toBe(0.85);  // r2Score
        });
    });

    describe('Data Quality', () => {
        test('should calculate data split ratio', async () => {
            const model = createModel({
                id: 'data-model',
                name: 'Data Test',
                version: '1.0.0',
                framework: 'pytorch',
                modelType: 'classification',
                accuracy: 0.85,
                precision: 0.82,
                recall: 0.80,
                auc: 0.88,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 60,
                modelSizeMB: 100,
                inferenceTimeMs: 20,
                memoryUsageMB: 400,
                trainingDataSize: 8000,
                testDataSize: 2000,  // 20% test split
                featureCount: 50,
                labelCount: 3,
                isValidated: true,
                isApproved: false
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            // Split ratio = 2000 / 10000 * 100 = 20%
            expect(await node.getValue(['dataSplitRatio'])).toBe(20);
            expect(await node.getValue(['totalDataSize'])).toBe(10000);
        });

        test('should calculate samples per feature', async () => {
            const model = createModel({
                id: 'samples-model',
                name: 'Samples Test',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.80,
                precision: 0.78,
                recall: 0.75,
                auc: 0.82,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 15,
                modelSizeMB: 10,
                inferenceTimeMs: 5,
                memoryUsageMB: 150,
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 100,  // 5000 / 100 = 50 samples per feature
                labelCount: 2,
                isValidated: true,
                isApproved: false
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['samplesPerFeature'])).toBe(50);
            expect(await node.getValue(['hasSufficientData'])).toBe(true);
        });

        test('should detect insufficient data', async () => {
            const model = createModel({
                id: 'small-model',
                name: 'Small Data',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.65,
                precision: 0.60,
                recall: 0.58,
                auc: 0.68,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 2,
                modelSizeMB: 1,
                inferenceTimeMs: 1,
                memoryUsageMB: 50,
                trainingDataSize: 500,
                testDataSize: 100,
                featureCount: 100,  // 500 / 100 = 5 samples per feature (< 10)
                labelCount: 2,
                isValidated: false,
                isApproved: false
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['samplesPerFeature'])).toBe(5);
            expect(await node.getValue(['hasSufficientData'])).toBe(false);
        });
    });

    describe('Resource Efficiency', () => {
        test('should detect fast inference', async () => {
            const fast = createModel({
                id: 'fast-model',
                name: 'Fast Model',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.82,
                precision: 0.80,
                recall: 0.78,
                auc: 0.85,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 5,
                modelSizeMB: 5,
                inferenceTimeMs: 10,  // Fast
                memoryUsageMB: 100,
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 30,
                labelCount: 2,
                isValidated: true,
                isApproved: true
            });

            const fastNode = new PropertyNode(fast);
            fastNode.setRegistry(defaultRegistry);
            expect(await fastNode.getValue(['isFastInference'])).toBe(true);

            const slow = createModel({
                id: 'slow-model',
                name: 'Slow Model',
                version: '1.0.0',
                framework: 'tensorflow',
                modelType: 'classification',
                accuracy: 0.95,
                precision: 0.94,
                recall: 0.93,
                auc: 0.97,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 300,
                modelSizeMB: 1000,
                inferenceTimeMs: 500,  // Slow
                memoryUsageMB: 4000,
                trainingDataSize: 100000,
                testDataSize: 20000,
                featureCount: 500,
                labelCount: 100,
                isValidated: true,
                isApproved: true
            });

            const slowNode = new PropertyNode(slow);
            slowNode.setRegistry(defaultRegistry);
            expect(await slowNode.getValue(['isFastInference'])).toBe(false);
        });

        test('should detect edge deployable models', async () => {
            const edgeModel = createModel({
                id: 'edge-model',
                name: 'Edge Classifier',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.85,
                precision: 0.83,
                recall: 0.81,
                auc: 0.88,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 10,
                modelSizeMB: 20,      // < 50MB
                inferenceTimeMs: 15,   // < 50ms
                memoryUsageMB: 200,    // < 512MB
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 30,
                labelCount: 3,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(edgeModel);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isEdgeDeployable'])).toBe(true);
        });

        test('should reject heavy models for edge', async () => {
            const heavyModel = createModel({
                id: 'heavy-model',
                name: 'Heavy Model',
                version: '1.0.0',
                framework: 'pytorch',
                modelType: 'classification',
                accuracy: 0.98,
                precision: 0.97,
                recall: 0.96,
                auc: 0.99,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 500,
                modelSizeMB: 500,      // Too big
                inferenceTimeMs: 200,  // Too slow
                memoryUsageMB: 2000,   // Too much memory
                trainingDataSize: 500000,
                testDataSize: 100000,
                featureCount: 2000,
                labelCount: 1000,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(heavyModel);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isEdgeDeployable'])).toBe(false);
        });
    });

    describe('Production Readiness', () => {
        test('should identify production ready model', async () => {
            const readyModel = createModel({
                id: 'ready-model',
                name: 'Production Ready',
                version: '2.0.0',
                framework: 'pytorch',
                modelType: 'classification',
                accuracy: 0.92,       // >= 0.80
                precision: 0.90,
                recall: 0.88,
                auc: 0.95,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 100,
                modelSizeMB: 150,
                inferenceTimeMs: 50,
                memoryUsageMB: 600,
                trainingDataSize: 50000,
                testDataSize: 10000,
                featureCount: 100,
                labelCount: 5,
                isValidated: true,    // Required
                isApproved: true      // Required
            });

            const node = new PropertyNode(readyModel);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isProductionReady'])).toBe(true);
            expect(await node.getValue(['meetsAccuracyThreshold'])).toBe(true);
        });

        test('should reject unvalidated model', async () => {
            const unvalidated = createModel({
                id: 'unvalidated',
                name: 'Not Validated',
                version: '0.1.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.95,
                precision: 0.94,
                recall: 0.93,
                auc: 0.97,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 5,
                modelSizeMB: 5,
                inferenceTimeMs: 2,
                memoryUsageMB: 50,
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 20,
                labelCount: 2,
                isValidated: false,   // Not validated
                isApproved: true
            });

            const node = new PropertyNode(unvalidated);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isProductionReady'])).toBe(false);
        });

        test('should reject low accuracy model', async () => {
            const lowAccuracy = createModel({
                id: 'low-acc',
                name: 'Low Accuracy',
                version: '1.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.70,       // < 0.80
                precision: 0.68,
                recall: 0.65,
                auc: 0.72,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 10,
                modelSizeMB: 10,
                inferenceTimeMs: 5,
                memoryUsageMB: 100,
                trainingDataSize: 5000,
                testDataSize: 1000,
                featureCount: 30,
                labelCount: 2,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(lowAccuracy);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['meetsAccuracyThreshold'])).toBe(false);
            expect(await node.getValue(['isProductionReady'])).toBe(false);
        });
    });

    describe('Deployment Recommendations', () => {
        test('should recommend not ready (0) for unvalidated', async () => {
            const model = createModel({
                id: 'no-validate',
                name: 'No Validation',
                version: '0.1.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.85,
                precision: 0.82,
                recall: 0.80,
                auc: 0.88,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 5,
                modelSizeMB: 5,
                inferenceTimeMs: 5,
                memoryUsageMB: 50,
                trainingDataSize: 3000,
                testDataSize: 600,
                featureCount: 20,
                labelCount: 2,
                isValidated: false,
                isApproved: false
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['deploymentRecommendation'])).toBe(0);
        });

        test('should recommend staging (1) for validated but not approved', async () => {
            const model = createModel({
                id: 'staging-only',
                name: 'Staging Model',
                version: '1.0.0-beta',
                framework: 'pytorch',
                modelType: 'classification',
                accuracy: 0.85,
                precision: 0.82,
                recall: 0.80,
                auc: 0.88,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 30,
                modelSizeMB: 50,
                inferenceTimeMs: 20,
                memoryUsageMB: 300,
                trainingDataSize: 10000,
                testDataSize: 2000,
                featureCount: 50,
                labelCount: 3,
                isValidated: true,
                isApproved: false  // Not approved
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['deploymentRecommendation'])).toBe(1);
        });

        test('should recommend production (2) for ready but heavy', async () => {
            const model = createModel({
                id: 'prod-only',
                name: 'Production Heavy',
                version: '2.0.0',
                framework: 'tensorflow',
                modelType: 'classification',
                accuracy: 0.95,
                precision: 0.94,
                recall: 0.93,
                auc: 0.97,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 200,
                modelSizeMB: 300,      // Too big for edge
                inferenceTimeMs: 100,  // Too slow for edge
                memoryUsageMB: 1500,   // Too much memory
                trainingDataSize: 100000,
                testDataSize: 20000,
                featureCount: 500,
                labelCount: 10,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['deploymentRecommendation'])).toBe(2);
        });

        test('should recommend production + edge (3) for optimized', async () => {
            const model = createModel({
                id: 'edge-ready',
                name: 'Edge Optimized',
                version: '3.0.0',
                framework: 'sklearn',
                modelType: 'classification',
                accuracy: 0.88,
                precision: 0.86,
                recall: 0.84,
                auc: 0.90,
                mse: 0,
                r2Score: 0,
                trainingTimeMinutes: 15,
                modelSizeMB: 25,      // < 50MB
                inferenceTimeMs: 10,  // < 50ms
                memoryUsageMB: 200,   // < 512MB
                trainingDataSize: 20000,
                testDataSize: 4000,
                featureCount: 40,
                labelCount: 4,
                isValidated: true,
                isApproved: true
            });

            const node = new PropertyNode(model);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['deploymentRecommendation'])).toBe(3);
        });
    });
});
