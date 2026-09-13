# Detailed contents — Calculia

> 🌐 **Other language:** [Español](../es/CONTENIDOS.md)

This document is a **detailed didactic index** of Calculia. It
expands on [`activities.md`](activities.md) and
[`creating-elements-guide.md`](creating-elements-guide.md) by
giving, for every activity, module and pedagogical concept shipped
with the app:

- Its **name** (as it appears in the UI).
- Its **module** (`tools/` slug).
- Its **didactic objective** (what it works on).
- Its **key vocabulary / theme** (used in `strings.es.js` /
  `strings.en.js`).
- Its **reference** (canonical document and section).

Use this document as the **workbook for Calculia**: when a new
activity is proposed, when content is reviewed, or when the catalog
is rebalanced, this is the document to read first.

> **Source of truth for product rules**: [`SPEC.md`](SPEC.md).
> **Source of truth for pedagogy**:
> [`creating-elements-guide.md`](creating-elements-guide.md).
> This document does **not** redefine rules; it indexes the content
> that those rules produce.

---

## 0. How this document is organized

1. Modules (the 2 thematic blocks: Mathematics / Reasoning).
2. Activities, module by module, in didactic order.
3. Pedagogical concepts (the "what each activity works on").
4. Numerical content (what's in the data bank).
5. Restrictions and forbidden content.

---

## 1. Modules

| # | Module | Emoji | Slug | Color | What it works on |
|---|---|---|---|---|---|
| 1 | Mathematics | 🔢 | `math` | Blue | Calculation, quantity, measure, money. |
| 2 | Reasoning and logic | 🧩 | `reasoning` | Teal | Logic, pattern recognition, verbal reasoning, spatial reasoning. |

---

## 2. Activities by module

### 2.1 Module 1 — Mathematics (🔢)

| Activity | Slug (`tools/`) | Didactic objective | Key vocabulary |
|---|---|---|---|
| Numbers | `numbers/` | Reading, writing and comparing whole numbers, sequences and place value. | número, contar, secuencia, posición, mayor, menor, igual. |
| Fractions and measures | `fractions-measures/` | Recognising, comparing and operating with fractions and common units of measure. | fracción, mitad, tercio, metro, kilo, litro, comparar. |
| Math tables | `math-tables/` | Multiplication and division facts through repetition and short challenges. | tabla, multiplicar, dividir, producto. |
| Mental math | `mental-math/` | Quick calculation with the four operations, no written intermediate steps. | sumar, restar, multiplicar, dividir, rápido, cálculo. |
| Money | `money/` | Recognising coins and banknotes, counting amounts, working out totals. | moneda, billete, céntimo, euro, contar, total. |
| Wallet | `wallet/` | Giving and receiving money, working out change, managing a small budget. | cartera, pagar, vuelta, gasto, presupuesto. |
| Quantities | `quantities/` | Comparing quantities, estimating, reasoning about "more / less / equal". | más, menos, igual, comparar, estimar. |
| Roman numerals | `roman-numerals/` | Reading and writing Roman numerals up to the thousands. | romano, I, V, X, L, C, D, M, convertir. |
| Temperature | `temperature/` | Reading a thermometer, comparing temperatures, converting between °C and °F. | temperatura, grado, Celsius, Fahrenheit, termómetro. |

### 2.2 Module 2 — Reasoning and logic (🧩)

| Activity | Slug (`tools/`) | Didactic objective | Key vocabulary |
|---|---|---|---|
| Riddles | `riddles/` | Verbal reasoning: reading a short clue, inferring the answer. | pista, deducir, respuesta, inferir. |
| Patterns | `patterns/` | Detecting and continuing visual and numerical patterns. | patrón, secuencia, continuar, regla. |
| Odd one out | `odd-one-out/` | Identifying which element does not belong in a set, and explaining why. | sobra, conjunto, común, distinto. |
| Puzzle | `puzzle/` | Spatial reasoning: rearranging pieces to rebuild a picture or sequence. | pieza, imagen, reconstruir, espacio. |
| Clock | `clock/` | Reading the time on analogue and digital clocks, reasoning about durations. | hora, minuto, reloj, analógico, digital, duración. |
| Stories | `stories/` | Short story problems: extracting the relevant data, choosing the right operation. | cuento, problema, dato, operación, sumar, restar. |

---

## 3. Pedagogical concepts (what each activity works on)

### 3.1 Number sense

- Counting and the number line (`numbers/`).
- Place value (`numbers/`).
- Comparing numbers (`numbers/`, `quantities/`).

### 3.2 Operations

- Addition and subtraction (`mental-math/`, `stories/`).
- Multiplication and division (`math-tables/`, `mental-math/`).
- Composition and decomposition of amounts (`quantities/`,
  `stories/`).

### 3.3 Fractions and measures

- Reading and writing fractions (`fractions-measures/`).
- Comparing fractions (`fractions-measures/`).
- Converting between units (`fractions-measures/`).

### 3.4 Money

- Coin and note recognition (`money/`).
- Counting totals (`money/`, `stories/`).
- Working out change (`wallet/`).
- Building a small budget (`wallet/`).

### 3.5 Time and temperature

- Reading analogue and digital clocks (`clock/`).
- Reasoning about durations (`clock/`, `stories/`).
- Reading a thermometer (`temperature/`).
- Converting °C ↔ °F (`temperature/`).

### 3.6 Number systems

- Reading and writing Roman numerals (`roman-numerals/`).
- Translating between Roman and decimal (`roman-numerals/`).

### 3.7 Patterns

- Visual pattern detection (`patterns/`, `puzzle/`).
- Numerical pattern detection (`patterns/`).
- Continuing a sequence (`patterns/`).

### 3.8 Verbal reasoning

- Inferring from a short clue (`riddles/`).
- Explaining why something is "the odd one out"
  (`odd-one-out/`).
- Extracting relevant data from a short story (`stories/`).

### 3.9 Spatial reasoning

- Reassembling a picture or sequence (`puzzle/`).
- Reading clock positions (`clock/`).

### 3.10 Logic and proof

- Each "Odd one out", "Pattern" or "Riddles" item comes with **one
  obvious reason** and **no hidden alternative**. A reviewer must
  be able to justify the correct answer in one sentence (see
  [`creating-elements-guide.md`](creating-elements-guide.md)
  §2.2).

---

## 4. Numerical content (data bank)

The activities draw numbers, prices, fractions, time strings and
temperature values from a **locale-aware data bank**:

| Content | Source | Examples |
|---|---|---|
| Word forms for numbers | `assets/js/numbers.<locale>.js` | `doce` (es), `twelve` (en). |
| Currency formatting | `I18N.formatCurrency` | `12,50 €` (es), `€12.50` (en). |
| Date and time strings | `I18N.formatTime`, `I18N.formatDate` | `14:35` (es), `2:35 pm` (en). |
| Decimal separator | Per-locale toggle | `,` in es, `.` in en. |

Rules for the data bank:

- All amounts are stored internally in **cents** (integer), then
  formatted at the UI layer with the locale-aware currency helper.
- All word forms of numbers live in
  `assets/js/numbers.<locale>.js`, one entry per locale, **never
  inlined** in `tools/<slug>/data.js`.
- Roman numeral conversion table is **per locale** (Spanish /
  English), and uses the canonical Roman forms `I V X L C D M`.

---

## 5. Restrictions and forbidden content

These rules apply to **every** activity and are **never** broken
(full rationale in [`SPEC.md`](SPEC.md) §3 and
[`creating-elements-guide.md`](creating-elements-guide.md)
§2):

- **No timers, no score, no punishment** — feedback is encouragement,
  not "wrong".
- **No clinical labels** about the user (intellectual disability,
  occupational therapy, minors) inside the UI.
- **No floating-point money** — amounts are stored as cents.
- **No "hidden alternative" answers** — every reasoning item has
  exactly one obviously correct answer.
- **No tracking, no login, no analytics** — progress is in
  `localStorage` only.
- **No hateful, sexual, political or violent content** in the
  user-facing product.

---

## 6. See also

- Product: [`SPEC.md`](SPEC.md).
- Architecture: [`technical.md`](technical.md).
- Activity catalogue (short): [`activities.md`](activities.md).
- Pedagogical guide (long): [`creating-elements-guide.md`](creating-elements-guide.md).
- Languages: [`I18N.md`](I18N.md).
- For families and therapists: [`team.md`](team.md).
