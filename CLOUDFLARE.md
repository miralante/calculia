# Cloudflare Workers (static assets) — Calculia

> **Production branch & automatic deploy.** Calculia deploys
> **automatically on every push to `master`** via the **Cloudflare
> Git connector**. The GitHub Actions workflow
> [`.github/workflows/validate.yml`](.github/workflows/validate.yml)
> runs `node scripts/check.js` on every push and PR but does **not**
> deploy. The Cloudflare dashboard is the source of truth for
> project settings.
>
> **This project is deployed as a Cloudflare Worker (static assets),
> not classic Cloudflare Pages.** Live at
> <https://calculia.miralante.workers.dev> (assumed by consistency
> with the other apps of the suite — `teclatlon`, `sinonimia`,
> `okeymoney`, `routime`, `memofun` — and to be confirmed against
> the dashboard if needed).
>
> **Part of the Miralante suite.** Calculia is **one of the six
> runtime apps** of the seven siblings (Apptonomia, Calculia,
> Memofun, Okeymoney, Routime, Sinonimia, Teclatlon) that share the
> same author, the same accessibility-first / no-backend
> philosophy, and the same Cloudflare deploy story. The canonical
> group-wide guide lives in
> [Apptonomia's `CLOUDFLARE.md`](https://github.com/miralante/apptonomia/blob/master/CLOUDFLARE.md);
> this document is the Calculia-specific runbook on top of it.

## How it works

1. The repo is connected to a Cloudflare Workers project named
   `calculia` (Workers & Pages → Connect to Git).
2. Every push to `master` triggers a build in Cloudflare's
   infrastructure via Workers Builds, which reads
   [`wrangler.toml`](wrangler.toml) to deploy the repo root as a
   static-assets Worker (no `main` script).
3. The build is a no-op: no `build command`, no `output directory`
   other than `.`, so the static files are served as-is.
4. The `validate.yml` GitHub Action still runs on every push and PR
   to gate content, but it does not deploy.

[`wrangler.toml`](wrangler.toml) is kept for two reasons: it pins
the project name (`name = "calculia"`) so anyone running the local
`wrangler` CLI for debugging sees the same project, and it declares
the `[assets]` binding (`directory = "."`) plus
`not_found_handling = "404-page"` so a manual `wrangler deploy`
(from a dev machine) does the same thing Cloudflare's CI does.
Cloudflare itself doesn't need this file — the dashboard
configuration is the source of truth at deploy time.

> **Do not "fix" by deleting `wrangler.toml` or `_redirects`** or by
> switching to the legacy `pages_build_output_dir` Pages shape.
> Calculia's Cloudflare dashboard project is already a Worker with
> "Workers Builds", and the legacy `wrangler pages deploy` CLI does
> not apply here — use `wrangler deploy` if you ever need to push
> from a dev machine.

## Files in this repository

| File | Purpose |
|---|---|
| `_headers` | Cache and security headers |
| `_redirects` | Single 302 rule: unknown path → `/site/index.html` (legacy fallback for the Pages path; the canonical 404 handling is `not_found_handling = "404-page"` in `wrangler.toml`) |
| `wrangler.toml` | Pins the project name + the `[assets]` binding + `not_found_handling = "404-page"` |
| `.github/workflows/validate.yml` | `node scripts/check.js` and friends on every push/PR (does **not** deploy) |

Calculia has no client-side routing (plain folder layout), so
Cloudflare's implicit per-directory `index.html` lookup handles
deep links (`/tools/<slug>/` → `tools/<slug>/index.html`) without
any rewrite rule. The only `_redirects` rule is the 302 fallback
above, so a stale path doesn't end up on Cloudflare's default JSON
error.

The root `/index.html` keeps its `<meta http-equiv="refresh">` to
`site/index.html` as a client-side entry pointer — that has nothing
to do with server-side routing.

## Configuration in Cloudflare

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `.` |
| Production branch | `master` |
| Root directory | *(empty — repo root)* |

No environment variables are required: the app makes no
server-side calls, and all assets (fonts, icons, activity data)
are bundled in the repo.

## Required Cloudflare headers

The site uses a [`_headers`](_headers) file at the repo root to set
security headers (CSP, X-Frame-Options, Referrer-Policy,
Permissions-Policy, etc.) and a long-cache policy for the
fingerprinted assets, plus a short-cache policy for the HTML entry
points and the service worker. Cloudflare reads this file on
every deploy and applies the rules automatically — no dashboard
configuration needed.

## How to redeploy

Nothing to do. Push to `master` and Cloudflare rebuilds.

For a manual rebuild (e.g. after Cloudflare itself had an
incident), go to the Cloudflare dashboard → Workers & Pages →
`calculia` → **Create deployment** → choose a branch or upload a
directory.

For a one-off preview outside the Git connector (e.g. to test a
dirty worktree without pushing):

```bash
npx wrangler deploy
```

## How to roll back

Cloudflare dashboard → Workers & Pages → `calculia` →
**Deployments**. Each successful build is listed with a timestamp.
Click any of them and select **"Retry deployment"** or **"Rollback
to this deployment"**.

## How to add a custom domain

Cloudflare dashboard → Workers & Pages → `calculia` → **Custom
domains** → **Set up a custom domain** → follow the wizard. DNS is
configured automatically if the domain is already on Cloudflare, or
by CNAME if it is on another provider.

## Rotating credentials

There are no API tokens or secrets to rotate. The GitHub
integration is a one-time OAuth authorisation; revoking it is a
matter of removing the app's access on
[github.com/settings/applications](https://github.com/settings/applications).
