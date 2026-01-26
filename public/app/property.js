// ============================================================================
// APP PROPERTY - Full Application as Property (All is Property)
// ============================================================================
// The entire application is a Property. Header, panels, overlay, content -
// everything is a Property with proper types, metadata, and children.

import { lit, ref, op } from '.././dist/index.js';

import {
    STRING, BOOLEAN,
    APP as UI_APP, HEADER as UI_HEADER, BRANDING as UI_BRANDING, NAV as UI_NAV,
    PANEL as UI_PANEL, BUTTON as UI_BUTTON, OVERLAY as UI_OVERLAY,
    MAIN as UI_MAIN, FOOTER as UI_FOOTER, CODE as UI_CODE
} from '../common/types.js';

// Import i18n and theme Properties
import { i18nProperty } from '../i18n/index.js';
import { themeProperty } from '../theme/index.js';

// Import the wizard - embedded as a child of the app (All is Property - ONE tree)
import { eventWizard } from '../features/event-planning/property.js';

// ============================================================================
// THE APPLICATION PROPERTY
// ============================================================================

export const appProperty = {
    id: 'app',
    type: UI_APP,
    metadata: {
        title: { id: 'title', type: STRING, value: 'Turing Property Demo' },
        theme: { id: 'theme', type: STRING, value: 'dark' }
    },
    children: {
        // ========== HEADER ==========
        header: {
            id: 'header',
            type: UI_HEADER,
            metadata: {
                sticky: { id: 'sticky', type: BOOLEAN, value: true },
                cssClass: { id: 'cssClass', type: STRING, value: 'border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50' }
            },
            children: {
                branding: {
                    id: 'branding',
                    type: UI_BRANDING,
                    metadata: {
                        logoText: { id: 'logoText', type: STRING, value: 'T' },
                        logoGradient: { id: 'logoGradient', type: STRING, value: 'bg-gradient-to-br from-blue-500 to-purple-600' }
                    },
                    children: {
                        title: {
                            id: 'title',
                            type: STRING,
                            value: 'Event Planning Wizard',
                            metadata: {
                                cssClass: { id: 'cssClass', type: STRING, value: 'text-xl font-bold text-white' }
                            }
                        },
                        subtitle: {
                            id: 'subtitle',
                            type: STRING,
                            value: 'Powered by Turing Property - All is Property',
                            metadata: {
                                cssClass: { id: 'cssClass', type: STRING, value: 'text-xs text-gray-400' }
                            }
                        }
                    }
                },
                nav: {
                    id: 'nav',
                    type: UI_NAV,
                    children: {
                        schemaButton: {
                            id: 'schemaButton',
                            type: UI_BUTTON,
                            value: op('ui.openPanel', lit('schemaPanel')),
                            metadata: {
                                label: { id: 'label', type: STRING, value: 'Schema' },
                                icon: { id: 'icon', type: STRING, value: '{ }' },
                                variant: { id: 'variant', type: STRING, value: 'ghost' },
                                cssClass: { id: 'cssClass', type: STRING, value: 'px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 border border-gray-600/50' }
                            }
                        },
                        dataButton: {
                            id: 'dataButton',
                            type: UI_BUTTON,
                            value: op('ui.openPanel', lit('dataPanel')),
                            metadata: {
                                label: { id: 'label', type: STRING, value: 'Live Data' },
                                icon: { id: 'icon', type: STRING, value: '{ }' },
                                variant: { id: 'variant', type: STRING, value: 'ghost' },
                                cssClass: { id: 'cssClass', type: STRING, value: 'px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 border border-gray-600/50' }
                            }
                        },
                        // Theme toggle button
                        themeButton: {
                            id: 'themeButton',
                            type: UI_BUTTON,
                            value: op('ui.toggleTheme'),
                            metadata: {
                                label: {
                                    id: 'label',
                                    type: STRING,
                                    // Dynamic label based on current theme
                                    value: op('if',
                                        op('eq', ref(['root', 'theme', 'current', 'value']), lit('dark')),
                                        lit('☀️'),
                                        lit('🌙')
                                    )
                                },
                                variant: { id: 'variant', type: STRING, value: 'ghost' },
                                cssClass: { id: 'cssClass', type: STRING, value: 'px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all border border-gray-600/50' },
                                title: { id: 'title', type: STRING, value: 'Toggle theme' }
                            }
                        },
                        // Language selector button
                        languageButton: {
                            id: 'languageButton',
                            type: UI_BUTTON,
                            value: op('ui.setLocale',
                                op('if',
                                    op('eq', ref(['root', 'i18n', 'currentLocale', 'value']), lit('en')),
                                    lit('fr'),
                                    lit('en')
                                )
                            ),
                            metadata: {
                                label: {
                                    id: 'label',
                                    type: STRING,
                                    // Dynamic label showing current locale flag
                                    value: op('if',
                                        op('eq', ref(['root', 'i18n', 'currentLocale', 'value']), lit('en')),
                                        lit('🇺🇸 EN'),
                                        lit('🇫🇷 FR')
                                    )
                                },
                                variant: { id: 'variant', type: STRING, value: 'ghost' },
                                cssClass: { id: 'cssClass', type: STRING, value: 'px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all border border-gray-600/50' },
                                title: { id: 'title', type: STRING, value: 'Change language' }
                            }
                        }
                    }
                }
            }
        },

        // ========== MAIN CONTENT ==========
        main: {
            id: 'main',
            type: UI_MAIN,
            metadata: {
                cssClass: { id: 'cssClass', type: STRING, value: 'container mx-auto px-4 py-8 max-w-4xl' }
            },
            children: {
                content: {
                    id: 'content',
                    type: UI_MAIN,
                    metadata: {
                        cssClass: { id: 'cssClass', type: STRING, value: 'bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50' },
                        // Wizard is mounted separately as its own PropertyNode
                        // This preserves the wizard's ref() paths which expect to be root
                        wizardMountPoint: { id: 'wizardMountPoint', type: BOOLEAN, value: true }
                    }
                },
                footer: {
                    id: 'footer',
                    type: UI_FOOTER,
                    metadata: {
                        cssClass: { id: 'cssClass', type: STRING, value: 'mt-6 text-center text-xs text-gray-500' }
                    },
                    children: {
                        text: {
                            id: 'text',
                            type: STRING,
                            value: 'All form state managed by reactive Turing Property system'
                        }
                    }
                }
            }
        },

        // ========== SCHEMA PANEL ==========
        schemaPanel: {
            id: 'schemaPanel',
            type: UI_PANEL,
            metadata: {
                title: { id: 'title', type: STRING, value: 'Property Schema' },
                titleColor: { id: 'titleColor', type: STRING, value: 'text-blue-400' },
                position: { id: 'position', type: STRING, value: 'left' },
                width: { id: 'width', type: STRING, value: 'w-full sm:w-[500px]' },
                cssClass: {
                    id: 'cssClass',
                    type: STRING,
                    value: op('if',
                        ref(['self', 'isOpen', 'value']),
                        lit('fixed inset-y-0 left-0 w-full sm:w-[500px] bg-gray-900 border-r border-gray-700 transform translate-x-0 transition-transform duration-300 z-50 flex flex-col'),
                        lit('fixed inset-y-0 left-0 w-full sm:w-[500px] bg-gray-900 border-r border-gray-700 transform -translate-x-full transition-transform duration-300 z-50 flex flex-col')
                    )
                }
            },
            children: {
                isOpen: {
                    id: 'isOpen',
                    type: BOOLEAN,
                    value: false
                },
                closeButton: {
                    id: 'closeButton',
                    type: UI_BUTTON,
                    value: op('ui.closePanel', lit('schemaPanel')),
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'X' },
                        cssClass: { id: 'cssClass', type: STRING, value: 'p-2 hover:bg-gray-700 rounded-lg transition-colors' }
                    }
                },
                code: {
                    id: 'code',
                    type: UI_CODE,
                    value: '', // Will be populated dynamically
                    metadata: {
                        format: { id: 'format', type: STRING, value: 'json' },
                        cssClass: { id: 'cssClass', type: STRING, value: 'flex-1 text-xs bg-gray-950 p-4 overflow-auto text-green-400 font-mono' }
                    }
                }
            }
        },

        // ========== DATA PANEL ==========
        dataPanel: {
            id: 'dataPanel',
            type: UI_PANEL,
            metadata: {
                title: { id: 'title', type: STRING, value: 'Live Form Data' },
                titleColor: { id: 'titleColor', type: STRING, value: 'text-yellow-400' },
                position: { id: 'position', type: STRING, value: 'right' },
                width: { id: 'width', type: STRING, value: 'w-full sm:w-[500px]' },
                cssClass: {
                    id: 'cssClass',
                    type: STRING,
                    value: op('if',
                        ref(['self', 'isOpen', 'value']),
                        lit('fixed inset-y-0 right-0 w-full sm:w-[500px] bg-gray-900 border-l border-gray-700 transform translate-x-0 transition-transform duration-300 z-50 flex flex-col'),
                        lit('fixed inset-y-0 right-0 w-full sm:w-[500px] bg-gray-900 border-l border-gray-700 transform translate-x-full transition-transform duration-300 z-50 flex flex-col')
                    )
                }
            },
            children: {
                isOpen: {
                    id: 'isOpen',
                    type: BOOLEAN,
                    value: false
                },
                closeButton: {
                    id: 'closeButton',
                    type: UI_BUTTON,
                    value: op('ui.closePanel', lit('dataPanel')),
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'X' },
                        cssClass: { id: 'cssClass', type: STRING, value: 'p-2 hover:bg-gray-700 rounded-lg transition-colors' }
                    }
                },
                code: {
                    id: 'code',
                    type: UI_CODE,
                    value: '', // Will be populated dynamically
                    metadata: {
                        format: { id: 'format', type: STRING, value: 'json' },
                        cssClass: { id: 'cssClass', type: STRING, value: 'flex-1 text-xs bg-gray-950 p-4 overflow-auto text-yellow-400 font-mono' }
                    }
                }
            }
        },

        // ========== OVERLAY ==========
        overlay: {
            id: 'overlay',
            type: UI_OVERLAY,
            metadata: {
                cssClass: {
                    id: 'cssClass',
                    type: STRING,
                    value: op('if',
                        ref(['self', 'visible', 'value']),
                        lit('fixed inset-0 bg-black/50 backdrop-blur-sm opacity-100 transition-opacity duration-300 z-40'),
                        lit('fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 z-40')
                    )
                }
            },
            children: {
                visible: {
                    id: 'visible',
                    type: BOOLEAN,
                    value: false
                }
            }
        },

        // ========== I18N (Internationalization) ==========
        // All translations are Properties - currentLocale is state
        i18n: i18nProperty,

        // ========== THEME ==========
        // Theme configs are Properties - current theme is state
        theme: themeProperty,

        // ========== WIZARD ==========
        // The event wizard is embedded as a child - ONE tree, All is Property
        wizard: eventWizard
    }
};
