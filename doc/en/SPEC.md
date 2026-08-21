# Product specification

> Canonical source for product scope, audience and non-negotiable rules.
> Technical architecture lives in [`technical.md`](technical.md).

## 1. What Calculia is

A free, static web app with 15 activities for practicing math and
logical reasoning:

- **Math**: Numbers, Fractions and Measures, Subtraction and Mental
  Math, Money, Math Tables, Quantities, Roman Numerals, Water
  Temperature.
- **Reasoning and logic**: Riddles, Patterns, The Wallet, The Clock,
  Stories, What Doesn't Belong?, Puzzle.

Calculia is a sibling project to Apptonomia, a broader
occupational-therapy activity suite: Calculia's scope is calculation and
reasoning specifically, not the 6 classic board games (chess, checkers,
dominoes, tic-tac-toe, visual sudoku, connect four) that are part of
Apptonomia's activity catalog instead. It shares Apptonomia's
accessibility-first design language (Easy Reading, no pressure, high
contrast, large touch targets) because that design serves anyone
practicing math or logic, not only the audience Apptonomia was
originally built for.

## 2. Audience

Anyone practicing math or logical reasoning: students, and in particular
people who benefit from Easy Reading, no-pressure pacing, and
predictable, uncluttered screens. Usable **autonomously**, without a
teacher or family member sitting next to the learner. Works on desktop
and mobile/tablet alike — no device restriction, unlike the sibling
project Teclatlon (computer keyboard only).

## 3. Non-negotiable constraints (product)

These constraints come from the **product**, not technical. They are the
"laws" that are never broken, because they define what kind of
experience Calculia offers. Calculia shares this constitution with its
sibling project Apptonomia (see Apptonomia's `SPEC.md`) — adapted to
the fact that Calculia practices calculation and reasoning, not daily
living skills or occupational therapy.

### 3.1 Error never punishes

- No stars or progress are subtracted for failing.
- Failure produces an **encouragement** message
  (`App.feedback.encourage()`), never an "incorrect".
- It can be retried without limit.
- Hints are used (Socratic method) before showing the answer.

### 3.2 No time pressure

- **No visible timers** in the interface.
- The time the person takes isn't measured or shown.
- The rhythm is set by the learner.

### 3.3 Easy reading always

Cognitive accessibility is a guiding principle: every piece of content
follows **easy-read** guidelines and the **UNE 153101:2018 EX**
(Spanish easy-read standard), aligned with Inclusion Europe's European
guidelines. Comprehension outweighs technical accuracy expressed with
difficulty.

- Short sentences, one idea per sentence.
- **Everyday vocabulary, no technical jargon** (e.g. "remember the
  value of each letter", not "remember the mechanics"; "look at the
  colors", not "look at the mechanics").
- No clinical language in the interface ("patient", "therapy",
  "disability").
- Clinical or technical domain language (occupational therapy,
  disability) is only allowed in the project's internal documentation
  — never in what the end user reads (see §4, the zero-mentions rule).

### 3.4 Privacy by default

- **No registration**: email, real name or password aren't requested.
- **No cookies or analytics**: no tracking.
- **No personal data**: progress is saved on the device
  (`localStorage`).
- The application works without an internet connection.
- **Local progress contract**: `localStorage` is limited to
  `estrellas` (an integer) and `completado` (which levels are done).
  We **never** store: failures, time taken, attempt counts,
  comparisons with other people, detailed usage histories, or
  identifying profiles. Progress never leaves the device nor syncs to
  the cloud.

### 3.5 Universal accessibility

- Buttons ≥ 64×64 px, spacing ≥ 16 px.
- WCAG AA contrast minimum.
- Audio **only when the activity design requires it** (see §6, rule
  4) — not a blanket rule for every text. Activities centered on
  reading visual symbols (e.g. Roman Numerals) don't have an audio
  button: color and shape already do that job, and audio wouldn't add
  anything there.
- Complete keyboard navigation.
- Respects `prefers-reduced-motion`.
- Maximum 4–6 options per screen.
- Compatible with screen readers (ARIA).

### 3.6 Meaningful learning whenever possible

Calculia doesn't simulate daily-life scenes the way Apptonomia does —
the goal here is calculation and reasoning, not daily living skills —
but it shares the same underlying pedagogical principle: **meaningful
learning** (in the Ausubel–Novak sense). Practice is anchored in
something real the learner can already recognize, and closes, when it
adds value, with a **transfer** sentence connecting the practice to
life outside the app. Concretely:

- Examples use real data when it exists (historical centuries, real
  monarchs, clocks) instead of abstract numbers with no context — see
  the "famous Roman numeral" panel in Roman Numerals.
- Completing a level can close with a `transferencia` line that says
  where what was learned will be used outside the app.
- A "meaningful" example stays within what the activity has already
  taught: a symbol or rule the activity hasn't explained yet (e.g.
  showing "MCMLXXXIX" before the I/V/X table has been taught) stops
  being meaningful and becomes confusing instead — it breaks gradual
  progression (rule 13 of §6).

### 3.7 Persuasive communication in service of learning

Every activity must communicate **in service of the person, never in
service of pressure**:

1. **Highly didactic** — the goal of each screen is announced in one
   short sentence; an example or modelled step is shown before the
   first round.
2. **Art effects with care** — slow animation (≥ 300 ms), only one
   element moves at a time, disabled with `prefers-reduced-motion`, no
   flashing or invasive fireworks.
3. **Good copy** — short sentences (≤ 12 words), active voice, second
   person, positive imperatives, no sarcasm.
4. **Clear call to action** — one visible CTA per screen; closing CTAs
   invite playing again or going back to the menu, never "share
   score".
5. **Gamification in moderation** — progressive stars that are only
   ever added, no leaderboards.
6. **Explicitly forbidden marketing patterns** — none of these may
   appear anywhere in the app: scarcity ("Only 1 left!"), false
   urgency (timers, countdowns), social proof turned into pressure
   (leaderboards, "others already did it"), sunk-cost / FOMO ("don't
   lose your streak"), dark patterns (pre-checked boxes, fake alerts),
   or exploitative loss aversion (subtracting stars).

## 4. Mandatory rule: zero mentions in the user-facing product

**No text the end user sees may mention, directly or indirectly,
intellectual disability, occupational therapy, minors, children, or
equivalent expressions** ("cognitive difficulties", "special needs",
"different abilities", "underage", etc.). This includes everything
visible in the interface: `tools/<slug>/index.html`,
`tools/<slug>/app.js`, `tools/<slug>/data.js`,
`tools/<slug>/strings.<locale>.js`, `site/index.html`,
`settings/index.html`, and `legal/`. The reason is exactly the one
from §1 and §2: that nobody who uses the app feels singled out,
inferior, or discriminated against by what the app itself says about
them.

Where it applies and where it doesn't:

- **It applies** to everything the end user sees: titles, meta
  descriptions, buttons, labels, messages, icon alt text, footers.
- **It doesn't apply** to the project's internal documentation (this
  document, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`): those files
  are read by whoever maintains or contributes to the project, not by
  the end user, and that's exactly where the product's real objective
  must be explained (see §2 and §3).

This rule is checked automatically: `node scripts/check.js` fails if
any of those terms show up in the files the end user sees.

### 4.1 Public-facing wording: "usuario/a tipo" euphemism

When presenting Calculia to **the general public** (press, talks,
public READMEs that anyone can read, the metaproject landing at
`apptonomia.uk`, social media copy, marketing material), the term
**"intellectual disability" / "discapacidad intelectual"** must not be
used as a way to describe the audience of the app — even when the
surrounding text would otherwise be public. The accepted euphemism for
that audience in those surfaces is **"usuario/a tipo"** (plural
"usuarios/as tipo"), used as a generic profile marker, not as a label
for any real person.

Where the euphemism applies and where it doesn't:

- **Applies** to any text that anyone outside the project can read
  without authentication: `README.md`, `README.es.md`, the portal at
  `apptonomia.uk`, public talks, social media copy, press notes,
  marketing material. In these surfaces, refer to the audience as
  "el/la usuario/a tipo" or "usuarios/as tipo" of the app.
- **Does NOT apply** to this repo's internal documentation
  (`CLAUDE.md`, `doc/en/SPEC.md`, `doc/es/SPEC.md`, `technical.md`,
  [`roles.md`](roles.md), `CONTRIBUTING.md`, `CONTRIBUTING.es.md`) —
  those files are read by maintainers and contributors, and
  "intellectual disability" / "discapacidad intelectual" remains the
  canonical term there, because the project needs an explicit,
  unambiguous explanation of its real objective for whoever maintains
  it.
- **Does NOT apply** to project content that names a clinical concept
  by its real-world name (e.g. an activity that practices calculations
  on a real bureaucratic procedure related to disability): that is
  content, not labelling of an audience.
- **Does NOT apply** to the UI of the app itself: the rule in §4 above
  continues to forbid **any** mention, including "usuario/a tipo", in
  `site/index.html`, `tools/<slug>/index.html`, `app.js`, `data.js`,
  `strings.<locale>.js`, `settings/`, `legal/`, and any other
  user-facing surface. The euphemism is for the outside world, not
  for what the visitor reads on the site.

Rationale: presenting the project's real objective in maintainer docs
is useful and necessary; presenting it in marketing or landing
surfaces is neither necessary nor respectful of the audience —
"usuario/a tipo" lets public material describe what the app is for
(who the typical profile is) without publicly naming a clinical group.

## 5. Design principles

These principles **rule over any other decision**. If a task conflicts
with them, the principles win. They are the product's compass.

1. **Easy reading**: short sentences, one idea per sentence, everyday
   vocabulary, no jargon, no metaphors.
2. **One action per screen**: the user should never have to choose
   between more than 4–6 visible options at once.
3. **Large touch targets**: buttons minimum **64×64 px**, minimum
   spacing 16 px.
4. **Audio only when it adds value**: used only for gamification or
   when the activity design requires it, never by default on every
   text. An activity centered on reading visual symbols (e.g. Roman
   Numerals) doesn't need audio — color and shape already do that job.
5. **High contrast** (WCAG AA minimum).
6. **No pressure**: no visible timers, no negative scoring, no "game
   over".
7. **Immediate positive reinforcement** on success.
8. **`prefers-reduced-motion`**: all animations are disabled if the
   system requests it.
9. **Autonomy**: works offline (PWA), no login, no cost, no personal
   data.
10. **Meaningful learning whenever possible** (§3.6): real examples,
    not abstract ones, always within what the activity has already
    taught.
11. **Persuasive communication in service of learning** (§3.7): never
    pressure patterns or dark patterns. The learner practices because
    the activity is engaging, not because they're being pushed.
12. **Sober technology**: HTML5 + CSS3 + vanilla JavaScript, no
    frameworks, no build step, no npm dependencies, offline-first PWA.

## 6. Accessibility rules (mandatory for any UI change)

1. Easy Reading: short sentences, one idea per sentence.
2. Buttons ≥ 64×64 px, spacing ≥ 16 px.
3. High contrast (WCAG AA minimum).
4. Audio only where the activity design calls for it (🔊 button +
   `App.tts.speak()`), not a blanket rule for every text.
5. No pressure: no timers, negative scoring, or "game over".
6. Positive reinforcement on success: `App.feedback.success()`.
7. Respect `prefers-reduced-motion`.
8. Complete keyboard navigation.
9. ARIA on icon buttons and feedback zones.
10. Maximum 4–6 options per screen.
11. Quiz-type questions: maximum 3 options, always with an explanation.
12. Socratic pacing on mistakes: a hint before the answer, encouragement
    never punishment (`App.feedback.encourage()` /
    `App.feedback.lockUntilAck()`), unlimited retries.
13. Gradual progression: each level changes only one variable at a time.

## 7. Success criteria

A change in Calculia is considered successful when:

1. **Maintains autonomy**: the user can continue using the app without
   external help for that activity.
2. **Is accessible**: complies with WCAG AA and the 13 rules in §6.
3. **Doesn't introduce pressure**: no new counters or punishments.
4. **Works offline**: the app keeps being usable without connection.
5. **Respects privacy**: no new personal data is collected.
6. **Maintains ES/EN parity**: any new text appears in both languages.
7. **Doesn't break existing activities**: existing activities keep
   working the same.
8. **Anchors new content in something real when possible** (§3.6) and
   avoids examples that use symbols or rules outside what the
   activity has already taught.
9. **Avoids the forbidden marketing patterns** of §3.7 (scarcity,
   false urgency, social-proof pressure, FOMO, dark patterns,
   exploitative loss aversion).

## 8. What Calculia does NOT do

Explicit decisions that may surprise — they're here so they aren't
"suggested" in the future:

| Doesn't | Why |
|--------|-----|
| Have user accounts | Privacy and simplicity |
| Store data in the cloud | Privacy and offline-first |
| Have rankings or comparisons | No pressure, no frustration |
| Use push notifications | Doesn't introduce pressure or external dependencies |
| Have in-app purchases | It's free and will remain so |
| Show advertising | Non-profit |
| Collect analytics | Privacy |
| Have chatbot or generative AI | Determinism, accessibility, predictability |
| Use social networks | Privacy and focus |
| Use scarcity, false urgency or FOMO messaging ("only 1 left", "hurry", "don't lose your streak") | Pressure; clashes with `§3.2` and `§3.7` |
| Use social-proof pressure (leaderboards, ranks, "others already did it") | Pressure and discouragement; clashes with `§3.1` and `§3.7` |
| Use dark patterns (forced signups, pre-checked boxes, hidden costs, fake alerts) | Trust and accessibility; clashes with `§3.4` and `§3.7` |
| Subtract stars or progress as punishment | The product only adds, never subtracts (`§3.1`, principle 6) |
| Use "meaningful" examples with symbols or rules the activity hasn't taught yet | Breaks gradual progression (`§6`, rule 13) and easy reading (`§3.3`) |

## 9. Language policy

UI is bilingual (`es`/`en`); `es` is the default and the source of truth
when a key is missing. Product content changes (activity data, UI copy)
must ship in both languages — see [`I18N` details in `technical.md`](technical.md).
Code (identifiers, comments, commit messages) is always English.

## 10. How this document is organized

This SPEC.md is the **product definition**: WHAT, FOR WHOM and WHY. The
rest of the documentation covers the HOW — technical architecture and
the shared API in [`technical.md`](technical.md).
