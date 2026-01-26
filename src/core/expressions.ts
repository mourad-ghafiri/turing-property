/**
 * ============================================================================
 * EXPRESSION FACTORIES
 * ============================================================================
 * The three building blocks for dynamic behavior.
 * All expressions are Properties - no special structures.
 */

import { Property } from './property';
import { LIT, REF, OP } from './types';

/**
 * Create a literal expression.
 *
 * @example
 * lit(42)           // number
 * lit('hello')      // string
 * lit(true)         // boolean
 * lit([1, 2, 3])    // array
 * lit({ a: 1 })     // object
 */
export const lit = (value: unknown): Property => ({
    id: 'lit',
    type: LIT,
    value,
});

/**
 * Create a reference expression.
 * References point to other properties in the tree.
 *
 * Path segments:
 * - 'self'        - Current property
 * - 'parent'      - Parent property
 * - 'root'        - Root of the tree
 * - 'children'    - Children collection
 * - 'metadata'    - Metadata collection
 * - 'constraints' - Constraints collection
 * - 'value'       - The value field
 * - 'type'        - The type field
 *
 * @example
 * ref('self.value')                         // Dot notation
 * ref('parent.name.value')                  // Dot notation
 * ref(['self', 'value'])                    // Array notation
 * ref(['parent', 'name', 'value'])          // Array notation
 * ref(['root', 'metadata', 'config'])       // Array notation
 */
export const ref = (path: string | string[]): Property => ({
    id: 'ref',
    type: REF,
    value: typeof path === 'string' ? path.split('.') : path,
});

/**
 * Create an operator expression.
 * Operators combine and transform values.
 *
 * @example
 * op('add', lit(1), lit(2))                           // 1 + 2 = 3
 * op('concat', lit('Hello, '), ref(['name']))         // String concat
 * op('if', condition, thenExpr, elseExpr)             // Conditional
 */
export const op = (name: string, ...args: Property[]): Property => ({
    id: name,
    type: OP,
    children: args.reduce(
        (acc, arg, i) => ({ ...acc, [`arg${i}`]: arg }),
        {} as Record<string, Property>
    ),
});
