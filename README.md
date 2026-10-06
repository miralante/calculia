# Calculia 🧮

> 🌐 **Other languages:** [Español](README.es.md)
>
> 🚀 **Try it live:** [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![No dependencies](https://img.shields.io/badge/dependencies-none-success.svg)](#-features)
[![Static site](https://img.shields.io/badge/build-none-informational.svg)](#-features)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8.svg)](manifest.json)
[![i18n](https://img.shields.io/badge/i18n-es%20%7C%20en-yellow.svg)](#-project-documentation-bilingual)
[![CI](https://img.shields.io/badge/CI-node%20scripts%2Fcheck.js-blue.svg)](.github/workflows/validate.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

A free, static, dependency-free web app with 11 activities for practicing
**math and logical reasoning**: Numbers, Quantities, Math Tables, Roman
Numerals, Riddles, Patterns, The Wallet, The Clock, Stories, What Doesn't
Belong?, and Puzzle. No accounts, no cookies, no analytics:
everything runs in the browser and progress is saved only in
`localStorage`, on your own device.

- 🌐 **App**: [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)
- 📦 **Repository**: [github.com/miralante/calculia](https://github.com/miralante/calculia)
- 💻 **Run locally**: open `index.html` directly in a browser, or
  serve the folder with any static server (`npx serve .` /
  `python -m http.server 8080`) for the full offline-capable PWA
  experience.

---

## 🚀 Try it live

Calculia is deployed at **[calculia.apptonomia.uk](https://calculia.apptonomia.uk/)**
— open it in a browser, install it to the home screen for offline use,
and pick an activity to start. No accounts, no telemetry.

---

## ✨ Features

Calculia is a **multi-activity catalogue** built on the same three-
level architecture as Apptonomia (shared core in `assets/js/`, one
folder per activity in `tools/<slug>/`, a landing at the site root), plus
a settings page for progress visibility.

- 🧮 **11 activities** — Numbers, Quantities, Math Tables, Roman
  Numerals, Riddles, Patterns, The Wallet, The Clock, Stories,
  What Doesn't Belong?, and Puzzle.
- 🪶 **Zero runtime dependencies** — pure HTML/CSS/JS, no build step.
- 🌐 **Bilingual** — Spanish (default) and English.
- 🔒 **Privacy by default** — no accounts, no cookies, no analytics:
  progress is saved only in `localStorage` on the user's device.
- 📦 **Offline-capable PWA** — installable to the home screen, works
  without internet.
- 🖐️ **Accessibility** — buttons ≥ 64×64 px, WCAG AA contrast, full
  keyboard navigation, `prefers-reduced-motion`, screen-reader
  compatible (ARIA).
- ⭐ **Progressive stars** — only ever added, never subtracted; the
  only gamification pressure is "you can come back".

---

## � About

Calculia is a **multi-activity catalogue** for practicing math and
logical reasoning in short, visual activities: numbers, quantities,
math tables, Roman numerals, riddles, patterns, the wallet, the
clock, stories, what-doesn't-belong, and puzzles. Each activity is
self-contained, fits on one screen, and is reachable from a single
landing page — there is no tutorial and no prerequisite order, so
the end user can pick whatever fits the moment.

Calculia ships as a static, dependency-free web app and a
progressive web app. It is one of the **Miralante** suite of seven
sibling apps — see [🌐 The Miralante suite](#-the-miralante-suite--projects-in-the-suite)
below for the full list. The real product specification lives in
[`doc/en/spec.md`](doc/en/spec.md); this README deliberately avoids
rephrasing product decisions to keep the public description and
the spec in lock-step.

---

## 🎯 Goals

Calculia is built to:

- 🧮 **Offer 11 short, visual activities** that can each be
  completed in under five minutes without prior instruction.
- ⭐ **Reward practice with stars that only ever go up**, never
  down — no high-score tables, no streaks to break, no "you
  failed" screens.
- 🌐 **Stay bilingual end-to-end** — Spanish is the default and
  source of truth, English keeps parity in every string and
  every activity.
- 🔒 **Keep progress on the user's device only** — every star
  lives in `localStorage` under the `calculia:` prefix; nothing
  is ever uploaded.
- 📦 **Work offline as a PWA** — install to the home screen,
  use it on a tablet with no signal, never block on a network
  round-trip.
- 🖐️ **Meet WCAG AA contrast and AAA reading-level** targets
  for the audience (see [`doc/en/spec.md`](doc/en/spec.md) §3).

Each goal cross-references a spec section in
[`doc/en/spec.md`](doc/en/spec.md); if a goal is not in the spec,
either add it to the spec or drop it from this list.

---

## 👥 Audience & roles

Calculia is designed for a **typical user profile** — anyone who
wants to practice math and logical reasoning in short,
self-contained activities, on their own device, with no account
and no pressure. The real product specification lives in
[`doc/en/spec.md`](doc/en/spec.md); this README deliberately
avoids any clinical label so the public description stays
generic.

The project recognises three roles around the app, each with its
own entry point:

| Role | Who they are | How they participate | Where they look first |
|---|---|---|---|
| 👤 **End user** (typical user profile) | Practices math and reasoning activities | Opens the app in a browser; doesn't read or write code | The app — nothing else to read |
| ❤️ **Support / family / teacher** | Helps an end user pick the right activity, or uses Calculia with a group | Picks activities that fit a learning objective; supervises progress via stars ⭐ | [`CONTRIBUTING.md`](CONTRIBUTING.md) (the "Support" section) |
| 💻 **Build / developer** | Maintains the catalog, the shared core, and the CI | Implements activities in `tools/<slug>/`, runs `node scripts/check.js`, deploys | [`CLAUDE.md`](CLAUDE.md) |

See [`doc/en/roles.md`](doc/en/roles.md) for the full role description
and the trio-vs-pair-vs-sole patterns across the apps of the suite.

---

## 📚 Project documentation (bilingual)

All project documentation lives in the `doc/` folder:

| Language | Entry point |
|---|---|
| 🇬🇧 English (this file) | [`doc/en/index.md`](doc/en/index.md) |
| 🇪🇸 Español | [`doc/es/indice.md`](doc/es/indice.md) |

By role and profile, the most relevant docs are:

| I am… | Start here |
|---|---|
| 👤 End user or family member | [`doc/en/readme.md`](doc/en/readme.md) |
| ❤️ Therapist, family, or support professional | [`doc/en/team.md`](doc/en/team.md) |
| 🤔 I want to understand what Calculia is and why | [`doc/en/spec.md`](doc/en/spec.md) |
| 💻 Developer | [`doc/en/technical.md`](doc/en/technical.md) |

### 📄 Other repo documents

| Document | Audience |
|---|---|
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Anyone who wants to contribute (family, therapists, devs) |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Contributor covenant (Contributor Covenant 2.1) |
| `CLAUDE.md` | AI agents: operational workflow, coordination and approvals |
| [`CLOUDFLARE.md`](CLOUDFLARE.md) | Canonical Cloudflare Workers deploy guide for the suite (Calculia + Apptonomia + Memofun, Okeymoney, Sinonimia, Teclatlon) |
| Project history | Lives in `git log`; no external roadmap is maintained |
| `doc/en/i18n.md` / `doc/es/i18n.md` | Details of the ES/EN multilanguage system |

---

## 🛠️ Preparing / Expanding content

Calculia grows by adding **activities** under `tools/<slug>/`. Each
activity ships the six canonical files (`index.html`, `app.js`,
`data.js`, `strings.es.js`, `strings.en.js`, `styles.css`); every
change must respect the catalog lock: the public landing lists Numbers,
Roman Numerals and Shapes (in that order), the hidden `dev/`
catalog lists the other activities, and the two together cover the slugs in
`tools/`, `config/`, and `sw.js`.

To add a new activity:

1. Create `tools/<slug>/` with the six canonical files (use an
   existing activity as a template).
2. Register the activity: add its card to `dev/index.html` (+ both
   `strings.<locale>.js` keys), its progress row to
   `config/index.html` (+ both `config/strings.<locale>.js` keys),
   and its six files to `sw.js`'s `ARCHIVOS`. The public `index.html`
      exposes the three front-door activities in this order: Numbers,
      Roman Numerals, Shapes.
3. Bump `VERSION` in `sw.js` (e.g. `calculia-vN` → `calculia-vN+1`).
4. Add the slug to `STRING_LOCALES` in `scripts/check.js` only if
   you're adding a new locale (rare).

To expand the **data** of an existing activity, edit its `data.js`
(plus `data.js` locale-split if any) — 
ode scripts/check.js`
enforces key parity between `strings.es.js` and `strings.en.js`.

---

## ✅ Validating changes

```bash
node scripts/check.js
```

No 
pm install` needed — the script only uses Node's standard library.
It checks JS syntax across `tools/`, the site root and `assets/js/`,
canonical file anatomy per activity folder, `sw.js` ↔ disk parity,
es/en key parity, and the catalog lock: the public landing carries Numbers,
Roman Numerals and Shapes (defined as `PUBLIC_SLUGS` in
`scripts/check.js`); hidden `dev/index.html` lists the other activities,
and together they cover all `tools/` slugs in addition to `config/` and
`sw.js`.
The same script runs on every push and PR via
[`.github/workflows/validate.yml`](.github/workflows/validate.yml).

If you touched any file listed in `sw.js` `FILES`, also bump
`VERSION` in `sw.js` — the catalog lock + `check.js` enforce this.

---

## ☁️ Deploying

Calculia is a fully static site (HTML/CSS/JS, no build step), so it
ships directly to **[Cloudflare Workers (static assets)](https://developers.cloudflare.com/workers/static-assets/)**
through its built-in GitHub integration. The HTTP security headers
live in [`_headers`](_headers), the 404 fallback in
[`_redirects`](_redirects), and the project metadata in
[`wrangler.toml`](wrangler.toml). See [`CLOUDFLARE.md`](CLOUDFLARE.md)
for the full runbook (rebuild, rollback, custom domain, credential
rotation).

Pull requests automatically get a preview URL on
`*.pages.dev` — no extra workflow is needed.

---

## 🛡️ Security

Calculia is a fully client-side static site: no backend, no database,
no telemetry, no third-party runtime. The threat model is essentially
"what a hostile offline page could do to the same origin", which the
browser already sandboxes. See [`SECURITY.md`](SECURITY.md) (or
[`SECURITY.es.md`](SECURITY.es.md)) for how to report a suspected
issue privately (preferred channel:
[`hello@apptonomia.uk`](mailto:hello@apptonomia.uk)).

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

## Contributing

Issues and pull requests are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md)
for the workflow (and [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) for the
Spanish version). All participants are expected to follow
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## 🧹 Housekeeping

There is no 
ode_modules`, no build artifacts, and no cache directory
in this repo. To clean the local PWA cache during development,
unregister the service worker from DevTools (`Application → Service
workers → Unregister`) and clear site data. To force a re-validation
after large changes:

```bash
rm -rf .cache tools/.cache assets/.cache  # only if present
```

The `scripts/check.js` script is the only "test" step and the only
script that needs to run locally.

---

## 🌐 The Miralante suite — projects in the suite

Calculia is one of **seven apps** in the **Miralante** suite, sharing
the same author, the same accessibility-first / no-backend philosophy
and the same deploy story. Apptonomia, on top of being an app itself,
also acts as the **landing portal** that introduces the whole suite.
None of the seven repos is the "main" one — they are peers; this is
just the original product this group grew out of.

| Project | What it is | Repository |
|---|---|---|
| **Apptonomia** *(portal — landing only, no app)* | Landing page that introduces the Miralante suite (not a runtime app) | [github.com/miralante/apptonomia](https://github.com/miralante/apptonomia) |
| [Calculia](https://calculia.apptonomia.uk/) | Math and logical reasoning | [github.com/miralante/calculia](https://github.com/miralante/calculia) |
| [Ludia](https://ludia.apptonomia.uk/) | Adapted games with rules, exercises and matches | [github.com/miralante/ludia](https://github.com/miralante/ludia) |
| [Memofun](https://memofun.apptonomia.uk/) | Flashcards built around meaningful learning | [github.com/miralante/memofun](https://github.com/miralante/memofun) |
| [Okeymoney](https://okeymoney.apptonomia.uk/) | Personal finance and everyday autonomy | [github.com/miralante/okeymoney](https://github.com/miralante/okeymoney) |
| [Routime](https://routime.apptonomia.uk/) | Activities for routines and daily-life skills | [github.com/miralante/routime](https://github.com/miralante/routime) |
| [Sinonimia](https://sinonimia.apptonomia.uk/) | Easy-read dictionary | [github.com/miralante/sinonimia](https://github.com/miralante/sinonimia) |
| [Teclatlon](https://teclatlon.apptonomia.uk/) | Touch-typing with a physical keyboard | [github.com/miralante/teclatlon](https://github.com/miralante/teclatlon) |

The canonical Cloudflare / deploy guide for the group lives in
[Apptonomia's `CLOUDFLARE.md`](https://github.com/miralante/apptonomia/blob/master/CLOUDFLARE.md).
This repo uses the **Workers + static assets** model (`wrangler.toml`
+ `[assets]` + `_redirects`), which is a different shape than
Apptonomia/Teclatlon's classic Pages model — see [`CLOUDFLARE.md`](CLOUDFLARE.md)
for the local runbook.


