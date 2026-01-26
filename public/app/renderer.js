// ============================================================================
// APP RENDERER - Renders full application from Properties (All is Property)
// ============================================================================
// The renderer reads the app Property and renders the entire UI.
// Header, panels, overlay, content - all rendered from Property definitions.
//
// Following "All is Property" - ONE tree, ONE PropertyNode.
// The wizard is embedded as app.children.wizard, not a separate PropertyNode.

import { PropertyNode, lit } from '.././dist/index.js';
import { TuringWizard } from '../features/event-planning/renderer.js';
import { registry, setAppRoot } from '../common/registry.js';

// ============================================================================
// TURING APP CLASS
// ============================================================================

export class TuringApp {
    constructor(appNode, container) {
        this.root = appNode;
        this.container = container;
        this.wizardInstance = null;
        // No separate wizardNode - wizard is part of the app tree (All is Property)
    }

    async mount() {
        setAppRoot(this.root); // Set app root for panel operators

        await this.renderApp();
        this.attachBindings();

        // Subscribe to reactive changes for panels/overlay
        this.root.subscribe(async () => {
            await this.updateAppUI();
        });

        await this.updateAppUI();
        console.log('App initialized. All is Property!');
    }

    async renderApp() {
        const header = this.root.child('header');
        const main = this.root.child('main');
        const schemaPanel = this.root.child('schemaPanel');
        const dataPanel = this.root.child('dataPanel');
        const overlay = this.root.child('overlay');

        // Render Header
        const headerHtml = await this.renderHeader(header);

        // Render Main Content Area (with wizard placeholder)
        const mainHtml = await this.renderMain(main);

        // Render Panels
        const schemaPanelHtml = await this.renderPanel(schemaPanel, 'schema');
        const dataPanelHtml = await this.renderPanel(dataPanel, 'data');

        // Render Overlay
        const overlayHtml = await this.renderOverlay(overlay);

        this.container.innerHTML = `
            ${headerHtml}
            ${mainHtml}
            ${schemaPanelHtml}
            ${dataPanelHtml}
            ${overlayHtml}
        `;

        // Mount the wizard from the app tree - ONE tree (All is Property)
        // The wizard is embedded as app.children.wizard
        const wizardContainer = this.container.querySelector('#wizard-container');
        if (wizardContainer) {
            // Get the wizard as a child of the app - it's part of the same tree!
            const wizardNode = this.root.child('wizard');
            if (wizardNode) {
                this.wizardInstance = new TuringWizard(wizardNode, wizardContainer);
                await this.wizardInstance.mount();
            }
        }
    }

    async renderHeader(headerNode) {
        if (!headerNode) return '';

        const cssClass = await headerNode.getMetadata('cssClass') || '';
        const branding = headerNode.child('branding');
        const nav = headerNode.child('nav');

        // Branding
        const logoText = branding ? await branding.getMetadata('logoText') : 'T';
        const logoGradient = branding ? await branding.getMetadata('logoGradient') : '';
        const titleNode = branding?.child('title');
        const subtitleNode = branding?.child('subtitle');
        const title = titleNode?.getRawValue() || 'App';
        const titleCss = titleNode ? await titleNode.getMetadata('cssClass') : '';
        const subtitle = subtitleNode?.getRawValue() || '';
        const subtitleCss = subtitleNode ? await subtitleNode.getMetadata('cssClass') : '';

        // Nav buttons
        let navButtonsHtml = '';
        if (nav) {
            for (const id of nav.childKeys()) {
                const btnNode = nav.child(id);
                if (!btnNode) continue;
                const label = await btnNode.getMetadata('label') || id;
                const btnCss = await btnNode.getMetadata('cssClass') || '';
                navButtonsHtml += `
                    <button data-tp-action="${id}" class="${btnCss}">${label}</button>
                `;
            }
        }

        return `
            <header class="${cssClass}">
                <div class="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${logoGradient} rounded-lg flex items-center justify-center text-xl">${logoText}</div>
                        <div>
                            <h1 class="${titleCss}">${title}</h1>
                            ${subtitle ? `<p class="${subtitleCss}">${subtitle}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${navButtonsHtml}
                    </div>
                </div>
            </header>
        `;
    }

    async renderMain(mainNode) {
        if (!mainNode) return '';

        const cssClass = await mainNode.getMetadata('cssClass') || '';
        const content = mainNode.child('content');
        const footer = mainNode.child('footer');

        const contentCss = content ? await content.getMetadata('cssClass') : '';
        const footerCss = footer ? await footer.getMetadata('cssClass') : '';
        const footerText = footer?.child('text')?.value || '';

        return `
            <main class="${cssClass}">
                <div class="${contentCss}">
                    <div id="wizard-container">
                        <div class="text-center py-12 text-gray-400">Loading wizard...</div>
                    </div>
                </div>
                ${footer ? `
                    <div class="${footerCss}">
                        <p>${footerText}</p>
                    </div>
                ` : ''}
            </main>
        `;
    }

    async renderPanel(panelNode, panelType) {
        if (!panelNode) return '';

        const title = await panelNode.getMetadata('title') || 'Panel';
        const titleColor = await panelNode.getMetadata('titleColor') || 'text-white';
        const position = await panelNode.getMetadata('position') || 'left';
        const isOpen = await panelNode.getValue(['isOpen']) || false;

        const closeBtn = panelNode.child('closeButton');
        const closeBtnCss = closeBtn ? await closeBtn.getMetadata('cssClass') : '';
        const closeBtnLabel = closeBtn ? await closeBtn.getMetadata('label') : 'X';

        const codeNode = panelNode.child('code');
        const codeCss = codeNode ? await codeNode.getMetadata('cssClass') : '';

        // Build CSS class based on open state
        const baseCss = `fixed inset-y-0 ${position === 'left' ? 'left-0 border-r' : 'right-0 border-l'} w-full sm:w-[500px] bg-gray-900 border-gray-700 transform transition-transform duration-300 z-50 flex flex-col`;
        const transformCss = isOpen
            ? 'translate-x-0'
            : position === 'left' ? '-translate-x-full' : 'translate-x-full';

        return `
            <div id="panel-${panelType}" data-tp-panel="${panelNode.id}" class="${baseCss} ${transformCss}">
                <div class="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 class="text-lg font-semibold ${titleColor}">${title}</h2>
                    <button data-tp-close-panel="${panelNode.id}" class="${closeBtnCss}">${closeBtnLabel}</button>
                </div>
                <pre id="${panelType}-json" data-tp-code="${panelNode.id}" class="${codeCss}"></pre>
            </div>
        `;
    }

    async renderOverlay(overlayNode) {
        if (!overlayNode) return '';

        const visible = await overlayNode.getValue(['visible']) || false;
        const baseCss = 'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40';
        const visibilityCss = visible ? 'opacity-100' : 'opacity-0 pointer-events-none';

        return `
            <div id="overlay" data-tp-overlay class="${baseCss} ${visibilityCss}"></div>
        `;
    }

    attachBindings() {
        // Header button actions
        this.container.querySelectorAll('[data-tp-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const actionId = btn.dataset.tpAction;
                if (actionId === 'schemaButton') {
                    await registry.get('ui.openPanel')([lit('schemaPanel')], {});
                    await this.updateSchemaCode();
                } else if (actionId === 'dataButton') {
                    await registry.get('ui.openPanel')([lit('dataPanel')], {});
                    await this.updateDataCode();
                } else if (actionId === 'themeButton') {
                    // Toggle theme - operator handles state change
                    await registry.get('ui.toggleTheme')([], {});
                    // Re-render wizard with new theme values
                    await this.reRenderWizard();
                } else if (actionId === 'languageButton') {
                    // Toggle language - get current and switch
                    const currentLocale = await this.root.getValue(['i18n', 'currentLocale']) || 'en';
                    const newLocale = currentLocale === 'en' ? 'fr' : 'en';
                    await registry.get('ui.setLocale')([lit(newLocale)], {});
                    // Re-render wizard with new translations
                    await this.reRenderWizard();
                }
            });
        });

        // Panel close buttons
        this.container.querySelectorAll('[data-tp-close-panel]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const panelId = btn.dataset.tpClosePanel;
                await registry.get('ui.closePanel')([lit(panelId)], {});
            });
        });

        // Overlay click to close
        const overlay = this.container.querySelector('[data-tp-overlay]');
        if (overlay) {
            overlay.addEventListener('click', async () => {
                await registry.get('ui.closePanels')([], {});
            });
        }

        // Subscribe to wizard changes to update data panel
        // Wizard is part of the app tree, so we subscribe to it through root
        const wizardNode = this.root.child('wizard');
        if (wizardNode) {
            wizardNode.subscribe(async () => {
                const dataPanelOpen = await this.root.getValue(['dataPanel', 'isOpen']);
                if (dataPanelOpen) {
                    await this.updateDataCode();
                }
            });
        }
    }

    async updateSchemaCode() {
        const wizardNode = this.root.child('wizard');
        if (!wizardNode) return;

        const schemaEl = this.container.querySelector('#schema-json');
        if (schemaEl) {
            // Use PropertyNode.toJSON() and JSON.stringify() for serialization
            schemaEl.textContent = JSON.stringify(wizardNode.toJSON(), null, 2);
        }
    }

    async updateDataCode() {
        const wizardNode = this.root.child('wizard');
        if (!wizardNode) return;

        const dataEl = this.container.querySelector('#data-json');
        if (dataEl) {
            // snapshot() returns evaluated values as key-value pairs (not schema)
            const data = await wizardNode.snapshot();
            dataEl.textContent = JSON.stringify(data, null, 2);
        }
    }

    async updateAppUI() {
        // ========== THEME (apply first for consistent rendering) ==========
        // Get current theme - default to 'dark' if not set
        const currentTheme = await this.root.getValue(['theme', 'current']) || 'dark';

        // Update panel visibility
        const schemaPanelOpen = await this.root.getValue(['schemaPanel', 'isOpen']) || false;
        const dataPanelOpen = await this.root.getValue(['dataPanel', 'isOpen']) || false;
        const overlayVisible = await this.root.getValue(['overlay', 'visible']) || false;

        // Schema Panel
        const schemaPanel = this.container.querySelector('#panel-schema');
        if (schemaPanel) {
            schemaPanel.classList.remove('-translate-x-full', 'translate-x-0');
            schemaPanel.classList.add(schemaPanelOpen ? 'translate-x-0' : '-translate-x-full');
        }

        // Data Panel
        const dataPanel = this.container.querySelector('#panel-data');
        if (dataPanel) {
            dataPanel.classList.remove('translate-x-full', 'translate-x-0');
            dataPanel.classList.add(dataPanelOpen ? 'translate-x-0' : 'translate-x-full');
        }

        // Overlay
        const overlay = this.container.querySelector('#overlay');
        if (overlay) {
            overlay.classList.remove('opacity-0', 'opacity-100', 'pointer-events-none');
            if (overlayVisible) {
                overlay.classList.add('opacity-100');
            } else {
                overlay.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        // ========== THEME CSS VARIABLES ==========
        // Note: currentTheme is already set at the top of this method

        // Update CSS custom properties from theme (for range, rating, toggle, checkbox)
        const cssVars = {
            rangeTrack: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'rangeTrack']),
            rangeThumb: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'rangeThumb']),
            ratingInactive: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'ratingInactive']),
            ratingActive: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'ratingActive']),
            ratingHover: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'ratingHover']),
            toggleTrack: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'toggleTrack']),
            toggleTrackChecked: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'toggleTrackChecked']),
            checkboxBg: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'checkboxBg']),
            checkboxBorder: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'checkboxBorder']),
            checkboxChecked: await this.root.getValue(['theme', 'configs', currentTheme, 'cssVars', 'checkboxChecked'])
        };

        // Set CSS variables on document root
        const root = document.documentElement;
        if (cssVars.rangeTrack) root.style.setProperty('--range-track', cssVars.rangeTrack);
        if (cssVars.rangeThumb) root.style.setProperty('--range-thumb', cssVars.rangeThumb);
        if (cssVars.ratingInactive) root.style.setProperty('--rating-inactive', cssVars.ratingInactive);
        if (cssVars.ratingActive) root.style.setProperty('--rating-active', cssVars.ratingActive);
        if (cssVars.ratingHover) root.style.setProperty('--rating-hover', cssVars.ratingHover);
        if (cssVars.toggleTrack) root.style.setProperty('--toggle-track', cssVars.toggleTrack);
        if (cssVars.toggleTrackChecked) root.style.setProperty('--toggle-track-checked', cssVars.toggleTrackChecked);
        if (cssVars.checkboxBg) root.style.setProperty('--checkbox-bg', cssVars.checkboxBg);
        if (cssVars.checkboxBorder) root.style.setProperty('--checkbox-border', cssVars.checkboxBorder);
        if (cssVars.checkboxChecked) root.style.setProperty('--checkbox-checked', cssVars.checkboxChecked);

        // Update body background based on theme
        const bodyBg = await this.root.getValue(['theme', 'configs', currentTheme, 'bg', 'body']);
        if (bodyBg) {
            // Remove old theme classes and add new ones
            document.body.className = document.body.className
                .replace(/bg-gradient-to-br\s+from-\S+\s+via-\S+\s+to-\S+/g, '')
                .trim();
            bodyBg.split(' ').forEach(cls => document.body.classList.add(cls));
        }

        // Update text color based on theme
        const textPrimary = await this.root.getValue(['theme', 'configs', currentTheme, 'text', 'primary']);
        if (textPrimary) {
            document.body.classList.remove('text-gray-100', 'text-gray-900');
            document.body.classList.add(textPrimary.replace('text-', 'text-'));
        }

        // Update theme button label
        const themeButton = this.container.querySelector('[data-tp-action="themeButton"]');
        if (themeButton) {
            themeButton.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
            themeButton.title = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        }

        // ========== I18N ==========
        const currentLocale = await this.root.getValue(['i18n', 'currentLocale']) || 'en';

        // Update language button label
        const langButton = this.container.querySelector('[data-tp-action="languageButton"]');
        if (langButton) {
            langButton.textContent = currentLocale === 'en' ? '🇺🇸 EN' : '🇫🇷 FR';
            langButton.title = currentLocale === 'en' ? 'Switch to French' : 'Switch to English';
        }

        // Update header title/subtitle from i18n
        const headerTitle = this.container.querySelector('header h1');
        const headerSubtitle = this.container.querySelector('header h1 + p');
        if (headerTitle) {
            const title = await this.root.getValue(['i18n', 'locales', currentLocale, 'app', 'title']);
            if (title) headerTitle.textContent = title;
        }
        if (headerSubtitle) {
            const subtitle = await this.root.getValue(['i18n', 'locales', currentLocale, 'app', 'subtitle']);
            if (subtitle) headerSubtitle.textContent = subtitle;
        }

        // Update footer text from i18n
        const footerText = this.container.querySelector('main > div:last-child p');
        if (footerText) {
            const text = await this.root.getValue(['i18n', 'locales', currentLocale, 'footer', 'text']);
            if (text) footerText.textContent = text;
        }

        // Update panel titles from i18n
        const schemaPanelTitle = this.container.querySelector('#panel-schema h2');
        if (schemaPanelTitle) {
            const title = await this.root.getValue(['i18n', 'locales', currentLocale, 'panel', 'schemaTitle']);
            if (title) schemaPanelTitle.textContent = title;
        }
        const dataPanelTitle = this.container.querySelector('#panel-data h2');
        if (dataPanelTitle) {
            const title = await this.root.getValue(['i18n', 'locales', currentLocale, 'panel', 'dataTitle']);
            if (title) dataPanelTitle.textContent = title;
        }

        // Apply theme to panels
        const panels = this.container.querySelectorAll('[data-tp-panel]');
        const panelBg = await this.root.getValue(['theme', 'configs', currentTheme, 'panel', 'bg']);
        const panelBorder = await this.root.getValue(['theme', 'configs', currentTheme, 'panel', 'border']);
        panels.forEach(panel => {
            if (panelBg) {
                panel.classList.remove('bg-gray-900', 'bg-white');
                panelBg.split(' ').forEach(cls => panel.classList.add(cls));
            }
            if (panelBorder) {
                panel.classList.remove('border-gray-700', 'border-gray-200');
                panelBorder.split(' ').forEach(cls => panel.classList.add(cls));
            }
        });

        // Apply theme to overlay
        const overlayBg = await this.root.getValue(['theme', 'configs', currentTheme, 'bg', 'overlay']);
        if (overlay && overlayBg) {
            overlay.classList.remove('bg-black/50', 'bg-black/30');
            overlayBg.split(' ').forEach(cls => overlay.classList.add(cls));
        }

        // Apply theme to header
        const header = this.container.querySelector('header');
        const headerBg = await this.root.getValue(['theme', 'configs', currentTheme, 'header', 'bg']);
        const headerBorder = await this.root.getValue(['theme', 'configs', currentTheme, 'header', 'border']);
        if (header) {
            if (headerBg) {
                header.classList.remove('bg-gray-900/80', 'bg-white/80');
                headerBg.split(' ').forEach(cls => header.classList.add(cls));
            }
            if (headerBorder) {
                header.classList.remove('border-gray-700/50', 'border-gray-200');
                headerBorder.split(' ').forEach(cls => header.classList.add(cls));
            }
        }

        // Apply theme to header title
        const textPrimaryClass = await this.root.getValue(['theme', 'configs', currentTheme, 'text', 'primary']);
        const textMutedClass = await this.root.getValue(['theme', 'configs', currentTheme, 'text', 'muted']);
        if (headerTitle && textPrimaryClass) {
            headerTitle.classList.remove('text-white', 'text-gray-900', 'text-gray-100');
            textPrimaryClass.split(' ').forEach(cls => headerTitle.classList.add(cls));
        }
        if (headerSubtitle && textMutedClass) {
            headerSubtitle.classList.remove('text-gray-400', 'text-gray-500', 'text-gray-600');
            textMutedClass.split(' ').forEach(cls => headerSubtitle.classList.add(cls));
        }

        // Apply theme to main content card
        const contentCard = this.container.querySelector('main > div:first-child');
        const cardBg = await this.root.getValue(['theme', 'configs', currentTheme, 'card', 'bg']);
        const cardBorder = await this.root.getValue(['theme', 'configs', currentTheme, 'card', 'border']);
        if (contentCard) {
            if (cardBg) {
                contentCard.classList.remove('bg-gray-800/50', 'bg-white');
                cardBg.split(' ').forEach(cls => contentCard.classList.add(cls));
            }
            if (cardBorder) {
                contentCard.classList.remove('border-gray-700/50', 'border-gray-200');
                cardBorder.split(' ').forEach(cls => contentCard.classList.add(cls));
            }
        }
    }

    async reRenderWizard() {
        if (!this.wizardInstance) return;

        // Get the wizard container
        const wizardContainer = this.container.querySelector('#wizard-container');
        if (!wizardContainer) return;

        // Re-render the wizard (this will use the new locale for translations)
        // The PropertyNode already has the form state, so we just need to re-render the UI
        await this.wizardInstance.renderWizard();
        this.wizardInstance.attachBindings();
        await this.wizardInstance.updateUI();
    }
}
