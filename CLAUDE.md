# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Calculia is a static, dependency-free web app with 15 activities for
practicing math and logical reasoning: Numbers, Fractions and Measures,
Subtraction and Mental Math, Money, Math Tables, Quantities, Roman
Numerals, Water Temperature, Riddles, Patterns, The Wallet, The Clock,
Stories, What Doesn't Belong?, and Puzzle. See
[`doc/en/SPEC.md`](doc/en/SPEC.md) (or [`doc/es/SPEC.md`](doc/es/SPEC.md))
for the full product definition — target audience, accessibility rules,
and non-negotiable product principles.

Calculia is a sibling project to Apptonomia (a broader
occupational-therapy activity suite): its scope is calculation and
reasoning specifically, not the 6 classic board games (chess, checkers,
dominoes, tic-tac-toe, visual sudoku, connect four) that are part of
Apptonomia's activity catalog instead.

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

## Service worker cache (read this before touching any cached file)

`sw.js` is cache-first for the app shell — every HTML/CSS/JS file listed
in `ARCHIVOS` is served from the cache. **Any change to a cached file
without bumping `VERSION` is invisible to users with the PWA installed.**
The bug is silent: the developer sees the change on a hard refresh,
but the user sees the old version until they manually unregister the SW
or the cache expires.

**Rule**: when you edit any file listed in `ARCHIVOS` (or any new file
that should be cached), bump `VERSION` in `sw.js` (e.g. `calculia-v21`
→ `calculia-v22`). The `install` handler will re-fetch every file into
the new cache and the `activate` handler will delete the old one. This
is also called out in `doc/en/technical.md` § 4 and in
`doc/en/I18N.md` step 6.

## Architecture

**See [`doc/en/technical.md`](doc/en/technical.md) for the full technical
reference** — the file-by-file breakdown, the shared-core API, and the
activity anatomy. It follows the same three-level architecture as
Apptonomia (shared core in `assets/`, one folder per activity in
`tools/<slug>/`, a landing in `site/`), just scoped to 11 activities
grouped into two sections (Math, Reasoning and logic) instead of
Apptonomia's 7 therapeutic modules.

Unlike the single-activity sibling project Teclatlon, Calculia kept the
**full** shared core ported from Apptonomia (`utils.js`, `i18n.js`,
`tts.js`, `storage.js`, `feedback.js`, `dinero.js`) essentially
unmodified (only rebranded: `apptonomia:` → `calculia:` storage prefix,
`Apptonomia` → `Calculia` in comments/strings) — most of the 11
activities depend on at least one of the less-common APIs (`App.dinero`
for The Wallet, `App.feedback.lockUntilAck` for quiz-style activities,
`App.i18n.data()`/`datos()`/`registerStructure()` for locale-split data
trees), so trimming per-function like Teclatlon did would have risked
breaking one of them. Don't remove functions from `assets/js/` without
checking every `tools/<slug>/app.js` for a caller first.

`settings/` is trimmed relative to Apptonomia's: no backup export/import,
no font-size/sound preferences, no personal-data form (none of Calculia's
11 activities store a name or other personal field) — just progress
view and the two reset actions. There is no `/team/` or `/about/` hidden
route (those are Apptonomia-specific, aimed at its full multi-audience
product story); `/settings/` and `/legal/` cover what a smaller,
single-topic app needs.

## Language policy

- **UI**: multilingual. Default locales are **Spanish (`es`)** and
  **English (`en`)**; `es` is the default and fallback when a key is
  missing or the detected locale is unsupported. UI text lives in
  per-activity `strings.<locale>.js` files, plus a couple of root ones
  (`site/strings.<locale>.js`, `settings/strings.<locale>.js`,
  `legal/strings.<locale>.js`).
- **Technical code**: **always English** — variables, functions,
  identifiers, comments, and commit messages. Dictionary **keys** are
  code and must be English. UI copy lives in `strings.<locale>.js`,
  never hardcoded in `app.js` or `index.html`.
- **Product changes apply to all locales by default**: any change to
  product content (UI strings, activity data, didactic copy,
  accessibility labels, catalog entries, etc.) **must be applied to
  every supported locale** — at minimum `es` and `en`. Spanish (`es`)
  is the source of truth when not dictated otherwise; English (`en`)
  must keep parity. If a new locale is added, the same change applies
  there too. Never ship a product change that exists only in one
  language.
- **Self-test**: change the `es` file, then mirror in the `en` file
  before opening the PR. `scripts/check.js` enforces key parity but
  not translation quality — proofread both.
- Full reference (App.i18n core, number/time formatting, landing
  selector, recipe to add a third language):
  [`doc/en/I18N.md`](doc/en/I18N.md) ·
  [`doc/es/I18N.md`](doc/es/I18N.md).

## Adding a language

The i18n architecture is multi-locale-ready from the start (multi-file
`strings.<locale>.js`, detection by `navigator.languages`, per-locale
BCP-47 map, per-locale decimal separator). To add a third language, see
[`doc/en/I18N.md`](doc/en/I18N.md) (or its Spanish mirror
[`doc/es/I18N.md`](doc/es/I18N.md)) — it documents the three remaining
binary `es`/`en` spots and the recipe (registers the locale, adds a
button, writes 12 `strings.<locale>.js` files, updates `sw.js` and
`scripts/check.js`'s `STRING_LOCALES`, bumps `VERSION`).

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when `query`/`path`/`explain` do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

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

## UNE 153101 reference (suite-wide)

All seven sibling projects follow **UNE 153101:2018 EX** (Spanish
easy-read standard) and Inclusion Europe's European easy-read
guidelines as the normative basis for the cognitive accessibility
principles that guide content and UI: short sentences, one idea per
sentence, everyday vocabulary, no clinical or technical jargon in
what the end user reads. This is the standard each `SPEC.md` cites
when it states the "easy read always" rule (see `doc/en/SPEC.md` §3.3
or its mirror in `doc/es/SPEC.md` §3.3). Adding a new language or a
new piece of UI copy means following UNE 153101 — not paraphrasing
it.

## WCAG AAA baseline (suite-wide)

This project conforms to WCAG 2.1 at **AA minimum** and adopts the
**AAA criteria that apply to the suite's audience** whenever feasible.
Full conformance at AAA is not feasible for a whole web application
(the W3C itself states AAA is meant for specific contexts); the rule
below lists the AAA criteria that ARE applicable and that this project
honours.

Adopted AAA criteria:

- **1.4.6 Contrast (Enhanced)** — text contrast ≥ 7:1 (large text
  ≥ 4.5:1). WCAG AA (4.5:1) is the legal floor; AAA is the design
  target. Verified pairs in Okeymoney (`#F2F4F8` on `#161A21` = 14.6:1,
  `#B7BDC9` on `#161A21` = 8.4:1) already meet AAA; this project aims
  at the same ratio when its token palette is next touched.
- **3.1.5 Reading Level** — content for the general public does not
  require advanced reading ability. Already complied with through
  UNE 153101 (see the section above) and Inclusion Europe's easy-read
  guidelines.
- **1.4.1 Use of Color** — color is never the only means of conveying
  information. Every feedback state (success / hint / error / lock)
  also uses shape, icon, text or sound, so users with color-vision
  deficiencies are not excluded. (`App.feedback.success()` /
  `App.feedback.encourage()` / `App.feedback.lockUntilAck()` already
  encode this.)

The product-facing wording in `doc/en/SPEC.md` §3.5 / §5 / §6 (and the
Spanish mirror in `doc/es/SPEC.md`) references this baseline using the
literal phrase **"WCAG AA minimum, AAA whenever possible"**, mirroring
the suite-wide rule in the metaproject's `apptonomia/CLAUDE.md`.

## Public-facing wording: "usuario/a tipo" euphemism

This directive applies across the entire Miralante suite (Apptonomia,
Calculia, Memofun, Okeymoney, Sinonimia, Teclatlon, Routime) and the
metaproject landing at `apptonomia.uk`. The suite's real objective is
occupational-therapy support for people with intellectual disability, but
**that framing is not used in public surfaces** — only in internal
documentation.

### Where each term is allowed

- **"Discapacidad intelectual" / "intellectual disability"** is the
  canonical term and **may only appear in internal documentation**
  (`CLAUDE.md`, `doc/<lang>/SPEC.md`, `technical.md` / `tecnico.md`,
  `roles.md`, `CONTRIBUTING.md`, `CONTRIBUTING.es.md`, tooling files
  in `scripts/`). It is explicitly **forbidden** in public-facing
  surfaces, READMEs that anyone can read without authentication, public
  talks, social media copy, press notes, and marketing material.
- **"Usuario/a tipo"** (plural "usuarios/as tipo") is the accepted
  euphemism for the audience in public-facing surfaces. It is used as
  a generic profile marker, not as a label for any real person.
  - It applies to `README.md` / `README.es.md`, public talks, social
    media copy, press notes, marketing material, and any
    contributor-facing document that also doubles as a public
    description of the project (e.g. `CONTRIBUTING.md`).
  - It does **not** apply to the UI of the app itself: the project's
    "Mandatory rule: zero mentions in the user-facing product" (see
    `doc/en/SPEC.md` §4 / `doc/es/SPEC.md` §4) continues to forbid
    **any** mention, including "usuario/a tipo", in `site/index.html`,
    `tools/<slug>/index.html`, `app.js`, `data.js`, `strings.<locale>.js`,
    `settings/`, `legal/`, and any other user-facing surface. The
    euphemism is for the outside world, not for what the visitor reads
    on the site.
  - It does **not** apply to project content that names a clinical
    concept by its real-world name (e.g. an activity that practices
    calculations on a real bureaucratic procedure): that is content,
    not labelling of an audience.

### Rationale

Presenting the project's real objective in maintainer docs is useful
and necessary for whoever maintains and contributes to the suite.
Presenting it in marketing or landing surfaces is neither necessary nor
respectful of the audience — "usuario/a tipo" lets public material
describe what the app is for (who the typical profile is) without
publicly naming a clinical group. This rule is mirrored in the
metaproject's `apptonomia/CLAUDE.md` and in every sibling's own
`CLAUDE.md` and `SPEC.md` so it survives a single project's docs going
out of sync.
