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
| Numbers | `numbers/` | Reading, writing and comparing whole numbers, sequences and place value. Understanding positive numbers, negative numbers and zero through everyday examples and guided practice. | number, count, sequence, place, greater, smaller, equal, positive, negative, zero, thermometer, elevator. |
| Shapes | `shapes/` | Recognising flat shapes and solids, connecting them with real objects, and practising their names, their parts, and the concepts of perimeter, area, volume, symmetry and similarity. | circle, polygon, side, vertex, perimeter, area, volume, symmetry, similarity, cube, prism, pyramid, sphere, cylinder, cone. |
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
- Relating positive numbers, negative numbers and zero to temperatures and building floors (`numbers/`).

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

### 3.10 Geometric shapes

- Recognising circles, triangles, squares, rectangles, rhombuses,
  trapezoids, pentagons, hexagons and octagons (`shapes/`).
- Distinguishing flat shapes, which have no volume, from solids:
  cubes, prisms, pyramids, spheres, cylinders and cones (`shapes/`).
- Connecting each shape with everyday objects and practising its name,
  sides, vertices, perimeter, area, volume, symmetry and similarity (`shapes/`).
- **Four concept slides** come before the gallery. The first shows what a
  flat shape and a solid are. The second explains the edge of a figure:
  side and vertex —the everyday word and the geometry one, both of them—
  side by side, and the perimeter underneath, which is the way round all
  the sides and so takes the whole row. The third pairs the inside of the
  two things: the area of the figure and the volume of the solid. The fourth
  compares two figures, symmetry (it folds into two equal halves) and
  similarity (the same shape at another size).
- Each concept is taught with a drawing of its own rather than with the
  word: the perimeter is the outline in dashes, the area is the inside
  hatched and clipped to the shape itself, the volume is the box in dashes
  with the solid inside it, and symmetry is the line it folds along.
- The gallery presents each shape by name with a small clarification
  underneath: the sides and vertices of the flat shape, or the faces of the
  solid and what they are shaped like. The clarification is not a heading,
  it is not read before the name, and it never gives away a question of the
  test.
- The everyday examples then pair each shape with a real object and a
  caption, and a note applies to that object the concepts that belong to it:
  to a figure, its sides, vertices, perimeter and area; to a solid, its
  volume. The note does not define them again, it counts them.
- One test of 50 questions mixes the names of every shape, sides and
  vertices from triangles to pentagons, perimeters, area, volume, symmetry,
  similarity, solids, and solid nets.
- **The concepts are introduced here, not computed.** `shapes/` asks about
  them in their recognition form —which part of the figure is its area,
  which way it folds, which one is the same shape made smaller— and the
  calculation stays where it already was: area by counting little squares and
  perimeter on the grid belong to `geometry/`, volume by counting cubes as
  well, and similarity with scales and slopes belongs to `similar/`. The
  same numbers are never asked twice across the suite.
- Two choices in how perimeter and symmetry are presented are forced by the
  question, not by taste. The perimeter is only measured on regular
  figures, because a rectangle or a trapezoid does not have a single side
  length. And symmetry is only asked of figures with exactly one vertical
  fold line —triangle, pentagon, trapezoid— because a square or a hexagon
  has a horizontal one too and the question would have no single answer.
  Both lists are checked when the activity starts.

### 3.11 Trigonometry

- `trigonometry/` is **the activity where the right triangle appears as a
  figure**, and with it the ratio that gives trigonometry its name. It
  works in three blocks, in this order: the three sides (`lados`), the
  ratio (`razon`) and the ladder (`medir`).
- **The ratio is counted, never written out.** "How many squares does it
  rise for every square it goes along" is read off a grid drawn under the
  triangle. There are no decimals, no division and not a single symbol:
  the sentence already carries the two numbers in place ("3 for every 4")
  and the only decision is which ones they are.
- **The idea holding up all of trigonometry is that the ratio does not
  depend on size**: two triangles with the same ratio are the same
  triangle, only bigger. That is why `y2` asks whether two of them share
  it and `y3` which of three does, and the one that does is always twice
  the size of the first. Both are drawn to the same scale on the two
  axes: scaling them separately would make the drawing's lean differ from
  the triangle's, and the question would then be answered by what the
  picture looks like rather than by what the triangle is.
- **No level computes a sine, a cosine or a tangent**, and none writes a
  letter such as "s". The word *hypotenuse* is taught, but always beside
  its explanation ("the longest one: it is the slanted side"), the same
  way the three kinds of angle are taught in `geometry/`.
- **The `medir` block is the transfer**: what was counted in the abstract
  shows up as a ladder leaning against a wall. The three ladders in the
  last level measure exactly the same — 7-24-25 and 15-20-25, the only
  two pairs of right triangles sharing a hypotenuse that fit in a small
  drawing — so the only variable is how far upright they stand. A
  reviewing activity must check that equality at start-up: if the
  ladders measured different lengths, "which one reaches highest" would
  be answered by the length instead of by the lean.

### 3.12 Logic and proof

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
