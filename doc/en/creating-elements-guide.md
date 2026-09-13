# Guide to creating activities

> **How to design and build a new activity in Calculia, applying the
> product rules in [`SPEC.md`](SPEC.md) §3, the accessibility rules in
> [`technical.md`](technical.md) §5, the technical recipe in §9, and a
> set of **didactic**, **gamification**, **persuasion** and
> **neuromarketing** techniques adapted for the project's audience.**
>
> This document does **not** duplicate the canonical pedagogical guide;
> it points to it and only lists what's specific to Calculia. If a
> rule here clashes with the canonical guide or with `technical.md`,
> `technical.md` wins.

---

## 1. The canonical pedagogical guide

The full didactic, gamification, persuasion and neuromarketing
techniques that all the apps of the Miralante suite share live in the
**Routime** repository under
[`creating-elements-guide.md`](https://github.com/thenkdframe/routime/blob/main/doc/en/creating-elements-guide.md).

Read it before designing anything. It covers (non-exhaustive):

- The 13 mandatory accessibility rules (with the rationale for each).
- The Socratic-method hint ladder (clue → bigger clue → answer).
- The positive-feedback palette (sounds, animations, micro-copy).
- The neuromarketing patterns that the suite uses (commitment,
   reciprocity, social proof) and how they're tuned for an audience
   that learns at their own pace.
- The level-design checklist (Easy → Medium → Hard progression).

## 2. What's specific to Calculia

- **Domain focus**: math and reasoning. The activities are about
  operations, quantities, money, time, patterns and verbal/spatial
  logic — never about daily living skills (those live in Routime).
- **Numerical UI**: the activity must read numbers aloud when
  possible (`App.audio.speakNumber`) and accept both **digits**
  (e.g. `12`) and **words** (`doce`) as input where applicable. The
  Spanish and English word forms are stored in
  `assets/js/numbers.<locale>.js` (see [`I18N.md`](I18N.md)).
- **Money**: amounts are entered in **cents** internally to avoid
  floating-point issues. The display layer formats with the locale
  separator (`I18N.formatCurrency`).
- **Pattern and clock activities**: rely on **SVG** for the visual
  shapes (Roman numerals, clock faces, pattern tiles) and on
  `App.audio` for any spoken clue. The SVG must remain scalable and
  respect `prefers-reduced-motion`.
- **Reasoning activities**: every "Odd one out", "Pattern" or
  "Riddles" item must come with **one obvious reason** and **no
  hidden alternative**. A reviewer must be able to justify the
  correct answer in one sentence.

## 3. The technical recipe

How to scaffold the folder, register the activity in the catalog
data file, add the strings to both locales, and bump the service
worker cache version, is described step by step in
[`technical.md`](technical.md) §9. **Read that section before
writing any code.**

## 4. Compliance checklist before opening a PR

- [ ] Folder created under `tools/<slug>/` with the standard anatomy
      described in [`technical.md`](technical.md) §5.
- [ ] Activity registered in the catalog data file (visible in the
      home grid).
- [ ] Strings added to BOTH `tools/<slug>/strings.es.js` **and**
      `tools/<slug>/strings.en.js` with the same keys.
- [ ] Levels (1, 2, 3) configured with progressive difficulty.
- [ ] Hint ladder follows the Socratic method (see Routime's
      guide, §3).
- [ ] Audio cue respects `prefers-reduced-motion` and the user
      audio preference in settings.
- [ ] Progress saved to `localStorage` only; no network call.
- [ ] Service worker cache `VERSION` bumped in `sw.js`.
- [ ] `node scripts/check.js` passes.

## 5. See also

- Canonical pedagogical guide (Routime):
  [creating-elements-guide.md](https://github.com/thenkdframe/routime/blob/main/doc/en/creating-elements-guide.md).
- Technical recipe:
  [`technical.md`](technical.md) §9.
- Product non-negotiables:
  [`SPEC.md`](SPEC.md) §3.
- Activity catalogue:
  [`activities.md`](activities.md).
