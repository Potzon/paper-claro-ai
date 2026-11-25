'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll } = require('./helpers/app');

afterEach(disposeAll);

describe('language: English by default, Spanish as an alternative', () => {
    it('starts in English: static texts, attributes, counters and status', async () => {
        const app = await boot();
        assert.equal(app.document.documentElement.lang, 'en');
        assert.equal(app.document.title, 'PaperClaro AI');
        assert.equal(app.document.querySelector('[data-i18n="btn.newPaper"]').textContent, 'New Paper');
        assert.equal(app.$('sessionCountText').textContent, '0 papers analyzed');
        assert.equal(app.$('apiStatusText').textContent, 'Set up API');
        assert.match(app.$('searchStatusText').textContent, /^Web search active/);
        assert.equal(app.document.querySelector('.lang-btn[data-lang="en"]').getAttribute('aria-pressed'), 'true');
        assert.equal(app.document.querySelector('.lang-btn[data-lang="es"]').getAttribute('aria-pressed'), 'false');
    });

    it('switching to Spanish translates text, HTML fragments, attributes and the brand', async () => {
        const app = await boot();
        app.window.setLang('es');
        assert.equal(app.document.documentElement.lang, 'es');
        assert.equal(app.document.querySelector('[data-i18n="btn.newPaper"]').textContent, 'Nuevo Paper');
        assert.match(app.$('paperTitleInput').placeholder, /^Ej\./);
        assert.match(app.document.querySelector('[data-i18n="side.tipBody"]').innerHTML, /<strong>Sencillo<\/strong>/);
        assert.equal(app.$('sessionCountText').textContent, '0 papers analizados');
        assert.equal(app.$('apiStatusText').textContent, 'Configurar API');
        assert.match(app.document.querySelector('[data-i18n="brand.html"]').textContent, /PaperClaro AI/);
        assert.equal(app.document.querySelector('.lang-btn[data-lang="es"]').getAttribute('aria-pressed'), 'true');
    });

    it('switching back restores the English texts exactly (they come from the page itself)', async () => {
        const app = await boot();
        const before = [...app.document.querySelectorAll('[data-i18n]')].map((el) => el.innerHTML);
        app.window.setLang('es');
        app.window.setLang('en');
        const after = [...app.document.querySelectorAll('[data-i18n]')].map((el) => el.innerHTML);
        assert.deepEqual(after, before);
        assert.match(app.$('paperTitleInput').placeholder, /^E\.g\./);
    });

    it('remembers the choice and applies a stored preference on load', async () => {
        const first = await boot();
        first.window.setLang('es');
        assert.equal(first.window.localStorage.getItem('paperclaro.lang.v1'), 'es');

        const second = await boot({ lang: 'es' });
        assert.equal(second.document.documentElement.lang, 'es');
        assert.equal(second.document.querySelector('[data-i18n="btn.newPaper"]').textContent, 'Nuevo Paper');
        assert.equal(second.document.querySelector('.lang-btn[data-lang="es"]').getAttribute('aria-pressed'), 'true');
    });

    it('ignores unknown languages and corrupt stored values', async () => {
        const app = await boot({ lang: 'klingon' });
        assert.equal(app.document.documentElement.lang, 'en');
        app.window.setLang('xx');
        assert.equal(app.document.documentElement.lang, 'en');
    });

    it('the model gets English prompts in English and Spanish prompts in Spanish', async () => {
        const app = await boot();
        app.configure('gemini');
        app.$('paperTitleInput').value = 'Attention Is All You Need';
        await app.window.analyzePaper();

        const sent = app.lastCall('generateContent').body;
        const system = sent.systemInstruction.parts[0].text;
        assert.match(system, /^You are PaperClaro AI/);
        assert.match(system, /UNIVERSITY/);
        assert.match(system, /STRUCTURED FULL ANALYSIS/);
        assert.match(sent.contents[0].parts[0].text, /^Identify and explain the following/);
        assert.doesNotMatch(system + sent.contents[0].parts[0].text, /\{(level|focus|query|text|title)\}/, 'no unreplaced placeholders');

        app.window.setLang('es');
        app.calls.length = 0;
        await app.window.analyzePaper();
        const sentEs = app.lastCall('generateContent').body;
        assert.match(sentEs.systemInstruction.parts[0].text, /^Eres PaperClaro AI/);
        assert.match(sentEs.contents[0].parts[0].text, /^Identifica y explica/);
    });

    it('a result on screen follows the language: badges, history, counter and chat hint', async () => {
        const app = await boot();
        app.configure('gemini');
        app.$('paperTitleInput').value = 'Some paper';
        await app.window.analyzePaper();

        assert.equal(app.$('resultLevelBadge').textContent, '🎓 University Level');
        assert.equal(app.$('resultFocusBadge').textContent, '📑 Full Analysis');
        assert.equal(app.$('resultSourceBadge').textContent, '🔍 Academic Search');
        assert.equal(app.$('sessionCountText').textContent, '1 paper analyzed');
        assert.match(app.$('historyList').textContent, /University/);
        assert.equal(app.$('analyzeBtnText').textContent, 'Explain Paper with AI');

        app.window.setLang('es');
        assert.equal(app.$('resultLevelBadge').textContent, '🎓 Nivel Universitario');
        assert.equal(app.$('resultSourceBadge').textContent, '🔍 Búsqueda Académica');
        assert.equal(app.$('sessionCountText').textContent, '1 paper analizado');
        assert.match(app.$('historyList').textContent, /Universitario/);
        assert.match(app.$('chatEmptyPrompt').textContent, /Haz clic/);
        assert.equal(app.$('analyzeBtnText').textContent, 'Explicar Paper con IA');
    });

    it('quick level/focus switches work with language-neutral ids and highlight the active button', async () => {
        const app = await boot();
        app.configure('gemini');
        app.$('paperTitleInput').value = 'Some paper';
        await app.window.analyzePaper();

        app.calls.length = 0;
        app.window.quickReanalyzeLevel('researcher');
        await app.settle();
        assert.match(app.lastCall('generateContent').body.systemInstruction.parts[0].text, /RESEARCHER/);
        assert.ok(app.document.querySelector('.quick-lvl-btn[onclick*="researcher"]').classList.contains('bg-indigo-700'));

        app.window.quickReanalyzeFocus('critique');
        await app.settle();
        assert.match(app.lastCall('generateContent').body.systemInstruction.parts[0].text, /CRITICAL READING/);
        assert.ok(app.document.querySelector('.quick-fcs-btn[onclick*="critique"]').classList.contains('bg-emerald-700'));
        assert.equal(app.document.querySelectorAll('#historyList > button').length, 3, 'each re-analysis is a history entry');
    });

    it('re-analysis keeps the source of the original paper (pasted text stays "Provided Text")', async () => {
        const app = await boot();
        app.configure('gemini');
        app.window.switchInputTab('text');
        app.$('paperTextInput').value = 'A long enough abstract about protein folding and attention.';
        await app.window.analyzePaper();
        assert.equal(app.$('resultSourceBadge').textContent, '📄 Provided Text');
        app.window.quickReanalyzeLevel('simple');
        await app.settle();
        assert.equal(app.$('resultSourceBadge').textContent, '📄 Provided Text');
        // and no web search is requested for pasted text
        assert.equal(app.lastCall('generateContent').body.tools, undefined);
    });

    it('suggested questions are sent in the current language, with the level in the chat system prompt', async () => {
        const app = await boot();
        app.configure('gemini');
        app.$('paperTitleInput').value = 'Some paper';
        await app.window.analyzePaper();

        app.calls.length = 0;
        app.window.askSuggestedQuestion(1);
        await app.settle();
        let body = app.lastCall('generateContent').body;
        assert.equal(body.contents.at(-1).parts[0].text, 'What limitations or weaknesses does this method have?');
        assert.match(body.systemInstruction.parts[0].text, /University Level/);
        assert.equal(app.$('chatMessagesContainer').children.length, 2, 'question + answer bubbles');
        assert.match(app.$('chatMessagesContainer').textContent, /AI/);

        app.window.setLang('es');
        app.calls.length = 0;
        app.window.askSuggestedQuestion(2);
        await app.settle();
        body = app.lastCall('generateContent').body;
        assert.equal(body.contents.at(-1).parts[0].text, '¿Cómo se compara con trabajos anteriores en su campo?');
        assert.match(body.systemInstruction.parts[0].text, /Nivel Universitario/);
    });

    it('one-click examples send the query of the current language', async () => {
        const app = await boot();
        app.configure('gemini');
        app.window.loadExample('alphafold');
        await app.settle();   // loadExample does not return the analysis promise
        assert.match(app.lastCall('generateContent').body.contents[0].parts[0].text, /Prediction of three-dimensional protein structures/);

        app.window.setLang('es');
        app.calls.length = 0;
        app.window.loadExample('alphafold');
        await app.settle();
        assert.match(app.lastCall('generateContent').body.contents[0].parts[0].text, /Predicción de estructuras tridimensionales/);
    });

    it('pasted text is wrapped with the document delimiters of the language', async () => {
        const app = await boot();
        app.configure('gemini');
        app.window.switchInputTab('text');
        app.$('paperTextInput').value = 'Abstract: we propose a thing with $x_1$ and {level} braces and $& tokens.';
        await app.window.analyzePaper();
        const text = app.lastCall('generateContent').body.contents[0].parts[0].text;
        assert.match(text, /--- START OF DOCUMENT ---/);
        // user text with braces / `$&` must reach the model untouched
        assert.ok(text.includes('with $x_1$ and {level} braces and $& tokens.'));
    });

    it('validation messages follow the language', async () => {
        const app = await boot();
        app.configure('gemini');
        await app.window.analyzePaper();
        assert.match(app.$('validationMessage').textContent, /^Enter the title of a paper/);
        app.window.setLang('es');
        await app.window.analyzePaper();
        assert.match(app.$('validationMessage').textContent, /^Escribe el título de un paper/);
    });

    it('the word counter uses the locale of the language', async () => {
        const app = await boot();
        app.$('paperTextInput').value = Array(15000).fill('word').join(' ');
        app.window.updateTextCounter();
        assert.match(app.$('textCharCounter').textContent, /^15,000 words · 74,999 characters$/);
        app.window.setLang('es');
        assert.match(app.$('textCharCounter').textContent, /^15\.000 palabras · 74\.999 caracteres$/);
    });

    it('t() inserts values literally: `$` patterns and braces in user text are not interpreted', async () => {
        const app = await boot();
        const out = app.t('prompt.userDoc', { text: 'costs $& and $1 and {level}' });
        assert.ok(out.includes('costs $& and $1 and {level}'));
    });

    it('unknown keys come back as the key itself (easy to spot)', async () => {
        assert.equal((await boot()).t('does.not.exist'), 'does.not.exist');
    });
});
