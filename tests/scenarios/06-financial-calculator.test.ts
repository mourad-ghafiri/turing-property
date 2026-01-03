// ============================================================================
// SCENARIO 6: Financial Calculator
// ============================================================================
// Demonstrates financial calculations using the Property expression system.
// All calculations use declarative expressions for automatic evaluation.
//
// Real-world use case: Investment portfolio and loan calculator
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

const INVESTMENT = { id: 'Investment', type: TYPE };
const LOAN = { id: 'Loan', type: TYPE };
const PORTFOLIO = { id: 'Portfolio', type: TYPE };

// ============================================================================
// INVESTMENT FACTORY
// ============================================================================

interface InvestmentData {
    id: string;
    name: string;
    principal: number;
    annualRate: number;  // As decimal (0.05 = 5%)
    years: number;
    compoundingPerYear: number;  // 1=annual, 4=quarterly, 12=monthly
}

function createInvestment(data: InvestmentData): Property {
    return {
        id: data.id,
        type: INVESTMENT,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            principal: { id: 'principal', type: NUMBER, value: data.principal },
            annualRate: { id: 'annualRate', type: NUMBER, value: data.annualRate },
            years: { id: 'years', type: NUMBER, value: data.years },
            compoundingPerYear: { id: 'compoundingPerYear', type: NUMBER, value: data.compoundingPerYear },

            // EXPRESSION: Rate per period = annualRate / compoundingPerYear
            ratePerPeriod: {
                id: 'ratePerPeriod',
                type: NUMBER,
                value: op('div',
                    ref(['self', 'parent', 'annualRate', 'value']),
                    ref(['self', 'parent', 'compoundingPerYear', 'value'])
                )
            },

            // EXPRESSION: Total periods = years * compoundingPerYear
            totalPeriods: {
                id: 'totalPeriods',
                type: NUMBER,
                value: op('mul',
                    ref(['self', 'parent', 'years', 'value']),
                    ref(['self', 'parent', 'compoundingPerYear', 'value'])
                )
            },

            // EXPRESSION: Future value = principal * (1 + ratePerPeriod)^totalPeriods
            // Using simplified approximation: FV ≈ P * (1 + n * r) for small r*n
            // More accurate: FV = P * pow(1 + r/n, n*t)
            futureValue: {
                id: 'futureValue',
                type: NUMBER,
                value: op('mul',
                    ref(['self', 'parent', 'principal', 'value']),
                    op('pow',
                        op('add',
                            lit(1),
                            op('div',
                                ref(['self', 'parent', 'annualRate', 'value']),
                                ref(['self', 'parent', 'compoundingPerYear', 'value'])
                            )
                        ),
                        op('mul',
                            ref(['self', 'parent', 'compoundingPerYear', 'value']),
                            ref(['self', 'parent', 'years', 'value'])
                        )
                    )
                )
            },

            // EXPRESSION: Total interest earned
            totalInterest: {
                id: 'totalInterest',
                type: NUMBER,
                value: op('sub',
                    op('mul',
                        ref(['self', 'parent', 'principal', 'value']),
                        op('pow',
                            op('add',
                                lit(1),
                                op('div',
                                    ref(['self', 'parent', 'annualRate', 'value']),
                                    ref(['self', 'parent', 'compoundingPerYear', 'value'])
                                )
                            ),
                            op('mul',
                                ref(['self', 'parent', 'compoundingPerYear', 'value']),
                                ref(['self', 'parent', 'years', 'value'])
                            )
                        )
                    ),
                    ref(['self', 'parent', 'principal', 'value'])
                )
            },

            // EXPRESSION: Effective annual rate = (1 + r/n)^n - 1
            effectiveAnnualRate: {
                id: 'effectiveAnnualRate',
                type: NUMBER,
                value: op('sub',
                    op('pow',
                        op('add',
                            lit(1),
                            op('div',
                                ref(['self', 'parent', 'annualRate', 'value']),
                                ref(['self', 'parent', 'compoundingPerYear', 'value'])
                            )
                        ),
                        ref(['self', 'parent', 'compoundingPerYear', 'value'])
                    ),
                    lit(1)
                )
            },

            // EXPRESSION: Is high yield (rate > 5%)
            isHighYield: {
                id: 'isHighYield',
                type: BOOLEAN,
                value: op('gt',
                    ref(['self', 'parent', 'annualRate', 'value']),
                    lit(0.05)
                )
            },

            // EXPRESSION: Return multiplier (FV / principal)
            returnMultiplier: {
                id: 'returnMultiplier',
                type: NUMBER,
                value: op('pow',
                    op('add',
                        lit(1),
                        op('div',
                            ref(['self', 'parent', 'annualRate', 'value']),
                            ref(['self', 'parent', 'compoundingPerYear', 'value'])
                        )
                    ),
                    op('mul',
                        ref(['self', 'parent', 'compoundingPerYear', 'value']),
                        ref(['self', 'parent', 'years', 'value'])
                    )
                )
            }
        }
    };
}

// ============================================================================
// LOAN FACTORY
// ============================================================================

interface LoanData {
    id: string;
    name: string;
    principal: number;
    annualRate: number;
    termMonths: number;
    downPayment: number;
}

function createLoan(data: LoanData): Property {
    return {
        id: data.id,
        type: LOAN,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            principal: { id: 'principal', type: NUMBER, value: data.principal },
            annualRate: { id: 'annualRate', type: NUMBER, value: data.annualRate },
            termMonths: { id: 'termMonths', type: NUMBER, value: data.termMonths },
            downPayment: { id: 'downPayment', type: NUMBER, value: data.downPayment },

            // EXPRESSION: Loan amount = principal - downPayment
            loanAmount: {
                id: 'loanAmount',
                type: NUMBER,
                value: op('sub',
                    ref(['self', 'parent', 'principal', 'value']),
                    ref(['self', 'parent', 'downPayment', 'value'])
                )
            },

            // EXPRESSION: Monthly rate = annualRate / 12
            monthlyRate: {
                id: 'monthlyRate',
                type: NUMBER,
                value: op('div',
                    ref(['self', 'parent', 'annualRate', 'value']),
                    lit(12)
                )
            },

            // EXPRESSION: Monthly payment using formula:
            // M = P * [r(1+r)^n] / [(1+r)^n - 1]
            // Simplified approximation for demo
            monthlyPayment: {
                id: 'monthlyPayment',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'annualRate', 'value']), lit(0)),
                    op('div',
                        op('mul',
                            op('sub',
                                ref(['self', 'parent', 'principal', 'value']),
                                ref(['self', 'parent', 'downPayment', 'value'])
                            ),
                            op('mul',
                                op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12)),
                                op('pow',
                                    op('add',
                                        lit(1),
                                        op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                    ),
                                    ref(['self', 'parent', 'termMonths', 'value'])
                                )
                            )
                        ),
                        op('sub',
                            op('pow',
                                op('add',
                                    lit(1),
                                    op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                ),
                                ref(['self', 'parent', 'termMonths', 'value'])
                            ),
                            lit(1)
                        )
                    ),
                    // If rate is 0, simple division
                    op('div',
                        op('sub',
                            ref(['self', 'parent', 'principal', 'value']),
                            ref(['self', 'parent', 'downPayment', 'value'])
                        ),
                        ref(['self', 'parent', 'termMonths', 'value'])
                    )
                )
            },

            // EXPRESSION: Total payment = monthlyPayment * termMonths
            totalPayment: {
                id: 'totalPayment',
                type: NUMBER,
                value: op('mul',
                    op('if',
                        op('gt', ref(['self', 'parent', 'annualRate', 'value']), lit(0)),
                        op('div',
                            op('mul',
                                op('sub',
                                    ref(['self', 'parent', 'principal', 'value']),
                                    ref(['self', 'parent', 'downPayment', 'value'])
                                ),
                                op('mul',
                                    op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12)),
                                    op('pow',
                                        op('add',
                                            lit(1),
                                            op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                        ),
                                        ref(['self', 'parent', 'termMonths', 'value'])
                                    )
                                )
                            ),
                            op('sub',
                                op('pow',
                                    op('add',
                                        lit(1),
                                        op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                    ),
                                    ref(['self', 'parent', 'termMonths', 'value'])
                                ),
                                lit(1)
                            )
                        ),
                        op('div',
                            op('sub',
                                ref(['self', 'parent', 'principal', 'value']),
                                ref(['self', 'parent', 'downPayment', 'value'])
                            ),
                            ref(['self', 'parent', 'termMonths', 'value'])
                        )
                    ),
                    ref(['self', 'parent', 'termMonths', 'value'])
                )
            },

            // EXPRESSION: Total interest = totalPayment - loanAmount
            totalInterest: {
                id: 'totalInterest',
                type: NUMBER,
                value: op('sub',
                    op('mul',
                        op('if',
                            op('gt', ref(['self', 'parent', 'annualRate', 'value']), lit(0)),
                            op('div',
                                op('mul',
                                    op('sub',
                                        ref(['self', 'parent', 'principal', 'value']),
                                        ref(['self', 'parent', 'downPayment', 'value'])
                                    ),
                                    op('mul',
                                        op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12)),
                                        op('pow',
                                            op('add',
                                                lit(1),
                                                op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                            ),
                                            ref(['self', 'parent', 'termMonths', 'value'])
                                        )
                                    )
                                ),
                                op('sub',
                                    op('pow',
                                        op('add',
                                            lit(1),
                                            op('div', ref(['self', 'parent', 'annualRate', 'value']), lit(12))
                                        ),
                                        ref(['self', 'parent', 'termMonths', 'value'])
                                    ),
                                    lit(1)
                                )
                            ),
                            op('div',
                                op('sub',
                                    ref(['self', 'parent', 'principal', 'value']),
                                    ref(['self', 'parent', 'downPayment', 'value'])
                                ),
                                ref(['self', 'parent', 'termMonths', 'value'])
                            )
                        ),
                        ref(['self', 'parent', 'termMonths', 'value'])
                    ),
                    op('sub',
                        ref(['self', 'parent', 'principal', 'value']),
                        ref(['self', 'parent', 'downPayment', 'value'])
                    )
                )
            },

            // EXPRESSION: Down payment percentage
            downPaymentPercent: {
                id: 'downPaymentPercent',
                type: NUMBER,
                value: op('mul',
                    op('div',
                        ref(['self', 'parent', 'downPayment', 'value']),
                        ref(['self', 'parent', 'principal', 'value'])
                    ),
                    lit(100)
                )
            },

            // EXPRESSION: Is conforming loan (< 20% down payment triggers PMI)
            requiresPMI: {
                id: 'requiresPMI',
                type: BOOLEAN,
                value: op('lt',
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'downPayment', 'value']),
                            ref(['self', 'parent', 'principal', 'value'])
                        ),
                        lit(100)
                    ),
                    lit(20)
                )
            }
        }
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 6: Financial Calculator', () => {
    describe('Investment Calculations', () => {
        test('should calculate rate per period', async () => {
            const investment = createInvestment({
                id: 'inv1',
                name: 'Savings Account',
                principal: 10000,
                annualRate: 0.06,  // 6%
                years: 5,
                compoundingPerYear: 12  // Monthly
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            const ratePerPeriod = await node.getValue(['ratePerPeriod']);
            expect(ratePerPeriod).toBeCloseTo(0.005, 4);  // 6% / 12 = 0.5%
        });

        test('should calculate total periods', async () => {
            const investment = createInvestment({
                id: 'inv2',
                name: 'CD',
                principal: 5000,
                annualRate: 0.04,
                years: 3,
                compoundingPerYear: 4  // Quarterly
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            const totalPeriods = await node.getValue(['totalPeriods']);
            expect(totalPeriods).toBe(12);  // 3 years * 4 = 12
        });

        test('should calculate future value with compound interest', async () => {
            const investment = createInvestment({
                id: 'inv3',
                name: 'Investment Fund',
                principal: 10000,
                annualRate: 0.05,  // 5%
                years: 10,
                compoundingPerYear: 1  // Annual
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            // FV = 10000 * (1.05)^10 ≈ 16288.95
            const futureValue = await node.getValue(['futureValue']) as number;
            expect(futureValue).toBeCloseTo(16288.95, 0);
        });

        test('should calculate total interest earned', async () => {
            const investment = createInvestment({
                id: 'inv4',
                name: 'Growth Fund',
                principal: 10000,
                annualRate: 0.05,
                years: 10,
                compoundingPerYear: 1
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            // Interest = FV - Principal ≈ 16288.95 - 10000 = 6288.95
            const totalInterest = await node.getValue(['totalInterest']) as number;
            expect(totalInterest).toBeCloseTo(6288.95, 0);
        });

        test('should calculate effective annual rate', async () => {
            const investment = createInvestment({
                id: 'inv5',
                name: 'Money Market',
                principal: 1000,
                annualRate: 0.12,  // 12% nominal
                years: 1,
                compoundingPerYear: 12  // Monthly
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            // EAR = (1 + 0.12/12)^12 - 1 ≈ 0.1268 (12.68%)
            const ear = await node.getValue(['effectiveAnnualRate']) as number;
            expect(ear).toBeCloseTo(0.1268, 3);
        });

        test('should identify high yield investments', async () => {
            const lowYield = createInvestment({
                id: 'low',
                name: 'Low Yield',
                principal: 1000,
                annualRate: 0.02,  // 2%
                years: 1,
                compoundingPerYear: 1
            });

            const lowNode = new PropertyNode(lowYield);
            lowNode.setRegistry(defaultRegistry);
            expect(await lowNode.getValue(['isHighYield'])).toBe(false);

            const highYield = createInvestment({
                id: 'high',
                name: 'High Yield',
                principal: 1000,
                annualRate: 0.08,  // 8%
                years: 1,
                compoundingPerYear: 1
            });

            const highNode = new PropertyNode(highYield);
            highNode.setRegistry(defaultRegistry);
            expect(await highNode.getValue(['isHighYield'])).toBe(true);
        });

        test('should calculate return multiplier', async () => {
            const investment = createInvestment({
                id: 'mult',
                name: 'Doubling Investment',
                principal: 10000,
                annualRate: 0.07,  // 7%
                years: 10,
                compoundingPerYear: 1
            });

            const node = new PropertyNode(investment);
            node.setRegistry(defaultRegistry);

            // Multiplier = (1.07)^10 ≈ 1.967
            const multiplier = await node.getValue(['returnMultiplier']) as number;
            expect(multiplier).toBeCloseTo(1.967, 2);
        });

        test('should show impact of more frequent compounding', async () => {
            const annual = createInvestment({
                id: 'annual',
                name: 'Annual Compounding',
                principal: 10000,
                annualRate: 0.10,
                years: 5,
                compoundingPerYear: 1
            });

            const monthly = createInvestment({
                id: 'monthly',
                name: 'Monthly Compounding',
                principal: 10000,
                annualRate: 0.10,
                years: 5,
                compoundingPerYear: 12
            });

            const annualNode = new PropertyNode(annual);
            annualNode.setRegistry(defaultRegistry);

            const monthlyNode = new PropertyNode(monthly);
            monthlyNode.setRegistry(defaultRegistry);

            const annualFV = await annualNode.getValue(['futureValue']) as number;
            const monthlyFV = await monthlyNode.getValue(['futureValue']) as number;

            // Monthly compounding should yield more
            expect(monthlyFV).toBeGreaterThan(annualFV);

            // Annual: 10000 * 1.1^5 = 16105.10
            expect(annualFV).toBeCloseTo(16105.10, 0);

            // Monthly: 10000 * (1 + 0.1/12)^60 ≈ 16453.09
            expect(monthlyFV).toBeCloseTo(16453.09, 0);
        });
    });

    describe('Loan Calculations', () => {
        test('should calculate loan amount', async () => {
            const loan = createLoan({
                id: 'loan1',
                name: 'Home Mortgage',
                principal: 300000,
                annualRate: 0.065,
                termMonths: 360,  // 30 years
                downPayment: 60000  // 20%
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            const loanAmount = await node.getValue(['loanAmount']);
            expect(loanAmount).toBe(240000);
        });

        test('should calculate monthly rate', async () => {
            const loan = createLoan({
                id: 'loan2',
                name: 'Auto Loan',
                principal: 25000,
                annualRate: 0.06,  // 6%
                termMonths: 60,
                downPayment: 5000
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            const monthlyRate = await node.getValue(['monthlyRate']);
            expect(monthlyRate).toBeCloseTo(0.005, 4);  // 6% / 12 = 0.5%
        });

        test('should calculate monthly payment', async () => {
            const loan = createLoan({
                id: 'loan3',
                name: 'Personal Loan',
                principal: 10000,
                annualRate: 0.08,  // 8%
                termMonths: 36,
                downPayment: 0
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            // Using formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            // P = 10000, r = 0.08/12 = 0.00667, n = 36
            // M ≈ 313.36
            const monthlyPayment = await node.getValue(['monthlyPayment']) as number;
            expect(monthlyPayment).toBeCloseTo(313.36, 0);
        });

        test('should calculate total payment', async () => {
            const loan = createLoan({
                id: 'loan4',
                name: 'Student Loan',
                principal: 20000,
                annualRate: 0.05,
                termMonths: 120,  // 10 years
                downPayment: 0
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            // Monthly payment ≈ 212.13
            // Total = 212.13 * 120 ≈ 25455.79
            const totalPayment = await node.getValue(['totalPayment']) as number;
            expect(totalPayment).toBeCloseTo(25455.79, 0);
        });

        test('should calculate total interest', async () => {
            const loan = createLoan({
                id: 'loan5',
                name: 'Equipment Loan',
                principal: 50000,
                annualRate: 0.07,
                termMonths: 48,
                downPayment: 10000
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            const loanAmount = await node.getValue(['loanAmount']) as number;
            const totalPayment = await node.getValue(['totalPayment']) as number;
            const totalInterest = await node.getValue(['totalInterest']) as number;

            expect(loanAmount).toBe(40000);
            expect(totalInterest).toBeCloseTo(totalPayment - loanAmount, 0);
        });

        test('should calculate down payment percentage', async () => {
            const loan = createLoan({
                id: 'loan6',
                name: 'Car Loan',
                principal: 30000,
                annualRate: 0.05,
                termMonths: 60,
                downPayment: 6000  // 20%
            });

            const node = new PropertyNode(loan);
            node.setRegistry(defaultRegistry);

            const downPercent = await node.getValue(['downPaymentPercent']);
            expect(downPercent).toBe(20);
        });

        test('should identify loans requiring PMI', async () => {
            // < 20% down payment = requires PMI
            const lowDown = createLoan({
                id: 'lowdown',
                name: 'Low Down Mortgage',
                principal: 200000,
                annualRate: 0.065,
                termMonths: 360,
                downPayment: 20000  // 10%
            });

            const lowNode = new PropertyNode(lowDown);
            lowNode.setRegistry(defaultRegistry);
            expect(await lowNode.getValue(['requiresPMI'])).toBe(true);

            // >= 20% down payment = no PMI
            const highDown = createLoan({
                id: 'highdown',
                name: 'High Down Mortgage',
                principal: 200000,
                annualRate: 0.065,
                termMonths: 360,
                downPayment: 50000  // 25%
            });

            const highNode = new PropertyNode(highDown);
            highNode.setRegistry(defaultRegistry);
            expect(await highNode.getValue(['requiresPMI'])).toBe(false);
        });

        test('should handle zero interest rate', async () => {
            const zeroInterest = createLoan({
                id: 'zero',
                name: 'Interest-Free Loan',
                principal: 12000,
                annualRate: 0,  // 0%
                termMonths: 24,
                downPayment: 0
            });

            const node = new PropertyNode(zeroInterest);
            node.setRegistry(defaultRegistry);

            // Simple division: 12000 / 24 = 500
            const monthlyPayment = await node.getValue(['monthlyPayment']);
            expect(monthlyPayment).toBe(500);

            const totalPayment = await node.getValue(['totalPayment']);
            expect(totalPayment).toBe(12000);

            const totalInterest = await node.getValue(['totalInterest']);
            expect(totalInterest).toBe(0);
        });
    });

    describe('Comparison Scenarios', () => {
        test('should compare investment vs paying off debt', async () => {
            // Option A: Invest at 7%
            const investment = createInvestment({
                id: 'invest',
                name: 'Index Fund',
                principal: 10000,
                annualRate: 0.07,
                years: 5,
                compoundingPerYear: 1
            });

            // Option B: Pay off loan at 5%
            const loan = createLoan({
                id: 'debt',
                name: 'Outstanding Loan',
                principal: 10000,
                annualRate: 0.05,
                termMonths: 60,
                downPayment: 0
            });

            const investNode = new PropertyNode(investment);
            investNode.setRegistry(defaultRegistry);

            const loanNode = new PropertyNode(loan);
            loanNode.setRegistry(defaultRegistry);

            const investmentGain = await investNode.getValue(['totalInterest']) as number;
            const loanInterest = await loanNode.getValue(['totalInterest']) as number;

            // Investment gain (7% for 5 years): ~4025.52
            // Loan interest (5% for 5 years): ~1322.74
            // Net benefit of investing = 4025.52 - 1322.74 ≈ 2702.78
            expect(investmentGain - loanInterest).toBeGreaterThan(2000);
        });

        test('should show 15 vs 30 year mortgage difference', async () => {
            const loan15 = createLoan({
                id: 'mortgage15',
                name: '15-Year Mortgage',
                principal: 300000,
                annualRate: 0.055,  // 5.5%
                termMonths: 180,
                downPayment: 60000
            });

            const loan30 = createLoan({
                id: 'mortgage30',
                name: '30-Year Mortgage',
                principal: 300000,
                annualRate: 0.06,  // 6% (typically higher for 30yr)
                termMonths: 360,
                downPayment: 60000
            });

            const node15 = new PropertyNode(loan15);
            node15.setRegistry(defaultRegistry);

            const node30 = new PropertyNode(loan30);
            node30.setRegistry(defaultRegistry);

            const payment15 = await node15.getValue(['monthlyPayment']) as number;
            const payment30 = await node30.getValue(['monthlyPayment']) as number;

            const interest15 = await node15.getValue(['totalInterest']) as number;
            const interest30 = await node30.getValue(['totalInterest']) as number;

            // 15-year has higher monthly payment
            expect(payment15).toBeGreaterThan(payment30);

            // But much lower total interest
            expect(interest15).toBeLessThan(interest30);

            // The difference should be substantial
            expect(interest30 - interest15).toBeGreaterThan(50000);
        });
    });
});
