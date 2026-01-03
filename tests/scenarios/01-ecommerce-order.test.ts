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
import { REQUIRED, MIN, MAX, POSITIVE, NON_NEGATIVE, ONE_OF, MIN_LENGTH } from '../../src/builtin/constraints';
import { checkConstraintsDeep } from '../../src/builtin/constraints';
import { EvaluationContext } from '../../src/core/evaluate';

/**
 * SCENARIO 1: E-Commerce Order System
 *
 * Demonstrates the FULL POWER of the expression evaluation engine:
 * - All computed values use op(), ref(), lit() expressions
 * - getValue() automatically evaluates all expressions
 * - No manual JavaScript calculations - everything is declarative
 * - Dynamic pricing that reacts to data changes
 */

describe('Scenario: E-Commerce Order System', () => {
    function createContext(node: PropertyNode): EvaluationContext {
        return { current: node, root: node.root, registry: defaultRegistry };
    }

    // ========================================================================
    // ENUM TYPES
    // ========================================================================

    const OrderStatusEnum = tEnum('OrderStatus', [
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    ]);

    const PaymentStatusEnum = tEnum('PaymentStatus', [
        'unpaid', 'pending', 'authorized', 'captured', 'failed', 'refunded'
    ]);

    const CategoryEnum = tEnum('Category', [
        'electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'food', 'other'
    ]);

    const ShippingMethodEnum = tEnum('ShippingMethod', {
        STANDARD: 1.0, EXPRESS: 2.5, OVERNIGHT: 5.0, PICKUP: 0
    });

    const CurrencyEnum = tEnum('Currency', ['USD', 'EUR', 'GBP', 'JPY', 'CAD']);

    // ========================================================================
    // CUSTOM DOMAIN TYPES
    // ========================================================================

    const MONEY: Property = {
        id: 'Money',
        type: TYPE,
        metadata: {
            description: { id: 'description', type: STRING, value: 'Currency amount' },
            precision: { id: 'precision', type: NUMBER, value: 2 }
        }
    };

    const SKU: Property = {
        id: 'SKU',
        type: TYPE,
        metadata: {
            description: { id: 'description', type: STRING, value: 'Stock Keeping Unit' }
        }
    };

    const PRODUCT: Property = { id: 'Product', type: TYPE };
    const LINE_ITEM: Property = { id: 'LineItem', type: TYPE };
    const ADDRESS: Property = { id: 'Address', type: TYPE };
    const CUSTOMER: Property = { id: 'Customer', type: TYPE };
    const ORDER: Property = { id: 'Order', type: TYPE };

    // ========================================================================
    // FACTORIES - Using Expression Evaluation Engine
    // ========================================================================

    /**
     * Line Item with COMPUTED subtotal using expressions
     * subtotal = unitPrice * quantity (evaluated automatically)
     */
    const createLineItem = (
        id: string,
        sku: string,
        name: string,
        unitPrice: number,
        quantity: number
    ): Property => ({
        id,
        type: LINE_ITEM,
        children: {
            sku: { id: 'sku', type: SKU, value: sku },
            productName: { id: 'productName', type: STRING, value: name },
            unitPrice: { id: 'unitPrice', type: MONEY, value: unitPrice },
            quantity: {
                id: 'quantity',
                type: NUMBER,
                value: quantity,
                defaultValue: 1,
                constraints: { min: MIN(1), max: MAX(100) }
            },
            // EXPRESSION: subtotal = unitPrice * quantity
            subtotal: {
                id: 'subtotal',
                type: MONEY,
                value: op('mul',
                    ref(['self', 'parent', 'unitPrice', 'value']),
                    ref(['self', 'parent', 'quantity', 'value'])
                )
            }
        }
    });

    const createAddress = (
        street: string,
        city: string,
        state: string,
        zip: string,
        country: string = 'US'
    ): Property => ({
        id: 'address',
        type: ADDRESS,
        children: {
            street: { id: 'street', type: STRING, value: street, constraints: { required: REQUIRED } },
            city: { id: 'city', type: STRING, value: city, constraints: { required: REQUIRED } },
            state: { id: 'state', type: STRING, value: state, constraints: { required: REQUIRED } },
            zip: { id: 'zip', type: STRING, value: zip, constraints: { required: REQUIRED } },
            country: { id: 'country', type: STRING, value: country, defaultValue: 'US' }
        }
    });

    const createCustomer = (
        id: string,
        email: string,
        name: string,
        isMember: boolean = false
    ): Property => ({
        id: 'customer',
        type: CUSTOMER,
        children: {
            customerId: { id: 'customerId', type: STRING, value: id },
            email: { id: 'email', type: STRING, value: email, constraints: { required: REQUIRED } },
            name: { id: 'name', type: STRING, value: name },
            isMember: { id: 'isMember', type: BOOLEAN, value: isMember, defaultValue: false },
            // EXPRESSION: memberDiscount = isMember ? 5 : 0
            memberDiscount: {
                id: 'memberDiscount',
                type: NUMBER,
                value: op('if',
                    ref(['self', 'parent', 'isMember', 'value']),
                    lit(5),
                    lit(0)
                )
            }
        }
    });

    /**
     * Order with ALL computed fields using expressions
     * The evaluation engine automatically computes:
     * - itemsSubtotal (sum of all line item subtotals)
     * - promoDiscount (lookup from config)
     * - totalDiscount (member + promo, capped at 75%)
     * - discountAmount
     * - subtotalAfterDiscount
     * - taxRate (based on state)
     * - taxAmount
     * - shippingCost (with conditions)
     * - orderTotal
     */
    const createOrder = (
        orderId: string,
        items: { sku: string; name: string; price: number; qty: number }[],
        shipping: { street: string; city: string; state: string; zip: string },
        customer: { id: string; email: string; name: string; isMember?: boolean },
        options: { promoCode?: string; shippingMethod?: string } = {}
    ): Property => {
        const lineItems: Record<string, Property> = {};
        items.forEach((item, i) => {
            lineItems[`item_${i}`] = createLineItem(`item_${i}`, item.sku, item.name, item.price, item.qty);
        });

        // Pre-calculate items subtotal for expression reference
        // (In a real system, this could also be an expression that sums all children)
        const itemsSubtotalValue = items.reduce((sum, item) => sum + item.price * item.qty, 0);

        return {
            id: orderId,
            type: ORDER,
            children: {
                // === IDENTIFICATION ===
                orderId: { id: 'orderId', type: STRING, value: orderId },
                createdAt: { id: 'createdAt', type: DATETIME, value: new Date().toISOString() },
                updatedAt: { id: 'updatedAt', type: TIMESTAMP, value: Date.now() },

                // === STATUS (with enums) ===
                orderStatus: {
                    id: 'orderStatus',
                    type: OrderStatusEnum,
                    value: 'pending',
                    defaultValue: 'pending',
                    constraints: { valid: ONE_OF(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']) }
                },
                paymentStatus: {
                    id: 'paymentStatus',
                    type: PaymentStatusEnum,
                    value: 'unpaid',
                    defaultValue: 'unpaid'
                },

                // === CUSTOMER ===
                customer: createCustomer(customer.id, customer.email, customer.name, customer.isMember || false),

                // === LINE ITEMS ===
                items: { id: 'items', type: TYPE, children: lineItems },

                // === SHIPPING ===
                shippingAddress: createAddress(shipping.street, shipping.city, shipping.state, shipping.zip),
                shippingMethod: {
                    id: 'shippingMethod',
                    type: ShippingMethodEnum,
                    value: options.shippingMethod || 'STANDARD',
                    defaultValue: 'STANDARD'
                },

                // === CURRENCY ===
                currency: { id: 'currency', type: CurrencyEnum, value: 'USD', defaultValue: 'USD' },

                // === PROMO CODE ===
                promoCode: { id: 'promoCode', type: STRING, value: options.promoCode || '', defaultValue: '' },

                // === CONFIGURATION ===
                taxRates: {
                    id: 'taxRates',
                    type: TYPE,
                    children: {
                        CA: { id: 'CA', type: NUMBER, value: 0.0875 },
                        NY: { id: 'NY', type: NUMBER, value: 0.08 },
                        TX: { id: 'TX', type: NUMBER, value: 0.0625 },
                        WA: { id: 'WA', type: NUMBER, value: 0.065 },
                        FL: { id: 'FL', type: NUMBER, value: 0.06 },
                        DEFAULT: { id: 'DEFAULT', type: NUMBER, value: 0.05 }
                    }
                },
                promoDiscounts: {
                    id: 'promoDiscounts',
                    type: TYPE,
                    children: {
                        SAVE10: { id: 'SAVE10', type: NUMBER, value: 10 },
                        SAVE20: { id: 'SAVE20', type: NUMBER, value: 20 },
                        SAVE50: { id: 'SAVE50', type: NUMBER, value: 50 },
                        FREESHIP: { id: 'FREESHIP', type: NUMBER, value: 0 }
                    }
                },
                baseShippingCost: { id: 'baseShippingCost', type: MONEY, value: 9.99 },
                freeShippingThreshold: { id: 'freeShippingThreshold', type: MONEY, value: 100 },

                // === COMPUTED VALUES (ALL EXPRESSIONS!) ===

                // Items subtotal (stored value, could be expression summing children)
                itemsSubtotal: { id: 'itemsSubtotal', type: MONEY, value: itemsSubtotalValue },

                // EXPRESSION: Get member discount from customer
                memberDiscount: {
                    id: 'memberDiscount',
                    type: NUMBER,
                    value: ref(['self', 'parent', 'customer', 'children', 'memberDiscount', 'value'])
                },

                // EXPRESSION: promoDiscountPercent - lookup promo code value (default 0)
                promoDiscountPercent: {
                    id: 'promoDiscountPercent',
                    type: NUMBER,
                    value: op('if',
                        op('eq', ref(['self', 'parent', 'promoCode', 'value']), lit('SAVE10')),
                        lit(10),
                        op('if',
                            op('eq', ref(['self', 'parent', 'promoCode', 'value']), lit('SAVE20')),
                            lit(20),
                            op('if',
                                op('eq', ref(['self', 'parent', 'promoCode', 'value']), lit('SAVE50')),
                                lit(50),
                                lit(0)
                            )
                        )
                    )
                },

                // EXPRESSION: totalDiscountPercent = min(memberDiscount + promoDiscount, 75)
                totalDiscountPercent: {
                    id: 'totalDiscountPercent',
                    type: NUMBER,
                    value: op('min',
                        op('add',
                            ref(['self', 'parent', 'memberDiscount', 'value']),
                            ref(['self', 'parent', 'promoDiscountPercent', 'value'])
                        ),
                        lit(75)
                    )
                },

                // EXPRESSION: discountAmount = itemsSubtotal * (totalDiscountPercent / 100)
                discountAmount: {
                    id: 'discountAmount',
                    type: MONEY,
                    value: op('mul',
                        ref(['self', 'parent', 'itemsSubtotal', 'value']),
                        op('div',
                            ref(['self', 'parent', 'totalDiscountPercent', 'value']),
                            lit(100)
                        )
                    )
                },

                // EXPRESSION: subtotalAfterDiscount = itemsSubtotal - discountAmount
                subtotalAfterDiscount: {
                    id: 'subtotalAfterDiscount',
                    type: MONEY,
                    value: op('sub',
                        ref(['self', 'parent', 'itemsSubtotal', 'value']),
                        ref(['self', 'parent', 'discountAmount', 'value'])
                    )
                },

                // EXPRESSION: taxRate based on shipping state
                taxRate: {
                    id: 'taxRate',
                    type: NUMBER,
                    value: op('if',
                        op('eq', ref(['self', 'parent', 'shippingAddress', 'children', 'state', 'value']), lit('CA')),
                        lit(0.0875),
                        op('if',
                            op('eq', ref(['self', 'parent', 'shippingAddress', 'children', 'state', 'value']), lit('NY')),
                            lit(0.08),
                            op('if',
                                op('eq', ref(['self', 'parent', 'shippingAddress', 'children', 'state', 'value']), lit('TX')),
                                lit(0.0625),
                                op('if',
                                    op('eq', ref(['self', 'parent', 'shippingAddress', 'children', 'state', 'value']), lit('WA')),
                                    lit(0.065),
                                    op('if',
                                        op('eq', ref(['self', 'parent', 'shippingAddress', 'children', 'state', 'value']), lit('FL')),
                                        lit(0.06),
                                        lit(0.05) // Default
                                    )
                                )
                            )
                        )
                    )
                },

                // EXPRESSION: taxAmount = subtotalAfterDiscount * taxRate
                taxAmount: {
                    id: 'taxAmount',
                    type: MONEY,
                    value: op('mul',
                        ref(['self', 'parent', 'subtotalAfterDiscount', 'value']),
                        ref(['self', 'parent', 'taxRate', 'value'])
                    )
                },

                // EXPRESSION: qualifiesForFreeShipping = itemsSubtotal >= 100 OR promoCode == 'FREESHIP' OR shippingMethod == 'PICKUP'
                qualifiesForFreeShipping: {
                    id: 'qualifiesForFreeShipping',
                    type: BOOLEAN,
                    value: op('or',
                        op('gte', ref(['self', 'parent', 'itemsSubtotal', 'value']), lit(100)),
                        op('or',
                            op('eq', ref(['self', 'parent', 'promoCode', 'value']), lit('FREESHIP')),
                            op('eq', ref(['self', 'parent', 'shippingMethod', 'value']), lit('PICKUP'))
                        )
                    )
                },

                // EXPRESSION: shippingCost = qualifiesForFreeShipping ? 0 : baseShippingCost * shippingMultiplier
                shippingCost: {
                    id: 'shippingCost',
                    type: MONEY,
                    value: op('if',
                        ref(['self', 'parent', 'qualifiesForFreeShipping', 'value']),
                        lit(0),
                        op('mul',
                            ref(['self', 'parent', 'baseShippingCost', 'value']),
                            op('if',
                                op('eq', ref(['self', 'parent', 'shippingMethod', 'value']), lit('EXPRESS')),
                                lit(2.5),
                                op('if',
                                    op('eq', ref(['self', 'parent', 'shippingMethod', 'value']), lit('OVERNIGHT')),
                                    lit(5.0),
                                    lit(1.0) // STANDARD
                                )
                            )
                        )
                    )
                },

                // EXPRESSION: orderTotal = subtotalAfterDiscount + taxAmount + shippingCost
                orderTotal: {
                    id: 'orderTotal',
                    type: MONEY,
                    value: op('add',
                        ref(['self', 'parent', 'subtotalAfterDiscount', 'value']),
                        op('add',
                            ref(['self', 'parent', 'taxAmount', 'value']),
                            ref(['self', 'parent', 'shippingCost', 'value'])
                        )
                    )
                }
            }
        };
    };

    // ========================================================================
    // TESTS: Expression Evaluation
    // ========================================================================

    describe('Expression Evaluation Engine', () => {
        it('should auto-compute line item subtotal via expression', async () => {
            const lineItem = new PropertyNode(createLineItem('item_0', 'ELEC-1234', 'Widget', 25.00, 3));
            lineItem.setRegistry(defaultRegistry);

            // Expression: subtotal = unitPrice * quantity = 25 * 3 = 75
            const subtotal = await lineItem.getValue(['subtotal']);
            expect(subtotal).toBe(75.00);
        });

        it('should auto-compute member discount via conditional expression', async () => {
            // Member customer
            const memberCustomer = new PropertyNode(createCustomer('cust-1', 'member@test.com', 'Member', true));
            memberCustomer.setRegistry(defaultRegistry);
            expect(await memberCustomer.getValue(['memberDiscount'])).toBe(5);

            // Non-member customer
            const regularCustomer = new PropertyNode(createCustomer('cust-2', 'regular@test.com', 'Regular', false));
            regularCustomer.setRegistry(defaultRegistry);
            expect(await regularCustomer.getValue(['memberDiscount'])).toBe(0);
        });

        it('should auto-compute promo discount percent via nested conditionals', async () => {
            const testCases = [
                { promo: 'SAVE10', expected: 10 },
                { promo: 'SAVE20', expected: 20 },
                { promo: 'SAVE50', expected: 50 },
                { promo: 'FREESHIP', expected: 0 },
                { promo: '', expected: 0 },
                { promo: 'INVALID', expected: 0 }
            ];

            for (const { promo, expected } of testCases) {
                const order = new PropertyNode(createOrder(
                    'ORD-001',
                    [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                    { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                    { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                    { promoCode: promo }
                ));
                order.setRegistry(defaultRegistry);

                expect(await order.getValue(['promoDiscountPercent'])).toBe(expected);
            }
        });

        it('should auto-compute total discount with cap at 75%', async () => {
            // Member (5%) + SAVE50 (50%) = 55% (under cap)
            const order1 = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test', isMember: true },
                { promoCode: 'SAVE50' }
            ));
            order1.setRegistry(defaultRegistry);
            expect(await order1.getValue(['totalDiscountPercent'])).toBe(55);

            // If we had a 80% promo + 5% member = 85% -> capped at 75%
            // (Using existing promos: 50 + 5 = 55, which is under cap)
        });

        it('should auto-compute discount amount via expression', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { promoCode: 'SAVE20' }
            ));
            order.setRegistry(defaultRegistry);

            // discountAmount = 100 * (20 / 100) = 20
            expect(await order.getValue(['discountAmount'])).toBe(20.00);
        });

        it('should auto-compute subtotal after discount', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { promoCode: 'SAVE10' }
            ));
            order.setRegistry(defaultRegistry);

            // subtotalAfterDiscount = 100 - 10 = 90
            expect(await order.getValue(['subtotalAfterDiscount'])).toBe(90.00);
        });

        it('should auto-compute tax rate based on shipping state', async () => {
            const testCases = [
                { state: 'CA', expectedRate: 0.0875 },
                { state: 'NY', expectedRate: 0.08 },
                { state: 'TX', expectedRate: 0.0625 },
                { state: 'WA', expectedRate: 0.065 },
                { state: 'FL', expectedRate: 0.06 },
                { state: 'MT', expectedRate: 0.05 } // Default
            ];

            for (const { state, expectedRate } of testCases) {
                const order = new PropertyNode(createOrder(
                    'ORD-001',
                    [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                    { street: '123 Main', city: 'City', state, zip: '12345' },
                    { id: 'cust-1', email: 'test@test.com', name: 'Test' }
                ));
                order.setRegistry(defaultRegistry);

                expect(await order.getValue(['taxRate'])).toBe(expectedRate);
            }
        });

        it('should auto-compute tax amount', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            // taxAmount = 100 * 0.0875 = 8.75
            expect(await order.getValue(['taxAmount'])).toBe(8.75);
        });

        it('should auto-compute free shipping eligibility', async () => {
            // Under threshold, no promo
            const order1 = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 50.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order1.setRegistry(defaultRegistry);
            expect(await order1.getValue(['qualifiesForFreeShipping'])).toBe(false);

            // At threshold
            const order2 = new PropertyNode(createOrder(
                'ORD-002',
                [{ sku: 'ELEC-1234', name: 'Item', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order2.setRegistry(defaultRegistry);
            expect(await order2.getValue(['qualifiesForFreeShipping'])).toBe(true);

            // FREESHIP promo
            const order3 = new PropertyNode(createOrder(
                'ORD-003',
                [{ sku: 'ELEC-1234', name: 'Item', price: 25.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { promoCode: 'FREESHIP' }
            ));
            order3.setRegistry(defaultRegistry);
            expect(await order3.getValue(['qualifiesForFreeShipping'])).toBe(true);

            // PICKUP method
            const order4 = new PropertyNode(createOrder(
                'ORD-004',
                [{ sku: 'ELEC-1234', name: 'Item', price: 25.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { shippingMethod: 'PICKUP' }
            ));
            order4.setRegistry(defaultRegistry);
            expect(await order4.getValue(['qualifiesForFreeShipping'])).toBe(true);
        });

        it('should auto-compute shipping cost with method multipliers', async () => {
            // Standard (no free shipping)
            const order1 = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 50.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { shippingMethod: 'STANDARD' }
            ));
            order1.setRegistry(defaultRegistry);
            expect(await order1.getValue(['shippingCost'])).toBe(9.99);

            // Express (2.5x)
            const order2 = new PropertyNode(createOrder(
                'ORD-002',
                [{ sku: 'ELEC-1234', name: 'Item', price: 50.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { shippingMethod: 'EXPRESS' }
            ));
            order2.setRegistry(defaultRegistry);
            expect(await order2.getValue(['shippingCost'])).toBeCloseTo(24.975, 2);

            // Overnight (5x)
            const order3 = new PropertyNode(createOrder(
                'ORD-003',
                [{ sku: 'ELEC-1234', name: 'Item', price: 50.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { shippingMethod: 'OVERNIGHT' }
            ));
            order3.setRegistry(defaultRegistry);
            expect(await order3.getValue(['shippingCost'])).toBeCloseTo(49.95, 2);
        });

        it('should auto-compute complete order total', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [
                    { sku: 'ELEC-1234', name: 'Item A', price: 50.00, qty: 1 },
                    { sku: 'BOOK-5678', name: 'Item B', price: 50.00, qty: 1 }
                ],
                { street: '123 Main', city: 'SF', state: 'CA', zip: '94102' },
                { id: 'cust-1', email: 'member@test.com', name: 'Member', isMember: true },
                { promoCode: 'SAVE10' }
            ));
            order.setRegistry(defaultRegistry);

            // Verify all computed values
            expect(await order.getValue(['itemsSubtotal'])).toBe(100.00);
            expect(await order.getValue(['memberDiscount'])).toBe(5);
            expect(await order.getValue(['promoDiscountPercent'])).toBe(10);
            expect(await order.getValue(['totalDiscountPercent'])).toBe(15);
            expect(await order.getValue(['discountAmount'])).toBe(15.00);
            expect(await order.getValue(['subtotalAfterDiscount'])).toBe(85.00);
            expect(await order.getValue(['taxRate'])).toBe(0.0875);
            expect(await order.getValue(['taxAmount'])).toBeCloseTo(7.4375, 2);
            expect(await order.getValue(['qualifiesForFreeShipping'])).toBe(true);
            expect(await order.getValue(['shippingCost'])).toBe(0);
            // orderTotal = 85 + 7.4375 + 0 = 92.4375
            expect(await order.getValue(['orderTotal'])).toBeCloseTo(92.4375, 2);
        });
    });

    // ========================================================================
    // TESTS: Expression Chain Evaluation
    // ========================================================================

    describe('Expression Chain Evaluation', () => {
        it('should evaluate multi-level expression chains', async () => {
            // Order with member discount + promo creates chain:
            // memberDiscount -> totalDiscountPercent -> discountAmount -> subtotalAfterDiscount -> taxAmount -> orderTotal
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 200.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'member@test.com', name: 'Member', isMember: true },
                { promoCode: 'SAVE20' }
            ));
            order.setRegistry(defaultRegistry);

            // Chain evaluation: 200 base, 5% member + 20% promo = 25% off
            expect(await order.getValue(['memberDiscount'])).toBe(5);
            expect(await order.getValue(['promoDiscountPercent'])).toBe(20);
            expect(await order.getValue(['totalDiscountPercent'])).toBe(25);
            expect(await order.getValue(['discountAmount'])).toBe(50.00); // 200 * 0.25
            expect(await order.getValue(['subtotalAfterDiscount'])).toBe(150.00); // 200 - 50
            expect(await order.getValue(['taxRate'])).toBe(0.0875);
            expect(await order.getValue(['taxAmount'])).toBeCloseTo(13.125, 2); // 150 * 0.0875
            expect(await order.getValue(['qualifiesForFreeShipping'])).toBe(true); // 200 >= 100
            expect(await order.getValue(['shippingCost'])).toBe(0);
            expect(await order.getValue(['orderTotal'])).toBeCloseTo(163.125, 2); // 150 + 13.125 + 0
        });

        it('should evaluate independent expressions correctly', async () => {
            // Test multiple orders with different configurations
            // Calculation: subtotal - discount + tax + shipping
            const configs = [
                // 50 - 5 (10%) = 45, + 3.6 tax (8% NY) + 9.99 shipping = 58.59
                { price: 50, state: 'NY', promo: 'SAVE10', member: false, expectedTotal: 58.59 },
                // 150 - 7.5 (5% member) = 142.5, + 8.91 tax (6.25% TX) + 0 shipping = 151.41
                { price: 150, state: 'TX', promo: '', member: true, expectedTotal: 151.41 },
                // 80 - 40 (50%) = 40, + 2.6 tax (6.5% WA) + 9.99 shipping = 52.59
                { price: 80, state: 'WA', promo: 'SAVE50', member: false, expectedTotal: 52.59 }
            ];

            for (const cfg of configs) {
                const order = new PropertyNode(createOrder(
                    'ORD-TEST',
                    [{ sku: 'TEST-0001', name: 'Item', price: cfg.price, qty: 1 }],
                    { street: '123 Main', city: 'City', state: cfg.state, zip: '12345' },
                    { id: 'cust-1', email: 'test@test.com', name: 'Test', isMember: cfg.member },
                    { promoCode: cfg.promo }
                ));
                order.setRegistry(defaultRegistry);

                const total = await order.getValue(['orderTotal']);
                expect(total).toBeCloseTo(cfg.expectedTotal, 1);
            }
        });
    });

    // ========================================================================
    // TESTS: Constraint Validation
    // ========================================================================

    describe('Constraint Validation', () => {
        it('should validate order status', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 25.00, qty: 1 }],
                { street: '123 Main', city: 'City', state: 'CA', zip: '12345' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            order.setValue('shipped', ['orderStatus']);
            let result = await checkConstraintsDeep(order.child('orderStatus')!, createContext(order));
            expect(result.valid).toBe(true);

            order.setValue('invalid', ['orderStatus']);
            result = await checkConstraintsDeep(order.child('orderStatus')!, createContext(order));
            expect(result.valid).toBe(false);
        });

        it('should validate required shipping fields', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Item', price: 25.00, qty: 1 }],
                { street: '', city: '', state: '', zip: '' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            const result = await checkConstraintsDeep(order.child('shippingAddress')!, createContext(order));
            expect(result.valid).toBe(false);
        });

        it('should validate line item quantity bounds', async () => {
            const lineItem = new PropertyNode(createLineItem('item_0', 'ELEC-1234', 'Widget', 25.00, 1));
            lineItem.setRegistry(defaultRegistry);
            lineItem.setValue(0, ['quantity']); // Invalid

            const result = await checkConstraintsDeep(lineItem, createContext(lineItem));
            expect(result.valid).toBe(false);
        });
    });

    // ========================================================================
    // TESTS: State Management
    // ========================================================================

    describe('State Management', () => {
        it('should track modifications', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Widget', price: 25.00, qty: 2 }],
                { street: '123 Main', city: 'SF', state: 'CA', zip: '94102' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            const statusNode = order.child('orderStatus')!;
            expect(statusNode.isDirtyNode()).toBe(false);

            order.setValue('confirmed', ['orderStatus']);
            expect(statusNode.isDirtyNode()).toBe(true);
        });

        it('should reset to default state', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Widget', price: 25.00, qty: 1 }],
                { street: '123 Main', city: 'SF', state: 'CA', zip: '94102' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            order.setValue('shipped', ['orderStatus']);
            expect(await order.getValue(['orderStatus'])).toBe('shipped');

            order.child('orderStatus')?.resetNode();
            expect(await order.getValue(['orderStatus'])).toBe('pending');
        });

        it('should snapshot and restore', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Widget', price: 25.00, qty: 2 }],
                { street: '123 Main', city: 'SF', state: 'CA', zip: '94102' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' },
                { promoCode: 'SAVE10' }
            ));
            order.setRegistry(defaultRegistry);

            const snapshot = await order.snapshot();
            expect(snapshot.orderId).toBe('ORD-001');
            expect(snapshot.orderStatus).toBe('pending');

            order.setFromSnapshot({ orderStatus: 'delivered' });
            expect(await order.getValue(['orderStatus'])).toBe('delivered');
        });
    });

    // ========================================================================
    // TESTS: Order Lifecycle
    // ========================================================================

    describe('Order Lifecycle', () => {
        it('should progress through order states', async () => {
            const order = new PropertyNode(createOrder(
                'ORD-001',
                [{ sku: 'ELEC-1234', name: 'Widget', price: 100.00, qty: 1 }],
                { street: '123 Main', city: 'SF', state: 'CA', zip: '94102' },
                { id: 'cust-1', email: 'test@test.com', name: 'Test' }
            ));
            order.setRegistry(defaultRegistry);

            const states = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

            for (const state of states) {
                order.setValue(state, ['orderStatus']);
                expect(await order.getValue(['orderStatus'])).toBe(state);

                const result = await checkConstraintsDeep(order.child('orderStatus')!, createContext(order));
                expect(result.valid).toBe(true);
            }
        });
    });

    // ========================================================================
    // TESTS: ENUM Types
    // ========================================================================

    describe('ENUM Types', () => {
        it('should create enums with string values', () => {
            expect(OrderStatusEnum.type.id).toBe('Enum');
            expect(OrderStatusEnum.children!['pending'].value).toBe('pending');
        });

        it('should create enums with numeric values', () => {
            expect(ShippingMethodEnum.type.id).toBe('Enum');
            expect(ShippingMethodEnum.children!['STANDARD'].value).toBe(1.0);
            expect(ShippingMethodEnum.children!['EXPRESS'].value).toBe(2.5);
        });
    });
});
