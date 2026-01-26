// ============================================================================
// WIZARD RENDERER - TuringWizard class for rendering Property-based wizards
// ============================================================================
// The wizard reads ALL state from properties - no computation in JS!
// Theme values are also read from Properties - ALL is Property!

import { lit } from '../.././dist/index.js';
import { registry, getAppRoot } from '../../common/registry.js';

// Store reference to the property root for UI operators
let propertyRoot = null;

export const setPropertyRoot = (root) => { propertyRoot = root; };
export const getPropertyRoot = () => propertyRoot;

// ============================================================================
// HELPER: Get theme values from appRoot
// ============================================================================
// Theme values are Properties - we read them from the single app tree

// Helper to get multiple theme values at once (for performance)
const getThemeValues = async () => {
    const appRoot = getAppRoot();
    if (!appRoot) return {};
    // Use getValue to get the current theme - system handles evaluation
    const currentTheme = await appRoot.getValue(['theme', 'current']) || 'dark';
    const themePath = ['theme', 'configs', currentTheme];

    return {
        // Text
        textPrimary: await appRoot.getValue([...themePath, 'text', 'primary']) || 'text-white',
        textSecondary: await appRoot.getValue([...themePath, 'text', 'secondary']) || 'text-gray-300',
        textMuted: await appRoot.getValue([...themePath, 'text', 'muted']) || 'text-gray-400',
        textAccent: await appRoot.getValue([...themePath, 'text', 'accent']) || 'text-blue-400',
        // Background
        bgPrimary: await appRoot.getValue([...themePath, 'bg', 'primary']) || 'bg-gray-900',
        bgSecondary: await appRoot.getValue([...themePath, 'bg', 'secondary']) || 'bg-gray-800',
        bgTertiary: await appRoot.getValue([...themePath, 'bg', 'tertiary']) || 'bg-gray-700',
        // Input
        inputBg: await appRoot.getValue([...themePath, 'input', 'bg']) || 'bg-gray-700',
        inputText: await appRoot.getValue([...themePath, 'input', 'text']) || 'text-white',
        inputBorder: await appRoot.getValue([...themePath, 'input', 'border']) || 'border-gray-600',
        inputPlaceholder: await appRoot.getValue([...themePath, 'input', 'placeholder']) || 'placeholder-gray-400',
        inputFocus: await appRoot.getValue([...themePath, 'input', 'focus']) || 'focus:border-blue-500',
        // Select
        selectBg: await appRoot.getValue([...themePath, 'select', 'bg']) || 'bg-gray-700',
        selectText: await appRoot.getValue([...themePath, 'select', 'text']) || 'text-white',
        selectBorder: await appRoot.getValue([...themePath, 'select', 'border']) || 'border-gray-600',
        // Checkbox/Radio
        checkboxBg: await appRoot.getValue([...themePath, 'checkbox', 'bg']) || 'bg-gray-700',
        checkboxBorder: await appRoot.getValue([...themePath, 'checkbox', 'border']) || 'border-gray-500',
        // Toggle
        toggleTrack: await appRoot.getValue([...themePath, 'toggle', 'track']) || 'bg-gray-600',
        toggleTrackChecked: await appRoot.getValue([...themePath, 'toggle', 'trackChecked']) || 'bg-blue-500',
        toggleKnob: await appRoot.getValue([...themePath, 'toggle', 'knob']) || 'bg-white',
        // Range/Slider
        rangeTrack: await appRoot.getValue([...themePath, 'range', 'track']) || 'bg-gray-600',
        rangeThumb: await appRoot.getValue([...themePath, 'range', 'thumb']) || 'bg-blue-500',
        // Rating
        ratingInactive: await appRoot.getValue([...themePath, 'rating', 'inactive']) || 'text-gray-600',
        ratingActive: await appRoot.getValue([...themePath, 'rating', 'active']) || 'text-yellow-400',
        ratingHover: await appRoot.getValue([...themePath, 'rating', 'hover']) || 'text-yellow-300',
        // Tab
        tabBg: await appRoot.getValue([...themePath, 'tab', 'bg']) || 'bg-gray-700/50',
        tabText: await appRoot.getValue([...themePath, 'tab', 'text']) || 'text-gray-400',
        tabHover: await appRoot.getValue([...themePath, 'tab', 'hover']) || 'hover:bg-gray-600/50',
        tabActiveBg: await appRoot.getValue([...themePath, 'tab', 'activeBg']) || 'bg-gradient-to-r from-blue-600 to-purple-600',
        tabActiveText: await appRoot.getValue([...themePath, 'tab', 'activeText']) || 'text-white',
        tabNumberBg: await appRoot.getValue([...themePath, 'tab', 'numberBg']) || 'bg-gray-600/50',
        // Progress
        progressBg: await appRoot.getValue([...themePath, 'progress', 'bg']) || 'bg-gray-700/50',
        progressFill: await appRoot.getValue([...themePath, 'progress', 'fill']) || 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
        // Wizard
        wizardTitle: await appRoot.getValue([...themePath, 'wizard', 'title']) || 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent',
        wizardSubtitle: await appRoot.getValue([...themePath, 'wizard', 'subtitle']) || 'text-gray-400',
        wizardSectionBg: await appRoot.getValue([...themePath, 'wizard', 'sectionBg']) || 'bg-gray-700/30',
        wizardSectionBorder: await appRoot.getValue([...themePath, 'wizard', 'sectionBorder']) || 'border-gray-700/50',
        wizardDivider: await appRoot.getValue([...themePath, 'wizard', 'divider']) || 'border-gray-700/50',
        // Label
        labelText: await appRoot.getValue([...themePath, 'label', 'text']) || 'text-gray-300',
        labelRequired: await appRoot.getValue([...themePath, 'label', 'required']) || 'text-red-400',
        // Error
        errorText: await appRoot.getValue([...themePath, 'error', 'text']) || 'text-red-400',
        // Accent (for selected/active states)
        accentBg: await appRoot.getValue([...themePath, 'accent', 'bg']) || 'bg-blue-500',
        accentBgLight: await appRoot.getValue([...themePath, 'accent', 'bgLight']) || 'bg-blue-500/10',
        accentBorder: await appRoot.getValue([...themePath, 'accent', 'border']) || 'border-blue-500',
        accentHover: await appRoot.getValue([...themePath, 'accent', 'hover']) || 'hover:border-blue-500',
        // Computed field
        computedBg: await appRoot.getValue([...themePath, 'computed', 'bg']) || 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
        computedBorder: await appRoot.getValue([...themePath, 'computed', 'border']) || 'border-blue-500/30',
        computedText: await appRoot.getValue([...themePath, 'computed', 'text']) || 'text-blue-400',
        // Border
        borderPrimary: await appRoot.getValue([...themePath, 'border', 'primary']) || 'border-gray-700',
        borderSecondary: await appRoot.getValue([...themePath, 'border', 'secondary']) || 'border-gray-600',
        // Button
        buttonSecondary: await appRoot.getValue([...themePath, 'button', 'secondary']) || 'bg-gray-700 hover:bg-gray-600 text-white',
    };
};

// ============================================================================
// HELPER: Evaluate metadata that might contain expressions
// ============================================================================
// No custom evalMetadata needed - PropertyNode.getMetadata() already evaluates expressions!

// ============================================================================
// TURING WIZARD CLASS
// ============================================================================

export class TuringWizard {
    constructor(root, container) {
        this.root = root;
        this.container = container;
        this.fileData = new Map();
        propertyRoot = root; // Set global reference for UI operators
    }

    async mount() {
        await this.renderWizard();
        this.attachBindings();
        // Subscribe to appRoot for reactive changes - ALL changes flow through the single tree
        const appRoot = getAppRoot();
        if (appRoot) {
            appRoot.subscribe(async (changedPaths) => {
                // Only update if wizard-related paths changed
                if (changedPaths.some(p => p.startsWith('wizard') || p.startsWith('theme') || p.startsWith('i18n'))) {
                    await this.updateUI();
                }
            });
        }
        await this.updateUI();
    }

    // Helper to get translation directly from i18n property tree
    async t(key) {
        const appRoot = getAppRoot();
        if (!appRoot) return key;
        const currentLocale = await appRoot.getValue(['i18n', 'currentLocale']) || 'en';
        const keyParts = key.split('.');
        const value = await appRoot.getValue(['i18n', 'locales', currentLocale, ...keyParts]);
        if (value === undefined && currentLocale !== 'en') {
            // Fallback to English
            return await appRoot.getValue(['i18n', 'locales', 'en', ...keyParts]) || key;
        }
        return value !== undefined ? value : key;
    }

    async renderWizard() {
        // Get translated text directly from i18n tree - ALL is Property!
        const title = await this.t('wizard.title');
        const description = await this.t('wizard.description');
        const totalSteps = await this.root.getValue(['totalSteps']);

        const progressLabel = await this.t('wizard.progress');
        const prevButtonText = '&#8592; ' + await this.t('wizard.previous');
        const currentStep = await this.root.getValue(['currentStep']) || 1;
        const isLastStep = currentStep === totalSteps;
        const nextButtonText = isLastStep
            ? await this.t('wizard.submit') + ' &#10003;'
            : await this.t('wizard.next') + ' &#8594;';
        const nextButtonGradient = isLastStep
            ? 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/25'
            : 'from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25';

        // Get theme values - ALL theme data is Property!
        this.theme = await getThemeValues();
        const t = this.theme;

        // Build step tabs (with visibility support for conditional steps)
        let tabsHtml = '';
        for (let i = 1; i <= totalSteps; i++) {
            const stepNode = this.root.child(`step${i}`);
            const stepTitle = stepNode ? await stepNode.getMetadata('tabTitle') || `Step ${i}` : `Step ${i}`;
            const stepVisible = stepNode ? await stepNode.getMetadata('visible') : true;
            const isHidden = stepVisible === false;
            tabsHtml += `
                <button data-tp-tab="${i}" data-tp-step-visible="step${i}" class="step-tab flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all border border-transparent
                    ${t.tabBg} ${t.tabText} ${t.tabHover}${isHidden ? ' hidden' : ''}">
                    <span class="step-number w-7 h-7 inline-flex items-center justify-center rounded-full ${t.tabNumberBg} text-xs mr-2 font-bold">${i}</span>
                    <span class="hidden sm:inline">${stepTitle}</span>
                </button>
            `;
        }

        // Build step contents
        let stepsHtml = '';
        for (let i = 1; i <= totalSteps; i++) {
            const stepNode = this.root.child(`step${i}`);
            if (stepNode) {
                stepsHtml += await this.renderStepContent(stepNode, i);
            }
        }

        this.container.innerHTML = `
            <div class="tp-wizard">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h3 id="wizard-title" class="text-3xl font-bold ${t.wizardTitle}">${title}</h3>
                    <p id="wizard-description" class="${t.wizardSubtitle} mt-2">${description}</p>
                </div>

                <!-- Progress Bar -->
                <div class="mb-8">
                    <div class="flex justify-between text-sm mb-2">
                        <span id="progress-label" class="${t.textMuted}">${progressLabel}</span>
                        <span class="${t.textAccent} font-semibold" id="progress-text">0%</span>
                    </div>
                    <div class="w-full ${t.progressBg} rounded-full h-2 overflow-hidden">
                        <div id="progress-bar" class="${t.progressFill} h-2 rounded-full transition-all duration-500 ease-out" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Step Tabs -->
                <div class="flex gap-2 mb-8 overflow-x-auto pb-2">${tabsHtml}</div>

                <!-- Step Contents -->
                <div class="steps-wrapper min-h-[300px]">${stepsHtml}</div>

                <!-- Estimated Total -->
                <div class="mt-6 p-4 rounded-xl ${t.wizardSectionBg} border ${t.borderSubtle}">
                    <div class="flex justify-between items-center">
                        <span class="${t.textMuted} text-sm font-medium">Estimated Total</span>
                        <span id="estimated-total" class="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">$0</span>
                    </div>
                    <p class="text-xs ${t.textMuted} mt-1">Final price may vary based on availability</p>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between mt-8 pt-6 border-t ${t.wizardDivider}">
                    <button id="btn-prev" class="px-6 py-3 ${t.buttonSecondary} rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 border ${t.borderSecondary}">
                        ${prevButtonText}
                    </button>
                    <button id="btn-next" class="px-6 py-3 bg-gradient-to-r ${nextButtonGradient} text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg">
                        ${nextButtonText}
                    </button>
                </div>
            </div>
        `;
    }

    async renderStepContent(stepNode, stepNum) {
        const stepTitle = await stepNode.getMetadata('stepTitle') || '';
        const stepDesc = await stepNode.getMetadata('stepDescription') || '';
        const hasSubSteps = await stepNode.getMetadata('hasSubSteps') || false;
        const t = this.theme;

        let contentHtml = '';

        if (hasSubSteps) {
            // Render vertical sub-step sidebar and their content
            let subTabsHtml = '';
            let subContentsHtml = '';
            let subStepIndex = 0;

            for (const childId of stepNode.childKeys()) {
                const childNode = stepNode.child(childId);
                if (!childNode) continue;
                const inputType = await childNode.getMetadata('inputType');
                if (inputType === 'substep') {
                    subStepIndex++;
                    const subTitle = await childNode.getMetadata('subStepTitle') || `Sub ${subStepIndex}`;
                    const subIcon = await childNode.getMetadata('subStepIcon') || '';
                    const subDesc = await childNode.getMetadata('subStepDescription') || '';

                    // Check if substep has conditional visibility
                    const subStepVisible = await childNode.getMetadata('visible');
                    const subStepHidden = subStepVisible === false;

                    subTabsHtml += `
                        <button data-tp-substep="${stepNum}.${subStepIndex}" data-substep-path="step${stepNum}.currentSubStep" data-substep-value="${subStepIndex}" data-tp-substep-id="${childId}" data-tp-substep-visible="${childId}"
                            class="substep-tab group w-full text-left px-4 py-3 rounded-xl transition-all ${t.wizardSectionBg} ${t.tabText} ${t.tabHover} border border-transparent flex items-start gap-3${subStepHidden ? ' hidden' : ''}">
                            <span class="substep-number flex-shrink-0 w-8 h-8 rounded-full ${t.tabNumberBg} flex items-center justify-center text-sm font-semibold group-hover:opacity-80 transition-colors">
                                ${subIcon || subStepIndex}
                            </span>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm">${subTitle}</div>
                                ${subDesc ? `<div class="text-xs ${t.textMuted} mt-0.5 truncate">${subDesc}</div>` : ''}
                            </div>
                        </button>
                    `;

                    // Render sub-step content (which may have sections)
                    subContentsHtml += await this.renderSubStepContent(childNode, `step${stepNum}.${childId}`, subStepIndex, childId);
                }
            }

            // For steps with sub-steps, include title/desc in the sidebar
            return `
                <div class="step-content hidden" data-step="${stepNum}" data-tp-step-content="step${stepNum}">
                    <div class="flex gap-6">
                        <!-- Left Sidebar - Sub-step Navigation -->
                        <div class="w-56 flex-shrink-0">
                            ${stepTitle ? `<h4 class="text-xl font-semibold ${t.textPrimary} mb-1">${stepTitle}</h4>` : ''}
                            ${stepDesc ? `<p class="${t.textMuted} text-sm mb-4">${stepDesc}</p>` : ''}
                            <div class="space-y-2">
                                ${subTabsHtml}
                            </div>
                        </div>
                        <!-- Right Content Area -->
                        <div class="flex-1 min-w-0">
                            <div class="substeps-wrapper">${subContentsHtml}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // No sub-steps - render sections or fields directly
            contentHtml = await this.renderStepFields(stepNode, `step${stepNum}`);
        }

        return `
            <div class="step-content hidden" data-step="${stepNum}" data-tp-step-content="step${stepNum}">
                ${stepTitle ? `<h4 class="text-2xl font-semibold ${t.textPrimary} mb-2">${stepTitle}</h4>` : ''}
                ${stepDesc ? `<p class="${t.textMuted} mb-6">${stepDesc}</p>` : ''}
                ${contentHtml}
            </div>
        `;
    }

    async renderSubStepContent(subStepNode, basePath, subStepIndex, subStepId) {
        const subStepDesc = await subStepNode.getMetadata('subStepDescription') || '';
        const t = this.theme;

        let contentHtml = await this.renderStepFields(subStepNode, basePath);

        return `
            <div class="substep-content hidden" data-substep="${subStepIndex}" data-tp-substep-content-visible="${subStepId}">
                ${subStepDesc ? `<p class="${t.textMuted} text-sm mb-6">${subStepDesc}</p>` : ''}
                ${contentHtml}
            </div>
        `;
    }

    async renderStepFields(parentNode, basePath) {
        let sectionsHtml = '';
        let fieldsHtml = '';
        let hasSections = false;

        for (const childId of parentNode.childKeys()) {
            const childNode = parentNode.child(childId);
            if (!childNode) continue;
            const inputType = await childNode.getMetadata('inputType');

            if (inputType === 'section') {
                hasSections = true;
                sectionsHtml += await this.renderSection(childNode, `${basePath}.${childId}`);
            } else if (inputType !== 'substep' && inputType !== 'hidden') {
                fieldsHtml += await this.renderField(childNode, `${basePath}.${childId}`);
            }
        }

        if (hasSections) {
            return `<div class="space-y-4">${sectionsHtml}</div>`;
        }
        return `<div class="space-y-6">${fieldsHtml}</div>`;
    }

    async renderSection(sectionNode, basePath) {
        const sectionTitle = await sectionNode.getMetadata('sectionTitle') || '';
        const sectionIcon = await sectionNode.getMetadata('sectionIcon') || '';
        const sectionDesc = await sectionNode.getMetadata('sectionDescription') || '';
        const collapsible = await sectionNode.getMetadata('collapsible') || false;
        const defaultExpanded = await sectionNode.getMetadata('defaultExpanded') !== false;
        const t = this.theme;

        let fieldsHtml = '';
        for (const fieldId of sectionNode.childKeys()) {
            const fieldNode = sectionNode.child(fieldId);
            if (!fieldNode) continue;
            const inputType = await fieldNode.getMetadata('inputType');
            if (inputType !== 'hidden') {
                fieldsHtml += await this.renderField(fieldNode, `${basePath}.${fieldId}`);
            }
        }

        if (collapsible) {
            return `
                <div class="section-collapsible border ${t.wizardSectionBorder} rounded-xl overflow-hidden" data-tp-section="${basePath}">
                    <button type="button" class="section-header w-full px-4 py-3 ${t.wizardSectionBg} flex items-center justify-between ${t.tabHover} transition-colors" data-tp-section-toggle="${basePath}">
                        <div class="flex items-center gap-2">
                            ${sectionIcon ? `<span class="text-lg">${sectionIcon}</span>` : ''}
                            <span class="font-medium ${t.textPrimary}">${sectionTitle}</span>
                        </div>
                        <span class="section-chevron ${t.textMuted} transition-transform ${defaultExpanded ? 'rotate-180' : ''}">&#9660;</span>
                    </button>
                    <div class="section-body px-4 py-4 space-y-5 ${defaultExpanded ? '' : 'hidden'}" data-tp-section-body="${basePath}">
                        ${sectionDesc ? `<p class="${t.textMuted} text-sm mb-4">${sectionDesc}</p>` : ''}
                        ${fieldsHtml}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="section border-l-2 ${t.accentBorder} pl-4 py-2" data-tp-section="${basePath}">
                    <div class="flex items-center gap-2 mb-4">
                        ${sectionIcon ? `<span class="text-lg">${sectionIcon}</span>` : ''}
                        <h5 class="font-medium ${t.textPrimary}">${sectionTitle}</h5>
                    </div>
                    ${sectionDesc ? `<p class="${t.textMuted} text-sm mb-4">${sectionDesc}</p>` : ''}
                    <div class="space-y-5">${fieldsHtml}</div>
                </div>
            `;
        }
    }

    async renderField(node, path) {
        const inputType = await node.getMetadata('inputType');
        if (inputType === 'hidden') return '';

        // Check initial visibility (will be updated reactively in updateUI)
        const visible = await node.getMetadata('visible');
        const initiallyHidden = visible === false;
        const t = this.theme;

        const id = path.replace(/\./g, '-');
        const label = await node.getMetadata('label') || node.id;
        const placeholder = await node.getMetadata('placeholder') || '';
        const hint = await node.getMetadata('hint') || '';
        const required = await node.getMetadata('required') || false;
        const options = await node.getMetadata('options') || [];
        const min = await node.getMetadata('min');
        const max = await node.getMetadata('max');
        const step = await node.getMetadata('step') || 1;
        const prefix = await node.getMetadata('prefix') || '';
        const suffix = await node.getMetadata('suffix') || '';
        const rows = await node.getMetadata('rows') || 3;
        const maxLength = await node.getMetadata('maxLength') || 500;

        // Theme-aware base input styles
        const baseInput = `w-full px-4 py-3 ${t.inputBg} border ${t.inputBorder} rounded-lg ${t.inputText} ${t.inputPlaceholder} ${t.inputFocus} focus:ring-2 transition-all`;
        let inputHtml = '';

        // Helper to get option value (handles op() expressions)
        const getOptionValue = async (opt, key) => {
            if (opt.metadata && opt.metadata[key]) {
                const metaValue = opt.metadata[key].value;
                if (metaValue && typeof metaValue === 'object' && metaValue.children && metaValue.id) {
                    const opFn = registry.get(metaValue.id);
                    if (opFn) {
                        const args = [];
                        const keys = Object.keys(metaValue.children).sort((a, b) => {
                            const numA = parseInt(a.replace('arg', ''), 10);
                            const numB = parseInt(b.replace('arg', ''), 10);
                            return numA - numB;
                        });
                        for (const k of keys) {
                            args.push(metaValue.children[k]);
                        }
                        return await opFn(args, {});
                    }
                }
                return metaValue;
            }
            return opt[key];
        };

        switch (inputType) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
                inputHtml = `<input type="${inputType}" id="${id}" data-tp-model="${path}" placeholder="${placeholder}" value="${node.getRawValue() || ''}" class="${baseInput}" />`;
                break;

            case 'number':
                inputHtml = `
                    <div class="flex items-center gap-3">
                        ${prefix ? `<span class="${t.textMuted} text-lg">${prefix}</span>` : ''}
                        <input type="number" id="${id}" data-tp-model="${path}" value="${node.getRawValue() || 0}"
                            ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''} step="${step}"
                            class="${baseInput}" />
                        ${suffix ? `<span class="${t.textMuted}">${suffix}</span>` : ''}
                    </div>`;
                break;

            case 'range':
                inputHtml = `
                    <div class="space-y-3">
                        <input type="range" id="${id}" data-tp-model="${path}" value="${node.getRawValue() || min || 0}"
                            min="${min || 0}" max="${max || 100}" step="${step}"
                            class="w-full h-2 ${t.rangeTrack} rounded-lg appearance-none cursor-pointer range-slider" />
                        <div class="flex justify-between text-sm">
                            <span class="${t.textMuted}">${prefix}${min || 0}${suffix}</span>
                            <span class="${t.textAccent} font-bold text-lg" data-tp-range-value="${path}">${prefix}${node.getRawValue() || min || 0}${suffix}</span>
                            <span class="${t.textMuted}">${prefix}${max || 100}${suffix}</span>
                        </div>
                    </div>`;
                break;

            case 'date':
            case 'time':
            case 'datetime-local':
                inputHtml = `<input type="${inputType}" id="${id}" data-tp-model="${path}" value="${node.getRawValue() || ''}" class="${baseInput}" />`;
                break;

            case 'textarea':
                inputHtml = `
                    <textarea id="${id}" data-tp-model="${path}" placeholder="${placeholder}" rows="${rows}" maxlength="${maxLength}"
                        class="${baseInput} resize-none">${node.getRawValue() || ''}</textarea>
                    <div class="flex justify-between mt-2 text-xs">
                        <span class="text-orange-400" data-tp-warning="${path}"></span>
                        <span class="${t.textMuted}"><span data-tp-charcount="${path}">0</span>/${maxLength}</span>
                    </div>`;
                break;

            case 'select':
                const selectOptionsHtml = await Promise.all(options.map(async o => {
                    const val = o.value;
                    const lbl = await getOptionValue(o, 'label') || val;
                    const icon = await getOptionValue(o, 'icon') || '';
                    return `<option value="${val}" ${val === node.getRawValue() ? 'selected' : ''}>${icon ? icon + ' ' : ''}${lbl}</option>`;
                }));
                inputHtml = `
                    <select id="${id}" data-tp-model="${path}" class="${baseInput}">
                        ${selectOptionsHtml.join('')}
                    </select>
                    <span class="text-orange-400 text-sm mt-1 block" data-tp-warning="${path}"></span>`;
                break;

            case 'radio':
                const radioOptionsHtml = await Promise.all(options.map(async o => {
                    const val = o.value;
                    const lbl = await getOptionValue(o, 'label') || val;
                    const icon = await getOptionValue(o, 'icon') || '';
                    const desc = await getOptionValue(o, 'description') || '';
                    const price = await getOptionValue(o, 'price') || '';
                    const isSelected = val === node.getRawValue();
                    return `
                        <label class="radio-option flex items-start gap-3 p-4 ${t.inputBg} rounded-lg cursor-pointer border-2 border-transparent hover:${t.inputBorder} transition-all ${isSelected ? `${t.accentBorder} ${t.accentBgLight}` : ''}">
                            <input type="radio" name="${id}" data-tp-model="${path}" value="${val}" ${isSelected ? 'checked' : ''} class="mt-1" />
                            <div>
                                <div class="font-medium ${t.textPrimary}">${icon ? `<span class="mr-1">${icon}</span>` : ''}${lbl}</div>
                                ${desc ? `<div class="text-xs ${t.textMuted} mt-1">${desc}</div>` : ''}
                                ${price ? `<div class="text-sm ${t.textAccent} mt-1">${price}</div>` : ''}
                            </div>
                        </label>
                    `;
                }));
                inputHtml = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${radioOptionsHtml.join('')}
                    </div>`;
                break;

            case 'checkbox':
                inputHtml = `
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <div class="relative">
                            <input type="checkbox" id="${id}" data-tp-model="${path}" ${node.getRawValue() ? 'checked' : ''} class="peer sr-only" data-tp-checkbox="${path}" />
                            <div class="checkbox-box w-6 h-6 rounded border-2 transition-all pointer-events-none ${node.getRawValue() ? 'checked' : ''}" data-tp-checkbox-box="${path}"></div>
                            <svg class="absolute top-1 left-1 w-4 h-4 text-white ${node.getRawValue() ? '' : 'hidden'} pointer-events-none" data-tp-checkbox-check="${path}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <span class="${t.textSecondary} group-hover:${t.textPrimary} transition-colors">${label}</span>
                    </label>`;
                break;

            case 'toggle':
                inputHtml = `
                    <label class="flex items-center justify-between cursor-pointer">
                        <span class="${t.textSecondary}">${label}</span>
                        <div class="relative">
                            <input type="checkbox" id="${id}" data-tp-model="${path}" ${node.getRawValue() ? 'checked' : ''} class="peer sr-only" data-tp-toggle="${path}" />
                            <div class="toggle-track w-14 h-8 rounded-full transition-all pointer-events-none ${node.getRawValue() ? 'checked' : ''}" data-tp-toggle-track="${path}"></div>
                            <div class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full peer-checked:translate-x-6 transition-all shadow pointer-events-none"></div>
                        </div>
                    </label>`;
                break;

            case 'rating':
                const maxRating = max || 5;
                const currentRating = node.getRawValue() || 0;
                inputHtml = `
                    <div class="flex items-center gap-1" data-tp-rating="${path}" data-max="${maxRating}">
                        ${Array.from({length: maxRating}, (_, i) => `
                            <span class="star ${i < currentRating ? 'active' : ''}" data-value="${i + 1}">&#9733;</span>
                        `).join('')}
                        <span class="ml-3 ${t.textMuted}" data-tp-rating-text="${path}">${currentRating}/${maxRating}</span>
                    </div>`;
                break;

            case 'color':
                inputHtml = `
                    <div class="flex items-center gap-4">
                        <input type="color" id="${id}" data-tp-model="${path}" value="${node.getRawValue() || '#3b82f6'}" class="w-16 h-12 rounded-lg cursor-pointer border-2 ${t.inputBorder}" />
                        <div>
                            <span class="text-lg font-mono ${t.textPrimary}" data-tp-color-value="${path}">${node.getRawValue() || '#3b82f6'}</span>
                            <p class="text-xs ${t.textMuted}">Click to change</p>
                        </div>
                    </div>`;
                break;

            case 'tags':
                const tagsArray = Array.isArray(node.getRawValue()) ? node.getRawValue() : [];
                inputHtml = `
                    <div class="tags-input">
                        <div class="flex flex-wrap gap-2 mb-2" data-tp-tags-list="${path}">
                            ${tagsArray.map(tag => `<span class="tag px-3 py-1 ${t.accentBgLight} ${t.textAccent} rounded-full text-sm flex items-center gap-1">${tag}<button class="tag-remove hover:${t.errorText}" data-tag="${tag}">&#215;</button></span>`).join('')}
                        </div>
                        <input type="text" data-tp-tags-input="${path}" placeholder="${placeholder || 'Type and press Enter'}" class="${baseInput}" />
                    </div>`;
                break;

            case 'multiselect':
                const multiselectOptionsHtml = await Promise.all(options.map(async o => {
                    const val = o.value;
                    const lbl = await getOptionValue(o, 'label') || val;
                    const icon = await getOptionValue(o, 'icon') || '';
                    const selected = Array.isArray(node.getRawValue()) && node.getRawValue().includes(val);
                    return `
                        <label class="flex items-center gap-2 p-3 ${t.inputBg} rounded-lg cursor-pointer border-2 ${selected ? t.accentBorder : 'border-transparent'} hover:${t.bgTertiary} transition-all">
                            <input type="checkbox" data-tp-multiselect="${path}" value="${val}" ${selected ? 'checked' : ''} class="sr-only" />
                            <div class="w-5 h-5 rounded border-2 ${selected ? `${t.accentBg} ${t.accentBorder}` : t.checkboxBorder} flex items-center justify-center pointer-events-none">
                                ${selected ? '<svg class="w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                            </div>
                            <span class="text-sm ${t.textSecondary}">${icon ? `<span class="mr-1">${icon}</span>` : ''}${lbl}</span>
                        </label>
                    `;
                }));
                inputHtml = `
                    <div class="grid grid-cols-2 gap-2">
                        ${multiselectOptionsHtml.join('')}
                    </div>`;
                break;

            case 'computed':
                inputHtml = `
                    <div class="p-6 ${t.computedBg} rounded-lg border ${t.computedBorder}">
                        <span class="text-3xl font-bold ${t.computedText}" data-tp-computed="${path}">$0</span>
                    </div>`;
                break;

            default:
                inputHtml = `<input type="text" data-tp-model="${path}" class="${baseInput}" />`;
        }

        const showLabel = !['checkbox', 'toggle'].includes(inputType);

        return `
            <div class="tp-field${initiallyHidden ? ' hidden' : ''}" data-tp-field="${path}" data-tp-visible="${path}">
                ${showLabel ? `<label class="block text-sm font-medium ${t.labelText} mb-2">${label}${required ? ` <span class="${t.labelRequired}">*</span>` : ''}</label>` : ''}
                ${inputHtml}
                ${hint ? `<p class="text-xs ${t.textMuted} mt-2">${hint}</p>` : ''}
                <p class="text-xs ${t.labelRequired} mt-2 hidden" data-tp-error="${path}"></p>
                <p class="text-xs ${t.textAccent} mt-2 hidden" data-tp-hint="${path}"></p>
            </div>
        `;
    }

    attachBindings() {
        const c = this.container;

        // Basic input bindings
        c.querySelectorAll('[data-tp-model]').forEach(el => {
            const path = el.dataset.tpModel;
            const isCheckbox = el.type === 'checkbox';
            const isNumber = el.type === 'number' || el.type === 'range';
            const event = ['SELECT', 'INPUT'].includes(el.tagName) && (isCheckbox || el.type === 'radio' || el.tagName === 'SELECT') ? 'change' : 'input';

            if (el.type === 'file') return; // Handle separately

            el.addEventListener(event, () => {
                let value = isCheckbox ? el.checked : isNumber ? Number(el.value) : el.value;
                this.root.setValue(value, { path: path.split('.') });
            });
        });

        // Rating stars
        c.querySelectorAll('[data-tp-rating]').forEach(container => {
            const path = container.dataset.tpRating;
            container.querySelectorAll('.star').forEach(star => {
                star.addEventListener('click', () => {
                    const value = parseInt(star.dataset.value);
                    this.root.setValue(value, { path: path.split('.') });
                });
            });
        });

        // File uploads
        c.querySelectorAll('[data-tp-file]').forEach(area => {
            const path = area.dataset.tpFile;
            const input = area.querySelector('input[type="file"]');

            area.addEventListener('click', () => input.click());
            area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('border-blue-500'); });
            area.addEventListener('dragleave', () => area.classList.remove('border-blue-500'));
            area.addEventListener('drop', e => {
                e.preventDefault();
                area.classList.remove('border-blue-500');
                this.handleFileUpload(path, e.dataTransfer.files, area);
            });
            input.addEventListener('change', () => this.handleFileUpload(path, input.files, area));
        });

        // Tags input
        c.querySelectorAll('[data-tp-tags-input]').forEach(input => {
            const path = input.dataset.tpTagsInput;
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    this.addTag(path, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Tag remove buttons
        c.addEventListener('click', e => {
            if (e.target.classList.contains('tag-remove')) {
                const tag = e.target.dataset.tag;
                const list = e.target.closest('[data-tp-tags-list]');
                if (list) this.removeTag(list.dataset.tpTagsList, tag);
            }
        });

        // Multiselect
        c.querySelectorAll('[data-tp-multiselect]').forEach(cb => {
            cb.addEventListener('change', () => {
                const path = cb.dataset.tpMultiselect;
                const allCbs = c.querySelectorAll(`[data-tp-multiselect="${path}"]`);
                const values = Array.from(allCbs).filter(x => x.checked).map(x => x.value);
                this.root.setValue(values, { path: path.split('.') });
            });
        });

        // Password toggle
        c.querySelectorAll('[data-toggle-password]').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = c.querySelector(`#${btn.dataset.togglePassword}`);
                input.type = input.type === 'password' ? 'text' : 'password';
                btn.innerHTML = input.type === 'password' ? '&#128065;' : '&#128584;';
            });
        });

        // Sub-step tabs - use ui.setSubStep operator from property system
        c.querySelectorAll('[data-tp-substep]').forEach(tab => {
            tab.addEventListener('click', async () => {
                const path = tab.dataset.substepPath;
                const value = parseInt(tab.dataset.substepValue);
                // Use the ui.setSubStep operator - all logic flows through properties!
                await registry.get('ui.setSubStep')([lit(path), lit(value)], {});
            });
        });

        // Collapsible section toggles - use ui.toggleSection operator
        c.querySelectorAll('[data-tp-section-toggle]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const path = btn.dataset.tpSectionToggle;
                // Use the ui.toggleSection operator - signals the action through property system
                const result = await registry.get('ui.toggleSection')([lit(path)], {});

                // Handle the DOM manipulation based on operator result
                if (result && result.action === 'toggleSection') {
                    const body = c.querySelector(`[data-tp-section-body="${result.path.value || result.path}"]`);
                    const chevron = btn.querySelector('.section-chevron');
                    if (body) {
                        body.classList.toggle('hidden');
                        chevron?.classList.toggle('rotate-180');
                    }
                }
            });
        });

        // Step tabs - use ui.goToStep operator from property system
        c.querySelectorAll('[data-tp-tab]').forEach(tab => {
            tab.addEventListener('click', async () => {
                // Check if tab is disabled (not clickable)
                if (tab.disabled) return;

                const step = parseInt(tab.dataset.tpTab);
                // Check isClickable from property metadata before navigation
                const stepNode = this.root.child(`step${step}`);
                if (stepNode) {
                    const isClickable = await stepNode.getMetadata('isClickable');
                    if (!isClickable) {
                        // Show alert if trying to skip to an invalid step
                        alert('Please complete the previous steps first.');
                        return;
                    }
                }
                // Use the ui.goToStep operator - all logic is in the operator!
                await registry.get('ui.goToStep')([lit(step)], {});
            });
        });

        // Navigation: Previous button - uses ui.prevStep operator
        c.querySelector('#btn-prev')?.addEventListener('click', async () => {
            // All navigation logic is in the operator - no JS logic here!
            await registry.get('ui.prevStep')([], {});
        });

        // Navigation: Next button - uses ui.nextStep operator
        c.querySelector('#btn-next')?.addEventListener('click', async () => {
            // Use the ui.nextStep operator - handles validation, navigation, and submit
            const result = await registry.get('ui.nextStep')([], {});

            // Handle operator result (alerts, submit, etc.)
            if (result && result.action === 'alert') {
                alert(result.message);
            } else if (result && result.action === 'submit') {
                alert('Event Booked Successfully!\n\n' + JSON.stringify(result.data, null, 2));
            }
        });
    }

    async handleFileUpload(path, files, area) {
        const pathParts = path.split('.');
        let node = this.root;
        for (const part of pathParts) node = node?.child(part);
        if (!node) return;

        const accept = await node.getMetadata('accept') || '';
        const maxSize = await node.getMetadata('maxSize') || 5242880;
        const errorEl = this.container.querySelector(`[data-tp-file-error="${path}"]`);
        const preview = area.querySelector('.file-preview');
        const placeholder = area.querySelector('.file-placeholder');

        let errors = [];
        let validFiles = [];

        for (const file of files) {
            // Size validation
            if (file.size > maxSize) {
                errors.push(`${file.name} exceeds max size (${Math.round(maxSize/1048576)}MB)`);
                continue;
            }
            // Type validation
            if (accept) {
                const acceptedTypes = accept.split(',').map(t => t.trim());
                const isValid = acceptedTypes.some(t => {
                    if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t);
                    if (t.endsWith('/*')) return file.type.startsWith(t.replace('/*', ''));
                    return file.type === t;
                });
                if (!isValid) {
                    errors.push(`${file.name} is not an accepted file type`);
                    continue;
                }
            }
            validFiles.push(file);
        }

        if (errors.length) {
            errorEl.textContent = errors.join(', ');
            errorEl.classList.remove('hidden');
        } else {
            errorEl.classList.add('hidden');
        }

        if (validFiles.length) {
            this.fileData.set(path, validFiles);
            this.root.setValue(validFiles.map(f => f.name).join(', '), { path: pathParts });

            // Show preview - use theme values
            const t = this.theme || {};
            placeholder.classList.add('hidden');
            preview.classList.remove('hidden');
            preview.innerHTML = validFiles.map(f => `
                <div class="flex items-center gap-2 text-sm">
                    <span class="text-2xl">${f.type.startsWith('image/') ? '&#128444;' : '&#128196;'}</span>
                    <div>
                        <p class="${t.textPrimary || 'text-white'}">${f.name}</p>
                        <p class="text-xs ${t.textMuted || 'text-gray-500'}">${(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
            `).join('');
        }
    }

    async addTag(path, tag) {
        const pathParts = path.split('.');
        const current = await this.root.getValue(pathParts) || [];
        if (!current.includes(tag)) {
            this.root.setValue([...current, tag], { path: pathParts });
        }
    }

    async removeTag(path, tag) {
        const pathParts = path.split('.');
        const current = await this.root.getValue(pathParts) || [];
        this.root.setValue(current.filter(t => t !== tag), { path: pathParts });
    }

    async updateUI() {
        // Refresh theme values for any dynamic content
        this.theme = await getThemeValues();

        // Read ALL state from properties - no computation in JavaScript!
        const currentStep = await this.root.getValue(['currentStep']) || 1;
        const totalSteps = await this.root.getValue(['totalSteps']) || 4;

        // Read computed UI state from properties - ALL is Property!
        const progressBarWidth = await this.root.getValue(['progressBarWidth']) || '0%';
        const progressText = await this.root.getValue(['progressText']) || '0%';
        const prevButtonDisabled = await this.root.getValue(['prevButtonDisabled']);
        const isLastStep = await this.root.getValue(['isLastStep']);
        const isWizardComplete = await this.root.getValue(['isWizardComplete']);
        const estimatedTotal = await this.root.getValue(['estimatedTotal']) || 0;

        // Get current step validity from computed property
        const currentStepValid = await this.root.getValue(['currentStepValid']);

        // Get translated text directly from i18n tree
        const wizardTitle = await this.t('wizard.title');
        const wizardDescription = await this.t('wizard.description');
        const progressLabel = await this.t('wizard.progress');
        const prevButtonText = '&#8592; ' + await this.t('wizard.previous');
        const nextButtonText = isLastStep
            ? await this.t('wizard.submit') + ' &#10003;'
            : await this.t('wizard.next') + ' &#8594;';
        // Next button state: disabled if current step is invalid OR (last step AND wizard incomplete)
        const nextButtonDisabled = !currentStepValid || (isLastStep && !isWizardComplete);
        // On last step, show green only if wizard is complete, else show orange/disabled state
        // For non-last steps, show blue if valid, orange if invalid
        const nextButtonGradient = isLastStep
            ? (isWizardComplete
                ? 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/25'
                : 'from-orange-600 to-amber-600 opacity-60 cursor-not-allowed shadow-orange-500/25')
            : (currentStepValid
                ? 'from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25'
                : 'from-orange-600 to-amber-600 opacity-60 cursor-not-allowed shadow-orange-500/25');

        // Update wizard title and description (for language changes)
        const titleEl = this.container.querySelector('#wizard-title');
        const descEl = this.container.querySelector('#wizard-description');
        if (titleEl) titleEl.textContent = wizardTitle;
        if (descEl) descEl.textContent = wizardDescription;

        // Update progress bar - values come from properties!
        const progressBar = this.container.querySelector('#progress-bar');
        const progressTextEl = this.container.querySelector('#progress-text');
        if (progressBar) progressBar.style.width = progressBarWidth;
        if (progressTextEl) progressTextEl.textContent = progressText;

        // Update step visibility (including conditional steps)
        for (let stepNum = 1; stepNum <= totalSteps; stepNum++) {
            const stepNode = this.root.child(`step${stepNum}`);
            if (!stepNode) continue;

            // Check if step is conditionally visible
            const stepVisible = await stepNode.getMetadata('visible');
            const isStepHidden = stepVisible === false;

            // Update step tab visibility
            const stepTab = this.container.querySelector(`[data-tp-step-visible="step${stepNum}"]`);
            if (stepTab) {
                stepTab.classList.toggle('hidden', isStepHidden);
            }

            // Update step content visibility (hidden if not current OR conditionally hidden)
            const stepContent = this.container.querySelector(`[data-tp-step-content="step${stepNum}"]`);
            if (stepContent) {
                stepContent.classList.toggle('hidden', stepNum !== currentStep || isStepHidden);
            }
        }

        // Update sub-step visibility and tabs using computed properties from property system
        for (let stepNum = 1; stepNum <= totalSteps; stepNum++) {
            const stepNode = this.root.child(`step${stepNum}`);
            if (!stepNode) continue;

            const hasSubSteps = await stepNode.getMetadata('hasSubSteps');
            if (hasSubSteps) {
                // currentSubStep is in step's children
                let currentSubStep = await this.root.getValue([`step${stepNum}`, 'currentSubStep']) || 1;

                // First, update substep visibility based on 'visible' metadata
                // Also collect visible substeps to handle currentSubStep adjustment
                const visibleSubSteps = [];
                for (const childId of stepNode.childKeys()) {
                    const childNode = stepNode.child(childId);
                    if (!childNode) continue;
                    const inputType = await childNode.getMetadata('inputType');
                    if (inputType === 'substep') {
                        const subStepVisible = await childNode.getMetadata('visible');
                        const isHidden = subStepVisible === false;

                        // Update substep tab visibility
                        const tab = this.container.querySelector(`[data-tp-substep-visible="${childId}"]`);
                        if (tab) {
                            tab.classList.toggle('hidden', isHidden);
                        }

                        // Update substep content visibility
                        const content = this.container.querySelector(`[data-tp-substep-content-visible="${childId}"]`);
                        if (content && isHidden) {
                            content.classList.add('hidden');
                        }

                        if (!isHidden) {
                            const subStepNum = parseInt(tab?.dataset.substepValue || '0');
                            if (subStepNum > 0) visibleSubSteps.push(subStepNum);
                        }
                    }
                }

                // If current substep is hidden, switch to first visible one
                if (visibleSubSteps.length > 0 && !visibleSubSteps.includes(currentSubStep)) {
                    currentSubStep = visibleSubSteps[0];
                    await this.root.setValue(currentSubStep, { path: [`step${stepNum}`, 'currentSubStep'] });
                }

                // Update sub-step content visibility (only show current AND visible)
                this.container.querySelectorAll(`[data-step="${stepNum}"] [data-substep]`).forEach(el => {
                    const substepNum = parseInt(el.dataset.substep);
                    const contentId = el.dataset.tpSubstepContentVisible;
                    // Check if this substep is conditionally hidden
                    const tab = contentId ? this.container.querySelector(`[data-tp-substep-visible="${contentId}"]`) : null;
                    const isConditionallyHidden = tab ? tab.classList.contains('hidden') : false;
                    el.classList.toggle('hidden', substepNum !== currentSubStep || isConditionallyHidden);
                });

                // Update sub-step tab styling using COMPUTED metadata from property system!
                const subStepTabs = this.container.querySelectorAll(`[data-tp-substep^="${stepNum}."]`);
                for (const tab of subStepTabs) {
                    const subStepId = tab.dataset.tpSubstepId;
                    const subStepNode = subStepId ? stepNode.child(subStepId) : null;

                    // Read computed values from property metadata (ALL is Property!)
                    const hasErrors = subStepNode ? await subStepNode.getMetadata('hasErrors') : false;
                    const isComplete = subStepNode ? await subStepNode.getMetadata('isComplete') : false;
                    const errorIcon = subStepNode ? await subStepNode.getMetadata('errorIcon') : null;

                    // Get or create status indicator for sub-step
                    let statusIndicator = tab.querySelector('.substep-status-indicator');
                    if (!statusIndicator) {
                        statusIndicator = document.createElement('span');
                        statusIndicator.className = 'substep-status-indicator ml-auto hidden';
                        tab.appendChild(statusIndicator);
                    }

                    // Get the number indicator to update its style
                    const numberIndicator = tab.querySelector('.substep-number');
                    const subStepValue = parseInt(tab.dataset.substepValue);
                    const isActive = subStepValue === currentSubStep;

                    // Remove old classes
                    tab.classList.remove(
                        'bg-blue-600/20', 'bg-green-600/20', 'bg-gray-700/30', 'bg-red-600/20',
                        'text-white', 'text-gray-400', 'text-red-400', 'text-green-400',
                        'border-blue-500', 'border-green-500', 'border-transparent', 'border-red-500/50',
                        'border-l-4', 'border-l-blue-500', 'border-l-green-500', 'border-l-transparent', 'border-l-red-500'
                    );

                    // Update number indicator style
                    if (numberIndicator) {
                        numberIndicator.classList.remove(
                            'bg-blue-500', 'bg-green-500', 'bg-gray-600/50', 'bg-red-500/50',
                            'text-white', 'text-gray-400'
                        );
                    }

                    // Apply styles based on computed state from Property system
                    if (isActive) {
                        // Active substep: blue
                        tab.classList.add('bg-blue-600/20', 'text-white', 'border-l-4', 'border-l-blue-500');
                        if (numberIndicator) numberIndicator.classList.add('bg-blue-500', 'text-white');
                        statusIndicator.classList.add('hidden');
                    } else if (isComplete) {
                        // Complete substep: green
                        tab.classList.add('bg-green-600/20', 'text-green-400', 'border-l-4', 'border-l-green-500');
                        if (numberIndicator) numberIndicator.classList.add('bg-green-500', 'text-white');
                        statusIndicator.textContent = '✓';
                        statusIndicator.className = 'substep-status-indicator ml-auto text-green-400';
                    } else if (hasErrors) {
                        // Error substep: red
                        tab.classList.add('bg-red-600/20', 'text-red-400', 'border-l-4', 'border-l-red-500');
                        if (numberIndicator) numberIndicator.classList.add('bg-red-500/50', 'text-white');
                        statusIndicator.textContent = errorIcon || '!';
                        statusIndicator.className = 'substep-status-indicator ml-auto text-red-400';
                    } else {
                        // Default substep: gray
                        tab.classList.add('bg-gray-700/30', 'text-gray-400', 'border-transparent');
                        if (numberIndicator) numberIndicator.classList.add('bg-gray-600/50', 'text-gray-400');
                        statusIndicator.classList.add('hidden');
                    }
                }
            }
        }

        // Update tab styles using computed CSS classes from property metadata
        for (const tab of this.container.querySelectorAll('[data-tp-tab]')) {
            const step = parseInt(tab.dataset.tpTab);
            const stepNode = this.root.child(`step${step}`);
            if (!stepNode) continue;

            // Read computed values from property metadata (ALL is Property!)
            const isActive = await stepNode.getMetadata('isActive');
            const isVisited = await stepNode.getMetadata('isVisited');
            const isComplete = await stepNode.getMetadata('isComplete');
            const hasErrors = await stepNode.getMetadata('hasErrors');
            const isClickable = await stepNode.getMetadata('isClickable');
            const errorIcon = await stepNode.getMetadata('errorIcon');

            // Get the step number indicator
            const numberIndicator = tab.querySelector('.step-number');

            // Get or create error/success indicator
            let statusIndicator = tab.querySelector('.step-status-indicator');
            if (!statusIndicator) {
                statusIndicator = document.createElement('span');
                statusIndicator.className = 'step-status-indicator ml-1 hidden';
                tab.appendChild(statusIndicator);
            }

            // Remove old dynamic classes
            tab.classList.remove(
                'bg-gradient-to-r', 'from-blue-600', 'to-purple-600',
                'bg-green-600/20', 'bg-red-600/20', 'bg-gray-700/50',
                'text-white', 'text-green-400', 'text-red-400', 'text-gray-400',
                'cursor-pointer', 'cursor-not-allowed', 'opacity-50',
                'border-blue-500', 'border-green-500', 'border-red-500', 'border-transparent',
                'shadow-lg', 'shadow-blue-500/25', 'shadow-green-500/25'
            );
            if (numberIndicator) {
                numberIndicator.classList.remove(
                    'bg-white', 'text-blue-600', 'bg-green-500', 'text-white',
                    'bg-red-500', 'bg-gray-600/50', 'text-gray-400'
                );
            }

            // Apply styles based on computed state from Property system
            if (isActive) {
                // Active step: blue gradient
                tab.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white', 'shadow-lg', 'shadow-blue-500/25', 'cursor-pointer');
                if (numberIndicator) numberIndicator.classList.add('bg-white', 'text-blue-600');
                statusIndicator.classList.add('hidden');
            } else if (isComplete) {
                // Complete step: green (visited AND valid)
                tab.classList.add('bg-green-600/20', 'text-green-400', 'border-green-500', 'cursor-pointer');
                if (numberIndicator) numberIndicator.classList.add('bg-green-500', 'text-white');
                statusIndicator.textContent = '✓';
                statusIndicator.className = 'step-status-indicator ml-1 text-green-400';
            } else if (hasErrors) {
                // Error step: red (visited but NOT valid)
                tab.classList.add('bg-red-600/20', 'text-red-400', 'border-red-500');
                if (isClickable) {
                    tab.classList.add('cursor-pointer');
                } else {
                    tab.classList.add('cursor-not-allowed', 'opacity-50');
                }
                if (numberIndicator) numberIndicator.classList.add('bg-red-500', 'text-white');
                statusIndicator.textContent = errorIcon || '!';
                statusIndicator.className = 'step-status-indicator ml-1 text-red-400';
            } else {
                // Unvisited step: gray
                tab.classList.add('bg-gray-700/50', 'text-gray-400', 'border-transparent');
                if (isClickable) {
                    tab.classList.add('cursor-pointer');
                } else {
                    tab.classList.add('cursor-not-allowed', 'opacity-50');
                }
                if (numberIndicator) numberIndicator.classList.add('bg-gray-600/50', 'text-gray-400');
                statusIndicator.classList.add('hidden');
            }

            // Disable click if not clickable
            tab.disabled = !isClickable;
        }

        // Update progress label (for language changes)
        const progressLabelEl = this.container.querySelector('#progress-label');
        if (progressLabelEl) progressLabelEl.textContent = progressLabel;

        // Update navigation buttons - ALL state comes from properties!
        const prevBtn = this.container.querySelector('#btn-prev');
        const nextBtn = this.container.querySelector('#btn-next');

        // Previous button text and disabled state from properties
        if (prevBtn) {
            prevBtn.disabled = prevButtonDisabled;
            prevBtn.innerHTML = prevButtonText;
        }

        // Next button text and gradient from properties
        if (nextBtn) {
            nextBtn.innerHTML = nextButtonText;
            nextBtn.disabled = nextButtonDisabled;

            // Remove all gradient classes first
            nextBtn.classList.remove(
                'from-green-600', 'to-emerald-600', 'hover:from-green-500', 'hover:to-emerald-500', 'shadow-green-500/25',
                'from-blue-600', 'to-purple-600', 'hover:from-blue-500', 'hover:to-purple-500', 'shadow-blue-500/25',
                'from-orange-600', 'to-amber-600', 'opacity-60', 'cursor-not-allowed', 'shadow-orange-500/25'
            );

            // Apply gradient classes from property
            if (nextButtonGradient) {
                nextButtonGradient.split(' ').forEach(c => nextBtn.classList.add(c));
            }
        }

        // Update estimated total display
        const totalEl = this.container.querySelector('#estimated-total');
        if (totalEl) {
            totalEl.textContent = '$' + estimatedTotal.toLocaleString();
        }

        // Update errors from constraint validation (BEST PRACTICE!)
        for (const el of this.container.querySelectorAll('[data-tp-error]')) {
            const path = el.dataset.tpError;
            const node = this.getNodeByPath(path);
            if (!node) continue;

            // Check if field is visible (don't show errors for hidden fields)
            const isVisible = await node.getMetadata('visible');
            if (isVisible === false) {
                el.classList.add('hidden');
                continue;
            }

            // Validate constraints and get first error message
            // validate() returns { valid: boolean, errors: Record<string, string> }
            const validationResult = await node.validate();
            const errorMessages = Object.values(validationResult.errors || {});
            if (!validationResult.valid && errorMessages.length > 0) {
                el.textContent = errorMessages[0];
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }

        // Update hints
        for (const el of this.container.querySelectorAll('[data-tp-hint]')) {
            const path = el.dataset.tpHint;
            const node = this.getNodeByPath(path);
            if (!node) continue;
            const hint = await node.getMetadata('dynamicHint') || '';
            if (hint) {
                el.textContent = hint;
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }

        // Update warnings from computed metadata (CROSS-STEP CONSTRAINTS!)
        for (const el of this.container.querySelectorAll('[data-tp-warning]')) {
            const path = el.dataset.tpWarning;
            const node = this.getNodeByPath(path);
            if (!node) continue;
            // Get computed warning from metadata
            const warning = await node.getMetadata('warning');
            if (warning && warning !== '') {
                el.textContent = '⚠️ ' + warning;
                el.classList.remove('hidden');
            } else {
                el.textContent = '';
                el.classList.add('hidden');
            }
        }

        // Update range values and track colors
        for (const el of this.container.querySelectorAll('[data-tp-range-value]')) {
            const path = el.dataset.tpRangeValue;
            const node = this.getNodeByPath(path);
            if (!node) continue;
            const value = await this.root.getValue(path.split('.'));
            const prefix = await node.getMetadata('prefix') || '';
            const suffix = await node.getMetadata('suffix') || '';
            el.textContent = `${prefix}${value}${suffix}`;
        }

        // Update range slider track colors
        for (const slider of this.container.querySelectorAll('.range-slider')) {
            // Remove old track classes and add new ones
            slider.classList.remove('bg-gray-600', 'bg-gray-300');
            const trackClass = this.theme.rangeTrack || 'bg-gray-600';
            trackClass.split(' ').forEach(cls => slider.classList.add(cls));
        }

        // Update checkbox boxes - use CSS 'checked' class for styling via CSS variables
        for (const box of this.container.querySelectorAll('[data-tp-checkbox-box]')) {
            const path = box.dataset.tpCheckboxBox;
            const input = this.container.querySelector(`[data-tp-checkbox="${path}"]`);
            const check = this.container.querySelector(`[data-tp-checkbox-check="${path}"]`);

            if (input && input.checked) {
                box.classList.add('checked');
                if (check) check.classList.remove('hidden');
            } else {
                box.classList.remove('checked');
                if (check) check.classList.add('hidden');
            }
        }

        // Update toggle tracks - use CSS 'checked' class for styling via CSS variables
        for (const track of this.container.querySelectorAll('[data-tp-toggle-track]')) {
            const path = track.dataset.tpToggleTrack;
            const input = this.container.querySelector(`[data-tp-toggle="${path}"]`);

            if (input && input.checked) {
                track.classList.add('checked');
            } else {
                track.classList.remove('checked');
            }
        }

        // Update ratings - toggle 'active' class (styling via CSS variables)
        for (const container of this.container.querySelectorAll('[data-tp-rating]')) {
            const path = container.dataset.tpRating;
            const value = await this.root.getValue(path.split('.')) || 0;
            container.querySelectorAll('.star').forEach((star, i) => {
                star.classList.toggle('active', i < value);
            });
            const text = container.querySelector(`[data-tp-rating-text="${path}"]`);
            if (text) text.textContent = `${value}/${container.dataset.max}`;
        }

        // Update color values
        for (const el of this.container.querySelectorAll('[data-tp-color-value]')) {
            const path = el.dataset.tpColorValue;
            const value = await this.root.getValue(path.split('.'));
            el.textContent = value || '#3b82f6';
        }

        // Update character counts
        for (const el of this.container.querySelectorAll('[data-tp-charcount]')) {
            const path = el.dataset.tpCharcount;
            const value = await this.root.getValue(path.split('.')) || '';
            el.textContent = value.length;
        }

        // Update tags lists - use theme values for tag styling
        for (const list of this.container.querySelectorAll('[data-tp-tags-list]')) {
            const path = list.dataset.tpTagsList;
            const tags = await this.root.getValue(path.split('.')) || [];
            list.innerHTML = tags.map(tag => `
                <span class="tag px-3 py-1 ${this.theme.accentBgLight || 'bg-blue-500/10'} ${this.theme.textAccent || 'text-blue-400'} rounded-full text-sm flex items-center gap-1">
                    ${tag}<button class="tag-remove hover:${this.theme.errorText || 'text-red-400'}" data-tag="${tag}">&#215;</button>
                </span>
            `).join('');
        }

        // Update computed values - use reactive getValue to ensure proper cache invalidation
        for (const el of this.container.querySelectorAll('[data-tp-computed]')) {
            const path = el.dataset.tpComputed;
            const node = this.getNodeByPath(path);
            if (!node) continue;
            // Get the computed value from property system
            const computedValue = await this.root.getValue(path.split('.'));
            // Then get the displayFormat to format it
            const displayFormat = await node.getMetadata('displayFormat');
            el.textContent = displayFormat || computedValue || '';
        }

        // Update field visibility based on 'visible' metadata
        for (const el of this.container.querySelectorAll('[data-tp-visible]')) {
            const path = el.dataset.tpVisible;
            const node = this.getNodeByPath(path);
            if (!node) continue;
            const visible = await node.getMetadata('visible');
            // Only hide if visible is explicitly false (undefined means visible)
            el.classList.toggle('hidden', visible === false);
        }

        // Update multiselect checkboxes using classes from property metadata
        const multiselectPaths = new Set();
        for (const cb of this.container.querySelectorAll('[data-tp-multiselect]')) {
            multiselectPaths.add(cb.dataset.tpMultiselect);
        }
        for (const path of multiselectPaths) {
            const node = this.getNodeByPath(path);
            if (!node) continue;

            // Read values and classes from property system
            const values = await this.root.getValue(path.split('.')) || [];
            const selectedLabelClass = await node.getMetadata('selectedLabelClass') || 'border-blue-500';
            const unselectedLabelClass = await node.getMetadata('unselectedLabelClass') || 'border-transparent';
            const selectedBoxClass = await node.getMetadata('selectedBoxClass') || 'bg-blue-500 border-blue-500';
            const unselectedBoxClass = await node.getMetadata('unselectedBoxClass') || this.theme.checkboxBorder || 'border-gray-500';
            const checkIcon = await node.getMetadata('checkIcon') || '';

            const checkboxes = this.container.querySelectorAll(`[data-tp-multiselect="${path}"]`);
            for (const cb of checkboxes) {
                const isSelected = values.includes(cb.value);
                cb.checked = isSelected;
                const label = cb.closest('label');
                if (label) {
                    // Apply classes from metadata
                    selectedLabelClass.split(' ').forEach(c => label.classList.toggle(c, isSelected));
                    unselectedLabelClass.split(' ').forEach(c => label.classList.toggle(c, !isSelected));
                    const visualBox = label.querySelector('div.rounded');
                    if (visualBox) {
                        selectedBoxClass.split(' ').forEach(c => visualBox.classList.toggle(c, isSelected));
                        unselectedBoxClass.split(' ').forEach(c => visualBox.classList.toggle(c, !isSelected));
                        visualBox.innerHTML = isSelected ? checkIcon : '';
                    }
                }
            }
        }

        // Update form data display (if the element exists)
        const formDataEl = document.getElementById('form-data');
        if (formDataEl) {
            // snapshot() returns evaluated values as key-value pairs
            const data = await this.root.snapshot();
            formDataEl.textContent = JSON.stringify(data, null, 2);
        }
    }

    getNodeByPath(path) {
        const parts = path.split('.');
        let node = this.root;
        for (const part of parts) {
            node = node?.child(part);
            if (!node) break;
        }
        return node;
    }
}
