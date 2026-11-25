'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll, json, wait } = require('./helpers/app');

afterEach(disposeAll);

const DEBOUNCE_MS = 750; // the app waits 600 ms after the last keystroke before listing models

const optionValues = (app) => [...app.$('cfgModelSelect').options].map((o) => o.value);
const status = (app) => app.$('cfgModelStatus');
const inputHidden = (app) => app.$('cfgModel').classList.contains('hidden');
const listHidden = (app) => app.$('cfgModelSelect').classList.contains('hidden');
const choose = (app, value) => { app.$('cfgModelSelect').value = value; app.fire(app.$('cfgModelSelect'), 'change'); };

async function openWith(provider, options) {
    const app = await boot(options);
    app.window.openSettings();
    app.pick(provider);
    await app.settle();
    return app;
}

describe('model list: providers that need a key', () => {
    it('asks for the key and sends nothing without one', async () => {
        const app = await openWith('Gemini');
        assert.equal(app.calls.length, 0);
        assert.ok(listHidden(app));
        assert.match(status(app).textContent, /^Enter your API key/);
    });

    it('lists the models by itself once the key is typed, after a pause', async () => {
        const app = await openWith('Gemini');
        app.typeInto('cfgKey', 'AIzaSyDummyKey123');
        assert.equal(app.calls.length, 0, 'not before the pause');
        await wait(DEBOUNCE_MS);
        assert.equal(app.calls.length, 1);
        assert.equal(app.calls[0].url, 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000');
        assert.equal(app.calls[0].headers['x-goog-api-key'], 'AIzaSyDummyKey123');
        assert.ok(!listHidden(app));
        assert.match(status(app).textContent, /1 models available/);
        assert.ok(status(app).className.includes('text-emerald-700'), 'success is shown in green');
    });

    it('does not send half-typed keys', async () => {
        const app = await openWith('OpenAI');
        app.typeInto('cfgKey', 'sk-a');
        await wait(DEBOUNCE_MS);
        assert.equal(app.calls.length, 0);
    });

    it('makes a single request for a burst of keystrokes', async () => {
        const app = await openWith('OpenAI');
        for (const key of ['sk-test-12345', 'sk-test-123456', 'sk-test-1234567']) app.typeInto('cfgKey', key);
        await wait(DEBOUNCE_MS);
        assert.equal(app.calls.length, 1);
        assert.equal(app.calls[0].headers.Authorization, 'Bearer sk-test-1234567');
    });

    it('the "Search models" button sits in the API key row and lists on demand', async () => {
        const app = await openWith('Claude');
        app.$('cfgKey').value = 'sk-ant-whatever';
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.equal(app.calls.length, 1);
        assert.equal(app.calls[0].url, 'https://api.anthropic.com/v1/models?limit=1000');
        assert.equal(app.calls[0].headers['x-api-key'], 'sk-ant-whatever');
        assert.ok(app.$('cfgModelRefresh').parentElement.contains(app.document.querySelector('label[for="cfgKey"]')));
    });

    it('only chat-capable models are listed (embeddings, images, ... are filtered)', async () => {
        const app = await openWith('OpenAI', {
            handler: () => json({ data: [{ id: 'gpt-4o' }, { id: 'text-embedding-3-small' }, { id: 'dall-e-3' }, { id: 'whisper-1' }, { id: 'gpt-4o-mini' }] })
        });
        app.$('cfgKey').value = 'sk-test-12345';
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.deepEqual(optionValues(app), ['', 'gpt-4o', 'gpt-4o-mini', '__custom__']);
    });

    it('Gemini models that cannot generate content are filtered out', async () => {
        const app = await openWith('Gemini');
        app.$('cfgKey').value = 'AIzaSyDummyKey123';
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.deepEqual(optionValues(app), ['', 'gemini-x', '__custom__']);
    });

    it('a provider error is shown in amber with its reason, and the text field stays usable', async () => {
        const app = await openWith('OpenAI', { handler: () => json({ error: { message: 'Incorrect API key provided' } }, 401) });
        app.$('cfgKey').value = 'sk-wrong-key';
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.match(status(app).textContent, /Could not load the list \(401 Incorrect API key provided\)/);
        assert.ok(status(app).className.includes('text-amber-700'));
        assert.ok(listHidden(app) && !inputHidden(app), 'falls back to typing the name');
    });

    it('a late answer for a previous provider/key never overwrites the current state', async () => {
        let release;
        const app = await openWith('OpenAI', { handler: () => new Promise((resolve) => { release = () => resolve(json({ data: [{ id: 'stale-model' }] })); }) });
        app.$('cfgKey').value = 'sk-test-12345';
        app.$('cfgModelRefresh').click();
        await app.settle();
        app.pick('Groq');                 // user switches provider while the first request is pending
        release();
        await app.settle();
        assert.ok(!optionValues(app).includes('stale-model'));
    });
});

describe('model list: one control at a time', () => {
    async function withList() {
        const app = await openWith('Gemini');
        app.$('cfgKey').value = 'AIzaSyDummyKey123';
        app.$('cfgModelRefresh').click();
        await app.settle();
        return app;
    }

    it('a default model that is not in the list selects "Other" and keeps showing its name', async () => {
        const app = await withList();
        assert.deepEqual(optionValues(app), ['', 'gemini-x', '__custom__']);
        assert.equal(app.$('cfgModelSelect').value, '__custom__');
        assert.ok(!inputHidden(app));
        assert.equal(app.$('cfgModel').value, 'gemini-3-flash-preview');
        assert.ok(app.$('cfgModelSelect').options[0].disabled, 'the title option cannot be re-selected');
    });

    it('choosing a listed model hides the text field and stores the value', async () => {
        const app = await withList();
        choose(app, 'gemini-x');
        assert.equal(app.$('cfgModel').value, 'gemini-x');
        assert.ok(inputHidden(app));
    });

    it('choosing "Other" reveals the text field and keeps the value so it can be edited', async () => {
        const app = await withList();
        choose(app, 'gemini-x');
        choose(app, '__custom__');
        assert.ok(!inputHidden(app));
        assert.equal(app.$('cfgModel').value, 'gemini-x');
        app.typeInto('cfgModel', 'my-own-model');
        app.window.saveSettingsFromModal();
        assert.equal(app.run('currentCfg().model'), 'my-own-model');
    });

    it('without a list only the text field is shown', async () => {
        const app = await withList();
        app.handler = () => { throw new TypeError('Failed to fetch'); };
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.ok(listHidden(app) && !inputHidden(app));
    });

    it('the status text and the list labels are re-translated live', async () => {
        const app = await withList();
        app.window.setLang('es');
        assert.match(status(app).textContent, /^1 modelos disponibles\. Elige uno/);
        assert.equal(app.$('cfgModelSelect').options[0].text, 'Elegir de la lista (1 modelos)…');
        assert.equal(app.$('cfgModelSelect').options[2].text, 'Otro (escribir el nombre)…');
        assert.equal(app.$('cfgModel').placeholder, 'O escribe el nombre del modelo');
    });
});

describe('model list: providers that need no key', () => {
    const OLLAMA = { data: [{ id: 'llama3.2' }, { id: 'nomic-embed-text' }] };

    it('Ollama lists the local models right away, without a key or Authorization header', async () => {
        const app = await openWith('Ollama (local)', { handler: () => json(OLLAMA) });
        assert.equal(app.calls.length, 1);
        assert.equal(app.calls[0].url, 'http://localhost:11434/v1/models');
        assert.equal('Authorization' in app.calls[0].headers, false);
        assert.deepEqual(optionValues(app), ['', 'llama3.2', '__custom__'], 'embedding models are not offered');
    });

    it('an uninstalled default model is replaced by an installed one', async () => {
        const app = await openWith('Ollama (local)', { handler: () => json(OLLAMA) });
        assert.equal(app.$('cfgModel').value, 'llama3.2');
        assert.equal(app.$('cfgModelSelect').value, 'llama3.2');
        assert.ok(inputHidden(app));
    });

    it('a model name typed by the user is never replaced', async () => {
        const app = await openWith('Ollama (local)', { handler: () => json(OLLAMA) });
        app.typeInto('cfgModel', 'my-custom-model');
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.equal(app.$('cfgModel').value, 'my-custom-model');
        assert.equal(app.$('cfgModelSelect').value, '__custom__');
        assert.ok(!inputHidden(app));
    });

    it('an unreachable server gets a specific message with the address tried', async () => {
        const app = await openWith('Ollama (local)', { handler: () => { throw new TypeError('Failed to fetch'); } });
        assert.match(status(app).textContent, /^Could not reach http:\/\/localhost:11434\/v1\. Check that the server is running/);
        assert.match(status(app).textContent, /OLLAMA_ORIGINS/);
        assert.ok(status(app).className.includes('text-amber-700'));
        app.window.setLang('es');
        assert.match(status(app).textContent, /^No se pudo conectar con http:\/\/localhost:11434\/v1/);
    });

    it('opened from a file:// URL the message explains that Ollama rejects that origin', async () => {
        const app = await boot({ url: 'file:///home/user/paper-claro-ai/index.html', handler: () => { throw new TypeError('Failed to fetch'); } });
        app.window.openSettings();
        app.pick('Ollama (local)');
        await app.settle();
        assert.match(status(app).textContent, /opened this page as a file \(file:\/\/\)/);
        assert.match(status(app).textContent, /python3 -m http\.server 8000/);
    });

    it('OpenRouter publishes its catalog, so it is listed without a key', async () => {
        const app = await openWith('OpenRouter', { handler: () => json({ data: [{ id: 'openai/gpt-4o-mini' }, { id: 'meta/llama' }] }) });
        assert.equal(app.calls[0].url, 'https://openrouter.ai/api/v1/models');
        assert.equal('Authorization' in app.calls[0].headers, false);
        assert.deepEqual(optionValues(app), ['', 'meta/llama', 'openai/gpt-4o-mini', '__custom__']);
    });

    it('the generic API asks for the base URL first and lists once it is committed', async () => {
        const app = await openWith('Other API (OpenAI)');
        assert.equal(app.calls.length, 0);
        assert.match(status(app).textContent, /base URL/);
        app.typeInto('cfgBase', 'https://api.example.com/v1');
        await wait(DEBOUNCE_MS);
        assert.equal(app.calls.length, 0, 'typing the URL alone never sends anything (the key could reach a half-typed host)');
        app.commit('cfgBase', 'https://api.example.com/v1');
        await app.settle();
        assert.equal(app.calls[0].url, 'https://api.example.com/v1/models');
    });

    it('focus goes to the key only when a key is needed', async () => {
        const app = await boot();
        app.window.openSettings();
        assert.equal(app.document.activeElement, app.$('cfgKey'));
        app.window.closeSettings();
        app.run("llm.provider = 'ollama'");
        app.window.openSettings();
        assert.equal(app.document.activeElement, app.$('cfgModel'));
    });
});
