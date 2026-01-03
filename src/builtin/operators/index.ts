// ============================================================================
// OPERATORS - Re-exports
// ============================================================================

// Registry must be imported first to initialize
export { defaultRegistry, reg } from './registry';

// Import all operator modules to register them
import './arithmetic';
import './comparison';
import './logic';
import './string';
import './typecheck';
import './validation';
import './array';
import './date';
import './object';
import './conversion';
import './file';

