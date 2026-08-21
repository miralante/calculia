# Project roles

Calculia has **three differentiated roles**, same as the rest of the
sibling family (Apptonomia, Memofun, Okeymoney, Sinonimia, Teclatlon):

| Role | Who they are | How they participate | Where they look first |
|---|---|---|---|
| 👤 **End user** (anyone practicing math and logical reasoning, and in particular people who benefit from Easy Reading) | Practices the 14 activities | Opens `site/index.html` in a browser and uses the app autonomously. **Doesn't read code**, doesn't touch [`settings/`](../../settings/) for anything beyond progress reset. | The app — nothing else to read |
| ❤️ **Support**: family, teacher, therapist | Picks the right activity for a learning goal | Chooses activities that fit a learning objective (Numeracy, Reasoning and logic) and supervises progress via the stars ⭐ in [`settings/`](../../settings/). May also report missing content or wording that's too hard. | [`CONTRIBUTING.md`](../../CONTRIBUTING.md) (the "Support" section) |
| 💻 **Build**: developer | Maintains the catalog, the shared core, and the CI | Implements activities in `tools/<slug>/`, runs [`scripts/check.js`](../../scripts/check.js), bumps `VERSION` in `sw.js`, and deploys. | [`CLAUDE.md`](../../CLAUDE.md) · [`technical.md`](technical.md) |

> 💡 The end user is always someone who benefits from Easy Reading,
> no-pressure pacing, and uncluttered screens — see [`SPEC.md`](SPEC.md)
> §2. Content, language and interface decisions are made with their
> experience in mind. What stays outside their participation is purely
> technical decisions (GitHub, code architecture, the catalog parity
> lock) — not because they are excluded, but because this is the
> support/build domain.

## Where to start, by profile

| If you are… | Start with… |
|---|---|
| 👤 End user or direct family member | The app — nothing technical to read |
| ❤️ Family/teacher choosing activities for a learning goal | [`SPEC.md`](SPEC.md) — full product & accessibility rules |
| ❤️ Support person reporting a missing activity or unclear wording | [`CONTRIBUTING.md`](../../CONTRIBUTING.md) (the "Support" section) |
| 🤔 Just want to understand what Calculia is | [`README.md`](../../README.md) |
| 💻 Developer | [`CLAUDE.md`](../../CLAUDE.md) · [`technical.md`](technical.md) |

## 🤝 A small, focused project

Unlike a multi-team product, Calculia is intentionally small: one
catalog of 14 activities, one shared core in `assets/js/`, one static
site, no backend. The **support** role usually overlaps with the
**build** role — the same person who picks the activity for a learner
is also the one opening the PR — and that's expected. The three roles
are documented separately so that whoever joins the project knows what
the project expects from them, not because they have to be done by
three different people.
