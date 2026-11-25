'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll, json, COMPLETION } = require('./helpers/app');

afterEach(disposeAll);

// Runs one analysis by title with the given provider already configured.
async function analyze(app, title = 'Attention Is All You Need') {
    app.$('paperTitleInput').value = title;
    await app.window.analyzePaper();
}

describe('provider selector', () => {
    it('lists every provider, with Grok next to the other model makers', async () => {
        const app = await boot();
        app.window.openSettings();
        const names = app.providerButtons().map((b) => b.textContent.trim().replace('⚙', ''));
        assert.deepEqual(names, ['Gemini', 'OpenAI', 'Claude', 'Grok', 'OpenRouter', 'Groq', 'Ollama (local)', 'OpenCode (local)', 'Other API (OpenAI)']);
    });

    it('draws a brand logo for each provider; Grok and OpenCode need the even-odd fill rule', async () => {
        const app = await boot();
        app.window.openSettings();
        const svgs = app.providerButtons().map((b) => b.querySelector('svg'));
        assert.equal(svgs.filter(Boolean).length, 8, 'the generic "Other API" has a text badge instead');
        const evenodd = app.providerButtons().filter((b) => b.querySelector('svg')?.getAttribute('fill-rule') === 'evenodd');
        assert.deepEqual(evenodd.map((b) => b.textContent.trim()), ['Grok', 'OpenCode (local)']);
    });

    it('selecting a provider fills its default model and shows its key hint', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('Grok');
        assert.equal(app.$('cfgModel').value, 'grok-4');
        assert.equal(app.$('cfgKeyHint').textContent, 'Starts with xai-… (console.x.ai)');
        app.window.setLang('es');
        assert.match(app.$('cfgKeyHint').textContent, /^Empieza por xai-/);
    });

    it('translates the provider names that differ and shows the key toggle in both languages', async () => {
        const app = await boot();
        app.window.openSettings();
        assert.equal(app.$('cfgKeyToggle').textContent, 'Show');
        app.window.setLang('es');
        assert.equal(app.$('cfgKeyToggle').textContent, 'Mostrar');
        assert.match(app.$('cfgProviderGrid').textContent, /Otra API \(OpenAI\)/);
        app.window.setLang('en');
        assert.match(app.$('cfgProviderGrid').textContent, /Other API \(OpenAI\)/);
    });

    it('saving stores the provider and reports whether the setup is complete', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('OpenAI');
        app.window.saveSettingsFromModal();
        assert.match(app.$('toastText').textContent, /missing/, 'no key -> incomplete');
        assert.equal(app.$('apiStatusText').textContent, 'Set up API');

        app.window.openSettings();
        app.$('cfgKey').value = 'sk-test';
        app.window.saveSettingsFromModal();
        assert.equal(app.$('toastText').textContent, 'Provider configured');
        assert.equal(app.$('apiStatusText').textContent, 'OpenAI · gpt-4o-mini');
    });

    it('the key lives in sessionStorage unless "Remember" is ticked', async () => {
        const app = await boot();
        app.window.openSettings();
        app.pick('OpenAI');
        app.$('cfgKey').value = 'sk-secret';
        app.$('cfgRemember').checked = false;
        app.window.saveSettingsFromModal();
        assert.match(app.window.sessionStorage.getItem('paperclaro.keys.v1') || '', /sk-secret/);
        assert.equal(app.window.localStorage.getItem('paperclaro.keys.v1'), null);

        app.window.openSettings();
        app.$('cfgRemember').checked = true;
        app.window.saveSettingsFromModal();
        assert.match(app.window.localStorage.getItem('paperclaro.keys.v1') || '', /sk-secret/);
        assert.equal(app.window.sessionStorage.getItem('paperclaro.keys.v1'), null);

        // "Delete all saved keys" really wipes both
        app.window.openSettings();
        app.window.forgetKeys();
        assert.equal(app.window.localStorage.getItem('paperclaro.keys.v1'), '{}');
    });

    it('is configured only when the provider has what it needs', async () => {
        const app = await boot();
        const configured = (code) => app.run(`${code}; isConfigured()`);
        assert.equal(configured("llm.provider = 'gemini'; llm.keys = {}"), false, 'Gemini needs a key');
        assert.equal(configured("llm.keys.gemini = 'k'"), true);
        assert.equal(configured("llm.provider = 'ollama'; llm.keys = {}"), true, 'Ollama needs no key');
        assert.equal(configured("llm.provider = 'custom'; llm.keys = {}"), false, 'custom needs base URL and model');
        assert.equal(configured("llm.bases.custom = 'https://x.test/v1'; llm.models.custom = 'm'"), true);
    });

    it('asks for settings instead of calling the provider when not configured', async () => {
        const app = await boot();
        await analyze(app);
        assert.equal(app.calls.length, 0);
        assert.equal(app.$('settingsModal').classList.contains('hidden'), false);
        assert.equal(app.$('settingsError').textContent, 'Set up a provider and your API key to analyze papers.');
    });
});

describe('request formats', () => {
    it('Gemini: model in the URL, key header, system instruction and web search for titles only', async () => {
        const app = await boot();
        app.configure('gemini', 'g-key');
        await analyze(app);
        const call = app.lastCall('generateContent');
        assert.equal(call.url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent');
        assert.equal(call.method, 'POST');
        assert.equal(call.headers['x-goog-api-key'], 'g-key');
        assert.deepEqual(call.body.tools, [{ google_search: {} }]);
        assert.equal(call.body.contents[0].role, 'user');
        assert.ok(call.body.systemInstruction.parts[0].text.startsWith('You are PaperClaro AI'));

        app.window.switchInputTab('text');
        app.$('paperTextInput').value = 'A pasted abstract that is long enough to be analyzed.';
        app.calls.length = 0;
        await app.window.analyzePaper();
        assert.equal(app.lastCall('generateContent').body.tools, undefined, 'no search for pasted text');
    });

    it('Anthropic: browser-access header, version, system prompt and message roles', async () => {
        const app = await boot();
        app.configure('anthropic', 'sk-ant-x');
        await analyze(app);
        const call = app.lastCall('api.anthropic.com/v1/messages');
        assert.equal(call.headers['x-api-key'], 'sk-ant-x');
        assert.equal(call.headers['anthropic-version'], '2023-06-01');
        assert.equal(call.headers['anthropic-dangerous-direct-browser-access'], 'true');
        assert.equal(call.body.model, 'claude-sonnet-5-5');
        assert.equal(call.body.max_tokens, 8192);
        assert.ok(call.body.system.startsWith('You are PaperClaro AI'));
        assert.deepEqual(call.body.messages.map((m) => m.role), ['user']);
        assert.equal(app.$('explanationOutput').textContent.includes('Test Paper') || app.$('resultLevelBadge').textContent.length > 0, true);
    });

    for (const [provider, url, model] of [
        ['openai', 'https://api.openai.com/v1/chat/completions', 'gpt-4o-mini'],
        ['openrouter', 'https://openrouter.ai/api/v1/chat/completions', 'openai/gpt-4o-mini'],
        ['groq', 'https://api.groq.com/openai/v1/chat/completions', 'llama-3.3-70b-versatile'],
        ['grok', 'https://api.x.ai/v1/chat/completions', 'grok-4']
    ]) {
        it(`${provider}: OpenAI-compatible request to ${url}`, async () => {
            const app = await boot();
            app.configure(provider, 'sk-test');
            await analyze(app);
            const call = app.lastCall('/chat/completions');
            assert.equal(call.url, url);
            assert.equal(call.headers.Authorization, 'Bearer sk-test');
            assert.equal(call.body.model, model);
            assert.equal(call.body.messages[0].role, 'system');
            assert.equal(call.body.messages[1].role, 'user');
            assert.equal(call.body.tools, undefined, 'web search is Gemini-only');
            assert.equal('reasoning_effort' in call.body, false, 'only Ollama gets it: other APIs reject parameters they do not know');
        });
    }

    it('Ollama: local endpoint and no Authorization header without a key', async () => {
        const app = await boot();
        app.run("llm.provider = 'ollama'; llm.models.ollama = 'qwen3.8:latest'");
        await analyze(app);
        const call = app.lastCall('/chat/completions');
        assert.equal(call.url, 'http://localhost:11434/v1/chat/completions');
        assert.equal('Authorization' in call.headers, false);
        assert.equal(call.body.model, 'qwen3.8:latest');
    });

    it('Ollama: asks reasoning models not to think, in the explanation and in the follow-ups', async () => {
        const app = await boot();
        app.run("llm.provider = 'ollama'; llm.models.ollama = 'qwen3.8:latest'");
        await analyze(app);
        assert.equal(app.lastCall('/chat/completions').body.reasoning_effort, 'none');
        app.calls.length = 0;
        app.$('chatInput').value = 'What is the main result?';
        await app.window.handleChatSubmit({ preventDefault() {} });
        await app.settle();
        assert.equal(app.lastCall('/chat/completions').body.reasoning_effort, 'none');
    });

    it('other API pointing at a local server does not get reasoning_effort', async () => {
        const app = await boot();
        app.run("llm.provider = 'custom'; llm.bases.custom = 'http://localhost:1234/v1'; llm.models.custom = 'm'");
        await analyze(app);
        assert.equal('reasoning_effort' in app.lastCall('/chat/completions').body, false);
    });

    it('other API: uses the base URL typed by the user', async () => {
        const app = await boot();
        app.run("llm.provider = 'custom'; llm.bases.custom = 'https://llm.example.com/v1'; llm.models.custom = 'my-model'; llm.keys.custom = 'abc'");
        await analyze(app);
        const call = app.lastCall('/chat/completions');
        assert.equal(call.url, 'https://llm.example.com/v1/chat/completions');
        assert.equal(call.headers.Authorization, 'Bearer abc');
    });

    it('without a search-capable provider the result is labelled as model knowledge', async () => {
        const app = await boot();
        app.configure('openai');
        await analyze(app);
        assert.equal(app.$('resultSourceBadge').textContent, '🧠 Model knowledge');
        assert.match(app.$('searchStatusText').textContent, /^No web search/);
    });
});

describe('responses and errors', () => {
    it('the title comes from the first H1 of the answer and fills history and result', async () => {
        const app = await boot({ handler: () => json({ choices: [{ message: { content: '# **Attention** Is `All` You Need\n\n*Vaswani et al., 2017*\n\nText' } }] }) });
        app.configure('openai');
        await analyze(app);
        assert.match(app.$('historyList').textContent, /Attention Is All You Need/);
        assert.equal(app.$('resultSectionCard').classList.contains('hidden'), false);
    });

    it('Gemini grounding sources are shown, deduplicated and only for http(s) links', async () => {
        const app = await boot({
            handler: () => json({
                candidates: [{
                    content: { parts: [{ text: COMPLETION }, { text: 'hidden thought', thought: true }] },
                    groundingMetadata: {
                        groundingChunks: [
                            { web: { uri: 'https://a.example/paper', title: 'Paper A' } },
                            { web: { uri: 'https://a.example/paper', title: 'Paper A again' } },
                            { web: { uri: 'javascript:alert(1)', title: 'Evil' } },
                            { web: { uri: 'https://b.example/', title: 'Paper B' } }
                        ]
                    }
                }]
            })
        });
        app.configure('gemini');
        await analyze(app);
        const links = [...app.document.querySelectorAll('#groundingSourcesList a')];
        assert.deepEqual(links.map((a) => a.textContent), ['Paper A', 'Paper B']);
        assert.ok(links.every((a) => a.rel === 'noopener noreferrer' && a.target === '_blank'));
        assert.ok(!app.$('explanationOutput').textContent.includes('hidden thought'), 'thought parts are not shown');
    });

    it('401 is final (no retries) and explains the key problem', async () => {
        const app = await boot({ handler: () => json({ error: { message: 'bad key' } }, 401) });
        app.configure('openai');
        await analyze(app);
        assert.equal(app.calls.length, 1, 'authentication errors are not retried');
        const msg = app.$('validationMessage').textContent;
        assert.match(msg, /Invalid API key or missing permissions\. bad key/);
        assert.match(msg, /API error \(401\)/);
        assert.equal(app.$('validationBanner').classList.contains('hidden'), false);
    });

    it('400 is final too', async () => {
        const app = await boot({ handler: () => json({ error: { message: 'bad request' } }, 400) });
        app.configure('openai');
        await analyze(app);
        assert.equal(app.calls.length, 1);
        assert.match(app.$('validationMessage').textContent, /bad request/);
    });

    it('429 is retried and the analysis then succeeds', async () => {
        let n = 0;
        const app = await boot({ handler: () => (++n === 1 ? json({ error: { message: 'slow down' } }, 429) : json({ choices: [{ message: { content: COMPLETION } }] })) });
        app.configure('openai');
        await analyze(app);   // waits the 1 s back-off once
        assert.equal(app.calls.length, 2);
        assert.equal(app.$('validationBanner').classList.contains('hidden'), true);
        assert.equal(app.$('sessionCountText').textContent, '1 paper analyzed');
    });

    it('an empty answer is reported instead of showing a blank result', async () => {
        const app = await boot({ handler: () => json({ choices: [{ message: { content: '' } }] }) });
        app.configure('openai');
        await analyze(app);
        assert.match(app.$('validationMessage').textContent, /No content was received/);
        assert.equal(app.$('sessionCountText').textContent, '0 papers analyzed');
    });

    it('the analyze button is usable again after a failure', async () => {
        const app = await boot({ handler: () => json({}, 400) });
        app.configure('openai');
        await analyze(app);
        assert.equal(app.$('analyzeBtn').disabled, false);
        assert.equal(app.$('analyzeBtnText').textContent, 'Explain Paper with AI');
        assert.equal(app.$('loadingStateCard').classList.contains('hidden'), true);
    });

    it('a failed chat answer is shown in the chat, not as an exception', async () => {
        const app = await boot();
        app.configure('openai');
        await analyze(app);
        app.handler = () => json({ error: { message: 'boom' } }, 400);
        app.window.askSuggestedQuestion(1);
        await app.settle();
        assert.match(app.$('chatMessagesContainer').textContent, /Sorry, there was a problem processing your question/);
        assert.equal(app.$('chatInput').disabled, false);
    });

    it('long texts are cut at 85,000 characters with a note', async () => {
        const app = await boot();
        app.configure('openai');
        app.window.switchInputTab('text');
        app.$('paperTextInput').value = 'x'.repeat(90000);
        await app.window.analyzePaper();
        const sent = app.lastCall('/chat/completions').body.messages[1].content;
        assert.match(sent, /\[Note: Text truncated due to maximum length\]/);
        assert.ok(sent.length < 85500);
    });

    it('rejects files that are not .pdf or .txt', async () => {
        const app = await boot();
        await app.window.handleFileSelection({ name: 'photo.png' });
        assert.match(app.$('validationMessage').textContent, /Unsupported format/);
    });

    it('reads a .txt file and shows its card, in the language of the moment', async () => {
        const app = await boot();
        const text = 'This is the text of a paper. '.repeat(30);
        // files usually end with a newline: it must not be counted as an extra word
        await app.window.handleFileSelection({ name: 'paper.txt', text: async () => `\n${text}\n` });
        assert.equal(app.$('uploadedFileName').textContent, 'paper.txt');
        assert.match(app.$('uploadedFileMeta').textContent, /^Text file · 210 words$/);
        app.window.setLang('es');
        assert.match(app.$('uploadedFileMeta').textContent, /^Archivo de texto · 210 palabras$/);
        app.window.removeUploadedFile();
        assert.equal(app.$('uploadedFileCard').classList.contains('hidden'), true);
    });
});
