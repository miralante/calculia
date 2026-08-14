# Contributing to Calculia

Thanks for your interest! Before opening an issue or a PR, please
have a look at:

- The product spec in this repo's `doc/` folder (the canonical source
  for non-negotiable product and accessibility rules).
- The technical reference in `doc/` (architecture, constraints, the
  language policy).
- `CLAUDE.md` (the workflow we follow when editing the repo).

## How to contribute

- **Bugs and feature requests**: use the
  [issue templates](../../.github/ISSUE_TEMPLATE/).
- **Pull requests**: use the
  [PR template](../../.github/PULL_REQUEST_TEMPLATE.md).

## Product changes: both languages

`es` is the default and the source of truth. If you touch UI
strings, lesson / activity data, or any other locale-split content,
update both `es` and `en` (root and/or `legal/` as applicable).
`node scripts/check.js` enforces key parity, but not translation
quality — proofread both languages.

## Code style

- Classic scripts, not ES modules (compatibility with `file://` and
  old browsers). All shared code is exposed on `window.App.*`.
- Identifiers, comments and commit messages in English.
- UI text in the language it represents.
- No frameworks, no bundlers, no JS CDNs.

## Development environment

```bash
npx serve .
# or
python -m http.server 8080
```

There is no build step. `node scripts/check.js` is the only
validation step (CI also runs it on every push and PR).

## Reporting a vulnerability

See [`SECURITY.md`](SECURITY.md).
