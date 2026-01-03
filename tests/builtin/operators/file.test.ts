import { describe, it, expect } from 'bun:test';
import { evaluate, EvaluationContext } from '../../../src/core/evaluate';
import { lit, op } from '../../../src/builtin/expressions';
import { defaultRegistry } from '../../../src/builtin/operators';

const createCtx = (): EvaluationContext => ({
    current: { id: 'test', type: { id: 'Type', type: null as any } },
    root: { id: 'test', type: { id: 'Type', type: null as any } },
    registry: defaultRegistry
});

// Mock file object similar to browser File
const mockFile = (name: string, type: string, size: number) => ({
    name,
    type,
    size
});

describe('File Operators', () => {
    describe('fileSize', () => {
        it('should return file size', async () => {
            const file = mockFile('test.txt', 'text/plain', 1024);
            expect(await evaluate(op('fileSize', lit(file)), createCtx())).toBe(1024);
        });

        it('should return 0 for non-file', async () => {
            expect(await evaluate(op('fileSize', lit('not a file')), createCtx())).toBe(0);
        });
    });

    describe('fileName', () => {
        it('should return file name', async () => {
            const file = mockFile('document.pdf', 'application/pdf', 1024);
            expect(await evaluate(op('fileName', lit(file)), createCtx())).toBe('document.pdf');
        });

        it('should return empty string for non-file', async () => {
            expect(await evaluate(op('fileName', lit('not a file')), createCtx())).toBe('');
        });
    });

    describe('fileExt', () => {
        it('should return file extension from file object', async () => {
            const file = mockFile('image.png', 'image/png', 2048);
            expect(await evaluate(op('fileExt', lit(file)), createCtx())).toBe('png');
        });

        it('should return file extension from string', async () => {
            expect(await evaluate(op('fileExt', lit('document.pdf')), createCtx())).toBe('pdf');
        });

        it('should return empty string for no extension', async () => {
            expect(await evaluate(op('fileExt', lit('noext')), createCtx())).toBe('');
        });
    });

    describe('fileType', () => {
        it('should return file MIME type', async () => {
            const file = mockFile('image.png', 'image/png', 2048);
            expect(await evaluate(op('fileType', lit(file)), createCtx())).toBe('image/png');
        });

        it('should return empty string for non-file', async () => {
            expect(await evaluate(op('fileType', lit('not a file')), createCtx())).toBe('');
        });
    });

    describe('isImage', () => {
        it('should return true for image files', async () => {
            const jpeg = mockFile('photo.jpg', 'image/jpeg', 2048);
            const png = mockFile('icon.png', 'image/png', 1024);
            expect(await evaluate(op('isImage', lit(jpeg)), createCtx())).toBe(true);
            expect(await evaluate(op('isImage', lit(png)), createCtx())).toBe(true);
        });

        it('should return false for non-image files', async () => {
            const pdf = mockFile('doc.pdf', 'application/pdf', 1024);
            expect(await evaluate(op('isImage', lit(pdf)), createCtx())).toBe(false);
        });
    });

    describe('isPdf', () => {
        it('should return true for PDF files', async () => {
            const pdf = mockFile('document.pdf', 'application/pdf', 1024);
            expect(await evaluate(op('isPdf', lit(pdf)), createCtx())).toBe(true);
        });

        it('should return false for non-PDF files', async () => {
            const txt = mockFile('doc.txt', 'text/plain', 1024);
            expect(await evaluate(op('isPdf', lit(txt)), createCtx())).toBe(false);
        });
    });

    describe('isVideo', () => {
        it('should return true for video files', async () => {
            const mp4 = mockFile('video.mp4', 'video/mp4', 10240);
            expect(await evaluate(op('isVideo', lit(mp4)), createCtx())).toBe(true);
        });

        it('should return false for non-video files', async () => {
            const mp3 = mockFile('audio.mp3', 'audio/mpeg', 1024);
            expect(await evaluate(op('isVideo', lit(mp3)), createCtx())).toBe(false);
        });
    });

    describe('isAudio', () => {
        it('should return true for audio files', async () => {
            const mp3 = mockFile('song.mp3', 'audio/mpeg', 4096);
            expect(await evaluate(op('isAudio', lit(mp3)), createCtx())).toBe(true);
        });

        it('should return false for non-audio files', async () => {
            const mp4 = mockFile('video.mp4', 'video/mp4', 10240);
            expect(await evaluate(op('isAudio', lit(mp4)), createCtx())).toBe(false);
        });
    });

    describe('isDocument', () => {
        it('should return true for PDF', async () => {
            const pdf = mockFile('doc.pdf', 'application/pdf', 1024);
            expect(await evaluate(op('isDocument', lit(pdf)), createCtx())).toBe(true);
        });

        it('should return true for Word documents', async () => {
            const doc = mockFile('doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024);
            expect(await evaluate(op('isDocument', lit(doc)), createCtx())).toBe(true);
        });

        it('should return false for images', async () => {
            const img = mockFile('photo.jpg', 'image/jpeg', 1024);
            expect(await evaluate(op('isDocument', lit(img)), createCtx())).toBe(false);
        });
    });

    describe('isFileType', () => {
        it('should return true when file type matches', async () => {
            const pdf = mockFile('doc.pdf', 'application/pdf', 1024);
            expect(await evaluate(op('isFileType', lit(pdf), lit(['pdf', 'application'])), createCtx())).toBe(true);
        });

        it('should return false when file type does not match', async () => {
            const img = mockFile('photo.jpg', 'image/jpeg', 1024);
            expect(await evaluate(op('isFileType', lit(img), lit(['pdf', 'word'])), createCtx())).toBe(false);
        });
    });
});

