// ============================================================================
// EXPRESSION FACTORIES
// ============================================================================
// Factories for creating expression Properties.

import { Property } from '../../core';
import { LIT, REF, OP } from '../types';

/** Create a literal expression */
export const lit = (value: unknown): Property => ({
    id: 'lit',
    type: LIT,
    value
});

/** Create a reference expression */
export const ref = (path: string[]): Property => ({
    id: 'ref',
    type: REF,
    value: path
});

/** Create an operator call expression */
export const op = (name: string, ...args: Property[]): Property => ({
    id: name,
    type: OP,
    children: args.reduce((acc, arg, i) => ({ ...acc, [`arg${i}`]: arg }), {} as Record<string, Property>)
});

