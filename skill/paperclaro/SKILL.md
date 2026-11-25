---
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
