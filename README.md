# Calculia

> 🌐 **Other languages:** [Español](README.es.md)

A free, static, dependency-free web app with 12 activities for practicing
**math and logical reasoning**: Numbers, Quantities, Math Tables, Roman
Numerals, Riddles, Patterns, The Wallet, The Clock, Stories, What Doesn't
Belong?, Puzzle, and Goose Game. No accounts, no cookies, no analytics:
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
| Deploy runbook (Cloudflare Pages) | [`DEPLOY.md`](DEPLOY.md) · [`DEPLOY.es.md`](DEPLOY.es.md) |
| AI agent operational workflow | [`CLAUDE.md`](CLAUDE.md) |

Project history lives in `git log`; no external roadmap is maintained.

---

## ☁️ Deploying

Calculia is a fully static site (HTML/CSS/JS, no build step), so it ships
directly to **[Cloudflare Pages](https://pages.cloudflare.com)** through
its built-in GitHub integration — there is no custom GitHub Actions
workflow. The HTTP security headers live in [`_headers`](_headers), the
404 fallback in [`_redirects`](_redirects), and the project metadata in
[`wrangler.toml`](wrangler.toml). See [`DEPLOY.md`](DEPLOY.md) for the
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
