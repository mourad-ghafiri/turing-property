// ============================================================================
// METADATA - Reusable metadata Property definitions (All is Property)
// ============================================================================
// Metadata are Properties that describe other Properties.
// These are reusable building blocks for UI configuration.

import { STRING, NUMBER, BOOLEAN } from './types.js';

// ============================================================================
// INPUT TYPE METADATA
// ============================================================================

export const INPUT_TEXT = { inputType: { id: 'inputType', type: STRING, value: 'text' } };
export const INPUT_EMAIL = { inputType: { id: 'inputType', type: STRING, value: 'email' } };
export const INPUT_TEL = { inputType: { id: 'inputType', type: STRING, value: 'tel' } };
export const INPUT_URL = { inputType: { id: 'inputType', type: STRING, value: 'url' } };
export const INPUT_PASSWORD = { inputType: { id: 'inputType', type: STRING, value: 'password' } };
export const INPUT_NUMBER = { inputType: { id: 'inputType', type: STRING, value: 'number' } };
export const INPUT_RANGE = { inputType: { id: 'inputType', type: STRING, value: 'range' } };
export const INPUT_DATE = { inputType: { id: 'inputType', type: STRING, value: 'date' } };
export const INPUT_TIME = { inputType: { id: 'inputType', type: STRING, value: 'time' } };
export const INPUT_DATETIME = { inputType: { id: 'inputType', type: STRING, value: 'datetime-local' } };
export const INPUT_TEXTAREA = { inputType: { id: 'inputType', type: STRING, value: 'textarea' } };
export const INPUT_SELECT = { inputType: { id: 'inputType', type: STRING, value: 'select' } };
export const INPUT_RADIO = { inputType: { id: 'inputType', type: STRING, value: 'radio' } };
export const INPUT_CHECKBOX = { inputType: { id: 'inputType', type: STRING, value: 'checkbox' } };
export const INPUT_TOGGLE = { inputType: { id: 'inputType', type: STRING, value: 'toggle' } };
export const INPUT_FILE = { inputType: { id: 'inputType', type: STRING, value: 'file' } };
export const INPUT_COLOR = { inputType: { id: 'inputType', type: STRING, value: 'color' } };
export const INPUT_RATING = { inputType: { id: 'inputType', type: STRING, value: 'rating' } };
export const INPUT_TAGS = { inputType: { id: 'inputType', type: STRING, value: 'tags' } };
export const INPUT_MULTISELECT = { inputType: { id: 'inputType', type: STRING, value: 'multiselect' } };
export const INPUT_COMPUTED = { inputType: { id: 'inputType', type: STRING, value: 'computed' } };
export const INPUT_HIDDEN = { inputType: { id: 'inputType', type: STRING, value: 'hidden' } };
export const INPUT_SUBSTEP = { inputType: { id: 'inputType', type: STRING, value: 'substep' } };
export const INPUT_SECTION = { inputType: { id: 'inputType', type: STRING, value: 'section' } };

// ============================================================================
// BOOLEAN METADATA FLAGS
// ============================================================================

export const REQUIRED_TRUE = { required: { id: 'required', type: BOOLEAN, value: true } };
export const REQUIRED_FALSE = { required: { id: 'required', type: BOOLEAN, value: false } };
export const COLLAPSIBLE_TRUE = { collapsible: { id: 'collapsible', type: BOOLEAN, value: true } };
export const COLLAPSIBLE_FALSE = { collapsible: { id: 'collapsible', type: BOOLEAN, value: false } };
export const DEFAULT_EXPANDED_TRUE = { defaultExpanded: { id: 'defaultExpanded', type: BOOLEAN, value: true } };
export const DEFAULT_EXPANDED_FALSE = { defaultExpanded: { id: 'defaultExpanded', type: BOOLEAN, value: false } };
export const HAS_SUBSTEPS_TRUE = { hasSubSteps: { id: 'hasSubSteps', type: BOOLEAN, value: true } };
export const HAS_SUBSTEPS_FALSE = { hasSubSteps: { id: 'hasSubSteps', type: BOOLEAN, value: false } };
export const MULTIPLE_TRUE = { multiple: { id: 'multiple', type: BOOLEAN, value: true } };
export const MULTIPLE_FALSE = { multiple: { id: 'multiple', type: BOOLEAN, value: false } };

// ============================================================================
// ICON METADATA
// ============================================================================

export const ICON_WARNING = { errorIcon: { id: 'errorIcon', type: STRING, value: '!' } };
export const ICON_CHECK = { icon: { id: 'icon', type: STRING, value: 'check' } };
export const ICON_CLOSE = { icon: { id: 'icon', type: STRING, value: 'close' } };

// ============================================================================
// FILE INPUT METADATA
// ============================================================================

export const ACCEPT_IMAGES = { accept: { id: 'accept', type: STRING, value: 'image/*' } };
export const ACCEPT_PDF = { accept: { id: 'accept', type: STRING, value: '.pdf' } };
export const ACCEPT_IMAGES_PDF = { accept: { id: 'accept', type: STRING, value: 'image/*,.pdf' } };
export const MAX_SIZE_5MB = { maxSize: { id: 'maxSize', type: NUMBER, value: 5242880 } };
export const MAX_SIZE_10MB = { maxSize: { id: 'maxSize', type: NUMBER, value: 10485760 } };

// ============================================================================
// MULTISELECT STYLING METADATA
// ============================================================================

export const MULTISELECT_SELECTED_LABEL = { selectedLabelClass: { id: 'selectedLabelClass', type: STRING, value: 'border-blue-500' } };
export const MULTISELECT_UNSELECTED_LABEL = { unselectedLabelClass: { id: 'unselectedLabelClass', type: STRING, value: 'border-transparent' } };
export const MULTISELECT_SELECTED_BOX = { selectedBoxClass: { id: 'selectedBoxClass', type: STRING, value: 'bg-blue-500 border-blue-500' } };
export const MULTISELECT_UNSELECTED_BOX = { unselectedBoxClass: { id: 'unselectedBoxClass', type: STRING, value: 'border-gray-500' } };
export const MULTISELECT_CHECK_ICON = { checkIcon: { id: 'checkIcon', type: STRING, value: '<svg class="w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' } };
