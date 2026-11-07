/* ============================================================
   Calculia — Roman numerals: the three screens before the quiz.
   Screen 1 is the symbol carousel, screen 2 the famous Roman numerals
   (with their listen button) and screen 3 the reminder: the I/V/X table
   and the subtract and add examples. This file owns their elements and
   their buttons. The page gives it what it needs in the host object and
   gets back the paint, bind and speech helpers.
   ============================================================ */
(function () {
  'use strict';

  var M = App.romanNumeralsModel;
  var t = M.t, CAROUSEL_ORDER = M.CAROUSEL_ORDER, wrapRomanLetters = M.wrapRomanLetters, wrapTrailingRoman = M.wrapTrailingRoman;
  var coloredCaption = M.coloredCaption, paintFamousPhrase = M.paintFamousPhrase, famousFor = M.famousFor, totalColorClass = M.totalColorClass;
  var letterClass = M.letterClass, cardinalFor = M.cardinalFor, ordinalFor = M.ordinalFor;
  var $ = App.utils.$;

  /* host: { show(screen), resetAudioUI(), screens: { famous, reminder } }
     Returns { paint(), bind(), speakWithButton(btn, text), coloredChunkValue(chunk) }. */
  App.romanNumeralsScreens = function (host) {
    var show = host.show;
    var resetAudioUI = host.resetAudioUI;
    var famousScreen = host.screens.famous;
    var reminderScreen = host.screens.reminder;

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
    var famousNextBtn = $('#famousNextBtn');
    var btnListenFamous = $('#btnListenFamous');

    /* ---------- Screen 3: reminder ---------- */
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
    /* ---------- Screen 1: introduction (symbol carousel) ---------- */

    /* The carousel teaches the 7 symbols/combinations the activity
       actually relies on, in the order a reader naturally meets them:
       standalone I/V/X first, then the sum pairs (VI, XI), then the
       subtract pairs (IV, IX). The "sums first, then the special
       case of subtraction" order is the more intuitive one: once
       adding letters in sequence is settled, the rule "a smaller
       letter before a larger one subtracts" lands as a deliberate
       exception, not as a gotcha hiding in the second example. */
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
    function carouselStep(delta) {
      carouselIdx = (carouselIdx + delta + CAROUSEL_ORDER.length) % CAROUSEL_ORDER.length;
      paintCarousel();
    }

    /* ---------- Screen 2: famous Roman numerals ---------- */

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
    /* Returns the HTML for one chunk's value, in the colour of the
       letter that contributes it. A pair (IV/IX) is already
       resolved into its final value, so the chunk keeps the
       subtract colouring for the I that subtracted. A run of
       identical letters (XX, III) keeps the colour of that
       letter. */
    function coloredChunkValue(chunk) {
      var primaryLetter = chunk.letters[chunk.letters.length - 1];
      var cls = 'letter-' + primaryLetter.toLowerCase() + (chunk.pair ? ' letter-subtract' : '');
      return '<span class="' + cls + '">' + chunk.value + '</span>';
    }

    /* Returns the arithmetic formula of the Roman numeral with each
       number in the colour of the letter that contributes it, in
       the "stepped" (accumulated) notation the user asked for.
       Instead of the one-line "10+10+1=21", the formula walks the
       reader from the first chunk to the total one chunk at a
       time, like school arithmetic:
         XX   → "10+10=20"
         XXI  → "10+10=20, 20+1=21"
         VI   → "5+1=6"
         VII  → "5+1=6, 6+1=7"
         III  → "1+1=2, 2+1=3"
         IV   → "5−1=4"
         IX   → "10−1=9"
         XIV  → "5−1=4, 10+4=14"      (subtract pair, then add)
         XIX  → "10−1=9, 10+9=19"     (subtract pair, then add)
         XXIV → "5−1=4, 10+10=20, 20+4=24"  (three chunks, pair in the middle)
       Subtract pairs (IV/IX) are always rendered as their own
       atomic step ("big−small=value") so the subtract rule is the
       lesson — never collapsed into "value" alone, because that
       would skip the operation that justifies the pair's spelling.
       When the numeral mixes a subtract pair with other chunks
       (XIV, XIX, XXIV…) the pair's step appears first and the
       running partial afterwards carries that value into the next
       sum. Everything else walks chunks one at a time so each new
       sum builds on the previous partial, which makes the
       progression explicit instead of collapsed. Steps are joined
       by ", " so the formula reads as a chain rather than a single
       expression. */
    function coloredFormula(roman) {
      var deco = DATA.decompose(roman);
      var totalCls = totalColorClass(deco);
      /* Single-chunk subtract (IV, IX) — the subtract rule's
         textbook example. The pair is the entire numeral so its
         resolution IS the total. */
      if (deco.mode === 'subtract') {
        var big = deco.chunks[0].letters[1];
        var small = deco.chunks[0].letters[0];
        return '<span class="letter-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
          '−<span class="letter-' + small.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[small] + '</span>' +
          '=<span aria-hidden="true" class="' + totalCls + '">' + deco.total + '</span>';
      }
      if (deco.chunks.length === 1) {
        /* Single chunk that's a run of identical letters (XX, III,
           VIII → "5+1+1+1"): render every letter with its own
           "+" and "=" chained, so the formula reads as an
           accumulated walk rather than the odd "20=20" / "3=3"
           you'd get by emitting the chunk's pre-summed value as
           both sides of "=". Steps are joined by ", " so each
           finished sum sits on its own in the chain
           ("1+1=2, 2+1=3", "10+10=20"). Single letters (X, V, I)
           don't reach here because they have no operation to
           show. */
        var letters = deco.chunks[0].letters.split('');
        var partial = 0;
        var steps = letters.map(function (letter, idx) {
          var cls = 'letter-' + letter.toLowerCase();
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
         The first step is the first chunk's value (suspended — see
         post-processing below).

         Subtract pairs (chunk.pair === true) are rendered as a
         standalone "<big>−<small>=<value>" step BEFORE their sum
         step, so the formula never hides the subtraction that
         explains why the pair is spelled IV/IX rather than IIII/
         VIIII/etc. Example for XIV (chunks [X(10), IV(4 pair)]):
           step 0:  "<10>"               ← suspended (first operand alone)
           pair step: "5−1=4"             ← resolves the IV pair
           sum step: "<10>+<4>=<14>"     ← adds the resolved pair
         Discarding the suspended step and joining the rest with
         ", " gives "5−1=4, 10+4=14". The pair's resolved value
         (4) is reused as the second addend so the chain still
         traces the running total. */
      var steps = [];
      var partial = 0;
      for (var idx = 0; idx < deco.chunks.length; idx++) {
        var chunk = deco.chunks[idx];
        if (chunk.pair) {
          /* Standalone subtract step: "<big>−<small>=<value>". The
             pair's components get their own colours (big in its
             letter colour, small in red). */
          var bigL = chunk.letters[1];
          var smallL = chunk.letters[0];
          steps.push(
            '<span class="letter-' + bigL.toLowerCase() + '">' + ROMAN_VALUES[bigL] + '</span>' +
            '−<span class="letter-' + smallL.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[smallL] + '</span>' +
            '=<span aria-hidden="true" class="letter-' + smallL.toLowerCase() + ' letter-subtract">' + chunk.value + '</span>'
          );
          /* Sum step that carries the pair's resolved value into
             the running partial. */
          if (partial > 0) {
            steps.push(
              '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk) +
              '=<span aria-hidden="true" class="' + totalCls + '">' + (partial + chunk.value) + '</span>'
            );
          }
          partial += chunk.value;
        } else if (idx === 0) {
          /* First chunk, not a pair: leave it suspended. The next
             step (or the discard-if-last pass below) drops it so
             the chain doesn't read "<first operand>, <first
             operand>+...". */
          steps.push(coloredChunkValue(chunk));
          partial = chunk.value;
        } else {
          /* Subsequent regular chunk: "<prev partial>+<this
             chunk>=<new partial>". */
          var left = '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk);
          partial += chunk.value;
          steps.push(left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>');
        }
      }
      /* If the last chunk was a pair with no sum following it
         (e.g. XIX with chunks [X(10), IX(9)]: the pair renders
         "10−1=9" and the sum step adds it onto 10), the sum step
         above was already added before the partial bump. If it
         wasn't (e.g. pure pair as the only chunk) we already
         handled it in the deco.mode === 'subtract' branch above.
         If the very first step is the suspended first operand and
         the whole formula only has that one step (a 2-chunk numeral
         where neither chunk is a pair), drop it so the chain reads
         "5+1=6" instead of "5, 5+1=6". */
      var hasSuspendedFirst = deco.chunks[0] && !deco.chunks[0].pair;
      if (hasSuspendedFirst) {
        steps.shift();
      }
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
    /* Marks/unmarks the button as "speaking" while the TTS plays the
       phrase, and disables the button so several speak() calls
       cannot overlap. The state is removed when it finishes. */
    function speakWithButton(btn, text) {
      if (!text) return;
      if (btn.getAttribute('aria-pressed') === 'true') {
        btn.removeAttribute('aria-pressed');
        btn.classList.remove('hablando');
        return;
      }
      document.querySelectorAll('.btn-audio.hablando').forEach(function (b) {
        b.removeAttribute('aria-pressed');
        b.classList.remove('hablando');
      });
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('hablando');
      if (false && App.tts && App.tts.speak) App.tts.speak(text, function () {
        btn.removeAttribute('aria-pressed');
        btn.classList.remove('hablando');
      });
    }

    /* ---------- Screen 3: reminder ---------- */

    /* Paints a Roman numeral letter by letter with colours inside a
       .roman-join (used in the two examples of the reminder) and
       returns its decomposition to fill the "= {total}". */
    function paintRomanJoin(el, roman) {
      el.innerHTML = '';
      var deco = DATA.decompose(roman);
      deco.tokens.forEach(function (tok) {
        var span = document.createElement('span');
        span.className = 'ltr ltr-' + tok.letter + (tok.sign === '-' ? ' letter-subtract' : '');
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
        /* pill-value carries the colour class of the letter (letter-i /
           letter-v / letter-x) so the decimal value (1, 5, 10) reads
           in the same colour as the symbol it belongs to. That way
           the I/V/X table is consistent with the rest of the
           activity. */
        pill.innerHTML =
          '<span aria-hidden="true" class="pill-letter ' + letterClass(s.roman) + '">' + s.roman + '</span>' +
          '<span aria-hidden="true" class="pill-value ' + letterClass(s.roman) + '">' + s.value + '</span>' +
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
           so it goes in red with class letter-subtract. */
        return ' = <span aria-hidden="true" class="letter-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
          ' − <span aria-hidden="true" class="letter-' + small.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[small] + '</span>' +
          ' = <span aria-hidden="true" class="letter-' + small.toLowerCase() + ' letter-subtract">' + deco.total + '</span>';
      }
      if (deco.chunks.length > 1) {
        var parts = deco.chunks.map(function (chunk) {
          return '<span aria-hidden="true" class="letter-' + chunk.letters[0].toLowerCase() + '">' + chunk.value + '</span>';
        });
        /* The total colour is decided by the first chunk of the sum
           (the one that contributes the most weight): X if it
           starts with X, V if it starts with V. Matches the
           deco-total logic in paintQuizDecomposition. */
        var totalLetter = deco.chunks[0].letters[0];
        return ' = ' + parts.join(' + ') +
          ' = <span aria-hidden="true" class="letter-' + totalLetter.toLowerCase() + '">' + deco.total + '</span>';
      }
      /* A single chunk: the total colour is the colour of that letter
         (X→orange for X=10, V→green for V=5, I→blue for I=1).
         For isolated IV (deco.mode === 'subtract' above) we never
         reach here. */
      var singleLetter = deco.tokens[0].letter;
      return ' = <span aria-hidden="true" class="letter-' + singleLetter.toLowerCase() + '">' + deco.total + '</span>';
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

    /* Wires the buttons of screens 1-3. */
    function bind() {
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
      if (btnListenFamous) {
        btnListenFamous.addEventListener('click', function () {
          speakWithButton(btnListenFamous, speakForFamous());
        });
      }
      introNext.addEventListener('click', function () { show(famousScreen); });

      famousNextBtn.addEventListener('click', function () { show(reminderScreen); });
    }

    return {
      paint: function () { paintCarousel(); paintFamous(); paintSymbols(); paintRuleExamples(); },
      bind: bind,
      speakWithButton: speakWithButton,
      coloredChunkValue: coloredChunkValue
    };
  };
})();
