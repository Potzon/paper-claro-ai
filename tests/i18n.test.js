'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { boot, disposeAll, read, ROOT } = require('./helpers/app');

// Static consistency checks: they catch a missing translation or a broken handler before it reaches a user.
describe('translations and markup', () => {
    let app, en, es, htmlKeys;
    const appSource = read('src/app.js');

    before(async () => {
        app = await boot();
        const keysOf = (lang) => new Set(app.run(`Object.keys(I18N.${lang})`));
        en = keysOf('en');   // already includes the English texts read from index.html
        es = keysOf('es');
        htmlKeys = new Set();
        for (const el of app.document.querySelectorAll('[data-i18n]')) htmlKeys.add(el.dataset.i18n);
        for (const el of app.document.querySelectorAll('[data-i18n-attr]')) {
            el.dataset.i18nAttr.split(';').forEach((pair) => htmlKeys.add(pair.split(':')[1].trim()));
        }
    });
    after(disposeAll);

    it('every key used in index.html has a Spanish translation', async () => {
        const missing = [...htmlKeys].filter((k) => !es.has(k));
        assert.deepEqual(missing, []);
    });

    it('every English key has a Spanish one, and the other way round', async () => {
        assert.deepEqual([...en].filter((k) => !es.has(k)), [], 'missing in es');
        // 'prov.*' are Spanish-only overrides of provider names/labels (English lives in PROVIDERS)
        assert.deepEqual([...es].filter((k) => !en.has(k) && !k.startsWith('prov.')), [], 'missing in en');
    });

    it('placeholders ({name}) match between languages', async () => {
        const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
        const mismatched = [...en].filter((k) => {
            const enText = app.run(`I18N.en[${JSON.stringify(k)}]`);
            const esText = app.run(`I18N.es[${JSON.stringify(k)}]`);
            return esText !== undefined && placeholders(enText) !== placeholders(esText);
        });
        assert.deepEqual(mismatched, []);
    });

    it('every t("key") literal in app.js is defined in both languages', async () => {
        const used = new Set([...appSource.matchAll(/\bt\('([^']+)'/g)].map((m) => m[1]));
        for (const m of appSource.matchAll(/setModelsStatus\('([^']+)'/g)) used.add(m[1]);
        for (const m of appSource.matchAll(/\? '(models\.\w+|base\.\w+)' :/g)) used.add(m[1]);
        assert.ok(used.size > 40, 'the scan should find the keys');
        const undefinedKeys = [...used].filter((k) => !en.has(k) || !es.has(k));
        assert.deepEqual(undefinedKeys, []);
    });

    it('keys built from templates exist for every id', async () => {
        const levels = ['simple', 'university', 'researcher'];
        const focuses = ['full', 'tldr', 'glossary', 'critique'];
        const providers = app.run('Object.keys(PROVIDERS)');
        const keys = [
            ...levels.flatMap((l) => [`lvl.${l}.name`, `lvl.${l}.short`, `prompt.level.${l}`]),
            ...focuses.flatMap((f) => [`fcs.${f}.name`, `fcs.${f}.short`, `prompt.focus.${f}`]),
            ...providers.map((p) => `hint.${p}`),
            ...[1, 2, 3, 4].flatMap((n) => [`chat.q${n}.full`, `load.${n}.title`, `load.${n}.sub`]),
            ...['transformers', 'alphafold', 'dna'].map((e) => `ex.${e}.query`)
        ];
        assert.deepEqual(keys.filter((k) => !en.has(k) || !es.has(k)), []);
    });

    it('no Spanish text is left in app.js or i18n.js outside the dictionary', async () => {
        const spanish = /[áéíóúñ¿¡]/;
        const offending = appSource.split('\n')
            .map((line, i) => ({ line: i + 1, text: line.trim() }))
            .filter(({ text }) => spanish.test(text));
        assert.deepEqual(offending, []);
        // i18n.js: Spanish is only allowed inside the `es` dictionary
        const i18n = read('src/i18n.js');
        const beforeEs = i18n.slice(0, i18n.indexOf('    es: {'));
        assert.ok(!spanish.test(beforeEs), 'English dictionary / header must not contain Spanish characters');
    });

    it('the product is called "PaperClaro AI" everywhere, in both languages', async () => {
        const files = ['index.html', 'src/app.js', 'src/i18n.js', 'README.md', 'README.es.md', 'NOTICE', 'package.json'];
        const old = files.filter((f) => /PaperClaro IA|paperclaro-ia/i.test(read(f)));
        assert.deepEqual(old, []);
    });

    it('every function called from an inline handler exists', async () => {
        const handlers = [...read('index.html').matchAll(/\son\w+="([^"]*)"/g)].map((m) => m[1]);
        assert.ok(handlers.length > 20);
        const called = new Set();
        for (const code of handlers) for (const m of code.matchAll(/\b([A-Za-z_]\w*)\(/g)) called.add(m[1]);
        called.delete('if');
        const missing = [...called].filter((name) => typeof app.window[name] !== 'function');
        assert.deepEqual(missing, []);
    });

    it('every element id used by app.js exists in index.html', async () => {
        const ids = new Set([...read('index.html').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
        const used = [...appSource.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);
        assert.deepEqual([...new Set(used)].filter((id) => !ids.has(id)), []);
    });

    it('the page starts in English and the favicon file exists', async () => {
        assert.equal(app.document.documentElement.lang, 'en');
        const href = app.document.querySelector('link[rel="icon"]').getAttribute('href');
        assert.ok(fs.existsSync(path.join(ROOT, href)), `${href} should exist`);
    });
});
