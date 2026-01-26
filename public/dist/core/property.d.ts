/**
 * ============================================================================
 * PROPERTY INTERFACE
 * ============================================================================
 * The ONE data structure. Everything is a Property.
 * Types, expressions, operators, constraints, metadata - all Properties.
 *
 * This is the foundation of the homoiconic system.
 */
export interface Property {
    /** Unique identifier */
    readonly id: string;
    /** Type of this property (itself a Property) */
    readonly type: Property;
    /** Value (static or expression) */
    value?: unknown;
    /** Default value */
    defaultValue?: unknown;
    /** Metadata - descriptive attributes (all Properties) */
    metadata?: Record<string, Property>;
    /** Constraints - validation rules (all Properties) */
    constraints?: Record<string, Property>;
    /** Children - structural composition (all Properties) */
    children?: Record<string, Property>;
}
//# sourceMappingURL=property.d.ts.map