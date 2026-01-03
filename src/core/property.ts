// ============================================================================
// PROPERTY - THE UNIVERSAL DATA STRUCTURE
// ============================================================================
// Everything in this system is a Property. Types, Expressions, Operators,
// Constraints, and user data are all represented as Properties.

/**
 * The Property interface - the only data structure in the system.
 * Everything is a Property: types, expressions, operators, constraints, and user data.
 */
export interface Property {
    /** Unique identifier for this property */
    id: string;
    
    /** Type of this property (also a Property) */
    type: Property;
    
    /** Value of this property (can be any value or a Property expression) */
    value?: unknown;
    
    /** Default value (can be any value or a Property expression, evaluated like value) */
    defaultValue?: unknown;
    
    /** Metadata properties (labels, placeholders, visibility, etc.) */
    metadata?: Record<string, Property>;
    
    /** Constraint properties (validation rules) */
    constraints?: Record<string, Property>;
    
    /** Child properties */
    children?: Record<string, Property>;
}
