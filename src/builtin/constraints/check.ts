// ============================================================================
// CONSTRAINT CHECKING
// ============================================================================

import { Property, EvaluationContext, evaluate } from '../../core';

/**
 * Check all constraints on a property.
 * Returns an object with constraint ids as keys and error messages as values.
 * Empty object means all constraints passed.
 */
export const checkConstraints = async (
    prop: Property,
    ctx: EvaluationContext
): Promise<Record<string, string>> => {
    const errors: Record<string, string> = {};
    const constraints = prop.constraints ?? {};

    for (const [name, constraint] of Object.entries(constraints)) {
        try {
            const constraintCtx: EvaluationContext = {
                ...ctx,
                current: prop,
                root: ctx.root
            };

            // The constraint's value is the expression to evaluate
            // It should be a Property (an expression like op, ref, lit)
            const exprToEvaluate = constraint.value as Property | undefined;
            
            if (!exprToEvaluate) {
                // No expression to evaluate, treat as always valid
                continue;
            }

            const result = await evaluate(exprToEvaluate, constraintCtx);

            if (result !== true) {
                let message: string;
                if (typeof result === 'string') {
                    message = result;
                } else if (constraint.metadata?.message) {
                    const msgResult = await evaluate(constraint.metadata.message, constraintCtx);
                    message = String(msgResult);
                } else {
                    message = `${name} constraint failed`;
                }
                errors[name] = message;
            }
        } catch (err) {
            errors[name] = `Constraint error: ${err instanceof Error ? err.message : String(err)}`;
        }
    }

    return errors;
};

/**
 * Check constraints for a property and all its children recursively.
 */
export const checkConstraintsDeep = async (
    prop: Property,
    ctx: EvaluationContext,
    path: string[] = []
): Promise<{ valid: boolean; errors: Record<string, string> }> => {
    const allErrors: Record<string, string> = {};

    const selfErrors = await checkConstraints(prop, ctx);
    for (const [name, message] of Object.entries(selfErrors)) {
        const fullPath = path.length > 0 ? `${path.join('.')}.${name}` : name;
        allErrors[fullPath] = message;
    }

    const children = prop.children ?? {};
    for (const [key, child] of Object.entries(children)) {
        const childResult = await checkConstraintsDeep(
            child,
            { ...ctx, current: child },
            [...path, key]
        );
        Object.assign(allErrors, childResult.errors);
    }

    return { valid: Object.keys(allErrors).length === 0, errors: allErrors };
};

