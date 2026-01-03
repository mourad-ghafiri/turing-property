// ============================================================================
// SCENARIO 8: IoT Device Configuration
// ============================================================================
// Demonstrates IoT device management using the Property expression system.
// Sensor readings, thresholds, alerts, and device health are computed.
//
// Real-world use case: Smart home/industrial IoT monitoring
// ============================================================================

import { describe, test, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import { TYPE, STRING, NUMBER, BOOLEAN, TIMESTAMP } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const SENSOR = { id: 'Sensor', type: TYPE };
const DEVICE = { id: 'Device', type: TYPE };

// ============================================================================
// SENSOR FACTORY
// ============================================================================

interface SensorData {
    id: string;
    name: string;
    type: 'temperature' | 'humidity' | 'pressure' | 'motion' | 'light';
    currentValue: number;
    minThreshold: number;
    maxThreshold: number;
    lastReadingTime: number;  // Unix timestamp
    batteryLevel: number;  // 0-100
    signalStrength: number;  // 0-100
}

function createSensor(data: SensorData): Property {
    const now = Date.now();

    return {
        id: data.id,
        type: SENSOR,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            sensorType: { id: 'sensorType', type: STRING, value: data.type },
            currentValue: { id: 'currentValue', type: NUMBER, value: data.currentValue },
            minThreshold: { id: 'minThreshold', type: NUMBER, value: data.minThreshold },
            maxThreshold: { id: 'maxThreshold', type: NUMBER, value: data.maxThreshold },
            lastReadingTime: { id: 'lastReadingTime', type: TIMESTAMP, value: data.lastReadingTime },
            batteryLevel: { id: 'batteryLevel', type: NUMBER, value: data.batteryLevel },
            signalStrength: { id: 'signalStrength', type: NUMBER, value: data.signalStrength },
            currentTime: { id: 'currentTime', type: TIMESTAMP, value: now },

            // ========== COMPUTED PROPERTIES ==========

            // EXPRESSION: Is value within normal range
            isInRange: {
                id: 'isInRange',
                type: BOOLEAN,
                value: op('and',
                    op('gte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'minThreshold', 'value'])),
                    op('lte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'maxThreshold', 'value']))
                )
            },

            // EXPRESSION: Is above max threshold (high alert)
            isHighAlert: {
                id: 'isHighAlert',
                type: BOOLEAN,
                value: op('gt',
                    ref(['self', 'parent', 'currentValue', 'value']),
                    ref(['self', 'parent', 'maxThreshold', 'value'])
                )
            },

            // EXPRESSION: Is below min threshold (low alert)
            isLowAlert: {
                id: 'isLowAlert',
                type: BOOLEAN,
                value: op('lt',
                    ref(['self', 'parent', 'currentValue', 'value']),
                    ref(['self', 'parent', 'minThreshold', 'value'])
                )
            },

            // EXPRESSION: Alert level (0=normal, 1=warning, 2=critical)
            alertLevel: {
                id: 'alertLevel',
                type: NUMBER,
                value: op('if',
                    op('and',
                        op('gte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'minThreshold', 'value'])),
                        op('lte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'maxThreshold', 'value']))
                    ),
                    lit(0),  // Normal
                    op('if',
                        op('or',
                            op('gt',
                                ref(['self', 'parent', 'currentValue', 'value']),
                                op('mul', ref(['self', 'parent', 'maxThreshold', 'value']), lit(1.2))
                            ),
                            op('lt',
                                ref(['self', 'parent', 'currentValue', 'value']),
                                op('mul', ref(['self', 'parent', 'minThreshold', 'value']), lit(0.8))
                            )
                        ),
                        lit(2),  // Critical (>20% out of range)
                        lit(1)   // Warning
                    )
                )
            },

            // EXPRESSION: Deviation from normal range (percentage)
            rangeDeviation: {
                id: 'rangeDeviation',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'maxThreshold', 'value'])),
                    // Above max
                    op('mul',
                        op('div',
                            op('sub', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'maxThreshold', 'value'])),
                            ref(['self', 'parent', 'maxThreshold', 'value'])
                        ),
                        lit(100)
                    ),
                    op('if',
                        op('lt', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'minThreshold', 'value'])),
                        // Below min
                        op('mul',
                            op('div',
                                op('sub', ref(['self', 'parent', 'minThreshold', 'value']), ref(['self', 'parent', 'currentValue', 'value'])),
                                ref(['self', 'parent', 'minThreshold', 'value'])
                            ),
                            lit(100)
                        ),
                        lit(0)  // In range
                    )
                )
            },

            // EXPRESSION: Time since last reading (milliseconds)
            timeSinceReading: {
                id: 'timeSinceReading',
                type: NUMBER,
                value: op('sub',
                    ref(['self', 'parent', 'currentTime', 'value']),
                    ref(['self', 'parent', 'lastReadingTime', 'value'])
                )
            },

            // EXPRESSION: Is stale (no reading for > 5 minutes = 300000ms)
            isStale: {
                id: 'isStale',
                type: BOOLEAN,
                value: op('gt',
                    op('sub',
                        ref(['self', 'parent', 'currentTime', 'value']),
                        ref(['self', 'parent', 'lastReadingTime', 'value'])
                    ),
                    lit(300000)  // 5 minutes
                )
            },

            // EXPRESSION: Battery status (0=critical, 1=low, 2=good)
            batteryStatus: {
                id: 'batteryStatus',
                type: NUMBER,
                value: op('if',
                    op('lt', ref(['self', 'parent', 'batteryLevel', 'value']), lit(10)),
                    lit(0),  // Critical
                    op('if',
                        op('lt', ref(['self', 'parent', 'batteryLevel', 'value']), lit(25)),
                        lit(1),  // Low
                        lit(2)   // Good
                    )
                )
            },

            // EXPRESSION: Signal quality (0=poor, 1=fair, 2=good)
            signalQuality: {
                id: 'signalQuality',
                type: NUMBER,
                value: op('if',
                    op('lt', ref(['self', 'parent', 'signalStrength', 'value']), lit(30)),
                    lit(0),  // Poor
                    op('if',
                        op('lt', ref(['self', 'parent', 'signalStrength', 'value']), lit(70)),
                        lit(1),  // Fair
                        lit(2)   // Good
                    )
                )
            },

            // EXPRESSION: Overall health score (0-100)
            healthScore: {
                id: 'healthScore',
                type: NUMBER,
                value: op('round',
                    op('div',
                        op('add',
                            ref(['self', 'parent', 'batteryLevel', 'value']),
                            ref(['self', 'parent', 'signalStrength', 'value'])
                        ),
                        lit(2)
                    )
                )
            },

            // EXPRESSION: Needs attention (any alert OR low battery OR poor signal)
            needsAttention: {
                id: 'needsAttention',
                type: BOOLEAN,
                value: op('or',
                    op('not',
                        op('and',
                            op('gte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'minThreshold', 'value'])),
                            op('lte', ref(['self', 'parent', 'currentValue', 'value']), ref(['self', 'parent', 'maxThreshold', 'value']))
                        )
                    ),
                    op('or',
                        op('lt', ref(['self', 'parent', 'batteryLevel', 'value']), lit(25)),
                        op('lt', ref(['self', 'parent', 'signalStrength', 'value']), lit(30))
                    )
                )
            }
        }
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 8: IoT Device Configuration', () => {
    describe('Threshold Detection', () => {
        test('should detect value in normal range', async () => {
            const sensor = createSensor({
                id: 'temp1',
                name: 'Living Room Temp',
                type: 'temperature',
                currentValue: 22,  // Normal room temp
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now() - 1000,
                batteryLevel: 80,
                signalStrength: 90
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isInRange'])).toBe(true);
            expect(await node.getValue(['isHighAlert'])).toBe(false);
            expect(await node.getValue(['isLowAlert'])).toBe(false);
        });

        test('should detect high alert', async () => {
            const sensor = createSensor({
                id: 'temp2',
                name: 'Server Room Temp',
                type: 'temperature',
                currentValue: 35,  // Too hot!
                minThreshold: 18,
                maxThreshold: 24,
                lastReadingTime: Date.now() - 1000,
                batteryLevel: 70,
                signalStrength: 85
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isInRange'])).toBe(false);
            expect(await node.getValue(['isHighAlert'])).toBe(true);
            expect(await node.getValue(['isLowAlert'])).toBe(false);
        });

        test('should detect low alert', async () => {
            const sensor = createSensor({
                id: 'temp3',
                name: 'Freezer Temp',
                type: 'temperature',
                currentValue: -25,  // Too cold!
                minThreshold: -20,
                maxThreshold: -15,
                lastReadingTime: Date.now() - 1000,
                batteryLevel: 60,
                signalStrength: 75
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isInRange'])).toBe(false);
            expect(await node.getValue(['isHighAlert'])).toBe(false);
            expect(await node.getValue(['isLowAlert'])).toBe(true);
        });
    });

    describe('Alert Levels', () => {
        test('should return alert level 0 for normal values', async () => {
            const sensor = createSensor({
                id: 'normal',
                name: 'Normal Sensor',
                type: 'humidity',
                currentValue: 50,
                minThreshold: 30,
                maxThreshold: 70,
                lastReadingTime: Date.now(),
                batteryLevel: 90,
                signalStrength: 95
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['alertLevel'])).toBe(0);
        });

        test('should return alert level 1 for warning', async () => {
            const sensor = createSensor({
                id: 'warning',
                name: 'Warning Sensor',
                type: 'humidity',
                currentValue: 75,  // 7% above max (70), not >20%
                minThreshold: 30,
                maxThreshold: 70,
                lastReadingTime: Date.now(),
                batteryLevel: 90,
                signalStrength: 95
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['alertLevel'])).toBe(1);
        });

        test('should return alert level 2 for critical', async () => {
            const sensor = createSensor({
                id: 'critical',
                name: 'Critical Sensor',
                type: 'humidity',
                currentValue: 100,  // >20% above max (70*1.2=84)
                minThreshold: 30,
                maxThreshold: 70,
                lastReadingTime: Date.now(),
                batteryLevel: 90,
                signalStrength: 95
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['alertLevel'])).toBe(2);
        });
    });

    describe('Range Deviation', () => {
        test('should calculate deviation above max', async () => {
            const sensor = createSensor({
                id: 'high',
                name: 'High Reading',
                type: 'pressure',
                currentValue: 120,  // 20% above max of 100
                minThreshold: 80,
                maxThreshold: 100,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 85
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            const deviation = await node.getValue(['rangeDeviation']);
            expect(deviation).toBe(20);  // 20% above max
        });

        test('should calculate deviation below min', async () => {
            const sensor = createSensor({
                id: 'low',
                name: 'Low Reading',
                type: 'pressure',
                currentValue: 70,  // 12.5% below min of 80
                minThreshold: 80,
                maxThreshold: 100,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 85
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            const deviation = await node.getValue(['rangeDeviation']);
            expect(deviation).toBe(12.5);  // 12.5% below min
        });

        test('should return zero deviation when in range', async () => {
            const sensor = createSensor({
                id: 'inrange',
                name: 'In Range',
                type: 'pressure',
                currentValue: 90,
                minThreshold: 80,
                maxThreshold: 100,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 85
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['rangeDeviation'])).toBe(0);
        });
    });

    describe('Battery and Signal', () => {
        test('should detect critical battery', async () => {
            const sensor = createSensor({
                id: 'lowbat',
                name: 'Low Battery',
                type: 'motion',
                currentValue: 1,
                minThreshold: 0,
                maxThreshold: 1,
                lastReadingTime: Date.now(),
                batteryLevel: 5,  // Critical
                signalStrength: 80
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['batteryStatus'])).toBe(0);  // Critical
        });

        test('should detect low battery', async () => {
            const sensor = createSensor({
                id: 'lowbat2',
                name: 'Low Battery 2',
                type: 'motion',
                currentValue: 1,
                minThreshold: 0,
                maxThreshold: 1,
                lastReadingTime: Date.now(),
                batteryLevel: 20,  // Low
                signalStrength: 80
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['batteryStatus'])).toBe(1);  // Low
        });

        test('should detect good battery', async () => {
            const sensor = createSensor({
                id: 'goodbat',
                name: 'Good Battery',
                type: 'motion',
                currentValue: 1,
                minThreshold: 0,
                maxThreshold: 1,
                lastReadingTime: Date.now(),
                batteryLevel: 75,  // Good
                signalStrength: 80
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['batteryStatus'])).toBe(2);  // Good
        });

        test('should calculate signal quality', async () => {
            const poor = createSensor({
                id: 'poorsig',
                name: 'Poor Signal',
                type: 'light',
                currentValue: 500,
                minThreshold: 100,
                maxThreshold: 1000,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 20  // Poor
            });

            const poorNode = new PropertyNode(poor);
            poorNode.setRegistry(defaultRegistry);
            expect(await poorNode.getValue(['signalQuality'])).toBe(0);

            const fair = createSensor({
                id: 'fairsig',
                name: 'Fair Signal',
                type: 'light',
                currentValue: 500,
                minThreshold: 100,
                maxThreshold: 1000,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 50  // Fair
            });

            const fairNode = new PropertyNode(fair);
            fairNode.setRegistry(defaultRegistry);
            expect(await fairNode.getValue(['signalQuality'])).toBe(1);

            const good = createSensor({
                id: 'goodsig',
                name: 'Good Signal',
                type: 'light',
                currentValue: 500,
                minThreshold: 100,
                maxThreshold: 1000,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 85  // Good
            });

            const goodNode = new PropertyNode(good);
            goodNode.setRegistry(defaultRegistry);
            expect(await goodNode.getValue(['signalQuality'])).toBe(2);
        });
    });

    describe('Health and Attention', () => {
        test('should calculate health score', async () => {
            const sensor = createSensor({
                id: 'health',
                name: 'Health Test',
                type: 'temperature',
                currentValue: 22,
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now(),
                batteryLevel: 80,
                signalStrength: 60
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            // Health = (80 + 60) / 2 = 70
            expect(await node.getValue(['healthScore'])).toBe(70);
        });

        test('should flag sensor needing attention - out of range', async () => {
            const sensor = createSensor({
                id: 'attention1',
                name: 'Out of Range',
                type: 'temperature',
                currentValue: 30,  // Out of range
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now(),
                batteryLevel: 90,
                signalStrength: 90
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['needsAttention'])).toBe(true);
        });

        test('should flag sensor needing attention - low battery', async () => {
            const sensor = createSensor({
                id: 'attention2',
                name: 'Low Battery',
                type: 'temperature',
                currentValue: 22,  // In range
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now(),
                batteryLevel: 15,  // Low
                signalStrength: 90
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['needsAttention'])).toBe(true);
        });

        test('should flag sensor needing attention - poor signal', async () => {
            const sensor = createSensor({
                id: 'attention3',
                name: 'Poor Signal',
                type: 'temperature',
                currentValue: 22,  // In range
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now(),
                batteryLevel: 90,
                signalStrength: 20  // Poor
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['needsAttention'])).toBe(true);
        });

        test('should not flag healthy sensor', async () => {
            const sensor = createSensor({
                id: 'healthy',
                name: 'Healthy Sensor',
                type: 'temperature',
                currentValue: 22,  // In range
                minThreshold: 18,
                maxThreshold: 26,
                lastReadingTime: Date.now(),
                batteryLevel: 90,  // Good
                signalStrength: 85  // Good
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['needsAttention'])).toBe(false);
        });
    });

    describe('Stale Detection', () => {
        test('should detect stale sensor', async () => {
            const sensor = createSensor({
                id: 'stale',
                name: 'Stale Sensor',
                type: 'motion',
                currentValue: 0,
                minThreshold: 0,
                maxThreshold: 1,
                lastReadingTime: Date.now() - 600000,  // 10 minutes ago
                batteryLevel: 80,
                signalStrength: 75
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isStale'])).toBe(true);
        });

        test('should detect fresh sensor', async () => {
            const sensor = createSensor({
                id: 'fresh',
                name: 'Fresh Sensor',
                type: 'motion',
                currentValue: 1,
                minThreshold: 0,
                maxThreshold: 1,
                lastReadingTime: Date.now() - 60000,  // 1 minute ago
                batteryLevel: 80,
                signalStrength: 75
            });

            const node = new PropertyNode(sensor);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isStale'])).toBe(false);
        });
    });
});
