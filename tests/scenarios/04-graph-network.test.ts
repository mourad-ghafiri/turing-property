// ============================================================================
// SCENARIO 4: Social Network Graph
// ============================================================================
// Demonstrates graph-like structures using the Property system with
// expression-based computed metrics for connections and relationships.
//
// Real-world use case: Social network connection recommendations
// ============================================================================

import { describe, test, expect, beforeEach } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import { TYPE, STRING, NUMBER, BOOLEAN, LIST } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const USER_PROFILE = { id: 'UserProfile', type: TYPE };
const CONNECTION = { id: 'Connection', type: TYPE };
const NETWORK_STATS = { id: 'NetworkStats', type: TYPE };
const RECOMMENDATION = { id: 'Recommendation', type: TYPE };

// ============================================================================
// USER PROFILE FACTORY
// ============================================================================

interface UserData {
    id: string;
    name: string;
    email: string;
    joinedYear: number;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isVerified: boolean;
    isActive: boolean;
}

function createUserProfile(data: UserData): Property {
    return {
        id: data.id,
        type: USER_PROFILE,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            email: { id: 'email', type: STRING, value: data.email },
            joinedYear: { id: 'joinedYear', type: NUMBER, value: data.joinedYear },
            postsCount: { id: 'postsCount', type: NUMBER, value: data.postsCount },
            followersCount: { id: 'followersCount', type: NUMBER, value: data.followersCount },
            followingCount: { id: 'followingCount', type: NUMBER, value: data.followingCount },
            isVerified: { id: 'isVerified', type: BOOLEAN, value: data.isVerified },
            isActive: { id: 'isActive', type: BOOLEAN, value: data.isActive },

            // EXPRESSION: Years on platform (2026 - joinedYear)
            yearsOnPlatform: {
                id: 'yearsOnPlatform',
                type: NUMBER,
                value: op('sub',
                    lit(2026),
                    ref(['self', 'parent', 'joinedYear', 'value'])
                )
            },

            // EXPRESSION: Engagement ratio = posts / (years + 1)
            engagementRatio: {
                id: 'engagementRatio',
                type: NUMBER,
                value: op('div',
                    ref(['self', 'parent', 'postsCount', 'value']),
                    op('add',
                        op('sub', lit(2026), ref(['self', 'parent', 'joinedYear', 'value'])),
                        lit(1)
                    )
                )
            },

            // EXPRESSION: Follower-to-following ratio
            followerRatio: {
                id: 'followerRatio',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'followingCount', 'value']), lit(0)),
                    op('div',
                        ref(['self', 'parent', 'followersCount', 'value']),
                        ref(['self', 'parent', 'followingCount', 'value'])
                    ),
                    ref(['self', 'parent', 'followersCount', 'value'])  // If following 0, return followers
                )
            },

            // EXPRESSION: Influence score (0-100)
            // Based on followers, verification, and engagement
            influenceScore: {
                id: 'influenceScore',
                type: NUMBER,
                value: op('min',
                    op('add',
                        // Base score from followers (log scale, max 50 points)
                        op('min',
                            op('mul',
                                op('div', ref(['self', 'parent', 'followersCount', 'value']), lit(1000)),
                                lit(10)
                            ),
                            lit(50)
                        ),
                        op('add',
                            // Verification bonus (20 points)
                            op('if', ref(['self', 'parent', 'isVerified', 'value']), lit(20), lit(0)),
                            // Engagement bonus (up to 30 points)
                            op('min',
                                op('mul',
                                    op('div',
                                        ref(['self', 'parent', 'postsCount', 'value']),
                                        op('add',
                                            op('sub', lit(2026), ref(['self', 'parent', 'joinedYear', 'value'])),
                                            lit(1)
                                        )
                                    ),
                                    lit(0.3)
                                ),
                                lit(30)
                            )
                        )
                    ),
                    lit(100)
                )
            },

            // EXPRESSION: Is influencer (influence score > 70)
            isInfluencer: {
                id: 'isInfluencer',
                type: BOOLEAN,
                value: op('gt',
                    op('min',
                        op('add',
                            op('min',
                                op('mul',
                                    op('div', ref(['self', 'parent', 'followersCount', 'value']), lit(1000)),
                                    lit(10)
                                ),
                                lit(50)
                            ),
                            op('add',
                                op('if', ref(['self', 'parent', 'isVerified', 'value']), lit(20), lit(0)),
                                op('min',
                                    op('mul',
                                        op('div',
                                            ref(['self', 'parent', 'postsCount', 'value']),
                                            op('add',
                                                op('sub', lit(2026), ref(['self', 'parent', 'joinedYear', 'value'])),
                                                lit(1)
                                            )
                                        ),
                                        lit(0.3)
                                    ),
                                    lit(30)
                                )
                            )
                        ),
                        lit(100)
                    ),
                    lit(70)
                )
            }
        }
    };
}

// ============================================================================
// CONNECTION FACTORY - Represents a connection between two users
// ============================================================================

interface ConnectionData {
    fromUserId: string;
    toUserId: string;
    connectionYear: number;
    interactionCount: number;
    mutualFriendsCount: number;
    isBlocked: boolean;
}

function createConnection(data: ConnectionData): Property {
    return {
        id: `${data.fromUserId}_to_${data.toUserId}`,
        type: CONNECTION,
        children: {
            fromUserId: { id: 'fromUserId', type: STRING, value: data.fromUserId },
            toUserId: { id: 'toUserId', type: STRING, value: data.toUserId },
            connectionYear: { id: 'connectionYear', type: NUMBER, value: data.connectionYear },
            interactionCount: { id: 'interactionCount', type: NUMBER, value: data.interactionCount },
            mutualFriendsCount: { id: 'mutualFriendsCount', type: NUMBER, value: data.mutualFriendsCount },
            isBlocked: { id: 'isBlocked', type: BOOLEAN, value: data.isBlocked },

            // EXPRESSION: Connection age in years
            connectionAge: {
                id: 'connectionAge',
                type: NUMBER,
                value: op('sub',
                    lit(2026),
                    ref(['self', 'parent', 'connectionYear', 'value'])
                )
            },

            // EXPRESSION: Interaction rate (interactions per year)
            interactionRate: {
                id: 'interactionRate',
                type: NUMBER,
                value: op('if',
                    op('gt',
                        op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value'])),
                        lit(0)
                    ),
                    op('div',
                        ref(['self', 'parent', 'interactionCount', 'value']),
                        op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value']))
                    ),
                    ref(['self', 'parent', 'interactionCount', 'value'])  // First year
                )
            },

            // EXPRESSION: Connection strength (0-100)
            // Based on interactions, mutual friends, and connection age
            connectionStrength: {
                id: 'connectionStrength',
                type: NUMBER,
                value: op('if',
                    ref(['self', 'parent', 'isBlocked', 'value']),
                    lit(0),  // Blocked = 0 strength
                    op('min',
                        op('add',
                            // Interaction points (up to 40)
                            op('min',
                                op('mul', ref(['self', 'parent', 'interactionCount', 'value']), lit(0.4)),
                                lit(40)
                            ),
                            op('add',
                                // Mutual friends points (up to 30)
                                op('min',
                                    op('mul', ref(['self', 'parent', 'mutualFriendsCount', 'value']), lit(3)),
                                    lit(30)
                                ),
                                // Connection age points (up to 30)
                                op('min',
                                    op('mul',
                                        op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value'])),
                                        lit(5)
                                    ),
                                    lit(30)
                                )
                            )
                        ),
                        lit(100)
                    )
                )
            },

            // EXPRESSION: Is close friend (strength > 70 AND not blocked)
            isCloseFriend: {
                id: 'isCloseFriend',
                type: BOOLEAN,
                value: op('and',
                    op('not', ref(['self', 'parent', 'isBlocked', 'value'])),
                    op('gt',
                        op('min',
                            op('add',
                                op('min',
                                    op('mul', ref(['self', 'parent', 'interactionCount', 'value']), lit(0.4)),
                                    lit(40)
                                ),
                                op('add',
                                    op('min',
                                        op('mul', ref(['self', 'parent', 'mutualFriendsCount', 'value']), lit(3)),
                                        lit(30)
                                    ),
                                    op('min',
                                        op('mul',
                                            op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value'])),
                                            lit(5)
                                        ),
                                        lit(30)
                                    )
                                )
                            ),
                            lit(100)
                        ),
                        lit(70)
                    )
                )
            },

            // EXPRESSION: Needs reconnection (strength < 30 AND connected > 1 year)
            needsReconnection: {
                id: 'needsReconnection',
                type: BOOLEAN,
                value: op('and',
                    op('not', ref(['self', 'parent', 'isBlocked', 'value'])),
                    op('and',
                        op('lt',
                            op('min',
                                op('add',
                                    op('min',
                                        op('mul', ref(['self', 'parent', 'interactionCount', 'value']), lit(0.4)),
                                        lit(40)
                                    ),
                                    op('add',
                                        op('min',
                                            op('mul', ref(['self', 'parent', 'mutualFriendsCount', 'value']), lit(3)),
                                            lit(30)
                                        ),
                                        op('min',
                                            op('mul',
                                                op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value'])),
                                                lit(5)
                                            ),
                                            lit(30)
                                        )
                                    )
                                ),
                                lit(100)
                            ),
                            lit(30)
                        ),
                        op('gt',
                            op('sub', lit(2026), ref(['self', 'parent', 'connectionYear', 'value'])),
                            lit(1)
                        )
                    )
                )
            }
        }
    };
}

// ============================================================================
// NETWORK ANALYSIS HELPER
// ============================================================================

class NetworkAnalyzer {
    private users: Map<string, Property> = new Map();
    private connections: Property[] = [];

    addUser(user: Property): void {
        this.users.set(user.id, user);
    }

    addConnection(connection: Property): void {
        this.connections.push(connection);
    }

    async getUserMetrics(userId: string): Promise<{
        yearsOnPlatform: number;
        engagementRatio: number;
        followerRatio: number;
        influenceScore: number;
        isInfluencer: boolean;
    } | null> {
        const user = this.users.get(userId);
        if (!user) return null;

        const node = new PropertyNode(user);
        node.setRegistry(defaultRegistry);

        return {
            yearsOnPlatform: await node.getValue(['yearsOnPlatform']) as number,
            engagementRatio: await node.getValue(['engagementRatio']) as number,
            followerRatio: await node.getValue(['followerRatio']) as number,
            influenceScore: await node.getValue(['influenceScore']) as number,
            isInfluencer: await node.getValue(['isInfluencer']) as boolean
        };
    }

    async getConnectionMetrics(fromId: string, toId: string): Promise<{
        connectionAge: number;
        interactionRate: number;
        connectionStrength: number;
        isCloseFriend: boolean;
        needsReconnection: boolean;
    } | null> {
        const connection = this.connections.find(c => {
            const children = c.children || {};
            return children.fromUserId?.value === fromId && children.toUserId?.value === toId;
        });

        if (!connection) return null;

        const node = new PropertyNode(connection);
        node.setRegistry(defaultRegistry);

        return {
            connectionAge: await node.getValue(['connectionAge']) as number,
            interactionRate: await node.getValue(['interactionRate']) as number,
            connectionStrength: await node.getValue(['connectionStrength']) as number,
            isCloseFriend: await node.getValue(['isCloseFriend']) as boolean,
            needsReconnection: await node.getValue(['needsReconnection']) as boolean
        };
    }

    async getCloseFriends(userId: string): Promise<string[]> {
        const closeFriends: string[] = [];

        for (const conn of this.connections) {
            const children = conn.children || {};
            if (children.fromUserId?.value !== userId) continue;

            const node = new PropertyNode(conn);
            node.setRegistry(defaultRegistry);

            const isClose = await node.getValue(['isCloseFriend']) as boolean;
            if (isClose) {
                closeFriends.push(children.toUserId?.value as string);
            }
        }

        return closeFriends;
    }

    async getReconnectionSuggestions(userId: string): Promise<string[]> {
        const suggestions: string[] = [];

        for (const conn of this.connections) {
            const children = conn.children || {};
            if (children.fromUserId?.value !== userId) continue;

            const node = new PropertyNode(conn);
            node.setRegistry(defaultRegistry);

            const needsReconnection = await node.getValue(['needsReconnection']) as boolean;
            if (needsReconnection) {
                suggestions.push(children.toUserId?.value as string);
            }
        }

        return suggestions;
    }
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 4: Social Network Graph', () => {
    let analyzer: NetworkAnalyzer;

    beforeEach(() => {
        analyzer = new NetworkAnalyzer();
    });

    describe('User Profile Metrics', () => {
        test('should calculate years on platform', async () => {
            const user = createUserProfile({
                id: 'user1',
                name: 'Alice',
                email: 'alice@example.com',
                joinedYear: 2020,
                postsCount: 100,
                followersCount: 1000,
                followingCount: 200,
                isVerified: false,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const years = await node.getValue(['yearsOnPlatform']);
            expect(years).toBe(6);  // 2026 - 2020 = 6
        });

        test('should calculate engagement ratio', async () => {
            const user = createUserProfile({
                id: 'user2',
                name: 'Bob',
                email: 'bob@example.com',
                joinedYear: 2023,  // 3 years ago + 1 = 4 years factor
                postsCount: 200,
                followersCount: 500,
                followingCount: 100,
                isVerified: false,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const ratio = await node.getValue(['engagementRatio']);
            expect(ratio).toBe(50);  // 200 posts / 4 years = 50
        });

        test('should calculate follower ratio', async () => {
            const user = createUserProfile({
                id: 'user3',
                name: 'Carol',
                email: 'carol@example.com',
                joinedYear: 2022,
                postsCount: 50,
                followersCount: 1000,
                followingCount: 250,
                isVerified: true,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const ratio = await node.getValue(['followerRatio']);
            expect(ratio).toBe(4);  // 1000 / 250 = 4
        });

        test('should handle zero following count', async () => {
            const user = createUserProfile({
                id: 'user4',
                name: 'Dave',
                email: 'dave@example.com',
                joinedYear: 2024,
                postsCount: 10,
                followersCount: 500,
                followingCount: 0,  // Following nobody
                isVerified: false,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const ratio = await node.getValue(['followerRatio']);
            expect(ratio).toBe(500);  // Returns followers when following = 0
        });

        test('should calculate influence score for regular user', async () => {
            const user = createUserProfile({
                id: 'user5',
                name: 'Eve',
                email: 'eve@example.com',
                joinedYear: 2023,
                postsCount: 50,
                followersCount: 500,
                followingCount: 200,
                isVerified: false,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const score = await node.getValue(['influenceScore']) as number;
            // Followers: min(500/1000 * 10, 50) = 5
            // Verification: 0
            // Engagement: min(50/4 * 0.3, 30) = min(3.75, 30) = 3.75
            // Total: 5 + 0 + 3.75 = 8.75
            expect(score).toBeCloseTo(8.75, 2);
        });

        test('should calculate influence score for verified influencer', async () => {
            const user = createUserProfile({
                id: 'user6',
                name: 'Frank',
                email: 'frank@example.com',
                joinedYear: 2018,
                postsCount: 1000,
                followersCount: 50000,
                followingCount: 100,
                isVerified: true,
                isActive: true
            });

            const node = new PropertyNode(user);
            node.setRegistry(defaultRegistry);

            const score = await node.getValue(['influenceScore']) as number;
            // Followers: min(50000/1000 * 10, 50) = min(500, 50) = 50
            // Verification: 20
            // Engagement: min(1000/9 * 0.3, 30) = min(33.33, 30) = 30
            // Total: min(50 + 20 + 30, 100) = 100
            expect(score).toBe(100);
        });

        test('should identify influencer status', async () => {
            // Not an influencer (low scores)
            const regularUser = createUserProfile({
                id: 'regular',
                name: 'Regular',
                email: 'regular@example.com',
                joinedYear: 2025,
                postsCount: 10,
                followersCount: 50,
                followingCount: 100,
                isVerified: false,
                isActive: true
            });

            const regularNode = new PropertyNode(regularUser);
            regularNode.setRegistry(defaultRegistry);
            expect(await regularNode.getValue(['isInfluencer'])).toBe(false);

            // Is an influencer (high scores)
            const influencer = createUserProfile({
                id: 'influencer',
                name: 'Influencer',
                email: 'influencer@example.com',
                joinedYear: 2018,
                postsCount: 800,
                followersCount: 100000,
                followingCount: 50,
                isVerified: true,
                isActive: true
            });

            const influencerNode = new PropertyNode(influencer);
            influencerNode.setRegistry(defaultRegistry);
            expect(await influencerNode.getValue(['isInfluencer'])).toBe(true);
        });
    });

    describe('Connection Metrics', () => {
        test('should calculate connection age', async () => {
            const connection = createConnection({
                fromUserId: 'alice',
                toUserId: 'bob',
                connectionYear: 2022,
                interactionCount: 50,
                mutualFriendsCount: 5,
                isBlocked: false
            });

            const node = new PropertyNode(connection);
            node.setRegistry(defaultRegistry);

            const age = await node.getValue(['connectionAge']);
            expect(age).toBe(4);  // 2026 - 2022 = 4
        });

        test('should calculate interaction rate', async () => {
            const connection = createConnection({
                fromUserId: 'alice',
                toUserId: 'carol',
                connectionYear: 2024,  // 2 years ago
                interactionCount: 100,
                mutualFriendsCount: 3,
                isBlocked: false
            });

            const node = new PropertyNode(connection);
            node.setRegistry(defaultRegistry);

            const rate = await node.getValue(['interactionRate']);
            expect(rate).toBe(50);  // 100 / 2 = 50
        });

        test('should handle first-year connection for interaction rate', async () => {
            const connection = createConnection({
                fromUserId: 'alice',
                toUserId: 'dave',
                connectionYear: 2026,  // This year
                interactionCount: 20,
                mutualFriendsCount: 1,
                isBlocked: false
            });

            const node = new PropertyNode(connection);
            node.setRegistry(defaultRegistry);

            const rate = await node.getValue(['interactionRate']);
            expect(rate).toBe(20);  // Returns interaction count for first year
        });

        test('should calculate connection strength for active connection', async () => {
            const connection = createConnection({
                fromUserId: 'alice',
                toUserId: 'eve',
                connectionYear: 2022,  // 4 years = 20 points (4*5)
                interactionCount: 100,  // 40 points (100*0.4, capped)
                mutualFriendsCount: 10,  // 30 points (10*3, capped)
                isBlocked: false
            });

            const node = new PropertyNode(connection);
            node.setRegistry(defaultRegistry);

            const strength = await node.getValue(['connectionStrength']) as number;
            // 40 + 30 + 20 = 90
            expect(strength).toBe(90);
        });

        test('should return zero strength for blocked connection', async () => {
            const connection = createConnection({
                fromUserId: 'alice',
                toUserId: 'troll',
                connectionYear: 2020,
                interactionCount: 500,
                mutualFriendsCount: 20,
                isBlocked: true
            });

            const node = new PropertyNode(connection);
            node.setRegistry(defaultRegistry);

            const strength = await node.getValue(['connectionStrength']);
            expect(strength).toBe(0);
        });

        test('should identify close friends', async () => {
            // Close friend (high strength)
            const closeConn = createConnection({
                fromUserId: 'user1',
                toUserId: 'bestfriend',
                connectionYear: 2018,  // 8 years = 30 points (capped)
                interactionCount: 200,  // 40 points (capped)
                mutualFriendsCount: 15,  // 30 points (capped)
                isBlocked: false
            });

            const closeNode = new PropertyNode(closeConn);
            closeNode.setRegistry(defaultRegistry);
            expect(await closeNode.getValue(['isCloseFriend'])).toBe(true);

            // Not close (low strength)
            const acquaintance = createConnection({
                fromUserId: 'user1',
                toUserId: 'acquaintance',
                connectionYear: 2025,  // 1 year = 5 points
                interactionCount: 5,  // 2 points
                mutualFriendsCount: 1,  // 3 points
                isBlocked: false
            });

            const acqNode = new PropertyNode(acquaintance);
            acqNode.setRegistry(defaultRegistry);
            expect(await acqNode.getValue(['isCloseFriend'])).toBe(false);
        });

        test('should identify connections needing reconnection', async () => {
            // Needs reconnection (old but low interaction)
            const weakConn = createConnection({
                fromUserId: 'user1',
                toUserId: 'oldFriend',
                connectionYear: 2020,  // 6 years = 30 points
                interactionCount: 2,  // 0.8 points
                mutualFriendsCount: 0,  // 0 points
                isBlocked: false
            });
            // Total strength = 30.8, but wait - 2*0.4 = 0.8, 0*3=0, 6*5=30 = 30.8
            // That's > 30, so won't trigger

            const weakNode = new PropertyNode(weakConn);
            weakNode.setRegistry(defaultRegistry);
            expect(await weakNode.getValue(['needsReconnection'])).toBe(false);

            // Really weak connection
            const veryWeakConn = createConnection({
                fromUserId: 'user1',
                toUserId: 'forgottenFriend',
                connectionYear: 2023,  // 3 years = 15 points
                interactionCount: 1,   // 0.4 points
                mutualFriendsCount: 0, // 0 points
                isBlocked: false
            });
            // Total = 15.4, which is < 30

            const veryWeakNode = new PropertyNode(veryWeakConn);
            veryWeakNode.setRegistry(defaultRegistry);
            expect(await veryWeakNode.getValue(['needsReconnection'])).toBe(true);
        });
    });

    describe('Network Analyzer', () => {
        beforeEach(() => {
            // Set up a small network
            analyzer.addUser(createUserProfile({
                id: 'alice',
                name: 'Alice',
                email: 'alice@example.com',
                joinedYear: 2020,
                postsCount: 200,
                followersCount: 5000,
                followingCount: 100,
                isVerified: true,
                isActive: true
            }));

            analyzer.addUser(createUserProfile({
                id: 'bob',
                name: 'Bob',
                email: 'bob@example.com',
                joinedYear: 2022,
                postsCount: 50,
                followersCount: 200,
                followingCount: 150,
                isVerified: false,
                isActive: true
            }));

            analyzer.addUser(createUserProfile({
                id: 'carol',
                name: 'Carol',
                email: 'carol@example.com',
                joinedYear: 2023,
                postsCount: 10,
                followersCount: 50,
                followingCount: 100,
                isVerified: false,
                isActive: true
            }));

            // Alice's connections
            analyzer.addConnection(createConnection({
                fromUserId: 'alice',
                toUserId: 'bob',
                connectionYear: 2022,
                interactionCount: 150,
                mutualFriendsCount: 8,
                isBlocked: false
            }));

            analyzer.addConnection(createConnection({
                fromUserId: 'alice',
                toUserId: 'carol',
                connectionYear: 2024,
                interactionCount: 5,
                mutualFriendsCount: 1,
                isBlocked: false
            }));
        });

        test('should get user metrics via analyzer', async () => {
            const metrics = await analyzer.getUserMetrics('alice');

            expect(metrics).not.toBeNull();
            expect(metrics!.yearsOnPlatform).toBe(6);
            expect(metrics!.followerRatio).toBe(50);  // 5000 / 100
            expect(metrics!.isInfluencer).toBe(true);
        });

        test('should return null for unknown user', async () => {
            const metrics = await analyzer.getUserMetrics('unknown');
            expect(metrics).toBeNull();
        });

        test('should get connection metrics via analyzer', async () => {
            const metrics = await analyzer.getConnectionMetrics('alice', 'bob');

            expect(metrics).not.toBeNull();
            expect(metrics!.connectionAge).toBe(4);
            expect(metrics!.isCloseFriend).toBe(true);  // High interaction
        });

        test('should return null for unknown connection', async () => {
            const metrics = await analyzer.getConnectionMetrics('alice', 'unknown');
            expect(metrics).toBeNull();
        });

        test('should find close friends', async () => {
            const closeFriends = await analyzer.getCloseFriends('alice');

            expect(closeFriends).toContain('bob');
            expect(closeFriends).not.toContain('carol');  // Low interaction
        });

        test('should find reconnection suggestions', async () => {
            // Add a weak old connection
            analyzer.addConnection(createConnection({
                fromUserId: 'alice',
                toUserId: 'dave',
                connectionYear: 2021,  // 5 years
                interactionCount: 2,   // Very low
                mutualFriendsCount: 0,
                isBlocked: false
            }));

            const suggestions = await analyzer.getReconnectionSuggestions('alice');

            expect(suggestions).toContain('dave');
            expect(suggestions).not.toContain('bob');  // Active connection
        });
    });

    describe('Edge Cases', () => {
        test('should handle new user (joined this year)', async () => {
            const newUser = createUserProfile({
                id: 'newbie',
                name: 'Newbie',
                email: 'newbie@example.com',
                joinedYear: 2026,
                postsCount: 5,
                followersCount: 10,
                followingCount: 50,
                isVerified: false,
                isActive: true
            });

            const node = new PropertyNode(newUser);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['yearsOnPlatform'])).toBe(0);
            expect(await node.getValue(['engagementRatio'])).toBe(5);  // 5 / 1
        });

        test('should handle maximum influence cap', async () => {
            const megaInfluencer = createUserProfile({
                id: 'mega',
                name: 'Mega Star',
                email: 'mega@example.com',
                joinedYear: 2015,
                postsCount: 10000,
                followersCount: 10000000,  // 10 million
                followingCount: 100,
                isVerified: true,
                isActive: true
            });

            const node = new PropertyNode(megaInfluencer);
            node.setRegistry(defaultRegistry);

            const score = await node.getValue(['influenceScore']);
            expect(score).toBe(100);  // Capped at 100
        });

        test('should handle connection strength cap', async () => {
            const superConnection = createConnection({
                fromUserId: 'mega',
                toUserId: 'bestie',
                connectionYear: 2010,  // 16 years
                interactionCount: 1000,
                mutualFriendsCount: 100,
                isBlocked: false
            });

            const node = new PropertyNode(superConnection);
            node.setRegistry(defaultRegistry);

            const strength = await node.getValue(['connectionStrength']);
            expect(strength).toBe(100);  // Capped at 100
        });

        test('should handle inactive blocked user', async () => {
            const blockedConnection = createConnection({
                fromUserId: 'alice',
                toUserId: 'blocked_user',
                connectionYear: 2020,
                interactionCount: 200,
                mutualFriendsCount: 5,
                isBlocked: true
            });

            const node = new PropertyNode(blockedConnection);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['connectionStrength'])).toBe(0);
            expect(await node.getValue(['isCloseFriend'])).toBe(false);
            expect(await node.getValue(['needsReconnection'])).toBe(false);
        });
    });
});
