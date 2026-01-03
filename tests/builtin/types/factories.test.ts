import { describe, it, expect } from 'bun:test';
import {
    tString, tNumber, tBoolean, tNull, tAny,
    tDate, tDateTime, tTime, tDuration, tTimestamp,
    tList, tObject, tRecord, tUnion, tIntersection, tLiteral, tFunction, tEnum
} from '../../../src/builtin/types/factories';
import { STRING, NUMBER, BOOLEAN, NULL, ANY, DATE, DATETIME, TIME, DURATION, TIMESTAMP } from '../../../src/builtin/types/primitives';
import { LIST, OBJECT, RECORD, UNION, INTERSECTION, LITERAL, FUNCTION, ENUM } from '../../../src/builtin/types/structural';

describe('Type Factories', () => {
    describe('Primitive Factories', () => {
        it('tString should create a String type', () => {
            const t = tString();
            expect(t.id).toBe('String');
            expect(t.type).toBe(STRING);
        });

        it('tNumber should create a Number type', () => {
            const t = tNumber();
            expect(t.id).toBe('Number');
            expect(t.type).toBe(NUMBER);
        });

        it('tBoolean should create a Boolean type', () => {
            const t = tBoolean();
            expect(t.id).toBe('Boolean');
            expect(t.type).toBe(BOOLEAN);
        });

        it('tNull should create a Null type', () => {
            const t = tNull();
            expect(t.id).toBe('Null');
            expect(t.type).toBe(NULL);
        });

        it('tAny should create an Any type', () => {
            const t = tAny();
            expect(t.id).toBe('Any');
            expect(t.type).toBe(ANY);
        });
    });

    describe('Temporal Factories', () => {
        it('tDate should create a Date type', () => {
            const t = tDate();
            expect(t.id).toBe('Date');
            expect(t.type).toBe(DATE);
        });

        it('tDateTime should create a DateTime type', () => {
            const t = tDateTime();
            expect(t.id).toBe('DateTime');
            expect(t.type).toBe(DATETIME);
        });

        it('tTime should create a Time type', () => {
            const t = tTime();
            expect(t.id).toBe('Time');
            expect(t.type).toBe(TIME);
        });

        it('tDuration should create a Duration type', () => {
            const t = tDuration();
            expect(t.id).toBe('Duration');
            expect(t.type).toBe(DURATION);
        });

        it('tTimestamp should create a Timestamp type', () => {
            const t = tTimestamp();
            expect(t.id).toBe('Timestamp');
            expect(t.type).toBe(TIMESTAMP);
        });
    });

    describe('Structural Factories', () => {
        it('tList should create a List type with element type', () => {
            const t = tList(tString());
            expect(t.id).toBe('List');
            expect(t.type).toBe(LIST);
            expect(t.children?.element).toBeDefined();
        });

        it('tObject should create an Object type', () => {
            const t = tObject();
            expect(t.id).toBe('Object');
            expect(t.type).toBe(OBJECT);
        });

        it('tObject should accept shape', () => {
            const t = tObject({
                name: tString(),
                age: tNumber()
            });
            expect(t.children?.name).toBeDefined();
            expect(t.children?.age).toBeDefined();
        });

        it('tRecord should create a Record type', () => {
            const t = tRecord(tNumber());
            expect(t.id).toBe('Record');
            expect(t.type).toBe(RECORD);
            expect(t.children?.value).toBeDefined();
        });

        it('tUnion should create a Union type', () => {
            const t = tUnion(tString(), tNumber());
            expect(t.id).toBe('Union');
            expect(t.type).toBe(UNION);
            expect(t.children?.type0).toBeDefined();
            expect(t.children?.type1).toBeDefined();
        });

        it('tIntersection should create an Intersection type', () => {
            const t = tIntersection(tString(), tNumber());
            expect(t.id).toBe('Intersection');
            expect(t.type).toBe(INTERSECTION);
            expect(t.children?.type0).toBeDefined();
            expect(t.children?.type1).toBeDefined();
        });

        it('tLiteral should create a Literal type with value', () => {
            const t = tLiteral('active');
            expect(t.id).toBe('Literal');
            expect(t.type).toBe(LITERAL);
            expect(t.value).toBe('active');
        });

        it('tFunction should create a Function type', () => {
            const t = tFunction([tString(), tNumber()], tBoolean());
            expect(t.id).toBe('Function');
            expect(t.type).toBe(FUNCTION);
            expect(t.children?.param0).toBeDefined();
            expect(t.children?.param1).toBeDefined();
            expect(t.children?.return).toBeDefined();
        });

        it('tEnum should create an Enum type from string array', () => {
            const t = tEnum('Status', ['pending', 'active', 'completed']);
            expect(t.id).toBe('Status');
            expect(t.type).toBe(ENUM);
            expect(t.children?.pending).toBeDefined();
            expect(t.children?.active).toBeDefined();
            expect(t.children?.completed).toBeDefined();
            expect(t.children?.pending?.value).toBe('pending');
            expect(t.children?.active?.value).toBe('active');
            expect(t.children?.completed?.value).toBe('completed');
            expect(t.children?.pending?.type).toBe(STRING);
        });

        it('tEnum should create an Enum type from object with number values', () => {
            const t = tEnum('Priority', { LOW: 1, MEDIUM: 2, HIGH: 3 });
            expect(t.id).toBe('Priority');
            expect(t.type).toBe(ENUM);
            expect(t.children?.LOW).toBeDefined();
            expect(t.children?.MEDIUM).toBeDefined();
            expect(t.children?.HIGH).toBeDefined();
            expect(t.children?.LOW?.value).toBe(1);
            expect(t.children?.MEDIUM?.value).toBe(2);
            expect(t.children?.HIGH?.value).toBe(3);
            expect(t.children?.LOW?.type).toBe(NUMBER);
        });

        it('tEnum should create an Enum type from object with mixed values', () => {
            const t = tEnum('Config', { DEBUG: true, VERSION: '1.0', MAX_RETRIES: 5 });
            expect(t.id).toBe('Config');
            expect(t.type).toBe(ENUM);
            expect(t.children?.DEBUG?.value).toBe(true);
            expect(t.children?.DEBUG?.type).toBe(BOOLEAN);
            expect(t.children?.VERSION?.value).toBe('1.0');
            expect(t.children?.VERSION?.type).toBe(STRING);
            expect(t.children?.MAX_RETRIES?.value).toBe(5);
            expect(t.children?.MAX_RETRIES?.type).toBe(NUMBER);
        });
    });
});

