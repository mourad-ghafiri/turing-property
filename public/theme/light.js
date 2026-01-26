// ============================================================================
// LIGHT THEME (All is Property)
// ============================================================================

import { STRING, THEME_CONFIG } from '../common/types.js';

export const lightTheme = {
    id: 'light',
    type: THEME_CONFIG,
    metadata: {
        name: { id: 'name', type: STRING, value: 'Light' },
        icon: { id: 'icon', type: STRING, value: '☀️' }
    },
    children: {
        cssVars: {
            id: 'cssVars',
            type: STRING,
            children: {
                rangeTrack: { id: 'rangeTrack', type: STRING, value: '#d1d5db' },
                rangeThumb: { id: 'rangeThumb', type: STRING, value: '#3b82f6' },
                ratingInactive: { id: 'ratingInactive', type: STRING, value: '#d1d5db' },
                ratingActive: { id: 'ratingActive', type: STRING, value: '#eab308' },
                ratingHover: { id: 'ratingHover', type: STRING, value: '#facc15' },
                toggleTrack: { id: 'toggleTrack', type: STRING, value: '#d1d5db' },
                toggleTrackChecked: { id: 'toggleTrackChecked', type: STRING, value: '#3b82f6' },
                checkboxBg: { id: 'checkboxBg', type: STRING, value: '#ffffff' },
                checkboxBorder: { id: 'checkboxBorder', type: STRING, value: '#9ca3af' },
                checkboxChecked: { id: 'checkboxChecked', type: STRING, value: '#3b82f6' }
            }
        },
        bg: {
            id: 'bg',
            type: STRING,
            children: {
                body: { id: 'body', type: STRING, value: 'bg-gradient-to-br from-gray-50 via-white to-gray-100' },
                primary: { id: 'primary', type: STRING, value: 'bg-white' },
                secondary: { id: 'secondary', type: STRING, value: 'bg-gray-50' },
                tertiary: { id: 'tertiary', type: STRING, value: 'bg-gray-100' },
                card: { id: 'card', type: STRING, value: 'bg-white' },
                input: { id: 'input', type: STRING, value: 'bg-white' },
                hover: { id: 'hover', type: STRING, value: 'hover:bg-gray-100' },
                overlay: { id: 'overlay', type: STRING, value: 'bg-black/30' }
            }
        },
        text: {
            id: 'text',
            type: STRING,
            children: {
                primary: { id: 'primary', type: STRING, value: 'text-gray-900' },
                secondary: { id: 'secondary', type: STRING, value: 'text-gray-700' },
                muted: { id: 'muted', type: STRING, value: 'text-gray-500' },
                disabled: { id: 'disabled', type: STRING, value: 'text-gray-400' },
                accent: { id: 'accent', type: STRING, value: 'text-blue-600' },
                success: { id: 'success', type: STRING, value: 'text-green-600' },
                error: { id: 'error', type: STRING, value: 'text-red-600' },
                warning: { id: 'warning', type: STRING, value: 'text-yellow-600' }
            }
        },
        border: {
            id: 'border',
            type: STRING,
            children: {
                primary: { id: 'primary', type: STRING, value: 'border-gray-200' },
                secondary: { id: 'secondary', type: STRING, value: 'border-gray-300' },
                accent: { id: 'accent', type: STRING, value: 'border-blue-500' },
                input: { id: 'input', type: STRING, value: 'border-gray-300' },
                focus: { id: 'focus', type: STRING, value: 'focus:border-blue-500' }
            }
        },
        button: {
            id: 'button',
            type: STRING,
            children: {
                primary: { id: 'primary', type: STRING, value: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' },
                secondary: { id: 'secondary', type: STRING, value: 'bg-gray-200 hover:bg-gray-300 text-gray-800' },
                ghost: { id: 'ghost', type: STRING, value: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
                success: { id: 'success', type: STRING, value: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white' },
                danger: { id: 'danger', type: STRING, value: 'bg-red-600 hover:bg-red-500 text-white' }
            }
        },
        header: {
            id: 'header',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white/80 backdrop-blur-sm' },
                border: { id: 'border', type: STRING, value: 'border-b border-gray-200' }
            }
        },
        panel: {
            id: 'panel',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white' },
                border: { id: 'border', type: STRING, value: 'border-gray-200' },
                header: { id: 'header', type: STRING, value: 'border-b border-gray-200' }
            }
        },
        card: {
            id: 'card',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white' },
                border: { id: 'border', type: STRING, value: 'border border-gray-200' },
                shadow: { id: 'shadow', type: STRING, value: 'shadow-lg' }
            }
        },
        code: {
            id: 'code',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-gray-100' },
                text: { id: 'text', type: STRING, value: 'text-gray-800' }
            }
        },
        input: {
            id: 'input',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white' },
                text: { id: 'text', type: STRING, value: 'text-gray-900' },
                border: { id: 'border', type: STRING, value: 'border-gray-300' },
                placeholder: { id: 'placeholder', type: STRING, value: 'placeholder-gray-400' },
                focus: { id: 'focus', type: STRING, value: 'focus:border-blue-500 focus:ring-blue-500/20' }
            }
        },
        select: {
            id: 'select',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white' },
                text: { id: 'text', type: STRING, value: 'text-gray-900' },
                border: { id: 'border', type: STRING, value: 'border-gray-300' }
            }
        },
        checkbox: {
            id: 'checkbox',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-white' },
                border: { id: 'border', type: STRING, value: 'border-gray-400' },
                checked: { id: 'checked', type: STRING, value: 'bg-blue-600 border-blue-600' }
            }
        },
        toggle: {
            id: 'toggle',
            type: STRING,
            children: {
                track: { id: 'track', type: STRING, value: 'bg-gray-300' },
                trackChecked: { id: 'trackChecked', type: STRING, value: 'bg-blue-500' },
                knob: { id: 'knob', type: STRING, value: 'bg-white' }
            }
        },
        range: {
            id: 'range',
            type: STRING,
            children: {
                track: { id: 'track', type: STRING, value: 'bg-gray-300' },
                thumb: { id: 'thumb', type: STRING, value: 'bg-blue-500' }
            }
        },
        rating: {
            id: 'rating',
            type: STRING,
            children: {
                inactive: { id: 'inactive', type: STRING, value: 'text-gray-300' },
                active: { id: 'active', type: STRING, value: 'text-yellow-500' },
                hover: { id: 'hover', type: STRING, value: 'text-yellow-400' }
            }
        },
        tab: {
            id: 'tab',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-gray-100' },
                text: { id: 'text', type: STRING, value: 'text-gray-600' },
                hover: { id: 'hover', type: STRING, value: 'hover:bg-gray-200' },
                activeBg: { id: 'activeBg', type: STRING, value: 'bg-gradient-to-r from-blue-600 to-purple-600' },
                activeText: { id: 'activeText', type: STRING, value: 'text-white' },
                numberBg: { id: 'numberBg', type: STRING, value: 'bg-gray-200' },
                activeNumberBg: { id: 'activeNumberBg', type: STRING, value: 'bg-white/20' }
            }
        },
        progress: {
            id: 'progress',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-gray-200' },
                fill: { id: 'fill', type: STRING, value: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' }
            }
        },
        wizard: {
            id: 'wizard',
            type: STRING,
            children: {
                title: { id: 'title', type: STRING, value: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' },
                subtitle: { id: 'subtitle', type: STRING, value: 'text-gray-500' },
                sectionBg: { id: 'sectionBg', type: STRING, value: 'bg-gray-100' },
                sectionBorder: { id: 'sectionBorder', type: STRING, value: 'border-gray-200' },
                divider: { id: 'divider', type: STRING, value: 'border-gray-200' }
            }
        },
        label: {
            id: 'label',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'text-gray-700' },
                required: { id: 'required', type: STRING, value: 'text-red-500' }
            }
        },
        error: {
            id: 'error',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'text-red-600' },
                bg: { id: 'bg', type: STRING, value: 'bg-red-50' },
                border: { id: 'border', type: STRING, value: 'border-red-300' }
            }
        },
        accent: {
            id: 'accent',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-blue-500' },
                bgLight: { id: 'bgLight', type: STRING, value: 'bg-blue-50' },
                border: { id: 'border', type: STRING, value: 'border-blue-500' },
                hover: { id: 'hover', type: STRING, value: 'hover:border-blue-500' }
            }
        },
        computed: {
            id: 'computed',
            type: STRING,
            children: {
                bg: { id: 'bg', type: STRING, value: 'bg-gradient-to-r from-blue-100 to-purple-100' },
                border: { id: 'border', type: STRING, value: 'border-blue-300' },
                text: { id: 'text', type: STRING, value: 'text-blue-600' }
            }
        }
    }
};

export default lightTheme;
