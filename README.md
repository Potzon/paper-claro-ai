# PaperClaro AI

[Español](README.es.md)

AI explainer for scientific papers. Search for a paper by title, paste its abstract or upload a PDF, and get an explanation adapted to your level, with a chat to ask follow-up questions.

It is a 100% client-side app: HTML, CSS and JavaScript, with no server and no accounts. **You bring your own API key.**

## Features

- Three ways to provide a paper: title or topic, pasted text, or a PDF/TXT file (PDFs are read in your browser).
- Three levels (simple, university, researcher) and four focuses (full analysis, executive summary, glossary, critical reading).
- Follow-up chat that keeps the paper's context.
- Math formulas with KaTeX and Markdown export.
- **English by default, with Spanish as an alternative.** Switch with the EN / ES toggle in the header; your choice is remembered in the browser. The language also decides the language of the generated explanation and of the chat answers.
- Several providers: **Google Gemini, OpenAI, Anthropic (Claude), Grok (xAI), OpenRouter, Groq, Ollama (local), OpenCode (local)** and any OpenAI-compatible API.
- When you enter your key, the app asks the provider which models are available and offers them in a dropdown (you can also type the name by hand).

## Usage

Serve the folder with any static server (for example `python3 -m http.server 8000` and open <http://localhost:8000>), click **Set up API**, choose a provider and paste your key.

> Web search when asking for a paper by title is only available with Gemini. With the other providers the model answers from its own knowledge and may get lesser-known papers wrong: double-check important details.

## No API key? Use the skill

A Claude Pro or Max subscription does not include an API key, so the web app cannot use it. For that case the repository ships the same prompts as an [Agent Skill](https://docs.claude.com/en/docs/claude-code/skills) in [`skill/paperclaro/`](skill/paperclaro/), which runs inside Claude Code or claude.ai with your subscription:

- **Claude Code:** copy the folder to `~/.claude/skills/paperclaro/` (or to `.claude/skills/` inside a project), then ask for example *"explain this paper at researcher level: ~/papers/attention.pdf"*.
- **claude.ai:** zip the `paperclaro` folder (`cd skill && zip -r paperclaro.zip paperclaro`) and upload it from the Skills section of the claude.ai settings (the menu name has changed over time; it needs *Code execution and file creation* enabled, and availability depends on your plan).

It offers the same three levels and four output focuses, answers in your language (English or Spanish prompts) and keeps answering follow-up questions. There is no history panel or chat window: it is the normal conversation.

## Privacy and security

- Your key and the content of your papers go **straight from your browser to the provider you choose**. They never pass through any server of this project.
- By default the key is only kept while the tab is open. If you tick "Remember", it is stored **unencrypted** in the browser's storage: don't do it on a shared computer.
- Use keys with a spending limit when the provider allows it.
- External libraries are loaded from a CDN with a pinned version and integrity checks (SRI). PDF.js and KaTeX are only downloaded when needed.

## Development

Node.js is only required to compile the Tailwind CSS.

```bash
npm install
npm run build   # generates dist/styles.css (minified)
npm run watch   # rebuilds on change
npm test        # runs the test suite (Node 22+)
```

`dist/styles.css` is committed so the site can be published with no build step (for example, on GitHub Pages).

Structure:

```
index.html          page markup (English texts, tagged with data-i18n)
src/i18n.js         translations (English / Spanish), language switch and model prompts
src/app.js          application logic and AI provider layer
src/input.css       custom styles + Tailwind directives
tailwind.config.js  Tailwind configuration
dist/styles.css     compiled CSS
tests/              test suite (node:test + jsdom)
.github/workflows/  CI: tests on Node 22 and 24, and a check that dist/styles.css is up to date
```

### Tests

`npm test` boots the real `index.html`, `src/i18n.js` and `src/app.js` in [jsdom](https://github.com/jsdom/jsdom) with a fake `fetch`, so no network or API key is needed (about 6 seconds). It covers:

- **Translations:** every key exists in both languages, placeholders match, no Spanish text leaks into the code, every inline handler and element id exists.
- **Language:** English by default, live switching, remembered choice, and that the prompts sent to the model follow the language.
- **Providers:** request format of Gemini, Anthropic and the OpenAI-compatible ones (OpenAI, OpenRouter, Groq, Grok, Ollama, other APIs), errors, retries, key storage.
- **Models and base URL:** automatic model listing, the single model picker, local Ollama, URL normalization and warnings.
- **Rendering:** Markdown, KaTeX protection and sanitization of model output (`marked` and `DOMPurify` are installed at the same versions the page loads from the CDN).

CI (`.github/workflows/ci.yml`) runs the suite on Node 22 and 24 and rebuilds the CSS to make sure the committed `dist/styles.css` matches the sources: if you add a Tailwind class, run `npm run build` and commit the result.

### Skill

`skill/paperclaro/` is generated from the prompts in `src/i18n.js`: do not edit it by hand. After changing a prompt run `npm run build:skill` and commit the result; a test fails if the skill is out of date.

### Translations

- Static texts live in `index.html` in English. An element is translated by tagging it with `data-i18n="key"` (its HTML is replaced) and/or `data-i18n-attr="placeholder:key; title:other.key"` (attributes). The English text is read from the page itself, so it is never duplicated.
- Texts built from JavaScript (toasts, status messages, labels) and the **prompts sent to the model** are in `src/i18n.js` and read with `t('key', { vars })`.
- `I18N.es` must contain every key. To add a language, add its dictionary to `I18N`, its code to `LANGS` / `LOCALES`, and a button with `data-lang` and `class="lang-btn"` next to the existing ones.

> **Ollama (local):** don't open `index.html` by double-clicking it (`file://`): the browser sends `Origin: null` and Ollama answers 403. Serve the folder instead, e.g. `python3 -m http.server 8000` and open <http://localhost:8000> (Ollama accepts `localhost` origins by default). To use another address or an HTTPS site, start Ollama with `OLLAMA_ORIGINS` set to that origin.

> **OpenCode (local):** uses the [OpenCode](https://opencode.ai) running on your computer, including its free models, so no API key is needed. Serve the app from `localhost` (same as Ollama) and:
>
> 1. `opencode service status` prints the URL of the service (`http://127.0.0.1:49374` by default; the port may change if the service restarts).
> 2. `opencode api POST /api/pair` prints a pairing code (single use, valid for 5 minutes).
> 3. In the settings choose **OpenCode (local)**, check the URL and paste the code. It is exchanged for a token (stored like an API key, see *Privacy*) and your models appear, free ones first.
>
> Each answer is a plain text generation through OpenCode's HTTP API (no tools, no files), which OpenCode still labels as experimental. The app creates one session called "PaperClaro AI" per model and reuses it; you can delete them from OpenCode. Free models have OpenCode's own usage limits, and when one runs out the app shows OpenCode's message.

> **Ollama Cloud:** its API does not accept direct calls from the browser (CORS). To use its models, sign in with `ollama signin` on your local Ollama and choose the "Ollama (local)" provider with a `-cloud` model.

## Credits and trademarks

Provider logos are shown only to identify them in the selector. They are trademarks of their respective owners (Google, OpenAI, Anthropic, xAI, OpenRouter, Groq, Ollama, OpenCode), with which this project is not affiliated or endorsed. The SVG paths come from [Simple Icons](https://simpleicons.org) (CC0) and [LobeHub Icons](https://github.com/lobehub/lobe-icons) (MIT).

## License

[Apache License 2.0](LICENSE). Copyright 2026 Potzon. See [NOTICE](NOTICE).
