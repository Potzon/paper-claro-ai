'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll } = require('./helpers/app');

afterEach(disposeAll);

const baseWrapHidden = (app) => app.$('cfgBaseWrap').classList.contains('hidden');
const warning = (app) => app.$('cfgBaseWarning');

describe('base URL: which providers expose it', () => {
    for (const [name, editable] of [
        ['Gemini', false], ['OpenAI', false], ['Claude', false], ['Grok', false],
        ['OpenRouter', false], ['Groq', false], ['Ollama (local)', true], ['Other API (OpenAI)', true]
    ]) {
        it(`${name}: field ${editable ? 'visible' : 'hidden'}`, async () => {
            const app = await boot();
            app.window.openSettings();
            app.pick(name);
            assert.equal(baseWrapHidden(app), !editable);
        });
    }

    it('a stale override stored for an official provider is ignored (the key cannot be redirected silently)', async () => {
        const app = await boot();
        app.run("llm.bases.openai = 'http://evil.example/v1'; llm.keys.openai = 'sk-test'; llm.provider = 'openai'");
        assert.equal(app.run('currentCfg().base'), 'https://api.openai.com/v1');
    });

    it('Ollama keeps its editable base, normalized', async () => {
        const app = await boot();
        app.run("llm.provider = 'ollama'; llm.bases.ollama = 'http://localhost:9999/v1/'");
        assert.equal(app.run('currentCfg().base'), 'http://localhost:9999/v1');
    });
});

describe('base URL: normalization', () => {
    const cases = [
        ['https://x.com/v1/', 'https://x.com/v1'],
        ['https://x.com/v1/chat/completions', 'https://x.com/v1'],
        ['https://x.com/v1/chat/completions/', 'https://x.com/v1'],
        ['https://x.com/v1/models/', 'https://x.com/v1'],
        ['  http://localhost:11434/v1  ', 'http://localhost:11434/v1'],
        ['https://x.com/api/v1///', 'https://x.com/api/v1'],
        ['', '']
    ];
    for (const [input, expected] of cases) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, async () => {
            const app = await boot();
            assert.equal(app.run(`normalizeBase(${JSON.stringify(input)})`), expected);
        });
    }

    it('pasting a full endpoint cleans the field and lists the right /models URL', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        app.calls.length = 0;
        app.commit('cfgBase', 'https://api.example.com/v1/chat/completions/');
        await app.settle();
        assert.equal(app.$('cfgBase').value, 'https://api.example.com/v1');
        assert.equal(app.calls.length, 1);
        assert.equal(app.calls[0].url, 'https://api.example.com/v1/models');
    });

    it('saving stores the cleaned base and the app uses it for requests', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        app.$('cfgBase').value = 'https://api.example.com/v1/models/';
        app.window.saveSettingsFromModal();
        assert.equal(app.run('llm.bases.custom'), 'https://api.example.com/v1');
        assert.equal(app.run('currentCfg().base'), 'https://api.example.com/v1');
    });
});

describe('base URL: warnings', () => {
    async function warnings(url, cases) {
        const app = await boot({ url });
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        for (const [value, key] of cases) {
            app.typeInto('cfgBase', value);
            const shown = !warning(app).classList.contains('hidden');
            assert.equal(shown, Boolean(key), `${JSON.stringify(value)} should ${key ? 'warn' : 'not warn'}`);
            assert.equal(warning(app).textContent, key ? app.t(key) : '', JSON.stringify(value));
        }
        return app;
    }

    it('on an http:// page: bad schemes and plain http outside the local network', async () => {
        await warnings('http://localhost/', [
            ['ftp://x.com/v1', 'base.badScheme'],
            ['api.example.com/v1', 'base.badScheme'],
            ['http://api.example.com/v1', 'base.insecure'],
            ['http://localhost:1234/v1', null],
            ['http://127.0.0.1:1234/v1', null],
            ['http://[::1]:1234/v1', null],
            ['http://192.168.1.5:11434/v1', null],
            ['http://10.0.0.2:11434/v1', null],
            ['http://172.20.0.3:11434/v1', null],
            ['http://box.local:11434/v1', null],
            ['https://api.example.com/v1', null],
            ['', null]
        ]);
    });

    it('172.15 / 172.32 are public addresses and do warn', async () => {
        await warnings('http://localhost/', [
            ['http://172.15.0.1/v1', 'base.insecure'],
            ['http://172.32.0.1/v1', 'base.insecure']
        ]);
    });

    it('on an https:// page the browser blocks http:// (except localhost)', async () => {
        await warnings('https://paperclaro.example/', [
            ['http://api.example.com/v1', 'base.mixed'],
            ['http://192.168.1.5:11434/v1', 'base.mixed'],
            ['http://localhost:11434/v1', null],
            ['http://127.0.0.1:11434/v1', null],
            ['https://api.example.com/v1', null]
        ]);
    });

    it('a malformed URL sends nothing and explains why, in amber', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        app.calls.length = 0;
        app.commit('cfgBase', 'ftp://x.com/v1');
        await app.settle();
        assert.equal(app.calls.length, 0);
        assert.match(app.$('cfgModelStatus').textContent, /^Fix the base URL/);
        assert.ok(app.$('cfgModelStatus').className.includes('text-amber-700'));
    });

    it('the warning follows the language and disappears for providers with a fixed URL', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('Other API (OpenAI)');
        app.typeInto('cfgBase', 'http://api.example.com/v1');
        app.window.setLang('es');
        assert.match(warning(app).textContent, /sin cifrar/);
        app.window.setLang('en');
        app.pick('OpenAI');
        assert.ok(warning(app).classList.contains('hidden'));
    });
});
