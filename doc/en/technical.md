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
├── tools/<slug>/          # Level 2: one folder per ACTIVITY (15 total)
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

Same three-level architecture as Apptonomia, scoped to 15 activities
grouped in two sections instead of 7 therapeutic modules: `site/index.html`
has a "🧮 Math" section (Numbers, Fractions and Measures, Subtraction
and Mental Math, Money, Math Tables, Quantities, Roman Numerals, Water
Temperature) and a "🧩 Reasoning and logic" section (Riddles, Patterns, The Wallet, The
Clock, Stories, What Doesn't Belong?, Puzzle).

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
  Calculia's 15 activities store a name or other personal field, so
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
file for every `tools/<slug>/`, plus `site/`, `settings/` and
`legal/`.

The core is multi-locale-ready from day one — see `I18N.md` §4 for
the three binary `es`/`en` spots that have to be generalized when
adding a third language (`BCP47` map in `i18n.js`, `DECIMAL_SEP` in
`dinero.js`, and the `BOTONES_IDIOMA` map in `site/index.html`).

---

## 4. PWA and service worker

- `sw.js` is cache-first for the app shell. Contract when touching files:
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
the repo root. Multi-activity apps (Apptonomia, Calculia) put
`tools/<slug>/index.html` per activity and a `site/index.html`
landing page; the four hidden folders live at the repo root.

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
</head>
<body>
  <div class="container {legal|about}">
    <header class="cabecera-{legal|about}">
      <div class="idioma-selector" role="group" aria-label="Elegir idioma">
        <button type="button" class="btn-idioma" id="btnIdiomaEs"
                data-locale="es" aria-pressed="false">🇪🇸 Español</button>
        <button type="button" class="btn-idioma" id="btnIdiomaEn"
                data-locale="en" aria-pressed="false">🇬🇧 English</button>
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
  <script>
    (function () {
      'use strict';
      function paintLanguageSelector() {
        var active = App.i18n.locale();
        document.getElementById('btnIdiomaEs')
          .setAttribute('aria-pressed', String(active === 'es'));
        document.getElementById('btnIdiomaEn')
          .setAttribute('aria-pressed', String(active === 'en'));
      }
      document.getElementById('btnIdiomaEs')
        .addEventListener('click', function () { App.i18n.setLocale('es'); });
      document.getElementById('btnIdiomaEn')
        .addEventListener('click', function () { App.i18n.setLocale('en'); });
      paintLanguageSelector();
    })();
  </script>
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
