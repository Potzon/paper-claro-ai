'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll, json } = require('./helpers/app');

afterEach(disposeAll);

const HOSTED = 'https://potzon.github.io/paper-claro-ai/';
const status = (app) => app.$('cfgModelStatus');
const button = (app, name) => app.providerButtons().find((b) => b.textContent.includes(name));

async function open(options) {
    const app = await boot(options);
    app.window.openSettings();
    await app.settle();
    return app;
}

describe('hosted copy of the app (GitHub Pages, a domain...)', () => {
    it('shows OpenCode greyed out and disabled, labelled "local version only"', async () => {
        const app = await open({ url: HOSTED });
        const opencode = button(app, 'OpenCode');
        assert.equal(opencode.disabled, true);
        assert.match(opencode.textContent, /\(local version only\)/);
        assert.ok(opencode.title);
        assert.match(opencode.className, /cursor-not-allowed/);
    });

    it('keeps every other provider selectable, Ollama included', async () => {
        const app = await open({ url: HOSTED });
        const others = app.providerButtons().filter((b) => !b.textContent.includes('OpenCode'));
        assert.ok(others.length >= 7);
        assert.deepEqual(others.filter((b) => b.disabled), []);
        assert.ok(!button(app, 'Ollama').textContent.includes('local version only'));
    });

    it('clicking the disabled option does not switch to it', async () => {
        const app = await open({ url: HOSTED });
        button(app, 'OpenCode').click();
        app.window.onProviderChange('opencode');   // not even from code
        await app.settle();
        assert.equal(app.run('modalProvider'), 'gemini');
        assert.equal(app.calls.length, 0);
    });

    it('a saved OpenCode choice falls back to the default provider', async () => {
        const app = await boot({ url: HOSTED });
        const saved = app.run(`
            localStorage.setItem('paperclaro.settings.v1', JSON.stringify({ provider: 'opencode' }));
            llm.provider = 'gemini';
            loadSettings();
            llm.provider;`);
        assert.equal(saved, 'gemini');
    });

    it('explains it and links to the README', async () => {
        const app = await open({ url: HOSTED });
        const note = app.$('cfgHostedNote');
        assert.ok(!note.classList.contains('hidden'));
        assert.match(note.textContent, /OpenCode only works when you run the app on your computer/);
        const link = note.querySelector('a');
        assert.equal(link.href, 'https://github.com/Potzon/paper-claro-ai#usage');
        assert.equal(link.rel, 'noopener noreferrer');
    });

    it('is translated', async () => {
        const app = await open({ url: HOSTED, lang: 'es' });
        assert.match(button(app, 'OpenCode').textContent, /\(solo versión local\)/);
        assert.match(app.$('cfgHostedNote').textContent, /OpenCode solo funciona si ejecutas la app en tu equipo/);
        assert.equal(app.$('cfgHostedNote').querySelector('a').textContent, 'Cómo ejecutarla en local');
    });
});

describe('local copy of the app', () => {
    for (const url of ['http://localhost:8000/', 'http://127.0.0.1:8000/', 'file:///home/me/paper-claro-ai/index.html']) {
        it(`${url} leaves OpenCode available and shows no note`, async () => {
            const app = await open({ url });
            assert.equal(button(app, 'OpenCode').disabled, false);
            assert.ok(!button(app, 'OpenCode').textContent.includes('local version only'));
            assert.ok(app.$('cfgHostedNote').classList.contains('hidden'));
            assert.equal(app.run("providerDisabled('opencode')"), false);
        });
    }

    it('keeps a saved OpenCode choice', async () => {
        const app = await boot({ url: 'http://localhost:8000/' });
        const saved = app.run(`
            localStorage.setItem('paperclaro.settings.v1', JSON.stringify({ provider: 'opencode' }));
            llm.provider = 'gemini';
            loadSettings();
            llm.provider;`);
        assert.equal(saved, 'opencode');
    });
});

describe('Ollama: server down vs server that rejects this page', () => {
    // `reachable`: whether something answers on the port. A no-cors request resolves (opaque) in that case,
    // while the normal request fails with a network error because the browser blocks the reply (CORS).
    function ollama(reachable) {
        const probes = [];
        const handler = (url, opts = {}) => {
            if (opts.mode === 'no-cors') {
                probes.push(url);
                if (reachable) return { type: 'opaque', status: 0, ok: false };
            }
            throw new TypeError('Failed to fetch');
        };
        return { handler, probes };
    }

    async function pickOllama(url, reachable, lang) {
        const fake = ollama(reachable);
        const app = await boot({ url, lang, handler: fake.handler });
        app.window.openSettings();
        app.pick('Ollama (local)');
        await app.settle();
        return { app, probes: fake.probes };
    }

    it('tells the user the exact origin to allow when Ollama answers but rejects the page', async () => {
        const { app, probes } = await pickOllama(HOSTED, true);
        assert.match(status(app).textContent, /^Ollama is running at http:\/\/localhost:11434\/v1 but it does not accept this page \(https:\/\/potzon\.github\.io\)\./);
        assert.ok(status(app).textContent.includes('OLLAMA_ORIGINS=https://potzon.github.io ollama serve'));
        assert.deepEqual(probes, ['http://localhost:11434/']);   // the root of the server, never the model list
        assert.match(status(app).className, /amber/);
    });

    it('uses the real origin of the page, port included', async () => {
        const { app } = await pickOllama('http://localhost:8000/', true);
        assert.ok(status(app).textContent.includes('OLLAMA_ORIGINS=http://localhost:8000 ollama serve'));
    });

    it('says the server is not running when nothing answers', async () => {
        const { app } = await pickOllama(HOSTED, false);
        assert.match(status(app).textContent, /^Could not reach http:\/\/localhost:11434\/v1\. Check that the server is running/);
        assert.match(status(app).textContent, /let this page access your local network/);
        assert.doesNotMatch(status(app).textContent, /does not accept this page/);
    });

    it('is translated', async () => {
        const { app } = await pickOllama(HOSTED, true, 'es');
        assert.match(status(app).textContent, /^Ollama está en marcha en http:\/\/localhost:11434\/v1 pero no acepta esta página \(https:\/\/potzon\.github\.io\)\./);
        assert.ok(status(app).textContent.includes('OLLAMA_ORIGINS=https://potzon.github.io ollama serve'));
    });

    it('keeps the file:// message, without probing', async () => {
        const { app, probes } = await pickOllama('file:///home/me/index.html', true);
        assert.match(status(app).textContent, /You opened this page as a file/);
        assert.deepEqual(probes, []);
    });

    it('does not suggest OLLAMA_ORIGINS commands for other local servers ("Other API")', async () => {
        const fake = ollama(true);
        const app = await boot({ url: HOSTED, handler: fake.handler });
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        app.commit('cfgBase', 'http://localhost:1234/v1');
        await app.settle();
        assert.match(status(app).textContent, /^Could not reach http:\/\/localhost:1234\/v1/);
        assert.doesNotMatch(status(app).textContent, /ollama serve/);
        assert.deepEqual(fake.probes, []);
    });

    it('a working Ollama lists its models as before', async () => {
        const app = await boot({ url: HOSTED, handler: () => json({ data: [{ id: 'llama3.1' }] }) });
        app.window.openSettings();
        app.pick('Ollama (local)');
        await app.settle();
        assert.match(status(app).textContent, /1 model/);
    });
});

describe('Gemini key hint', () => {
    it('says the key is free and warns about the free plan', async () => {
        const app = await open({});
        const hint = app.$('cfgKeyHint').textContent;
        assert.match(hint, /Free key, no card needed: aistudio\.google\.com\/apikey/);
        assert.match(hint, /may use your prompts to improve its products/);
    });

    it('is translated', async () => {
        const app = await open({ lang: 'es' });
        assert.match(app.$('cfgKeyHint').textContent, /Clave gratuita, sin tarjeta: aistudio\.google\.com\/apikey.*puede usar tus prompts/);
    });
});
