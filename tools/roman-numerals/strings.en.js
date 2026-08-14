/* ============================================================
   Calculia — Roman Numerals strings (EN)
   Single-language file. Same keys as strings.es.js.
   Loaded conditionally from index.html based on App.i18n.locale().
   ============================================================
   4-screen flow (see doc/en/SPEC.md §3.6, rule 13):
     1. introScreen — what Roman numerals are and why they are
        still used. A click-to-advance carousel of the 5 core
        symbols/combinations (I, V, X, IV, VI).
     2. famousScreen — real, meaningful examples (a century, a
        real monarch, a clock face) the person can cycle through
        with Previous/Next, all still built only from I/V/X so
        nothing here is out of scope yet.
     3. reminderScreen — the I/V/X table with the step-by-step
        mechanics and the subtract rule (IV, IX…). NO audio: the
        hint is the table itself, with colors linking each
        letter to its decimal value.
     4. levelsScreen — 3 activity groups: "Learn" (chains level
        1 → 2), "Apply" (chains level 3 → 4 → 5) and "Test" (mixes
        the 5 base modes). The first two group sub-levels to reduce
        choice fatigue; after each sub-level the activity advances
        to the next one within the same group without going back
        to the menu, preserving the gradual progression (rule 13).

   In the test, the 3 options are always: the correct answer,
   "0", and "∞". Since Roman numerals have no symbol for zero
   or infinity, the correct answer is the only one backed by a
   real Roman symbol: the format makes the right answer obvious.

   Each round shows the mechanics step-by-step (decomposition)
   with one color per letter (I→blue, V→green, X→orange).
   Socratic hints guide letter-by-letter ("How many I's do you
   see?", "Is there a V behind?") instead of repeating the
   number.

   Practice with repetition: every item in a practice level is
   shown exactly 2 times per round (in shuffled order) so the
   mechanics settle in, and a failed answer immediately reveals
   the colored decomposition with the total as on-the-spot help.
   The "Test" level mixes the 4 base modes without repeating
   items, evaluating what was practised.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    "title": "🏛️ Roman Numerals",
    "instruction": "Learn Roman numerals and use them to recognize centuries.",
    "backToLevels": "← Back to levels",

    /* ---------- Screen 1: introduction (symbol carousel) ---------- */
    "introTitle": "What Roman numerals are",
    "introText": "Roman numerals are an ancient system that is still used today. You see them on clocks, monuments and in books.",
    "introNext": "Next →",

    /* ---------- Screen 2: famous Roman numerals ---------- */
    "introFamousTitle": "A famous Roman numeral",
    "introFamousSubtitle": "Look at this example:",
    "introFamousExample": "Henry VIII → the 8 (VIII) is a Roman numeral.",
    "famousPrev": "← Previous",
    "famousNext": "Next →",

    /* ---------- Screen 3: reminder (the mechanics) ---------- */
    "referenceTitle": "Remember the value of each letter",
    "referenceText": "Each letter is always worth the same. Letters add together in order, unless a smaller letter comes before a larger one: then it subtracts.",
    "referenceNext": "Start practising →",
    "symbol{I}": "I is worth 1 (adds)",
    "symbol{V}": "V is worth 5 (adds)",
    "symbol{X}": "X is worth 10 (adds)",
    "ruleSubtract": "If a smaller letter comes BEFORE a larger one, it subtracts:",
    "ruleAdd": "If it comes AFTER, it adds:",
    "exampleSubtract": "IV = 1 − 5 = 4",
    "exampleAdd": "VI = 5 + 1 = 6",

    /* ---------- Screen 4: levels ---------- */
    /* Levels are grouped into 3 buttons (down from the previous 6)
       to reduce choice fatigue. The first two options group
       sub-levels that chain automatically, preserving the gradual
       progression (rule 13): each sub-level still changes only one
       variable at a time. */
    "levelsTitle": "Choose an activity",
    "test": "Test",
    "testInfo": "Mixes the 4 activities in random order",
    "level1": "Symbols I, V, X",
    "level1Info": "Numbers 1 to 10",
    "level2": "Numbers 11 to 21",
    "level2Info": "Combine X with I and V",
    "level3": "Which century is it?",
    "level3Info": "Read the century in Roman numerals",
    "level4": "Write the number in Roman",
    "level4Info": "Choose the correct Roman numeral",
    "level5": "Kings and queens",
    "level5Info": "Read their real name and guess their number",
    "read": "Learn the Roman numerals",
    "readInfo": "From 1 to 10, then 11 to 21",
    "apply": "Apply them in real life",
    "applyInfo": "Centuries, write the Roman numeral, kings and queens",
    "done": " ✔ Done",
    "chooseAnotherLevel": "Choose another activity",

    /* ---------- Quiz ---------- */
    "whichNumber": "What number is this?",
    "whichCenturyNumber": "Which century is this?",
    "whichRoman": "What is the Roman numeral for this?",
    "whichMonarchNumber": "What number is in their name?",
    "centuryRomanLabel": "Century {roman}",
    "infinityOption": "∞ (infinity)",
    "correctExplanation": "✅ Correct! Roman numerals have no symbol for 0 or infinity, only letters.",
    "wrongExplanationPrefix": "❌ That's not it. Look at the colors: ",
    "hintHint": "🤔 Hint: ",
    "finalSummary": "You earned {n} stars. Now you have {total} stars.",
    /* Header and ending of the failed-question reinforcement: after
       the normal round ends, the items the user got wrong are
       replayed in a mini-round until every one is answered right.
       Stars already earned are kept. */
    "reinforceTitle": "Reinforcement",
    "reinforceIntro": "Repeat these {n} until you get them all right.",
    "reinforceDone": "Reinforcement done! You've mastered those numbers.",
    "contexto": "You are reading Roman numerals. You will see them in real places: books, monuments or clocks.",
    "transferencia": "This will help you read real Roman numerals: on a plaque, in a book or on the century of a painting.",

    /* Template for the final equals sign of a single-chunk example
       (see formatEquals in app.js): {total} = result. */
    "decompositionEquals": " = {total}",

    /* Carousel: each letter with its role and a usage example.
       Letter mentions inside the caption use the {I}, {V} and
       {X} placeholders; app.js substitutes them with colored
       spans (blue/green/orange) so each part of the explanation
       ("{V} is worth 5", "{I} is worth 1") reads with the
       same color as the letter it refers to, matching the
       big symbol above and the reminder's formula. In IV,
       the {I} that subtracts is also colored red. */
    "carousel": {
      "i": { "label": "I", "caption": "It's the number {i} in Roman numerals." },
      "v": { "label": "V", "caption": "It's the number {v} in Roman numerals." },
      "x": { "label": "X", "caption": "It's the number {x} in Roman numerals." },
      "iv": { "label": "IV", "caption": "It's the number 4 in Roman numerals. {V} is worth {v} and {I} is worth {i}. If {I} comes before, it subtracts: {v} − {i} = {i4}." },
      "ix": { "label": "IX", "caption": "It's the number 9 in Roman numerals. {X} is worth {x} and {I} is worth {i}. If {I} comes before, it subtracts: {x} − {i} = {i9}." },
      "vi": { "label": "VI", "caption": "It's the number 6 in Roman numerals. {V} is worth {v} and {I} is worth {i}. If {I} comes after, it adds: {v} + {i} = {i6}." },
      "xi": { "label": "XI", "caption": "It's the number 11 in Roman numerals. {X} is worth {x} and {I} is worth {i}. If {I} comes after, it adds: {x} + {i} = {i11}." }
    },

    /* Famous Roman numerals for meaningful learning. Each phrase
       ends in ":" — the colored arithmetic formula ("10 plus 10,
       which makes 20") is generated from the Roman numeral in
       app.js (formulaColoreada), with each number in the color of
       the letter that contributes it. */
    "famous": {
      "century19": "The 19th century was the age of the invention of the telephone. {X} is worth {x} and {I} is worth {i}. The {I} sits in front of the last {X}, so I have {x} and subtract {i}: {x}+({x}−{i})={x}+{i9}={i19}.",
      "century20": "The previous century, the one that saw the Moon landing in 1969. {X} is worth {x}, and since both {X}'s sit one after the other, they add:",
      "century21": "The century we live in. {X} is worth {x} and {I} is worth {i}. Since there are two {X}'s and each is worth {x}, they add up to {x}+{x}, and the {I} after them adds {i} more: {x}+{x}+{i}.",
      "clock11": "On many clocks with Roman numerals, 11 o'clock is marked XI. {X} is worth {x} and {I} is worth {i}. Since the {I} sits after the {X}, it adds:",
      "clock12": "On many clocks with Roman numerals, 12 o'clock is marked XII. {X} is worth {x} and {I} is worth {i}. Since both {I}'s sit after the {X}, each one adds {i}:",
      "carlos3": "King of the United Kingdom since 2022. {I} is worth {i} and the three {I}'s sit one after the other, so each one adds {i}:",
      "isabel2": "Queen of the United Kingdom for over 70 years. {I} is worth {i} and the two {I}'s sit one after the other, so each one adds {i}:",
      "felipe6": "King of Spain since 2014. {V} is worth {v} and {I} is worth {i}. Since the {I} sits after the {V}, it adds:",
      "henry8": "King of England. {V} is worth {v} and {I} is worth {i}. The {I} after the {V} adds {i}, and the next two {I}'s each add {i} as well:"
    },
    /* Spoken phrase (TTS) per famous example. What the audio button
       actually says. Lives here because the spoken phrasing differs
       by language even when the visible label doesn't translate:
       "Las XII" reads as "Las doce" in Spanish but in English the
       natural clock phrase is "Twelve o'clock", which already
       carries the number and isn't built by prefix+cardinal. Items
       that don't appear here fall back to the generic
       label-prefix + ordinal/cardinal recipe in app.js (which is
       fine for monarchs — "Carlos III" / "Henry VIII" already
       sound right with the ordinal appended). */
    "famousSpeak": {
      "century19": "Nineteenth century",
      "century20": "Twentieth century",
      "century21": "Twenty-first century",
      "clock11": "Eleven o'clock",
      "clock12": "Twelve o'clock"
    },
    /* Connector that separates the addends of the colored formula,
       in math notation: "10+10+1=21". The numbers are generated
       with their color from app.js; only the inter-addend
       connector lives here. The formula ends with "=N", not
       ", which makes N", also built by app.js. */
    "formulaSep": "+",

    /* Socratic hints by letter, so the hint guides the mechanics
       instead of just repeating the number. */
    "pistaI":  "How many I's do you see? How much is each I worth?",
    "pistaV":  "Is there a V? How much is it worth?",
    "pistaX":  "Is there an X? How much is it worth?",
    "pistaIV": "An I sits BEFORE a V. Does it add or subtract?",
    "pistaIX": "An I sits BEFORE an X. Does it add or subtract?",
    "pistaXI": "An X with an I after it. How much is 10 + 1?",
    "pistaGeneral": "Count letter by letter: which add and which subtract?",

    /* Ordinals for centuries and monarchs (audio). The TTS of the
       question uses these words instead of reading the letters
       (which would say "vee-eye"). 1 = first, 4 = fourth, 8 = eighth,
       etc. */
    "ordinales": {
      "1": "first",    "2": "second",   "3": "third",    "4": "fourth",
      "5": "fifth",    "6": "sixth",    "7": "seventh",  "8": "eighth",
      "9": "ninth",    "10": "tenth",   "11": "eleventh","12": "twelfth",
      "13": "thirteenth",  "14": "fourteenth", "15": "fifteenth",
      "16": "sixteenth",   "17": "seventeenth","18": "eighteenth",
      "19": "nineteenth",  "20": "twentieth",  "21": "twenty-first"
    },
    /* Cardinals 1-21 for the numberToRoman mode: the question shows
       a decimal number (e.g. "19") and the audio says "nineteen",
       not the ordinal. */
    "cardinales": {
      "1": "one",     "2": "two",      "3": "three",    "4": "four",
      "5": "five",    "6": "six",      "7": "seven",    "8": "eight",
      "9": "nine",    "10": "ten",     "11": "eleven",  "12": "twelve",
      "13": "thirteen", "14": "fourteen", "15": "fifteen","16": "sixteen",
      "17": "seventeen", "18": "eighteen", "19": "nineteen",
      "20": "twenty",   "21": "twenty-one"
    },

    /* Per-century and per-monarch context (no audio, shown) */
    "centuryContext": {
      "5":  "In the 5th century, the Western Roman Empire fell.",
      "15": "In the 15th century, Christopher Columbus reached America.",
      "18": "In the 18th century, the Industrial Revolution began.",
      "19": "In the 19th century, Queen Victoria ruled the United Kingdom.",
      "20": "In the 20th century, humans first set foot on the Moon.",
      "21": "The 21st century is the century we live in now. It began in the year 2001."
    },
    "monarchContext": {
      "m1": "Elizabeth I was Queen of England in the 16th century.",
      "m2": "Elizabeth II was Queen of the United Kingdom for over 70 years.",
      "m3": "Richard III was King of England in the 15th century.",
      "m4": "Henry IV was King of England in the 15th century.",
      "m5": "Henry V was King of England. He won the Battle of Agincourt.",
      "m6": "George VI was King of the United Kingdom during the Second World War.",
      "m7": "Edward VII was King of the United Kingdom in the early 20th century.",
      "m8": "Henry VIII was King of England in the 16th century."
    }
  }, 'en');
})();
