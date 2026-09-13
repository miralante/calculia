# Activity catalogue

Calculia currently ships **15 activities**, organised in two broad
families: **mathematics** (numbers, operations, measures, money) and
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
| **Numbers** | Read, write and compare whole numbers, sequences and place value. |
| **Fractions and measures** | Recognise, compare and operate with fractions and common units of measure. |
| **Math tables** | Practise multiplication and division facts through repetition and short challenges. |
| **Mental math** | Quick calculation exercises with the four operations, without writing intermediate steps. |
| **Money** | Recognise coins and banknotes, count amounts, work out totals. |
| **Wallet** | Practise giving and receiving money, working out change and managing a small budget. |
| **Quantities** | Compare quantities, estimate and reason about "more / less / equal". |
| **Roman numerals** | Read and write Roman numerals up to the thousands. |
| **Temperature** | Read a thermometer, compare temperatures and convert between °C and °F. |

## Module 2: 🧩 Reasoning and logic

**What it works on?** Logic, pattern recognition, verbal reasoning, spatial reasoning.

| Activity | Description |
|----------|-------------|
| **Riddles** | Verbal reasoning: read a short clue, infer the answer. |
| **Patterns** | Detect and continue visual and numerical patterns. |
| **Odd one out** | Identify which element does not belong in a set, and explain why. |
| **Puzzle** | Spatial reasoning: rearrange pieces to rebuild a picture or a sequence. |
| **Clock** | Read the time on analogue and digital clocks, and reason about durations. |
| **Stories** | Short story problems: extract the relevant data and choose the right operation. |

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
