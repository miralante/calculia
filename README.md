# Calculia

> 🌐 **Other languages:** [Español](README.es.md)

A free, static, dependency-free web app with 11 activities for practicing
**math and logical reasoning**: Numbers, Quantities, Math Tables, Roman
Numerals, Riddles, Patterns, The Wallet, The Clock, Stories, What Doesn't
Belong?, and Puzzle. No accounts, no cookies, no analytics:
everything runs in the browser and progress is saved only in
`localStorage`, on your own device.

- 💻 **Run locally**: open `site/index.html` directly in a browser, or
  serve the folder with any static server (`npx serve .` /
  `python -m http.server 8080`) for the full offline-capable PWA
  experience.

---

## 📚 Documentation

| Topic | Document |
|---|---|
| Product, audience, accessibility rules | [`doc/en/SPEC.md`](doc/en/SPEC.md) · [`doc/es/SPEC.md`](doc/es/SPEC.md) |
| Architecture and technical reference | [`doc/en/technical.md`](doc/en/technical.md) · [`doc/es/tecnico.md`](doc/es/tecnico.md) |
| Internationalization (add a language) | [`doc/en/I18N.md`](doc/en/I18N.md) · [`doc/es/I18N.md`](doc/es/I18N.md) |
| Deploy runbook (Cloudflare Workers) | [`CLOUDFLARE.md`](CLOUDFLARE.md) |
| AI agent operational workflow | [`CLAUDE.md`](CLAUDE.md) |

Project history lives in `git log`; no external roadmap is maintained.

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

## ✅ Validate

```bash
node scripts/check.js
```

No `npm install` needed — the script only uses Node's standard library.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

## 🧩 Sibling projects

This project is one of a small group of sibling projects that share
the same author, the same accessibility-first / no-backend philosophy
and the same Cloudflare deploy story. **Apptonomia is the main project**;
the others (Calculia, Okeymoney, Sinonimia, Teclatlon) were spun out of
it or built next to it on the same stack.

| Project | What it is | Repository |
|---|---|---|
| **Apptonomia** *(main)* | Occupational therapy: 7 modules, 69 activities | [github.com/thenkdframe/apptonomia](https://github.com/thenkdframe/apptonomia) |
| Calculia | Math and logical reasoning: 11 activities | [github.com/thenkdframe/calculia](https://github.com/thenkdframe/calculia) |
| Okeymoney | Personal finance and everyday autonomy | [github.com/thenkdframe/okeymoney](https://github.com/thenkdframe/okeymoney) |
| Sinonimia | Plain-language dictionary (easy-read) | [github.com/thenkdframe/sinonimia](https://github.com/thenkdframe/sinonimia) |
| Teclatlon | Touch-typing with a physical keyboard | [github.com/thenkdframe/teclatlon](https://github.com/thenkdframe/teclatlon) |

The canonical Cloudflare / deploy guide for the group lives in
[Apptonomia's `CLOUDFLARE.md`](https://github.com/thenkdframe/apptonomia/blob/master/CLOUDFLARE.md).
This repo uses the **Workers + static assets** model (`wrangler.toml`
+ `[assets]` + `_redirects`), which is a different shape than
Apptonomia/Teclatlon's classic Pages model — see [`CLOUDFLARE.md`](CLOUDFLARE.md)
for the local runbook.
