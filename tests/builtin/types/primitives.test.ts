import { describe, it, expect } from 'bun:test';
import { TYPE } from '../../../src/builtin/types/meta';
import {
    STRING, NUMBER, BOOLEAN, NULL, ANY,
    DATE, DATETIME, TIME, DURATION, TIMESTAMP
} from '../../../src/builtin/types/primitives';

describe('Primitive Types', () => {
    describe('STRING', () => {
        it('should have TYPE as its type', () => {
            expect(STRING.type).toBe(TYPE);
        });

        it('should have id "String"', () => {
            expect(STRING.id).toBe('String');
        });
    });

    describe('NUMBER', () => {
        it('should have TYPE as its type', () => {
            expect(NUMBER.type).toBe(TYPE);
        });

        it('should have id "Number"', () => {
            expect(NUMBER.id).toBe('Number');
        });
    });

    describe('BOOLEAN', () => {
        it('should have TYPE as its type', () => {
            expect(BOOLEAN.type).toBe(TYPE);
        });

        it('should have id "Boolean"', () => {
            expect(BOOLEAN.id).toBe('Boolean');
        });
    });

    describe('NULL', () => {
        it('should have TYPE as its type', () => {
            expect(NULL.type).toBe(TYPE);
        });

        it('should have id "Null"', () => {
            expect(NULL.id).toBe('Null');
        });
    });

    describe('ANY', () => {
        it('should have TYPE as its type', () => {
            expect(ANY.type).toBe(TYPE);
        });

        it('should have id "Any"', () => {
            expect(ANY.id).toBe('Any');
        });
    });

    // Temporal Types
    describe('DATE', () => {
        it('should have TYPE as its type', () => {
            expect(DATE.type).toBe(TYPE);
        });

        it('should have id "Date"', () => {
            expect(DATE.id).toBe('Date');
        });

        it('should have format metadata', () => {
            expect(DATE.metadata?.format?.value).toBe('YYYY-MM-DD');
        });
    });

    describe('DATETIME', () => {
        it('should have TYPE as its type', () => {
            expect(DATETIME.type).toBe(TYPE);
        });

        it('should have id "DateTime"', () => {
            expect(DATETIME.id).toBe('DateTime');
        });

        it('should have ISO 8601 format metadata', () => {
            expect(DATETIME.metadata?.format?.value).toBe('YYYY-MM-DDTHH:mm:ss.sssZ');
        });
    });

    describe('TIME', () => {
        it('should have TYPE as its type', () => {
            expect(TIME.type).toBe(TYPE);
        });

        it('should have id "Time"', () => {
            expect(TIME.id).toBe('Time');
        });

        it('should have format metadata', () => {
            expect(TIME.metadata?.format?.value).toBe('HH:mm:ss');
        });
    });

    describe('DURATION', () => {
        it('should have TYPE as its type', () => {
            expect(DURATION.type).toBe(TYPE);
        });

        it('should have id "Duration"', () => {
            expect(DURATION.id).toBe('Duration');
        });

        it('should have ISO 8601 duration format metadata', () => {
            expect(DURATION.metadata?.format?.value).toBe('P[n]Y[n]M[n]DT[n]H[n]M[n]S');
        });
    });

    describe('TIMESTAMP', () => {
        it('should have TYPE as its type', () => {
            expect(TIMESTAMP.type).toBe(TYPE);
        });

        it('should have id "Timestamp"', () => {
            expect(TIMESTAMP.id).toBe('Timestamp');
        });

        it('should have description metadata', () => {
            expect(TIMESTAMP.metadata?.description?.value).toBe('Unix timestamp in milliseconds');
        });
    });
});

