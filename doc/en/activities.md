# Activity catalogue

Calculia currently ships **27 activities**, organised in two broad
families: **mathematics** (numbers, shapes, operations, measures, money) and
**reasoning** (logic, patterns, sequences, riddles). Activities are
grouped by the skill they work on, not by screen folder.

> The canonical product description (audience, non-negotiable rules,
> data model) lives in [`SPEC.md`](SPEC.md) §2. The recipe to build a
> new activity lives in [`technical.md`](technical.md) §9 and in
> [`creating-elements-guide.md`](creating-elements-guide.md).

---

## Module 1: 🔢 Mathematics

**What it works on?** Calculation, quantity, measure, money.

| Activity | Description |
|----------|-------------|
| **Places and sizes** | Say where something is (inside, outside, on top, underneath, left, right) and which of two things is longer, heavier or holds more. |
| **Numbers** | Read, write and compare whole numbers, sequences and place value. |
| **Shapes** | Recognise flat shapes and solids, count their sides and their corners. |
| **Same shapes** | Tell whether two figures are the same shape at another size, count the squares on the sides of a right triangle, and compare how steep two ramps are. |
| **Fractions** | Recognise, compare and operate with simple fractions and decimals. |
| **Measures** | Choose the right unit (cm, m, g, kg, ml, l) and estimate length, weight and capacity. |
| **Geometry** | Tell a right angle from an acute or obtuse one, count the edge and the squares inside a figure, and fold a figure in half to see if it matches. |
| **Math tables** | Practise multiplication and division facts through repetition and short challenges. |
| **Big sums** | Turn a multiplication round, cut a hard one into two easy parts, share out in the two ways division is used, and decide what comes first when brackets are involved. |
| **Exact groups** | Multiples and divisibility rules, prime numbers, when two repeating things meet, the biggest chunk common to two lengths, and squares with their roots. |
| **Mental math** | Quick calculation exercises with the four operations, without writing intermediate steps. |
| **Percentages** | Read a percentage off a hundred squares, work out a discount or a rise in euros, grow a recipe keeping its proportion, see that more people on the same job means less time, read real metres off a plan, and know how many things the money you carry reaches for. |
| **Money** | Recognise coins and banknotes, count amounts, work out totals. |
| **Wallet** | Practise giving and receiving money, working out change and managing a small budget. |
| **Quantities** | Compare quantities, estimate and reason about "more / less / equal". |
| **Roman numerals** | Read and write Roman numerals up to the thousands. |
| **Problems** | Word problems: decide whether to add or take away, then work out how many, with the situation drawn to be counted. |
| **Temperature** | Read a thermometer, compare temperatures and convert between °C and °F. |

## Module 2: 🧩 Reasoning and logic

**What it works on?** Logic, pattern recognition, verbal reasoning, spatial reasoning.

| Activity | Description |
|----------|-------------|
| **Riddles** | Verbal reasoning: read a short clue, infer the answer. |
| **Patterns** | Detect and continue visual and numerical patterns. |
| **Odd one out** | Identify which element does not belong in a set, and explain why. |
| **Puzzle** | Spatial reasoning: rearrange pieces to rebuild a picture or a sequence. |
| **The balance** | Work out what the bag weighs so both pans come out level, see that a letter is a number you do not know yet, read whether a real graph goes up or down, and write and build pieces: the big one is x on each side, the strip is x long and the little one is a 1. |
| **Data and charts** | Read a pictogram, a bar chart and a table; share out equally; judge whether something is certain, possible or impossible; see in a cloud of dots whether two things rise together; and draw a ball without putting it back. |
| **The Calendar** | Days of the week, months of the year and the four seasons, read off a visible calendar. |
| **Clock** | Read the time on analogue and digital clocks, and reason about durations. |
| **Stories** | Put the pictures of an everyday routine into the order things happened. |

---

## How to read the catalogue

- **Activity** is the user-facing name (same label that appears in the
  app's home screen and in `site/index.html`).
- **Description** is a one-line summary of the skill the activity
  practices. The full pedagogical intent, levels and didactic notes
  live in [`creating-elements-guide.md`](creating-elements-guide.md).
- Each activity lives under its own folder in `tools/<slug>/`, follows
  the anatomy described in [`technical.md`](technical.md) §5, and is
  registered in the catalog data file used by the home grid.
