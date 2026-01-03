// ============================================================================
// SCENARIO 3: Business Rule Engine
// ============================================================================
// Demonstrates a declarative rule engine where conditions and actions are
// expressed entirely through the Property expression system.
//
// Real-world use case: Loan approval system with complex eligibility rules
// ============================================================================

import { describe, test, expect, beforeEach } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import {
    TYPE, STRING, NUMBER, BOOLEAN, OBJECT, LIST,
    tString, tNumber, tBoolean, tObject, tList, tEnum
} from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const RULE = { id: 'Rule', type: TYPE };
const RULE_SET = { id: 'RuleSet', type: TYPE };
const APPLICANT = { id: 'Applicant', type: TYPE };
const LOAN_APPLICATION = { id: 'LoanApplication', type: TYPE };

const RuleOutcome = tEnum('RuleOutcome', ['approved', 'rejected', 'review', 'pending']);
const EmploymentType = tEnum('EmploymentType', ['full_time', 'part_time', 'self_employed', 'unemployed']);
const CreditRating = tEnum('CreditRating', ['excellent', 'good', 'fair', 'poor']);

// ============================================================================
// RULE FACTORY - Creates rules with expression-based conditions
// ============================================================================

interface RuleConfig {
    id: string;
    name: string;
    priority: number;
    condition: Property;  // Expression that evaluates to boolean
    outcome: string;
    reason: string;
}

function createRule(config: RuleConfig): Property {
    return {
        id: config.id,
        type: RULE,
        children: {
            name: { id: 'name', type: STRING, value: config.name },
            priority: { id: 'priority', type: NUMBER, value: config.priority },
            condition: { id: 'condition', type: BOOLEAN, value: config.condition },
            outcome: { id: 'outcome', type: STRING, value: config.outcome },
            reason: { id: 'reason', type: STRING, value: config.reason }
        }
    };
}

// ============================================================================
// LOAN APPLICATION SCHEMA
// ============================================================================

function createLoanApplication(data: {
    applicantName: string;
    age: number;
    annualIncome: number;
    employmentType: string;
    yearsEmployed: number;
    creditScore: number;
    existingDebt: number;
    requestedAmount: number;
    loanTermMonths: number;
}): Property {
    return {
        id: 'loanApplication',
        type: LOAN_APPLICATION,
        children: {
            // Applicant info - direct values (NOT wrapped in lit())
            applicantName: { id: 'applicantName', type: STRING, value: data.applicantName },
            age: { id: 'age', type: NUMBER, value: data.age },
            annualIncome: { id: 'annualIncome', type: NUMBER, value: data.annualIncome },
            employmentType: { id: 'employmentType', type: STRING, value: data.employmentType },
            yearsEmployed: { id: 'yearsEmployed', type: NUMBER, value: data.yearsEmployed },
            creditScore: { id: 'creditScore', type: NUMBER, value: data.creditScore },
            existingDebt: { id: 'existingDebt', type: NUMBER, value: data.existingDebt },

            // Loan details - direct values
            requestedAmount: { id: 'requestedAmount', type: NUMBER, value: data.requestedAmount },
            loanTermMonths: { id: 'loanTermMonths', type: NUMBER, value: data.loanTermMonths },

            // Computed metrics using expressions
            debtToIncomeRatio: {
                id: 'debtToIncomeRatio',
                type: NUMBER,
                value: op('div',
                    ref(['self', 'parent', 'existingDebt', 'value']),
                    ref(['self', 'parent', 'annualIncome', 'value'])
                )
            },

            monthlyPaymentEstimate: {
                id: 'monthlyPaymentEstimate',
                type: NUMBER,
                // Simplified: amount / term (not including interest for simplicity)
                value: op('div',
                    ref(['self', 'parent', 'requestedAmount', 'value']),
                    ref(['self', 'parent', 'loanTermMonths', 'value'])
                )
            },

            monthlyIncome: {
                id: 'monthlyIncome',
                type: NUMBER,
                value: op('div',
                    ref(['self', 'parent', 'annualIncome', 'value']),
                    lit(12)
                )
            },

            paymentToIncomeRatio: {
                id: 'paymentToIncomeRatio',
                type: NUMBER,
                // monthlyPayment / monthlyIncome
                value: op('div',
                    op('div',
                        ref(['self', 'parent', 'requestedAmount', 'value']),
                        ref(['self', 'parent', 'loanTermMonths', 'value'])
                    ),
                    op('div',
                        ref(['self', 'parent', 'annualIncome', 'value']),
                        lit(12)
                    )
                )
            },

            // Credit rating based on score
            creditRating: {
                id: 'creditRating',
                type: STRING,
                value: op('if',
                    op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(750)),
                    lit('excellent'),
                    op('if',
                        op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(700)),
                        lit('good'),
                        op('if',
                            op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(650)),
                            lit('fair'),
                            lit('poor')
                        )
                    )
                )
            },

            // Risk score (0-100, lower is better)
            riskScore: {
                id: 'riskScore',
                type: NUMBER,
                // Risk = 100 - (creditScore - 300) / 5.5 + (debtToIncomeRatio * 50)
                value: op('add',
                    op('sub',
                        lit(100),
                        op('div',
                            op('sub',
                                ref(['self', 'parent', 'creditScore', 'value']),
                                lit(300)
                            ),
                            lit(5.5)
                        )
                    ),
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'existingDebt', 'value']),
                            ref(['self', 'parent', 'annualIncome', 'value'])
                        ),
                        lit(50)
                    )
                )
            }
        }
    };
}

// ============================================================================
// RULE ENGINE
// ============================================================================

class RuleEngine {
    private rules: Property[] = [];

    addRule(rule: Property): void {
        this.rules.push(rule);
    }

    // Evaluate a single rule against an application
    async evaluateRule(rule: Property, application: Property): Promise<{
        ruleName: string;
        priority: number;
        passed: boolean;
        outcome: string;
        reason: string;
    }> {
        // Create a combined context with the application data
        const ruleNode = new PropertyNode(rule);
        ruleNode.setRegistry(defaultRegistry);

        const appNode = new PropertyNode(application);
        appNode.setRegistry(defaultRegistry);

        // Get rule metadata
        const ruleName = await ruleNode.getValue(['name']) as string;
        const priority = await ruleNode.getValue(['priority']) as number;
        const outcome = await ruleNode.getValue(['outcome']) as string;
        const reason = await ruleNode.getValue(['reason']) as string;

        // Create evaluation context that includes application data
        const evaluationContext = this.createEvaluationContext(rule, application);
        const contextNode = new PropertyNode(evaluationContext);
        contextNode.setRegistry(defaultRegistry);

        // Evaluate the condition
        const passed = await contextNode.getValue(['conditionResult']) as boolean;

        return { ruleName, priority, passed, outcome, reason };
    }

    // Create a context that combines rule condition with application data
    private createEvaluationContext(rule: Property, application: Property): Property {
        const appChildren = application.children || {};
        const ruleCondition = rule.children?.condition;

        // Build context with all application values as literals (pre-evaluated)
        // and the rule condition referencing them
        return {
            id: 'evaluationContext',
            type: OBJECT,
            children: {
                // Copy application values
                ...appChildren,
                // Add the condition to evaluate
                conditionResult: ruleCondition!
            }
        };
    }

    // Evaluate all rules and return the final decision
    async evaluate(application: Property): Promise<{
        decision: string;
        reason: string;
        ruleResults: Array<{
            ruleName: string;
            priority: number;
            passed: boolean;
            outcome: string;
            reason: string;
        }>;
        metrics: Record<string, number | string>;
    }> {
        // First, calculate application metrics
        const appNode = new PropertyNode(application);
        appNode.setRegistry(defaultRegistry);

        const metrics = {
            debtToIncomeRatio: await appNode.getValue(['debtToIncomeRatio']) as number,
            paymentToIncomeRatio: await appNode.getValue(['paymentToIncomeRatio']) as number,
            creditRating: await appNode.getValue(['creditRating']) as string,
            riskScore: await appNode.getValue(['riskScore']) as number
        };

        // Evaluate all rules
        const results: Array<{
            ruleName: string;
            priority: number;
            passed: boolean;
            outcome: string;
            reason: string;
        }> = [];

        for (const rule of this.rules) {
            const result = await this.evaluateRule(rule, application);
            results.push(result);
        }

        // Sort by priority (lower number = higher priority)
        results.sort((a, b) => a.priority - b.priority);

        // Find the first passing rule (highest priority)
        const passingRule = results.find(r => r.passed);

        return {
            decision: passingRule?.outcome || 'pending',
            reason: passingRule?.reason || 'No rules matched',
            ruleResults: results,
            metrics
        };
    }
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 3: Business Rule Engine', () => {
    let engine: RuleEngine;

    beforeEach(() => {
        engine = new RuleEngine();

        // Rule 1: Auto-reject if credit score < 500 (highest priority)
        engine.addRule(createRule({
            id: 'rule_credit_minimum',
            name: 'Minimum Credit Score',
            priority: 1,
            condition: op('lt',
                ref(['self', 'parent', 'creditScore', 'value']),
                lit(500)
            ),
            outcome: 'rejected',
            reason: 'Credit score below minimum threshold'
        }));

        // Rule 2: Auto-reject if unemployed
        engine.addRule(createRule({
            id: 'rule_employment',
            name: 'Employment Required',
            priority: 2,
            condition: op('eq',
                ref(['self', 'parent', 'employmentType', 'value']),
                lit('unemployed')
            ),
            outcome: 'rejected',
            reason: 'Applicant must be employed'
        }));

        // Rule 3: Auto-reject if debt-to-income > 50%
        engine.addRule(createRule({
            id: 'rule_dti',
            name: 'Debt-to-Income Limit',
            priority: 3,
            condition: op('gt',
                op('div',
                    ref(['self', 'parent', 'existingDebt', 'value']),
                    ref(['self', 'parent', 'annualIncome', 'value'])
                ),
                lit(0.5)
            ),
            outcome: 'rejected',
            reason: 'Debt-to-income ratio exceeds 50%'
        }));

        // Rule 4: Auto-reject if age < 18
        engine.addRule(createRule({
            id: 'rule_age',
            name: 'Minimum Age',
            priority: 4,
            condition: op('lt',
                ref(['self', 'parent', 'age', 'value']),
                lit(18)
            ),
            outcome: 'rejected',
            reason: 'Applicant must be 18 or older'
        }));

        // Rule 5: Auto-approve if excellent credit AND low debt AND employed > 2 years
        engine.addRule(createRule({
            id: 'rule_auto_approve',
            name: 'Auto-Approval Criteria',
            priority: 10,
            condition: op('and',
                op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(750)),
                op('and',
                    op('lt',
                        op('div',
                            ref(['self', 'parent', 'existingDebt', 'value']),
                            ref(['self', 'parent', 'annualIncome', 'value'])
                        ),
                        lit(0.3)
                    ),
                    op('gte', ref(['self', 'parent', 'yearsEmployed', 'value']), lit(2))
                )
            ),
            outcome: 'approved',
            reason: 'Meets all auto-approval criteria'
        }));

        // Rule 6: Manual review if credit >= 600 AND employed (catches cases that don't auto-approve)
        engine.addRule(createRule({
            id: 'rule_manual_review',
            name: 'Manual Review Required',
            priority: 20,
            condition: op('and',
                op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(600)),
                op('neq', ref(['self', 'parent', 'employmentType', 'value']), lit('unemployed'))
            ),
            outcome: 'review',
            reason: 'Application requires manual review'
        }));

        // Rule 7: Reject if credit 500-600
        engine.addRule(createRule({
            id: 'rule_low_credit',
            name: 'Low Credit Score',
            priority: 30,
            condition: op('and',
                op('gte', ref(['self', 'parent', 'creditScore', 'value']), lit(500)),
                op('lt', ref(['self', 'parent', 'creditScore', 'value']), lit(600))
            ),
            outcome: 'rejected',
            reason: 'Credit score too low for approval'
        }));
    });

    describe('Application Metrics Calculation', () => {
        test('should calculate debt-to-income ratio', async () => {
            const app = createLoanApplication({
                applicantName: 'John Doe',
                age: 35,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 750,
                existingDebt: 20000,
                requestedAmount: 50000,
                loanTermMonths: 60
            });

            const node = new PropertyNode(app);
            node.setRegistry(defaultRegistry);

            const dti = await node.getValue(['debtToIncomeRatio']);
            expect(dti).toBeCloseTo(0.2, 2);  // 20000 / 100000 = 0.2
        });

        test('should calculate monthly payment estimate', async () => {
            const app = createLoanApplication({
                applicantName: 'Jane Smith',
                age: 28,
                annualIncome: 80000,
                employmentType: 'full_time',
                yearsEmployed: 3,
                creditScore: 720,
                existingDebt: 10000,
                requestedAmount: 24000,
                loanTermMonths: 48
            });

            const node = new PropertyNode(app);
            node.setRegistry(defaultRegistry);

            const payment = await node.getValue(['monthlyPaymentEstimate']);
            expect(payment).toBe(500);  // 24000 / 48 = 500
        });

        test('should calculate payment-to-income ratio', async () => {
            const app = createLoanApplication({
                applicantName: 'Bob Wilson',
                age: 40,
                annualIncome: 60000,  // 5000/month
                employmentType: 'full_time',
                yearsEmployed: 10,
                creditScore: 700,
                existingDebt: 5000,
                requestedAmount: 12000,  // 500/month for 24 months
                loanTermMonths: 24
            });

            const node = new PropertyNode(app);
            node.setRegistry(defaultRegistry);

            const ratio = await node.getValue(['paymentToIncomeRatio']);
            expect(ratio).toBeCloseTo(0.1, 2);  // 500 / 5000 = 0.1
        });

        test('should determine credit rating from score', async () => {
            const testCases = [
                { score: 800, expected: 'excellent' },
                { score: 750, expected: 'excellent' },
                { score: 720, expected: 'good' },
                { score: 700, expected: 'good' },
                { score: 680, expected: 'fair' },
                { score: 650, expected: 'fair' },
                { score: 620, expected: 'poor' },
                { score: 500, expected: 'poor' }
            ];

            for (const tc of testCases) {
                const app = createLoanApplication({
                    applicantName: 'Test',
                    age: 30,
                    annualIncome: 50000,
                    employmentType: 'full_time',
                    yearsEmployed: 2,
                    creditScore: tc.score,
                    existingDebt: 0,
                    requestedAmount: 10000,
                    loanTermMonths: 12
                });

                const node = new PropertyNode(app);
                node.setRegistry(defaultRegistry);

                const rating = await node.getValue(['creditRating']);
                expect(rating).toBe(tc.expected);
            }
        });

        test('should calculate risk score', async () => {
            // Risk = 100 - (creditScore - 300) / 5.5 + (debtToIncomeRatio * 50)
            const app = createLoanApplication({
                applicantName: 'Test',
                age: 30,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 750,  // (750-300)/5.5 = 81.8
                existingDebt: 20000,  // DTI = 0.2, * 50 = 10
                requestedAmount: 50000,
                loanTermMonths: 60
            });

            const node = new PropertyNode(app);
            node.setRegistry(defaultRegistry);

            const risk = await node.getValue(['riskScore']) as number;
            // 100 - 81.8 + 10 = 28.2
            expect(risk).toBeCloseTo(28.18, 1);
        });
    });

    describe('Individual Rule Evaluation', () => {
        test('should reject applicant with credit score below 500', async () => {
            const app = createLoanApplication({
                applicantName: 'Low Credit',
                age: 30,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 450,
                existingDebt: 0,
                requestedAmount: 10000,
                loanTermMonths: 12
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Credit score below minimum threshold');
        });

        test('should reject unemployed applicant', async () => {
            const app = createLoanApplication({
                applicantName: 'Unemployed',
                age: 30,
                annualIncome: 20000,  // Maybe savings/investments
                employmentType: 'unemployed',
                yearsEmployed: 0,
                creditScore: 700,
                existingDebt: 0,
                requestedAmount: 5000,
                loanTermMonths: 12
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Applicant must be employed');
        });

        test('should reject applicant with high debt-to-income ratio', async () => {
            const app = createLoanApplication({
                applicantName: 'High Debt',
                age: 35,
                annualIncome: 50000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 700,
                existingDebt: 30000,  // 60% DTI
                requestedAmount: 10000,
                loanTermMonths: 24
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Debt-to-income ratio exceeds 50%');
        });

        test('should reject minor applicant', async () => {
            const app = createLoanApplication({
                applicantName: 'Minor',
                age: 17,
                annualIncome: 10000,
                employmentType: 'part_time',
                yearsEmployed: 1,
                creditScore: 650,
                existingDebt: 0,
                requestedAmount: 1000,
                loanTermMonths: 6
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Applicant must be 18 or older');
        });
    });

    describe('Auto-Approval Rules', () => {
        test('should auto-approve excellent applicant', async () => {
            const app = createLoanApplication({
                applicantName: 'Perfect Applicant',
                age: 35,
                annualIncome: 120000,
                employmentType: 'full_time',
                yearsEmployed: 8,
                creditScore: 780,
                existingDebt: 10000,  // 8.3% DTI
                requestedAmount: 50000,
                loanTermMonths: 60
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('approved');
            expect(result.reason).toBe('Meets all auto-approval criteria');
        });

        test('should not auto-approve if employed less than 2 years', async () => {
            const app = createLoanApplication({
                applicantName: 'New Employee',
                age: 28,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 1,  // Less than 2 years
                creditScore: 780,
                existingDebt: 5000,
                requestedAmount: 20000,
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);

            // Should go to manual review instead
            expect(result.decision).toBe('review');
        });

        test('should not auto-approve if DTI >= 30%', async () => {
            const app = createLoanApplication({
                applicantName: 'Higher DTI',
                age: 40,
                annualIncome: 80000,
                employmentType: 'full_time',
                yearsEmployed: 10,
                creditScore: 780,
                existingDebt: 30000,  // 37.5% DTI
                requestedAmount: 20000,
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);

            // Should go to manual review
            expect(result.decision).toBe('review');
        });
    });

    describe('Manual Review Rules', () => {
        test('should require manual review for mid-range credit', async () => {
            const app = createLoanApplication({
                applicantName: 'Average Joe',
                age: 32,
                annualIncome: 65000,
                employmentType: 'full_time',
                yearsEmployed: 4,
                creditScore: 680,  // Fair credit
                existingDebt: 8000,
                requestedAmount: 15000,
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('review');
            expect(result.reason).toBe('Application requires manual review');
        });

        test('should require manual review for self-employed with good credit', async () => {
            const app = createLoanApplication({
                applicantName: 'Self Employed',
                age: 45,
                annualIncome: 90000,
                employmentType: 'self_employed',
                yearsEmployed: 6,
                creditScore: 720,
                existingDebt: 15000,
                requestedAmount: 30000,
                loanTermMonths: 48
            });

            const result = await engine.evaluate(app);

            expect(result.decision).toBe('review');
        });
    });

    describe('Rule Priority', () => {
        test('should apply higher priority rules first', async () => {
            // This applicant would match multiple rules:
            // - Credit score 480 < 500 (Rule 1, priority 1) - REJECT
            // - Unemployed (Rule 2, priority 2) - would also match
            // - High DTI (Rule 3, priority 3) - would also match
            const app = createLoanApplication({
                applicantName: 'Multi-Match',
                age: 30,
                annualIncome: 20000,
                employmentType: 'unemployed',
                yearsEmployed: 0,
                creditScore: 480,
                existingDebt: 15000,  // 75% DTI
                requestedAmount: 5000,
                loanTermMonths: 12
            });

            const result = await engine.evaluate(app);

            // Should reject for credit score (highest priority rule)
            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Credit score below minimum threshold');

            // Verify rule priorities
            expect(result.ruleResults[0].priority).toBeLessThan(result.ruleResults[1].priority);
        });

        test('should return all evaluated rules', async () => {
            const app = createLoanApplication({
                applicantName: 'Test',
                age: 35,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 780,
                existingDebt: 10000,
                requestedAmount: 25000,
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);

            // Should have evaluated all 7 rules
            expect(result.ruleResults.length).toBe(7);

            // Rules should be sorted by priority
            for (let i = 1; i < result.ruleResults.length; i++) {
                expect(result.ruleResults[i].priority).toBeGreaterThanOrEqual(
                    result.ruleResults[i - 1].priority
                );
            }
        });
    });

    describe('Complex Conditions', () => {
        test('should handle AND conditions correctly', async () => {
            // Auto-approval requires ALL conditions:
            // creditScore >= 750 AND DTI < 30% AND yearsEmployed >= 2

            // Test case: All conditions met
            const app1 = createLoanApplication({
                applicantName: 'All Met',
                age: 35,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 760,
                existingDebt: 10000,  // 10% DTI
                requestedAmount: 20000,
                loanTermMonths: 24
            });

            const result1 = await engine.evaluate(app1);
            expect(result1.decision).toBe('approved');

            // Test case: Credit met, DTI met, but years not met
            const app2 = createLoanApplication({
                applicantName: 'Years Not Met',
                age: 25,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 1,  // < 2
                creditScore: 760,
                existingDebt: 10000,
                requestedAmount: 20000,
                loanTermMonths: 24
            });

            const result2 = await engine.evaluate(app2);
            expect(result2.decision).toBe('review');  // Falls to manual review
        });

        test('should handle nested conditions', async () => {
            // Manual review: (credit >= 600 AND credit < 750) AND employed
            const app = createLoanApplication({
                applicantName: 'Nested Test',
                age: 30,
                annualIncome: 70000,
                employmentType: 'part_time',
                yearsEmployed: 2,
                creditScore: 680,  // Between 600-750
                existingDebt: 5000,
                requestedAmount: 10000,
                loanTermMonths: 24
            });

            const result = await engine.evaluate(app);
            expect(result.decision).toBe('review');
        });
    });

    describe('Edge Cases', () => {
        test('should handle boundary credit score 500 (not rejected by min rule)', async () => {
            const app = createLoanApplication({
                applicantName: 'Boundary',
                age: 30,
                annualIncome: 60000,
                employmentType: 'full_time',
                yearsEmployed: 3,
                creditScore: 500,  // Exactly 500, should NOT trigger < 500 rule
                existingDebt: 5000,
                requestedAmount: 10000,
                loanTermMonths: 24
            });

            const result = await engine.evaluate(app);

            // Should be rejected by low credit rule (500-600), not minimum rule
            expect(result.decision).toBe('rejected');
            expect(result.reason).toBe('Credit score too low for approval');
        });

        test('should handle boundary credit score 750 (auto-approve threshold)', async () => {
            const app = createLoanApplication({
                applicantName: 'Boundary 750',
                age: 35,
                annualIncome: 100000,
                employmentType: 'full_time',
                yearsEmployed: 5,
                creditScore: 750,  // Exactly 750
                existingDebt: 10000,  // 10% DTI
                requestedAmount: 20000,
                loanTermMonths: 24
            });

            const result = await engine.evaluate(app);
            expect(result.decision).toBe('approved');
        });

        test('should handle zero existing debt', async () => {
            const app = createLoanApplication({
                applicantName: 'No Debt',
                age: 30,
                annualIncome: 80000,
                employmentType: 'full_time',
                yearsEmployed: 4,
                creditScore: 780,
                existingDebt: 0,  // No debt
                requestedAmount: 25000,
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);
            expect(result.decision).toBe('approved');
            expect(result.metrics.debtToIncomeRatio).toBe(0);
        });
    });

    describe('Metrics in Result', () => {
        test('should include all computed metrics in result', async () => {
            const app = createLoanApplication({
                applicantName: 'Metrics Test',
                age: 35,
                annualIncome: 120000,
                employmentType: 'full_time',
                yearsEmployed: 8,
                creditScore: 780,
                existingDebt: 24000,  // 20% DTI
                requestedAmount: 36000,  // 1000/month for 36 months
                loanTermMonths: 36
            });

            const result = await engine.evaluate(app);

            expect(result.metrics).toBeDefined();
            expect(result.metrics.debtToIncomeRatio).toBeCloseTo(0.2, 2);
            expect(result.metrics.paymentToIncomeRatio).toBeCloseTo(0.1, 2);  // 1000 / 10000
            expect(result.metrics.creditRating).toBe('excellent');
            expect(typeof result.metrics.riskScore).toBe('number');
        });
    });
});
