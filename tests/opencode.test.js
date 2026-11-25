'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll, json, wait } = require('./helpers/app');

afterEach(disposeAll);

const BASE = 'http://127.0.0.1:49374';
const TOKEN = 'tok-0123456789-secret-token';
const CODE = 'pairing-code-123456';
const basic = (token) => 'Basic ' + Buffer.from(`opencode:${token}`).toString('base64');
const free = [{ input: 0, output: 0, cache: { read: 0, write: 0 } }];

const MODELS = [
    { id: 'tidepool-alpha-free', providerID: 'opencode', type: 'chat', name: 'Tidepool Alpha Free', enabled: true, cost: free, capabilities: { output: ['text'] } },
    { id: 'big-pickle', providerID: 'opencode', type: 'chat', name: 'Big Pickle', enabled: true, cost: free, capabilities: { output: ['text'] } },
    { id: 'claude-sonnet-5-5', providerID: 'opencode', type: 'chat', name: 'Claude Sonnet 5.5', enabled: true, cost: [{ input: 3, output: 15 }], capabilities: { output: ['text'] } },
    { id: 'qwen3.8:latest', providerID: 'ollama', name: 'qwen3.8:latest', enabled: true, cost: [], capabilities: { output: ['text'] } },
    { id: 'disabled-model', providerID: 'opencode', name: 'Disabled', enabled: false, cost: free, capabilities: { output: ['text'] } },
    { id: 'image-only', providerID: 'opencode', name: 'Image only', enabled: true, cost: free, capabilities: { output: ['image'] } }
];

/**
 * Fake OpenCode service with the behaviour seen on the real one: Basic auth (user "opencode", the token as
 * password; Bearer is rejected), single-use pairing codes, sessions and a stateless `generate`.
 */
function fakeOpenCode(overrides = {}) {
    const state = { codeUsed: false, sessions: new Map(), created: [], generated: [], redeemed: [], nextId: 1, ...overrides };
    state.handler = (url, opts = {}) => {
        const u = new URL(url);
        const authorized = opts.headers?.Authorization === basic(TOKEN);
        const unauthorized = () => json({ _tag: 'UnauthorizedError' }, 401);

        const connect = u.pathname.match(/^\/auth\/connect\/(.+)$/);
        if (connect) {
            state.redeemed.push({ code: decodeURIComponent(connect[1]), accept: opts.headers?.Accept });
            if (decodeURIComponent(connect[1]) !== CODE || state.codeUsed) return unauthorized();
            state.codeUsed = true;
            return json({ token: TOKEN });
        }
        if (!authorized) return unauthorized();
        if (u.pathname === '/api/model') return json({ data: MODELS });
        if (u.pathname === '/api/session' && opts.method === 'POST') {
            const body = JSON.parse(opts.body);
            const id = `ses_${state.nextId++}`;
            state.sessions.set(id, body);
            state.created.push(body);
            return json({ data: { id, model: body.model } });
        }
        const generate = u.pathname.match(/^\/api\/session\/([^/]+)\/generate$/);
        if (generate && opts.method === 'POST') {
            if (!state.sessions.has(generate[1])) return json({ _tag: 'SessionNotFoundError' }, 404);
            const { prompt } = JSON.parse(opts.body);
            state.generated.push({ session: generate[1], prompt });
            if (state.generate) return state.generate(prompt, generate[1]);
            return json({ data: { text: '# Test Paper\n\nBody', tokens: { input: 1, output: 1 }, cost: 0 } });
        }
        return json({ _tag: 'NotFound' }, 404);
    };
    return state;
}

async function openSettingsFor(server) {
    const app = await boot({ handler: (url, opts) => server.handler(url, opts) });
    app.window.openSettings();
    app.pick('OpenCode (local)');
    await app.settle();
    return app;
}

// Configures the provider as if the user had paired already
async function pairedApp(server, model = 'opencode/big-pickle') {
    const app = await boot({ handler: (url, opts) => server.handler(url, opts) });
    app.run(`llm.provider = 'opencode'; llm.keys.opencode = '${TOKEN}'; llm.models.opencode = '${model}'`);
    app.window.updateProviderUI();
    return app;
}

const analyze = async (app) => { app.$('paperTitleInput').value = 'Attention Is All You Need'; await app.window.analyzePaper(); };
const status = (app) => app.$('cfgModelStatus');
const options = (app) => [...app.$('cfgModelSelect').options].map((o) => o.value);

describe('OpenCode (local): connecting', () => {
    it('asks for a pairing code and sends nothing without one', async () => {
        const server = fakeOpenCode();
        const app = await openSettingsFor(server);
        assert.equal(app.calls.length, 0);
        assert.match(status(app).textContent, /^Paste a pairing code \("opencode api POST \/api\/pair"\)/);
        assert.equal(app.$('cfgKeyLabelText').textContent, 'Pairing code');
        assert.match(app.$('cfgKeyHint').textContent, /opencode service status/);
        assert.equal(app.$('cfgBase').value, BASE);
        assert.ok(!app.$('cfgBaseWrap').classList.contains('hidden'), 'the URL is editable: the port can change');
    });

    it('redeems a pasted pairing code for a token and lists the models', async () => {
        const server = fakeOpenCode();
        const app = await openSettingsFor(server);
        app.typeInto('cfgKey', CODE);
        await wait(750);

        // first it tries the text as a token (401), then redeems it as a code asking for JSON
        assert.deepEqual(app.calls.map((c) => new URL(c.url).pathname), ['/api/model', `/auth/connect/${CODE}`, '/api/model']);
        assert.equal(server.redeemed[0].accept, 'application/json');
        assert.equal(app.calls[0].headers.Authorization, basic(CODE));
        assert.equal(app.calls[2].headers.Authorization, basic(TOKEN), 'Basic auth with user "opencode", not Bearer');
        assert.match(status(app).textContent, /models available/);
    });

    it('the token replaces the code in the field and is stored; the code is never reused', async () => {
        const server = fakeOpenCode();
        const app = await openSettingsFor(server);
        app.typeInto('cfgKey', CODE);
        await wait(750);
        assert.equal(app.$('cfgKey').value, TOKEN);
        assert.match(app.window.sessionStorage.getItem('paperclaro.keys.v1'), new RegExp(TOKEN));

        app.calls.length = 0;
        app.$('cfgModelRefresh').click();
        await app.settle();
        assert.deepEqual(app.calls.map((c) => new URL(c.url).pathname), ['/api/model'], 'the stored token is used directly');
        assert.equal(server.redeemed.length, 1, 'the one-time code was redeemed exactly once');
    });

    it('lists chat models only, free ones first, with provider/model ids', async () => {
        const app = await openSettingsFor(fakeOpenCode());
        app.typeInto('cfgKey', CODE);
        await wait(750);
        assert.deepEqual(options(app), [
            '',
            'opencode/big-pickle', 'opencode/tidepool-alpha-free',      // free first, by id
            'ollama/qwen3.8:latest', 'opencode/claude-sonnet-5-5',      // then the rest, by id
            '__custom__'
        ], 'the disabled model and the image-only model are not offered');
    });

    it('marks the free models and picks the first one for you', async () => {
        const app = await openSettingsFor(fakeOpenCode());
        app.typeInto('cfgKey', CODE);
        await wait(750);
        const labels = [...app.$('cfgModelSelect').options].map((o) => o.text);
        assert.ok(labels.includes('opencode/big-pickle — Big Pickle · free'), labels.join(' | '));
        assert.ok(labels.includes('opencode/claude-sonnet-5-5 — Claude Sonnet 5.5'), 'paid models carry no "free" mark');
        assert.equal(app.$('cfgModel').value, 'opencode/big-pickle');
        assert.equal(app.$('cfgModelSelect').value, 'opencode/big-pickle');
    });

    it('rejects an invalid or already used code with the instructions to get a new one', async () => {
        const server = fakeOpenCode({ codeUsed: true });
        const app = await openSettingsFor(server);
        app.typeInto('cfgKey', CODE);
        await wait(750);
        assert.match(status(app).textContent, /did not accept that code or token\. Pairing codes work once and expire after 5 minutes/);
        assert.ok(status(app).className.includes('text-amber-700'));
        assert.ok(app.$('cfgModelSelect').classList.contains('hidden'));
        app.window.setLang('es');
        assert.match(status(app).textContent, /^OpenCode no aceptó ese código ni token/);
    });

    it('says how to find the service when it is not running (and mentions file://)', async () => {
        const app = await openSettingsFor(fakeOpenCode());
        app.handler = () => { throw new TypeError('Failed to fetch'); };
        app.typeInto('cfgKey', CODE);
        await wait(750);
        assert.match(status(app).textContent, /^Could not reach OpenCode at http:\/\/127\.0\.0\.1:49374\. Check that it is running \("opencode service status"/);
        assert.match(status(app).textContent, /not as a file \(file:\/\/\)/);
        app.window.setLang('es');
        assert.match(status(app).textContent, /^No se pudo conectar con OpenCode en http:\/\/127\.0\.0\.1:49374/);
    });

    it('the label and hint follow the language, and go back to "API key" for other providers', async () => {
        const app = await openSettingsFor(fakeOpenCode());
        app.window.setLang('es');
        assert.equal(app.$('cfgKeyLabelText').textContent, 'Código de emparejamiento');
        assert.match(app.$('cfgKeyHint').textContent, /Necesita OpenCode en marcha/);
        app.pick('OpenAI');
        assert.equal(app.$('cfgKeyLabelText').textContent, 'Clave de API');
        app.window.setLang('en');
        assert.equal(app.$('cfgKeyLabelText').textContent, 'API key');
    });

    it('a different port can be typed and is used for the requests', async () => {
        const server = fakeOpenCode();
        const app = await openSettingsFor(server);
        app.calls.length = 0;
        app.typeInto('cfgKey', CODE);
        app.commit('cfgBase', 'http://127.0.0.1:51000/');
        await app.settle();
        assert.ok(app.calls.length > 0 && app.calls.every((c) => c.url.startsWith('http://127.0.0.1:51000/')));
    });

    it('is configured only with a token and a model', async () => {
        const app = await boot();
        app.run("llm.provider = 'opencode'; llm.keys = {}");
        assert.equal(app.run('isConfigured()'), false);
        app.run("llm.keys.opencode = 'tok'");
        assert.equal(app.run('isConfigured()'), false, 'no model yet');
        app.run("llm.models.opencode = 'opencode/big-pickle'");
        assert.equal(app.run('isConfigured()'), true);
        assert.equal(app.run('searchAvailable()'), false, 'no web search through OpenCode');
    });
});

describe('OpenCode (local): generating', () => {
    it('creates a session for the model and calls generate with the system prompt and the paper request', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server, 'opencode/deepseek-v4.1-flash-free');
        await analyze(app);

        assert.deepEqual(server.created[0].model, { providerID: 'opencode', id: 'deepseek-v4.1-flash-free' });
        assert.equal(server.created[0].title, 'PaperClaro AI');
        assert.equal(server.generated.length, 1);
        const { prompt } = server.generated[0];
        assert.match(prompt, /^You are PaperClaro AI/);
        assert.match(prompt, /Identify and explain the following scientific study or paper: "Attention Is All You Need"/);
        assert.equal(app.lastCall('/generate').headers.Authorization, basic(TOKEN));
        assert.equal(app.$('resultSourceBadge').textContent, '🧠 Model knowledge');
        assert.match(app.$('historyList').textContent, /Test Paper/);
        assert.equal(app.$('validationBanner').classList.contains('hidden'), true);
    });

    it('never sends a `permissions` list (deny-all makes the service refuse every request)', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        await analyze(app);
        assert.equal('permissions' in server.created[0], false);
    });

    it('ids with a slash after the provider are split at the first one', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server, 'openrouter/anthropic/claude-3.5');
        await analyze(app);
        assert.deepEqual(server.created[0].model, { providerID: 'openrouter', id: 'anthropic/claude-3.5' });
    });

    it('reuses one session per model, even across page reloads (same tab)', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        await analyze(app);
        await analyze(app);
        assert.equal(server.created.length, 1);
        assert.equal(new Set(server.generated.map((g) => g.session)).size, 1);

        app.run("llm.models.opencode = 'opencode/tidepool-alpha-free'");
        await analyze(app);
        assert.equal(server.created.length, 2, 'another model gets its own session');
    });

    it('follow-up questions carry the whole conversation, because generate keeps no history', async () => {
        const server = fakeOpenCode({ generate: (prompt) => json({ data: { text: prompt.includes('Conversation so far') ? 'The answer to your question.' : '# Test Paper\n\nFIRST-ANSWER-BODY' } }) });
        const app = await pairedApp(server);
        await analyze(app);
        app.window.askSuggestedQuestion(1);
        await app.settle();

        const { prompt } = server.generated[1];
        assert.match(prompt, /Conversation so far:/);
        assert.match(prompt, /User: Analyzed paper: "Test Paper"/);
        assert.ok(prompt.includes('Assistant: # Test Paper\n\nFIRST-ANSWER-BODY'), 'the first explanation is part of the context');
        assert.match(prompt, /User: What limitations or weaknesses does this method have\?/);
        assert.match(prompt, /Reply to the last User message as the Assistant\.$/);
        assert.match(prompt, /^You are PaperClaro AI, an expert science tutor/);
        assert.match(app.$('chatMessagesContainer').textContent, /The answer to your question\./);
    });

    it('creates a new session when the service forgot the cached one (restart or deleted)', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        await analyze(app);
        server.sessions.clear();                 // the service lost its sessions
        await analyze(app);
        assert.equal(server.created.length, 2);
        assert.equal(app.$('validationBanner').classList.contains('hidden'), true);
        assert.equal(app.$('sessionCountText').textContent, '2 papers analyzed');
    });

    it('a rejected token asks to pair again, without retrying', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        app.run("llm.keys.opencode = 'expired-token'");
        await analyze(app);
        assert.equal(app.calls.length, 1, 'a 401 is final');
        assert.match(app.$('validationMessage').textContent, /OpenCode rejected the token.*Pair again: run "opencode api POST \/api\/pair"/);
    });

    it('shows the free-usage-limit message from OpenCode and does not retry', async () => {
        const server = fakeOpenCode({ generate: () => json({ _tag: 'ServiceUnavailableError', message: 'Free usage limit reached. Free models work in OpenCode (https://opencode.ai); subscribe to OpenCode Go to keep going: https://opencode.ai/go' }, 503) });
        const app = await pairedApp(server);
        await analyze(app);
        assert.equal(server.generated.length, 1, 'no retries on a usage limit');
        assert.match(app.$('validationMessage').textContent, /API error \(503\): Free usage limit reached\./);
        assert.equal(app.$('sessionCountText').textContent, '0 papers analyzed');
    });

    it('explains a stopped service during an analysis', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        app.handler = () => { throw new TypeError('Failed to fetch'); };
        await analyze(app);
        assert.match(app.$('validationMessage').textContent, /Could not connect to OpenCode at http:\/\/127\.0\.0\.1:49374\. Is it running/);
        assert.equal(app.$('analyzeBtn').disabled, false);
    });

    it('an empty text is reported instead of showing a blank result', async () => {
        const server = fakeOpenCode({ generate: () => json({ data: { text: '' } }) });
        const app = await pairedApp(server);
        await analyze(app);
        assert.match(app.$('validationMessage').textContent, /No content was received/);
    });

    it('works with the prompts of the other language too', async () => {
        const server = fakeOpenCode();
        const app = await pairedApp(server);
        app.window.setLang('es');
        await analyze(app);
        assert.match(server.generated[0].prompt, /^Eres PaperClaro AI/);
    });
});
