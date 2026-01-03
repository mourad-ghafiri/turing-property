import { describe, it, expect } from 'bun:test';
import { Property } from '../../../src/core/property';
import { EvaluationContext } from '../../../src/core/evaluate';
import { checkConstraints } from '../../../src/builtin/constraints/check';
import { MAX_FILE_SIZE, IS_IMAGE, IS_PDF } from '../../../src/builtin/constraints/file';
import { STRING } from '../../../src/builtin/types';
import { defaultRegistry } from '../../../src/builtin/operators';

const createProp = (value: unknown, constraints: Record<string, Property>): Property => ({
    id: 'test',
    type: STRING,
    value,
    constraints
});

const createCtx = (prop: Property): EvaluationContext => ({
    current: prop,
    root: prop,
    registry: defaultRegistry
});

const check = async (value: unknown, constraint: Property): Promise<boolean> => {
    const prop = createProp(value, { test: constraint });
    const errors = await checkConstraints(prop, createCtx(prop));
    return Object.keys(errors).length === 0;
};

// Mock file object
const mockFile = (name: string, type: string, size: number) => ({
    name,
    type,
    size
});

describe('File Constraints', () => {
    describe('MAX_FILE_SIZE', () => {
        it('should pass when file size <= max', async () => {
            const file = mockFile('doc.txt', 'text/plain', 1024);
            expect(await check(file, MAX_FILE_SIZE(2048))).toBe(true);
        });

        it('should fail when file size > max', async () => {
            const file = mockFile('large.zip', 'application/zip', 5000000);
            expect(await check(file, MAX_FILE_SIZE(1000000))).toBe(false);
        });

        it('should pass for null (optional)', async () => {
            expect(await check(null, MAX_FILE_SIZE(1024))).toBe(true);
        });
    });

    describe('IS_IMAGE', () => {
        it('should pass for image files', async () => {
            const jpeg = mockFile('photo.jpg', 'image/jpeg', 1024);
            const png = mockFile('icon.png', 'image/png', 512);
            expect(await check(jpeg, IS_IMAGE)).toBe(true);
            expect(await check(png, IS_IMAGE)).toBe(true);
        });

        it('should fail for non-image files', async () => {
            const pdf = mockFile('doc.pdf', 'application/pdf', 1024);
            expect(await check(pdf, IS_IMAGE)).toBe(false);
        });

        it('should pass for null (optional)', async () => {
            expect(await check(null, IS_IMAGE)).toBe(true);
        });
    });

    describe('IS_PDF', () => {
        it('should pass for PDF files', async () => {
            const pdf = mockFile('document.pdf', 'application/pdf', 1024);
            expect(await check(pdf, IS_PDF)).toBe(true);
        });

        it('should fail for non-PDF files', async () => {
            const txt = mockFile('doc.txt', 'text/plain', 1024);
            expect(await check(txt, IS_PDF)).toBe(false);
        });

        it('should pass for null (optional)', async () => {
            expect(await check(null, IS_PDF)).toBe(true);
        });
    });
});

