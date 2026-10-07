# Product design and the target user

> Calculia's **design guidelines** in one place: who we design for, where
> the design system lives, which rules are non-negotiable, and **how they
> are verified**. Complements [`SPEC.md`](SPEC.md) (product and
> accessibility) and [`technical.md`](technical.md) (architecture).
> Other language: [Español](../es/diseno.md)

---

## 1. Who we design for: the target user

The typical user of Calculia practises calculation and logical reasoning
**on their own**. In practice there are two profiles that share the same
interface needs:

| Profile | What they bring | What the interface must give them |
|---|---|---|
| **Person who benefits from easy read** (easy read, an unpressured pace, predictable screens) | Reads little and slowly; visual load competes with the task | One idea per screen, short text, no noise, no surprises |
| **Student of any age** reviewing material | Reads fast, but often in a hurry or on a phone | Large touch targets, immediate response, no getting stuck |

Both **use the app with nobody beside them**. That is why nearly every
rule in the project is about *autonomy*: if something has to be explained
for it to work, the design is wrong.

### 1.1 The five needs that generate every rule

1. **See at a glance what can be pressed.** Every control is a
   `<button>` at ≥ 64×64 px, ≥ 16 px apart, with a text label. A control
   you only recognise by hovering over it — because its background went
   transparent — **does not exist** for someone who is not looking for it.
2. **Know where you are.** Fixed header, back link always top left, and
   chained screens always end in a button that names the *next* concrete
   action ("Move the thermometer →", not "Next").
3. **Not feel that they are failing.** An error gives encouragement,
   never punishment: no timers, no lost stars, hints before the answer.
4. **Understand without being told.** Teach before you ask: context →
   reference → practice.
5. **Be able to use their ears.** A 🔊 button and `App.tts.speak()`
   **only** where the activity's content needs it, not everywhere.

### 1.2 How this audience is named

Suite-wide rule, set in [`CLAUDE.md`](../../CLAUDE.md) and
[`SPEC.md`](SPEC.md) §4:

- **"Intellectual disability"** is the canonical term and may only appear
  in **internal documentation** (this document, `CLAUDE.md`, `SPEC.md`,
  `technical.md`, `roles.md`, `CONTRIBUTING.md`).
- **"Typical user"** is the accepted euphemism on **public surfaces**
  (README, talks, social media, press notes).
- **The product — what the user actually reads — carries no mention at
  all**, not even "typical user". Neither `index.html`, nor
  `tools/<slug>/`, nor `strings.<locale>.js`, nor `legal/`.
  `scripts/check.js` enforces this and fails if a forbidden term appears
  on a visible page.

---

## 2. The three themes

The theme is chosen with `data-theme` on `<html>`; the switch lives in the
⚙️ drawer in settings. **Never write a literal colour if a token already
exists** — that is what makes all three themes work.

| Theme | `data-theme` | Background | Text |
|---|---|---|---|
| Light (default) | *(no attribute)* | `#FAF7F2` | `#1A1A2E` |
| Dark | `"dark"` | `#14161E` | `#F2F0EA` |
| High contrast | `"contrast"` | `#000000` | `#FFFFFF` |

`--texto-sobre-acento` is the token that **inverts** per theme (white on
light, dark on dark and contrast) because the accents get lighter. A
primary button whose background does not come from `--mod-*` breaks that.

---

## 3. Where the design system lives

```
assets/css/tokens.css       ← the single source of colour, size and spacing
assets/css/base.css         ← reset, typography, visible focus
assets/css/components.css   ← .btn, .card, .option-btn, .tool-header, utilities
tools/<slug>/styles.css     ← ONLY what that activity adds
```

**Division rule:** a component used by many activities lives in
`components.css`, not in the stylesheet of the first activity that
invented it. If two activities declare the same rules, they are promoted
to the shared sheet (`components.css` holds the case of `.menu-grid` /
`.btn-actividad`: 18 activities build it with `paintMenu()`, but the
rules existed only in 6 tools' stylesheets; the same rules, verbatim, are
now in the shared file).

### 3.1 The tokens that matter

| Token | Light value | What for |
|---|---|---|
| `--boton-min` | `64px` | minimum side of any control |
| `--espacio` | `16px` | minimum separation between controls |
| `--espacio-grande` | `24px` | separation between blocks |
| `--radio` | `16px` | corner radius |
| `--color-borde` | `#D8D2C8` | card and secondary-button border |
| `--color-texto-suave` | `#4A4A68` | secondary text |
| `--color-acierto` | `#2E7D32` | success |
| `--color-animo` | `#C05621` | encouragement — **never an aggressive red** |
| `--texto-sobre-acento` | `#FFFFFF` | text on top of a solid accent |

### 3.2 Each activity's accent: the table to respect

Every activity has **one** accent colour, taken from the section it
belongs to. The table is read from the catalogue, not from taste:

| Section | Accent | Activities |
|---|---|---|
| **Math** (`#mod-mates`) | `--mod-razonamiento` (teal) | numbers (including positive and negative numbers), roman-numerals, shapes, places, geometry, divisibility, operations, quantities, mental-math, percent, money, math-tables, measures, similar, fractions-measures, problems, temperature |
| **Reasoning and logic** (`#mod-logica`) | `--mod-memoria` (orange) | riddles, patterns, wallet, algebra, charts, calendar, clock, stories, odd-one-out, puzzle |

⚠️ **`--mod-mates` is not a token.** It is the `id` of the Math
`<section>` in the catalogue. Pointing a CSS rule at it does not error —
it goes *silent*. See §6.

To tint an activity's primary button, the pattern is exactly this (copied
from `roman-numerals` and `shapes`):

```css
.tool-header h1 { color: var(--mod-razonamiento); }
.btn:not(.btn-secondary):not(.btn-audio) { background: var(--mod-razonamiento); }
```

The `:not(...)` is there so secondary and audio buttons are not repainted.

---

## 4. The design guidelines, as a list

These are the ones that get verified. The normative source is
[`SPEC.md`](SPEC.md) §3.5 and §6.

1. **One accent per activity**, the one from its section (§3.2).
2. **Every pressable control is a `<button type="button">`** with a text
   label. No `<div>` or `<span>` with `cursor: pointer`.
3. **The button says what it does.** Every transition button names the
   next action concretely — "See it in real life →", not "Next" — and the
   screen it leads to delivers what it promised. Both landing
   activities chain the same way: theory → **real life** → practice.
4. **≥ 64×64 px** touch target and **≥ 16 px** separation.
5. **AA contrast minimum (4.5:1), AAA where feasible (7:1)** between text
   and what is behind it — and if a button's background is transparent,
   the ratio is measured against **what is behind it**, not against paper.
6. **Colour is never the only code.** Every signal (success, zero,
   positive/negative) is reinforced with shape, icon or text.
7. **Visible focus** on everything focusable (`--color-foco`).
8. **Errors never punish** and there is **no time pressure**.
9. **`prefers-reduced-motion`** respected.
10. **At most 4–6 options** per screen.
11. **Nobody reads code**: UI text lives in `strings.<locale>.js`, never
    in the HTML or in `app.js`.

---

## 5. How they are verified (not by reading code)

**A style that is not opened in a browser is not verified.**
`node scripts/check.js` validates syntax, structure, `es`/`en` parity and
the catalogue — but it **does not look at appearance**. A button can pass
every one of its checks and be invisible.

There are three ways, from quickest to most complete:

### 5.1 Look

Open `tools/<slug>/index.html` and walk the screens. This is the gold
standard: the failure in §6 is visible in two seconds.

### 5.2 Measure the computed style

```bash
node scripts/one-off/probe-acento-actividad.js
```

Compares the **computed** `background` and `color` of each activity's
main button and returns the contrast ratio. This is the one that catches
an accent that never applies.

### 5.3 Audit a whole activity

```bash
npm run test:ui -- /tools/numbers/
```

This journey checks the explanation, everyday examples, thermometer and
elevator in Spanish and English. It also checks that the new screens fit
at 320, 375, 768 and 1280 pixels.

**Measure at 375×667**, not on desktop: on tall screens
`@media (min-height: 720px)` deliberately compacts `.btn` to 40 px
(`components.css`), and that compaction **masks** a hardcoded
`min-height` that breaks the rule.

Playwright is global on this machine; if it is missing, see CLAUDE.md §
"Shared Playwright installation" for the setup.

---

## 6. Pre-integration case: the invisible button in *Positive and Negative*

This section keeps the diagnosis of the former standalone tool. Its
content is now part of Numbers.

**The symptom.** In the former `tools/posneg/` tool the buttons were not showing. Instead
of a button there was **a hand**: the `pointer` cursor over an empty gap.
Nobody would say "there is no button" unless the rest of the app showed
them — `roman-numerals` and `shapes`, the two activities on the
landing page, render them correctly.

**The cause.** The former `tools/posneg/styles.css` tinted its buttons with
`var(--mod-mates)`, which **does not exist**. `--mod-mates` is the `id`
of a `<section>` in the catalogue, not a token; the name came from
Apptonomia, where the stylesheet was copied from.

A `var()` that does not resolve **does not error**: the browser marks the
declaration invalid at computed-value time and falls back to its initial
value. For `background` that means **transparent**. But `.btn` in
`components.css` sets its label colour from `--texto-sobre-acento`
(white), which **still applies**. Result:

```
background: transparent  ← the var() did not exist
text:       #FFFFFF      ← the token did exist
behind:     #FAF7F2      ← the page's cream
contrast:   1.07 : 1
```

White text on cream: **invisible**. All that was left was the
`cursor: pointer` — the hand. The same thing stripped the `<h1>` of its
teal (it fell back to navy), and did the same to the theory title, the
number line and the dashed borders.

**Why nobody caught it before:**

- `check.js` passed **every** one of its checks (several hundred; the
  count moves with the catalogue). It validates syntax and structure, not
  appearance.
- The HTML was correct: they were real `<button>`s, with `type`, with a
  label and with their handler. The fault was **only** in a stylesheet.
- The UI smoke did not catch it either: it checks that the button exists
  and is clickable, and it was — it just could not be seen.

**How to catch it in 10 seconds:** open the page and look. Then
`probe-acento-actividad.js` turns it into a number (`1.07`) you can
compare across activities.

**The lesson, in one sentence:** *a token that does not exist does not
break the build, it breaks the screen.* And this failure pattern —
**invisible accent, label that still applies** — can only exist because
the label colour and the background come from different sources, which is
exactly what `.btn` does. If a button's background depends on a token you
have not verified, measure it.

### 6.1 The twin of the same bug: a hardcoded colour that ignores the theme

With the button fixed, the same activity was hiding the opposite bug: the
**positive** and **negative** cards carried a hand-written background
(`#FFFBEB`, `#E3F2FD`). A hand-written colour **does not change with the
theme**, so switching to dark or high contrast left the card cream while
the text inside it took the theme's colour. Measured on the thermometer
screen:

| Theme | `.temp-goal` / `.temp-sign` | Contrast |
|---|---|---|
| Light | on cream | 2.03 : 1 |
| Dark | `#B3B0C8` on cream | 2.03 : 1 |
| High contrast | `#FFFFFF` on cream | **1.04 : 1** |

The same invisible text, in the same place, in two of the three themes.
**Eight failures** in one go.

It was fixed with activity-local tokens (`--pn-pos-*`, `--pn-neg-*`)
defined **once per theme**. The important part is not the token name but
the rule: *if the background changes with the theme, the text inside it
must be a token too.* Making the background theme-aware let the labels go
back to `--color-texto` / `--color-texto-suave` and come out correct in
all three themes with nothing else changed.

Verification:

```bash
node scripts/one-off/probe-temas-contraste.js
```

It walks the screens in all three themes and lists every text below the
WCAG minimum (4.5:1, or 3:1 for large text). That is how to catch this
family of bugs, because an activity that **does** use tokens comes out
clean without touching anything.

---

## 7. From here on

- Any new activity starts from `components.css` and from the two landing
  references (`roman-numerals`, `shapes`), not from an old stylesheet
  copied out of another project.
- A `styles.css` rule that **several** activities need is a sign the
  component belongs in `components.css`.
- If a rule depends on a token, make sure the token exists: searching
  `--mod-` in `assets/css/tokens.css` confirms it in a second.
- When you touch the interface, the verification is `check.js` **plus**
  looking at the screen. Both.

---

## References

| Document | What it adds |
|---|---|
| [`SPEC.md`](SPEC.md) | Product definition, non-negotiable constraints and accessibility rules (§3.5, §6) |
| [`technical.md`](technical.md) | Architecture, shared core and activity anatomy |
| [`creating-elements-guide.md`](creating-elements-guide.md) | Recipe for building a new activity |
| [`activities.md`](activities.md) | Catalogue of the 27 activities |
| [`roles.md`](roles.md) | Who decides what |
| [`../../CLAUDE.md`](../../CLAUDE.md) | Suite-wide rules, including the "typical user" wording rule |