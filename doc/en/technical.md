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
- **Offline-first PWA**: `manifest.json` + `sw.js` (cache-first of the
  app shell).
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
worker from every entry point (`index.html`, `site/`, `settings/`,
`legal/`, every `tools/<slug>/index.html`) — matches Apptonomia's
pattern and avoids Safari's "cannot open the page" error when a user
lands on a subpage directly.

---

## 2. Architecture

```
calculia/
├── index.html             # Level 0: redirect to site/index.html
├── site/index.html        # Level 0: landing = activity grid (2 sections)
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
│   ├── fonts/              #   self-hosted woff2 (Atkinson Hyperlegible, Nunito)
│   └── img/icono.svg       #   app icon (also the PWA icon)
├── tools/<slug>/          # Level 2: one folder per ACTIVITY (12 total)
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

Same three-level architecture as Apptonomia, scoped to 12 activities
grouped in two sections instead of 7 therapeutic modules: `site/index.html`
has a "🧮 Math" section (Numbers, Quantities, Math Tables, Roman
Numerals) and a "🧩 Reasoning and logic" section (Riddles, Patterns, The
Wallet, The Clock, Stories, What Doesn't Belong?, Puzzle, Goose Game).

### 2.1 `assets/` — shared core, kept whole

This core was ported from Apptonomia **without trimming any function**
(only rebranded: `apptonomia:` → `calculia:` storage prefix,
`Apptonomia` → `Calculia` in comments/strings/`document.title`). Unlike
the single-activity sibling project Teclatlon — which could safely drop
unused functions because only one activity's code called into the
core — Calculia has 12 different activities, and between them they use
nearly every corner of the API:

- `App.dinero` (`dinero.js`): used by The Wallet to draw and reason
  about euro coins/notes.
- `App.i18n.data()` / `.datos()` / `.registerStructure()`: used by
  several activities (e.g. Numbers, Riddles, The Wallet, The Clock,
  Roman Numerals, Patterns, Stories, What Doesn't Belong?) whose
  `data.js` is locale-neutral and gets its text merged in from
  `strings.<locale>.js`.
- `App.feedback.lockUntilAck()`: used by quiz-style activities to lock
  remaining options after a wrong answer (a reading pause, never a
  progress block).
- `App.storage.estrellasTotales()` / `.listaToolIds()`: used by
  `site/index.html` (total stars) and `settings/` (progress list, full
  reset).

Before removing anything from `assets/js/`, grep every `tools/<slug>/app.js`
for a caller — don't assume a function is dead just because it isn't
obviously used by one activity you're looking at.

### 2.2 Level 2 — Activities (`tools/<slug>/`)

Each activity is autonomous and isolated (own storage key, no imports
from another `tools/` folder, works if you open its `index.html`
directly) — same contract as Apptonomia's. See each activity's `data.js`
header comment for its specific data format.

### 2.3 `settings/` — trimmed relative to Apptonomia's

Two actions, same two-step-confirmation pattern as Apptonomia:

- **Reset person data**: removes the language preference only. None of
  Calculia's 12 activities store a name or other personal field, so
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

Same multi-file pattern as Apptonomia: `strings.es.js` and
`strings.en.js` each register one language via
`App.i18n.register(dict, 'es' | 'en')`; both files always load, and
`App.i18n.locale()` decides which is active. `scripts/check.js` checks
key parity between the two files for every `tools/<slug>/`, plus
`site/`, `settings/` and `legal/`.

---

## 4. PWA and service worker

- `sw.js` is cache-first for the app shell. Contract when touching files:
  1. New file → add it to the `ARCHIVOS` list.
  2. Any change to a cached file → bump `VERSION` (`calculia-vN`),
     otherwise users with the installed PWA won't receive the change.
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

No `npm install` needed. For a manual pass: open `site/index.html`,
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
