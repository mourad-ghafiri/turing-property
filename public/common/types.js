// ============================================================================
// TYPES - All type definitions (All is Property)
// ============================================================================
// Types are Properties with type: TYPE. Following "All is Property" principle.

import { TYPE } from '.././dist/index.js';

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

export const STRING = { id: 'String', type: TYPE };
export const NUMBER = { id: 'Number', type: TYPE };
export const BOOLEAN = { id: 'Boolean', type: TYPE };
export const ARRAY = { id: 'Array', type: TYPE };

// ============================================================================
// UI ELEMENT TYPES
// ============================================================================

export const ELEMENT = { id: 'Element', type: TYPE };
export const APP = { id: 'App', type: TYPE };
export const HEADER = { id: 'Header', type: ELEMENT };
export const BRANDING = { id: 'Branding', type: ELEMENT };
export const NAV = { id: 'Nav', type: ELEMENT };
export const MAIN = { id: 'Main', type: ELEMENT };
export const FOOTER = { id: 'Footer', type: ELEMENT };
export const PANEL = { id: 'Panel', type: ELEMENT };
export const OVERLAY = { id: 'Overlay', type: ELEMENT };
export const BUTTON = { id: 'Button', type: ELEMENT };
export const CODE = { id: 'Code', type: ELEMENT };

// ============================================================================
// WIZARD TYPES
// ============================================================================

export const WIZARD = { id: 'Wizard', type: ELEMENT };
export const STEP = { id: 'Step', type: ELEMENT };
export const SUBSTEP = { id: 'Substep', type: ELEMENT };
export const SECTION = { id: 'Section', type: ELEMENT };
export const FIELD = { id: 'Field', type: ELEMENT };

// ============================================================================
// I18N & THEME TYPES
// ============================================================================

export const I18N = { id: 'I18n', type: TYPE };
export const LOCALE = { id: 'Locale', type: I18N };
export const THEME = { id: 'Theme', type: TYPE };
export const THEME_CONFIG = { id: 'ThemeConfig', type: THEME };

// ============================================================================
// ACTION TYPE (for operator returns)
// ============================================================================

export const ACTION = { id: 'Action', type: TYPE };
