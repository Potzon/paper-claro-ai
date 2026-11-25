'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSkill, loadDictionaries, OUT, LEVELS, FOCUSES } = require('../scripts/build-skill');

const files = buildSkill();
const { en, es } = loadDictionaries();

describe('Agent Skill (generated from the app prompts)', () => {
    it('the committed files are exactly what the generator produces (run `npm run build:skill`)', () => {
        for (const [name, expected] of Object.entries(files)) {
            const target = path.join(OUT, name);
            assert.ok(fs.existsSync(target), `${name} is missing`);
            assert.equal(fs.readFileSync(target, 'utf8'), expected, `${name} is out of date`);
        }
    });

    it('there are no stray files in the skill folder', () => {
        const found = [];
        const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) walk(full); else found.push(path.relative(OUT, full).split(path.sep).join('/'));
        });
        walk(OUT);
        assert.deepEqual(found.sort(), Object.keys(files).sort());
    });

    for (const [lang, dict] of [['en', en], ['es', es]]) {
        describe(`reference/${lang}.md`, () => {
            const text = files[`reference/${lang}.md`];

            it('contains every level and focus of the app, word for word', () => {
                for (const key of [...LEVELS.map((k) => `level.${k}`), ...FOCUSES.map((k) => `focus.${k}`)]) {
                    assert.ok(text.includes(dict[`prompt.${key}`]), `prompt.${key} is missing`);
                }
            });

            it('contains the role and the mandatory formatting rules, word for word', () => {
                const system = dict['prompt.system'].split('{level}')[0].trimEnd();
                assert.ok(text.includes(system));
            });

            it('contains the follow-up rules', () => {
                // every fixed piece of text around the {placeholders} must be there
                const pieces = dict['prompt.chatSystem'].split(/\{\w+\}|\n/).filter((piece) => piece.trim());
                assert.ok(pieces.length >= 4);
                for (const piece of pieces) assert.ok(text.includes(piece), piece);
            });

            it('leaves no unresolved {placeholder}', () => {
                assert.deepEqual(text.match(/\{\w+\}/g), null);
            });
        });
    }

    describe('SKILL.md', () => {
        const text = files['SKILL.md'];
        const match = text.match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);

        it('has valid front matter: name = folder name, description short enough for claude.ai uploads (200 chars to be safe; the documented limit is 1024)', () => {
            assert.ok(match, 'front matter');
            assert.equal(match[1], path.basename(OUT));
            assert.match(match[1], /^[a-z0-9-]{1,64}$/);
            assert.ok(match[2].length > 0 && match[2].length <= 200, `description length ${match[2].length}`);
        });

        it('links only to files that exist', () => {
            const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
            assert.ok(links.length >= 2);
            for (const link of links) assert.ok(link in files, `${link} does not exist`);
        });

        it('names every level and focus the user can ask for', () => {
            for (const word of [...LEVELS, ...FOCUSES]) assert.ok(text.includes(`*${word}*`), word);
        });

        it('promises no API key and has no personal or provider-specific data', () => {
            assert.match(match[2], /no api key/i);
            assert.ok(!/@|sk-|AIza/.test(text));
        });
    });
});
