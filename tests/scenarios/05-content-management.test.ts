// ============================================================================
// SCENARIO 5: Content Management System
// ============================================================================
// Demonstrates a CMS using the Property system with expression-based
// computed metrics for SEO, readability, and content quality.
//
// Real-world use case: Blog/CMS with automatic content scoring
// ============================================================================

import { describe, test, expect, beforeEach } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import { TYPE, STRING, NUMBER, BOOLEAN, DATETIME, TIMESTAMP } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const ARTICLE = { id: 'Article', type: TYPE };
const AUTHOR = { id: 'Author', type: TYPE };
const CATEGORY = { id: 'Category', type: TYPE };
const TAG = { id: 'Tag', type: TYPE };

// ============================================================================
// ARTICLE FACTORY
// ============================================================================

interface ArticleData {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    wordCount: number;
    imageCount: number;
    linkCount: number;
    headingCount: number;
    metaDescription: string;
    focusKeyword: string;
    keywordInTitle: boolean;
    keywordInFirstParagraph: boolean;
    keywordDensity: number;  // percentage
    authorId: string;
    categoryId: string;
    status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
    publishedAt?: string;
}

function createArticle(data: ArticleData): Property {
    return {
        id: data.id,
        type: ARTICLE,
        children: {
            // Basic info
            title: { id: 'title', type: STRING, value: data.title },
            slug: { id: 'slug', type: STRING, value: data.slug },
            excerpt: { id: 'excerpt', type: STRING, value: data.excerpt },
            content: { id: 'content', type: STRING, value: data.content },

            // Content metrics
            wordCount: { id: 'wordCount', type: NUMBER, value: data.wordCount },
            imageCount: { id: 'imageCount', type: NUMBER, value: data.imageCount },
            linkCount: { id: 'linkCount', type: NUMBER, value: data.linkCount },
            headingCount: { id: 'headingCount', type: NUMBER, value: data.headingCount },

            // SEO fields
            metaDescription: { id: 'metaDescription', type: STRING, value: data.metaDescription },
            focusKeyword: { id: 'focusKeyword', type: STRING, value: data.focusKeyword },
            keywordInTitle: { id: 'keywordInTitle', type: BOOLEAN, value: data.keywordInTitle },
            keywordInFirstParagraph: { id: 'keywordInFirstParagraph', type: BOOLEAN, value: data.keywordInFirstParagraph },
            keywordDensity: { id: 'keywordDensity', type: NUMBER, value: data.keywordDensity },

            // Relations
            authorId: { id: 'authorId', type: STRING, value: data.authorId },
            categoryId: { id: 'categoryId', type: STRING, value: data.categoryId },

            // Status
            status: { id: 'status', type: STRING, value: data.status },
            createdAt: { id: 'createdAt', type: DATETIME, value: data.createdAt },
            publishedAt: { id: 'publishedAt', type: DATETIME, value: data.publishedAt || null },

            // Engagement metrics
            viewCount: { id: 'viewCount', type: NUMBER, value: data.viewCount },
            likeCount: { id: 'likeCount', type: NUMBER, value: data.likeCount },
            commentCount: { id: 'commentCount', type: NUMBER, value: data.commentCount },
            shareCount: { id: 'shareCount', type: NUMBER, value: data.shareCount },

            // ========== COMPUTED PROPERTIES ==========

            // EXPRESSION: Estimated read time (words / 200 words per minute)
            readTimeMinutes: {
                id: 'readTimeMinutes',
                type: NUMBER,
                value: op('ceil',
                    op('div',
                        ref(['self', 'parent', 'wordCount', 'value']),
                        lit(200)
                    )
                )
            },

            // EXPRESSION: Is long-form content (> 1500 words)
            isLongForm: {
                id: 'isLongForm',
                type: BOOLEAN,
                value: op('gt',
                    ref(['self', 'parent', 'wordCount', 'value']),
                    lit(1500)
                )
            },

            // EXPRESSION: Content structure score (0-100)
            // Based on headings, images, and proper length
            structureScore: {
                id: 'structureScore',
                type: NUMBER,
                value: op('min',
                    op('add',
                        // Heading score (10 points per heading, max 30)
                        op('min',
                            op('mul', ref(['self', 'parent', 'headingCount', 'value']), lit(10)),
                            lit(30)
                        ),
                        op('add',
                            // Image score (15 points per image, max 30)
                            op('min',
                                op('mul', ref(['self', 'parent', 'imageCount', 'value']), lit(15)),
                                lit(30)
                            ),
                            // Length score: optimal 1000-2000 words = 40 points
                            op('if',
                                op('and',
                                    op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(1000)),
                                    op('lte', ref(['self', 'parent', 'wordCount', 'value']), lit(2000))
                                ),
                                lit(40),
                                op('if',
                                    op('and',
                                        op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(500)),
                                        op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(1000))
                                    ),
                                    lit(25),
                                    op('if',
                                        op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(300)),
                                        lit(5),
                                        lit(15)
                                    )
                                )
                            )
                        )
                    ),
                    lit(100)
                )
            },

            // EXPRESSION: SEO Score (0-100)
            // Based on keyword placement, meta description, and keyword density
            seoScore: {
                id: 'seoScore',
                type: NUMBER,
                value: op('min',
                    op('add',
                        // Keyword in title (25 points)
                        op('if', ref(['self', 'parent', 'keywordInTitle', 'value']), lit(25), lit(0)),
                        op('add',
                            // Keyword in first paragraph (20 points)
                            op('if', ref(['self', 'parent', 'keywordInFirstParagraph', 'value']), lit(20), lit(0)),
                            op('add',
                                // Meta description present and good length (20 points)
                                op('if',
                                    op('gt',
                                        op('len', ref(['self', 'parent', 'metaDescription', 'value'])),
                                        lit(50)
                                    ),
                                    lit(20),
                                    lit(0)
                                ),
                                op('add',
                                    // Focus keyword present (15 points)
                                    op('if',
                                        op('gt',
                                            op('len', ref(['self', 'parent', 'focusKeyword', 'value'])),
                                            lit(0)
                                        ),
                                        lit(15),
                                        lit(0)
                                    ),
                                    // Keyword density 1-3% (20 points)
                                    op('if',
                                        op('and',
                                            op('gte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1)),
                                            op('lte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(3))
                                        ),
                                        lit(20),
                                        op('if',
                                            op('and',
                                                op('gt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(0)),
                                                op('lt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1))
                                            ),
                                            lit(10),
                                            lit(0)
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    lit(100)
                )
            },

            // EXPRESSION: Total engagement
            totalEngagement: {
                id: 'totalEngagement',
                type: NUMBER,
                value: op('add',
                    ref(['self', 'parent', 'viewCount', 'value']),
                    op('add',
                        op('mul', ref(['self', 'parent', 'likeCount', 'value']), lit(2)),
                        op('add',
                            op('mul', ref(['self', 'parent', 'commentCount', 'value']), lit(5)),
                            op('mul', ref(['self', 'parent', 'shareCount', 'value']), lit(10))
                        )
                    )
                )
            },

            // EXPRESSION: Engagement rate (engagement / views * 100)
            engagementRate: {
                id: 'engagementRate',
                type: NUMBER,
                value: op('if',
                    op('gt', ref(['self', 'parent', 'viewCount', 'value']), lit(0)),
                    op('mul',
                        op('div',
                            op('add',
                                ref(['self', 'parent', 'likeCount', 'value']),
                                op('add',
                                    ref(['self', 'parent', 'commentCount', 'value']),
                                    ref(['self', 'parent', 'shareCount', 'value'])
                                )
                            ),
                            ref(['self', 'parent', 'viewCount', 'value'])
                        ),
                        lit(100)
                    ),
                    lit(0)
                )
            },

            // EXPRESSION: Is published
            isPublished: {
                id: 'isPublished',
                type: BOOLEAN,
                value: op('eq',
                    ref(['self', 'parent', 'status', 'value']),
                    lit('published')
                )
            },

            // EXPRESSION: Is editable (draft or review)
            isEditable: {
                id: 'isEditable',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'status', 'value']), lit('draft')),
                    op('eq', ref(['self', 'parent', 'status', 'value']), lit('review'))
                )
            },

            // EXPRESSION: Content quality score (combination of structure and SEO)
            qualityScore: {
                id: 'qualityScore',
                type: NUMBER,
                value: op('round',
                    op('div',
                        op('add',
                            // Structure score (duplicated calculation)
                            op('min',
                                op('add',
                                    op('min',
                                        op('mul', ref(['self', 'parent', 'headingCount', 'value']), lit(10)),
                                        lit(30)
                                    ),
                                    op('add',
                                        op('min',
                                            op('mul', ref(['self', 'parent', 'imageCount', 'value']), lit(15)),
                                            lit(30)
                                        ),
                                        op('if',
                                            op('and',
                                                op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(1000)),
                                                op('lte', ref(['self', 'parent', 'wordCount', 'value']), lit(2000))
                                            ),
                                            lit(40),
                                            op('if',
                                                op('and',
                                                    op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(500)),
                                                    op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(1000))
                                                ),
                                                lit(25),
                                                op('if',
                                                    op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(300)),
                                                    lit(5),
                                                    lit(15)
                                                )
                                            )
                                        )
                                    )
                                ),
                                lit(100)
                            ),
                            // SEO score (duplicated calculation)
                            op('min',
                                op('add',
                                    op('if', ref(['self', 'parent', 'keywordInTitle', 'value']), lit(25), lit(0)),
                                    op('add',
                                        op('if', ref(['self', 'parent', 'keywordInFirstParagraph', 'value']), lit(20), lit(0)),
                                        op('add',
                                            op('if',
                                                op('gt',
                                                    op('len', ref(['self', 'parent', 'metaDescription', 'value'])),
                                                    lit(50)
                                                ),
                                                lit(20),
                                                lit(0)
                                            ),
                                            op('add',
                                                op('if',
                                                    op('gt',
                                                        op('len', ref(['self', 'parent', 'focusKeyword', 'value'])),
                                                        lit(0)
                                                    ),
                                                    lit(15),
                                                    lit(0)
                                                ),
                                                op('if',
                                                    op('and',
                                                        op('gte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1)),
                                                        op('lte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(3))
                                                    ),
                                                    lit(20),
                                                    op('if',
                                                        op('and',
                                                            op('gt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(0)),
                                                            op('lt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1))
                                                        ),
                                                        lit(10),
                                                        lit(0)
                                                    )
                                                )
                                            )
                                        )
                                    )
                                ),
                                lit(100)
                            )
                        ),
                        lit(2)
                    )
                )
            },

            // EXPRESSION: Publish readiness (quality > 70 AND has meta description)
            isPublishReady: {
                id: 'isPublishReady',
                type: BOOLEAN,
                value: op('and',
                    op('gt',
                        op('round',
                            op('div',
                                op('add',
                                    op('min',
                                        op('add',
                                            op('min',
                                                op('mul', ref(['self', 'parent', 'headingCount', 'value']), lit(10)),
                                                lit(30)
                                            ),
                                            op('add',
                                                op('min',
                                                    op('mul', ref(['self', 'parent', 'imageCount', 'value']), lit(15)),
                                                    lit(30)
                                                ),
                                                op('if',
                                                    op('and',
                                                        op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(1000)),
                                                        op('lte', ref(['self', 'parent', 'wordCount', 'value']), lit(2000))
                                                    ),
                                                    lit(40),
                                                    op('if',
                                                        op('and',
                                                            op('gte', ref(['self', 'parent', 'wordCount', 'value']), lit(500)),
                                                            op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(1000))
                                                        ),
                                                        lit(25),
                                                        op('if',
                                                            op('lt', ref(['self', 'parent', 'wordCount', 'value']), lit(300)),
                                                            lit(5),
                                                            lit(15)
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        lit(100)
                                    ),
                                    op('min',
                                        op('add',
                                            op('if', ref(['self', 'parent', 'keywordInTitle', 'value']), lit(25), lit(0)),
                                            op('add',
                                                op('if', ref(['self', 'parent', 'keywordInFirstParagraph', 'value']), lit(20), lit(0)),
                                                op('add',
                                                    op('if',
                                                        op('gt',
                                                            op('len', ref(['self', 'parent', 'metaDescription', 'value'])),
                                                            lit(50)
                                                        ),
                                                        lit(20),
                                                        lit(0)
                                                    ),
                                                    op('add',
                                                        op('if',
                                                            op('gt',
                                                                op('len', ref(['self', 'parent', 'focusKeyword', 'value'])),
                                                                lit(0)
                                                            ),
                                                            lit(15),
                                                            lit(0)
                                                        ),
                                                        op('if',
                                                            op('and',
                                                                op('gte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1)),
                                                                op('lte', ref(['self', 'parent', 'keywordDensity', 'value']), lit(3))
                                                            ),
                                                            lit(20),
                                                            op('if',
                                                                op('and',
                                                                    op('gt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(0)),
                                                                    op('lt', ref(['self', 'parent', 'keywordDensity', 'value']), lit(1))
                                                                ),
                                                                lit(10),
                                                                lit(0)
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        lit(100)
                                    )
                                ),
                                lit(2)
                            )
                        ),
                        lit(70)
                    ),
                    op('gt',
                        op('len', ref(['self', 'parent', 'metaDescription', 'value'])),
                        lit(0)
                    )
                )
            }
        }
    };
}

// ============================================================================
// CMS MANAGER
// ============================================================================

class ContentManager {
    private articles: Map<string, Property> = new Map();

    addArticle(article: Property): void {
        this.articles.set(article.id, article);
    }

    async getArticleMetrics(articleId: string): Promise<{
        readTimeMinutes: number;
        isLongForm: boolean;
        structureScore: number;
        seoScore: number;
        qualityScore: number;
        totalEngagement: number;
        engagementRate: number;
        isPublishReady: boolean;
    } | null> {
        const article = this.articles.get(articleId);
        if (!article) return null;

        const node = new PropertyNode(article);
        node.setRegistry(defaultRegistry);

        return {
            readTimeMinutes: await node.getValue(['readTimeMinutes']) as number,
            isLongForm: await node.getValue(['isLongForm']) as boolean,
            structureScore: await node.getValue(['structureScore']) as number,
            seoScore: await node.getValue(['seoScore']) as number,
            qualityScore: await node.getValue(['qualityScore']) as number,
            totalEngagement: await node.getValue(['totalEngagement']) as number,
            engagementRate: await node.getValue(['engagementRate']) as number,
            isPublishReady: await node.getValue(['isPublishReady']) as boolean
        };
    }

    async getPublishReadyArticles(): Promise<string[]> {
        const ready: string[] = [];

        for (const [id, article] of this.articles) {
            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            const isReady = await node.getValue(['isPublishReady']) as boolean;
            const isEditable = await node.getValue(['isEditable']) as boolean;

            if (isReady && isEditable) {
                ready.push(id);
            }
        }

        return ready;
    }

    async getHighEngagementArticles(minRate: number): Promise<string[]> {
        const highEngagement: string[] = [];

        for (const [id, article] of this.articles) {
            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            const rate = await node.getValue(['engagementRate']) as number;

            if (rate >= minRate) {
                highEngagement.push(id);
            }
        }

        return highEngagement;
    }
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 5: Content Management System', () => {
    let cms: ContentManager;

    beforeEach(() => {
        cms = new ContentManager();
    });

    describe('Article Metrics', () => {
        test('should calculate read time', async () => {
            const article = createArticle({
                id: 'article1',
                title: 'Test Article',
                slug: 'test-article',
                excerpt: 'A test excerpt',
                content: 'Lorem ipsum...',
                wordCount: 1000,
                imageCount: 2,
                linkCount: 5,
                headingCount: 3,
                metaDescription: 'A great article about testing',
                focusKeyword: 'testing',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 2.0,
                authorId: 'author1',
                categoryId: 'tech',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            const readTime = await node.getValue(['readTimeMinutes']);
            expect(readTime).toBe(5);  // ceil(1000 / 200) = 5
        });

        test('should identify long-form content', async () => {
            const shortArticle = createArticle({
                id: 'short',
                title: 'Short Post',
                slug: 'short-post',
                excerpt: 'Brief',
                content: 'Short content',
                wordCount: 500,
                imageCount: 1,
                linkCount: 1,
                headingCount: 1,
                metaDescription: 'Short article',
                focusKeyword: 'short',
                keywordInTitle: true,
                keywordInFirstParagraph: false,
                keywordDensity: 1.5,
                authorId: 'author1',
                categoryId: 'news',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const shortNode = new PropertyNode(shortArticle);
            shortNode.setRegistry(defaultRegistry);
            expect(await shortNode.getValue(['isLongForm'])).toBe(false);

            const longArticle = createArticle({
                id: 'long',
                title: 'Long Guide',
                slug: 'long-guide',
                excerpt: 'Comprehensive guide',
                content: 'Very long content...',
                wordCount: 3000,
                imageCount: 5,
                linkCount: 10,
                headingCount: 8,
                metaDescription: 'A comprehensive guide',
                focusKeyword: 'guide',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 1.8,
                authorId: 'author1',
                categoryId: 'tutorials',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const longNode = new PropertyNode(longArticle);
            longNode.setRegistry(defaultRegistry);
            expect(await longNode.getValue(['isLongForm'])).toBe(true);
        });

        test('should calculate structure score', async () => {
            // Well-structured article
            const wellStructured = createArticle({
                id: 'good-structure',
                title: 'Well Structured',
                slug: 'well-structured',
                excerpt: 'Good structure',
                content: 'Content...',
                wordCount: 1500,  // Optimal range = 40 points
                imageCount: 2,   // 2 * 15 = 30 points (capped)
                linkCount: 5,
                headingCount: 3, // 3 * 10 = 30 points (capped)
                metaDescription: 'Great structure example',
                focusKeyword: 'structure',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 2.0,
                authorId: 'author1',
                categoryId: 'tutorials',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const wellNode = new PropertyNode(wellStructured);
            wellNode.setRegistry(defaultRegistry);
            const structureScore = await wellNode.getValue(['structureScore']);
            expect(structureScore).toBe(100);  // 30 + 30 + 40 = 100

            // Poorly structured article
            const poorStructure = createArticle({
                id: 'poor-structure',
                title: 'Poor Structure',
                slug: 'poor-structure',
                excerpt: 'Bad',
                content: 'Short...',
                wordCount: 200,  // < 300 = 5 points
                imageCount: 0,   // 0 points
                linkCount: 0,
                headingCount: 0, // 0 points
                metaDescription: 'Poor example',
                focusKeyword: 'poor',
                keywordInTitle: true,
                keywordInFirstParagraph: false,
                keywordDensity: 0.5,
                authorId: 'author1',
                categoryId: 'misc',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const poorNode = new PropertyNode(poorStructure);
            poorNode.setRegistry(defaultRegistry);
            const poorScore = await poorNode.getValue(['structureScore']);
            expect(poorScore).toBe(5);  // 0 + 0 + 5 = 5
        });

        test('should calculate SEO score', async () => {
            // Perfect SEO
            const perfectSeo = createArticle({
                id: 'perfect-seo',
                title: 'Perfect SEO Article',
                slug: 'perfect-seo-article',
                excerpt: 'SEO optimized',
                content: 'Great SEO content...',
                wordCount: 1200,
                imageCount: 2,
                linkCount: 5,
                headingCount: 4,
                metaDescription: 'This is a comprehensive meta description that is well over 50 characters long for optimal SEO.',
                focusKeyword: 'SEO',
                keywordInTitle: true,         // 25 points
                keywordInFirstParagraph: true, // 20 points
                keywordDensity: 2.0,          // 1-3% = 20 points
                authorId: 'author1',
                categoryId: 'seo',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });
            // Meta description > 50 = 20 points, focus keyword present = 15 points
            // Total: 25 + 20 + 20 + 15 + 20 = 100

            const perfectNode = new PropertyNode(perfectSeo);
            perfectNode.setRegistry(defaultRegistry);
            const seoScore = await perfectNode.getValue(['seoScore']);
            expect(seoScore).toBe(100);

            // Poor SEO
            const poorSeo = createArticle({
                id: 'poor-seo',
                title: 'Some Article',
                slug: 'some-article',
                excerpt: 'Whatever',
                content: 'Content without keywords...',
                wordCount: 800,
                imageCount: 0,
                linkCount: 0,
                headingCount: 1,
                metaDescription: 'Short',  // < 50 chars = 0 points
                focusKeyword: '',          // No keyword = 0 points
                keywordInTitle: false,     // 0 points
                keywordInFirstParagraph: false, // 0 points
                keywordDensity: 0,         // 0% = 0 points
                authorId: 'author1',
                categoryId: 'misc',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const poorNode = new PropertyNode(poorSeo);
            poorNode.setRegistry(defaultRegistry);
            const poorSeoScore = await poorNode.getValue(['seoScore']);
            expect(poorSeoScore).toBe(0);
        });
    });

    describe('Engagement Metrics', () => {
        test('should calculate total engagement', async () => {
            const article = createArticle({
                id: 'popular',
                title: 'Popular Article',
                slug: 'popular-article',
                excerpt: 'Very popular',
                content: 'Popular content...',
                wordCount: 1000,
                imageCount: 2,
                linkCount: 3,
                headingCount: 3,
                metaDescription: 'A popular article that everyone loves to read',
                focusKeyword: 'popular',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 1.5,
                authorId: 'author1',
                categoryId: 'viral',
                status: 'published',
                viewCount: 1000,
                likeCount: 100,
                commentCount: 50,
                shareCount: 20,
                createdAt: '2026-01-01T10:00:00Z',
                publishedAt: '2026-01-02T10:00:00Z'
            });

            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            // Total = views + likes*2 + comments*5 + shares*10
            // 1000 + 200 + 250 + 200 = 1650
            const total = await node.getValue(['totalEngagement']);
            expect(total).toBe(1650);
        });

        test('should calculate engagement rate', async () => {
            const article = createArticle({
                id: 'engaged',
                title: 'Engaging Article',
                slug: 'engaging-article',
                excerpt: 'Engaging content',
                content: 'Content...',
                wordCount: 800,
                imageCount: 1,
                linkCount: 2,
                headingCount: 2,
                metaDescription: 'An article that drives engagement and interaction',
                focusKeyword: 'engaging',
                keywordInTitle: true,
                keywordInFirstParagraph: false,
                keywordDensity: 1.2,
                authorId: 'author1',
                categoryId: 'marketing',
                status: 'published',
                viewCount: 500,
                likeCount: 50,
                commentCount: 25,
                shareCount: 10,
                createdAt: '2026-01-01T10:00:00Z',
                publishedAt: '2026-01-02T10:00:00Z'
            });

            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            // Rate = (likes + comments + shares) / views * 100
            // (50 + 25 + 10) / 500 * 100 = 17%
            const rate = await node.getValue(['engagementRate']);
            expect(rate).toBe(17);
        });

        test('should handle zero views', async () => {
            const newArticle = createArticle({
                id: 'new',
                title: 'Brand New',
                slug: 'brand-new',
                excerpt: 'Just created',
                content: 'New content...',
                wordCount: 600,
                imageCount: 1,
                linkCount: 1,
                headingCount: 2,
                metaDescription: 'A brand new article that hasnt been viewed yet',
                focusKeyword: 'new',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 2.0,
                authorId: 'author1',
                categoryId: 'news',
                status: 'draft',
                viewCount: 0,  // No views yet
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const node = new PropertyNode(newArticle);
            node.setRegistry(defaultRegistry);

            const rate = await node.getValue(['engagementRate']);
            expect(rate).toBe(0);  // Avoids division by zero
        });
    });

    describe('Status Metrics', () => {
        test('should identify published status', async () => {
            const published = createArticle({
                id: 'pub',
                title: 'Published',
                slug: 'published',
                excerpt: 'Live',
                content: 'Content...',
                wordCount: 500,
                imageCount: 1,
                linkCount: 1,
                headingCount: 2,
                metaDescription: 'A published article available to readers',
                focusKeyword: 'live',
                keywordInTitle: false,
                keywordInFirstParagraph: false,
                keywordDensity: 1.0,
                authorId: 'author1',
                categoryId: 'news',
                status: 'published',
                viewCount: 100,
                likeCount: 10,
                commentCount: 5,
                shareCount: 2,
                createdAt: '2026-01-01T10:00:00Z',
                publishedAt: '2026-01-02T10:00:00Z'
            });

            const node = new PropertyNode(published);
            node.setRegistry(defaultRegistry);

            expect(await node.getValue(['isPublished'])).toBe(true);

            const draft = createArticle({
                id: 'draft',
                title: 'Draft',
                slug: 'draft',
                excerpt: 'WIP',
                content: 'Draft content...',
                wordCount: 300,
                imageCount: 0,
                linkCount: 0,
                headingCount: 1,
                metaDescription: 'A draft article not yet published',
                focusKeyword: 'draft',
                keywordInTitle: true,
                keywordInFirstParagraph: false,
                keywordDensity: 0.5,
                authorId: 'author1',
                categoryId: 'misc',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const draftNode = new PropertyNode(draft);
            draftNode.setRegistry(defaultRegistry);

            expect(await draftNode.getValue(['isPublished'])).toBe(false);
        });

        test('should identify editable status', async () => {
            const statuses = ['draft', 'review', 'scheduled', 'published', 'archived'];
            const expectedEditable = [true, true, false, false, false];

            for (let i = 0; i < statuses.length; i++) {
                const article = createArticle({
                    id: `status-${statuses[i]}`,
                    title: 'Test',
                    slug: `test-${statuses[i]}`,
                    excerpt: 'Test',
                    content: 'Test content',
                    wordCount: 500,
                    imageCount: 1,
                    linkCount: 1,
                    headingCount: 2,
                    metaDescription: 'Test article for status testing purposes here',
                    focusKeyword: 'test',
                    keywordInTitle: true,
                    keywordInFirstParagraph: false,
                    keywordDensity: 1.5,
                    authorId: 'author1',
                    categoryId: 'test',
                    status: statuses[i] as 'draft' | 'review' | 'scheduled' | 'published' | 'archived',
                    viewCount: 0,
                    likeCount: 0,
                    commentCount: 0,
                    shareCount: 0,
                    createdAt: '2026-01-01T10:00:00Z'
                });

                const node = new PropertyNode(article);
                node.setRegistry(defaultRegistry);

                expect(await node.getValue(['isEditable'])).toBe(expectedEditable[i]);
            }
        });
    });

    describe('Quality Score and Publish Readiness', () => {
        test('should calculate quality score as average of structure and SEO', async () => {
            const article = createArticle({
                id: 'quality-test',
                title: 'Quality Test Article',
                slug: 'quality-test',
                excerpt: 'Testing quality',
                content: 'Quality content...',
                wordCount: 1500,  // Structure: 40 (length) + 30 (headings) + 30 (images) = 100
                imageCount: 3,
                linkCount: 5,
                headingCount: 4,
                metaDescription: 'This is a comprehensive meta description for testing quality scores',
                focusKeyword: 'quality',
                keywordInTitle: true,         // SEO: 25
                keywordInFirstParagraph: true, // SEO: 20
                keywordDensity: 2.0,          // SEO: 20
                authorId: 'author1',
                categoryId: 'testing',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });
            // SEO: 25 + 20 + 20 (meta) + 15 (keyword) + 20 (density) = 100
            // Quality = (100 + 100) / 2 = 100

            const node = new PropertyNode(article);
            node.setRegistry(defaultRegistry);

            const quality = await node.getValue(['qualityScore']);
            expect(quality).toBe(100);
        });

        test('should identify publish-ready articles', async () => {
            // Publish ready (quality > 70 AND has meta)
            const ready = createArticle({
                id: 'ready',
                title: 'Ready to Publish',
                slug: 'ready-to-publish',
                excerpt: 'Ready',
                content: 'Content...',
                wordCount: 1200,
                imageCount: 2,
                linkCount: 3,
                headingCount: 3,
                metaDescription: 'This article is ready for publication with a good meta description',
                focusKeyword: 'ready',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 1.8,
                authorId: 'author1',
                categoryId: 'news',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const readyNode = new PropertyNode(ready);
            readyNode.setRegistry(defaultRegistry);
            expect(await readyNode.getValue(['isPublishReady'])).toBe(true);

            // Not ready (low quality)
            const notReady = createArticle({
                id: 'not-ready',
                title: 'Not Ready',
                slug: 'not-ready',
                excerpt: 'WIP',
                content: 'Incomplete...',
                wordCount: 200,
                imageCount: 0,
                linkCount: 0,
                headingCount: 0,
                metaDescription: 'x',  // Too short
                focusKeyword: '',
                keywordInTitle: false,
                keywordInFirstParagraph: false,
                keywordDensity: 0,
                authorId: 'author1',
                categoryId: 'drafts',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            });

            const notReadyNode = new PropertyNode(notReady);
            notReadyNode.setRegistry(defaultRegistry);
            expect(await notReadyNode.getValue(['isPublishReady'])).toBe(false);
        });
    });

    describe('Content Manager', () => {
        beforeEach(() => {
            cms.addArticle(createArticle({
                id: 'article-1',
                title: 'Great Article',
                slug: 'great-article',
                excerpt: 'A great piece',
                content: 'Content...',
                wordCount: 1500,
                imageCount: 3,
                linkCount: 5,
                headingCount: 4,
                metaDescription: 'A comprehensive guide to writing great articles for readers',
                focusKeyword: 'great',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 2.0,
                authorId: 'author1',
                categoryId: 'tutorials',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            }));

            cms.addArticle(createArticle({
                id: 'article-2',
                title: 'Poor Article',
                slug: 'poor-article',
                excerpt: 'Bad',
                content: 'Short...',
                wordCount: 150,
                imageCount: 0,
                linkCount: 0,
                headingCount: 0,
                metaDescription: '',
                focusKeyword: '',
                keywordInTitle: false,
                keywordInFirstParagraph: false,
                keywordDensity: 0,
                authorId: 'author1',
                categoryId: 'misc',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                createdAt: '2026-01-01T10:00:00Z'
            }));

            cms.addArticle(createArticle({
                id: 'article-3',
                title: 'Viral Article',
                slug: 'viral-article',
                excerpt: 'Going viral',
                content: 'Viral content...',
                wordCount: 1000,
                imageCount: 2,
                linkCount: 3,
                headingCount: 3,
                metaDescription: 'An article that went viral and gained massive engagement',
                focusKeyword: 'viral',
                keywordInTitle: true,
                keywordInFirstParagraph: true,
                keywordDensity: 1.5,
                authorId: 'author1',
                categoryId: 'viral',
                status: 'published',
                viewCount: 10000,
                likeCount: 1000,
                commentCount: 500,
                shareCount: 200,
                createdAt: '2026-01-01T10:00:00Z',
                publishedAt: '2026-01-02T10:00:00Z'
            }));
        });

        test('should get article metrics via manager', async () => {
            const metrics = await cms.getArticleMetrics('article-1');

            expect(metrics).not.toBeNull();
            expect(metrics!.readTimeMinutes).toBe(8);  // ceil(1500/200)
            expect(metrics!.isLongForm).toBe(false);   // 1500 is not > 1500
            expect(metrics!.structureScore).toBe(100);
            expect(metrics!.seoScore).toBe(100);
            expect(metrics!.qualityScore).toBe(100);
            expect(metrics!.isPublishReady).toBe(true);
        });

        test('should return null for unknown article', async () => {
            const metrics = await cms.getArticleMetrics('unknown');
            expect(metrics).toBeNull();
        });

        test('should find publish-ready articles', async () => {
            const ready = await cms.getPublishReadyArticles();

            expect(ready).toContain('article-1');
            expect(ready).not.toContain('article-2');  // Low quality
            expect(ready).not.toContain('article-3');  // Already published (not editable)
        });

        test('should find high engagement articles', async () => {
            // Article-3 has rate = (1000 + 500 + 200) / 10000 * 100 = 17%
            const highEngagement = await cms.getHighEngagementArticles(10);

            expect(highEngagement).toContain('article-3');
            expect(highEngagement).not.toContain('article-1');  // No views
            expect(highEngagement).not.toContain('article-2');  // No views
        });
    });
});
