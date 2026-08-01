# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Calculia is a static, dependency-free web app with 12 activities for
practicing math and logical reasoning: Numbers, Quantities, Math Tables,
Roman Numerals, Riddles, Patterns, The Wallet, The Clock, Stories,
What Doesn't Belong?, Puzzle, and Goose Game. See
[`doc/en/SPEC.md`](doc/en/SPEC.md) (or [`doc/es/SPEC.md`](doc/es/SPEC.md))
for the full product definition — target audience, accessibility rules,
and non-negotiable product principles.

Calculia was split out of Apptonomia (a broader occupational-therapy
activity suite), where these 12 activities used to live inside one
"Thinking and counting" module alongside 6 classic board games (chess,
checkers, dominoes, tic-tac-toe, visual sudoku, connect four). Those
board games stayed in Apptonomia — Calculia's scope is calculation and
reasoning specifically, not board games.

## Commands

There is no build step, no package.json, and no test framework — it's plain
HTML/CSS/JS served as static files.

- **Preview**: open `site/index.html` directly in a browser, or serve the
  folder with any static server (e.g. `npx serve .`). Everything runs
  client-side.
- **Validate everything** (this repo's only "test" step, and what CI runs
  on every PR via `.github/workflows/validate.yml`):
  ```
  node scripts/check.js
  ```
  It checks JS syntax, activity folder structure, es/en key parity
  (`tools/`, `site/`, `settings/`, `legal/`), `sw.js` ↔ disk parity, and
  catalog-parity lock (the same set of slugs must appear in `tools/` on
  disk, `site/index.html`'s cards, `settings/index.html`'s progress
  rows, and `sw.js`'s `ARCHIVOS`). Read the script before changing the
  file layout — it encodes the invariants that layout relies on.

## Architecture

**See [`doc/en/technical.md`](doc/en/technical.md) for the full technical
reference** — the file-by-file breakdown, the shared-core API, and the
activity anatomy. It follows the same three-level architecture as
Apptonomia (shared core in `assets/`, one folder per activity in
`tools/<slug>/`, a landing in `site/`), just scoped to 12 activities
grouped into two sections (Math, Reasoning and logic) instead of
Apptonomia's 7 therapeutic modules.

Unlike the single-activity sibling project Teclatlon, Calculia kept the
**full** shared core ported from Apptonomia (`utils.js`, `i18n.js`,
`tts.js`, `storage.js`, `feedback.js`, `dinero.js`) essentially
unmodified (only rebranded: `apptonomia:` → `calculia:` storage prefix,
`Apptonomia` → `Calculia` in comments/strings) — most of the 12
activities depend on at least one of the less-common APIs (`App.dinero`
for The Wallet, `App.feedback.lockUntilAck` for quiz-style activities,
`App.i18n.data()`/`datos()`/`registerStructure()` for locale-split data
trees), so trimming per-function like Teclatlon did would have risked
breaking one of them. Don't remove functions from `assets/js/` without
checking every `tools/<slug>/app.js` for a caller first.

`settings/` is trimmed relative to Apptonomia's: no backup export/import,
no font-size/sound preferences, no personal-data form (none of Calculia's
12 activities store a name or other personal field) — just progress
view and the two reset actions. There is no `/team/` or `/about/` hidden
route (those are Apptonomia-specific, aimed at its full multi-audience
product story); `/settings/` and `/legal/` cover what a smaller,
single-topic app needs.

## Product change policy

Any change to product content (UI strings, activity data) must be applied
to **both** `es` and `en` — `es` is the default and source of truth. Never
ship a product change in only one language. `scripts/check.js` enforces
key parity but not translation quality — proofread both.

## Agent workflow

Read the affected source files before editing. Update the canonical doc
for the topic (`doc/en/SPEC.md` for product/accessibility rules,
`doc/en/technical.md` for architecture — plus their `doc/es/` mirrors),
not a copy in this file. Keep changes minimal and on-target.

Before finishing:
1. Run `node scripts/check.js`.
2. If you add or rename an activity: create `tools/<slug>/` with the 6
   canonical files, add its card to `site/index.html` (+ `site/strings.*.js`),
   its progress row to `settings/index.html` (+ `settings/strings.*.js`),
   and its 6 files to `sw.js`'s `ARCHIVOS` — then bump `VERSION` in `sw.js`.
3. Report only verifications you actually ran; flag remaining manual tests.

A deploy (even to a preview channel) is a network operation: ask before
running one. Never push or open/close external resources without
explicit request or authorization.
