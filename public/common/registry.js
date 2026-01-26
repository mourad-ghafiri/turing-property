// ============================================================================
// REGISTRY - Operator registration (All is Property)
// ============================================================================
// Turing Property has NO built-in operators. We register everything we need.
// Following best practices from documentation.

import { createRegistry, evalArg, evalArgs } from '.././dist/index.js';
import { STRING, NUMBER, BOOLEAN, ACTION } from './types.js';

// Create the application registry
export const registry = createRegistry();

// Single application PropertyNode - ONE tree (All is Property)
let appRoot = null;

export const setAppRoot = (root) => { appRoot = root; };
export const getAppRoot = () => appRoot;

// ============================================================================
// HELPER: Create an action Property (for operator returns)
// ============================================================================

const action = (actionId, metadata = {}) => ({
    id: actionId,
    type: ACTION,
    value: actionId,
    metadata: Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [
            k,
            { id: k, type: typeof v === 'number' ? NUMBER : typeof v === 'boolean' ? BOOLEAN : STRING, value: v }
        ])
    )
});

// ============================================================================
// ARITHMETIC OPERATORS
// ============================================================================

registry.register('add', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a ?? 0) + (b ?? 0);
});

registry.register('sub', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a ?? 0) - (b ?? 0);
});

registry.register('mul', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return (a ?? 0) * (b ?? 0);
});

registry.register('div', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return b !== 0 ? (a ?? 0) / b : 0;
});

// ============================================================================
// COMPARISON OPERATORS
// ============================================================================

registry.register('eq', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a === b;
});

registry.register('neq', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a !== b;
});

registry.register('lt', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a < b;
});

registry.register('lte', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a <= b;
});

registry.register('gt', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a > b;
});

registry.register('gte', async (args, ctx) => {
    const [a, b] = await evalArgs(args, ctx);
    return a >= b;
});

// ============================================================================
// LOGIC OPERATORS
// ============================================================================

registry.register('and', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.every(Boolean);
});

registry.register('or', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.some(Boolean);
});

registry.register('not', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return !value;
});

// ============================================================================
// CONDITIONAL OPERATORS
// ============================================================================

registry.register('if', async (args, ctx) => {
    const condition = await evalArg(args[0], ctx);
    if (condition) {
        return args[1] ? await evalArg(args[1], ctx) : null;
    }
    return args[2] ? await evalArg(args[2], ctx) : null;
});

// ============================================================================
// STRING OPERATORS
// ============================================================================

registry.register('concat', async (args, ctx) => {
    const values = await evalArgs(args, ctx);
    return values.map(v => v ?? '').join('');
});

registry.register('toString', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return String(value ?? '');
});

registry.register('strlen', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' ? value.length : 0;
});

registry.register('includes', async (args, ctx) => {
    const [str, search] = await evalArgs(args, ctx);
    return typeof str === 'string' && typeof search === 'string' && str.includes(search);
});

registry.register('upper', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' ? value.toUpperCase() : '';
});

registry.register('lower', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' ? value.toLowerCase() : '';
});

registry.register('trim', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' ? value.trim() : '';
});

// ============================================================================
// VALIDATION OPERATORS
// ============================================================================

registry.register('isNotNull', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return value !== null && value !== undefined;
});

registry.register('isNotBlank', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' && value.trim().length > 0;
});

registry.register('isEmail', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

registry.register('isPhone', async (args, ctx) => {
    const value = await evalArg(args[0], ctx);
    return typeof value === 'string' && /^[\d\s\-+()]{10,}$/.test(value);
});

// ============================================================================
// I18N OPERATOR
// ============================================================================

registry.register('t', async (args, ctx) => {
    const key = await evalArg(args[0], ctx);
    if (!key) return '';
    if (!appRoot) return key;

    const currentLocale = await appRoot.getValue(['i18n', 'currentLocale']) || 'en';
    const keyParts = key.split('.');
    const translationPath = ['i18n', 'locales', currentLocale, ...keyParts];
    const translation = await appRoot.getValue(translationPath);

    if (translation === undefined && currentLocale !== 'en') {
        const fallbackPath = ['i18n', 'locales', 'en', ...keyParts];
        const fallback = await appRoot.getValue(fallbackPath);
        return fallback !== undefined ? fallback : key;
    }

    return translation !== undefined ? translation : key;
});

// ============================================================================
// THEME OPERATOR
// ============================================================================

registry.register('theme', async (args, ctx) => {
    const key = await evalArg(args[0], ctx);
    if (!key) return '';
    if (!appRoot) return '';

    const currentTheme = await appRoot.getValue(['theme', 'current']) || 'dark';
    const keyParts = key.split('.');
    const themePath = ['theme', 'configs', currentTheme, ...keyParts];
    const value = await appRoot.getValue(themePath);
    return value !== undefined ? value : '';
});

// ============================================================================
// UI NAVIGATION OPERATORS
// ============================================================================

// Helper: Check if a step is visible (not conditionally hidden)
const isStepVisible = async (stepNum) => {
    if (!appRoot) return true;
    const wizardNode = appRoot.child('wizard');
    if (!wizardNode) return true;
    const stepNode = wizardNode.child(`step${stepNum}`);
    if (!stepNode) return true;
    const visible = await stepNode.getMetadata('visible');
    return visible !== false; // visible if undefined or true
};

// Helper: Find next visible step
const findNextVisibleStep = async (fromStep, totalSteps) => {
    for (let s = fromStep + 1; s <= totalSteps; s++) {
        if (await isStepVisible(s)) return s;
    }
    return null; // No more visible steps
};

// Helper: Find previous visible step
const findPrevVisibleStep = async (fromStep) => {
    for (let s = fromStep - 1; s >= 1; s--) {
        if (await isStepVisible(s)) return s;
    }
    return null; // No previous visible steps
};

registry.register('ui.goToStep', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });
    const step = typeof args[0] === 'object' ? args[0].value : args[0];
    const highestVisited = await appRoot.getValue(['wizard', 'highestVisitedStep']);

    // Check if step is visible
    if (!(await isStepVisible(step))) {
        return action('blocked', { reason: 'Step not visible' });
    }

    if (step <= highestVisited) {
        await appRoot.setValue(step, { path: ['wizard', 'currentStep'] });
        return action('navigated', { step });
    }
    return action('blocked', { reason: 'Step not visited' });
});

registry.register('ui.nextStep', async () => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const currentStep = await appRoot.getValue(['wizard', 'currentStep']);
    const totalSteps = await appRoot.getValue(['wizard', 'totalSteps']);
    const stepValidProp = `step${currentStep}Valid`;
    const isValid = await appRoot.getValue(['wizard', stepValidProp]);

    if (!isValid) {
        return action('alert', { message: 'Please complete all required fields before continuing.' });
    }

    // Find next VISIBLE step (skip hidden conditional steps)
    const nextStep = await findNextVisibleStep(currentStep, totalSteps);

    if (nextStep !== null) {
        const highestVisited = await appRoot.getValue(['wizard', 'highestVisitedStep']);
        if (nextStep > highestVisited) {
            await appRoot.setValue(nextStep, { path: ['wizard', 'highestVisitedStep'] });
        }
        await appRoot.setValue(nextStep, { path: ['wizard', 'currentStep'] });
        return action('navigated', { step: nextStep });
    }

    // On final step, check if wizard is complete before submitting
    const isWizardComplete = await appRoot.getValue(['wizard', 'isWizardComplete']);
    if (!isWizardComplete) {
        return action('alert', { message: 'Please complete all steps before booking.' });
    }

    const wizardNode = appRoot.child('wizard');
    return action('submit', { data: wizardNode ? wizardNode.toJSON() : {} });
});

registry.register('ui.prevStep', async () => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const currentStep = await appRoot.getValue(['wizard', 'currentStep']);

    // Find previous VISIBLE step (skip hidden conditional steps)
    const prevStep = await findPrevVisibleStep(currentStep);

    if (prevStep !== null) {
        await appRoot.setValue(prevStep, { path: ['wizard', 'currentStep'] });
        return action('navigated', { step: prevStep });
    }
    return action('blocked', { reason: 'First step' });
});

registry.register('ui.setSubStep', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const path = typeof args[0] === 'object' ? args[0].value : args[0];
    const value = typeof args[1] === 'object' ? args[1].value : args[1];
    await appRoot.setValue(value, { path: ['wizard', ...path.split('.')] });
    return action('changed', { path, value });
});

registry.register('ui.toggleSection', async (args) => {
    const path = typeof args[0] === 'object' ? args[0].value : args[0];
    return action('toggleSection', { path });
});

// ============================================================================
// UI VALUE OPERATORS
// ============================================================================

registry.register('ui.setValue', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const path = typeof args[0] === 'object' ? args[0].value : args[0];
    const value = typeof args[1] === 'object' ? args[1].value : args[1];
    await appRoot.setValue(value, { path: ['wizard', ...path.split('.')] });
    return action('set', { path });
});

registry.register('ui.getValue', async (args) => {
    if (!appRoot) return null;
    const path = typeof args[0] === 'object' ? args[0].value : args[0];
    return await appRoot.getValue(['wizard', ...path.split('.')]);
});

registry.register('ui.snapshot', async () => {
    if (!appRoot) return {};
    const wizardNode = appRoot.child('wizard');
    return wizardNode ? wizardNode.toJSON() : {};
});

// ============================================================================
// UI FORMATTING OPERATORS
// ============================================================================

registry.register('ui.formatCurrency', async (args) => {
    const num = typeof args[0] === 'object' ? args[0].value : args[0];
    return '$' + (num || 0).toLocaleString();
});

// ============================================================================
// UI PANEL OPERATORS
// ============================================================================

registry.register('ui.openPanel', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });
    const panelName = typeof args[0] === 'object' ? args[0].value : args[0];

    await appRoot.setValue(false, { path: ['schemaPanel', 'isOpen'] });
    await appRoot.setValue(false, { path: ['dataPanel', 'isOpen'] });
    await appRoot.setValue(true, { path: [panelName, 'isOpen'] });
    await appRoot.setValue(true, { path: ['overlay', 'visible'] });

    return action('panelOpened', { panel: panelName });
});

registry.register('ui.closePanel', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });
    const panelName = typeof args[0] === 'object' ? args[0].value : args[0];

    await appRoot.setValue(false, { path: [panelName, 'isOpen'] });

    const schemaOpen = await appRoot.getValue(['schemaPanel', 'isOpen']);
    const dataOpen = await appRoot.getValue(['dataPanel', 'isOpen']);

    if (!schemaOpen && !dataOpen) {
        await appRoot.setValue(false, { path: ['overlay', 'visible'] });
    }

    return action('panelClosed', { panel: panelName });
});

registry.register('ui.closePanels', async () => {
    if (!appRoot) return action('error', { message: 'No app root' });

    await appRoot.setValue(false, { path: ['schemaPanel', 'isOpen'] });
    await appRoot.setValue(false, { path: ['dataPanel', 'isOpen'] });
    await appRoot.setValue(false, { path: ['overlay', 'visible'] });

    return action('panelsClosed', {});
});

registry.register('ui.togglePanel', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });
    const panelName = typeof args[0] === 'object' ? args[0].value : args[0];

    const isOpen = await appRoot.getValue([panelName, 'isOpen']);

    if (isOpen) {
        return await registry.get('ui.closePanel')([args[0]], {});
    } else {
        return await registry.get('ui.openPanel')([args[0]], {});
    }
});

// ============================================================================
// UI I18N OPERATORS
// ============================================================================

registry.register('ui.setLocale', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const locale = typeof args[0] === 'object' ? args[0].value : args[0];
    await appRoot.setValue(locale, { path: ['i18n', 'currentLocale'] });

    return action('localeChanged', { locale });
});

registry.register('ui.getLocale', async () => {
    if (!appRoot) return 'en';
    return await appRoot.getValue(['i18n', 'currentLocale']) || 'en';
});

registry.register('ui.getAvailableLocales', async () => {
    if (!appRoot) return ['en'];
    const locales = appRoot.child('i18n')?.child('locales');
    return locales ? Object.keys(locales.children || {}) : ['en'];
});

// ============================================================================
// UI THEME OPERATORS
// ============================================================================

registry.register('ui.setTheme', async (args) => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const theme = typeof args[0] === 'object' ? args[0].value : args[0];
    await appRoot.setValue(theme, { path: ['theme', 'current'] });

    return action('themeChanged', { theme });
});

registry.register('ui.toggleTheme', async () => {
    if (!appRoot) return action('error', { message: 'No app root' });

    const current = await appRoot.getValue(['theme', 'current']) || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    await appRoot.setValue(newTheme, { path: ['theme', 'current'] });

    return action('themeToggled', { from: current, to: newTheme });
});

registry.register('ui.getTheme', async () => {
    if (!appRoot) return 'dark';
    return await appRoot.getValue(['theme', 'current']) || 'dark';
});
