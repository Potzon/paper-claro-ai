'use strict';
// Generates the Agent Skill in skill/paperclaro/ from the prompts the web app already uses (src/i18n.js),
// so the app and the skill can never drift apart. Run `npm run build:skill` after changing a prompt;
// `tests/skill.test.js` fails if the committed files are out of date.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'skill', 'paperclaro');

// i18n.js is a browser script that touches the DOM when it ends: only the dictionary literal is evaluated.
function loadDictionaries() {
    const source = fs.readFileSync(path.join(ROOT, 'src', 'i18n.js'), 'utf8');
    const start = source.indexOf('const I18N = {');
    const end = source.indexOf('\n};', start);
    if (start < 0 || end < 0) throw new Error('Could not find the I18N dictionary in src/i18n.js');
    return vm.runInNewContext(`${source.slice(start, end + 3)}\nI18N;`);
}

const fill = (text, values) => text.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));

// The text that frames each language file (these are the only strings that do not come from the app).
const FRAME = {
    en: {
        title: 'PaperClaro AI — English prompts',
        intro: 'These are the same prompts the PaperClaro AI web app sends to the model. Follow them to the letter.',
        rules: 'Role and mandatory rules',
        applyChosen: 'Apply the level and the output focus you chose in SKILL.md. They are defined below.',
        levels: 'Explanation levels',
        focuses: 'Output focuses',
        title_mode: 'When the user names a paper or topic',
        title_hint: 'Without web search tools, say that you are answering from memory and flag anything you are not sure about.',
        doc_mode: 'When the user provides the document',
        follow: 'Follow-up questions',
        follow_hint: 'After the explanation, answer every later question with these rules.',
        placeholders: { query: '<the title or topic the user gave>', text: "<the document's text>", title: '<title of the analyzed paper>', level: '<the level you chose>' }
    },
    es: {
        title: 'PaperClaro AI — prompts en español',
        intro: 'Son los mismos prompts que la app web PaperClaro AI envía al modelo. Síguelos al pie de la letra.',
        rules: 'Rol y reglas obligatorias',
        applyChosen: 'Aplica el nivel y el enfoque de salida que elegiste en SKILL.md. Se definen a continuación.',
        levels: 'Niveles de explicación',
        focuses: 'Enfoques de salida',
        title_mode: 'Cuando el usuario nombra un paper o un tema',
        title_hint: 'Si no tienes herramientas de búsqueda web, di que respondes de memoria y señala todo lo que no tengas claro.',
        doc_mode: 'Cuando el usuario aporta el documento',
        follow: 'Preguntas de seguimiento',
        follow_hint: 'Tras la explicación, responde cada pregunta posterior con estas reglas.',
        placeholders: { query: '<el título o tema que dio el usuario>', text: '<el texto del documento>', title: '<título del paper analizado>', level: '<el nivel que elegiste>' }
    }
};

const LEVELS = ['simple', 'university', 'researcher'];
const FOCUSES = ['full', 'tldr', 'glossary', 'critique'];

function languageFile(lang, dict) {
    const f = FRAME[lang];
    const p = (key) => dict[`prompt.${key}`];
    const system = fill(p('system'), { level: f.applyChosen, focus: '' }).trimEnd();
    return [
        `# ${f.title}`,
        '',
        f.intro,
        '',
        `## ${f.rules}`,
        '',
        system,
        '',
        `## ${f.levels}`,
        '',
        ...LEVELS.flatMap((k) => [p(`level.${k}`), '']),
        `## ${f.focuses}`,
        '',
        // fenced: the focuses contain "## ..." headings that belong to the answer, not to this file
        ...FOCUSES.flatMap((k) => ['```text', p(`focus.${k}`), '```', '']),
        `## ${f.title_mode}`,
        '',
        fill(p('userTitle'), f.placeholders),
        '',
        f.title_hint,
        '',
        `## ${f.doc_mode}`,
        '',
        fill(p('userDoc'), f.placeholders),
        '',
        `## ${f.follow}`,
        '',
        f.follow_hint,
        '',
        fill(p('chatSystem'), f.placeholders),
        ''
    ].join('\n');
}

const SKILL_MD = `---
name: paperclaro
description: Explains scientific papers (PDF, pasted text, title or topic) at a simple, university or researcher level, as a full analysis, TL;DR, glossary or critique. No API key needed. English and Spanish.
---

# PaperClaro AI

This is the Claude Code / claude.ai version of PaperClaro AI, the web app that explains scientific papers. It uses the same prompts, so the answers have the same structure.

## Steps

1. **Get the paper.**
   - A file path or an attached PDF: read it in full.
   - Pasted text: use it as it is.
   - A title, DOI or topic: use web search tools if you have them, to confirm the paper exists and to get its real details. Without them, say you are answering from memory.
2. **Choose the level and the focus.** Do not ask unless the request is unclear.
   - Level: *simple* ("explain it simply", "ELI5"), *university* (**default**) or *researcher* ("in depth", "technical").
   - Focus: *full* structured analysis (**default**), *tldr* ("summary", "TL;DR"), *glossary* ("key concepts") or *critique* ("critical reading", "limitations").
3. **Pick the language.** Answer in the language the user writes in.
   - Spanish: read [reference/es.md](reference/es.md).
   - Anything else: read [reference/en.md](reference/en.md). It says "English", but write in the user's language.
4. **Write the explanation** following the rules, the chosen level and the chosen focus in that file, exactly as written, including the H1 title on the first line and the LaTeX delimiters.
5. **Follow-up questions.** Keep answering with the follow-up rules in the same file. Offer other levels or focuses only if the user seems to want them.

## Honesty

Rely only on the document when one is given. Never invent data, authors, results or citations: if you are not sure a paper exists or about a detail, say so.

Not affiliated with any of the models or services it can run on.
`;

function buildSkill() {
    const dictionaries = loadDictionaries();
    return {
        'SKILL.md': SKILL_MD,
        'reference/en.md': languageFile('en', dictionaries.en),
        'reference/es.md': languageFile('es', dictionaries.es)
    };
}

function writeSkill() {
    const files = buildSkill();
    for (const [name, content] of Object.entries(files)) {
        const target = path.join(OUT, name);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    }
    return Object.keys(files).map((name) => path.relative(ROOT, path.join(OUT, name)));
}

if (require.main === module) {
    for (const file of writeSkill()) console.log('wrote', file);
}

module.exports = { buildSkill, loadDictionaries, OUT, LEVELS, FOCUSES };
