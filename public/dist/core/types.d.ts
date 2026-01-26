/**
 * ============================================================================
 * PRIMITIVE TYPES
 * ============================================================================
 * The foundational types that define the type system.
 * All are Properties - this is what makes the system homoiconic.
 */
import { Property } from './property';
/**
 * TYPE - The type of all types.
 * Self-referential bootstrap: TYPE.type === TYPE
 */
export declare const TYPE: Property;
/**
 * EXPR - The type of all expressions (LIT, REF, OP).
 */
export declare const EXPR: Property;
/**
 * OPERATOR - The type of all operators.
 */
export declare const OPERATOR: Property;
/**
 * CONSTRAINT - The type of all constraints.
 */
export declare const CONSTRAINT: Property;
/**
 * PROPERTY - The type of user-defined properties.
 */
export declare const PROPERTY: Property;
/**
 * LIT - Literal expression type.
 * Represents static values: lit(42), lit('hello'), lit(true)
 */
export declare const LIT: Property;
/**
 * REF - Reference expression type.
 * Points to other properties: ref(['self', 'value']), ref(['parent', 'name'])
 */
export declare const REF: Property;
/**
 * OP - Operator expression type.
 * Combines and transforms: op('add', lit(1), lit(2))
 */
export declare const OP: Property;
//# sourceMappingURL=types.d.ts.map