# Quick guide

> 🌐 **Other language:** [Español](../es/guia-rapida.md)

This guide explains step by step how to use Calculia: from opening it
to earning stars, switching language or installing it on your phone.
It also includes **four ways to open the app**, ordered from easiest to
hardest.

> 📦 The detailed step-by-step version (with screenshots-equivalent
> descriptions for each step and a full troubleshooting section) lives
> in the canonical cross-suite guide:
> [`routime/doc/en/quick-guide.md`](https://github.com/thenkdframe/routime/blob/main/doc/en/quick-guide.md).
> That guide is shared by all the apps of the Miralante suite because
> the **opening flow, PWA install steps, language switcher and
> troubleshooting are identical** across the suite. This document only
> lists what's specific to Calculia.

---

## 1. How to open Calculia

There are **four ways**, ordered from easiest to hardest. The full
walkthrough is in the canonical guide linked above; the short version:

| # | Method | What you need | Offline? | PWA installable? |
|---|---|---|---|---|
| **A** | From the internet ([calculia.apptonomia.uk](https://calculia.apptonomia.uk)) | A browser | ❌ | ✅ |
| **B** | Downloading the ZIP from GitHub | A browser | ❌ | ❌ |
| **C** | Local server with Python | Python 3 | ❌ | ✅ |
| **D** | Local server with Node.js | Node.js | ✅ | ✅ |

> 💡 If you just want to **try the app**, use method **A** or **B**.
> For the **full experience** (PWA, offline mode, "Add to home
> screen"), use **C** or **D**.

---

## 2. The main screen

The main screen shows a grid of activity cards. Each card opens one
activity. The activities are grouped by skill (mathematics vs
reasoning); see [`activities.md`](activities.md) for the full list.

## 3. Choosing an activity

Tap (or click) any card. The first level opens automatically. You can
change the level from inside the activity header.

## 4. Buttons in each activity

Common buttons: **home**, **restart level**, **previous / next**,
**audio** (when the activity benefits from it), and **settings**
(gear icon, in-app, not the global settings page).

## 5. How audio works

Audio plays automatically when the activity needs it (e.g. "Odd one
out" reading the word). Tap the 🔊 button to replay. Audio respects
`prefers-reduced-motion` and the user's volume settings.

## 6. Response messages

Correct → encouraging message and a star; incorrect → an
"encourage" message and an unlimited retry. There is **no negative
score** anywhere — see [`SPEC.md`](SPEC.md) §3.1.

## 7. Earning stars

Each level completed = 1 star. Up to 3 stars per activity.

## 8. Changing language

Open the language menu from the header (globe icon 🌐). Available:
**Spanish (default)** and **English**. See [`I18N.md`](I18N.md) for
the recipe to add a new locale.

## 9. Personal settings

Open `/settings` (see the canonical guide for the exact URL pattern
used by the project). From there:

- View **My progress** (stars per activity).
- Reset progress (with a confirmation prompt, since it's destructive).
- Manage the audio and reduced-motion preferences.

## 10. Install the app on mobile

The full steps (Android / iOS / desktop) are in the canonical guide.
Short version: open the app in the browser, choose "Add to home
screen" / "Install", confirm.

## 11. Troubleshooting

See the canonical guide's **§11 Troubleshooting** — the items there
(white screen, audio not playing, service worker caching an old
version, etc.) apply identically to Calculia.

## 12. More help

- Product: [`SPEC.md`](SPEC.md).
- Architecture: [`technical.md`](technical.md).
- Activity catalogue: [`activities.md`](activities.md).
- For families and therapists: [`team.md`](team.md).

## 13. Quick summary

1. Open Calculia (4 methods, easiest is **A**).
2. Pick an activity on the home grid.
3. Play at your own pace, no pressure, no timers.
4. Earn up to 3 stars per activity by completing the 3 levels.
5. Switch language with the 🌐 menu; install as PWA for offline use.
