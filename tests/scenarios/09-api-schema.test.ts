// ============================================================================
// SCENARIO 9: API Schema Validation
// ============================================================================
// Demonstrates API request/response schema definition and validation using
// the Property expression system for computed validations and transformations.
//
// Real-world use case: REST API input validation and response shaping
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

const API_REQUEST = { id: 'ApiRequest', type: TYPE };
const API_RESPONSE = { id: 'ApiResponse', type: TYPE };
const PAGINATION = { id: 'Pagination', type: TYPE };

// ============================================================================
// API REQUEST FACTORY
// ============================================================================

interface RequestData {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    queryParams: Record<string, string | number>;
    bodySize: number;
    contentType: string;
    authToken: string;
    ipAddress: string;
    userAgent: string;
    timestamp: number;
}

function createApiRequest(data: RequestData): Property {
    const page = data.queryParams.page !== undefined ? parseInt(String(data.queryParams.page), 10) : 1;
    const limit = data.queryParams.limit !== undefined ? parseInt(String(data.queryParams.limit), 10) : 20;
    const totalItems = data.queryParams.totalItems !== undefined ? parseInt(String(data.queryParams.totalItems), 10) : 0;

    return {
        id: 'request',
        type: API_REQUEST,
        children: {
            method: { id: 'method', type: STRING, value: data.method },
            path: { id: 'path', type: STRING, value: data.path },
            bodySize: { id: 'bodySize', type: NUMBER, value: data.bodySize },
            contentType: { id: 'contentType', type: STRING, value: data.contentType },
            authToken: { id: 'authToken', type: STRING, value: data.authToken },
            ipAddress: { id: 'ipAddress', type: STRING, value: data.ipAddress },
            userAgent: { id: 'userAgent', type: STRING, value: data.userAgent },
            timestamp: { id: 'timestamp', type: NUMBER, value: data.timestamp },

            // Query parameters
            page: { id: 'page', type: NUMBER, value: page },
            limit: { id: 'limit', type: NUMBER, value: limit },
            totalItems: { id: 'totalItems', type: NUMBER, value: totalItems },

            // ========== COMPUTED VALIDATIONS ==========

            // EXPRESSION: Has authentication
            isAuthenticated: {
                id: 'isAuthenticated',
                type: BOOLEAN,
                value: op('gt',
                    op('len', ref(['self', 'parent', 'authToken', 'value'])),
                    lit(0)
                )
            },

            // EXPRESSION: Is valid HTTP method
            isValidMethod: {
                id: 'isValidMethod',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('GET')),
                    op('or',
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                        op('or',
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                            op('or',
                                op('eq', ref(['self', 'parent', 'method', 'value']), lit('DELETE')),
                                op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                            )
                        )
                    )
                )
            },

            // EXPRESSION: Has body (POST, PUT, PATCH can have body)
            canHaveBody: {
                id: 'canHaveBody',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                    op('or',
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                    )
                )
            },

            // EXPRESSION: Body size valid (< 10MB = 10485760 bytes)
            isBodySizeValid: {
                id: 'isBodySizeValid',
                type: BOOLEAN,
                value: op('lte',
                    ref(['self', 'parent', 'bodySize', 'value']),
                    lit(10485760)
                )
            },

            // EXPRESSION: Is JSON content type
            isJsonContent: {
                id: 'isJsonContent',
                type: BOOLEAN,
                value: op('eq',
                    ref(['self', 'parent', 'contentType', 'value']),
                    lit('application/json')
                )
            },

            // EXPRESSION: Page is valid (>= 1)
            isPageValid: {
                id: 'isPageValid',
                type: BOOLEAN,
                value: op('gte',
                    ref(['self', 'parent', 'page', 'value']),
                    lit(1)
                )
            },

            // EXPRESSION: Limit is valid (1-100)
            isLimitValid: {
                id: 'isLimitValid',
                type: BOOLEAN,
                value: op('and',
                    op('gte', ref(['self', 'parent', 'limit', 'value']), lit(1)),
                    op('lte', ref(['self', 'parent', 'limit', 'value']), lit(100))
                )
            },

            // EXPRESSION: Calculate offset for pagination
            offset: {
                id: 'offset',
                type: NUMBER,
                value: op('mul',
                    op('sub', ref(['self', 'parent', 'page', 'value']), lit(1)),
                    ref(['self', 'parent', 'limit', 'value'])
                )
            },

            // EXPRESSION: Calculate total pages
            totalPages: {
                id: 'totalPages',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'totalItems', 'value']), lit(0)),
                    op('ceil',
                        op('div',
                            ref(['self', 'parent', 'totalItems', 'value']),
                            ref(['self', 'parent', 'limit', 'value'])
                        )
                    ),
                    lit(0)
                )
            },

            // EXPRESSION: Has next page
            hasNextPage: {
                id: 'hasNextPage',
                type: BOOLEAN,
                value: op('lt',
                    ref(['self', 'parent', 'page', 'value']),
                    op('if',
                        op('gt', ref(['self', 'parent', 'totalItems', 'value']), lit(0)),
                        op('ceil',
                            op('div',
                                ref(['self', 'parent', 'totalItems', 'value']),
                                ref(['self', 'parent', 'limit', 'value'])
                            )
                        ),
                        lit(0)
                    )
                )
            },

            // EXPRESSION: Has previous page
            hasPrevPage: {
                id: 'hasPrevPage',
                type: BOOLEAN,
                value: op('gt',
                    ref(['self', 'parent', 'page', 'value']),
                    lit(1)
                )
            },

            // EXPRESSION: Is read operation (GET)
            isReadOperation: {
                id: 'isReadOperation',
                type: BOOLEAN,
                value: op('eq',
                    ref(['self', 'parent', 'method', 'value']),
                    lit('GET')
                )
            },

            // EXPRESSION: Is write operation (POST, PUT, PATCH, DELETE)
            isWriteOperation: {
                id: 'isWriteOperation',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                    op('or',
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                        op('or',
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('DELETE')),
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                        )
                    )
                )
            },

            // EXPRESSION: Requires authentication (write operations require auth)
            requiresAuth: {
                id: 'requiresAuth',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                    op('or',
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                        op('or',
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('DELETE')),
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                        )
                    )
                )
            },

            // EXPRESSION: Is authorized (either doesn't require auth OR is authenticated)
            isAuthorized: {
                id: 'isAuthorized',
                type: BOOLEAN,
                value: op('or',
                    op('not',
                        op('or',
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                            op('or',
                                op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                                op('or',
                                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('DELETE')),
                                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                                )
                            )
                        )
                    ),
                    op('gt',
                        op('len', ref(['self', 'parent', 'authToken', 'value'])),
                        lit(0)
                    )
                )
            },

            // EXPRESSION: Request is valid (all validations pass)
            isValid: {
                id: 'isValid',
                type: BOOLEAN,
                value: op('and',
                    // Valid method
                    op('or',
                        op('eq', ref(['self', 'parent', 'method', 'value']), lit('GET')),
                        op('or',
                            op('eq', ref(['self', 'parent', 'method', 'value']), lit('POST')),
                            op('or',
                                op('eq', ref(['self', 'parent', 'method', 'value']), lit('PUT')),
                                op('or',
                                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('DELETE')),
                                    op('eq', ref(['self', 'parent', 'method', 'value']), lit('PATCH'))
                                )
                            )
                        )
                    ),
                    op('and',
                        // Valid body size
                        op('lte', ref(['self', 'parent', 'bodySize', 'value']), lit(10485760)),
                        op('and',
                            // Valid pagination
                            op('gte', ref(['self', 'parent', 'page', 'value']), lit(1)),
                            op('and',
                                op('gte', ref(['self', 'parent', 'limit', 'value']), lit(1)),
                                op('lte', ref(['self', 'parent', 'limit', 'value']), lit(100))
                            )
                        )
                    )
                )
            }
        }
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 9: API Schema Validation', () => {
    describe('Authentication', () => {
        test('should detect authenticated request', async () => {
            const request = createApiRequest({
                method: 'GET',
                path: '/api/users',
                queryParams: {},
                bodySize: 0,
                contentType: '',
                authToken: 'Bearer token123',
                ipAddress: '192.168.1.1',
                userAgent: 'TestClient/1.0',
                timestamp: Date.now()
            });

            const node = new PropertyNode(request);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isAuthenticated'])).toBe(true);
        });

        test('should detect unauthenticated request', async () => {
            const request = createApiRequest({
                method: 'GET',
                path: '/api/public',
                queryParams: {},
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '192.168.1.1',
                userAgent: 'TestClient/1.0',
                timestamp: Date.now()
            });

            const node = new PropertyNode(request);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isAuthenticated'])).toBe(false);
        });
    });

    describe('HTTP Method Validation', () => {
        test('should validate all HTTP methods', async () => {
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

            for (const method of methods) {
                const request = createApiRequest({
                    method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
                    path: '/api/test',
                    queryParams: {},
                    bodySize: 0,
                    contentType: '',
                    authToken: 'token',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test',
                    timestamp: Date.now()
                });

                const node = new PropertyNode(request);
                node.setRegistry(defaultRegistry);

                expect(await node.getValue(['isValidMethod'])).toBe(true);
            }
        });

        test('should identify read vs write operations', async () => {
            const getRequest = createApiRequest({
                method: 'GET',
                path: '/api/users',
                queryParams: {},
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const getNode = new PropertyNode(getRequest);
            getNode.setRegistry(defaultRegistry);

            expect(await getNode.getValue(['isReadOperation'])).toBe(true);
            expect(await getNode.getValue(['isWriteOperation'])).toBe(false);

            const postRequest = createApiRequest({
                method: 'POST',
                path: '/api/users',
                queryParams: {},
                bodySize: 100,
                contentType: 'application/json',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const postNode = new PropertyNode(postRequest);
            postNode.setRegistry(defaultRegistry);

            expect(await postNode.getValue(['isReadOperation'])).toBe(false);
            expect(await postNode.getValue(['isWriteOperation'])).toBe(true);
        });
    });

    describe('Body Validation', () => {
        test('should identify methods that can have body', async () => {
            const methodsWithBody = ['POST', 'PUT', 'PATCH'];
            const methodsWithoutBody = ['GET', 'DELETE'];

            for (const method of methodsWithBody) {
                const request = createApiRequest({
                    method: method as 'POST' | 'PUT' | 'PATCH',
                    path: '/api/test',
                    queryParams: {},
                    bodySize: 0,
                    contentType: '',
                    authToken: 'token',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test',
                    timestamp: Date.now()
                });

                const node = new PropertyNode(request);
                node.setRegistry(defaultRegistry);

                expect(await node.getValue(['canHaveBody'])).toBe(true);
            }

            for (const method of methodsWithoutBody) {
                const request = createApiRequest({
                    method: method as 'GET' | 'DELETE',
                    path: '/api/test',
                    queryParams: {},
                    bodySize: 0,
                    contentType: '',
                    authToken: 'token',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test',
                    timestamp: Date.now()
                });

                const node = new PropertyNode(request);
                node.setRegistry(defaultRegistry);

                expect(await node.getValue(['canHaveBody'])).toBe(false);
            }
        });

        test('should validate body size', async () => {
            const validBody = createApiRequest({
                method: 'POST',
                path: '/api/upload',
                queryParams: {},
                bodySize: 1000000,  // 1MB - valid
                contentType: 'application/json',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const validNode = new PropertyNode(validBody);
            validNode.setRegistry(defaultRegistry);
            expect(await validNode.getValue(['isBodySizeValid'])).toBe(true);

            const invalidBody = createApiRequest({
                method: 'POST',
                path: '/api/upload',
                queryParams: {},
                bodySize: 20000000,  // 20MB - too large
                contentType: 'application/json',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const invalidNode = new PropertyNode(invalidBody);
            invalidNode.setRegistry(defaultRegistry);
            expect(await invalidNode.getValue(['isBodySizeValid'])).toBe(false);
        });

        test('should detect JSON content type', async () => {
            const jsonRequest = createApiRequest({
                method: 'POST',
                path: '/api/data',
                queryParams: {},
                bodySize: 100,
                contentType: 'application/json',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const jsonNode = new PropertyNode(jsonRequest);
            jsonNode.setRegistry(defaultRegistry);
            expect(await jsonNode.getValue(['isJsonContent'])).toBe(true);

            const formRequest = createApiRequest({
                method: 'POST',
                path: '/api/form',
                queryParams: {},
                bodySize: 100,
                contentType: 'multipart/form-data',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const formNode = new PropertyNode(formRequest);
            formNode.setRegistry(defaultRegistry);
            expect(await formNode.getValue(['isJsonContent'])).toBe(false);
        });
    });

    describe('Pagination', () => {
        test('should validate page number', async () => {
            const validPage = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 5 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const validNode = new PropertyNode(validPage);
            validNode.setRegistry(defaultRegistry);
            expect(await validNode.getValue(['isPageValid'])).toBe(true);

            const invalidPage = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 0 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const invalidNode = new PropertyNode(invalidPage);
            invalidNode.setRegistry(defaultRegistry);
            expect(await invalidNode.getValue(['isPageValid'])).toBe(false);
        });

        test('should validate limit', async () => {
            const validLimit = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { limit: 50 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const validNode = new PropertyNode(validLimit);
            validNode.setRegistry(defaultRegistry);
            expect(await validNode.getValue(['isLimitValid'])).toBe(true);

            const tooHigh = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { limit: 500 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const highNode = new PropertyNode(tooHigh);
            highNode.setRegistry(defaultRegistry);
            expect(await highNode.getValue(['isLimitValid'])).toBe(false);
        });

        test('should calculate offset', async () => {
            const request = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 3, limit: 20 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const node = new PropertyNode(request);
            node.setRegistry(defaultRegistry);

            // offset = (page - 1) * limit = (3-1) * 20 = 40
            expect(await node.getValue(['offset'])).toBe(40);
        });

        test('should calculate total pages', async () => {
            const request = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 1, limit: 10, totalItems: 95 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const node = new PropertyNode(request);
            node.setRegistry(defaultRegistry);

            // totalPages = ceil(95 / 10) = 10
            expect(await node.getValue(['totalPages'])).toBe(10);
        });

        test('should detect has next/prev page', async () => {
            const middlePage = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 5, limit: 10, totalItems: 100 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const middleNode = new PropertyNode(middlePage);
            middleNode.setRegistry(defaultRegistry);

            expect(await middleNode.getValue(['hasNextPage'])).toBe(true);
            expect(await middleNode.getValue(['hasPrevPage'])).toBe(true);

            const firstPage = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 1, limit: 10, totalItems: 100 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const firstNode = new PropertyNode(firstPage);
            firstNode.setRegistry(defaultRegistry);

            expect(await firstNode.getValue(['hasNextPage'])).toBe(true);
            expect(await firstNode.getValue(['hasPrevPage'])).toBe(false);

            const lastPage = createApiRequest({
                method: 'GET',
                path: '/api/items',
                queryParams: { page: 10, limit: 10, totalItems: 100 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const lastNode = new PropertyNode(lastPage);
            lastNode.setRegistry(defaultRegistry);

            expect(await lastNode.getValue(['hasNextPage'])).toBe(false);
            expect(await lastNode.getValue(['hasPrevPage'])).toBe(true);
        });
    });

    describe('Authorization', () => {
        test('should allow unauthenticated GET requests', async () => {
            const request = createApiRequest({
                method: 'GET',
                path: '/api/public',
                queryParams: {},
                bodySize: 0,
                contentType: '',
                authToken: '',  // No auth
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const node = new PropertyNode(request);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['requiresAuth'])).toBe(false);
            expect(await node.getValue(['isAuthorized'])).toBe(true);
        });

        test('should require auth for write operations', async () => {
            const noAuthPost = createApiRequest({
                method: 'POST',
                path: '/api/users',
                queryParams: {},
                bodySize: 100,
                contentType: 'application/json',
                authToken: '',  // No auth
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const noAuthNode = new PropertyNode(noAuthPost);
            noAuthNode.setRegistry(defaultRegistry);

            expect(await noAuthNode.getValue(['requiresAuth'])).toBe(true);
            expect(await noAuthNode.getValue(['isAuthorized'])).toBe(false);

            const authPost = createApiRequest({
                method: 'POST',
                path: '/api/users',
                queryParams: {},
                bodySize: 100,
                contentType: 'application/json',
                authToken: 'Bearer token123',  // Has auth
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const authNode = new PropertyNode(authPost);
            authNode.setRegistry(defaultRegistry);

            expect(await authNode.getValue(['requiresAuth'])).toBe(true);
            expect(await authNode.getValue(['isAuthorized'])).toBe(true);
        });
    });

    describe('Overall Validation', () => {
        test('should validate good request', async () => {
            const validRequest = createApiRequest({
                method: 'GET',
                path: '/api/users',
                queryParams: { page: 1, limit: 20 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'TestClient/1.0',
                timestamp: Date.now()
            });

            const node = new PropertyNode(validRequest);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isValid'])).toBe(true);
        });

        test('should invalidate request with bad pagination', async () => {
            const badPage = createApiRequest({
                method: 'GET',
                path: '/api/users',
                queryParams: { page: -1, limit: 20 },
                bodySize: 0,
                contentType: '',
                authToken: '',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const node = new PropertyNode(badPage);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isValid'])).toBe(false);
        });

        test('should invalidate request with oversized body', async () => {
            const bigBody = createApiRequest({
                method: 'POST',
                path: '/api/upload',
                queryParams: {},
                bodySize: 50000000,  // 50MB
                contentType: 'application/json',
                authToken: 'token',
                ipAddress: '127.0.0.1',
                userAgent: 'Test',
                timestamp: Date.now()
            });

            const node = new PropertyNode(bigBody);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isValid'])).toBe(false);
        });
    });
});
