# Deploying Calculia to Cloudflare Pages

Calculia is deployed on **Cloudflare Pages**, using its built-in
GitHub integration. There is no custom GitHub Actions workflow — the
Cloudflare dashboard owns the build and deploy.

## How it works

1. The GitHub repo is connected to a Cloudflare project named
   `calculia` (Workers & Pages → Pages → Connect to Git).
2. Every push to `master` triggers a build in Cloudflare's
   infrastructure.
3. The build is a no-op: no `build command`, no `output directory`
   other than `.`, so the static files are served as-is.
4. The [`.github/workflows/validate.yml`](.github/workflows/validate.yml)
   GitHub Action still runs on every push and PR to gate content,
   but it does not deploy.

`wrangler.toml` is kept for two reasons:

- It pins the project name (`name = "calculia"`) so anyone running
  the local `wrangler` CLI for debugging sees the same project.
- It declares the `[assets]` binding (`directory = "."`) so a manual
  `wrangler deploy` (run from a developer machine) does the same
  thing Cloudflare's CI does. Cloudflare itself doesn't need this
  file — the dashboard configuration is the source of truth at
  deploy time.

> **Heads-up:** Calculia uses the modern **Workers + static assets**
> shape (the `[assets]` table in `wrangler.toml`), not the legacy
> `pages_build_output_dir` Pages shape. This is Cloudflare's current
> recommended path for static sites, and it's what the existing
> "calculia" resource in the Cloudflare dashboard already is. The
> legacy `wrangler pages deploy` CLI does not apply here — use
> `wrangler deploy` if you ever need to push from a dev machine.

## Configuration in Cloudflare

| Setting            | Value                          |
| ------------------ | ------------------------------ |
| Framework preset   | None                           |
| Build command      | *(empty)*                      |
| Build output dir   | `.`                            |
| Production branch  | `master`                       |
| Root directory     | *(empty — repo root)*          |

No environment variables are required: the app makes no server-side
calls, and all assets (fonts, icons, activity data) are bundled in
the repo.

## Required Cloudflare headers

The site uses a [`_headers`](_headers) file at the repo root to set
security headers (CSP, X-Frame-Options, Referrer-Policy,
Permissions-Policy, etc.) and a long-cache policy for the
fingerprinted assets, plus a short-cache policy for the HTML entry
points and the service worker. Cloudflare Pages reads this file on
every deploy and applies the rules automatically — no dashboard
configuration needed.

## Required Cloudflare redirects

The site uses a [`_redirects`](_redirects) file at the repo root.
Calculia has no client-side routing (it uses a plain folder layout),
so the only rule is a 404 fallback to keep stale paths from
returning Cloudflare's default JSON error.

## How to redeploy

Nothing to do. Push to `master` and Cloudflare rebuilds.

For a manual rebuild (e.g. after Cloudflare itself had an incident),
go to the Cloudflare dashboard → Workers & Pages → calculia → "Create
deployment" → choose a branch or upload a directory.

## How to roll back

Cloudflare dashboard → Workers & Pages → calculia → **Deployments**.
Each successful build is listed with a timestamp. Click any of them
and select **"Retry deployment"** or **"Rollback to this deployment"**.

## How to add a custom domain

Cloudflare dashboard → Workers & Pages → calculia → **Custom
domains** → **Set up a custom domain** → follow the wizard. The DNS
will be configured automatically if the domain is already on
Cloudflare, or by CNAME if it is on another provider.

## Rotating credentials

There are no API tokens or secrets to rotate. The GitHub integration
is a one-time OAuth authorisation; revoking it is a matter of
removing the app's access on
[github.com/settings/applications](https://github.com/settings/applications).