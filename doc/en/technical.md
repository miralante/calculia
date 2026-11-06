# Technical information

> Documentation for developers who want to understand, maintain or extend
> Calculia. Product scope and accessibility rules live in
> [`SPEC.md`](SPEC.md); this document is architecture only.

---

## 1. Non-negotiable technical constraints

- **HTML5 + CSS3 + Vanilla JavaScript.** No frameworks, no bundlers, no
  build step, no backend, no npm dependencies. There is no `package.json`
  in the repo, so Cloudflare Pages does not run `npm install` during the
  build and there is nothing to bundle.
- **Classic scripts**, not ES modules (compatibility with `file://` and
  old browsers). All shared code is exposed on `window.App.*`.
- **No JS CDNs.** Fonts are self-hosted in `assets/fonts/`.
- **Persistence only in `localStorage`.** No login, no cookies, no
  personal data, no analytics.
- **Offline-first PWA**: `manifest.json` + `sw.js` (network-first with a
  cache fallback for the app shell).
- **Code style**: ES5-style JS (`var`, classic functions, IIFE with
  `'use strict'`); identifiers, comments and commit messages always in
  English. UI text (`strings.es.js` / `strings.en.js`, activity content
  in `data.js`) stays in the language it represents.

### 1.1 Hosting and deployment — Cloudflare Pages

Deployed on Cloudflare Pages via the Git connector, following the same
pattern as the sibling projects Apptonomia, Sinonimia and Teclatlon:

- **No build step.** The repo root *is* the build output.
- **No `_redirects`, no `wrangler.toml`, no `functions/`.** Cloudflare
  Pages serves every static file with implicit `index.html` lookup per
  directory, so `/tools/<slug>/` resolves to `tools/<slug>/index.html`
  automatically.
- **Cache headers live in `_headers`** at the repo root. HTML entry
  points, `manifest.json` and `sw.js` are forced to `must-revalidate`;
  fingerprinted JS/CSS/font assets get a 1-year immutable cache.
- **`manifest.json` and `sw.js` must use relative paths** (start `./`)
  so the app works on any host without changes.
- A one-off preview deploy from a dirty worktree, without committing any
  Wrangler config: `npx wrangler pages deploy . --project-name calculia`.

### 1.2 Cross-browser support

Verify manually in Chromium, Firefox and WebKit (Safari), on desktop and
mobile, before landing a change to shared core files (`assets/`) or an
activity's `index.html`/`app.js`/`styles.css`. Register the service
worker from every entry point (`index.html`, `settings/`,
`legal/`, every `tools/<slug>/index.html`) — matches Apptonomia's
pattern and avoids Safari's "cannot open the page" error when a user
lands on a subpage directly.

---

## 2. Architecture

```
calculia/
├── index.html             # Level 0: Quantities, Ordinals, Roman Numerals
├── styles.css             #   landing stylesheet, next to index.html
├── app.js                 #   landing logic, next to index.html
├── strings.<locale>.js    #   landing texts, es/en, next to index.html
├── site/index.html        # Back-compat stub only: redirects to /
├── dev/index.html         # Hidden catalogue = the rest of the activities
├── assets/                # Level 1: SHARED CORE
│   ├── css/tokens.css     #   design variables (colors, typography, touch)
│   ├── css/base.css       #   reset, self-hosted fonts, visible focus
│   ├── css/components.css #   reusable components (.btn, .card, …)
│   ├── js/utils.js        #   window.App.utils
│   ├── js/i18n.js         #   window.App.i18n
│   ├── js/tts.js          #   window.App.tts
│   ├── js/storage.js      #   window.App.storage
│   ├── js/feedback.js     #   window.App.feedback
│   ├── js/dinero.js       #   window.App.dinero (used by The Wallet)
│   ├── js/number-sort.js  #   window.App.numberSort (the ordering activities)
│   ├── fonts/              #   self-hosted woff2 (Atkinson Hyperlegible, Nunito)
│   └── img/icono.svg       #   app icon (also the PWA icon)
├── tools/<slug>/          # Level 2: one folder per ACTIVITY (30 total)
│   ├── index.html         #   structure and asset loading
│   ├── app.js             #   logic only
│   ├── data.js             #   data only
│   ├── strings.es.js      #   Spanish text
│   ├── strings.en.js      #   English text
│   └── styles.css         #   specific styles only
├── settings/              # Hidden route: view/reset localStorage (§4)
├── legal/                 # Data-protection page (linked from every footer)
├── manifest.json          # PWA
├── sw.js                  # Service worker: cache list + VERSION
└── _headers                # Cloudflare Pages cache and security headers
```

Same three-level architecture as Apptonomia, scoped to 30 activities. The public `index.html` links to the six front-door activities (Quantities, Ordinal Numbers, Roman Numerals, Shapes, Trigonometry, Scale); the hidden `dev/index.html` links to the other activities, Numbers among them, plus the ones named in `BOTH_SLUGS` (Quantities, Ordinal Numbers, Scale and Trigonometry, which are both front doors and still listed in the full catalogue). Positive and negative numbers are part of Numbers, not a separate tool. The list of public slugs lives in `scripts/check.js` (`PUBLIC_SLUGS` and `BOTH_SLUGS`), and the order in `PUBLIC_SLUGS` is the visible order in `index.html`.

### 2.1 `assets/` — shared core, kept whole

This core was ported from Apptonomia **without trimming any function**
(only rebranded: `apptonomia:` → `calculia:` storage prefix,
`Apptonomia` → `Calculia` in comments/strings/`document.title`). Unlike
the single-activity sibling project Teclatlon — which could safely drop
unused functions because only one activity's code called into the
core — Calculia has 14 different activities, and between them they use
nearly every corner of the API:

- `App.dinero` (`dinero.js`): used by The Wallet to draw and reason
  about euro coins/notes.
- `App.i18n.data()` / `.datos()` / `.registerStructure()`: used by
  several activities (e.g. Numbers, Riddles, The Wallet, The Clock,
  Roman Numerals, Patterns, Stories, What Doesn't Belong?) whose
  `data.js` is locale-neutral and gets its text merged in from
  `strings.<locale>.js`.
- `App.feedback.lockUntilAck()`: used by quiz-style activities to lock
  remaining options after a wrong answer and hide them while the hint is
  shown; "Entendido" brings them back (a reading pause, never a progress
  block).
- `App.feedback.hintText(template, chosen)`: fills the `«{elegida}»`
  placeholder of a socratic hint with the answer just tried, so the hint
  says why that one does not fit. Without a text label, "this option" is
  used.
- During a reinforcement repeat, a correct answer keeps the positive feedback
  but hides the answer explanation to reduce visual load.
- `App.storage.estrellasTotales()` / `.listaToolIds()`: used by
  `index.html` (total stars) and `settings/` (progress list, full
  reset).

Before removing anything from `assets/js/`, grep every `tools/<slug>/app.js`
for a caller — don't assume a function is dead just because it isn't
obviously used by one activity you're looking at.

### 2.2 Level 2 — Activities (`tools/<slug>/`)

Each activity is autonomous and isolated (own storage key, no imports
from another `tools/` folder, works if you open its `index.html`
directly) — same contract as Apptonomia's. See each activity's `data.js`
header comment for its specific data format.

#### 2.2.1 Question and option randomness (contract)

By design, **every activity shuffles the question order within a
round** **and shuffles the answer options** of every question.
Shuffling uses `App.utils.shuffle(...)` (Fisher–Yates in
`assets/js/utils.js`); never `sort(() => Math.random() - 0.5)`, which
is biased and produces non-uniform lists.

The reason is that a fixed order teaches the **position** of the
button, not the content: a child who passes a whole round where the
correct answer is always bottom-left would fail the same round if the
list showed up shuffled. Shuffling every round forces reading the
content and checking before tapping.

Documented exceptions (no shuffle because the order is intrinsic to
the content, not a distractor):

- **Yes/No pairs** (e.g. `wallet` → "did you pay the right amount?"):
  the natural Yes/No order is the convention, and shuffling it confuses
  without adding any challenge.
- **Number lines** (e.g. `wallet` → "roughly, how much does it cost?"
  with three consecutive amounts): shuffling a number line turns it
  into a distractor quiz without the visual hint the line is meant to
  provide.
- **Puzzle pieces** (`puzzle`, `stories`): the available pieces are
  shuffled, but the "question" is the whole picture and its paint
  order is always left-to-right.

`temperature` is out of scope for this contract: its mechanic is not
multiple-choice and the round has no order to shuffle.

#### 2.2.2 Implementation

Each `tools/<slug>/app.js` applies the contract using one of two
patterns (both are valid):

- **Options**: `App.utils.shuffle([correct].concat(distractors))`
  inside the question generator, or
  `App.utils.shuffle(p.options).forEach(...)` when painting.
- **Questions**: `draw(key, list)` (a bag with no repeats within the
  round, refilled when empty) when the activity picks a concrete shape
  per question; or `App.utils.shuffle(list).slice(0, N)` when the round
  takes N elements from a larger pool.

A check in `scripts/check.js` (section 5, "Round structure") verifies
that every activity with multiple-choice questions shuffles its options
and that every activity with a pool larger than the round shuffles
the order. Mechanical activities (`puzzle`, `stories`, `odd-one-out`)
and `temperature` are excluded from the check.

#### 2.2.2.1 Splitting a large activity (`model.js`, `comma.js`)

An activity whose code grows large is split by what it does:

- `model.js` holds the code that does not touch the page: question
  generators, drawings as HTML text, number words, level rules. It can be
  checked in Node. It publishes its names as `App.<name>Model`.
- `app.js` keeps the page: the DOM, the flow and the events. It reads the
  model's names through aliases at the top of the file.
- An exercise with its own state and events goes to its own file, as a
  factory `App.<name>(host)`. The page passes what it needs (the shared
  progress, `save`, `paintStars`, the screens, the round count) in the `host`
  object, so the exercise does not reach into the rest of the activity. The
  comma exercise of Fractions and measures is the example.

`model.js`, `comma.js`, `screens.js`, `counter.js` and `art.js` are the only
extra files an activity may have (`EXTRA_MODULES` in `scripts/check.js`).
Each one is listed in `sw.js` and loaded by `index.html` before `app.js`.
`art.js` holds the drawings (`shapes`): SVG as text, published as
`App.shapesArt`, which `model.js` reads through aliases.

#### 2.2.2.2 Shared styles and the drift rule

`assets/css/components.css` is the one definition of a shared component
(`.option-btn`, `.feedback`, `.tool-header h1`, …). `assets/css/activity-flow.css`
adds only what the flow screens need, and its rules that touch a component are
scoped with `:where(#activity)`, so they add no specificity and keep the cascade.

An activity's `styles.css` may add properties a component does not set, and may
colour its own accent with `color: var(--mod-…)` (its identity). It may not
change a value the component already sets: that is drift.
`node scripts/css-drift.js` lists every override of that kind; the rest of the
dedupe (identical declarations) is applied when a value is identical to the
shared one. The two option and feedback copies still listed by the report
(divisibility-test, head-math, math-tables, multiples, prime-composite) keep the
flow look on pages that do not use the flow engine: that is a per-page decision
(migrate them to the engine, or keep the variant), not something the script changes.

#### 2.2.3 Three-stage flow (`assets/js/activity-flow.js`)

Activities with explanation slides, real life and a test
(`App.activityFlow`) do not repeat the flow: `app.js` supplies its data,
its drawings (`visualHtml`), the shuffle of each round (`buildRound`,
which still calls `App.utils.shuffle`) and the question generator
(`makeQuestion`). The engine builds the screens inside
`<div id="activity">` and handles the stars, the saved progress and the
end screen. The generic styles are in `assets/css/activity-flow.css`,
and the drawings shared by a family in their own file (for example
`assets/css/common-factors.css`). A design change to the flow is then
made in one place. There are two test modes: `test: 'options'` (one
question at a time, with a closing screen; `common-multiple` and
`common-divisor`) and `test: 'sheet'` (the whole round on one sheet with
«Check» and «Another round», no closing screen; `lines`, `primes` and,
with several sheets, a menu and levels per sheet, `shapes`).

In the `options` mode, `socratic: true` gives the socratic feedback of
`factorial` (first miss, a hint; second miss, the explanation; the other
options lock until «Understood»), `review: 'rule'` puts «Review the rule»
under the question, `introCard` adds a card above the slides, and
`endNotes` adds texts to the closing screen.

The four order activities (`order-*`) use the `sheet` mode through
`App.numberSort.setup`, which delegates to the engine: the level is shown as
a badge (`levelName`), the transfer sentence appears when the round is
complete (`transferKey`), and a right answer shows its explanation
(`showExplanation`). `operation-concepts` follows the closing-screen rule:
one button, «Back to start»; «New round» lives inside the test.

#### 2.2.3.1 Options of the 'options' mode: no real-life stage, several steps

Two options let an activity use the 'options' mode without copying its flow:

- `skipReal: true` makes the explanation slides lead straight to the test. The
  button under the slides reads «Start practising», and the real-life stage is
  not shown. Multiples, Prime or composite and Divisibility use it.
- A question may carry `steps: [ {prompt, hint, options, explanation}, … ]`
  instead of its own prompt and options. The steps are answered one at a time,
  under «Step 1 of 3»; the question scores once, at its last step, and only if no
  step was missed. Divisibility uses it for the rules (last digit, then the check).

#### 2.2.4 Activity skeletons: general, teach–real life–test, and play

Every activity is built from two layers. The **general skeleton** is the
part all activities share: the page shell, the data and texts, the round, the
stars and the closing screen. On top of it sits one **flow family**, chosen
before anything else:

- **A. Teach → real life → test**: explanation slides, real-life examples and
  a test. Built by the shared engine (`App.activityFlow`).
- **B. Play**: rounds of items with immediate feedback and no explanation stage
  (puzzles, pickers, sequences, riddles). Shared through `App.reinforce` and
  `App.activityGlue`; the common loop is the target described below.

Adding an activity means choosing its family and filling in its data and its
mechanic. The rules below are what the code already does; where a family is
not yet shared by an engine, the section says so.

##### 2.2.4.1 General skeleton (every activity)

| Layer | What it contains | Who owns it |
|---|---|---|
| Page shell | `index.html`: header (back link, title, stars), footer, script order. Engine pages inject their stages into `<div id="activity">`. | Skeleton; the activity only lists its scripts |
| Data | `data.js`: locale-neutral numbers, layouts, slide specs, `perRound`, the question types | Activity |
| Texts | `strings.es.js` and `strings.en.js` (`App.i18n.register`). No text in `app.js`. | Activity; keys must match in both locales |
| Logic | `app.js`: round generation, question makers, drawings. Large files split into `model.js` (and extra modules), see 2.2.2.1 | Activity |
| Progress | `App.storage` under the activity's key: `stars`, `completedRounds`, and `roundsByActivity` for menus | Skeleton (helpers in `App.activityGlue`) |
| Round | `buildRound` returns the question types of a round, shuffled. `makeQuestion(type)` returns `{ prompt, hint, options, explanation }`, with options `[{ html, aria, correct }]` (contract in 2.2.1) | Activity |
| Feedback | Right answer: a star and the explanation. Wrong answer: the hint, and the option stays off. Nothing is punished. `App.feedback` for the tone and the locks | Skeleton |
| Closing screen | One primary button, «Back to start», to the landing. The summary uses `ui.roundDone` or `endSummaryKey`. | Skeleton (see the closing-screen rule in `CLAUDE.md`) |
| Shared helpers | `App.utils` (`fill`, `rint`, `pick`, `shuffle`, `numericOptions`, …). Local copies are forbidden for the names listed in `scripts/check.js` | Core |

The contract in every family: no timers, no lives, no negative score, and
every error leads to a hint and a retry.

##### 2.2.4.2 Family A: teach → real life → test (`App.activityFlow`)

The engine has three stages, each optional in the ways listed:

1. **Explanation**: `intro` is a list of slides `{ visual }`. The title and
   text come from `intro.<n>.title` and `intro.<n>.text` (or `introCopy`).
   Slides wrap around, and a progress bar shows the position.
2. **Real life** (optional): `real` is a list of examples `{ visual }`,
   with `realVisualHtml` or `visualHtml` and the text from `realText` or
   `real.<n>`. Skipped with `skipReal: true`.
3. **Test**, in one of two modes:
   - `options` (default): one question at a time, a star for each right
     answer, and a closing screen.
   - `sheet` (`test: 'sheet'`): the whole round on one sheet, with «Check» and
     «Another round» and no closing screen.

The configuration keys the engine reads:

| Key | Meaning |
|---|---|
| `toolId` | Storage key, and the activity's progress |
| `intro`, `real` | Slides and examples (`real: []` when there is no real-life stage) |
| `visualHtml(spec)` | HTML of one drawing (slides; examples too, unless `realVisualHtml`) |
| `introCopy`, `introVisualAria`, `realText` | Texts and labels that depend on the slide |
| `introHeading`, `introCard` | Line above the slides, and a card above them |
| `buildRound(def, level)`, `makeQuestion(type, index, def)` | The round and its questions |
| `test` | `'sheet'` for the sheet mode; default `options` |
| `socratic` | First miss: hint. Second miss: explanation. Other options lock until «Understood» |
| `review` | `'back'` (default), `'rule'` (review the rule under the question) or `'none'` |
| `reinforce` | Missed questions are replayed in a mini-round until all are right (`App.reinforce`) |
| `activities`, `menuPlacement` | A menu of activities, first (default) or after the examples; each activity can have its own slides and examples |
| `skipReal` | The slides lead straight to the test (button «Start practising») |
| `steps` (in a question) | A question made of several steps, answered one at a time (`Step 1 of 3`); it scores once, at its last step, and only if no step was missed |
| `testVisuals`, `testVisualClass` | A picture in each test question |
| `endSummaryKey`, `endNotes`, `endEmoji` | Summary text, extra texts and emoji of the closing screen |
| `prepareProgress`, `slideProgress`, `backHref`, `menuBackKey` | Progress conversion, progress bars, back link, menu label |

Which family-A variant fits which activity:

- **Full flow with real life**: `common-multiple`, `common-divisor`, `factorial`
  (socratic), `linear-functions`, `scale`, `operation-concepts`.
- **Sheet**: `lines`, `primes`, `shapes` (several sheets, with a menu).
- **Menu of activities**: the four `order-*` (through `App.numberSort`, which
  delegates to the engine) and `operation-concepts`.
- **Teach → test, no real life**: `multiples`, `prime-composite`,
  `divisibility-test` (the last one also uses `steps`).

Rules of thumb: leave out real life when no real example adds a new case; use
`steps` when a question is a chain of checks, each one needed for the next;
use the sheet when the person must compare or order everything at once.

##### 2.2.4.3 Family B: play (games)

Activities of this family give the person a mechanic and a round, not an
explanation first: `puzzle` (tap a piece and its place), `odd-one-out`
(tap the intruder), `stories` (tap the captions in time order), `patterns`
(complete a series), `riddles` (choose the answer). The learning comes from
the feedback after each try, and a missed item is replayed in a mini-round
(`App.reinforce`).

Current state: each of these is written by hand in its own `app.js`, with
`App.reinforce` and the helpers of `App.activityGlue`. There is no shared
loop yet, so each game repeats the round, the selection and the closing.

Target contract (to be built as the engine's «solo prueba» mode, menu → round,
without slides):

- **Entry**: a menu of mechanics or levels. The level comes from progress
  (`levelOf`), as in family A.
- **Round**: `buildRound(def, level)` returns N items; the mechanic makes each
  item one action (tap, drag, choose).
- **Check**: `check(item, action)` returns `{ correct, hint, explanation }`.
  Right: a star and a short praise. Wrong: the hint, and a retry.
- **Reinforce**: `reinforce: true` replays the misses until all are right.
- **Close**: the closing screen with one button, as in family A.
- **Not allowed**: timers, lives, negative score, «game over».

Two activities need more than this contract, and stay outside it until the
engine has the pieces: `head-math` and `math-tables` have levels that the
person picks, and a learn screen with a demonstration. Both are menu-led
flows, not rounds of items.

##### 2.2.4.4 Choosing a skeleton and adding an activity

1. Does the activity teach a rule before it asks? Yes: family A. No: family B.
2. Does a real-life example add a case? Yes: keep `real`. No: `skipReal: true`.
3. Does a question chain several checks? Use `steps`.
4. Must the person see the whole round at once? Use the `sheet` mode.
5. Create the six canonical files in `tools/<slug>/`, plus `model.js` when the
   logic is large (2.2.2.1). Register the card in `index.html`, its progress
   row in `settings/`, and its files in `sw.js` (`ARCHIVOS`), then bump
   `VERSION`.
6. Run `node scripts/check.js`, `node scripts/smoke-sw.js` and the UI test,
   and refresh `?v=` tokens with `scripts/asset-tokens.js`.

Families and their users are listed in the doc at the time of each change;
verify them with a search of `App.activityFlow.setup` and `App.reinforce`
before relying on a list.

### 2.3 `settings/` — trimmed relative to Apptonomia's

Two actions, same two-step-confirmation pattern as Apptonomia:

- **Reset person data**: removes the language preference only. None of
  Calculia's 30 activities store a name or other personal field, so
  there is no `TOOLS_WITH_NAME` list here (Apptonomia's settings/app.js
  has one, for Piano).
- **Reset entire app**: deletes every `calculia:*` key.

Dropped relative to Apptonomia's settings/: backup export/import,
font-size/sound preferences, and the "my details" personal-data form —
none apply to Calculia's scope. If a future activity needs one of these,
port the corresponding piece from `apptonomia/settings/app.js` rather
than reinventing it.

---

## 3. Internationalization

Multi-file pattern, **designed for more than two languages** since
the first commit (the architecture comes from Apptonomia's mature
i18n). Currently ships Spanish (`es`, default) and English (`en`);
adding a third locale follows the recipe in
[`doc/en/i18n.md`](I18N.md) (and its Spanish mirror
[`doc/es/i18n.md`](../es/I18N.md)).

Short version: `strings.<locale>.js` per activity/landing each
register one language via `App.i18n.register(dict, '<locale>')`;
both files always load, and `App.i18n.locale()` decides which is
active. `scripts/check.js` checks key parity between every locale
file for every `tools/<slug>/`, plus the site root, `settings/` and
`legal/`.

The core is multi-locale-ready from day one — see `I18N.md` §4 for
the three binary `es`/`en` spots that have to be generalized when
adding a third language (`BCP47` map in `i18n.js`, `DECIMAL_SEP` in
`dinero.js`, and the shared dropdown (`#locale-picker` +
`locale-picker-config.js`) to offer the language).

---

## 4. PWA and service worker

- `sw.js` is network-first with a cache fallback for the app shell. Contract when touching files:
  1. New file → add it to the `ARCHIVOS` list.
  2. Any change to a cached file → bump `VERSION` (`calculia-vN`),
     otherwise users with the installed PWA won't receive the change.
- **Bump `VERSION` on every committed change to a cached file.** This
  is not just "add a new activity" — it applies to every CSS tweak,
  every string fix, every JS refactor in `tools/`, every classroom
  assignment of a colour value. The cache is silent: the developer
  sees the new code on a Ctrl+Shift+R reload, but the user sees the
  old one until the SW is manually unregistered. The cost of bumping
  is one integer; the cost of not bumping is "the user thinks the fix
  didn't land". Bump liberally rather than conservatively.
  The bug pattern in practice: developer edits a CSS class, expects
  to see the new colour in the running app, doesn't, "fixes" the
  source again, still doesn't — and the only thing missing was the
  integer bump. The fix is to bump `VERSION` first, then verify.
- `manifest.json` currently ships a single SVG icon (`sizes: "any"`).
  A proper 192×192 / 512×512 PNG icon set should be added for the best
  "Add to Home Screen" experience on iOS, which doesn't reliably use SVG
  manifest icons — this wasn't generated here for lack of a rasterizer
  in the authoring environment; swap in real artwork when available.

---

## 5. Verification

```bash
node scripts/check.js
```

No `npm install` needed. For a manual pass: open `index.html`,
go through a few activities in both sections, in both `es` and `en`,
and check `settings/index.html`'s progress table and reset actions.

---

## 6. Deployment

Cloudflare Pages, same pattern as Apptonomia, Sinonimia and Teclatlon:
the repository root is the build output, no bundler. Push to `master`
triggers the build through the Cloudflare Git connector; pull requests
get an automatic preview channel. A deploy — even to a preview channel —
is a network operation: ask before running one (see `CLAUDE.md` §"Agent
workflow").

---

## 7. License

MIT. See [`LICENSE`](../../LICENSE).

## 8. Suite pattern — how every app of Miralante is built

> 🌐 **Other language:** [Spanish](../es/tecnico.md#8-patrón-de-la-suite-cómo-se-construye-cada-app-de-miralante)

This section is the **canonical, cross-project guide** for how
every app of the [Miralante suite](https://apptonomia.uk) is
built and maintained. It is the source of truth that overrides
any single repo's `technical.md` / `tecnico.md` when they
disagree, because the goal is to keep the seven sibling apps
(Apptonomia, Calculia, Memofun, Okeymoney, Sinonimia, Teclatlon,
Routime) consistent: same shape, same conventions, same
deploy, same i18n, same offline behaviour.

A change to this section is a **suite-wide change** and must be
applied to every repo. A change to a project's other sections
in this file is project-specific and stays there.

> **Source of truth for product rules** in this repo:
> [`SPEC.md`](SPEC.md).
> **Source of truth for i18n**: [`I18N.md`](I18N.md).
> This section does **not** redefine those; it codifies the
> pattern they all share.

### 8.0 The pattern in one paragraph

Every app of the Miralante suite is a **static, dependency-free,
offline-first PWA** built from the same minimal skeleton:

1. A small set of **standalone HTML pages** at the repo root
   (one activity) or under `tools/<slug>/` (multi-activity hubs).
2. Every page is a **real, navigable URL** — there is **no SPA
   routing**, no in-page view switching, no `pushState`. Each
   page reloads on entry; navigation between pages is a normal
   `<a>` click.
3. Hidden routes (`about/`, `team/`, `legal/`, `config/`) share
   the same shape: `index.html` + `styles.css` + `strings.<locale>.js`
   pair, with **interlinking in the footer** so any of them is
   one click away from any other.
4. A **service worker** (`sw.js`, network-first) caches the shell
   (`FILES` list, bumped `VERSION`) so the app works offline.
5. **No build step**, no `package.json`, no frameworks, no
   bundlers, no CDN JS. The repo root is the deploy output.

### 8.1 The standalone-page shape

This is the pattern every hidden route and every public route
follows. The shape is identical across the suite; only the
contents change.

#### 8.1.1 The five-folder skeleton

Every app exposes the same five folders:

```
<app>/
  index.html              # Public entry point (the activity)
  app.js                  # Logic
  data.js                 # Locale-neutral layouts + per-locale content
  strings.es.js           # Spanish UI text (source of truth)
  strings.en.js           # English UI text
  styles.css              # App-specific styles
  assets/
    css/{tokens,base,components}.css
    fonts/                # Self-hosted Atkinson Hyperlegible + Nunito
    img/                  # App icon + decorative imagery
    js/{utils,i18n,tts,storage,feedback}.js
  about/                  # Hidden route: presentation
    index.html
    styles.css
    strings.es.js
    strings.en.js
  team/                   # Hidden route: who builds it
    index.html
    styles.css
    strings.es.js
    strings.en.js
  legal/                  # Data-protection page (linked from the footer)
    index.html
    styles.css
    strings.es.js
    strings.en.js
  config/                 # Settings (only on apps that need it)
    index.html
    app.js
    styles.css
    strings.es.js
    strings.en.js
  manifest.json
  sw.js
  _headers
  404.html
  robots.txt
  sitemap.xml
```

Single-activity apps (Teclatlon, Okeymoney) put `index.html` at
the repo root. Multi-activity apps (Apptonomia, Calculia) also put the
landing at the repo root  `index.html`, with `app.js`, `styles.css`
and `strings.<locale>.js` next to it  plus `tools/<slug>/index.html`
per activity; the four hidden folders live at the repo root too.

#### 8.1.2 The HTML shell of a standalone page

Every standalone page opens with the same boilerplate. Below,
the **template**; deviations are called out where they apply.

```html
<!DOCTYPE html>
<html lang="es" data-i18n-title="pageTitle">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculia — Sobre este proyecto</title>
  <!-- Hidden route: not linked from the main menu and should not be
       indexed. Aimed at anyone who wants to know what Teclatlon is:
       families, professionals, journalists, funders, contributors. -->
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="…">
  <meta name="theme-color" content="#FAF7F2">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="../assets/css/locale-picker.css?v=calculia-v75403dc2">
</head>
<body>
  <div class="container {legal|about}">
    <header class="cabecera-{legal|about}">
      <!-- Language is a first-level control in the header, not a
           sub-item of the settings drawer: the shared component mounts
           inside .suite-controls and the gear is inserted on its own,
           right behind it. There is no language button in the HTML. -->
      <div class="suite-controls">
        <div id="locale-picker"></div>
      </div>
      <img src="../assets/img/icono.svg" alt="" width="80" height="80"
           class="logo-{legal|about}">
      <h1>…</h1>
      <p class="lema" data-i18n="tagline">…</p>
      <p class="entradilla" data-i18n="lead">…</p>
      <nav class="indice">…optional, only on long pages…</nav>
    </header>

    <main class="pila">
      <section class="card">…</section>
    </main>

    <footer class="pie-{legal|about}">
      <a class="btn btn-secundario" href="../"
         data-i18n="footerActivities">Ir a la aplicación</a>
      <a class="btn btn-secundario" href="../legal/"
         data-i18n="footerDataProtection">Protección de datos</a>
      <a class="btn btn-secundario" href="../about/"
         data-i18n="footerAbout">Sobre este proyecto</a>
      <a class="btn btn-secundario" href="../team/"
         data-i18n="footerTeamGuide">Quiénes la hacen</a>
      <a class="btn btn-secundario" href="../config/"
         data-i18n="footerSettings">Ajustes</a>
    </footer>
  </div>

  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/i18n.js"></script>
  <script src="strings.es.js"></script>
  <script src="strings.en.js"></script>
  <!-- The dropdown needs its config BEFORE the component. Both
       are deferred, and deferred scripts run in document order, so
       listing them in that order is enough. The ?v= is not optional:
       .js and .css are served immutable for a year, and without it the
       page serves the stale copy from cache. The value is NOT typed by
       hand: `node scripts/asset-tokens.js` derives it from the file's own
       hash, and scripts/check.js (check 16) fails if any drifted. -->
  <script src="../assets/js/locale-picker-config.js?v=calculia-v3be3c240"></script>
  <script src="../assets/js/locale-picker.js?v=calculia-v8b6a4103" defer></script>
  <script>
    /* Register the SW from this entry point so it is active for any
       later navigation, matching what the main index.html and the
       other standalone pages already do. */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js').catch(function () {});
    }
  </script>
</body>
</html>
```

**Notes:**

- `data-i18n-title="pageTitle"` on `<html>` lets `assets/js/i18n.js`
  fill `document.title` during `init()`. The hardcoded `<title>`
  is the fallback the browser tab would show before i18n.js
  executes (and the SW cache fallback).
- The page's own class on the `<div class="container …">` wrapper
  is what the page-specific `styles.css` scopes its rules under
  (`legal-page`, `about-page`, `team-page`). No more `.sp-*`
  ancestor prefixes (those were a SPA-merge leftover, retired in
  2026-09; see `git log`).
- The footer is **always** the same five links (in the same
  order) on `about/`, `team/` and `legal/`. `config/` gets a
  stripped footer that only returns to the SPA. The app root
  (`index.html`) does **not** render this footer (it has its own
  footer with the reset button and the data-protection link —
  see §2 above).

#### 8.1.3 The strings pair

Each standalone folder ships its own `strings.es.js` /
`strings.en.js`. They follow the **flat-key, IIFE-register**
pattern; `scripts/check.js` extracts the dictionary via
`vm.createContext` with a stub `App.i18n.register` and enforces
key parity between locales.

```javascript
/* legal/strings.es.js — page text (ES). */
(function () {
  'use strict';
  App.i18n.register({
    pageTitle: 'Protección de datos',
    pageDescription: 'Teclatlon: qué datos guarda, dónde y por qué. …',
    routeNotice: 'Esta página no se enlaza desde la aplicación. …',
    tagline: 'Sin registro. Sin cookies. Sin analítica.',
    lead: 'Teclatlon no pide tus datos personales. …',
    navResponsible: 'Quién trata tus datos',
    navData: 'Qué guardamos',
    /* …more keys… */
    footerActivities: 'Ir a la aplicación',
    footerAbout: 'Sobre este proyecto',
    footerTeamGuide: 'Quiénes la hacen',
    footerSettings: 'Ajustes'
  }, 'es');
})();
```

Keys are flat (no `legal.pageTitle` style namespacing); the page
**is** the namespace, because the file lives in its own folder.
Common keys (`core.back`, `core.listen`, `core.dataProtection`)
already ship in `assets/js/i18n.js` and are not redefined here.

#### 8.1.4 The standalone stylesheet

Each standalone folder ships its own `styles.css`. It is **the
old `assets/css/subpages.css` split per page**, with the
`.sp-legal` / `.sp-about` ancestor prefixes dropped (they were
a SPA-merge leftover). The page wrapper class
(`<div class="legal-page">`, `<div class="about-page">`, etc.)
is what the CSS scopes under:

```css
.legal-page { max-width: 880px; }
.legal-page .cabecera-legal { … }
.legal-page .indice a { … }
.legal-page section { … }
```

Do **not** introduce per-page classnames that collide with the
shared components (`base.css` already defines `.cabecera`,
`.lema`, `.indice`, `.btn`, `.card`, `.pila`, …). When the
standalone page needs a different look, scope the rule under
the page class — never under a generic `.cabecera` or `.indice`.

### 8.2 The shared core

Every app of the suite ships the same six files under
`assets/js/`, in the same load order, with the same exported
shape. Trimming is allowed; **adding** functionality back is
forbidden unless it serves a concrete need (the trimming notes
in §2.1 above are the canonical rationale).

| Module | Surface | Required by |
|---|---|---|
| `utils.js` | `App.utils.shuffle / $ / $$ / reducedMotion / wakeLock` | every page |
| `i18n.js` | `App.i18n.{locale, setLocale, lang, register, t, pick, apply, SUPPORTED, DEFAULT_LOCALE, LABEL, FLAG}` | every page |
| `tts.js` | `App.tts.speak` | only pages that read aloud (most do) |
| `storage.js` | `App.storage.{get, set, remove}` | only pages that read or write `localStorage` (`index.html`, `config/`) |
| `feedback.js` | `App.feedback.{success, encourage, celebrate}` | only the activity's `app.js` |
| `activity-glue.js` | `App.activityGlue(host)` → `{save, paintStars, levelFromProgress, endRound}` | activities that keep their own round loop (not `App.activityFlow`) |
| `answer-options.js` | `App.answerOptions.{dotRow, yesNo}` | the activities that show a row of dots or a shuffled Yes / No (divisibility-test, multiples, prime-composite) |
| `sheet-test.js` | `App.sheetTest.create({...})` → `{set, render, check}` | the five time activities and date-format (the whole round on one sheet, checked at once) |

The load order is `utils.js → i18n.js → tts.js → storage.js →
feedback.js → strings.<locale>.js → data.js → app.js`. `i18n.js`
must load **before** `tts.js` and `feedback.js`, which read the
active language.

Both `strings.es.js` and `strings.en.js` always load (they're
not gated by `locale`); `App.i18n.locale()` decides which one
is active. The locale picks itself from
`localStorage['teclatlon:locale']` first, then
`navigator.language` (`'es'` fallback).

### 8.3 The PWA contract

The service worker is **network-first, cache-fallback**, declared
in `sw.js` and committed next to `manifest.json`. The contract:

```javascript
var VERSION = 'teclatlon-vN';
var FILES = [
  './index.html',
  './404.html',
  './manifest.json',
  './app.js',
  './data.js',
  './strings.es.js',
  './strings.en.js',
  './styles.css',
  /* one entry per file in the app shell, including every
     standalone page's index.html, styles.css and
     strings.<locale>.js pair */
  './legal/index.html',
  './legal/styles.css',
  './legal/strings.es.js',
  './legal/strings.en.js',
  /* …about/, team/, config/ likewise… */
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/fonts/…woff2',
  './assets/js/utils.js',
  './assets/js/i18n.js',
  './assets/js/tts.js',
  './assets/js/storage.js',
  './assets/js/feedback.js',
  './assets/img/icono.svg'
];
```

Two rules govern changes to `FILES`:

1. **New file → add it to `FILES`.** The `install` handler
   puts each file individually (never `cache.addAll`, which
   aborts on the first failure and bricks the cache for
   everyone).
2. **Any change to a cached file → bump `VERSION`**
   (`'teclatlon-vN'` → `'teclatlon-vN+1'`). Without the bump,
   an offline user is stuck on the old version forever,
   because the `activate` handler only purges caches with a
   different name.

`scripts/check-version-bump.js` enforces (2): it
`git show HEAD:sw.js` to see what `VERSION` was at the last
commit, compares against the current `VERSION`, and checks
that `FILES` and the diff against HEAD agree. If they don't,
the script fails and the `cache-bump` CI job fails too.

Every standalone page also runs
`navigator.serviceWorker.register('../sw.js')` from its inline
script, so a direct visit to `/legal/`, `/about/` or `/team/`
primes the SW for the SPA root the same way `index.html` does.

### 8.4 i18n invariants

These are non-negotiable across the suite. A locale change is
incomplete until **every** file in this list is updated:

1. `assets/js/i18n.js#SUPPORTED` and `#DEFAULT_LOCALE`.
2. `assets/js/i18n.js#BCP47` mapping (for `speechSynthesis`
   voice selection).
3. The pre-paint detector in `index.html` (the inline
   `<script>` that picks the locale before first paint — see
   §2.5 above).
4. `strings.<locale>.js` and every per-folder
   `strings.<locale>.js` pair (`legal/`, `about/`, `team/`,
   `config/`).
5. `data.js`: every locale-split array
   (`DATA.lessons.<locale>`, `DATA.words.<locale>`,
   `DATA.templates.<locale>`, `DATA.numpadSteps.<locale>`).
6. `sw.js`: add the new `strings.<locale>.js` files to
   `FILES` and bump `VERSION`.
7. `scripts/check.js`: the parity check works in N locales
   with no code change (it picks up every
   `strings.<locale>.js` pair via `fs.readdirSync`); confirm
   the script still passes after the locale is added.

The full step-by-step recipe (with example code) is in
[`I18N.md`](I18N.md).

### 8.5 What is **forbidden** (across the suite)

These are anti-patterns observed at some point and explicitly
retired; the commit history is the source of truth for each
retirement. The rule is "if you find yourself reaching for one
of these, stop and re-read this section".

- **No SPA / no `pushState` / no `view-*` sections.** Every
  page is its own URL. Do not merge `legal/`, `about/`,
  `team/` into `index.html` as hidden sections, even with a
  redirect shim. This was tried in 2026-09 (`spa: merge`) and
  reverted in the same release; see `git log` for the lessons
  learned. Navigation between pages must always be a real
  `<a>` click, and every hidden route must be one click away
  from any other via the shared footer.
- **No `App.goLegal` / `App.goAbout` / `view-legal` /
  `view-about` / `sp-legal` / `sp-about` / `sp-idioma` /
  `subpages.css`.** These all belong to the retired SPA-merge
  model.
- **No `_redirects` SPA catch-all.** Cloudflare rejects it
  as a loop; documented in `CLOUDFLARE.md` and in the deploy
  recipe.
- **No `data-app-blocked="mobile"` flash.** The pre-paint
  script is a single inline `<script>` in `<head>`; do not
  split it into a separate `.js` (CSP `script-src 'self'`
  would still allow it, but the synchronous timing guarantee
  only holds for inline scripts in the head).
- **No `package.json`, no `node_modules`.** The repo is the
  build output. A package manifest would force Cloudflare to
  run `npm install` on every build, overshooting the 25 MiB
  asset limit.
- **No JS CDNs.** All fonts, icons and JS ship in `assets/`.
- **No ES module imports** (`<script type="module">`). The
  app must work from `file://` for offline use; ES modules
  break that.
- **No real-time database, no login, no cookies, no
  analytics.** Persistence is `localStorage` only.
- **No tappable on-screen keyboard** in apps that target the
  physical computer keyboard (Teclatlon, Okeymoney's typed
  amounts, Sinonimia's typed words). The on-screen keyboard
  is decorative only.

### 8.6 Validation checklist

Run this on every PR that touches any of the surface files
(`*.html`, `*.js`, `*.css`, `sw.js`, `manifest.json`, `data.js`):

```bash
node scripts/check.js           # must report OK (N checks, no failures)
node scripts/check-version-bump.js   # must pass
```

Then open the affected pages in a browser at
`http://localhost:<port>/<route>` and walk through the manual
smoke:

- `index.html` boots into the name screen or the menu depending
  on saved state; `localStorage` roundtrip works; the "🗑️
  Borrar mi progreso" button resets both the data and the UI.
- `/legal/` loads with the localized h1, tagline and footer;
  the language switcher toggles `lang`, `document.title` and
  every `data-i18n` text without a stale flash.
- `/about/` and `/team/` likewise; their footer links navigate
  to each other and to `/legal/` and `/config/` without reloads
  before the SW primes.
- `/config/` lists the saved state and its two reset buttons
  work (two-step confirm).
- Refresh once after first load and verify
  `navigator.serviceWorker.controller` is non-null.

If any of the above fails, the change does not match the suite
pattern and must be revised before landing.

### 8.7 Cross-repo differences (what this section does **not** cover)

Every app is a single-activity variant of the pattern above.
The per-app differences — what is shared with the suite, what
is trimmed, and what is intentionally different — are
documented in each repo's `technical.md` § "Other apps of the
suite: real differences" (the project-specific delta). Use
that section to decide whether a deviation in one repo is
intentional before copying it to another.

This canonical section lives in **every repo's**
`technical.md` / `tecnico.md`, kept in sync. If you change it
in one repo, mirror it across the others in the same PR.

### 8.8 See also

- §2 above — Teclatlon-specific recipes and contracts that
  build on this pattern.
- [`I18N.md`](I18N.md) — how to add a new language while keeping
  the i18n invariants intact.
- [`CLOUDFLARE.md`](../../CLOUDFLARE.md) — deploy and SW/header
  contracts at the Cloudflare Workers level.
- [`SPEC.md`](SPEC.md) §"Mandatory rule" — the accessibility and
  no-clinical-mention invariants every page must respect.

---

## Compact application header

The main header follows Memofun: a 44px app icon (32px below 650px),
a Nunito brand title at 28px (22px on mobile), suite attribution and aligned
utility controls. It uses an 8px vertical inset and a 6px row gap. Supporting
copy uses regular weight; any star counter stays compact. Header language buttons, where present,
show full names on desktop and ES/EN on mobile, with full accessible names.
Teclatlon keeps its keyboard controls and settings; Enroca keeps its navigation
and settings. These header styles do not change activity controls.
