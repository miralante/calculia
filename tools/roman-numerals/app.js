/* ============================================================
   Calculia — Roman Numerals (reasoning: read Roman numerals and
   apply them to recognise centuries and real kings/queens).
   Data in data.js (DATA.symbols, DATA.numbers, DATA.monarchs,
   DATA.famousRomans, DATA.levels, DATA.decompose).

   Flow across 4 screens (rule 13, gradual progression):
   1) introScreen — standalone presentation: what Roman numerals
      are and a carousel to explore the 5 basic symbols/combinations
      (I, V, X, IV, VI) by tapping.
   2) famousScreen — real-world famous Roman numerals (century,
      king/queen, clock), always within I/V/X, for meaningful
      learning before moving on to the reminder.
   3) reminderScreen — the reminder: I/V/X table with colours and
      the subtract/add rule with two examples (IV, VI).
   4) levelsScreen — the 5 levels + random round.

   Quiz engine with 3 options where the correct answer is always
   evident: the two distractors are the components of the Roman
   numeral being taught (its unique letter values for
   number-answer modes, or two of its individual Roman letters for
   the numberToRoman mode). For VI the distractors are 5 and 1;
   for XI they are 10 and 1. When the numeral has only one unique
   letter (I, V, X, XX, …) the second slot is filled from the
   remaining letters/values that the activity teaches (1, 5, 10)
   so the round still has 3 distinct options. The base letters
   I, V, X (each one alone) take the full set {1, 5, 10} as
   distractors so the prompt teaches the symbol-to-value mapping
   rather than the components of the numeral. The previous
   format used "0" and "∞" as fixed distractors; the new format
   makes the distractors the actual pieces the answer is built
   from, so the user reads the prompt and recognises the
   components before picking the one that fits.

   Stepped (accumulated) formulas: instead of the one-line
   "10+10+1=21", the coloured formula walks the reader from the
   first chunk to the total one chunk at a time
   ("10+10=20, 20+1=21"), like school arithmetic. The
   DATA.decompose helper builds this chain in data.js; the
   formula on screen (famous screen and quiz) is rendered with
   each chunk in the colour of its letter, so the symbol →
   colour → value association is read together with the
   operation. Subtract pairs (IV/IX) stay atomic — there's
   nothing else to chain them with, and the subtract rule is the
   lesson.

   Levels 3-5 show, when available, a short real-world fact
   (century or reign). The Roman numeral shown is decomposed with
   colours (I→blue, V→green, X→orange, subtract→red) except in
   level 4 (numberToRoman), where the Roman numeral is the answer
   itself and is not previewed.
   Practice with repetition: each item from the practice levels
   (not the test) is presented exactly 2 times per round, in
   mixed order, to settle the mechanic without making the round
   too long. The test (level 'random') mixes the 4 base modes
   without repeating items, evaluating what was learned after
   practice.
   Errors are never punished: the first failure immediately shows
   the help with the coloured decomposition and the total (this
   is the "failure help" the activity applies); a second failure on
   the same item adds the correct answer as text to reinforce it.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'roman-numerals';
  var $ = App.utils.$;

  /* ---------- Screens ---------- */
  var introScreen = $('#introScreen');
  var famousScreen = $('#famousScreen');
  var reminderScreen = $('#reminderScreen');
  var levelsScreen = $('#levelsScreen');
  var quizScreen = $('#quizScreen');
  var endScreen = $('#endScreen');
  var SCREENS = [introScreen, famousScreen, reminderScreen, levelsScreen, quizScreen, endScreen];

  var levelsEl = $('#levels');
  var starsEl = $('#stars');

  /* ---------- Screen 1: introduction (symbol carousel) ---------- */
  var carouselDisplay = $('#carouselDisplay');
  var carouselCaption = $('#carouselCaption');
  var carouselPrev = $('#carouselPrev');
  var carouselNext = $('#carouselNext');
  var introNext = $('#introNext');

  /* ---------- Screen 2: famous Roman numerals ---------- */
  var famousExample = $('#famousExample');
  var famousText = $('#famousText');
  var famousPrev2 = $('#famousPrev2');
  var famousNext2 = $('#famousNext2');
  var famousPrevBtn = $('#famousPrevBtn');
  var famousNextBtn = $('#famousNextBtn');
  var btnListenFamous = $('#btnListenFamous');

  /* ---------- Screen 3: reminder ---------- */
  var reminderBack = $('#reminderBack'); // back to the famous numbers screen
  var symbolsRow = $('#symbolsRow');
  var exampleSubtractRoman = $('#exampleSubtractRoman');
  var exampleSubtractEquals = $('#exampleSubtractEquals');
  /* Second example of the subtract rule (IX = 9), so the rule is
     shown with both bigger letters (V in IV and X in IX), not
     only with one. Wired to the second .rule-example under
     ruleSubtract in index.html. */
  var exampleSubtractRoman2 = $('#exampleSubtractRoman2');
  var exampleSubtractEquals2 = $('#exampleSubtractEquals2');
  var exampleAddRoman = $('#exampleAddRoman');
  var exampleAddEquals = $('#exampleAddEquals');
  /* Second example of the add rule (XI = 11), parallel to the
     second subtract example: the sum side is shown both with V
     (VI = 6) and with X (XI = 11). */
  var exampleAddRoman2 = $('#exampleAddRoman2');
  var exampleAddEquals2 = $('#exampleAddEquals2');
  var referenceNext = $('#referenceNext');

  /* ---------- Screen 4: levels ---------- */
  var levelsBack = $('#levelsBack');

  /* ---------- Game screen ---------- */
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var quizShown = $('#quizShown');
  var btnListenPrompt = $('#btnListenPrompt');
  var contextText = $('#contextText');
  var decompositionEl = $('#decomposition');
  var questionText = $('#questionText');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var nextBtn = $('#nextBtn');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (!progress.completed) progress.completed = {};

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }
  function t(key) { return App.i18n.t(key); }

  function show(screen) {
    resetAudioUI();
    SCREENS.forEach(function (s) { s.classList.toggle('hidden', s !== screen); });
  }

  /* ---------- Screen 1: introduction (symbol carousel) ---------- */

  /* The carousel teaches the 7 symbols/combinations the activity
     actually relies on, in the order a reader naturally meets them:
     standalone I/V/X first, then the sum pairs (VI, XI), then the
     subtract pairs (IV, IX). The "sums first, then the special
     case of subtraction" order is the more intuitive one: once
     adding letters in sequence is settled, the rule "a smaller
     letter before a larger one subtracts" lands as a deliberate
     exception, not as a gotcha hiding in the second example. */
  var CAROUSEL_ORDER = ['i', 'v', 'x', 'vi', 'xi', 'iv', 'ix'];
  var carouselIdx = 0;

  function paintCarousel() {
    var key = CAROUSEL_ORDER[carouselIdx];
    /* The large symbol of the carousel is also painted letter by
       letter with each letter's colour (I→blue, V→green, X→orange;
       the I that subtracts in IV/IX goes in red), just like in the
       reminder and the decomposition. That way the prompt and
       the explanation below share the same colour code. */
    var label = t('carousel.' + key + '.label');
    carouselDisplay.innerHTML = wrapRomanLetters(label);
    /* aria-label must match the visible symbol (with spaces
       between letters because each one is in its own span), so the
       screen reader announces exactly the letter the user sees.
       Without spaces "IV" would become "ive", which is unreadable. */
    carouselDisplay.setAttribute('aria-label', label.split('').join(' '));
    carouselCaption.innerHTML = coloredCaption(key, t('carousel.' + key + '.caption'));
  }

  /* Wraps every Roman letter (I, V, X) in `raw` with its colour
     span and passes every other character through as-is. Used by
     the carousel (where `raw` is just "I"/"V"/"X"/"IV"/"VI") and
     by the famous/quiz prompts (where `raw` can be "Carlos III",
     "Siglo XX", "Henry VIII", etc. — only the I/V/X get coloured,
     the rest of the word passes through unchanged).

     Subtract detection: an `I` is a subtract letter only when it
     sits immediately before a `V` or `X` (the IV/IX rule). The
     previous version of the carousel took a `key` argument for
     this; the position check is equivalent for "IV"/"IX" and
     also works inside longer strings like "XIV" / "XXIV" /
     "XII" (where IV or IX appears mid-string) and "Felipe VI"
     (where the I is at the end and isn't a subtract letter, so
     it stays blue instead of turning red).

     Each letter span is aria-hidden so the screen reader reads
     the parent textContent (the same string we passed in)
     instead of the broken-up per-letter HTML. */
  function wrapRomanLetters(raw) {
    if (!raw) return '';
    return raw.split('').map(function (ch, i, arr) {
      if (ch === 'I' || ch === 'V' || ch === 'X') {
        var subtract = ch === 'I' && i + 1 < arr.length && (arr[i + 1] === 'V' || arr[i + 1] === 'X');
        var cls = 'letra-' + ch.toLowerCase() + (subtract ? ' letra-resta' : '');
        return '<span aria-hidden="true" class="' + cls + '">' + ch + '</span>';
      }
      return ch;
    }).join('');
  }

  /* Colours only the trailing Roman numeral in `label`, leaving
     any earlier letters untouched. This is the right rule for the
     famous-screen label: each entry in DATA.famousRomans ends
     with the Roman numeral it teaches ("Siglo XX", "Carlos III",
     "Felipe VI", "Henry VIII", ...) and any I/V/X that appears
     *before* that suffix is just a letter of the monarch's first
     name or a context word — not a numeral. The previous
     wrapRomanLetters() coloured every I/V/X in the string, so the
     `I` of "Isabel" was painted blue along with the actual "II"
     suffix, which misleads the reader (it implies the `I` of the
     name is part of the Roman numeral being taught).

     Implementation: locate the trailing run of I/V/X characters
     (the longest suffix where every char is one of those three)
     and apply the same letter-by-letter colouring used by
     wrapRomanLetters, but only inside that suffix. Everything
     before it is returned verbatim. If the label has no I/V/X at
     all, the suffix is empty and the function returns the input
     unchanged — same behaviour as before for the "no Roman
     letters" edge case. aria-hidden is set on every coloured
     span so the screen reader still reads the full label as a
     single string ("Carlos tercero") instead of swallowing the
     numeral inside per-letter spans. */
  function wrapTrailingRoman(label) {
    if (!label) return '';
    var suffixStart = label.length;
    while (suffixStart > 0) {
      var ch = label.charAt(suffixStart - 1);
      if (ch === 'I' || ch === 'V' || ch === 'X') {
        suffixStart -= 1;
      } else {
        break;
      }
    }
    if (suffixStart === label.length) return label; /* no I/V/X at all */
    var head = label.slice(0, suffixStart);
    var tail = label.slice(suffixStart);
    var coloredTail = wrapRomanLetters(tail);
    return head + coloredTail;
  }

  /* Replaces the placeholders {I}, {V}, {X} (the letter) and
     {i}, {v}, {x} (its decimal value) inside `raw` with spans in
     each letter's colour, so the explanation prose and the
     arithmetic formula share the same colour code as the
     reminder. Used by:
       - the carousel caption (coloredCaption), where every I
         subtracts in "iv"/"ix" so the I takes the red class;
       - the famous-screen sentence (paintFamousPhrase), where the
         subtract status is read from the actual Roman numeral
         (e.g. "IV" has one subtracting I, "XII" has none) so the
         same I→red rule applies if the numeral happens to contain
         IV/IX — never mixed into a sentence where the I is just
         being mentioned.

     {i4}/{i6}/{i9}/{i11}/{i19} close the operation with the I's
     colour so the final "4"/"6"/"9"/"11"/"19" reads as the
     result of the same letter. The set grew with each new
     example the carousel and the famous screen taught (IV, VI,
     IX, XI and the 19th century). aria-hidden on each span so
     the screen reader announces only the placeholder text (the
     CSS classes are decorative, not semantic). */
  function applyRomanPlaceholders(raw, isSubtract) {
    if (!raw) return '';
    var iClass = 'letra-i' + (isSubtract ? ' letra-resta' : '');
    return raw
      .replace(/\{V\}/g, '<span aria-hidden="true" class="letra-v">V</span>')
      .replace(/\{X\}/g, '<span aria-hidden="true" class="letra-x">X</span>')
      .replace(/\{I\}/g, '<span aria-hidden="true" class="' + iClass + '">I</span>')
      .replace(/\{v\}/g, '<span aria-hidden="true" class="letra-v">5</span>')
      .replace(/\{x\}/g, '<span aria-hidden="true" class="letra-x">10</span>')
      .replace(/\{i\}/g, '<span aria-hidden="true" class="' + iClass + '">1</span>')
      .replace(/\{i4\}/g, '<span aria-hidden="true" class="' + iClass + '">4</span>')
      .replace(/\{i6\}/g, '<span aria-hidden="true" class="' + iClass + '">6</span>')
      .replace(/\{i9\}/g, '<span aria-hidden="true" class="' + iClass + '">9</span>')
      .replace(/\{i11\}/g, '<span aria-hidden="true" class="' + iClass + '">11</span>')
      .replace(/\{i19\}/g, '<span aria-hidden="true" class="' + iClass + '">19</span>');
  }

  /* Paints the carousel caption by replacing the {I}/{V}/{X} /
     {i}/{v}/{x} placeholders in `raw` with spans in each letter's
     colour, like the coloured formula of the reminder
     (coloredFormula) and formatEquals. That way, in the
     explanation of 4, the "5" of "is worth 5" and of the formula
     "5 − 1 = 4" is painted green (V's colour), and the "1" in
     blue (I's colour). In IV, only the I that subtracts is also
     painted red to visually reinforce the rule: the reader sees
     the same I, first blue in the mention ("the {I} is worth 1")
     and then red when it is explained that it goes in front and
     subtracts. The V never carries the "subtract" colour — only
     the letter that subtracts does — so we don't mix V's green
     with red on the same chip. The {i4}/{i6}/{i9}/{i11}/{i19} result also takes
     I's colour so the final "4"/"6" closes the operation with
     the same letter. */
  function coloredCaption(key, raw) {
    var isSubtract = key === 'iv' || key === 'ix';
    return applyRomanPlaceholders(raw, isSubtract);
  }

  /* Paints the famous-screen sentence with the same colour code
     as the carousel and the reminder: every {I}/{V}/{X} letter
     mention and every {i}/{v}/{x} value mention is wrapped in a
     span with the letter's colour, so "X vale 10" reads "X (orange)
     vale 10 (orange)" — keeping the symbol → colour → value
     association in the prose, not only in the arithmetic formula
     at the end. Subtract status (red I in IV/IX) is taken from
     the actual Roman numeral of the current famous item, not
     assumed — the famous set currently has no IV/IX entries, but
     if one is added later the rule is already in place. */
  function paintFamousPhrase(roman, raw) {
    var deco = DATA.decompose(roman);
    var hasSubtract = deco.tokens.some(function (tok) { return tok.sign === '-'; });
    return applyRomanPlaceholders(raw, hasSubtract);
  }

  function carouselStep(delta) {
    carouselIdx = (carouselIdx + delta + CAROUSEL_ORDER.length) % CAROUSEL_ORDER.length;
    paintCarousel();
  }

  /* ---------- Screen 2: famous Roman numerals ---------- */

  function famousFor() {
    var locale = App.i18n.locale();
    return DATA.famousRomans.filter(function (f) { return !f.locale || f.locale === locale; });
  }

  var famousIdx = 0;
  var currentFamous = null;
  function paintFamous() {
    var list = famousFor();
    var item = list[famousIdx % list.length];
    currentFamous = item;
    famousExample.innerHTML = wrapTrailingRoman(item.label || item.roman);
    /* aria-label carries the visible text so the screen reader
       announces "Carlos III" / "Siglo XX" / "Henry VIII" instead
       of swallowing the Roman letters inside aria-hidden spans. */
    famousExample.setAttribute('aria-label', item.label || item.roman);
    /* The i18n sentence ends in ":" and the coloured stepped formula
       is appended after it ("10+10=20, 20+1=21" for XXI,
       "1+1=2, 2+1=3" for III, "10−1=9" for IX). The formula is
       generated by this code from DATA.decompose(item.roman) so
       each digit carries the colour of the letter that
       originates it: 10 with X's colour, 5 with V's colour, 1
       with I's colour (red when it's the I that subtracts in
       IV/IX). The accumulated-step notation shows one chunk at
       a time, so the reader can follow how the total is built
       without seeing the final answer up front. */
    var phrase = t('famous.' + item.factKey);
    var colonIdx = phrase.lastIndexOf(':');
    var introText = colonIdx >= 0 ? phrase.slice(0, colonIdx + 1) : phrase;
    famousText.innerHTML = paintFamousPhrase(item.roman, introText) + ' ' + coloredFormula(item.roman);
    /* Resets the "speaking" state of the audio button when navigating
       between examples: if the user changed items while the
       previous utterance was still playing, the button must not
       remain stuck on aria-pressed. */
    resetAudioUI();
  }

  /* Returns the CSS class that paints the total of a decomposition
     in the colour of the letter that "owns" it: in subtract mode
     (IV/IX) the I that subtracts is what makes the number smaller
     than its big sibling, so the total (4 / 9) goes in red; in
     sum mode the total takes the colour of the first chunk (the
     one that contributes the most), which keeps the symbol → colour
     → value association consistent across the activity. Used by
     coloredFormula (famous screen), formatEquals (reminder) and
     paintQuizDecomposition (quiz) so all three render the total
     with the same colour rule. */
  function totalColorClass(deco) {
    if (deco.mode === 'subtract') return 'letra-i letra-resta';
    return 'letra-' + deco.chunks[0].letters[0].toLowerCase();
  }

  /* Returns the HTML for one chunk's value, in the colour of the
     letter that contributes it. A pair (IV/IX) is already
     resolved into its final value, so the chunk keeps the
     subtract colouring for the I that subtracted. A run of
     identical letters (XX, III) keeps the colour of that
     letter. */
  function coloredChunkValue(chunk) {
    var primaryLetter = chunk.letters[chunk.letters.length - 1];
    var cls = 'letra-' + primaryLetter.toLowerCase() + (chunk.pair ? ' letra-resta' : '');
    return '<span class="' + cls + '">' + chunk.value + '</span>';
  }

  /* Returns the arithmetic formula of the Roman numeral with each
     number in the colour of the letter that contributes it, in
     the "stepped" (accumulated) notation the user asked for.
     Instead of the one-line "10+10+1=21", the formula walks the
     reader from the first chunk to the total one chunk at a
     time, like school arithmetic:
       XX  → "10+10=20"
       XXI → "10+10=20, 20+1=21"
       VI  → "5+1=6"
       VII → "5+1=6, 6+1=7"
       III → "1+1=2, 2+1=3"
       IV  → "5−1=4"
       IX  → "10−1=9"
     Subtract pairs (IV/IX) stay as one atomic step: there's
     nothing else to chain them with, and the subtract rule is
     the lesson. Everything else walks chunks one at a time so
     each new sum builds on the previous partial, which makes
     the progression explicit instead of collapsed. Steps are
     joined by ", " so the formula reads as a chain rather than
     a single expression. The very last "= N" appears once at
     the end of the chain (so the final partial IS the total);
     intermediate steps end in their running partial too. */
  function coloredFormula(roman) {
    var deco = DATA.decompose(roman);
    var totalCls = totalColorClass(deco);
    if (deco.mode === 'subtract') {
      var big = deco.chunks[0].letters[1];
      var small = deco.chunks[0].letters[0];
      return '<span class="letra-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
        '−<span class="letra-' + small.toLowerCase() + ' letra-resta">' + ROMAN_VALUES[small] + '</span>' +
        '=<span aria-hidden="true" class="' + totalCls + '">' + deco.total + '</span>';
    }
    if (deco.chunks.length === 1) {
      /* Single chunk that's a run of identical letters (XX, III,
         VIII → "5+1+1+1"): expand letter-by-letter so the
         formula reads as an accumulated sum like "10+10=20"
         or "1+1=2, 2+1=3" instead of the odd "20=20" / "3=3".
         Single letters (X, V, I) don't reach here because the
         famous screen and the quiz both suppress the formula
         for them (no operation to show). */
      var letters = deco.chunks[0].letters.split('');
      var partial = 0;
      var steps = letters.map(function (letter, idx) {
        var cls = 'letra-' + letter.toLowerCase();
        if (idx === 0) {
          partial = ROMAN_VALUES[letter];
          return '<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        }
        var left = '<span class="deco-partial">' + partial + '</span>+<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        partial += ROMAN_VALUES[letter];
        return left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>';
      });
      return steps.join(', ');
    }
    /* Walk chunks one at a time, accumulating the partial so far.
       The first step is just the first chunk's value: there's no
       running partial yet. Every step after that is
       "<previous partial>+<next chunk>=<new partial>". Steps are
       joined by ", " so the chain reads naturally on one line. */
    var partial = 0;
    var steps = deco.chunks.map(function (chunk, idx) {
      if (idx === 0) {
        partial = chunk.value;
        return coloredChunkValue(chunk);
      }
      var left = '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk);
      partial += chunk.value;
      return left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>';
    });
    return steps.join(', ');
  }

  function famousStep(delta) {
    var list = famousFor();
    famousIdx = (famousIdx + delta + list.length) % list.length;
    paintFamous();
  }

  /* ---------- Audio del prompt (TTS) ----------

/* The default TTS would read "VI" as "uve-ié" or "XX" as separate
     letters. To make the prompt sound natural, we precompute it
     with ordinal tables (centuries, monarchs) and cardinal tables
     (numberToRoman). The romanToNumber mode leaves the Roman
     numeral as-is because there the Roman IS the stimulus to read:
     it makes more sense to listen to it letter by letter than to
     give away the answer. */

  /* Returns the spoken phrase for the current item on the famous
     screen. Just the name/meaning of the example (without the long
     explanation): "Twentieth century", "Felipe sexto",
     "Henry eighth". */
  function speakForFamous() {
    if (!currentFamous) return '';
    var total = DATA.decompose(currentFamous.roman).total;
    /* Spoken phrase lookup:
       1) If the strings file declares `famousSpeak.<factKey>` for
          the active locale, that wins — it's the only way to get a
          natural phrase in each language when the visible label
          is locale-neutral or hard to pronounce ("Las XII" →
          "Las doce" in es, "Twelve o'clock" in en; "Siglo XX" →
          "Siglo veinte" in es, "Twentieth century" in en, where
          English uses ordinal and Spanish uses cardinal).
       2) Otherwise fall back to "label prefix + spoken number"
          where the prefix is whatever sits before the first Roman
          letter in the visible label (so monarchs like "Carlos
          III" → "Carlos tercero" / "Henry VIII" → "Henry eighth"
          keep working without per-item i18n keys). The cardinal
          vs. ordinal decision is taken from DATA.famousRomans[i].speak
          ('cardinal' for centuries and the clock, anything else
          is treated as ordinal — the historical default for
          monarchs). */
    var speakKey = 'famousSpeak.' + currentFamous.factKey;
    var speakPhrase = t(speakKey);
    if (speakPhrase !== speakKey) return speakPhrase;
    var label = currentFamous.label || currentFamous.roman;
    /* Find the Roman-numeral portion by locating the trailing run
       of Roman letters. Using `label.search(/[IVX]/)` alone breaks
       when the name itself starts with "I" (e.g. "Isabel II"),
       because search would return position 0 and the prefix would
       collapse to "". The Roman numeral is always the suffix —
       the visible labels all follow "<name> <roman>" — so we walk
       backwards from the end to find the first non-Roman char and
       take everything after it as the Roman suffix; the prefix is
       everything before. */
    var romanEnd = label.length;
    while (romanEnd > 0 && /[IVX]/.test(label.charAt(romanEnd - 1))) romanEnd--;
    var prefix = romanEnd > 0 ? label.slice(0, romanEnd) : '';
    var number = currentFamous.speak === 'cardinal'
      ? cardinalFor(total)
      : ordinalFor(total);
    return prefix + number;
  }

  /* Returns the spoken phrase for the current quiz item, based on
     the round mode. */
  function speakForQuiz(entry) {
    var mode = entry.mode;
    var item = entry.item;
    if (mode === 'romanToNumber') {
      /* Stimulus to read: the letters as-is. */
      return item.roman;
    }
    if (mode === 'centuryToNumber') {
      /* "Twentieth century" → "Twentieth " + ordinal(item.n) */
      return t('centuryRomanLabel').split('{roman}')[0] + ordinalFor(item.n);
    }
    if (mode === 'numberToRoman') {
      /* The decimal number is shown: read as cardinal, not as ordinal
         (TTS for "nineteen" sounds natural; for "nineteenth" it
         would sound obscure for a number that appears alone on
         screen). */
      return cardinalFor(item.n);
    }
    /* monarchToNumber: monarch name + ordinal ("Felipe sixth",
       "Henry eighth"). The name already comes in the active locale
       (es/en) from DATA.monarchs. */
    return item.name + ' ' + ordinalFor(item.n);
  }

  function ordinalFor(n) {
    var text = t('ordinales.' + n);
    /* t() returns the key itself when missing; in that case we fall
       back to the cardinal so we don't stay silent. */
    if (text === 'ordinales.' + n) return cardinalFor(n);
    return text;
  }

  function cardinalFor(n) {
    var text = t('cardinales.' + n);
    if (text === 'cardinales.' + n) return String(n);
    return text;
  }

  /* Marks/unmarks the button as "speaking" while the TTS plays the
     phrase, and disables the button so several speak() calls
     cannot overlap. The state is removed when it finishes. */
  function speakWithButton(btn, text) {
    if (!text) return;
    if (btn.getAttribute('aria-pressed') === 'true') {
      App.tts.stop();
      btn.removeAttribute('aria-pressed');
      btn.classList.remove('hablando');
      return;
    }
    document.querySelectorAll('.btn-audio.hablando').forEach(function (b) {
      b.removeAttribute('aria-pressed');
      b.classList.remove('hablando');
    });
    App.tts.stop();
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('hablando');
    App.tts.speak(text, function () {
      btn.removeAttribute('aria-pressed');
      btn.classList.remove('hablando');
    });
  }

  /* ---------- Screen 3: reminder ---------- */

  function letraClass(letter) { return 'letra-' + letter.toLowerCase(); }

  /* Paints a Roman numeral letter by letter with colours inside a
     .roman-join (used in the two examples of the reminder) and
     returns its decomposition to fill the "= {total}". */
  function paintRomanJoin(el, roman) {
    el.innerHTML = '';
    var deco = DATA.decompose(roman);
    deco.tokens.forEach(function (tok) {
      var span = document.createElement('span');
      span.className = 'ltr ltr-' + tok.letter + (tok.sign === '-' ? ' letra-resta' : '');
      span.textContent = tok.letter;
      el.appendChild(span);
    });
    return deco;
  }

  function paintSymbols() {
    symbolsRow.innerHTML = '';
    DATA.symbols.forEach(function (s) {
      var pill = document.createElement('div');
      pill.className = 'symbol-pill';
      /* pill-value carries the colour class of the letter (letra-i /
         letra-v / letra-x) so the decimal value (1, 5, 10) reads
         in the same colour as the symbol it belongs to. That way
         the I/V/X table is consistent with the rest of the
         activity. */
      pill.innerHTML =
        '<span aria-hidden="true" class="pill-letter ' + letraClass(s.roman) + '">' + s.roman + '</span>' +
        '<span aria-hidden="true" class="pill-value ' + letraClass(s.roman) + '">' + s.value + '</span>' +
        '<span class="pill-caption">' + t('symbol{' + s.roman + '}') + '</span>';
      symbolsRow.appendChild(pill);
    });
  }

  /* Text of the final equality of an example: a single
     subtract-add pair (e.g. IV) shows its subtraction
     "5 − 1 = 4"; more than one chunk (e.g. VI = V + I) shows
     the full sum "5 + 1 = 6". */
  /* Returns the equality as HTML with each number in the same
     colour as its letter in the roman-join above, so value and
     colour are read together just like the letters themselves. */
  function formatEquals(deco) {
    if (deco.mode === 'subtract') {
      var big = deco.chunks[0].letters[1];
      var small = deco.chunks[0].letters[0];
      /* The total (4 in IV) is originated by the I that subtracts,
         so it goes in red with class letra-resta. */
      return ' = <span aria-hidden="true" class="letra-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
        ' − <span aria-hidden="true" class="letra-' + small.toLowerCase() + ' letra-resta">' + ROMAN_VALUES[small] + '</span>' +
        ' = <span aria-hidden="true" class="letra-' + small.toLowerCase() + ' letra-resta">' + deco.total + '</span>';
    }
    if (deco.chunks.length > 1) {
      var parts = deco.chunks.map(function (chunk) {
        return '<span aria-hidden="true" class="letra-' + chunk.letters[0].toLowerCase() + '">' + chunk.value + '</span>';
      });
      /* The total colour is decided by the first chunk of the sum
         (the one that contributes the most weight): X if it
         starts with X, V if it starts with V. Matches the
         deco-total logic in paintQuizDecomposition. */
      var totalLetter = deco.chunks[0].letters[0];
      return ' = ' + parts.join(' + ') +
        ' = <span aria-hidden="true" class="letra-' + totalLetter.toLowerCase() + '">' + deco.total + '</span>';
    }
    /* A single chunk: the total colour is the colour of that letter
       (X→orange for X=10, V→green for V=5, I→blue for I=1).
       For isolated IV (deco.mode === 'subtract' above) we never
       reach here. */
    var singleLetter = deco.tokens[0].letter;
    return ' = <span aria-hidden="true" class="letra-' + singleLetter.toLowerCase() + '">' + deco.total + '</span>';
  }

  function paintRuleExamples() {
    /* Subtract rule: two examples so it covers both bigger
       letters (V via IV, X via IX). The second example (IX)
       uses the same paintRomanJoin/formatEquals pair as the
       first, so the colour coding of the subtract I (red) is
       identical and the reader sees the rule once with each
       possible "bigger" letter. */
    var subtractDeco = paintRomanJoin(exampleSubtractRoman, 'IV');
    exampleSubtractEquals.innerHTML = formatEquals(subtractDeco);
    var subtractDeco2 = paintRomanJoin(exampleSubtractRoman2, 'IX');
    exampleSubtractEquals2.innerHTML = formatEquals(subtractDeco2);
    /* Add rule: two examples for symmetry (VI with V, XI with X).
       XI is naturally a sum (X + I) — no I-before-X here — so the
       I keeps its blue colour and no subtract highlighting is
       applied. */
    var addDeco = paintRomanJoin(exampleAddRoman, 'VI');
    exampleAddEquals.innerHTML = formatEquals(addDeco);
    var addDeco2 = paintRomanJoin(exampleAddRoman2, 'XI');
    exampleAddEquals2.innerHTML = formatEquals(addDeco2);
  }

  /* ---------- Screen 4: levels ---------- */

  /* Returns true if a group (with sublevels) is complete: every
     one of its sub-levels has at least one progress mark. Used to
     decide whether the group's button is shown as "Done". */
  function groupCompleted(groupId) {
    var group = DATA.levels.filter(function (n) { return n.id === groupId; })[0];
    if (!group || !group.sublevels) return false;
    return group.sublevels.every(function (sn) { return progress.completed[sn.id]; });
  }

  function paintLevels() {
    levelsEl.innerHTML = '';
    DATA.levels.forEach(function (level) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      var done = level.sublevels
        ? (groupCompleted(level.id) ? ' ' + t('done') : '')
        : (progress.completed[level.id] ? ' ' + t('done') : '');
      btn.innerHTML = t(level.id) + done +
        '<span class="level-info">' + t(level.id + 'Info') + '</span>';
      btn.addEventListener('click', function () { startLevel(level); });
      levelsEl.appendChild(btn);
    });
  }

  /* ---------- Quiz round ---------- */
  var currentLevel = null;
  var currentGroup = null;
  var currentSubIdx = 0;
  var currentEntry = null;
  var items = [];
  var idx = 0;
  var correctCount = 0;
  var resolved = false;
  var attempts = 0;

  function romanFor(n) {
    var found = DATA.numbers.filter(function (x) { return x.n === n; })[0];
    return found ? found.roman : '';
  }

  function sourcePool(level) {
    if (level.pool === 'monarchs') {
      return DATA.monarchs[App.i18n.locale()] || DATA.monarchs.es;
    }
    return DATA.numbers.filter(function (x) { return x.n >= level.min && x.n <= level.max; });
  }

  /* Returns the flat list of "base" sub-levels (those that have their
     own mode, not the groups). Used by 'test' (mixed round) and by
     the chained sub-levels within a group.

     Filters out groups (pool === 'group') and "test" levels
     (pool/mode === 'random'): both are wrappers, not base modes.
     From a group takes its sublevels; a standalone level (not
     random) is included as-is. So baseLevels() returns exactly the
     5 practice modes (level1..level5) and the test can sample from
     them at random. */
  function baseLevels() {
    var out = [];
    DATA.levels.forEach(function (n) {
      if (n.pool === 'group') {
        if (n.sublevels) out = out.concat(n.sublevels);
      } else if (n.pool !== 'random' && n.mode !== 'random') {
        out.push(n);
      }
    });
    return out;
  }

  /* Returns the list of { item, mode } entries for a round. The
     'test' level (mixed round) picks for each round position a
     random base level among the 5 modes.
     Practice levels (not test) pick `perRound` unique items and
     repeat them exactly `DATA.repetitions` times, in mixed order,
     so each number is seen 2 times before moving on: enough to
     settle the mechanic without making the round too long. */
  function itemsForLevel(level) {
    if (level.pool === 'random' || level.mode === 'random') {
      var modes = baseLevels();
      var out = [];
      for (var i = 0; i < DATA.perRound; i++) {
        var baseLevel = modes[Math.floor(Math.random() * modes.length)];
        var basePool = sourcePool(baseLevel);
        out.push({ item: App.utils.shuffle(basePool)[0], mode: baseLevel.mode });
      }
      return out;
    }
    var pool = sourcePool(level);
    var reps = DATA.repetitions || 1;
    var picked = App.utils.shuffle(pool).slice(0, DATA.perRound).map(function (item) {
      return { item: item, mode: level.mode };
    });
    var repeated = [];
    for (var r = 0; r < reps; r++) {
      repeated = repeated.concat(picked);
    }
    return App.utils.shuffle(repeated);
  }

  /* Starts a round. If 'level' is a group (pool 'group'), starts
     with its first sub-level and stores currentGroup + currentSubIdx
     so the next sub-levels are chained automatically when each round
     ends (see finish()). */
  function startLevel(level) {
    if (level.pool === 'group') {
      currentGroup = level;
      currentSubIdx = 0;
      startLevel(level.sublevels[0]);
      return;
    }
    currentGroup = null;
    currentSubIdx = 0;
    currentLevel = level;
    items = itemsForLevel(level);
    idx = 0;
    correctCount = 0;
    show(quizScreen);
    render();
  }

  /* Clears the visual state of any "speaking" audio button and
     cancels the in-progress TTS. Used when changing round/screen
     so a button that was playing doesn't remain "stuck" in the
     pressed state after moving to another screen without its
     onend having been called. */
  function resetAudioUI() {
    App.tts.stop();
    document.querySelectorAll('.btn-audio.hablando').forEach(function (b) {
      b.removeAttribute('aria-pressed');
      b.classList.remove('hablando');
    });
  }

  function paintProgress() {
    var total = items.length;
    progressFill.style.width = ((idx / total) * 100) + '%';
    progressText.textContent = idx + ' / ' + total;
  }

  /* Looks up a real-life support sentence (century fact or monarch
     reign) via i18n. t() falls back to returning the key itself when
     missing (see i18n.js), so that's the signal a given item has no
     real-life sentence attached. */
  function realContext(key) {
    var text = t(key);
    return text !== key ? text : '';
  }

  /* Builds the 2 distractor options for a round from the components
     of the Roman numeral being taught.

     For number-answer modes (romanToNumber, centuryToNumber,
     monarchToNumber): the distractors are the decimal values of the
     unique letters that compose the Roman numeral. For VI that's
     {5, 1}; for XI it's {10, 1}; for IV it's {1, 5} (the same I
     and V — the subtraction rule is what makes IV special, but the
     two letters it uses are still 1 and 5). When the numeral has
     only one unique letter (I, V, X, XX, …) and that letter's value
     would equal the correct answer, both distractors are drawn from
     the {1, 5, 10} set the activity teaches, never repeating the
     answer, so the round still has 3 distinct options.

     For numberToRoman (Roman-answer mode): the distractors are two
     individual Roman letters drawn from the unique letters in the
     answer numeral. For XI → {X, I}; for VI → {V, I}. When the
     answer has only one unique letter (I, V, X, XX, …) and the
     answer itself is a single letter, the second slot is filled
     with another valid letter from {I, V, X} that isn't the answer
     itself.

     The previous variant used "0" and "∞" as fixed distractors on
     the rationale that "Roman numerals have no symbol for zero or
     infinity, so the correct answer is the only one with a real
     symbol". The new variant teaches the mechanic instead: the two
     distractors are the actual pieces the answer is built from, so
     the user reads the prompt and recognises the letters (or
     values) that compose it before picking the one that fits.

     The return is a 2-element array of { value, kind } objects
     with kind 'no' or 'inf' kept as generic "distractor" tags
     (the CSS no longer differentiates them — see styles.css). */
  function buildDistractors(roman, isRomanAnswer, correctValue) {
    var uniqueLetters = [];
    String(roman).toUpperCase().split('').forEach(function (ch) {
      if (/[IVX]/.test(ch) && uniqueLetters.indexOf(ch) === -1) uniqueLetters.push(ch);
    });
    if (isRomanAnswer) {
      /* Pick 2 distinct letters from the unique set, never the
         answer itself (so for answer "I" we skip I and pick V and X;
         for answer "XI" we keep X and I). When the unique set has
         only 1 letter, fill from {I, V, X} excluding the answer. */
      var pool = uniqueLetters.filter(function (ch) { return ch !== correctValue; });
      if (pool.length < 2) {
        ['V', 'X', 'I'].forEach(function (ch) {
          if (pool.length < 2 && ch !== correctValue && pool.indexOf(ch) === -1) pool.push(ch);
        });
      }
      return [
        { value: pool[0], kind: 'no' },
        { value: pool[1], kind: 'inf' }
      ];
    }
    /* Number-answer mode: distractors are the decimal values of the
       unique letters, excluding the correct answer. */
    var poolValues = uniqueLetters.map(function (ch) { return ROMAN_VALUES[ch]; })
      .filter(function (v) { return v !== correctValue; });
    if (poolValues.length < 2) {
      /* Either the numeral has only one unique letter (I, V, X,
         XX …) and its value equals the answer, or the answer
         happens to match one of the unique values. Fill from the
         remaining {1, 5, 10} values, excluding the answer. */
      [1, 5, 10].forEach(function (v) {
        if (poolValues.length < 2 && v !== correctValue && poolValues.indexOf(v) === -1) poolValues.push(v);
      });
    }
    return [
      { value: poolValues[0], kind: 'no' },
      { value: poolValues[1], kind: 'inf' }
    ];
  }

  /* Builds what's shown, the question, the 3 options (correct value
     plus 2 component-based distractors, see buildDistractors) and
     the real-life support sentence, based on the level's mode.
     hintRoman feeds the first-attempt Socratic hint; decoRoman is
     what's shown proactively in #decomposition (chips only — the
     total stays hidden until the round resolves, see
     paintQuizDecomposition) — blank for numberToRoman, since there
     the roman numeral IS the hidden answer and showing it upfront
     would give the round away. */
  function buildRound(entry) {
    var mode = entry.mode;
    var item = entry.item;
    var shown, question, correctValue, context = '';
    var hintRoman = item.roman || romanFor(item.n);
    var decoRoman = hintRoman;
    var isRomanAnswer = false;
    if (mode === 'romanToNumber') {
      shown = item.roman;
      question = t('whichNumber');
      correctValue = item.n;
    } else if (mode === 'centuryToNumber') {
      /* Centuries are written in Roman numerals in real life (20th
         century) — the reverse, a century labelled with its
         decimal number (Century 20), isn't real usage, so this
         mode never shows the decimal number for a century (see
         numberToRoman below, which practices decimal → Roman
         without the century framing instead). */
      shown = t('centuryRomanLabel').replace('{roman}', item.roman);
      question = t('whichCenturyNumber');
      correctValue = item.n;
      context = realContext('centuryContext.' + item.n);
    } else if (mode === 'numberToRoman') {
      shown = String(item.n);
      question = t('whichRoman');
      correctValue = item.roman;
      decoRoman = '';
      isRomanAnswer = true;
    } else {
      shown = item.name;
      question = t('whichMonarchNumber');
      correctValue = item.n;
      context = realContext('monarchContext.' + item.id);
    }
    /* The numeral whose components drive the distractors is the
       Roman string associated with the round: for number-answer
       modes that's the prompt itself (item.roman); for
       numberToRoman it's the answer itself (correctValue). */
    var romanForDistractors = isRomanAnswer ? correctValue : (item.roman || romanFor(item.n));
    var distractors = buildDistractors(romanForDistractors, isRomanAnswer, correctValue);
    var options = App.utils.shuffle([
      { value: correctValue, kind: 'correct' }
    ].concat(distractors));
    return {
      shown: shown, question: question, correctValue: correctValue,
      options: options, context: context,
      hintRoman: hintRoman, decoRoman: decoRoman
    };
  }

  /* From the decomposition into chunks, builds the list of "pieces"
     painted in the letters row (#decomposition):
     - a run of the same letter alone (e.g. "XX", "III") is expanded
       letter by letter ("X" + "X"), because there is no other
       different letter to group it with — without expanding, a
       single "XX"/20 chip would not show any operation.
     - a subtract-add pair alone (e.g. "IV" alone) stays as a single
       chip with both letters inside (the smaller in red): there
       is nothing else to combine it with.
     - inside a mixed number (e.g. "XIV"): a run is painted as a
       single chip (e.g. "III" in "VIII"), but a subtract-add pair
       IS split into its two letters with its own sign (e.g.
       "X" − "I" + "V"), because fusing it would hide the
       subtraction behind a misleading "+" between chunks.
     Each piece is { letters, value, sign } where sign is '-' only
     for the letter that subtracts from an already split pair. */
  function decompositionPieces(deco) {
    var pieces = [];
    deco.chunks.forEach(function (chunk) {
      if (chunk.pair && deco.chunks.length > 1) {
        pieces.push({ letters: chunk.letters[0], value: ROMAN_VALUES[chunk.letters[0]], sign: '-' });
        pieces.push({ letters: chunk.letters[1], value: ROMAN_VALUES[chunk.letters[1]], sign: '+' });
      } else if (!chunk.pair && deco.chunks.length === 1 && chunk.letters.length > 1) {
        chunk.letters.split('').forEach(function (letter) {
          pieces.push({ letters: letter, value: ROMAN_VALUES[letter], sign: '+' });
        });
      } else {
        pieces.push({ letters: chunk.letters, value: chunk.value, sign: '+', pair: chunk.pair });
      }
    });
    return pieces;
  }

  /* HTML of the final formula inside the quiz (#decomposition).
     Subtract pairs (IV, IX) are atomic ("5 − 1" / "10 − 1")
     because there's nothing else to combine them with, and the
     subtract rule is the lesson. Everything else walks chunks
     one at a time so each new sum builds on the previous
     partial: "III" → "1+1=2, 2+1=3", "XXI" → "10+10=20, 20+1=21",
     "VI" → "5+1=6". The numerals keep their colour association
     (I→blue, V→green, X→orange, subtract→red) — same colour
     code as the famous screen and the reminder, so the formula
     reads the same way regardless of where it appears. The
     helper shares its core logic with coloredFormula so the
     two screens never drift apart. */
  function decompositionFormula(deco) {
    if (deco.mode === 'subtract') {
      var big = deco.chunks[0].letters[1];
      var small = deco.chunks[0].letters[0];
      var totalCls = totalColorClass(deco);
      return '<span class="letra-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
        '−<span class="letra-' + small.toLowerCase() + ' letra-resta">' + ROMAN_VALUES[small] + '</span>' +
        '=<span aria-hidden="true" class="' + totalCls + '">' + deco.total + '</span>';
    }
    var totalCls = totalColorClass(deco);
    if (deco.chunks.length === 1) {
      /* Single chunk that's a run of identical letters (XX, III,
         VIII → "5+1+1+1"): expand letter-by-letter and walk the
         running partial so the result reads as an accumulated
         sum like "10+10=20" or "1+1=2, 2+1=3", instead of the
         odd "20=20" / "3=3" you'd get by emitting the chunk's
         pre-summed value as both sides of "=". Single letters
         (X, V, I) don't reach here because they have no
         operation to show. */
      var letters = deco.chunks[0].letters.split('');
      var partial = 0;
      var steps = letters.map(function (letter, idx) {
        var cls = 'letra-' + letter.toLowerCase();
        if (idx === 0) {
          partial = ROMAN_VALUES[letter];
          return '<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        }
        var left = '<span class="deco-partial">' + partial + '</span>+<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        partial += ROMAN_VALUES[letter];
        return left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>';
      });
      return steps.join(', ');
    }
    var partial = 0;
    var steps = deco.chunks.map(function (chunk, idx) {
      if (idx === 0) {
        partial = chunk.value;
        return coloredChunkValue(chunk);
      }
      var left = '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk);
      partial += chunk.value;
      return left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>';
    });
    return steps.join(', ');
  }

  /* Paints the mechanic of the number in #decomposition:
     1) always, one piece per letter or per merged chunk (see
        decompositionPieces), coloured to associate symbol → colour
        → value.
     2) revealTotal=true also paints the formula with the total.
        Before answering revealTotal is false on purpose: teaching
        how each letter is read (the "operation") must not include
        doing the math for the user — the total is only revealed
        when the round resolves (see showExplanation / answer). A
        single-letter Roman numeral (e.g. "X") never carries a
        formula either: there is no operation to show.
     Empty roman hides the panel (numberToRoman level: the Roman
     numeral is the answer and is not previewed). */
  function paintQuizDecomposition(roman, revealTotal) {
    decompositionEl.innerHTML = '';
    if (!roman) {
      decompositionEl.classList.add('hidden');
      return;
    }
    decompositionEl.classList.remove('hidden');
    var deco = DATA.decompose(roman);
    var pieces = decompositionPieces(deco);

    var tokenRow = document.createElement('div');
    tokenRow.className = 'deco-row';
    pieces.forEach(function (piece, i) {
      if (i > 0) {
        var op = document.createElement('span');
        op.className = 'deco-op';
        op.textContent = piece.sign === '-' ? '−' : '+';
        tokenRow.appendChild(op);
      }
      var subtractChip = !piece.pair && piece.sign === '-';
      var lettersHtml = piece.letters.split('').map(function (letter, li) {
        var subtractLetter = piece.pair ? li === 0 : subtractChip;
        return '<span class="letra-' + letter.toLowerCase() + (subtractLetter ? ' letra-resta' : '') + '">' + letter + '</span>';
      }).join('');
      var uniform = piece.letters.split('').every(function (ch) { return ch === piece.letters[0]; });
      var chip = document.createElement('span');
      chip.className = 'deco-token' + (subtractChip ? ' letra-resta' : (piece.pair ? '' : (uniform ? ' letra-' + piece.letters[0].toLowerCase() : '')));
      chip.innerHTML = '<span class="deco-letters">' + lettersHtml + '</span><span class="deco-token-value">' + piece.value + '</span>';
      tokenRow.appendChild(chip);
    });
    decompositionEl.appendChild(tokenRow);

    var hasOperation = deco.tokens.length > 1;
    if (hasOperation && revealTotal) {
      var formulaRow = document.createElement('div');
      formulaRow.className = 'deco-row deco-formula';
      /* decompositionFormula returns the stepped chain with its
         last step already ending in "=<total>"; nothing extra
         to append. The same colour code as the famous screen
         and the reminder applies. */
      formulaRow.innerHTML =
        '<span class="deco-formula-text">' + decompositionFormula(deco) + '</span>';
      decompositionEl.appendChild(formulaRow);
    }
  }

  /* Socratic hint letter by letter: prioritises the subtract pairs
     (IV, IX) over the standalone letters. IX wins over the simple
     X hint because in XIX the subtract pair (I in front of an X) is
     the trickier mechanic and worth surfacing first; XI bypasses
     the X check on purpose — its whole point is that an X can be
     read together with a following I as a plain sum, which the
     general X hint ("how much is an X worth?") wouldn't make
     obvious. */
  function pickHint(roman) {
    if (!roman) return t('pistaGeneral');
    if (roman.indexOf('IX') !== -1) return t('pistaIX');
    if (roman.indexOf('IV') !== -1) return t('pistaIV');
    if (roman.indexOf('XI') !== -1) return t('pistaXI');
    if (roman.indexOf('X') !== -1) return t('pistaX');
    if (roman.indexOf('V') !== -1) return t('pistaV');
    if (roman.indexOf('I') !== -1) return t('pistaI');
    return t('pistaGeneral');
  }

  function render() {
    var entry = items[idx];
    currentEntry = entry;
    resolved = false;
    attempts = 0;
    /* Resets the "speaking" state of the quiz audio button: if the
       user resolved the previous round while the prompt utterance
       was still playing, its onend was never called and the button
       would have remained stuck. Every new round must start with
       the button in a neutral state. */
    resetAudioUI();
    var round = buildRound(entry);
    quizShown.innerHTML = wrapTrailingRoman(round.shown);
    /* aria-label carries the visible text so the screen reader
       announces the Roman letters that aria-hidden spans would
       otherwise swallow (e.g. "Carlos III" reads as three letters
       separated by the natural space, not as "Carlos "). */
    quizShown.setAttribute('aria-label', round.shown);
    contextText.textContent = round.context;
    contextText.classList.toggle('hidden', !round.context);
    paintQuizDecomposition(round.decoRoman, false);
    questionText.textContent = round.question;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    nextBtn.classList.add('hidden');
    optionsEl.innerHTML = '';
    /* Audio is OFF in numberToRoman mode: the visible prompt is
       a decimal number ("9") and the audio would just read it
       back to the user, giving the round away (the answer is
       the Roman numeral IX, not the spoken number). In every
       other mode the prompt is the Roman numeral itself
       (romanToNumber) or a meaningful phrase (centuryToNumber,
       monarchToNumber), so reading it aloud helps without
       spoiling the answer. */
    btnListenPrompt.classList.toggle('hidden', entry.mode === 'numberToRoman');

    round.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (opt.kind !== 'correct' ? ' distractor-' + opt.kind : '');
      btn.textContent = opt.value;
      btn.addEventListener('click', function () { answer(btn, opt.kind === 'correct', round); });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(round) {
    var roman = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
    if (roman) paintQuizDecomposition(roman, true);
    explanationEl.textContent = t('correctExplanation');
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, round) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(round);
      resolved = true;
      btn.classList.add('correcta');
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      correctCount += 1;
      save();
      paintStars();
      nextBtn.classList.remove('hidden');
      nextBtn.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        /* Failure help: on the first failed attempt the Socratic hint
           and the coloured decomposition with the total are
           immediately shown, so the user can see how the number
           is read. Showing the total does not "give away" the
           next round (the round is already failed and only the
           "Got it" button is unlocked), but it does teach the
           mechanic — which is exactly what the user asks for when
           they ask for failure help. */
        explanationEl.textContent = t('hintHint') + pickHint(round.hintRoman);
        var romanHint = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
        if (romanHint) paintQuizDecomposition(romanHint, true);
        explanationWrap.classList.remove('hidden');
      } else {
        explanationEl.textContent = t('wrongExplanationPrefix') + round.correctValue;
        var roman = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
        if (roman) paintQuizDecomposition(roman, true);
        explanationWrap.classList.remove('hidden');
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    resetAudioUI();
    idx += 1;
    if (idx >= items.length) {
      finish();
    } else {
      render();
    }
  }

  function finish() {
    progress.completed[currentLevel.id] = (progress.completed[currentLevel.id] || 0) + 1;
    save();
    /* If the round was part of a chained group, jump to the next
       sub-level automatically (without going back to the menu)
       while sub-levels remain. When the group is exhausted, the
       group's end screen is shown. */
    if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
      currentSubIdx += 1;
      startLevel(currentGroup.sublevels[currentSubIdx]);
      return;
    }
    show(endScreen);
    $('#finalSummary').textContent = t('finalSummary')
      .replace('{n}', correctCount).replace('{total}', progress.stars);
    $('#transfer').textContent = t('transferencia');
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* ---------- Eventos ---------- */

  carouselDisplay.addEventListener('click', function () { carouselStep(1); });
  carouselDisplay.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carouselStep(1);
    }
  });
  carouselPrev.addEventListener('click', function () { carouselStep(-1); });
  carouselNext.addEventListener('click', function () { carouselStep(1); });
  famousPrev2.addEventListener('click', function () { famousStep(-1); });
  famousNext2.addEventListener('click', function () { famousStep(1); });
  btnListenFamous.addEventListener('click', function () {
    speakWithButton(btnListenFamous, speakForFamous());
  });
  introNext.addEventListener('click', function () { show(famousScreen); });

  famousPrevBtn.addEventListener('click', function () { show(introScreen); });
  famousNextBtn.addEventListener('click', function () { show(reminderScreen); });

  reminderBack.addEventListener('click', function () { show(famousScreen); });
  referenceNext.addEventListener('click', function () {
    paintLevels();
    show(levelsScreen);
  });

  levelsBack.addEventListener('click', function () { show(reminderScreen); });

  $('#backLevelsBtn').addEventListener('click', function () {
    paintLevels();
    show(levelsScreen);
  });
  nextBtn.addEventListener('click', next);
  btnListenPrompt.addEventListener('click', function () {
    speakWithButton(btnListenPrompt, speakForQuiz(currentEntry));
  });
  $('#replayBtn').addEventListener('click', function () { startLevel(currentLevel); });
  $('#otherLevelBtn').addEventListener('click', function () {
    paintLevels();
    show(levelsScreen);
  });

  function init() {
    App.i18n.apply();
    paintStars();
    paintCarousel();
    paintFamous();
    paintSymbols();
    paintRuleExamples();
    paintLevels();
    show(introScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
