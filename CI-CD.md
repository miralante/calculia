# CI/CD and deployment — Calculia

This is the project-specific CI/CD and Cloudflare deployment runbook. For the suite-wide test matrix, see the [Miralante CI/CD guide](https://github.com/miralante/apptonomia/blob/main/CI-CD.md).

## CI validation

Run the checks required by `.github/workflows/validate.yml` from this repository before merging. Project-specific checks and the suite-wide Playwright, crawler, service-worker, and release checks are listed in the linked CI/CD guide.

## Cloudflare deployment profile — Calculia

> **Deploy:** automatic on every push to `main` through the Cloudflare Git connector; Workers Builds deploys the repo and GitHub Actions only validates. The Cloudflare dashboard is the source of truth for project settings. This is a Worker with static assets, not classic Pages. Canonical URL: <https://calculia.apptonomia.uk/>; fallback: <https://calculia.miralante.workers.dev>.

## Configuration

| Setting | Value |
|---|---|
| Worker | `calculia` |
| Production branch | `main` |
| Framework preset | None |
| Build command | (empty) |
| Output / root | `.` / repository root |
| GitHub workflow | [`.github/workflows/validate.yml`](.github/workflows/validate.yml) — `node scripts/check.js` on pushes and pull requests |

`wrangler.toml` is the deploy configuration: it pins the Worker name, serves `[assets] directory = "."` without a `main` script, and sets `not_found_handling = "404-page"`. Keep it; do not convert this project to classic Pages (`pages_build_output_dir` or `wrangler pages deploy`). Workers Builds reads it directly.

`_headers` applies security and cache headers at deploy time; no dashboard rules are needed. No environment variables or Cloudflare service-account keys are required. `_redirects` contains only two compatibility 301s: `/site/` and `/site/index.html` to `/`. `package.json` is for the local Playwright UI smoke test only. No `functions/`.

## Routing and Workers.dev

Cloudflare serves static Worker assets through an active `workers.dev` subdomain or custom domain. A deployment can succeed yet serve nothing without an active route. If a Worker shows **No active routes**, enable its Workers.dev subdomain under **Workers & Pages → `calculia` → Settings → Triggers**. If only a route table is available, add `*/*` on the account's `workers.dev` zone for Worker `calculia`. Routes are dashboard settings, not `wrangler.toml`; enabling one needs no rebuild. If a deployment is not active afterward, retry or promote the latest successful deployment.

Folder-based pages use implicit `index.html` lookup. The landing is `/` with no redirect; `/site/` is the former path and has no retained file. Unknown paths use this project’s `404.html`. Keep the two `_redirects` rules; do not add a catch-all.

## Cache and service worker

`sw.js` uses network-first with cache fallback: online clients receive the server copy; cache is used offline. It declares a `VERSION` and a `FILES` (or `ARCHIVOS`) precache list. Bump `VERSION` in the same commit whenever a listed file changes; `scripts/check-version-bump.js` enforces this in CI. Bump liberally so installed clients receive fixes. See `CLAUDE.md` §B.1.

## Deploy, rollback, and domains

Push to `main` to deploy automatically. Workers Builds handles production deploys, so no local `wrangler login` or GitHub deploy secret is needed. For a manual deployment or preview, run `npx wrangler deploy` (Wrangler reads `wrangler.toml`). To rebuild in the dashboard, open **Workers & Pages → calculia → Create deployment**. Roll back in **Deployments** by retrying or rolling back to a prior successful version.

To add a custom domain, use **Workers & Pages → `calculia` → Custom domains → Set up a custom domain**. Cloudflare configures DNS for a zone in the account; otherwise follow the wizard's DNS instructions. Current setup: `calculia.apptonomia.uk` is canonical in `app.config.json`, page canonical/OG metadata, and `sitemap.xml`. The `workers.dev` fallback serves the same Worker; if one URL differs, check both point here.

There are no API tokens or secrets to rotate. The GitHub integration uses OAuth; revoke access at [github.com/settings/applications](https://github.com/settings/applications).

## Project-specific notes

No server-side calls or environment variables are needed; fonts, icons, and activity data are bundled.

## References

- [`wrangler.toml`](wrangler.toml) — Worker and asset configuration.
- [`_headers`](_headers) — security and cache policy.
- [`.github/workflows/validate.yml`](.github/workflows/validate.yml) — validation; it does not deploy unless stated above.
- [`CLAUDE.md`](CLAUDE.md) — agent workflow and, where applicable, the canonical service-worker cache contract (§B.1).
- [Miralante's shared Cloudflare runbook](https://github.com/miralante/apptonomia/blob/main/CI-CD.md) — common setup and recovery steps.
