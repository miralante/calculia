# Product specification

> Canonical source for product scope, audience and non-negotiable rules.
> Technical architecture lives in [`technical.md`](technical.md).

## 1. What Calculia is

A free, static web app with 12 activities for practicing math and
logical reasoning:

- **Math**: Numbers, Quantities, Math Tables, Roman Numerals.
- **Reasoning and logic**: Riddles, Patterns, The Wallet, The Clock,
  Stories, What Doesn't Belong?, Puzzle, Goose Game.

Calculia was split out of Apptonomia, a broader occupational-therapy
activity suite, where these activities used to live in one "Thinking and
counting" module alongside 6 classic board games. The board games
(chess, checkers, dominoes, tic-tac-toe, visual sudoku, connect four)
stayed in Apptonomia; Calculia's scope is calculation and reasoning
specifically. It keeps Apptonomia's accessibility-first design language
(Easy Reading, no pressure, high contrast, large touch targets) because
that design serves anyone practicing math or logic, not only the
audience Apptonomia was originally built for.

## 2. Audience

Anyone practicing math or logical reasoning: students, and in particular
people who benefit from Easy Reading, no-pressure pacing, and
predictable, uncluttered screens. Usable **autonomously**, without a
teacher or family member sitting next to the learner. Works on desktop
and mobile/tablet alike — no device restriction, unlike the sibling
project Teclatlon (computer keyboard only).

## 3. Non-negotiable principles

1. **Autonomy** — usable without a professional or family member present.
2. **No pressure** — no timers, no negative scoring, no "game over".
   Mistakes get an encouraging message and unlimited retries.
3. **Privacy** — no login, no cookies, no analytics, no server. The only
   persisted data (progress, language preference) lives in this
   browser's `localStorage` and never leaves the device. See
   [`legal/`](../../legal/index.html).
4. **Easy Reading** — short sentences, one idea per sentence, plain
   language, no clinical or technical jargon in anything the learner reads.
5. **Accessibility** — buttons ≥ 64×64 px, spacing ≥ 16 px, WCAG AA
   contrast, full keyboard navigation, ARIA on icon buttons and feedback
   zones, respects `prefers-reduced-motion`.
6. **Sober technology** — HTML5 + CSS3 + vanilla JavaScript, no
   frameworks, no build step, no npm dependencies, offline-first PWA.

## 4. Accessibility rules (mandatory for any UI change)

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

## 5. Language policy

UI is bilingual (`es`/`en`); `es` is the default and the source of truth
when a key is missing. Product content changes (activity data, UI copy)
must ship in both languages — see [`I18N` details in `technical.md`](technical.md).
Code (identifiers, comments, commit messages) is always English.
