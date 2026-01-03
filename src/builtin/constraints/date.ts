// ============================================================================
// DATE CONSTRAINTS
// ============================================================================

import { Property } from '../../core';
import { CONSTRAINT, STRING } from '../types';
import { lit, op, ref } from '../expressions';

/** Date is in the future */
export const FUTURE_DATE: Property = {
    id: 'futureDate',
    type: CONSTRAINT,
    value: op('isFuture', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a future date' }
    }
};

/** Date is in the past */
export const PAST_DATE: Property = {
    id: 'pastDate',
    type: CONSTRAINT,
    value: op('isPast', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a past date' }
    }
};

/** Date is today */
export const TODAY: Property = {
    id: 'today',
    type: CONSTRAINT,
    value: op('isToday', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be today' }
    }
};

/** Date after specified date */
export const AFTER_DATE = (date: string): Property => ({
    id: 'afterDate',
    type: CONSTRAINT,
    value: op('isAfter', ref(['self', 'value']), lit(date)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be after ${date}` }
    }
});

/** Date before specified date */
export const BEFORE_DATE = (date: string): Property => ({
    id: 'beforeDate',
    type: CONSTRAINT,
    value: op('isBefore', ref(['self', 'value']), lit(date)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be before ${date}` }
    }
});

/** Minimum age in years */
export const MIN_AGE = (years: number): Property => ({
    id: 'minAge',
    type: CONSTRAINT,
    value: op('gte', op('age', ref(['self', 'value'])), lit(years)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at least ${years} years old` }
    }
});

/** Maximum age in years */
export const MAX_AGE = (years: number): Property => ({
    id: 'maxAge',
    type: CONSTRAINT,
    value: op('lte', op('age', ref(['self', 'value'])), lit(years)),
    metadata: {
        message: { id: 'message', type: STRING, value: `Must be at most ${years} years old` }
    }
});

/** Date is on a weekday */
export const WEEKDAY: Property = {
    id: 'weekday',
    type: CONSTRAINT,
    value: op('isWeekday', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a weekday' }
    }
};

/** Date is on a weekend */
export const WEEKEND: Property = {
    id: 'weekend',
    type: CONSTRAINT,
    value: op('isWeekend', ref(['self', 'value'])),
    metadata: {
        message: { id: 'message', type: STRING, value: 'Must be a weekend' }
    }
};

