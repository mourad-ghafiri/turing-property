// ============================================================================
// MAIN.JS - Application Entry Point (All is Property)
// ============================================================================

import { PropertyNode } from './dist/index.js';

// Import registry with registered operators
import { registry } from './common/registry.js';

// Import app property and renderer
import { appProperty } from './app/property.js';
import { TuringApp } from './app/renderer.js';

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================

async function init() {
    console.log('Initializing Turing Property Application...');

    // Create the PropertyNode and set up registry
    const appNode = new PropertyNode(appProperty);
    appNode.setRegistry(registry);

    // Get the container
    const container = document.getElementById('app');

    // Create and mount the TuringApp (passing PropertyNode)
    const app = new TuringApp(appNode, container);
    await app.mount();

    // Expose for debugging
    window.turingApp = app;
    window.appRoot = app.root;

    console.log('Application mounted successfully');
}

// Start the application
init().catch(err => {
    console.error('❌ Failed to initialize application:', err);
    document.getElementById('app').innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center text-red-400 p-8">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-xl mb-2">Failed to load application</p>
                <p class="text-sm text-gray-400">${err.message}</p>
                <pre class="mt-4 text-xs text-left bg-gray-800 p-4 rounded-lg overflow-auto max-w-lg mx-auto">${err.stack}</pre>
            </div>
        </div>
    `;
});
