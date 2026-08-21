# Calculia 🧮

> 🌐 **Other languages:** [Español](README.es.md)
>
> 🚀 **Try it live:** [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![No dependencies](https://img.shields.io/badge/dependencies-none-success.svg)](#-features)
[![Static site](https://img.shields.io/badge/build-none-informational.svg)](#-quick-start)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8.svg)](manifest.json)
[![i18n](https://img.shields.io/badge/i18n-es%20%7C%20en-yellow.svg)](#-documentation)
[![CI](https://img.shields.io/badge/CI-node%20scripts%2Fcheck.js-blue.svg)](.github/workflows/validate.yml)

A free, static, dependency-free web app with 11 activities for practicing
**math and logical reasoning**: Numbers, Quantities, Math Tables, Roman
Numerals, Riddles, Patterns, The Wallet, The Clock, Stories, What Doesn't
Belong?, and Puzzle. No accounts, no cookies, no analytics:
everything runs in the browser and progress is saved only in
`localStorage`, on your own device.

- 🌐 **App**: [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)
- 📦 **Repository**: [github.com/miralante/calculia](https://github.com/miralante/calculia)
- 💻 **Run locally**: open `site/index.html` directly in a browser, or
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

## 👥 Roles in the project

| Role | Who they are | How they participate | Where they look first |
|---|---|---|---|
| 👤 **End user** (typical user profile) | Practices math and reasoning activities | Opens the app in a browser; doesn't read or write code | The app — nothing else to read |
| ❤️ **Support / family / teacher** | Helps an end user pick the right activity, or uses Calculia with a group | Picks activities that fit a learning objective; supervises progress via stars ⭐ | [`CONTRIBUTING.md`](CONTRIBUTING.md) (the "Support" section) |
| 💻 **Build / developer** | Maintains the catalog, the shared core, and the CI | Implements activities in `tools/<slug>/`, runs `node scripts/check.js`, deploys | [`CLAUDE.md`](CLAUDE.md) |

For the full role description in context (with the rest of the
sibling suite), see [`CLAUDE.md`](CLAUDE.md).

---

## 📚 Project documentation (bilingual)

| Language | Entry point |
|---|---|
| 🇬🇧 English (this file) | [`README.md`](README.md) |
| 🇪🇸 Español | [`README.es.md`](README.es.md) |

| Topic | Document |
|---|---|
| Product, audience, accessibility rules | [`doc/en/SPEC.md`](doc/en/SPEC.md) · [`doc/es/SPEC.md`](doc/es/SPEC.md) |
| Architecture and technical reference | [`doc/en/technical.md`](doc/en/technical.md) · [`doc/es/tecnico.md`](doc/es/tecnico.md) |
| Internationalization (add a language) | [`doc/en/I18N.md`](doc/en/I18N.md) · [`doc/es/I18N.md`](doc/es/I18N.md) |
| Deploy runbook (Cloudflare Workers) | [`CLOUDFLARE.md`](CLOUDFLARE.md) |
| AI agent operational workflow | [`CLAUDE.md`](CLAUDE.md) |

Project history lives in `git log`; no external roadmap is maintained.

---

## 🛠️ Preparing / Expanding content

Calculia grows by adding **activities** (one folder per activity under
`tools/<slug>/`). Each activity ships the same six files
(`index.html`, `app.js`, `data.js`, `strings.es.js`, `strings.en.js`,
`styles.css`); every change must respect the catalog parity lock (the
same set of slugs must appear in `tools/` on disk, in `site/index.html`'s
cards, in `settings/index.html`'s progress rows, and in `sw.js`'s
`ARCHIVOS`).

To add a new activity:

1. Create `tools/<slug>/` with the six canonical files (use an
   existing activity as a template).
2. Register the activity: add its card to `site/index.html` (+ both
   `site/strings.<locale>.js` keys), its progress row to
   `settings/index.html` (+ both `settings/strings.<locale>.js` keys),
   and its six files to `sw.js`'s `ARCHIVOS`.
3. Bump `VERSION` in `sw.js` (e.g. `calculia-vN` → `calculia-vN+1`).
4. Add the slug to `STRING_LOCALES` in `scripts/check.js` only if
   you're adding a new locale (rare).

To expand the **data** of an existing activity, edit its `data.js`
(plus `data.js` locale-split if any) — `node scripts/check.js` enforces
key parity between `strings.es.js` and `strings.en.js`.

---

## ✅ Validating changes

```bash
node scripts/check.js
```

No `npm install` needed — the script only uses Node's standard library.
It checks JS syntax, activity folder structure, es/en key parity across
`tools/`, `site/`, `settings/`, `legal/`, `sw.js` ↔ disk parity, and
the catalog-parity lock. The same script runs on every push and PR
via [`.github/workflows/validate.yml`](.github/workflows/validate.yml).

If you touched any file listed in `sw.js` `ARCHIVOS`, also bump
`VERSION` in `sw.js` — the catalog lock + `check.js` enforce this.

---

## ☁️ Deploying

Calculia is a fully static site (HTML/CSS/JS, no build step), so it ships
directly to **[Cloudflare Workers (static assets)](https://developers.cloudflare.com/workers/static-assets/)**
through its built-in GitHub integration — there is no custom GitHub Actions
workflow. The HTTP security headers live in [`_headers`](_headers), the
404 fallback in [`_redirects`](_redirects), and the project metadata in
[`wrangler.toml`](wrangler.toml). See [`CLOUDFLARE.md`](CLOUDFLARE.md) for the
full runbook (rebuild, rollback, custom domain, credential rotation).

Pull requests automatically get a preview URL on `*.pages.dev` — no extra
workflow is needed.

---

## 🤝 Contributing

Issues and pull requests are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md)
for the workflow (and [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) for the
Spanish version). All participants are expected to follow
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## 🛡️ Security

Calculia is a fully client-side static site: no backend, no database,
no telemetry, no third-party runtime. The threat model is essentially
"what a hostile offline page could do to the same origin", which the
browser already sandboxes. See [`SECURITY.md`](SECURITY.md) (or
[`SECURITY.es.md`](SECURITY.es.md)) for how to report a suspected
issue privately.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

## 🧹 Housekeeping

There is no `node_modules`, no build artifacts, and no cache directory
in this repo. To clean the local PWA cache during development, unregister
the service worker from DevTools (`Application → Service workers →
Unregister`) and clear site data. To force a re-validation after
large changes:

```bash
rm -rf site/.cache tools/.cache assets/.cache  # only if present
```

The `scripts/check.js` script is the only "test" step and the only
script that needs to run locally.

---

## 🙏 Credits

Calculia was split out of a sibling project (Apptonomia, a broader
occupational-therapy activity suite) and keeps the same accessibility-
first / no-backend / easy-read language philosophy. The shared core
(`assets/js/`) is ported from Apptonomia with only the storage prefix
rebranded (`apptonomia:` → `calculia:`).

---

## 🧩 Sibling projects

This project is one of a small group of sibling projects that share
the same author, the same accessibility-first / no-backend philosophy
and the same Cloudflare deploy story. **Apptonomia is the main project**;
the others (Calculia, Okeymoney, Sinonimia, Teclatlon, Routime) were
spun out of it or built next to it on the same stack.

| Project | What it is | Repository |
|---|---|---|
| **Apptonomia** *(main)* | Activities for routines and daily-life skills (designed for our typical user profile) | [github.com/miralante/apptonomia](https://github.com/miralante/apptonomia) |
| Calculia | Math and logical reasoning | [github.com/miralante/calculia](https://github.com/miralante/calculia) |
| Memofun | Flashcards built around meaningful learning | [github.com/miralante/memofun](https://github.com/miralante/memofun) |
| Okeymoney | Personal finance and everyday autonomy | [github.com/miralante/okeymoney](https://github.com/miralante/okeymoney) |
| Routime | Activities for routines and daily-life skills | [github.com/miralante/routime](https://github.com/miralante/routime) |
| Sinonimia | Easy-read dictionary | [github.com/miralante/sinonimia](https://github.com/miralante/sinonimia) |
| Teclatlon | Touch-typing with a physical keyboard | [github.com/miralante/teclatlon](https://github.com/miralante/teclatlon) |

The canonical Cloudflare / deploy guide for the group lives in
[Apptonomia's `CLOUDFLARE.md`](https://github.com/miralante/apptonomia/blob/master/CLOUDFLARE.md).
This repo uses the **Workers + static assets** model (`wrangler.toml`
+ `[assets]` + `_redirects`), which is a different shape than
Apptonomia/Teclatlon's classic Pages model — see [`CLOUDFLARE.md`](CLOUDFLARE.md)
for the local runbook.
