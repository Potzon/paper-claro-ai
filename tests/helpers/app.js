'use strict';
// Test helper: boots the real index.html + src/i18n.js + src/app.js inside jsdom with a fake `fetch`.
// Nothing is mocked in the app itself: tests drive it through the DOM and its global functions.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// The CDN <script src> tags are dropped: libraries are injected explicitly (see `libs`).
const HTML = read('index.html').replace(/<script\b[^>]*\bsrc="[^"]*"[^>]*><\/script>/g, '');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Lets pending promise callbacks (the fake fetch resolves in microtasks) run.
const settle = () => wait(15);

const json = (body, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body)
});

const COMPLETION = '# Test Paper\n\nBody';

// Default fake provider: answers model listings and completions in each provider's own format.
function defaultHandler(url) {
    // Completions first: `.../models/<id>:generateContent` must not be mistaken for the model listing
    if (url.includes('generateContent')) return json({ candidates: [{ content: { parts: [{ text: COMPLETION }] } }] });
    if (url.includes('api.anthropic.com/v1/messages')) return json({ content: [{ type: 'text', text: COMPLETION }] });
    if (url.endsWith('/chat/completions')) return json({ choices: [{ message: { content: COMPLETION } }] });
    // Model listings, each in its provider's format
    if (url.includes('generativelanguage.googleapis.com')) {
        return json({ models: [{ name: 'models/gemini-x', displayName: 'Gemini X', supportedGenerationMethods: ['generateContent'] }] });
    }
    if (url.includes('api.anthropic.com')) return json({ data: [{ id: 'claude-x', display_name: 'Claude X' }] });
    return json({ data: [{ id: 'model-a' }, { id: 'model-b' }] });
}

const booted = [];

/**
 * @param {object}  [opts]
 * @param {string}  [opts.url]      page URL (http://localhost/ by default)
 * @param {string}  [opts.lang]     language already stored in localStorage
 * @param {Function}[opts.handler]  (url, opts) => fake fetch response
 * @param {string[]}[opts.libs]     extra scripts (repo-relative) loaded before the app, e.g. marked / DOMPurify
 * @returns {Promise<object>} resolves once the page has finished loading (the app has initialized)
 */
async function boot({ url = 'http://localhost/', lang = null, handler = defaultHandler, libs = [] } = {}) {
    const dom = new JSDOM(HTML, { url, runScripts: 'dangerously', pretendToBeVisual: true });
    const { window } = dom;
    const ctx = dom.getInternalVMContext();

    const app = {
        window,
        document: window.document,
        calls: [],       // every fetch made by the app: { url, method, headers, body }
        handler,         // replace to change what the fake provider answers
        // Evaluates code in the page's global scope (needed for top-level `const`s such as llm / I18N / PROVIDERS)
        run: (code) => vm.runInContext(code, ctx),
        t: (key, vars) => window.t(key, vars),
        wait,
        settle,
        dispose: () => window.close()   // also cancels pending timers (debounce, toasts)
    };

    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.fetch = async (u, opts = {}) => {
        app.calls.push({
            url: String(u),
            method: opts.method || 'GET',
            headers: opts.headers || {},
            body: opts.body ? JSON.parse(opts.body) : null
        });
        return app.handler(String(u), opts);
    };

    if (lang) {
        try { window.localStorage.setItem('paperclaro.lang.v1', lang); } catch (e) { /* opaque origin */ }
    }
    for (const lib of libs) vm.runInContext(read(lib), ctx);
    vm.runInContext(read('src/i18n.js'), ctx);
    vm.runInContext(read('src/app.js'), ctx);
    // jsdom fires DOMContentLoaded / load by itself a moment after the scripts were evaluated; waiting for it
    // (instead of dispatching it by hand) means app.js initializes exactly once, like in a browser.
    if (window.document.readyState !== 'complete') await new Promise((resolve) => window.addEventListener('load', resolve));

    // ---- DOM helpers ----
    const $ = (id) => window.document.getElementById(id);
    app.$ = $;
    app.fire = (el, type) => el.dispatchEvent(new window.Event(type, { bubbles: true }));
    app.typeInto = (id, value) => { $(id).value = value; app.fire($(id), 'input'); };
    app.commit = (id, value) => { $(id).value = value; app.fire($(id), 'change'); };
    app.providerButtons = () => [...window.document.querySelectorAll('#cfgProviderGrid button')];
    app.pick = (name) => {
        const btn = app.providerButtons().find((b) => b.textContent.trim().endsWith(name));
        if (!btn) throw new Error(`No provider button named "${name}"`);
        btn.click();
    };
    app.lastCall = (needle) => [...app.calls].reverse().find((c) => c.url.includes(needle));
    // Configures a provider as if the user had saved it in the settings modal
    app.configure = (provider, key = 'test-key') => {
        app.run(`llm.provider = '${provider}'; llm.keys.${provider} = '${key}';`);
        window.updateProviderUI();
    };

    booted.push(app);
    return app;
}

// Use as `afterEach(disposeAll)` so timers of one test never leak into the next.
// It first lets in-flight promises finish (a closed jsdom window has no `document` any more).
async function disposeAll() {
    await settle();
    while (booted.length) booted.pop().dispose();
}

module.exports = { boot, disposeAll, json, read, wait, settle, ROOT, COMPLETION };
